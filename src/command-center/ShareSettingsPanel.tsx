import React, { useEffect, useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const field = 'bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-80';

/** Command center: where each finished Playyy is emailed (two slots), and the WhatsApp slot for later. */
export const ShareSettingsPanel: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [recipients, setRecipients] = useState<string[]>(['', '']);
  const [smtp, setSmtp] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const apply = (d: { settings: { enabled: boolean; recipients: string[] }; smtp: boolean }) => {
    setEnabled(d.settings.enabled);
    setRecipients([d.settings.recipients[0] ?? '', d.settings.recipients[1] ?? '']);
    setSmtp(d.smtp);
  };

  useEffect(() => {
    fetch('/api/cc/share-settings')
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`);
        apply(d);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const bad = recipients.some((r) => r.trim() && !EMAIL_RE.test(r.trim()));

  const save = async () => {
    setBusy(true); setError(null); setNote(null);
    try {
      const res = await fetch('/api/cc/share-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, recipients: recipients.map((r) => r.trim()) }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || `Request failed (${res.status})`);
      apply(d);
      setNote('Saved.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold">Share and email</h2>
        <p className="text-sm text-gray-500">
          When a visitor taps SHARE, the kiosk opens the print dialog and emails two PDFs to the addresses below:
          the coloring pages (black and white, then colour) and the trump card.
        </p>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-800">{error}</div>}
      {note && <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-sm text-emerald-800">{note}</div>}
      {smtp === false && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
          The email server is not set up yet, so emails will show as "Not sent" in Users. Set <code>SMTP_USER</code> and <code>SMTP_PASS</code> (and
          optionally <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_FROM</code>) in the environment, then use Resend on those rows.
        </div>
      )}

      <section className="rounded-xl border border-gray-300 p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Send an email for every Playyy
        </label>
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Recipient {i + 1}{i === 1 ? ' (optional)' : ''}</label>
            <input type="email" value={recipients[i]} placeholder="name@example.com" className={field}
              onChange={(e) => setRecipients((r) => r.map((v, idx) => (idx === i ? e.target.value : v)))} />
          </div>
        ))}
        {bad && <p className="text-xs text-red-700">One of the emails does not look right.</p>}
        <div className="flex">
          <button type="button" onClick={save} disabled={busy || bad} className="cc-btn cc-btn-primary ml-auto">Save</button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-300 p-4 space-y-2 opacity-70">
        <div className="font-medium text-sm">WhatsApp</div>
        <p className="text-sm text-gray-500">
          Not active yet. When the client provides the WhatsApp token it can be switched on here, and the same PDFs will be sent to the
          visitor's phone number.
        </p>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled /> Send on WhatsApp</label>
      </section>

      <p className="text-xs text-gray-500">
        Later, the print preview pop-up goes away: SHARE will send straight to the printer, the email and WhatsApp.
      </p>
    </div>
  );
};
