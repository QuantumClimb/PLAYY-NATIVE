import type {
  BackgroundFit,
  BackgroundPosition,
  BackgroundType,
  BadgePlacement,
  IntroBadgeGap,
  IntroButtonSize,
  IntroFloatAnimation,
  SceneBackgroundSetting,
  StartButtonPlacement,
} from '../../lib/backgrounds/types';

/** Everything the scene editor changes for one scene. */
export interface SceneForm {
  bgType: BackgroundType;
  mediaId: string | null;
  fallbackMediaId: string | null;
  fit: BackgroundFit;
  position: BackgroundPosition;
  overlayColor: string;
  overlayOpacity: number;
  badgePlacement: BadgePlacement;
  startButtonPlacement: StartButtonPlacement;
  startButtonSize: IntroButtonSize;
  badgeGap: IntroBadgeGap;
  floatAnimation: IntroFloatAnimation;
}

export const DEFAULT_SCENE_FORM: SceneForm = {
  bgType: 'default',
  mediaId: null,
  fallbackMediaId: null,
  fit: 'cover',
  position: 'center',
  overlayColor: '#000000',
  overlayOpacity: 0,
  badgePlacement: 'below-start-button',
  startButtonPlacement: 'right-center',
  startButtonSize: 'extra-large',
  badgeGap: 'comfortable',
  floatAnimation: 'gentle',
};

/** The form for a scene as saved; anything missing falls back to the default. */
export function formFromScene(scene: SceneBackgroundSetting | undefined): SceneForm {
  if (!scene) return DEFAULT_SCENE_FORM;
  const d = DEFAULT_SCENE_FORM;
  return {
    bgType: scene.bgType || d.bgType,
    mediaId: scene.mediaId || null,
    fallbackMediaId: scene.fallbackMediaId || null,
    fit: scene.fit || d.fit,
    position: scene.position || d.position,
    overlayColor: scene.overlayColor || d.overlayColor,
    overlayOpacity: scene.overlayOpacity ?? d.overlayOpacity,
    badgePlacement: scene.badgePlacement || d.badgePlacement,
    startButtonPlacement: scene.startButtonPlacement || d.startButtonPlacement,
    startButtonSize: scene.startButtonSize || d.startButtonSize,
    badgeGap: scene.badgeGap || d.badgeGap,
    floatAnimation: scene.floatAnimation || d.floatAnimation,
  };
}

const MEGABYTE = 1024 * 1024;
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 30;

/** What is wrong with a file chosen for a scene, or null when it can be uploaded. */
export function mediaFileProblem(file: File, target: 'main' | 'fallback'): string | null {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');
  if (target === 'fallback' && !isImage) return 'Fallback file must be an image (PNG, JPG, WebP).';
  if (!isImage && !isVideo) return 'Unsupported file type. Please upload PNG, JPG, WebP images or MP4, WebM videos.';
  const limit = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
  if (file.size > limit * MEGABYTE) {
    return `File "${file.name}" (${(file.size / MEGABYTE).toFixed(1)}MB) exceeds maximum limit of ${limit}MB for ${isVideo ? 'video' : 'image'}.`;
  }
  return null;
}

type Option<T> = { id: T; label: string };

export const POSITION_OPTIONS: Option<BackgroundPosition>[] = [
  { id: 'top left', label: 'Top Left' },
  { id: 'top', label: 'Top' },
  { id: 'top right', label: 'Top Right' },
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
  { id: 'bottom left', label: 'Bottom Left' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'bottom right', label: 'Bottom Right' },
];

export const BADGE_PLACEMENT_OPTIONS: Option<BadgePlacement>[] = [
  { id: 'below-start-button', label: 'Below Start Button (Recommended)' },
  { id: 'top-center', label: 'Top Center' },
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'hidden', label: 'Hidden' },
];

export const START_BUTTON_PLACEMENT_OPTIONS: Option<StartButtonPlacement>[] = [
  { id: 'right-center', label: 'Right Center (Recommended)' },
  { id: 'center', label: 'Center' },
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'top-right', label: 'Top Right' },
];

export const START_BUTTON_SIZE_OPTIONS: Option<IntroButtonSize>[] = [
  { id: 'extra-large', label: 'Extra Large (Recommended)' },
  { id: 'large', label: 'Large' },
];

export const BADGE_GAP_OPTIONS: Option<IntroBadgeGap>[] = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'relaxed', label: 'Relaxed' },
];

export const FLOAT_ANIMATION_OPTIONS: Option<IntroFloatAnimation>[] = [
  { id: 'gentle', label: 'Gentle Float (Recommended)' },
  { id: 'slow', label: 'Slow Float' },
  { id: 'none', label: 'Off' },
];
