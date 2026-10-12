import { describe, expect, it } from 'vitest';
import {
  defaultPartConfig,
  deriveColor,
  normalizeColor,
  normalizeId,
  parseSvgAsset,
  renderSvgAsset,
} from '../../src/lib/assets/svgParts';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200">
  <g id="Layer_2">
    <path id="hoodie" d="M0 0h10v10z" fill="#336699"/>
    <path id="trim" d="M0 0h5v5z" fill="#99ccff"/>
    <path id="gloves" d="M0 0h5v5z" fill="#ffffff"/>
    <path id="pose_outline" d="M0 0h5v5z" fill="#000000"/>
    <circle id="anchor_neck" cx="50" cy="20" r="2"/>
  </g>
</svg>`;

describe('normalizeId', () => {
  it('lower-cases and unifies Illustrator spellings', () => {
    expect(normalizeId('Head_x5F_Outline')).toBe('head_outline');
    expect(normalizeId('Main Hoodie')).toBe('main_hoodie');
    expect(normalizeId('trim_2')).toBe('trim');
  });
});

describe('normalizeColor', () => {
  it('accepts hex in several forms and rejects junk', () => {
    expect(normalizeColor('#ABC')).toBe('#aabbcc');
    expect(normalizeColor('#AABBCC')).toBe('#aabbcc');
    expect(normalizeColor('nonsense')).toBeNull();
    expect(normalizeColor(undefined)).toBeNull();
  });
});

describe('deriveColor', () => {
  it('shifts lightness and keeps the color when the shift is zero', () => {
    expect(deriveColor('#336699', 20)).not.toBe('#336699');
    expect(deriveColor('#336699', 0)).toBe('#336699');
  });
});

describe('defaultPartConfig', () => {
  it('reads the naming convention', () => {
    expect(defaultPartConfig('main_hoodie').mode).toBe('main');
    expect(defaultPartConfig('shade_2')).toMatchObject({ mode: 'derived', dL: -24 });
    expect(defaultPartConfig('light_trim')).toMatchObject({ mode: 'derived', dL: 12 });
    expect(defaultPartConfig('pose_outline')).toMatchObject({ mode: 'line', bw: 'keep' });
    expect(defaultPartConfig('hoodie')).toMatchObject({ mode: 'fixed' });
  });
});

describe('parseSvgAsset', () => {
  const parsed = parseSvgAsset(SVG);
  it('reads the view box and the named parts, skipping the layer wrapper and anchors', () => {
    expect(parsed.viewBox).toEqual({ x: 0, y: 0, w: 100, h: 200 });
    expect(parsed.parts.map((p) => p.key)).toEqual(['hoodie', 'trim', 'gloves', 'pose_outline']);
  });
  it('reads anchors', () => {
    expect(parsed.anchors.neck).toEqual({ x: 50, y: 20 });
  });
  it('rejects text that is not an SVG', () => {
    expect(() => parseSvgAsset('<html></html>')).toThrow();
  });
});

describe('renderSvgAsset', () => {
  const parts = {
    hoodie: { mode: 'main' as const, bw: 'white' as const },
    trim: { mode: 'derived' as const, dL: 12, bw: 'white' as const },
    gloves: { mode: 'fixed' as const, bw: 'auto' as const },
    pose_outline: { mode: 'line' as const, bw: 'keep' as const },
  };

  it('paints main and derived parts in colour mode and leaves fixed and line parts alone', () => {
    const out = renderSvgAsset(SVG, { main: '#ff0000', mode: 'color', parts });
    expect(out).toContain('fill="#ff0000"');
    expect(out).toContain('fill="#ffffff"');
    expect(out).toContain('fill="#000000"');
    expect(out).not.toContain('#336699');
    expect(out).not.toContain('id=');
  });

  it('uses a fixed secondary color for derived parts when given', () => {
    const out = renderSvgAsset(SVG, { main: '#ff0000', secondary: '#00ff00', mode: 'color', parts });
    expect(out).toContain('fill="#00ff00"');
  });

  it('black-and-white mode whitens light parts and keeps outlines black', () => {
    const out = renderSvgAsset(SVG, { main: '#ff0000', mode: 'line', parts });
    expect(out).not.toContain('#ff0000');
    expect(out).not.toContain('#336699');
    expect(out).toContain('fill="#000000"');
  });
});
