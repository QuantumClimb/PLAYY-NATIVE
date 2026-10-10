import React, { useMemo } from 'react';
import { parseSvgAsset } from '../lib/assets/svgParts';
import { Asset } from './api';
import { AssetPreview } from './AssetPreview';

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

interface CompositePreviewProps {
  head: Asset;
  body: Asset;
  face?: Asset;
  mode: 'color' | 'line';
  headMain: string;
  /** Outfit color (hoodie, trousers, shoes) */
  bodyMain: string;
  /** Fixed secondary color for the outfit's lighter parts; auto-derived when absent */
  bodySecondary?: string;
  headScale: number;
  className?: string;
}

/** A head on a body: the head's neck anchor is pinned to the body's neck anchor. */
export const CompositePreview: React.FC<CompositePreviewProps> = ({
  head, body, face, mode, headMain, bodyMain, bodySecondary, headScale, className = '',
}) => {
  const layout = useMemo(() => {
    try {
      const hvb = parseSvgAsset(head.svg).viewBox;
      const bvb = parseSvgAsset(body.svg).viewBox;
      const hn = anchorOf(head, 'neck', { x: hvb.w / 2, y: hvb.h * 0.9 }).pt;
      const bn = anchorOf(body, 'neck', { x: bvb.w / 2, y: bvb.h * 0.08 }).pt;

      const bodyRect = { x: 0, y: 0, w: bvb.w, h: bvb.h };
      const headRect = {
        x: bn.x - hn.x * headScale,
        y: bn.y - hn.y * headScale,
        w: hvb.w * headScale,
        h: hvb.h * headScale,
      };
      // The canvas grows to fit both, since the head usually pokes above the body
      const x0 = Math.min(bodyRect.x, headRect.x), y0 = Math.min(bodyRect.y, headRect.y);
      const x1 = Math.max(bodyRect.x + bodyRect.w, headRect.x + headRect.w);
      const y1 = Math.max(bodyRect.y + bodyRect.h, headRect.y + headRect.h);
      const W = x1 - x0, H = y1 - y0;
      const box = (r: typeof bodyRect): React.CSSProperties => ({
        position: 'absolute',
        left: `${((r.x - x0) / W) * 100}%`,
        top: `${((r.y - y0) / H) * 100}%`,
        width: `${(r.w / W) * 100}%`,
        height: `${(r.h / H) * 100}%`,
      });
      return { W, H, bodyBox: box(bodyRect), headBox: box(headRect) };
    } catch {
      return null;
    }
  }, [head, body, headScale]);

  if (!layout) return <div className="text-red-300 text-sm p-4">Could not render this combination</div>;

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${layout.W} / ${layout.H}` }}>
      <AssetPreview asset={body} mode={mode} main={bodyMain} secondary={bodySecondary} style={layout.bodyBox} />
      <AssetPreview asset={head} face={face} mode={mode} main={headMain} style={layout.headBox} />
    </div>
  );
};
