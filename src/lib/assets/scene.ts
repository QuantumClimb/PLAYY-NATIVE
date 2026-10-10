import { parseSvgAsset } from './svgParts';
import type { Asset } from './types';

type Pt = { x: number; y: number };

/** Anchor from the CMS (meta), else an anchor_* marker in the SVG, else a sensible default. */
export function anchorOf(asset: Asset, name: string, fallback: Pt): { pt: Pt; isDefault: boolean } {
  const saved = asset.meta.anchors?.[name];
  if (saved) return { pt: saved, isDefault: false };
  try {
    const marker = parseSvgAsset(asset.svg).anchors[name];
    if (marker) return { pt: marker, isDefault: false };
  } catch {
    /* fall through to the default */
  }
  return { pt: fallback, isDefault: true };
}

export const DEFAULT_HEAD_SCALE = 0.5;

/** A4 portrait in mm, and the margin the printer cannot reach (edit if the printer needs more). */
export const A4 = { w: 210, h: 297 };
export const PRINT_MARGIN_MM = 5;

/** Scene units: the printable area is W x H, with W fixed and H following the A4 ratio. */
export const SCENE_W = 1000;
export const SCENE_H = Math.round((SCENE_W * (A4.h - 2 * PRINT_MARGIN_MM)) / (A4.w - 2 * PRINT_MARGIN_MM));

export const DEFAULT_CHAR_HEIGHT = 0.55; // character height as a fraction of the printable height
export const DEFAULT_SYMBOL_WIDTH = 16; // symbol width as a % of the body width

export interface Rect { x: number; y: number; w: number; h: number }

export interface SceneLayout {
  /** Always the full printable area: the background is stretched (non-uniformly) to fit it */
  background: Rect;
  body: Rect;
  head: Rect;
  symbol: Rect | null;
}

/**
 * Places the character on the background:
 *  - head neck anchor -> body neck anchor, head size from the head's headScale
 *  - symbol center -> body chest anchor, symbol width as a % of the body width
 *  - character feet (bottom center of the body) -> the background's stand point
 *  - character height = the background's charHeight x printable height
 */
export function layoutScene(a: { background: Asset; body: Asset; head: Asset; symbol?: Asset | null }): SceneLayout {
  const gvb = parseSvgAsset(a.background.svg).viewBox;
  const bvb = parseSvgAsset(a.body.svg).viewBox;
  const hvb = parseSvgAsset(a.head.svg).viewBox;

  const headScale = a.head.meta.headScale ?? DEFAULT_HEAD_SCALE;
  const hn = anchorOf(a.head, 'neck', { x: hvb.w / 2, y: hvb.h * 0.9 }).pt;
  const bn = anchorOf(a.body, 'neck', { x: bvb.w / 2, y: bvb.h * 0.08 }).pt;
  const chest = anchorOf(a.body, 'chest', { x: bvb.w / 2, y: bvb.h * 0.32 }).pt;

  // Everything below is in body units until the final mapping
  const bodyR: Rect = { x: 0, y: 0, w: bvb.w, h: bvb.h };
  const headR: Rect = { x: bn.x - hn.x * headScale, y: bn.y - hn.y * headScale, w: hvb.w * headScale, h: hvb.h * headScale };

  let symbolR: Rect | null = null;
  if (a.symbol) {
    const svb = parseSvgAsset(a.symbol.svg).viewBox;
    const sc = anchorOf(a.symbol, 'center', { x: svb.w / 2, y: svb.h / 2 }).pt;
    const k = (bvb.w * (a.symbol.meta.widthPct ?? DEFAULT_SYMBOL_WIDTH)) / 100 / svb.w;
    symbolR = { x: chest.x - sc.x * k, y: chest.y - sc.y * k, w: svb.w * k, h: svb.h * k };
  }

  const rects = [bodyR, headR, ...(symbolR ? [symbolR] : [])];
  const top = Math.min(...rects.map((r) => r.y));
  const bottom = Math.max(...rects.map((r) => r.y + r.h));
  const s = ((a.background.meta.charHeight ?? DEFAULT_CHAR_HEIGHT) * SCENE_H) / (bottom - top);

  const stand = anchorOf(a.background, 'stand', { x: gvb.x + gvb.w * 0.5, y: gvb.y + gvb.h * 0.88 }).pt;
  const sx = ((stand.x - gvb.x) / gvb.w) * SCENE_W;
  const sy = ((stand.y - gvb.y) / gvb.h) * SCENE_H;
  const feet = { x: bvb.w / 2, y: bvb.h };
  const map = (r: Rect): Rect => ({ x: sx + (r.x - feet.x) * s, y: sy + (r.y - feet.y) * s, w: r.w * s, h: r.h * s });

  return {
    background: { x: 0, y: 0, w: SCENE_W, h: SCENE_H },
    body: map(bodyR),
    head: map(headR),
    symbol: symbolR ? map(symbolR) : null,
  };
}
