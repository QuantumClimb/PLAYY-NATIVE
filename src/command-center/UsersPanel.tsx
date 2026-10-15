import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../data/api';
import { CmsPanel } from './CmsPanel';
import { Submission, downloadText, formatWhen, matchesQuery, submissionsToCsv } from './submissions';
import { UsersTable } from './UsersTable';

/** How many people used the kiosk: everyone who chose a start option, and how many of them finished. */
interface UserCounts {
  started: number;
  first_time: number;
  returning: number;
  finished: number;
}

/** Command center: everyone who made a Playy, for the marketing team. */
export const UsersPanel: React.FC = () => {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [counts, setCounts] = useState<UserCounts | null>(null);
  const [leads, setLeads] = useState<{ id: number; created: string; phone: string }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows((await api.get<{ submissions: Submission[] }>('/api/cc/submissions')).submissions);
      setLeads((await api.get<{ leads: typeof leads }>('/api/cc/leads')).leads);
      setCounts((await api.get<{ counts: UserCounts }>('/api/cc/user-counts')).counts);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const shown = useMemo(() => rows.filter((r) => matchesQuery(r, query)), [rows, query]);

  const downloadCsv = () =>
    downloadText(
      `playys-users-${new Date().toISOString().slice(0, 10)}.csv`,
      submissionsToCsv(shown),
      'text/csv;charset=utf-8',
    );

  const clearAll = async () => {
    const ok = window.confirm(
      'Delete ALL users, the unfinished phone numbers and reset the counter to zero? This cannot be undone.',
    );
    if (!ok) return;
    try {
      await api.delete('/api/cc/users');
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (loading && rows.length === 0) return <p className="text-gray-500">Loading…</p>;

  return (
    <CmsPanel
      title="Users"
      description="Everyone who made a Playy: their details, when, and a small picture of their final card."
      error={error}
      note={null}
    >
      {counts && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['People who used it', counts.started],
            ['First time', counts.first_time],
            ['Already a PlayyPal', counts.returning],
            ['Finished a Playy', counts.finished],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-gray-300 bg-white px-4 py-3">
              <div className="text-2xl font-semibold">{value}</div>
              <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, phone or serial"
          className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-72"
        />
        <span className="text-sm text-gray-500">
          {shown.length} of {rows.length}
        </span>
        <button type="button" onClick={() => void load()} className="cc-btn ml-auto">
          Refresh
        </button>
        <button type="button" onClick={() => void clearAll()} className="cc-btn text-red-700">
          Clear all users
        </button>
        <button type="button" onClick={downloadCsv} disabled={shown.length === 0} className="cc-btn cc-btn-primary">
          Download CSV
        </button>
      </div>

      <UsersTable rows={shown} emptyText={rows.length === 0 ? 'Nobody yet.' : 'No matches.'} />

      <h3 className="font-semibold pt-4">Started but did not finish</h3>
      <p className="text-sm text-gray-500">
        Phone numbers typed on "Already a PlayyPal?" with no finished Playy under the same number.
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-300">
        <table className="w-full text-sm text-left">
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-gray-400">Nobody yet.</td>
              </tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-gray-200 first:border-t-0">
                <td className="px-3 py-2">{l.phone}</td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-500">{formatWhen(l.created)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CmsPanel>
  );
};
