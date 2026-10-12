import { badRequest } from './http.mjs';

/** The four pictures sent with every share: the black-and-white page, the colour page, the card front and back. */
export const IMAGE_KEYS = ['bw', 'color', 'cardFront', 'cardBack'];

const BASE64 = /^[A-Za-z0-9+/=]+$/;
const THUMBNAIL = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;
const MAX_THUMBNAIL_LENGTH = 120_000;
const MAX_IMAGE_LENGTH = 4_000_000;
const STAT_NAMES = ['power', 'speed', 'intelligence', 'energy', 'courage'];
const CHARACTER_FIELDS = ['head', 'pose', 'symbol', 'background', 'colors'];

/** The stats, character type and rarity of the card, kept with the visitor for marketing. */
function cardSummary(card) {
  if (!card || typeof card !== 'object') return null;
  const stats = {};
  for (const stat of STAT_NAMES) {
    const value = Number(card.stats?.[stat]);
    if (!Number.isFinite(value)) return null;
    stats[stat] = Math.round(Math.min(100, Math.max(0, value)));
  }
  return { stats, type: text(card.type, 40), rarity: text(card.rarity, 20) };
}

const text = (value, max) =>
  String(value ?? '')
    .trim()
    .slice(0, max);

/**
 * Checks what the kiosk sends when a visitor taps SHARE and returns only what we keep.
 * Throws a 400 with a plain message when something is missing or wrong.
 */
export function parseSubmission(body) {
  const { name, email, phone, thumbnail, config, images } = body ?? {};

  const who = { name: text(name, 40), email: text(email, 120), phone: text(phone, 30) };
  if (!who.name) throw badRequest('A name is needed');

  if (typeof thumbnail !== 'string' || !THUMBNAIL.test(thumbnail) || thumbnail.length > MAX_THUMBNAIL_LENGTH)
    throw badRequest('Invalid thumbnail');

  const badImage = (key) =>
    typeof images?.[key] !== 'string' || !BASE64.test(images[key]) || images[key].length > MAX_IMAGE_LENGTH;
  if (!images || IMAGE_KEYS.some(badImage)) throw badRequest('Invalid images');

  const character = {};
  for (const field of CHARACTER_FIELDS) if (config?.[field] !== undefined) character[field] = config[field];
  const card = cardSummary(config?.card);
  if (card) character.card = card;

  return {
    who,
    thumbnail,
    config: character,
    images: Object.fromEntries(IMAGE_KEYS.map((key) => [key, images[key]])),
  };
}
