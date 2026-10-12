import React from 'react';
import { isEmail } from '../../shared/validation.mjs';
import { CmsPanel, SaveBar } from './CmsPanel';
import { useCmsSetting } from './useCmsSetting';

const field = 'bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-80';
const SLOTS = 2;

interface ShareForm {
  enabled: boolean;
  recipients: string[];
}

interface ShareResponse {
  settings: ShareForm;
  /** Whether the server has the email login it needs to send */
  smtp: boolean;
}

const emptyForm: ShareForm = { enabled: true, recipients: Array(SLOTS).fill('') };

/** Command center: where each finished Playy is emailed (two slots), and the WhatsApp slot for later. */
export const ShareSettingsPanel: React.FC = () => {
  const cms = useCmsSetting<ShareForm, ShareResponse>({
    url: '/api/cc/share-settings',
    saveUrl: '/api/cc/share-settings',
    read: ({ settings }) => ({
      enabled: settings.enabled,
      recipients: Array.from({ length: SLOTS }, (_, i) => settings.recipients[i] ?? ''),
    }),
    write: (form) => ({ enabled: form.enabled, recipients: form.recipients.map((r) => r.trim()) }),
    defaults: emptyForm,
    savedNote: 'Saved.',
  });
  const { enabled, recipients } = cms.value;
  const bad = recipients.some((r) => r.trim() && !isEmail(r));

  if (cms.loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <CmsPanel
      title="Share and email"
      description="When a visitor taps SHARE, the kiosk opens the print dialog and emails two PDFs to the addresses below: the coloring pages (black and white, then colour) and the trump card."
      error={cms.error}
      note={cms.note}
    >
      {cms.response?.smtp === false && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
          The email server is not set up yet, so emails will show as "Not sent" in Users. Set <code>SMTP_USER</code> and{' '}
          <code>SMTP_PASS</code> (and optionally <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_FROM</code>)
          in the environment, then use Resend on those rows.
        </div>
      )}

      <section className="rounded-xl border border-gray-300 p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => cms.setValue((f) => ({ ...f, enabled: e.target.checked }))}
          />
          Send an email for every Playy
        </label>
        {recipients.map((address, i) => (
          <div key={i} className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">
              Recipient {i + 1}
              {i > 0 ? ' (optional)' : ''}
            </label>
            <input
              type="email"
              value={address}
              placeholder="name@example.com"
              className={field}
              onChange={(e) =>
                cms.setValue((f) => ({
                  ...f,
                  recipients: f.recipients.map((v, idx) => (idx === i ? e.target.value : v)),
                }))
              }
            />
          </div>
        ))}
        {bad && <p className="text-xs text-red-700">One of the emails does not look right.</p>}
        <SaveBar busy={cms.busy} onSave={cms.save} saveDisabled={bad} />
      </section>

      <section className="rounded-xl border border-gray-300 p-4 space-y-2 opacity-70">
        <div className="font-medium text-sm">WhatsApp</div>
        <p className="text-sm text-gray-500">
          Not active yet. When the client provides the WhatsApp token it can be switched on here, and the same PDFs will
          be sent to the visitor's phone number.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" disabled /> Send on WhatsApp
        </label>
      </section>

      <p className="text-xs text-gray-500">
        Later, the print preview pop-up goes away: SHARE will send straight to the printer, the email and WhatsApp.
      </p>
    </CmsPanel>
  );
};
