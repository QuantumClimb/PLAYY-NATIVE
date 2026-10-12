import { neon } from '@neondatabase/serverless';
import { runMigrations } from './schema.mjs';

const url = process.env.DATABASE_URL;
if (!url)
  throw new Error('DATABASE_URL is not set. Add the Neon connection string to .env (or the Vercel project settings).');
const sql = neon(url);

let ready;

/** Runs a query, creating the tables first if this server instance has not yet. */
export async function query(text, params = []) {
  ready ??= runMigrations(sql).catch((e) => {
    ready = undefined; // try again next time
    throw e;
  });
  await ready;
  return sql.query(text, params);
}
