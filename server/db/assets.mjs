import { query } from './client.mjs';

export const ASSET_TYPES = ['head', 'face', 'body', 'symbol', 'background'];

export async function listAssets({ type, enabledOnly = false } = {}) {
  const where = [];
  const args = [];
  if (type) {
    args.push(type);
    where.push(`type = $${args.length}`);
  }
  if (enabledOnly) where.push('enabled');
  return query(
    `SELECT * FROM assets ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY type, sort, id`,
    args,
  );
}

export async function createAsset({ type, slug, name, svg, parts = {}, meta = {} }) {
  const rows = await query(
    `INSERT INTO assets (type, slug, name, svg, parts, meta, sort)
     VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX(sort), 0) + 1 FROM assets WHERE type = $1))
     RETURNING *`,
    [type, slug, name, svg, JSON.stringify(parts), JSON.stringify(meta)],
  );
  return rows[0];
}

async function getAsset(id) {
  return (await query('SELECT * FROM assets WHERE id = $1', [id]))[0] ?? null;
}

export async function updateAsset(id, patch) {
  const cur = await getAsset(id);
  if (!cur) return null;
  const next = { ...cur, ...patch };
  const rows = await query(
    `UPDATE assets SET name = $2, svg = $3, parts = $4, meta = $5, enabled = $6, sort = $7, updated = now()
     WHERE id = $1 RETURNING *`,
    [id, next.name, next.svg, JSON.stringify(next.parts), JSON.stringify(next.meta), !!next.enabled, next.sort],
  );
  return rows[0] ?? null;
}

export async function deleteAsset(id) {
  return (await query('DELETE FROM assets WHERE id = $1 RETURNING id', [id])).length > 0;
}
