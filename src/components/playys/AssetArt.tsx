import React, { useMemo } from 'react';
import { normalizeId, parseSvgAsset, renderSvgAsset } from '../../lib/assets/svgParts';
import type { Asset } from '../../lib/assets/types';

const fit = '[&>svg]:w-full [&>svg]:h-full [&>svg]:block';

interface AssetArtProps {
  asset: Asset;
  /** The shared face, drawn on heads */
  face?: Asset;
  mode: 'color' | 'line';
  main: string;
  secondary?: string;
  /** Optional CMS/user-selected colors for named SVG regions. */
  partColors?: Record<string, string>;
  /** Fill the box ignoring the aspect ratio (backgrounds printed on A4) */
  stretch?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** One asset as inline SVG, recolored for the character. A head also carries the shared face. */
export const AssetArt: React.FC<AssetArtProps> = React.memo(
  ({ asset, face, mode, main, secondary, partColors, stretch, className = '', style }) => {
    const art = useMemo(() => {
      const vb = parseSvgAsset(asset.svg).viewBox;
      // CMS parts are authoritative overrides, but older records can omit a
      // newly-added SVG region. Start from the actual SVG's named parts so a
      // selected region is never dropped merely because its config is absent.
      const parsed = parseSvgAsset(asset.svg);
      const parts: Asset['parts'] = {
        ...Object.fromEntries(parsed.parts.map((part) => [part.key, part.defaults])),
        ...asset.parts,
      };
      // A body whose layers were never given a role in the CMS (all left on "fixed" with no color) still follows the
      // character: hoodie, trousers and shoes take the main color, trim, cuffs, soles and strings a lighter shade of it.
      if (asset.type === 'body') {
        Object.keys(parts).forEach((key) => {
          const cfg = parts[key];
          if (cfg.mode !== 'fixed' || cfg.color) return;
          const k = normalizeId(key);
          if (/^(hoodie|jacket|top|shirt|trousers?|pants?|shoes?|sneakers?|boots?)$/.test(k))
            parts[key] = { ...cfg, mode: 'main', bw: 'white' };
          else if (/^(cuffs+|trim|soles?|tassles?)$/.test(k))
            parts[key] = { ...cfg, mode: 'derived', dL: 45, bw: 'white' };
        });
      }
      Object.keys(partColors ?? {}).forEach((key) => {
        const color = partColors?.[key];
        if (!color) return;
        const normalized = normalizeId(key);
        // CMS region names are shared across poses, while older body assets may
        // use trousers/pants/trouser for the same drawn layer.
        const target = Object.keys(parts).find((partKey) => {
          const candidate = normalizeId(partKey);
          if (candidate === normalized) return true;
          const trousers = new Set(['trousers', 'trouser', 'pants', 'pant']);
          return trousers.has(normalized) && trousers.has(candidate);
        });
        if (target) parts[target] = { ...parts[target], mode: 'fixed', color };
      });
      const svg = renderSvgAsset(asset.svg, { main, secondary, stretch, mode, parts });
      let faceLayer: { svg: string; style: React.CSSProperties } | null = null;
      if (asset.type === 'head' && face) {
        const fvb = parseSvgAsset(face.svg).viewBox;
        const scale = asset.meta.faceScale ?? 0.61;
        const w = scale * 100;
        const h = ((scale * vb.w * fvb.h) / fvb.w / vb.h) * 100;
        faceLayer = {
          svg: renderSvgAsset(face.svg, { main, mode, parts: face.parts }),
          style: {
            width: `${w}%`,
            height: `${h}%`,
            left: `${50 + (asset.meta.faceDx ?? 0) - w / 2}%`,
            top: `${50 + (asset.meta.faceDy ?? 0) - h / 2}%`,
          },
        };
      }
      const renderedRoot = new DOMParser().parseFromString(svg, 'image/svg+xml');
      const trousersFills = Array.from(renderedRoot.querySelectorAll('path,rect,circle,ellipse,polygon,polyline'))
        .filter((shape) => {
          for (let cur: Element | null = shape; cur && cur !== renderedRoot.documentElement; cur = cur.parentElement) {
            if (cur.id === 'trousers') return true;
          }
          return false;
        })
        .map((shape) => shape.getAttribute('fill') ?? '')
        .join(',');
      return { vb, svg, faceLayer, trousersFills };
    }, [asset, face, mode, main, secondary, partColors, stretch]);

    return (
      <div
        className={`${style?.position ? '' : 'relative'} ${className}`}
        style={{ aspectRatio: `${art.vb.w} / ${art.vb.h}`, ...style }}
        {...((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV
          ? {
              'data-playy-asset-id': String(asset.id),
              'data-playy-selected-region': Object.keys(partColors ?? {}).join(','),
              'data-playy-trousers-color': partColors?.trousers ?? '',
              'data-playy-trousers-fills': art.trousersFills,
            }
          : {})}
      >
        <div className={`absolute inset-0 ${fit}`} dangerouslySetInnerHTML={{ __html: art.svg }} />
        {art.faceLayer && (
          <div
            className={`absolute ${fit}`}
            style={art.faceLayer.style}
            dangerouslySetInnerHTML={{ __html: art.faceLayer.svg }}
          />
        )}
      </div>
    );
  },
);
