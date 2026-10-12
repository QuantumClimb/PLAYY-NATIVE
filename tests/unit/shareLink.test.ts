import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync('index.html', 'utf8');
const meta = (name: string) =>
  html.match(new RegExp(`<meta[^>]*(?:property|name)="${name}"[^>]*content="([^"]*)"`))?.[1];

describe('link preview (what WhatsApp and others show when the link is shared)', () => {
  it('has a title, a description and a large image', () => {
    expect(meta('og:title')).toBeTruthy();
    expect(meta('og:description')).toBeTruthy();
    expect(meta('twitter:card')).toBe('summary_large_image');
  });

  it('points at an image that exists, with a full address filled in at build time', () => {
    expect(meta('og:image')).toBe('%SITE_URL%/share-img.png');
    expect(existsSync('public/share-img.png')).toBe(true);
  });

  it('does not mention the old project names', () => {
    expect(html).not.toMatch(/native|expo|ai studio/i);
  });
});
