import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../data/api';
import { CmsPanel } from './CmsPanel';
import { Submission, downloadText, matchesQuery, submissionsToCsv } from './submissions';
import { UsersTable } from './UsersTable';

/** Command center: everyone who made a Playy, for the marketing team. */
export const UsersPanel: React.FC = () => {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [resendingId, setResendingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows((await api.get<{ submissions: Submission[] }>('/api/cc/submissions')).submissions);
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

  const resend = async (id: number) => {
    setResendingId(id);
    setError(null);
    setNote(null);
    try {
      const { email } = await api.post<{ email: string }>(`/api/cc/submissions/${id}/resend`);
      setNote(email === 'sent' ? 'Email sent.' : 'The email could not be sent. Check the Share & email tab.');
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResendingId(null);
    }
  };

  const downloadCsv = () =>
    downloadText(
      `playys-users-${new Date().toISOString().slice(0, 10)}.csv`,
      submissionsToCsv(shown),
      'text/csv;charset=utf-8',
    );

  if (loading && rows.length === 0) return <p className="text-gray-500">Loading…</p>;

  return (
    <CmsPanel
      title="Users"
      description="Everyone who made a Playy: their details, when, and a small picture of their final card."
      error={error}
      note={note}
    >
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or phone"
          className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-72"
        />
        <span className="text-sm text-gray-500">
          {shown.length} of {rows.length}
        </span>
        <button type="button" onClick={() => void load()} className="cc-btn ml-auto">
          Refresh
        </button>
        <button type="button" onClick={downloadCsv} disabled={shown.length === 0} className="cc-btn cc-btn-primary">
          Download CSV
        </button>
      </div>

      <UsersTable
        rows={shown}
        emptyText={rows.length === 0 ? 'Nobody yet.' : 'No matches.'}
        resendingId={resendingId}
        onResend={resend}
      />
    </CmsPanel>
  );
};
