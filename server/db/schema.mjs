// The database tables. Every statement is safe to run again, so this runs once per server instance.

/** @param {import('@neondatabase/serverless').NeonQueryFunction<false, false>} sql */
export async function runMigrations(sql) {
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

  await sql.query(
    `ALTER TABLE scene_backgrounds ADD COLUMN IF NOT EXISTS badge_placement TEXT NOT NULL DEFAULT 'top-center'`,
  );
  await sql.query(
    `ALTER TABLE scene_backgrounds ADD COLUMN IF NOT EXISTS start_button_placement TEXT NOT NULL DEFAULT 'right-center'`,
  );
  await sql.query(
    `ALTER TABLE scene_backgrounds ADD COLUMN IF NOT EXISTS start_button_size TEXT NOT NULL DEFAULT 'extra-large'`,
  );
  await sql.query(
    `ALTER TABLE scene_backgrounds ADD COLUMN IF NOT EXISTS badge_gap TEXT NOT NULL DEFAULT 'comfortable'`,
  );
  await sql.query(
    `ALTER TABLE scene_backgrounds ADD COLUMN IF NOT EXISTS float_animation TEXT NOT NULL DEFAULT 'gentle'`,
  );

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
      CREATE TABLE IF NOT EXISTS progress_tabs (
        id      INTEGER PRIMARY KEY DEFAULT 1,
        data    JSONB NOT NULL DEFAULT '{}',
        updated TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

  await sql.query(`
      CREATE TABLE IF NOT EXISTS trump_card (
        id      INTEGER PRIMARY KEY DEFAULT 1,
        data    JSONB NOT NULL DEFAULT '{}',
        updated TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

  await sql.query(`
      CREATE TABLE IF NOT EXISTS share_settings (
        id      INTEGER PRIMARY KEY DEFAULT 1,
        data    JSONB NOT NULL DEFAULT '{}',
        updated TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

  // One row per Playyy made: who made it (for marketing), a small thumbnail of the final card, and how the email went
  await sql.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id           SERIAL PRIMARY KEY,
        created      TIMESTAMPTZ NOT NULL DEFAULT now(),
        name         TEXT NOT NULL DEFAULT '',
        email        TEXT NOT NULL DEFAULT '',
        phone        TEXT NOT NULL DEFAULT '',
        thumbnail    TEXT,
        config       JSONB NOT NULL DEFAULT '{}',
        email_status TEXT NOT NULL DEFAULT 'pending',
        email_error  TEXT,
        emailed_at   TIMESTAMPTZ
      )`);
  // The PDFs are kept only while an email has not gone out, so it can be resent later
  await sql.query(`
      CREATE TABLE IF NOT EXISTS submission_files (
        submission_id INTEGER NOT NULL,
        name          TEXT NOT NULL,
        data          TEXT NOT NULL,
        PRIMARY KEY (submission_id, name)
      )`);

  await sql.query(`
      CREATE TABLE IF NOT EXISTS brand (
        id       INTEGER PRIMARY KEY DEFAULT 1,
        logo_svg TEXT,                         -- sanitized SVG, or NULL to use the built-in PNG logo
        settings JSONB NOT NULL DEFAULT '{}',  -- logo outline: { enabled, color, size }
        updated  TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);

  await sql.query(`
      CREATE TABLE IF NOT EXISTS sound_settings (
        id      INTEGER PRIMARY KEY DEFAULT 1,
        data    JSONB NOT NULL DEFAULT '{}',
        updated TIMESTAMPTZ NOT NULL DEFAULT now()
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
}
