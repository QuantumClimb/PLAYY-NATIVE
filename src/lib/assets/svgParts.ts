/**
 * SVG asset parsing and recoloring.
 *
 * Artists name layers/objects in Illustrator; exported as SVG those names become `id`s. Each named part has a mode:
 *   main     takes the character's main color
 *   derived  same hue as main, lightness shifted by `dL` (HSL)
 *   fixed    keeps its drawn color, or an override color set in the CMS
 *   line     outline artwork, left untouched (kept as-is in the black-and-white version)
 * Elements named `anchor_*` / `anchor-*` are position markers: their center is read, then they are removed.
 */

export type PartMode = 'main' | 'derived' | 'fixed' | 'line';
export type BwRule = 'white' | 'keep' | 'auto';

export interface PartConfig {
  mode: PartMode;
  /** Lightness offset in HSL percentage points (derived parts) */
  dL?: number;
  /** Override color (fixed parts) */
  color?: string;
  /** What this part becomes in the black-and-white version */
  bw: BwRule;
}

export interface ParsedPart {
  /** Id exactly as exported */
  id: string;
  /** Normalized id used for matching and as the key in `parts` */
  key: string;
  isGroup: boolean;
  /** First drawn fill found in this part (for display) */
  fill: string | null;
  defaults: PartConfig;
}

export interface ParsedAsset {
  viewBox: { x: number; y: number; w: number; h: number };
  parts: ParsedPart[];
  anchors: Record<string, { x: number; y: number }>;
  /** Main color found in the artwork (the `main` part's fill), if any */
  mainFill: string | null;
}

export type PartsConfig = Record<string, PartConfig>;

const SHAPES = new Set(['path', 'circle', 'ellipse', 'rect', 'polygon', 'polyline']);

// ---------- color helpers ----------

const NAMED: Record<string, string> = { white: '#ffffff', black: '#000000' };

export function normalizeColor(c: string | null | undefined): string | null {
  if (!c) return null;
  const v = c.trim().toLowerCase();
  if (v === 'none' || v === 'transparent' || v.startsWith('url(')) return null;
  if (NAMED[v]) return NAMED[v];
  let m = /^#([0-9a-f]{3})$/.exec(v);
  if (m) return '#' + m[1].split('').map((ch) => ch + ch).join('');
  m = /^#([0-9a-f]{6})$/.exec(v);
  if (m) return v;
  m = /^rgb\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)\s*\)$/.exec(v);
  if (m) return '#' + [m[1], m[2], m[3]].map((n) => Math.min(255, +n).toString(16).padStart(2, '0')).join('');
  return null;
}

export function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return [h, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}

/** Same hue and saturation as `main`, lightness moved by `dL` points (clamped to 0-100). */
export function deriveColor(main: string, dL: number): string {
  const [h, s, l] = hexToHsl(main);
  return hslToHex(h, s, Math.max(0, Math.min(100, l + dL)));
}

const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
};

// ---------- naming ----------

/** Illustrator quirks: `_x5F_` for underscores, `_1` suffixes on duplicates, spaces. Hyphens equal underscores. */
export function normalizeId(id: string): string {
  return id
    .toLowerCase()
    .replace(/_x5f_/g, '_')
    .replace(/_x2d_/g, '_')
    .replace(/[\s-]+/g, '_')
    .replace(/_\d+$/, (suffix, offset, whole) => (/^(shade|dark|light)_?$/.test(whole.slice(0, offset)) ? suffix : ''));
}

export function defaultPartConfig(key: string): PartConfig {
  // main, main_hoodie, head_colour ...
  if (/^(main|base|colou?r)(_|$)/.test(key) || /^(head|body)_colou?r$/.test(key)) return { mode: 'main', bw: 'white' };
  // shade_1, light_trim, dark_2_sleeves ... (optional number = how many steps; each step is 12 lightness points)
  const shade = /^(shade|dark|light)(?:_?(\d+))?(?:_|$)/.exec(key);
  if (shade) {
    const n = shade[2] ? Number(shade[2]) : 1;
    return { mode: 'derived', dL: (shade[1] === 'light' ? 12 : -12) * n, bw: 'white' };
  }
  // outline, head_outline, pose_outline, lines ...
  if (/(^|_)(outline|line|lines)$/.test(key)) return { mode: 'line', bw: 'keep' };
  return { mode: 'fixed', bw: 'auto' };
}

const isAnchor = (id: string) => /^anchor[_-]/i.test(id);

// ---------- DOM helpers ----------

function parse(svgText: string): SVGSVGElement {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const root = doc.documentElement as unknown as SVGSVGElement;
  if (root.nodeName !== 'svg' || doc.querySelector('parsererror')) throw new Error('Could not read this SVG file');
  return root;
}

