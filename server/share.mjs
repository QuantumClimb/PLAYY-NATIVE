// Sharing: builds the two PDFs (coloring pages, trump card) and emails them over SMTP.
import { PDFDocument } from 'pdf-lib';
import nodemailer from 'nodemailer';

const A4 = [595.28, 841.89];
const MARGIN = 14; // about 5 mm

/** Draws a JPEG as large as fits in a box, centered in it. */
function drawFit(page, image, box) {
  const scale = Math.min(box.w / image.width, box.h / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  page.drawImage(image, { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, width: w, height: h });
}

const fromBase64 = (b64) => Buffer.from(b64, 'base64');

/** PDF 1: the black-and-white page then the full-colour page. PDF 2: the trump card, front and back. */
export async function buildPdfs({ bw, color, cardFront, cardBack }) {
  const pages = await PDFDocument.create();
  for (const b64 of [bw, color]) {
    const page = pages.addPage(A4);
    drawFit(page, await pages.embedJpg(fromBase64(b64)), { x: MARGIN, y: MARGIN, w: A4[0] - 2 * MARGIN, h: A4[1] - 2 * MARGIN });
  }

  const card = await PDFDocument.create();
  const sheet = card.addPage(A4);
  const gap = 24;
  const w = (A4[0] - 2 * MARGIN - gap) / 2;
  const h = w * 1.5; // the card is 2:3
  const y = (A4[1] - h) / 2;
  drawFit(sheet, await card.embedJpg(fromBase64(cardFront)), { x: MARGIN, y, w, h });
  drawFit(sheet, await card.embedJpg(fromBase64(cardBack)), { x: MARGIN + w + gap, y, w, h });

  return { coloring: Buffer.from(await pages.save()), card: Buffer.from(await card.save()) };
}

export const smtpConfigured = () => !!(process.env.SMTP_USER && process.env.SMTP_PASS);

function transport() {
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = (s) => String(s || 'playyy').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'playyy';

/** Emails the two PDFs to the recipients. Throws when SMTP is not set up or the send fails. */
export async function sendShareEmail({ recipients, name, email, phone, when, files }) {
  if (!smtpConfigured()) throw new Error('SMTP is not set up (SMTP_USER and SMTP_PASS are missing)');
  if (!recipients.length) throw new Error('No recipient emails are set in the command center');
  const who = name || 'a visitor';
  await transport().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipients,
    subject: `New Playyy by ${who}`,
    text: `A new Playyy was made.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nWhen: ${when}\n\nAttached: the coloring pages (black and white, then colour) and the trump card.`,
    html: `<p>A new Playyy was made.</p><table cellpadding="4"><tr><td><b>Name</b></td><td>${esc(name)}</td></tr><tr><td><b>Email</b></td><td>${esc(email)}</td></tr><tr><td><b>Phone</b></td><td>${esc(phone)}</td></tr><tr><td><b>When</b></td><td>${esc(when)}</td></tr></table><p>Attached: the coloring pages (black and white, then colour) and the trump card.</p>`,
    attachments: [
      { filename: `playyy-coloring-${slug(name)}.pdf`, content: files.coloring, contentType: 'application/pdf' },
      { filename: `playyy-trump-card-${slug(name)}.pdf`, content: files.card, contentType: 'application/pdf' },
    ],
  });
}
