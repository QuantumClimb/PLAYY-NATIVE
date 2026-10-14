import express from 'express';
import { isEmail, isPhone } from '../../shared/validation.mjs';
import { requireAdmin } from '../auth.mjs';
import { addLead, addSubmission, listAbandonedLeads, listSubmissions, settings } from '../db/index.mjs';
import { HttpError, badRequest, rateLimiter, wrap } from '../http.mjs';
import { smtpConfigured } from '../mailer.mjs';
import { emailSubmission, shareSettings } from '../shareService.mjs';
import { parseSubmission } from '../submission.mjs';

const MAX_RECIPIENTS = 2;
const SHARES_PER_MINUTE = 20;
const MAX_LISTED = 500;

/** Who the finished Playys are emailed to, the log of everyone who made one, and the kiosk's SHARE request. */
export const shareRouter = express.Router();

shareRouter.get(
  '/cc/share-settings',
  requireAdmin,
  wrap(async (_req, res) => {
    res.json({ settings: await shareSettings(), smtp: smtpConfigured(), whatsapp: false });
  }),
);

shareRouter.put(
  '/cc/share-settings',
  requireAdmin,
  wrap(async (req, res) => {
    const { enabled, recipients } = req.body ?? {};
    if (typeof enabled !== 'boolean' || !Array.isArray(recipients) || recipients.length > MAX_RECIPIENTS)
      throw badRequest('Invalid settings');
    const addresses = recipients.map((r) => String(r ?? '').trim());
    if (addresses.some((address) => address && !isEmail(address))) throw badRequest('One of the emails is not valid');
    res.json({
      settings: await settings.shareSettings.save({ enabled, recipients: addresses.filter(Boolean) }),
      smtp: smtpConfigured(),
      whatsapp: false,
    });
  }),
);

// A visitor can only send a few per minute from one place
const allowShare = rateLimiter(SHARES_PER_MINUTE);

shareRouter.post(
  '/submissions',
  wrap(async (req, res) => {
    if (!allowShare(req.ip)) throw new HttpError(429, 'Too many requests');
    const { who, thumbnail, config, images } = parseSubmission(req.body);
    const row = await addSubmission({ ...who, thumbnail, config });
    const email = await emailSubmission(row.id, { ...who, created: row.created }, images);
    res.json({ id: row.id, email });
  }),
);

// The phone number typed on "Already a PlayyPal?", kept in case the visitor does not finish
shareRouter.post(
  '/leads',
  wrap(async (req, res) => {
    if (!allowShare(req.ip)) throw new HttpError(429, 'Too many requests');
    const phone = String(req.body?.phone ?? '').trim().slice(0, 15);
    if (!isPhone(phone)) throw badRequest('Invalid phone number');
    await addLead(phone);
    res.json({ ok: true });
  }),
);

shareRouter.get(
  '/cc/leads',
  requireAdmin,
  wrap(async (_req, res) => res.json({ leads: await listAbandonedLeads(MAX_LISTED) })),
);

shareRouter.get(
  '/cc/submissions',
  requireAdmin,
  wrap(async (_req, res) => res.json({ submissions: await listSubmissions(MAX_LISTED) })),
);
