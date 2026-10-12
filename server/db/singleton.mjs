import { query } from './client.mjs';

const SINGLETON_TABLES = [
  'power_quiz_questions',
  'intro_badges',
  'progress_tabs',
  'trump_card',
  'share_settings',
  'sound_settings',
];

/**
 * A table that holds one JSON document (row id 1): a setting the command center edits.
 * Returns `get` (the document, or null when never saved), `save` and `reset`.
 */
export function singleton(table) {
  if (!SINGLETON_TABLES.includes(table)) throw new Error(`"${table}" is not a settings table`);
  return {
    async get() {
      const rows = await query(`SELECT data FROM ${table} WHERE id = 1`);
      return rows[0]?.data ?? null;
    },
    async save(data) {
      const rows = await query(
        `INSERT INTO ${table} (id, data, updated) VALUES (1, $1, now())
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated = now()
         RETURNING data`,
        [JSON.stringify(data)],
      );
      return rows[0]?.data;
    },
    async reset() {
      await query(`DELETE FROM ${table} WHERE id = 1`);
    },
  };
}
