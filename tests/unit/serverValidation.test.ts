// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseIntroBadges, parseProgressTabs, parseSounds, parseTrumpCard } from '../../server/settingsSchemas.mjs';
import { IMAGE_KEYS, parseSubmission } from '../../server/submission.mjs';
import { svgProblem } from '../../server/svgCheck.mjs';
import { DEFAULT_SOUND_SETTINGS } from '../../src/lib/sfx/settings';
import { DEFAULT_PROGRESS_TABS } from '../../src/lib/progress/tabs';
import { DEFAULT_TRUMP_CARD } from '../../src/lib/card/settings';

const message = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return (e as Error).message;
  }
  return null;
};

describe('svgProblem', () => {
  it('accepts a plain SVG', () => {
    expect(svgProblem('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>')).toBeNull();
  });
  it('rejects things that can run code or load remote content', () => {
    expect(svgProblem('<svg><script>alert(1)</script></svg>')).toContain('disallowed');
    expect(svgProblem('<svg><rect onclick="x()"/></svg>')).toContain('disallowed');
    expect(svgProblem('<svg><image href="https://evil.example/x.png"/></svg>')).toContain('disallowed');
    expect(svgProblem('<svg><use href="https://evil.example/x.svg#a"/></svg>')).toContain('disallowed');
    expect(svgProblem('not an svg')).toBe('Not an SVG file');
  });
});

describe('intro badges', () => {
  const badge = { id: 'a', label: ' Choose ', icon: 'lucide:Star', color: '#f6ae00', extra: 'dropped' };
  it('cleans a list', () => {
    expect(parseIntroBadges([badge])).toEqual([{ id: 'a', label: 'Choose', icon: 'lucide:Star', color: '#f6ae00' }]);
  });
  it('explains what is wrong', () => {
    expect(message(() => parseIntroBadges('x'))).toContain('at most 5');
    expect(message(() => parseIntroBadges([{ ...badge, label: '' }]))).toContain('label');
    expect(message(() => parseIntroBadges([{ ...badge, icon: 'http://x' }]))).toBe('Invalid badge icon');
    expect(message(() => parseIntroBadges([{ ...badge, color: 'red' }]))).toBe('Invalid badge color');
  });
});

describe('progress tabs', () => {
  it('accepts the defaults', () => {
    expect(parseProgressTabs(DEFAULT_PROGRESS_TABS)).toEqual(DEFAULT_PROGRESS_TABS);
  });
  it('needs eight valid tabs', () => {
    expect(message(() => parseProgressTabs({ showLabels: true, stages: [] }))).toContain('exactly 8');
    expect(message(() => parseProgressTabs({ ...DEFAULT_PROGRESS_TABS, showLabels: 'yes' }))).toContain('showLabels');
    const bad = { ...DEFAULT_PROGRESS_TABS, stages: DEFAULT_PROGRESS_TABS.stages.map((s) => ({ ...s, icon: 'x' })) };
    expect(message(() => parseProgressTabs(bad))).toBe('Invalid tab icon');
  });
});

describe('trump card', () => {
  it('accepts the defaults and bounds the numbers', () => {
    expect(parseTrumpCard(DEFAULT_TRUMP_CARD)).toEqual(DEFAULT_TRUMP_CARD);
    expect(message(() => parseTrumpCard({ ...DEFAULT_TRUMP_CARD, outlineWidth: 99 }))).toContain('0 and 40');
    expect(message(() => parseTrumpCard({ ...DEFAULT_TRUMP_CARD, backAccent: 'gold' }))).toBe('Invalid backAccent');
  });
});

describe('sounds', () => {
  it('accepts the defaults', () => {
    expect(parseSounds(DEFAULT_SOUND_SETTINGS).music).toEqual(DEFAULT_SOUND_SETTINGS.music);
  });
  it('rejects an unsafe music source and an out-of-range volume', () => {
    const music = {
      ...DEFAULT_SOUND_SETTINGS.music,
      tracks: [{ id: 'a', name: 'x', src: 'https://evil.example/a.mp3' }],
    };
    expect(message(() => parseSounds({ ...DEFAULT_SOUND_SETTINGS, music }))).toBe('Invalid music track');
    expect(message(() => parseSounds({ ...DEFAULT_SOUND_SETTINGS, volume: 3 }))).toContain('volume');
  });
});

describe('parseSubmission', () => {
  const images = Object.fromEntries(IMAGE_KEYS.map((k) => [k, 'QUJD']));
  const body = {
    name: ' Arjun ',
    email: 'a@b.com',
    phone: '123',
    thumbnail: 'data:image/jpeg;base64,QUJD',
    config: { head: 'playy', pose: 'p1', secret: 'dropped' },
    images,
  };

  it('keeps only what belongs', () => {
    const parsed = parseSubmission(body);
    expect(parsed.who).toEqual({ name: 'Arjun', email: 'a@b.com', phone: '123' });
    expect(parsed.config).toEqual({ head: 'playy', pose: 'p1' });
    expect(Object.keys(parsed.images)).toEqual(IMAGE_KEYS);
  });

  it('keeps the card summary and drops one that is not numbers', () => {
    const stats = { power: 41, speed: 35, intelligence: 60.4, energy: 52, courage: 98 };
    const card = { stats, type: 'Forest Protector', rarity: 'Legendary', extra: 'dropped' };
    expect(parseSubmission({ ...body, config: { card } }).config.card).toEqual({
      stats: { ...stats, intelligence: 60 },
      type: 'Forest Protector',
      rarity: 'Legendary',
    });
    expect(parseSubmission({ ...body, config: { card: { stats: { power: 'x' } } } }).config.card).toBeUndefined();
  });

  it('keeps a card serial, allows none, and refuses a malformed one', () => {
    expect(parseSubmission({ ...body, serial: '7K3QX-9M2VD' }).serial).toBe('7K3QX-9M2VD');
    expect(parseSubmission(body).serial).toBeNull();
    expect(parseSubmission({ ...body, serial: '' }).serial).toBeNull();
    expect(message(() => parseSubmission({ ...body, serial: "x'; drop table" }))).toBe('Invalid serial');
  });

  it('refuses a missing name, a bad thumbnail and a bad picture', () => {
    expect(message(() => parseSubmission({ ...body, name: '  ' }))).toBe('A name is needed');
    expect(message(() => parseSubmission({ ...body, thumbnail: 'http://x' }))).toBe('Invalid thumbnail');
    expect(message(() => parseSubmission({ ...body, images: { ...images, bw: '<script>' } }))).toBe('Invalid images');
    expect(message(() => parseSubmission(undefined))).toBe('A name is needed');
  });
});