function viewBoxOf(root: SVGSVGElement) {
  const vb = root.getAttribute('viewBox')?.split(/[\s,]+/).map(Number);
  if (vb && vb.length === 4 && vb.every(Number.isFinite)) return { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
  return { x: 0, y: 0, w: parseFloat(root.getAttribute('width') || '100'), h: parseFloat(root.getAttribute('height') || '100') };
}

/**
 * Structural groups are not parts: the only drawing group in the root, or Illustrator's automatic
 * `Layer_1-2` style names (metadata and other non-drawing siblings are ignored when counting).
 */
function isWrapper(el: Element, root: Element) {
  if (el.nodeName !== 'g') return false;
  if (/^Layer[_-]\d+([_-]\d+)?$/i.test(el.id)) return true;
  const drawing = Array.from(root.children).filter((c) => !['metadata', 'title', 'desc', 'defs'].includes(c.nodeName));
  return el.parentElement === root && drawing.length === 1;
}

function partElements(root: SVGSVGElement): Element[] {
  return Array.from(root.querySelectorAll('[id]')).filter((el) => el !== root && !isAnchor(el.id) && !isWrapper(el, root));
}

function effectiveFill(el: Element): string | null {
  for (let cur: Element | null = el; cur && cur.nodeName !== 'svg'; cur = cur.parentElement) {
    const f = cur.getAttribute('fill');
    if (f !== null) return normalizeColor(f) ?? (f.trim().toLowerCase() === 'none' ? null : '#000000');
  }
  return '#000000';
}

function shapesOf(el: Element): Element[] {
  return SHAPES.has(el.nodeName) ? [el] : Array.from(el.querySelectorAll(Array.from(SHAPES).join(',')));
}

function anchorCenter(el: Element): { x: number; y: number } | null {
  const n = (a: string) => parseFloat(el.getAttribute(a) ?? '');
  if (el.nodeName === 'circle' || el.nodeName === 'ellipse') return { x: n('cx'), y: n('cy') };
  if (el.nodeName === 'rect') return { x: n('x') + n('width') / 2, y: n('y') + n('height') / 2 };
  const nums = (el.getAttribute('d') ?? el.getAttribute('points') ?? '').match(/-?\d*\.?\d+/g)?.map(Number);
  if (!nums || nums.length < 2) return null;
  const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
}

// ---------- public API ----------

export function parseSvgAsset(svgText: string): ParsedAsset {
  const root = parse(svgText);
  const seen = new Set<string>();
  const parts: ParsedPart[] = [];
  let mainFill: string | null = null;

  for (const el of partElements(root)) {
    const key = normalizeId(el.id);
    if (seen.has(key)) continue;
    seen.add(key);
    const defaults = defaultPartConfig(key);
    const fill = shapesOf(el).map(effectiveFill).find(Boolean) ?? null;
    if (defaults.mode === 'main' && !mainFill) mainFill = fill;
    parts.push({ id: el.id, key, isGroup: !SHAPES.has(el.nodeName), fill, defaults });
  }

  const anchors: ParsedAsset['anchors'] = {};
  root.querySelectorAll('[id]').forEach((el) => {
    if (isAnchor(el.id)) {
      const c = anchorCenter(el);
      if (c) anchors[normalizeId(el.id).replace(/^anchor_/, '')] = c;
    }
  });

  return { viewBox: viewBoxOf(root), parts, anchors, mainFill };
}

export function defaultParts(parsed: ParsedAsset): PartsConfig {
  return Object.fromEntries(parsed.parts.map((p) => [p.key, p.defaults]));
}

export interface RenderOptions {
  main: string;
  /** Fixed color for every derived part (instead of a lightness shift of main) */
  secondary?: string | null;
  /** Stretch to fill its box, ignoring the aspect ratio (backgrounds printed on A4) */
  stretch?: boolean;
  mode: 'color' | 'line';
  parts: PartsConfig;
}

/** Returns recolored SVG markup (ids stripped, width/height removed so CSS sizes it). */
export function renderSvgAsset(svgText: string, { main, secondary, stretch, mode, parts }: RenderOptions): string {
  const root = parse(svgText);
  const mainHex = normalizeColor(main) ?? '#3b82f6';
  const secondaryHex = normalizeColor(secondary);

  root.querySelectorAll('[id]').forEach((el) => { if (isAnchor(el.id)) el.remove(); });

  // Nearest named part (self first, then ancestors) governs each shape
  const governing = (shape: Element): PartConfig | null => {
    for (let cur: Element | null = shape; cur && cur !== root; cur = cur.parentElement) {
      if (cur.id && !isWrapper(cur, root)) return parts[normalizeId(cur.id)] ?? defaultPartConfig(normalizeId(cur.id));
    }
    return null;
  };

  for (const shape of shapesOf(root)) {
    const cfg = governing(shape);
    const drawn = effectiveFill(shape);
    if (drawn === null) continue; // stroke-only shape

    if (mode === 'color') {
      if (!cfg) continue;
      const next =
        cfg.mode === 'main' ? mainHex
        : cfg.mode === 'derived' ? secondaryHex ?? deriveColor(mainHex, cfg.dL ?? 0)
        : cfg.mode === 'fixed' ? normalizeColor(cfg.color) : null;
      if (next) shape.setAttribute('fill', next);
    } else {
      const current = cfg?.mode === 'fixed' ? normalizeColor(cfg.color) ?? drawn : drawn;
      const rule: BwRule = cfg?.bw ?? 'auto';
      const makeWhite =
        rule === 'white' || (rule === 'auto' && luminance(current) >= 0.25 && cfg?.mode !== 'line');
      shape.setAttribute('fill', makeWhite ? '#ffffff' : current);
    }
  }

  root.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  root.removeAttribute('id');
  root.removeAttribute('data-name');
  if (stretch) root.setAttribute('preserveAspectRatio', 'none');
  root.removeAttribute('width');
  root.removeAttribute('height');
  return new XMLSerializer().serializeToString(root);
}
