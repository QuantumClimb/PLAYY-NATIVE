import React, { useEffect, useState, useSyncExternalStore } from 'react';

/** Tight drop shadow used wherever the logo sits in the app itself. */
export interface BrandShadow {
  enabled: boolean;
  /** px */
  blur: number;
  /** px, straight down */
  offsetY: number;
  /** 0 to 1 */
  opacity: number;
}

/** Stroke used when the logo is composited onto the finished artwork. Width is a % of the logo's height. */
export interface BrandStroke {
  enabled: boolean;
  color: string;
  width: number;
}

export interface Brand {
  /** The uploaded SVG logo, or null to use the built-in one */
  logoUrl: string | null;
  shadow: BrandShadow;
  stroke: BrandStroke;
}

/** The built-in logo, committed in the repo. An uploaded one (command center) replaces it everywhere. */
export const DEFAULT_LOGO = '/assets/SVG/logo/logo.svg';

export const DEFAULT_SHADOW: BrandShadow = { enabled: true, blur: 2, offsetY: 1.5, opacity: 0.45 };
export const DEFAULT_STROKE: BrandStroke = { enabled: true, color: '#ffffff', width: 1.5 };
const DEFAULT_BRAND: Brand = { logoUrl: null, shadow: DEFAULT_SHADOW, stroke: DEFAULT_STROKE };

// A tiny shared store: the first component to ask loads /api/brand, everyone else reuses it.
let current: Brand = DEFAULT_BRAND;
let started = false;
const listeners = new Set<() => void>();

export async function refreshBrand(): Promise<void> {
  started = true;
  try {
    const res = await fetch('/api/brand');
    if (!res.ok) return;
    const d = await res.json();
    current = {
      logoUrl: d.logoUrl ?? null,
      shadow: { ...DEFAULT_SHADOW, ...d.shadow },
      stroke: { ...DEFAULT_STROKE, ...d.stroke },
    };
    listeners.forEach((l) => l());
  } catch {
    /* keep the built-in logo if the server is unreachable */
  }
}

export function useBrand(): Brand {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      if (!started) refreshBrand();
      return () => listeners.delete(cb);
    },
    () => current,
  );
}

export const logoSrc = (brand: Brand) => brand.logoUrl ?? DEFAULT_LOGO;

/** CSS for the tight drop shadow (undefined when switched off). */
export function shadowFilter(s: BrandShadow): string | undefined {
  if (!s.enabled) return undefined;
  return `drop-shadow(0 ${s.offsetY}px ${s.blur}px rgba(0, 0, 0, ${s.opacity}))`;
}

/** The logo's SVG source, for compositing onto artwork (the app itself just uses an <img>). */
export function useLogoSvg(): string | null {
  const brand = useBrand();
  const src = logoSrc(brand);
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    fetch(src)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('logo'))))
      .then((t) => live && setSvg(t))
      .catch(() => live && setSvg(null));
    return () => { live = false; };
  }, [src]);
  return svg;
}

interface BrandLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Tight drop shadow from the Logo settings (on by default) */
  shadow?: boolean;
}

/** The brand logo as an image: the SVG from the command center when one is set, else the built-in SVG. */
export const BrandLogo: React.FC<BrandLogoProps> = ({ shadow = true, style, alt = 'PLAYYS', ...rest }) => {
  const brand = useBrand();
  return (
    <img
      src={logoSrc(brand)}
      alt={alt}
      draggable={false}
      style={{ filter: shadow ? shadowFilter(brand.shadow) : undefined, ...style }}
      {...rest}
    />
  );
};
