import nodemailer from 'nodemailer';
import { SMTP } from './config.mjs';

export const smtpConfigured = () => !!(SMTP.user && SMTP.pass);

const transport = () =>
  nodemailer.createTransport({
    host: SMTP.host,
    port: SMTP.port,
    secure: SMTP.port === 465,
    auth: { user: SMTP.user, pass: SMTP.pass },
  });

const escapeHtml = (text) =>
  String(text ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const fileSlug = (name) =>
  String(name || 'playy')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30) || 'playy';

const ATTACHED = 'Attached: the coloring pages (black and white, then colour) and the trump card.';

function messageBody({ name, email, phone, when }) {
  const row = (label, value) => `<tr><td><b>${label}</b></td><td>${escapeHtml(value)}</td></tr>`;
  return {
    text: `A new Playy was made.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nWhen: ${when}\n\n${ATTACHED}`,
    html: `<p>A new Playy was made.</p><table cellpadding="4">${row('Name', name)}${row('Email', email)}${row('Phone', phone)}${row('When', when)}</table><p>${ATTACHED}</p>`,
  };
}

/** Emails the two PDFs to the recipients. Throws when SMTP is not set up or the send fails. */
export async function sendShareEmail({ recipients, name, email, phone, when, files }) {
  if (!smtpConfigured()) throw new Error('SMTP is not set up (SMTP_USER and SMTP_PASS are missing)');
  if (!recipients.length) throw new Error('No recipient emails are set in the command center');
  const slug = fileSlug(name);
  await transport().sendMail({
    from: SMTP.from,
    to: recipients,
    subject: `New Playy by ${name || 'a visitor'}`,
    ...messageBody({ name, email, phone, when }),
    attachments: [
      { filename: `playy-coloring-${slug}.pdf`, content: files.coloring, contentType: 'application/pdf' },
      { filename: `playy-trump-card-${slug}.pdf`, content: files.card, contentType: 'application/pdf' },
    ],
  });
}
