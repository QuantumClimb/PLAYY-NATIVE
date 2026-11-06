import { SITE_URL, WHATSAPP } from './config.mjs';

export const whatsappConfigured = () =>
  !!(WHATSAPP.token && WHATSAPP.sender && WHATSAPP.template && (SITE_URL || WHATSAPP.header !== 'document'));

/** "98765 43210" becomes "+919876543210" (a number of ten digits is taken to be Indian); null when it is too short. */
export function whatsappNumber(phone) {
  const raw = String(phone ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  return digits.length >= 11 ? `+${digits}` : null;
}

/** The template message: the coloring PDF (or the name) in its header and the name (and optionally the card link) in its body. */
export function templateMessage({ to, name, coloringUrl, cardUrl, filename }) {
  const values = { name: name || 'there', card: cardUrl, coloring: coloringUrl };
  return {
    to,
    type: 'template',
    template: {
      name: WHATSAPP.template,
      language: WHATSAPP.language,
      components: [
        ...(WHATSAPP.header === 'document'
          ? [{ type: 'header', parameters: [{ type: 'document', document: { link: coloringUrl, filename } }] }]
          : []),
        ...(WHATSAPP.header === 'text' ? [{ type: 'header', parameters: [{ type: 'text', text: values.name }] }] : []),
        ...(WHATSAPP.body.length
          ? [
              {
                type: 'body',
                parameters: WHATSAPP.body.map((key) => ({ type: 'text', text: String(values[key] ?? '') })),
              },
            ]
          : []),
      ],
    },
  };
}

/** Sends the visitor their PDFs on WhatsApp. Throws with Qikberry's reason when it is refused. */
export async function sendWhatsapp({ phone, name, coloringUrl, cardUrl, filename }) {
  if (!whatsappConfigured()) throw new Error('WhatsApp is not set up');
  const to = whatsappNumber(phone);
  if (!to) throw new Error('The phone number is too short for WhatsApp');
  const res = await fetch(WHATSAPP.apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP.token}`,
      'x-phone-number': WHATSAPP.sender,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(templateMessage({ to, name, coloringUrl, cardUrl, filename })),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 200);
    throw new Error(`WhatsApp refused it (${res.status}) ${detail}`.trim());
  }
}
