import { query } from './client.mjs';

/**
 * Logs one Playy. A serial can be logged only once: a second send of the same one (a kiosk retrying after a lost
 * answer) gets the existing row back, flagged `duplicate`, instead of a second entry.
 */
export async function addSubmission({ name, email, phone, serial, thumbnail, config }) {
  const rows = await query(
    `INSERT INTO submissions (name, email, phone, serial, thumbnail, config)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (serial) WHERE serial IS NOT NULL DO NOTHING
     RETURNING id, created, email_status`,
    [name, email, phone, serial ?? null, thumbnail, JSON.stringify(config ?? {})],
  );
  if (rows[0]) return { ...rows[0], duplicate: false };
  const [existing] = await query('SELECT id, created, email_status FROM submissions WHERE serial = $1', [serial]);
  return { ...existing, duplicate: true };
}

export async function setSubmissionEmail(id, status, error = null) {
  await query(
    `UPDATE submissions SET email_status = $2, email_error = $3, emailed_at = CASE WHEN $2 = 'sent' THEN now() ELSE emailed_at END WHERE id = $1`,
    [id, status, error],
  );
}

export async function listSubmissions(limit = 500) {
  return query(
    `SELECT id, created, name, email, phone, serial, thumbnail, config, email_status, email_error, emailed_at
     FROM submissions ORDER BY created DESC LIMIT $1`,
    [limit],
  );
}
