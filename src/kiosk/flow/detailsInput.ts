export type DetailField = 'name' | 'phone' | 'email';

/** The three screens a visitor types on, in order. */
export const DETAIL_FIELDS: readonly DetailField[] = ['name', 'phone', 'email'];

/** The longest each answer can be. */
export const DETAIL_LIMITS: Record<DetailField, number> = { name: 16, phone: 15, email: 64 };

const NAME_KEY = /^[A-Za-z0-9 '-]$/;
const PHONE_KEY = /^[0-9+]$/;

const startsWord = (text: string) => text === '' || text.endsWith(' ') || text.endsWith('-');

/**
 * What a field holds after one key press on the touch keyboard, or null when the key does nothing here.
 * `key` is a single character or `BACKSPACE`.
 *
 * - names: letters, digits, space, apostrophe and hyphen; a capital at the start of each word, the rest lower case
 * - phone numbers: digits, and a plus only as the first character
 * - emails: lower case, no spaces; a key can also be several characters, like `.com`
 */
export function applyDetailKey(field: DetailField, current: string, key: string): string | null {
  const limit = DETAIL_LIMITS[field];
  if (key === 'BACKSPACE') return current.slice(0, -1);

  if (field === 'name') {
    if (!NAME_KEY.test(key)) return null;
    if (key === ' ' && (current === '' || current.endsWith(' '))) return null;
    return (current + (startsWord(current) ? key.toUpperCase() : key.toLowerCase())).slice(0, limit);
  }
  if (field === 'phone') {
    if (!PHONE_KEY.test(key)) return null;
    if (key === '+' && current.length > 0) return null;
    return (current + key).slice(0, limit);
  }
  if (key === ' ') return null;
  return (current + key.toLowerCase()).slice(0, limit);
}
