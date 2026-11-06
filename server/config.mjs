import 'dotenv/config';
import crypto from 'node:crypto';

// The server's settings, read from the environment once. Nothing else reads process.env for these.

/** True on Vercel */
export const HOSTED = !!process.env.VERCEL;

/** Printers belong to the kiosk PC, so they are off on Vercel unless ENABLE_PRINTERS=1 */
export const PRINTERS = (process.env.ENABLE_PRINTERS ?? (HOSTED ? '0' : '1')) === '1';

/** The command center password; without it the command center is switched off */
export const PASSWORD = process.env.COMMAND_CENTER_PASSWORD || '';

/** Signs the command center session cookie. Stable across serverless instances: set it, or it follows the password. */
export const SECRET =
  process.env.COMMAND_CENTER_SECRET ||
  crypto
    .createHash('sha256')
    .update('playys-command-center:' + PASSWORD)
    .digest('hex');

export const SESSION_MS = 8 * 60 * 60 * 1000;

/** The email login used to send shared Playys. Without a user and password emails are logged as not sent. */
export const SMTP = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 465),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
};

/**
 * WhatsApp through Qikberry (https://apidocs.qikberry.ai). Sending needs the token, the business's own WhatsApp number
 * and the name of a template Meta has approved (one with a PDF header). Without them WhatsApp shows as off.
 * TEMPLATE_BODY lists what fills the template's {{1}}, {{2}}...: name, card (link to the trump card PDF).
 */
export const WHATSAPP = {
  token: process.env.WHATSAPP_TOKEN || '',
  // Digits with the country code; a 10-digit number is taken as Indian (91 is added)
  sender: String(process.env.WHATSAPP_SENDER_NUMBER || '')
    .replace(/\D/g, '')
    .replace(/^(\d{10})$/, '91$1'),
  template: process.env.WHATSAPP_TEMPLATE_NAME || '',
  language: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en',
  /** 'document' when the template has a PDF header, 'none' when it is text only */
  header: process.env.WHATSAPP_TEMPLATE_HEADER === 'none' ? 'none' : 'document',
  body: (process.env.WHATSAPP_TEMPLATE_BODY ?? 'name')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  apiUrl: process.env.WHATSAPP_API_URL || 'https://rest.qikberry.ai/v1/whatsapp/messages',
};

/** The public address of the site, used for the links to the PDFs that WhatsApp downloads */
export const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
).replace(/\/+$/, '');
