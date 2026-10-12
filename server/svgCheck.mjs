// Uploaded SVGs are drawn on the kiosk, so anything that can run code or load remote content is rejected.
const FORBIDDEN = [
  /<\s*script/i,
  /<\s*foreignObject/i,
  /<\s*iframe/i,
  /<\s*embed/i,
  /<\s*object/i,
  /\son\w+\s*=/i,
  /javascript\s*:/i,
  /<!ENTITY/i,
  /<\s*image\b/i,
  /<\s*use\b[^>]*href\s*=\s*["'](?!#)/i,
  /(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i,
];

const MAX_LENGTH = 2_000_000;

/** What is wrong with an uploaded SVG, or null when it is safe to use. */
export function svgProblem(svg) {
  if (typeof svg !== 'string' || !/<svg[\s>]/i.test(svg)) return 'Not an SVG file';
  if (svg.length > MAX_LENGTH) return 'SVG is too large (2 MB max)';
  return FORBIDDEN.some((pattern) => pattern.test(svg))
    ? 'SVG contains disallowed content (scripts, event handlers, images or external links)'
    : null;
}
