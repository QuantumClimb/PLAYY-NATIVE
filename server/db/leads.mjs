import { query } from './client.mjs';

export async function addLead(phone) {
  await query('INSERT INTO leads (phone) VALUES ($1)', [phone]);
}

/** One person started: `first` (FIRST TIME?) or `returning` (Already a PlayyPal?). */
export async function addVisit(kind) {
  await query('INSERT INTO visits (kind) VALUES ($1)', [kind]);
}

const digits = (column) => `regexp_replace(${column}, '\\D', '', 'g')`;

const NOT_FINISHED = `NOT EXISTS (SELECT 1 FROM submissions s WHERE ${digits('s.phone')} = ${digits('l.phone')})`;

/** Numbers typed at the start that never turned into a finished Playy (no submission with the same digits), one per number. */
export async function listAbandonedLeads(limit = 500) {
  return query(
    `SELECT id, created, phone FROM (
       SELECT DISTINCT ON (${digits('l.phone')}) l.id, l.created, l.phone FROM leads l
       WHERE ${NOT_FINISHED}
       ORDER BY ${digits('l.phone')}, l.created DESC
     ) latest ORDER BY created DESC LIMIT $1`,
    [limit],
  );
}

/** How many people used the kiosk: everyone who picked a start option, split by option, and how many finished. */
export async function countUsers() {
  const [row] = await query(
    `SELECT
       (SELECT count(*) FROM visits) AS started,
       (SELECT count(*) FROM visits WHERE kind = 'first') AS first_time,
       (SELECT count(*) FROM visits WHERE kind = 'returning') AS returning,
       (SELECT count(*) FROM submissions) AS finished`,
  );
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)]));
}

/** Empties the users list, the unfinished numbers and the counter, so the count starts again from zero. */
export async function clearUsers() {
  await query('TRUNCATE submissions, leads, visits RESTART IDENTITY');
}
