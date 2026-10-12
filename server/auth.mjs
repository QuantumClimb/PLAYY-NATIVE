import crypto from 'node:crypto';
import express from 'express';
import { PASSWORD, SECRET, SESSION_MS } from './config.mjs';
import { HttpError } from './http.mjs';

const sign = (expires) => `${expires}.${crypto.createHmac('sha256', SECRET).update(String(expires)).digest('hex')}`;

const sessionCookie = (req, value, maxAgeSeconds) =>
  `cc_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}${req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''}`;

function validSession(req) {
  const token = /(?:^|;\s*)cc_session=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  if (!token) return false;
  const expires = Number(token.split('.')[0]);
  const expected = sign(expires);
  return (
    expires > Date.now() &&
    token.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  );
}

/** Lets a request through only when the command center is signed in. */
export const requireAdmin = (req, _res, next) =>
  next(validSession(req) ? undefined : new HttpError(401, 'Not signed in'));

let failures = [];

export const authRouter = express.Router();

authRouter.post('/cc/login', (req, res) => {
  if (!PASSWORD)
    return res.status(503).json({ error: 'Set COMMAND_CENTER_PASSWORD in .env to enable the command center' });
  const now = Date.now();
  failures = failures.filter((t) => now - t < 60_000);
  if (failures.length >= 5) return res.status(429).json({ error: 'Too many attempts. Wait a minute.' });

  const given = crypto
    .createHash('sha256')
    .update(String(req.body?.password ?? ''))
    .digest();
  const wanted = crypto.createHash('sha256').update(PASSWORD).digest();
  if (!crypto.timingSafeEqual(given, wanted)) {
    failures.push(now);
    return res.status(401).json({ error: 'Wrong password' });
  }
  res.setHeader('Set-Cookie', sessionCookie(req, sign(now + SESSION_MS), SESSION_MS / 1000));
  res.json({ ok: true });
});

authRouter.post('/cc/logout', (req, res) => {
  res.setHeader('Set-Cookie', sessionCookie(req, '', 0));
  res.json({ ok: true });
});

authRouter.get('/cc/session', (req, res) => res.json({ signedIn: validSession(req), enabled: !!PASSWORD }));
