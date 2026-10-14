import React, { useMemo } from 'react';
import { parseSvgAsset, renderSvgAsset } from '../assets/svgParts';
import { BrandStroke, useBrand, useLogoSvg } from './brand';

const SHAPES = 'path,circle,ellipse,rect,polygon,polyline';

/**
 * The logo as artwork for the finished page.
 *  - color: the logo as drawn, with a rounded stroke traced around its whole silhouette (a "sticker" edge)
 *  - line: the black-and-white coloring-page version. Colored layers become white, dark layers (the eyes)
 *    stay black, and every shape gets a black stroke so the white shapes stay visible on white paper
 * Stroke width is a % of the logo's height. The viewBox grows by the stroke so nothing is clipped.
 */
function renderLogoArt(svgText: string, opts: { mode: 'color' | 'line'; stroke: BrandStroke }): string {
  const vb = parseSvgAsset(svgText).viewBox;
  const w = ((opts.stroke.enabled ? opts.stroke.width : 0) * vb.h) / 100;
  // line art always needs a stroke; fall back to a sensible one if the setting is off
  const lineW = Math.max(w, (1.4 * vb.h) / 100);

  const base = renderSvgAsset(svgText, { main: '#ffffff', mode: opts.mode, parts: {} });
  const doc = new DOMParser().parseFromString(base, 'image/svg+xml');
  const root = doc.documentElement;
  const shapes = Array.from(root.querySelectorAll(SHAPES));

  let pad: number;
  if (opts.mode === 'line') {
    shapes.forEach((s) => {
      s.setAttribute('stroke', '#111111');
      s.setAttribute('stroke-width', String(lineW));
      s.setAttribute('stroke-linejoin', 'round');
      s.setAttribute('stroke-linecap', 'round');
    });
    pad = lineW / 2;
  } else if (w > 0) {
    // a backing copy of every shape, filled and stroked in the outline color, drawn underneath
    const backing = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    backing.setAttribute('fill', opts.stroke.color);
    backing.setAttribute('stroke', opts.stroke.color);
    backing.setAttribute('stroke-width', String(w * 2));
    backing.setAttribute('stroke-linejoin', 'round');
    backing.setAttribute('stroke-linecap', 'round');
    shapes.forEach((s) => {
      const c = s.cloneNode(false) as Element;
      c.removeAttribute('fill');
      backing.appendChild(c);
    });
    root.insertBefore(backing, root.firstChild);
    pad = w;
  } else {
    pad = 0;
  }

  root.setAttribute('viewBox', `${vb.x - pad} ${vb.y - pad} ${vb.w + pad * 2} ${vb.h + pad * 2}`);
  root.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  return new XMLSerializer().serializeToString(root);
}

interface LogoArtProps {
  mode: 'color' | 'line';
  /** Defaults to the Logo settings from the command center */
  stroke?: BrandStroke;
  className?: string;
  style?: React.CSSProperties;
}

/** Inline-SVG logo for compositing onto artwork. Size it with className/style (it fills its box). */
export const LogoArt: React.FC<LogoArtProps> = ({ mode, stroke, className = '', style }) => {
  const brand = useBrand();
  const svg = useLogoSvg();
  const s = stroke ?? brand.stroke;
  const { enabled, color, width } = s;
  const markup = useMemo(() => {
    if (!svg) return null;
    try {
      return renderLogoArt(svg, { mode, stroke: { enabled, color, width } });
    } catch {
      return null;
    }
  }, [svg, mode, enabled, color, width]);
  if (!markup) return null;
  return (
    <div
      className={`[&>svg]:w-full [&>svg]:h-full [&>svg]:block ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
};
