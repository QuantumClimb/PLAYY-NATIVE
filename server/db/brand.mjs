import { query } from './client.mjs';

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
