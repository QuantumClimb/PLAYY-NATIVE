import { api } from '../../data/api';

/** Keeps the number typed on "Already a PlayyPal?" (and counts the visit) so the visitor can be reached if they never finish. Failures are ignored. */
export function saveLead(phone: string): void {
  void api.post('/api/leads', { phone }).catch(() => {
    /* offline: the visitor still carries on, the number is just not kept */
  });
}

/** Counts someone who chose FIRST TIME?. Failures are ignored. */
export function countFirstVisit(): void {
  void api.post('/api/visits', { kind: 'first' }).catch(() => {
    /* offline: the visitor still carries on, they are just not counted */
  });
}
