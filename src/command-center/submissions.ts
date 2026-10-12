/** One row of the Users table: someone who made a Playy. */
export interface Submission {
  id: number;
  created: string;
  name: string;
  email: string;
  phone: string;
  thumbnail: string | null;
  config: {
    head?: string;
    pose?: string;
    symbol?: string;
    background?: string;
    colors?: { main?: string; highlight?: string };
  };
  email_status: EmailStatus;
  email_error: string | null;
}

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'off';

export const STATUS_LABEL: Record<EmailStatus, string> = {
  pending: 'Pending',
  sent: 'Emailed',
  failed: 'Not sent',
  off: 'Email off',
};

/** "12 Oct 2026, 02:30 pm", the way the marketing team reads dates. */
export const formatWhen = (iso: string): string =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

export const matchesQuery = (row: Submission, query: string): boolean => {
  const q = query.trim().toLowerCase();
  return !q || `${row.name} ${row.email} ${row.phone}`.toLowerCase().includes(q);
};

const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const CSV_HEADINGS = [
  'Date and time',
  'Name',
  'Email',
  'Phone',
  'Head',
  'Pose',
  'Power',
  'Background',
  'Main colour',
  'Highlight colour',
  'Email status',
];

/** The rows as a CSV file's text (with a byte-order mark so Excel reads it as UTF-8). */
export function submissionsToCsv(rows: Submission[]): string {
  const lines = rows.map((r) =>
    [
      new Date(r.created).toLocaleString('en-IN'),
      r.name,
      r.email,
      r.phone,
      r.config.head,
      r.config.pose,
      r.config.symbol,
      r.config.background,
      r.config.colors?.main,
      r.config.colors?.highlight,
      STATUS_LABEL[r.email_status],
    ]
      .map(csvCell)
      .join(','),
  );
  return '﻿' + [CSV_HEADINGS.map(csvCell).join(','), ...lines].join('\r\n');
}

/** Hands a text file to the browser as a download. */
export function downloadText(filename: string, text: string, type: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([text], { type }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
