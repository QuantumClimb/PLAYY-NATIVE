import { setSubmissionEmail, settings } from './db/index.mjs';
import { sendShareEmail } from './mailer.mjs';
import { buildPdfs } from './pdf.mjs';

const SEND_ATTEMPTS = 2;
const DEFAULT_RECIPIENTS = ['qcquantumclimb@gmail.com', 'aum.janakiram@gmail.com'];

/** Who gets the emails, and whether any are sent. Until the command center saves something, the defaults apply. */
export async function shareSettings() {
  const saved = await settings.shareSettings.get();
  return {
    enabled: saved?.enabled !== false,
    recipients: Array.isArray(saved?.recipients) ? saved.recipients : DEFAULT_RECIPIENTS,
  };
}

const whenText = (created) => new Date(created).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' (India time)';

/**
 * Builds the two PDFs and emails them for one submission, and records how it went. Nothing large is kept:
 * the PDFs exist only while the email is sent, which is tried twice.
 * Returns `sent`, `failed` or `off` (emailing is switched off).
 */
export async function emailSubmission(id, who, images) {
  const { enabled, recipients } = await shareSettings();
  if (!enabled) {
    await setSubmissionEmail(id, 'off');
    return 'off';
  }
  const message = { recipients, name: who.name, email: who.email, phone: who.phone, when: whenText(who.created) };
  const files = await buildPdfs(images);
  let failure;
  for (let attempt = 0; attempt < SEND_ATTEMPTS; attempt += 1) {
    try {
      await sendShareEmail({ ...message, files });
      await setSubmissionEmail(id, 'sent');
      return 'sent';
    } catch (e) {
      failure = e;
    }
  }
  await setSubmissionEmail(id, 'failed', String(failure.message).slice(0, 300));
  return 'failed';
}
