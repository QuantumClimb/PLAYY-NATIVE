// Postgres (Neon) access for the asset library. Uses Neon's serverless driver, which suits Vercel functions.
// All database access lives here so it is easy to extend (submissions, email queue) or swap later.
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set. Add the Neon connection string to .env (or the Vercel project settings).');
const sql = neon(url);

export const ASSET_TYPES = ['head', 'face', 'body', 'symbol', 'background'];

let ready;
/** Creates the tables on first use (idempotent), once per server instance. */
export function ensureSchema() {
  ready ??= sql
    .query(`
      CREATE TABLE IF NOT EXISTS assets (
        id      SERIAL PRIMARY KEY,
        type    TEXT NOT NULL,                 -- head | face | body | symbol | background
        slug    TEXT NOT NULL,
        name    TEXT NOT NULL,
        svg     TEXT NOT NULL,                 -- sanitized source SVG (named parts as ids)
        parts   JSONB NOT NULL DEFAULT '{}',   -- per-part mode / lightness offset / color / black-and-white rule
        meta    JSONB NOT NULL DEFAULT '{}',   -- default colors, face placement, anchors, sizes...
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        sort    INTEGER NOT NULL DEFAULT 0,
        updated TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (type, slug)
      )`)
    .catch((e) => {
      ready = undefined; // retry next time
      throw e;
    });
  return ready;
}

async function query(text, params = []) {
  await ensureSchema();
  return sql.query(text, params);
}

export async function listAssets({ type, enabledOnly = false } = {}) {
  const where = [];
  const args = [];
  if (type) { args.push(type); where.push(`type = $${args.length}`); }
  if (enabledOnly) where.push('enabled');
  return query(`SELECT * FROM assets ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY type, sort, id`, args);
}

export async function getAsset(id) {
  return (await query('SELECT * FROM assets WHERE id = $1', [id]))[0] ?? null;
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
