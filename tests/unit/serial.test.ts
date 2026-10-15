import { describe, expect, it } from 'vitest';
import { makeSerial } from '../../src/lib/playys/serial';

describe('card serials', () => {
  it('look like XXXXX-XXXXX with no look-alike letters', () => {
    for (let i = 0; i < 200; i += 1) expect(makeSerial()).toMatch(/^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/);
  });

  it('do not repeat', () => {
    const seen = new Set(Array.from({ length: 50_000 }, makeSerial));
    expect(seen.size).toBe(50_000);
  });
});
