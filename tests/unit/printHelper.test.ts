import { describe, expect, it } from 'vitest';
import { isAllowedOrigin } from '../../server/routes/printers.mjs';

describe('who may call the print helper', () => {
  it('allows the kiosk itself and Vercel sites', () => {
    expect(isAllowedOrigin('http://localhost:3001', '')).toBe(true);
    expect(isAllowedOrigin('http://127.0.0.1:3001', '')).toBe(true);
    expect(isAllowedOrigin('https://playy-native.vercel.app', '')).toBe(true);
  });

  it('allows an origin listed in PRINT_ALLOWED_ORIGINS', () => {
    expect(isAllowedOrigin('https://kiosk.example.com', 'https://kiosk.example.com, https://b.com')).toBe(true);
  });

  it('turns everything else away', () => {
    expect(isAllowedOrigin('https://evil.example.com', '')).toBe(false);
    expect(isAllowedOrigin('https://vercel.app.evil.com', '')).toBe(false);
    expect(isAllowedOrigin('not a url', '')).toBe(false);
    expect(isAllowedOrigin(undefined, '')).toBe(false);
  });
});
