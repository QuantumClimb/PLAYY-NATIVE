// Checks used by both the kiosk (browser) and the server, so the two always agree.

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PHONE_DIGITS = 7;

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export const isHexColor = (value) => typeof value === 'string' && HEX_COLOR.test(value);

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export const isEmail = (value) => typeof value === 'string' && EMAIL.test(value.trim());

/** @param {unknown} value */
export const phoneDigits = (value) => String(value ?? '').replace(/\D/g, '');

/** @param {unknown} value */
export const isPhone = (value) => phoneDigits(value).length >= MIN_PHONE_DIGITS;

/**
 * What is wrong with a visitor's answer on the name, phone or email screen, or an empty string when it is fine.
 * @param {'name' | 'phone' | 'email'} field
 * @param {string} value
 */
export function detailProblem(field, value) {
  const text = value.trim();
  if (field === 'name') return text ? '' : 'Please type your name.';
  if (field === 'phone')
    return isPhone(text) ? '' : `Please type a phone number (at least ${MIN_PHONE_DIGITS} digits).`;
  return isEmail(text) ? '' : 'Please type a valid email, like name@example.com.';
}
