import { query } from './client.mjs';

export async function addLead(phone) {
  await query('INSERT INTO leads (phone) VALUES ($1)', [phone]);
}

const digits = (column) => `regexp_replace(${column}, '\\D', '', 'g')`;

/** Numbers typed at the start that never turned into a finished Playy (no submission with the same digits). */
export async function listAbandonedLeads(limit = 500) {
  return query(
    `SELECT l.id, l.created, l.phone FROM leads l
     WHERE NOT EXISTS (SELECT 1 FROM submissions s WHERE ${digits('s.phone')} = ${digits('l.phone')})
     ORDER BY l.created DESC LIMIT $1`,
    [limit],
  );
}
