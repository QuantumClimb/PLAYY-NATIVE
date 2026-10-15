// Letters and digits without the look-alikes (no I, L, O, U), so a serial can be read out and typed without mistakes
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const LENGTH = 10;

/** A card serial like `7K3QX-9M2VD`: 50 random bits from the browser's secure random source (about a quadrillion values). */
export function makeSerial(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(LENGTH));
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return `${chars.slice(0, LENGTH / 2).join('')}-${chars.slice(LENGTH / 2).join('')}`;
}
