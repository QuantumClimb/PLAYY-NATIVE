import React, { useMemo, useRef } from 'react';
import { parseSvgAsset, renderSvgAsset } from '../lib/assets/svgParts';
import { Asset } from './api';

const fill = '[&>svg]:w-full [&>svg]:h-full [&>svg]:block';

interface AssetPreviewProps {
  asset: Asset;
  /** Shared face drawn on top of heads */
  face?: Asset;
  mode: 'color' | 'line';
  main: string;
  className?: string;
  style?: React.CSSProperties;
  /** Anchor editing: markers are drawn over the asset; click or drag to place the active one */
  anchors?: Record<string, { x: number; y: number }>;
  activeAnchor?: string;
  onPlaceAnchor?: (name: string, point: { x: number; y: number }) => void;
}

/** Renders an asset (a head also gets the shared face placed on it, as it will on the kiosk). */
export const AssetPreview: React.FC<AssetPreviewProps> = ({
  asset, face, mode, main, className = '', style, anchors, activeAnchor, onPlaceAnchor,
}) => {
  const overlayRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const body = useMemo(() => {
    try {
      return {
        vb: parseSvgAsset(asset.svg).viewBox,
        svg: renderSvgAsset(asset.svg, { main, mode, parts: asset.parts }),
      };
    } catch {
      return null;
    }
  }, [asset.svg, asset.parts, main, mode]);

  const faceLayer = useMemo(() => {
    if (asset.type !== 'head' || !face || !body) return null;
    try {
      const fvb = parseSvgAsset(face.svg).viewBox;
      const scale = asset.meta.faceScale ?? 0.61;
      const w = scale * 100;
      const h = ((scale * body.vb.w * fvb.h) / fvb.w / body.vb.h) * 100;
      return {
        svg: renderSvgAsset(face.svg, { main, mode, parts: face.parts }),
        style: {
          width: `${w}%`,
          height: `${h}%`,
          left: `${50 + (asset.meta.faceDx ?? 0) - w / 2}%`,
          top: `${50 + (asset.meta.faceDy ?? 0) - h / 2}%`,
        },
      };
    } catch {
      return null;
    }
  }, [asset.type, asset.meta, face, body, main, mode]);

  const place = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = overlayRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm || !activeAnchor || !onPlaceAnchor) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    onPlaceAnchor(activeAnchor, { x: Math.round(pt.x * 10) / 10, y: Math.round(pt.y * 10) / 10 });
  };

  if (!body) return <div className="text-red-300 text-sm p-4">Could not render this SVG</div>;

  return (
    <div className={`${style ? '' : 'relative'} ${className}`} style={{ aspectRatio: `${body.vb.w} / ${body.vb.h}`, ...style }}>
      <div className={`absolute inset-0 ${fill}`} dangerouslySetInnerHTML={{ __html: body.svg }} />
      {faceLayer && (
        <div className={`absolute ${fill}`} style={faceLayer.style} dangerouslySetInnerHTML={{ __html: faceLayer.svg }} />
      )}
      {anchors && onPlaceAnchor && (
        <svg
          ref={overlayRef}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          viewBox={`${body.vb.x} ${body.vb.y} ${body.vb.w} ${body.vb.h}`}
          onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); place(e); }}
          onPointerMove={(e) => dragging.current && place(e)}
          onPointerUp={() => { dragging.current = false; }}
        >
          {(Object.entries(anchors) as [string, { x: number; y: number }][]).map(([name, pt]) => {
            const r = Math.max(body.vb.w, body.vb.h) * 0.018;
            const active = name === activeAnchor;
            return (
              <g key={name} stroke={active ? '#ef4444' : '#2563eb'} strokeWidth={r / 3} fill="none">
                <circle cx={pt.x} cy={pt.y} r={r} />
                <path d={`M${pt.x - r * 1.8} ${pt.y}H${pt.x + r * 1.8}M${pt.x} ${pt.y - r * 1.8}V${pt.y + r * 1.8}`} />
                <text x={pt.x + r * 2} y={pt.y - r} fontSize={r * 2.4} fill={active ? '#ef4444' : '#2563eb'} stroke="none">{name}</text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};
