import { describe, expect, it } from 'vitest';
import { A4, PRINT_MARGIN_MM, SCENE_H, SCENE_W, anchorOf, layoutScene } from '../../src/lib/assets/scene';
import type { Asset, AssetMeta, AssetType } from '../../src/lib/assets/types';

const svg = (w: number, h: number, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><g id="Layer_2"><rect id="shape" width="${w}" height="${h}"/>${extra}</g></svg>`;

const asset = (type: AssetType, w: number, h: number, meta: AssetMeta = {}, extra = ''): Asset => ({
  id: 1,
  type,
  slug: type,
  name: type,
  svg: svg(w, h, extra),
  parts: {},
  meta,
  enabled: true,
  sort: 0,
  updated: '',
});

describe('scene size', () => {
  it('follows the A4 printable area', () => {
    expect(SCENE_W).toBe(1000);
    expect(SCENE_H).toBe(Math.round((1000 * (A4.h - 2 * PRINT_MARGIN_MM)) / (A4.w - 2 * PRINT_MARGIN_MM)));
  });
});

describe('anchorOf', () => {
  it('prefers the saved anchor, then an anchor_ marker in the SVG, then the fallback', () => {
    const marker = '<circle id="anchor_neck" cx="9" cy="9" r="1"/>';
    const saved = asset('body', 100, 100, { anchors: { neck: { x: 1, y: 2 } } }, marker);
    expect(anchorOf(saved, 'neck', { x: 0, y: 0 })).toEqual({ pt: { x: 1, y: 2 }, isDefault: false });

    const marked = asset('body', 100, 100, {}, marker);
    expect(anchorOf(marked, 'neck', { x: 0, y: 0 })).toEqual({ pt: { x: 9, y: 9 }, isDefault: false });

    expect(anchorOf(asset('body', 100, 100), 'neck', { x: 5, y: 5 })).toEqual({ pt: { x: 5, y: 5 }, isDefault: true });
  });
});

describe('layoutScene', () => {
  const background = asset('background', 1000, 1400, { anchors: { stand: { x: 500, y: 1200 } }, charHeight: 0.5 });
  const body = asset('body', 200, 400, { anchors: { neck: { x: 100, y: 40 }, chest: { x: 100, y: 150 } } });
  const head = asset('head', 100, 100, { anchors: { neck: { x: 50, y: 90 } }, headScale: 1 });

  it('stretches the background over the whole printable area', () => {
    expect(layoutScene({ background, body, head }).background).toEqual({ x: 0, y: 0, w: SCENE_W, h: SCENE_H });
  });

  it('puts the character feet on the stand point and sizes it to the background character height', () => {
    const { body: b, head: h } = layoutScene({ background, body, head });
    expect(b.x + b.w / 2).toBeCloseTo(500, 5);
    expect(b.y + b.h).toBeCloseTo((1200 / 1400) * SCENE_H, 5);
    const top = Math.min(b.y, h.y);
    expect((b.y + b.h - top) / SCENE_H).toBeCloseTo(0.5, 5);
  });

  it('attaches the head at the neck', () => {
    const { body: b, head: h } = layoutScene({ background, body, head });
    const scale = b.w / 200;
    expect(h.x + 50 * scale).toBeCloseTo(b.x + 100 * scale, 5);
    expect(h.y + 90 * scale).toBeCloseTo(b.y + 40 * scale, 5);
  });

  it('centers a symbol on the chest', () => {
    const symbol = asset('symbol', 50, 50, { widthPct: 20 });
    const lay = layoutScene({ background, body, head, symbol });
    const s = lay.symbol!;
    expect(s.x + s.w / 2).toBeCloseTo(lay.body.x + 100 * (lay.body.w / 200), 5);
    expect(s.y + s.h / 2).toBeCloseTo(lay.body.y + 150 * (lay.body.w / 200), 5);
    expect(s.w).toBeCloseTo(lay.body.w * 0.2, 5);
  });

  it('keeps the feet above the reserved bottom strip', () => {
    const low = asset('background', 1000, 1400, { anchors: { stand: { x: 500, y: 1390 } } });
    const { body: b } = layoutScene({ background: low, body, head, reserveBottom: 0.1 });
    expect(b.y + b.h).toBeLessThanOrEqual(SCENE_H * 0.9 + 1e-6);
  });
});
