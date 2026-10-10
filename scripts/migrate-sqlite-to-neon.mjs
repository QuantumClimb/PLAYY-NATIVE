// One-time: copy the assets in the old local SQLite file (data/kiosk.db) into Neon. Safe to re-run: existing assets are skipped.
//   node scripts/migrate-sqlite-to-neon.mjs
import 'dotenv/config';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { listAssets, createAsset, updateAsset } from '../server/db.mjs';

const file = path.resolve(process.env.PLAYYS_DATA_DIR || 'data', 'kiosk.db');
const local = new DatabaseSync(file, { readOnly: true }).prepare('SELECT * FROM assets ORDER BY type, sort, id').all();
const existing = new Set((await listAssets()).map((a) => `${a.type}/${a.slug}`));

let copied = 0;
for (const r of local) {
  if (existing.has(`${r.type}/${r.slug}`)) { console.log('skip  ', r.type, r.slug); continue; }
  const a = await createAsset({ type: r.type, slug: r.slug, name: r.name, svg: r.svg, parts: JSON.parse(r.parts), meta: JSON.parse(r.meta) });
  await updateAsset(a.id, { enabled: !!r.enabled, sort: r.sort });
  console.log('copied', r.type, r.slug);
  copied++;
}
console.log(`Done: ${copied} copied, ${local.length - copied} already there.`);
