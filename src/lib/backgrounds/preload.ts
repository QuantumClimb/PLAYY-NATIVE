import { SceneBackgroundSetting } from './types';

// Kept so the browser does not throw the downloaded files away
const kept: (HTMLImageElement | HTMLVideoElement)[] = [];
const started = new Set<string>();

/** Starts downloading every scene's background (pictures and videos) so each page shows it at once. */
export function preloadSceneMedia(scenes: Record<string, SceneBackgroundSetting>): void {
  for (const scene of Object.values(scenes)) {
    const picture = scene.bgType === 'video' ? scene.fallbackMediaUrl : (scene.mediaUrl ?? scene.fallbackMediaUrl);
    if (picture && !started.has(picture)) {
      started.add(picture);
      const img = new Image();
      img.decoding = 'async';
      img.src = picture;
      kept.push(img);
    }
    if (scene.bgType === 'video' && scene.mediaUrl && !started.has(scene.mediaUrl)) {
      started.add(scene.mediaUrl);
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.src = scene.mediaUrl;
      kept.push(video);
    }
  }
}
