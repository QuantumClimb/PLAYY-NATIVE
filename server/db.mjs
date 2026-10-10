// Local SQLite database (node:sqlite, built into Node 22). One file, no setup.
// All database access lives here so it can be swapped for Postgres (Neon/Supabase) later.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.env.PLAYYS_DATA_DIR || 'data');
mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'kiosk.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS assets (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    type     TEXT NOT NULL,              -- head | face | body | symbol | background
    slug     TEXT NOT NULL,
    name     TEXT NOT NULL,
    svg      TEXT NOT NULL,              -- sanitized source SVG (named parts as ids)
    parts    TEXT NOT NULL DEFAULT '{}', -- JSON: per-part mode / lightness offset / color / black-and-white rule
    meta     TEXT NOT NULL DEFAULT '{}', -- JSON: default main color, face placement, anchors...
    enabled  INTEGER NOT NULL DEFAULT 1,
    sort     INTEGER NOT NULL DEFAULT 0,
    updated  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (type, slug)
  );
`);

export const ASSET_TYPES = ['head', 'face', 'body', 'symbol', 'background'];

const row = (r) =>
  r && { ...r, parts: JSON.parse(r.parts), meta: JSON.parse(r.meta), enabled: !!r.enabled };

export function listAssets({ type, enabledOnly = false } = {}) {
  const where = [];
  const args = [];
  if (type) { where.push('type = ?'); args.push(type); }
  if (enabledOnly) where.push('enabled = 1');
  const sql = `SELECT * FROM assets ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY type, sort, id`;
  return db.prepare(sql).all(...args).map(row);
}

export const getAsset = (id) => row(db.prepare('SELECT * FROM assets WHERE id = ?').get(id));

export function createAsset({ type, slug, name, svg, parts = {}, meta = {} }) {
  const r = db
    .prepare(`INSERT INTO assets (type, slug, name, svg, parts, meta, sort)
              VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort), 0) + 1 FROM assets WHERE type = ?))`)
    .run(type, slug, name, svg, JSON.stringify(parts), JSON.stringify(meta), type);
  return getAsset(Number(r.lastInsertRowid));
}

export function updateAsset(id, patch) {
  const cur = getAsset(id);
  if (!cur) return null;
  const next = { ...cur, ...patch };
  db.prepare(`UPDATE assets SET name = ?, svg = ?, parts = ?, meta = ?, enabled = ?, sort = ?, updated = datetime('now') WHERE id = ?`)
    .run(next.name, next.svg, JSON.stringify(next.parts), JSON.stringify(next.meta), next.enabled ? 1 : 0, next.sort, id);
  return getAsset(id);
}

export const deleteAsset = (id) => db.prepare('DELETE FROM assets WHERE id = ?').run(id).changes > 0;
