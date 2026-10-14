import { setSubmissionEmail, settings } from './db/index.mjs';
import { sendShareEmail, sendVisitorEmail } from './mailer.mjs';
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
  const jobs = [sendWithRetry(() => sendVisitorEmail({ name: who.name, email: who.email, files }))];
  // The team copy is skipped when nobody is listed; the visitor still gets theirs
  if (recipients.length) jobs.push(sendWithRetry(() => sendShareEmail({ ...message, files })));
  const failure = (await Promise.all(jobs)).find(Boolean);
  if (failure) {
    await setSubmissionEmail(id, 'failed', String(failure.message).slice(0, 300));
    return 'failed';
  }
  await setSubmissionEmail(id, 'sent');
  return 'sent';
}

/** Tries a send up to SEND_ATTEMPTS times; resolves to the last error, or undefined when it went through. */
async function sendWithRetry(send) {
  let failure;
  for (let attempt = 0; attempt < SEND_ATTEMPTS; attempt += 1) {
    try {
      await send();
      return undefined;
    } catch (e) {
      failure = e;
    }
  }
  return failure;
}
