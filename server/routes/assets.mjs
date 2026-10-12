import express from 'express';
import { requireAdmin } from '../auth.mjs';
import { ASSET_TYPES, createAsset, deleteAsset, listAssets, updateAsset } from '../db/index.mjs';
import { HttpError, badRequest, notFound, wrap } from '../http.mjs';
import { svgProblem } from '../svgCheck.mjs';

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'asset';

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

/** Throws when an uploaded SVG is unsafe. */
function requireSafeSvg(svg) {
  const problem = svgProblem(svg);
  if (problem) throw badRequest(problem);
}

/** The character library: heads, faces, poses, symbols and backgrounds. The kiosk reads the enabled ones. */
export const assetsRouter = express.Router();

assetsRouter.get(
  '/assets',
  wrap(async (req, res) => {
    const type = ASSET_TYPES.includes(req.query.type) ? req.query.type : undefined;
    res.json({ assets: await listAssets({ type, enabledOnly: true }) });
  }),
);

assetsRouter.get(
  '/cc/assets',
  requireAdmin,
  wrap(async (_req, res) => res.json({ assets: await listAssets() })),
);

assetsRouter.post(
  '/cc/assets',
  requireAdmin,
  wrap(async (req, res) => {
    const { type, name, svg, parts = {}, meta = {} } = req.body ?? {};
    if (!ASSET_TYPES.includes(type)) throw badRequest('Unknown asset type');
    if (!name?.trim()) throw badRequest('Name is required');
    if (!isObject(parts) || !isObject(meta)) throw badRequest('Invalid parts/meta');
    requireSafeSvg(svg);
    try {
      const asset = await createAsset({ type, slug: slugify(name), name: name.trim(), svg, parts, meta });
      res.status(201).json({ asset });
    } catch (e) {
      if (e.code === '23505') throw new HttpError(409, 'An asset with that name already exists');
      throw e;
    }
  }),
);

assetsRouter.put(
  '/cc/assets/:id',
  requireAdmin,
  wrap(async (req, res) => {
    const { name, svg, parts, meta, enabled, sort } = req.body ?? {};
    const patch = {};
    if (name !== undefined) patch.name = String(name).trim();
    if (svg !== undefined) {
      requireSafeSvg(svg);
      patch.svg = svg;
    }
    if (parts !== undefined) {
      if (!isObject(parts)) throw badRequest('Invalid parts');
      patch.parts = parts;
    }
    if (meta !== undefined) {
      if (!isObject(meta)) throw badRequest('Invalid meta');
      patch.meta = meta;
    }
    if (enabled !== undefined) patch.enabled = !!enabled;
    if (Number.isFinite(sort)) patch.sort = sort;
    const asset = await updateAsset(Number(req.params.id), patch);
    if (!asset) throw notFound();
    res.json({ asset });
  }),
);

assetsRouter.delete(
  '/cc/assets/:id',
  requireAdmin,
  wrap(async (req, res) => {
    if (!(await deleteAsset(Number(req.params.id)))) throw notFound();
    res.json({ ok: true });
  }),
);
