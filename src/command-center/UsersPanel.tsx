import React, { useEffect, useMemo, useState } from 'react';

interface Submission {
  id: number;
  created: string;
  name: string;
  email: string;
  phone: string;
  thumbnail: string | null;
  config: { head?: string; pose?: string; symbol?: string; background?: string; colors?: { main?: string; highlight?: string } };
  email_status: 'pending' | 'sent' | 'failed' | 'off';
  email_error: string | null;
}

const STATUS_LABEL: Record<Submission['email_status'], string> = {
  pending: 'Pending',
  sent: 'Emailed',
  failed: 'Not sent',
  off: 'Email off',
};
const STATUS_STYLE: Record<Submission['email_status'], string> = {
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
  sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  off: 'bg-gray-100 text-gray-600 border-gray-200',
};

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/** Command center: everyone who made a Playyy, for the marketing team. */
export const UsersPanel: React.FC = () => {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () =>
    fetch('/api/cc/submissions')
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`);
        setRows(d.submissions);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));

  useEffect(() => { void load(); }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => `${r.name} ${r.email} ${r.phone}`.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const resend = async (id: number) => {
    setBusyId(id); setError(null); setNote(null);
    try {
      const res = await fetch(`/api/cc/submissions/${id}/resend`, { method: 'POST' });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || `Request failed (${res.status})`);
      setNote(d.email === 'sent' ? 'Email sent.' : 'The email could not be sent. Check the Share & email tab.');
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const downloadCsv = () => {
    const head = ['Date and time', 'Name', 'Email', 'Phone', 'Head', 'Pose', 'Power', 'Background', 'Main colour', 'Highlight colour', 'Email status'];
    const lines = shown.map((r) => [
      new Date(r.created).toLocaleString('en-IN'), r.name, r.email, r.phone,
      r.config.head, r.config.pose, r.config.symbol, r.config.background, r.config.colors?.main, r.config.colors?.highlight, STATUS_LABEL[r.email_status],
    ].map(csvCell).join(','));
    const blob = new Blob(['﻿' + [head.map(csvCell).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `playys-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-sm text-gray-500">Everyone who made a Playyy: their details, when, and a small picture of their final card.</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-800">{error}</div>}
      {note && <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-sm text-emerald-800">{note}</div>}

      <div className="flex flex-wrap items-center gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or phone"
          className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-72" />
        <span className="text-sm text-gray-500">{shown.length} of {rows.length}</span>
        <button type="button" onClick={() => { setLoading(true); void load(); }} className="cc-btn ml-auto">Refresh</button>
        <button type="button" onClick={downloadCsv} disabled={shown.length === 0} className="cc-btn cc-btn-primary">Download CSV</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-300">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-3 py-2">Card</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Date and time</th>
              <th className="px-3 py-2">Character</th>
              <th className="px-3 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">{rows.length === 0 ? 'Nobody yet.' : 'No matches.'}</td></tr>
            )}
            {shown.map((r) => (
              <tr key={r.id} className="border-t border-gray-200 align-middle">
                <td className="px-3 py-2">
                  {r.thumbnail ? <img src={r.thumbnail} alt="" className="h-16 w-auto rounded-md border border-gray-200" /> : <span className="text-gray-300">-</span>}
                </td>
                <td className="px-3 py-2 font-medium">{r.name}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">{r.phone}</td>
                <td className="px-3 py-2 whitespace-nowrap">{when(r.created)}</td>
                <td className="px-3 py-2 text-xs text-gray-600">
                  <div>{r.config.head} · {r.config.pose}</div>
                  <div className="flex items-center gap-1">
                    {r.config.colors?.main && <span className="inline-block h-3 w-3 rounded-full border border-gray-300" style={{ background: r.config.colors.main }} />}
                    {r.config.colors?.highlight && <span className="inline-block h-3 w-3 rounded-full border border-gray-300" style={{ background: r.config.colors.highlight }} />}
                    <span>{r.config.symbol} · {r.config.background}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span title={r.email_error ?? ''} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLE[r.email_status]}`}>{STATUS_LABEL[r.email_status]}</span>
                  {r.email_status === 'failed' && (
                    <button type="button" disabled={busyId === r.id} onClick={() => resend(r.id)} className="ml-2 text-xs underline text-gray-600">
                      {busyId === r.id ? 'Sending…' : 'Resend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
