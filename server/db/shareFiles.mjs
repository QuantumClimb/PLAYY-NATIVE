import crypto from 'node:crypto';
import { query } from './client.mjs';

const KEEP_HOURS = 24;

/**
 * Keeps a PDF for a day so WhatsApp can download it from a link, and returns the link's secret token.
 * Files older than that are removed whenever a new one is saved.
 */
export async function saveShareFile(data) {
  await query(`DELETE FROM share_files WHERE expires < now()`);
  const token = crypto.randomBytes(24).toString('hex');
  await query(
    `INSERT INTO share_files (token, data, expires) VALUES ($1, decode($2, 'base64'), now() + make_interval(hours => $3))`,
    [token, Buffer.from(data).toString('base64'), KEEP_HOURS],
  );
  return token;
}

/** The PDF behind a token, or null when it never existed or has expired. */
export async function getShareFile(token) {
  const [row] = await query(
    `SELECT encode(data, 'base64') AS data FROM share_files WHERE token = $1 AND expires > now()`,
    [token],
  );
  return row ? Buffer.from(row.data, 'base64') : null;
}
