import { describe, expect, it } from 'vitest';
import { effectiveRegionColor, regionGroup, resolveColors } from '../../src/lib/playys/colors';
import type { Selection } from '../../src/lib/assets/library';

const sel = { headMain: '#004dd1', outfit: '#0a2a80', secondary: '#80aeff' } as Selection;

describe('regionGroup', () => {
  it('puts clothes in the main group', () => {
    for (const key of ['hoodie', 'trousers', 'pants', 'shoes', 'Shoe', 'jacket']) expect(regionGroup(key)).toBe('main');
  });
  it('puts cuffs, trim, soles and tassles in the highlight group', () => {
    for (const key of ['cuffs', 'trim', 'soles', 'tassles', 'tassle']) expect(regionGroup(key)).toBe('highlight');
  });
  it('knows gloves and treats anything else as other', () => {
    expect(regionGroup('gloves')).toBe('gloves');
    expect(regionGroup('pose_outline')).toBe('other');
  });
});

describe('resolveColors', () => {
  it('keeps the character defaults when nothing was chosen', () => {
    const rc = resolveColors(sel);
    expect(rc.headMain).toBe('#004dd1');
    expect(rc.bodyMain).toBe('#0a2a80');
    expect(rc.secondary).toBe('#80aeff');
  });

  it('simple mode: main colors the head and clothes, highlight only the trim parts, gloves stay white', () => {
    const rc = resolveColors(sel, { mode: 'simple', main: '#ef2b2d', highlight: '#f9d11f' });
    expect(rc.headMain).toBe('#ef2b2d');
    expect(rc.bodyMain).toBe('#ef2b2d');
    expect(rc.partColors).toMatchObject({
      cuffs: '#f9d11f',
      trim: '#f9d11f',
      soles: '#f9d11f',
      tassles: '#f9d11f',
      gloves: '#ffffff',
    });
    expect(rc.partColors.hoodie).toBeUndefined();
  });

  it('advanced mode: single parts win over the simple choices, the head can differ, gloves cannot change', () => {
    const rc = resolveColors(sel, {
      mode: 'advanced',
      main: '#ef2b2d',
      highlight: '#f9d11f',
      parts: { head: '#38b63b', hoodie: '#8a3fe0', gloves: '#000000' },
    });
    expect(rc.headMain).toBe('#38b63b');
    expect(rc.bodyMain).toBe('#ef2b2d');
    expect(rc.partColors.hoodie).toBe('#8a3fe0');
    expect(rc.partColors.cuffs).toBe('#f9d11f');
    expect(rc.partColors.gloves).toBe('#ffffff');
  });

  it('ignores per-part colors when the mode is simple', () => {
    const rc = resolveColors(sel, { mode: 'simple', parts: { head: '#38b63b', hoodie: '#8a3fe0' } });
    expect(rc.headMain).toBe('#004dd1');
    expect(rc.partColors.hoodie).toBeUndefined();
  });
});

describe('effectiveRegionColor', () => {
  it('reads the simple choices by group', () => {
    const colors = { mode: 'simple' as const, main: '#111111', highlight: '#222222' };
    expect(effectiveRegionColor(colors, 'head')).toBe('#111111');
    expect(effectiveRegionColor(colors, 'hoodie')).toBe('#111111');
    expect(effectiveRegionColor(colors, 'cuffs')).toBe('#222222');
    expect(effectiveRegionColor(colors, 'gloves')).toBeUndefined();
  });
  it('reads an advanced part first', () => {
    const colors = { mode: 'advanced' as const, main: '#111111', parts: { hoodie: '#333333' } };
    expect(effectiveRegionColor(colors, 'hoodie')).toBe('#333333');
    expect(effectiveRegionColor(colors, 'trousers')).toBe('#111111');
  });
  it('returns undefined when nothing is set', () => {
    expect(effectiveRegionColor(undefined, 'hoodie')).toBeUndefined();
  });
});
