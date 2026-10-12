import { deleteSubmissionFiles, saveSubmissionFiles, setSubmissionEmail, settings } from './db/index.mjs';
import { sendShareEmail } from './mailer.mjs';
import { buildPdfs } from './pdf.mjs';

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
 * Builds the two PDFs and emails them for one submission, and records how it went.
 * When the email fails the pictures are kept so it can be resent from the command center.
 * Returns `sent`, `failed` or `off` (emailing is switched off).
 */
export async function emailSubmission(id, who, images) {
  const { enabled, recipients } = await shareSettings();
  if (!enabled) {
    await setSubmissionEmail(id, 'off');
    return 'off';
  }
  try {
    await sendShareEmail({
      recipients,
      name: who.name,
      email: who.email,
      phone: who.phone,
      when: whenText(who.created),
      files: await buildPdfs(images),
    });
    await setSubmissionEmail(id, 'sent');
    await deleteSubmissionFiles(id);
    return 'sent';
  } catch (e) {
    await setSubmissionEmail(id, 'failed', String(e.message).slice(0, 300));
    await saveSubmissionFiles(id, images);
    return 'failed';
  }
}
