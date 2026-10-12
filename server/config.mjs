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
