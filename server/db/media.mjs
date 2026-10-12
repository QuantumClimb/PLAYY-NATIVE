import { query } from './client.mjs';

export async function createMediaFile({ id, filename, mimeType, dataBase64, sizeBytes }) {
  const rows = await query(
    `INSERT INTO media_files (id, filename, mime_type, data_base64, size_bytes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, filename, mime_type, size_bytes, created_at`,
    [id, filename, mimeType, dataBase64, sizeBytes],
  );
  return rows[0];
}

export async function getMediaFile(id) {
  const rows = await query('SELECT * FROM media_files WHERE id = $1', [id]);
  return rows[0] ?? null;
}
