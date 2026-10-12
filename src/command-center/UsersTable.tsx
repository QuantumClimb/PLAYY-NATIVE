import React from 'react';
import { EmailStatus, STATUS_LABEL, Submission, formatWhen } from './submissions';

const STATUS_STYLE: Record<EmailStatus, string> = {
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
  sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  off: 'bg-gray-100 text-gray-600 border-gray-200',
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <span className="inline-block h-3 w-3 rounded-full border border-gray-300" style={{ background: color }} />
);

interface UsersTableProps {
  rows: Submission[];
  /** Why the table is empty: nobody yet, or the search found nothing */
  emptyText: string;
}

const HEADINGS = ['Card', 'Name', 'Email', 'Phone', 'Date and time', 'Character', 'Email'];

export const UsersTable: React.FC<UsersTableProps> = ({ rows, emptyText }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-300">
    <table className="w-full text-sm text-left">
      <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
        <tr>
          {HEADINGS.map((heading) => (
            <th key={heading} className="px-3 py-2">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={HEADINGS.length} className="px-3 py-6 text-center text-gray-400">
              {emptyText}
            </td>
          </tr>
        )}
        {rows.map((r) => (
          <tr key={r.id} className="border-t border-gray-200 align-middle">
            <td className="px-3 py-2">
              {r.thumbnail ? (
                <img src={r.thumbnail} alt="" className="h-16 w-auto rounded-md border border-gray-200" />
              ) : (
                <span className="text-gray-300">-</span>
              )}
            </td>
            <td className="px-3 py-2 font-medium">{r.name}</td>
            <td className="px-3 py-2">{r.email}</td>
            <td className="px-3 py-2">{r.phone}</td>
            <td className="px-3 py-2 whitespace-nowrap">{formatWhen(r.created)}</td>
            <td className="px-3 py-2 text-xs text-gray-600">
              <div>
                {r.config.head} · {r.config.pose}
              </div>
              <div className="flex items-center gap-1">
                {r.config.colors?.main && <Dot color={r.config.colors.main} />}
                {r.config.colors?.highlight && <Dot color={r.config.colors.highlight} />}
                <span>
                  {r.config.symbol} · {r.config.background}
                </span>
              </div>
            </td>
            <td className="px-3 py-2">
              <span
                title={r.email_error ?? ''}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLE[r.email_status]}`}
              >
                {STATUS_LABEL[r.email_status]}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
