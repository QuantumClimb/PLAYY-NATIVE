import express from 'express';
import { isHexColor } from '../../shared/validation.mjs';
import { requireAdmin } from '../auth.mjs';
import { getBrand, saveBrandLogo, saveBrandSettings } from '../db/index.mjs';
import { badRequest, notFound, wrap } from '../http.mjs';
import { svgProblem } from '../svgCheck.mjs';

const DEFAULT_SHADOW = { enabled: true, blur: 2, offsetY: 1.5, opacity: 0.45 };
const DEFAULT_STROKE = { enabled: true, color: '#ffffff', width: 1.5 };

const inRange = (value, min, max) =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

function requireValidShadow(shadow) {
  const valid =
    typeof shadow?.enabled === 'boolean' &&
    inRange(shadow.blur, 0, 20) &&
    inRange(shadow.offsetY, -10, 20) &&
    inRange(shadow.opacity, 0, 1);
  if (!valid) throw badRequest('Shadow needs enabled, blur 0-20, offsetY -10 to 20 and opacity 0-1');
}

function requireValidStroke(stroke) {
  const valid = typeof stroke?.enabled === 'boolean' && isHexColor(stroke.color) && inRange(stroke.width, 0, 8);
  if (!valid) throw badRequest('Stroke needs enabled, a #rrggbb color and a width from 0 to 8');
}

/** The logo: an uploaded SVG (or the built-in one), its drop shadow in the app and its stroke on artwork. */
export const brandRouter = express.Router();

brandRouter.get(
  '/brand',
  wrap(async (_req, res) => {
    const row = await getBrand();
    res.json({
      logoUrl: row?.logo_svg ? `/api/brand/logo?v=${Date.parse(row.updated)}` : null,
      shadow: { ...DEFAULT_SHADOW, ...(row?.settings?.shadow ?? {}) },
      stroke: { ...DEFAULT_STROKE, ...(row?.settings?.stroke ?? {}) },
    });
  }),
);

// Served as an image, with a locked-down policy on top of the upload checks
brandRouter.get(
  '/brand/logo',
  wrap(async (_req, res) => {
    const row = await getBrand();
    if (!row?.logo_svg) throw notFound('No custom logo');
    res.set({
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=300',
    });
    res.send(row.logo_svg);
  }),
);

brandRouter.put(
  '/cc/brand/logo',
  requireAdmin,
  wrap(async (req, res) => {
    const svg = req.body?.svg;
    if (svg !== null) {
      const problem = svgProblem(svg);
      if (problem) throw badRequest(problem);
    }
    await saveBrandLogo(svg); // null puts the built-in logo back
    res.json({ ok: true });
  }),
);

brandRouter.put(
  '/cc/brand/settings',
  requireAdmin,
  wrap(async (req, res) => {
    const { shadow, stroke } = req.body ?? {};
    if (shadow !== undefined) requireValidShadow(shadow);
    if (stroke !== undefined) requireValidStroke(stroke);

    const settings = { ...((await getBrand())?.settings ?? {}) };
    if (shadow) {
      settings.shadow = {
        enabled: shadow.enabled,
        blur: shadow.blur,
        offsetY: shadow.offsetY,
        opacity: shadow.opacity,
      };
    }
    if (stroke) settings.stroke = { enabled: stroke.enabled, color: stroke.color, width: stroke.width };
    await saveBrandSettings(settings);
    res.json({ shadow: settings.shadow ?? DEFAULT_SHADOW, stroke: settings.stroke ?? DEFAULT_STROKE });
  }),
);
