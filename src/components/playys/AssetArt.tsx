import React, { useMemo } from 'react';
import { parseSvgAsset, renderSvgAsset } from '../../lib/assets/svgParts';
import type { Asset } from '../../lib/assets/types';

const fit = '[&>svg]:w-full [&>svg]:h-full [&>svg]:block';

interface AssetArtProps {
  asset: Asset;
  /** The shared face, drawn on heads */
  face?: Asset;
  mode: 'color' | 'line';
  main: string;
  secondary?: string;
  /** Fill the box ignoring the aspect ratio (backgrounds printed on A4) */
  stretch?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** One asset as inline SVG, recolored for the character. A head also carries the shared face. */
export const AssetArt: React.FC<AssetArtProps> = React.memo(({ asset, face, mode, main, secondary, stretch, className = '', style }) => {
  const art = useMemo(() => {
    const vb = parseSvgAsset(asset.svg).viewBox;
    const svg = renderSvgAsset(asset.svg, { main, secondary, stretch, mode, parts: asset.parts });
    let faceLayer: { svg: string; style: React.CSSProperties } | null = null;
    if (asset.type === 'head' && face) {
      const fvb = parseSvgAsset(face.svg).viewBox;
      const scale = asset.meta.faceScale ?? 0.61;
      const w = scale * 100;
      const h = ((scale * vb.w * fvb.h) / fvb.w / vb.h) * 100;
      faceLayer = {
        svg: renderSvgAsset(face.svg, { main, mode, parts: face.parts }),
        style: {
          width: `${w}%`, height: `${h}%`,
          left: `${50 + (asset.meta.faceDx ?? 0) - w / 2}%`,
          top: `${50 + (asset.meta.faceDy ?? 0) - h / 2}%`,
        },
      };
    }
    return { vb, svg, faceLayer };
  }, [asset, face, mode, main, secondary, stretch]);

  return (
    <div
      className={`${style?.position ? '' : 'relative'} ${className}`}
      style={{ aspectRatio: `${art.vb.w} / ${art.vb.h}`, ...style }}
    >
      <div className={`absolute inset-0 ${fit}`} dangerouslySetInnerHTML={{ __html: art.svg }} />
      {art.faceLayer && (
        <div className={`absolute ${fit}`} style={art.faceLayer.style} dangerouslySetInnerHTML={{ __html: art.faceLayer.svg }} />
      )}
    </div>
  );
});
