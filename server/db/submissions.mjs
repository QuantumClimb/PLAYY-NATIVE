import { query } from './client.mjs';

export async function addSubmission({ name, email, phone, thumbnail, config }) {
  const rows = await query(
    `INSERT INTO submissions (name, email, phone, thumbnail, config)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, created`,
    [name, email, phone, thumbnail, JSON.stringify(config ?? {})],
  );
  return rows[0];
}

export async function setSubmissionEmail(id, status, error = null) {
  await query(
    `UPDATE submissions SET email_status = $2, email_error = $3, emailed_at = CASE WHEN $2 = 'sent' THEN now() ELSE emailed_at END WHERE id = $1`,
    [id, status, error],
  );
}

export async function listSubmissions(limit = 500) {
  return query(
    `SELECT id, created, name, email, phone, thumbnail, config, email_status, email_error, emailed_at
     FROM submissions ORDER BY created DESC LIMIT $1`,
    [limit],
  );
}

export async function getSubmission(id) {
  const rows = await query('SELECT id, created, name, email, phone FROM submissions WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function saveSubmissionFiles(id, files) {
  for (const [name, data] of Object.entries(files)) {
    await query(
      `INSERT INTO submission_files (submission_id, name, data) VALUES ($1, $2, $3)
       ON CONFLICT (submission_id, name) DO UPDATE SET data = EXCLUDED.data`,
      [id, name, data],
    );
  }
}

export async function getSubmissionFiles(id) {
  const rows = await query('SELECT name, data FROM submission_files WHERE submission_id = $1', [id]);
  return Object.fromEntries(rows.map((r) => [r.name, r.data]));
}

export async function deleteSubmissionFiles(id) {
  await query('DELETE FROM submission_files WHERE submission_id = $1', [id]);
}
