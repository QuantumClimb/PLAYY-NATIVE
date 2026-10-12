import { query } from './client.mjs';

export async function listSceneBackgrounds() {
  return query('SELECT * FROM scene_backgrounds ORDER BY scene_id');
}

export async function upsertSceneBackground(sceneId, settings) {
  const {
    bg_type,
    media_id,
    fallback_media_id,
    fit,
    position,
    overlay_color,
    overlay_opacity,
    badge_placement,
    start_button_placement,
    start_button_size,
    badge_gap,
    float_animation,
  } = settings;
  const rows = await query(
    `INSERT INTO scene_backgrounds (scene_id, bg_type, media_id, fallback_media_id, fit, position, overlay_color, overlay_opacity, badge_placement, start_button_placement, start_button_size, badge_gap, float_animation, updated)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())
     ON CONFLICT (scene_id) DO UPDATE SET
       bg_type = EXCLUDED.bg_type,
       media_id = EXCLUDED.media_id,
       fallback_media_id = EXCLUDED.fallback_media_id,
       fit = EXCLUDED.fit,
       position = EXCLUDED.position,
       overlay_color = EXCLUDED.overlay_color,
       overlay_opacity = EXCLUDED.overlay_opacity,
       badge_placement = EXCLUDED.badge_placement,
       start_button_placement = EXCLUDED.start_button_placement,
       start_button_size = EXCLUDED.start_button_size,
       badge_gap = EXCLUDED.badge_gap,
       float_animation = EXCLUDED.float_animation,
       updated = now()
     RETURNING *`,
    [
      sceneId,
      bg_type || 'default',
      media_id || null,
      fallback_media_id || null,
      fit || 'cover',
      position || 'center',
      overlay_color || '#000000',
      overlay_opacity ?? 0,
      badge_placement || 'top-center',
      start_button_placement || 'right-center',
      start_button_size || 'extra-large',
      badge_gap || 'comfortable',
      float_animation || 'gentle',
    ],
  );
  return rows[0];
}

export async function resetSceneBackground(sceneId) {
  const defaultBadgePlacement = sceneId === 'intro' ? 'below-start-button' : 'top-center';
  const rows = await query(
    `INSERT INTO scene_backgrounds (scene_id, bg_type, media_id, fallback_media_id, fit, position, overlay_color, overlay_opacity, badge_placement, start_button_placement, start_button_size, badge_gap, float_animation, updated)
     VALUES ($1, 'default', NULL, NULL, 'cover', 'center', '#000000', 0, $2, 'right-center', $3, 'comfortable', 'gentle', now())
     ON CONFLICT (scene_id) DO UPDATE SET
       bg_type = 'default',
       media_id = NULL,
       fallback_media_id = NULL,
       fit = 'cover',
       position = 'center',
       overlay_color = '#000000',
       overlay_opacity = 0,
       badge_placement = $2,
       start_button_placement = 'right-center',
       start_button_size = $3,
       badge_gap = 'comfortable',
       float_animation = 'gentle',
       updated = now()
     RETURNING *`,
    [sceneId, defaultBadgePlacement, 'extra-large'],
  );
  return rows[0];
}
