// PLAYYS kiosk server: printers, asset library (CMS) and the /command-center login.
// Run with: npm run server   (listens on 127.0.0.1:3001; Vite proxies /api to it)
import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import { listPrinters, setDefault } from './printers.mjs';
import { ASSET_TYPES, listAssets, getAsset, createAsset, updateAsset, deleteAsset } from './db.mjs';

const PORT = Number(process.env.PRINTER_HELPER_PORT || process.env.PORT_SERVER || 3001);
const HOST = '127.0.0.1';
const PASSWORD = process.env.COMMAND_CENTER_PASSWORD || '';
const SECRET = process.env.COMMAND_CENTER_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_MS = 8 * 60 * 60 * 1000;

const app = express();
app.use(express.json({ limit: '3mb' }));

// ---------- Printers (used by the Alt+Shift+P dialog) ----------
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => res.status(500).json({ error: e.message }));

app.get('/api/printers', wrap(async (_req, res) => res.json({ printers: await listPrinters() })));
app.post('/api/printers/default', wrap(async (req, res) => {
  const printers = await listPrinters();
  if (!printers.some((p) => p.name === req.body?.name)) return res.status(404).json({ error: 'Unknown printer' });
  await setDefault(req.body.name);
  res.json({ printers: await listPrinters() });
}));

// ---------- Command center auth ----------
const sign = (exp) => `${exp}.${crypto.createHmac('sha256', SECRET).update(String(exp)).digest('hex')}`;

function validSession(req) {
  const token = /(?:^|;\s*)cc_session=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  if (!token) return false;
  const exp = Number(token.split('.')[0]);
  const expected = sign(exp);
  return (
    exp > Date.now() &&
    token.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  );
}

const requireAdmin = (req, res, next) => (validSession(req) ? next() : res.status(401).json({ error: 'Not signed in' }));

let failures = [];
app.post('/api/cc/login', (req, res) => {
  if (!PASSWORD) return res.status(503).json({ error: 'Set COMMAND_CENTER_PASSWORD in .env to enable the command center' });
  const now = Date.now();
  failures = failures.filter((t) => now - t < 60_000);
  if (failures.length >= 5) return res.status(429).json({ error: 'Too many attempts. Wait a minute.' });

  const a = crypto.createHash('sha256').update(String(req.body?.password ?? '')).digest();
  const b = crypto.createHash('sha256').update(PASSWORD).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    failures.push(now);
    return res.status(401).json({ error: 'Wrong password' });
  }
  res.setHeader('Set-Cookie', `cc_session=${sign(now + SESSION_MS)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}`);
  res.json({ ok: true });
});

app.post('/api/cc/logout', (_req, res) => {
  res.setHeader('Set-Cookie', 'cc_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/cc/session', (req, res) => res.json({ signedIn: validSession(req), enabled: !!PASSWORD }));

// ---------- Assets ----------
// Uploaded SVGs are rendered on the kiosk, so anything that can run code or load remote content is rejected.
const FORBIDDEN_SVG = [
  /<\s*script/i, /<\s*foreignObject/i, /<\s*iframe/i, /<\s*embed/i, /<\s*object/i,
  /\son\w+\s*=/i, /javascript\s*:/i, /<!ENTITY/i, /<\s*image\b/i, /<\s*use\b[^>]*href\s*=\s*["'](?!#)/i,
  /(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i,
];

function checkSvg(svg) {
  if (typeof svg !== 'string' || !/<svg[\s>]/i.test(svg)) return 'Not an SVG file';
  if (svg.length > 2_000_000) return 'SVG is too large (2 MB max)';
  const bad = FORBIDDEN_SVG.find((re) => re.test(svg));
  return bad ? 'SVG contains disallowed content (scripts, event handlers, images or external links)' : null;
}

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'asset';
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// Public (the kiosk reads these)
app.get('/api/assets', (req, res) => {
  const type = ASSET_TYPES.includes(req.query.type) ? req.query.type : undefined;
  res.json({ assets: listAssets({ type, enabledOnly: true }) });
});

// Admin
app.get('/api/cc/assets', requireAdmin, (_req, res) => res.json({ assets: listAssets() }));

app.post('/api/cc/assets', requireAdmin, (req, res) => {
  const { type, name, svg, parts = {}, meta = {} } = req.body ?? {};
  if (!ASSET_TYPES.includes(type)) return res.status(400).json({ error: 'Unknown asset type' });
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  if (!isObj(parts) || !isObj(meta)) return res.status(400).json({ error: 'Invalid parts/meta' });
  const problem = checkSvg(svg);
  if (problem) return res.status(400).json({ error: problem });
  try {
    res.status(201).json({ asset: createAsset({ type, slug: slugify(name), name: name.trim(), svg, parts, meta }) });
  } catch (e) {
    res.status(/UNIQUE/.test(e.message) ? 409 : 500).json({ error: /UNIQUE/.test(e.message) ? 'An asset with that name already exists' : e.message });
  }
});

app.put('/api/cc/assets/:id', requireAdmin, (req, res) => {
  const patch = {};
  const { name, svg, parts, meta, enabled, sort } = req.body ?? {};
  if (name !== undefined) patch.name = String(name).trim();
  if (svg !== undefined) {
    const problem = checkSvg(svg);
    if (problem) return res.status(400).json({ error: problem });
    patch.svg = svg;
  }
  if (parts !== undefined) { if (!isObj(parts)) return res.status(400).json({ error: 'Invalid parts' }); patch.parts = parts; }
  if (meta !== undefined) { if (!isObj(meta)) return res.status(400).json({ error: 'Invalid meta' }); patch.meta = meta; }
  if (enabled !== undefined) patch.enabled = !!enabled;
  if (Number.isFinite(sort)) patch.sort = sort;
  const asset = updateAsset(Number(req.params.id), patch);
  asset ? res.json({ asset }) : res.status(404).json({ error: 'Not found' });
});

app.delete('/api/cc/assets/:id', requireAdmin, (req, res) =>
  deleteAsset(Number(req.params.id)) ? res.json({ ok: true }) : res.status(404).json({ error: 'Not found' }));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, HOST, () => {
  console.log(`PLAYYS kiosk server on http://${HOST}:${PORT}`);
  if (!PASSWORD) console.log('Command center disabled: set COMMAND_CENTER_PASSWORD in .env');
});
