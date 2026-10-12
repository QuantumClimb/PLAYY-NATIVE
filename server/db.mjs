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
  ready ??= (async () => {
    await sql.query(`
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
      )`);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS media_files (
        id          TEXT PRIMARY KEY,
        filename    TEXT NOT NULL,
        mime_type   TEXT NOT NULL,
        data_base64 TEXT NOT NULL,
        size_bytes  INTEGER NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS scene_backgrounds (
        scene_id               TEXT PRIMARY KEY,
        bg_type                TEXT NOT NULL DEFAULT 'default',
        media_id               TEXT,
        fallback_media_id      TEXT,
        fit                    TEXT NOT NULL DEFAULT 'cover',
        position               TEXT NOT NULL DEFAULT 'center',
        overlay_color          TEXT NOT NULL DEFAULT '#000000',
        overlay_opacity        NUMERIC NOT NULL DEFAULT 0,
        badge_placement        TEXT NOT NULL DEFAULT 'top-center',
        start_button_placement TEXT NOT NULL DEFAULT 'right-center',
        start_button_size      TEXT NOT NULL DEFAULT 'extra-large',
        badge_gap              TEXT NOT NULL DEFAULT 'comfortable',
        float_animation        TEXT NOT NULL DEFAULT 'gentle',
        updated                TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    await sql.query(`ALTER TABLE scene_backgrounds ADD COLUMN IF NOT EXISTS badge_placement TEXT NOT NULL DEFAULT 'top-center'`);
    await sql.query(`ALTER TABLE scene_backgrounds ADD COLUMN IF NOT EXISTS start_button_placement TEXT NOT NULL DEFAULT 'right-center'`);
    await sql.query(`ALTER TABLE scene_backgrounds ADD COLUMN IF NOT EXISTS start_button_size TEXT NOT NULL DEFAULT 'extra-large'`);
    await sql.query(`ALTER TABLE scene_backgrounds ADD COLUMN IF NOT EXISTS badge_gap TEXT NOT NULL DEFAULT 'comfortable'`);
    await sql.query(`ALTER TABLE scene_backgrounds ADD COLUMN IF NOT EXISTS float_animation TEXT NOT NULL DEFAULT 'gentle'`);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS power_quiz_questions (
        id      INTEGER PRIMARY KEY DEFAULT 1,
        data    JSONB NOT NULL DEFAULT '[]',
        updated TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS intro_badges (
        id      INTEGER PRIMARY KEY DEFAULT 1,
        data    JSONB NOT NULL DEFAULT '[]',
        updated TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS brand (
        id       INTEGER PRIMARY KEY DEFAULT 1,
        logo_svg TEXT,                         -- sanitized SVG, or NULL to use the built-in PNG logo
        settings JSONB NOT NULL DEFAULT '{}',  -- logo outline: { enabled, color, size }
        updated  TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

    // Seed initial intro background setting if not present
    await sql.query(`
      INSERT INTO scene_backgrounds (scene_id, bg_type, media_id, fit, position, overlay_color, overlay_opacity, badge_placement, start_button_placement, start_button_size, badge_gap, float_animation)
      VALUES ('intro', 'image', 'cheerful-castle-initial', 'cover', 'center', '#000000', 0, 'below-start-button', 'right-center', 'extra-large', 'comfortable', 'gentle')
      ON CONFLICT (scene_id) DO NOTHING
    `);

    // Preserve the current intro background/assets while migrating existing
    // installs once to the CMS-managed button-and-badges layout.
    await sql.query(`
      CREATE TABLE IF NOT EXISTS app_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    const migration = await sql.query(`
      INSERT INTO app_migrations (id)
      VALUES ('intro-badges-below-start-button')
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `);
    if (migration.length > 0) {
      await sql.query(`
        UPDATE scene_backgrounds
        SET badge_placement = 'below-start-button'
        WHERE scene_id = 'intro' AND badge_placement = 'top-center'
      `);
    }
  })().catch((e) => {
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

export async function listSceneBackgrounds() {
  return query('SELECT * FROM scene_backgrounds ORDER BY scene_id');
}

export async function getSceneBackground(sceneId) {
  const rows = await query('SELECT * FROM scene_backgrounds WHERE scene_id = $1', [sceneId]);
  return rows[0] ?? null;
}

export async function upsertSceneBackground(sceneId, settings) {
  const { bg_type, media_id, fallback_media_id, fit, position, overlay_color, overlay_opacity, badge_placement, start_button_placement, start_button_size, badge_gap, float_animation } = settings;
  const rows = await query(
    `INSERT INTO scene_backgrounds (scene_id, bg_type, media_id, fallback_media_id, fit, position, overlay_color, overlay_opacity, badge_placement, start_button_placement, start_button_size, badge_gap, float_animation, updated)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())
     ON CONFLICT (scene_id) DO UPDATE SET
       bg_type = EXCLUDED.bg_type,
       media_id = EXCLUDED.media_id,
       fallback_media_id = EXCLUDED.fallback_media_id,
       fit = EXCLUDED.fit,
       position = EXCLUDED.position,
       overlay_color = EXCLUDED.overlay_color,
       overlay_opacity = EXCLUDED.overlay_opacity,
       badge_placement = EXCLUDED.badge_placement,
       start_button_placement = EXCLUDED.start_button_placement,
       start_button_size = EXCLUDED.start_button_size,
       badge_gap = EXCLUDED.badge_gap,
       float_animation = EXCLUDED.float_animation,
       updated = now()
     RETURNING *`,
    [
      sceneId,
      bg_type || 'default',
      media_id || null,
      fallback_media_id || null,
      fit || 'cover',
      position || 'center',
      overlay_color || '#000000',
      overlay_opacity ?? 0,
      badge_placement || 'top-center',
      start_button_placement || 'right-center',
      start_button_size || 'extra-large',
      badge_gap || 'comfortable',
      float_animation || 'gentle',
    ],
  );
  return rows[0];
}

export async function resetSceneBackground(sceneId) {
  const defaultBadgePlacement = sceneId === 'intro' ? 'below-start-button' : 'top-center';
  const rows = await query(
    `INSERT INTO scene_backgrounds (scene_id, bg_type, media_id, fallback_media_id, fit, position, overlay_color, overlay_opacity, badge_placement, start_button_placement, start_button_size, badge_gap, float_animation, updated)
     VALUES ($1, 'default', NULL, NULL, 'cover', 'center', '#000000', 0, $2, 'right-center', $3, 'comfortable', 'gentle', now())
     ON CONFLICT (scene_id) DO UPDATE SET
       bg_type = 'default',
       media_id = NULL,
       fallback_media_id = NULL,
       fit = 'cover',
       position = 'center',
       overlay_color = '#000000',
       overlay_opacity = 0,
       badge_placement = $2,
       start_button_placement = 'right-center',
       start_button_size = $3,
       badge_gap = 'comfortable',
       float_animation = 'gentle',
       updated = now()
     RETURNING *`,
    [sceneId, defaultBadgePlacement, 'extra-large'],
  );
  return rows[0];
}

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

export async function getPowerQuizQuestions() {
  const rows = await query('SELECT data FROM power_quiz_questions WHERE id = 1');
  return rows[0]?.data ?? null;
}

export async function savePowerQuizQuestions(questions) {
  const rows = await query(
    `INSERT INTO power_quiz_questions (id, data, updated)
     VALUES (1, $1, now())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated = now()
     RETURNING data`,
    [JSON.stringify(questions)]
  );
  return rows[0]?.data;
}

export async function resetPowerQuizQuestions() {
  await query('DELETE FROM power_quiz_questions WHERE id = 1');
  return null;
}

// ---------- Intro screen badges (label, icon, color), edited in the command center ----------
export async function getIntroBadges() {
  const rows = await query('SELECT data FROM intro_badges WHERE id = 1');
  return rows[0]?.data ?? null;
}

export async function saveIntroBadges(badges) {
  const rows = await query(
    `INSERT INTO intro_badges (id, data, updated)
     VALUES (1, $1, now())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated = now()
     RETURNING data`,
    [JSON.stringify(badges)],
  );
  return rows[0]?.data;
}

export async function resetIntroBadges() {
  await query('DELETE FROM intro_badges WHERE id = 1');
}

// ---------- Brand: the logo slot (SVG) and its outline settings ----------
export async function getBrand() {
  return (await query('SELECT * FROM brand WHERE id = 1'))[0] ?? null;
}

export async function saveBrandLogo(svg) {
  const rows = await query(
    `INSERT INTO brand (id, logo_svg, updated) VALUES (1, $1, now())
     ON CONFLICT (id) DO UPDATE SET logo_svg = EXCLUDED.logo_svg, updated = now()
     RETURNING *`,
    [svg],
  );
  return rows[0];
}

export async function saveBrandSettings(settings) {
  const rows = await query(
    `INSERT INTO brand (id, settings, updated) VALUES (1, $1, now())
     ON CONFLICT (id) DO UPDATE SET settings = EXCLUDED.settings, updated = now()
     RETURNING *`,
    [JSON.stringify(settings)],
  );
  return rows[0];
}
