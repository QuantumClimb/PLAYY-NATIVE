import express from 'express';
import { requireAdmin } from '../auth.mjs';
import { listSceneBackgrounds, resetSceneBackground, upsertSceneBackground } from '../db/index.mjs';
import { badRequest, wrap } from '../http.mjs';

const SCENE_IDS = ['intro', 'head', 'body', 'symbol', 'world', 'name', 'quiz', 'review', 'celebrate'];

const CHOICES = {
  bgType: { values: ['default', 'image', 'video'], message: 'Invalid background type' },
  fit: { values: ['cover', 'contain'], message: 'Invalid fit option' },
  startButtonSize: { values: ['large', 'extra-large'], message: 'Invalid start button size' },
  badgeGap: { values: ['comfortable', 'relaxed'], message: 'Invalid badge gap' },
  floatAnimation: { values: ['none', 'gentle', 'slow'], message: 'Invalid float animation' },
};

const mediaUrl = (id) => (id ? `/api/media/${id}` : null);

/** A database row as the kiosk and command center read it. */
const toScene = (row) => ({
  sceneId: row.scene_id,
  bgType: row.bg_type,
  mediaId: row.media_id,
  fallbackMediaId: row.fallback_media_id,
  mediaUrl: mediaUrl(row.media_id),
  fallbackMediaUrl: mediaUrl(row.fallback_media_id),
  fit: row.fit,
  position: row.position,
  overlayColor: row.overlay_color,
  overlayOpacity: Number(row.overlay_opacity),
  badgePlacement: row.badge_placement,
  startButtonPlacement: row.start_button_placement,
  startButtonSize: row.start_button_size,
  badgeGap: row.badge_gap,
  floatAnimation: row.float_animation,
  updatedAt: row.updated,
});

function requireSceneId(id) {
  if (!SCENE_IDS.includes(id)) throw badRequest(`Invalid scene ID: ${id}`);
}

/** Background image or video for each kiosk screen, and the intro screen layout. */
export const sceneBackgroundsRouter = express.Router();

sceneBackgroundsRouter.get(
  '/scene-backgrounds',
  wrap(async (_req, res) => {
    const scenes = {};
    for (const row of await listSceneBackgrounds()) scenes[row.scene_id] = toScene(row);
    res.json({ scenes });
  }),
);

sceneBackgroundsRouter.put(
  '/cc/scene-backgrounds/:sceneId',
  requireAdmin,
  wrap(async (req, res) => {
    const { sceneId } = req.params;
    requireSceneId(sceneId);
    const body = req.body ?? {};
    for (const [field, { values, message }] of Object.entries(CHOICES)) {
      if (body[field] && !values.includes(body[field])) throw badRequest(message);
    }

    const row = await upsertSceneBackground(sceneId, {
      bg_type: body.bgType,
      media_id: body.mediaId,
      fallback_media_id: body.fallbackMediaId,
      fit: body.fit,
      position: body.position,
      overlay_color: body.overlayColor,
      overlay_opacity: body.overlayOpacity,
      badge_placement: body.badgePlacement,
      start_button_placement: body.startButtonPlacement,
      start_button_size: body.startButtonSize,
      badge_gap: body.badgeGap,
      float_animation: body.floatAnimation,
    });
    res.json({ scene: toScene(row) });
  }),
);

sceneBackgroundsRouter.post(
  '/cc/scene-backgrounds/:sceneId/reset',
  requireAdmin,
  wrap(async (req, res) => {
    requireSceneId(req.params.sceneId);
    res.json({ scene: toScene(await resetSceneBackground(req.params.sceneId)) });
  }),
);
