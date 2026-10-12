export type SceneId = 'intro' | 'head' | 'body' | 'symbol' | 'world' | 'name' | 'quiz' | 'review' | 'celebrate';

export type BackgroundType = 'default' | 'image' | 'video';
export type BackgroundFit = 'cover' | 'contain';
export type BackgroundPosition =
  'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right';

export type BadgePlacement =
  | 'below-start-button'
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'hidden';

export type StartButtonPlacement = 'right-center' | 'center' | 'bottom-center' | 'bottom-right' | 'top-right';

export type IntroButtonSize = 'large' | 'extra-large';
export type IntroBadgeGap = 'comfortable' | 'relaxed';
export type IntroFloatAnimation = 'none' | 'gentle' | 'slow';

export interface SceneBackgroundSetting {
  sceneId: SceneId;
  bgType: BackgroundType;
  mediaId?: string | null;
  fallbackMediaId?: string | null;
  mediaUrl?: string | null;
  fallbackMediaUrl?: string | null;
  fit: BackgroundFit;
  position: BackgroundPosition;
  overlayColor: string;
  overlayOpacity: number;
  badgePlacement?: BadgePlacement;
  startButtonPlacement?: StartButtonPlacement;
  startButtonSize?: IntroButtonSize;
  badgeGap?: IntroBadgeGap;
  floatAnimation?: IntroFloatAnimation;
  updatedAt?: string;
}

export interface SceneDefinition {
  id: SceneId;
  label: string;
  description: string;
}

/** The kiosk screens whose background can be set. The ids are the database keys; several pages share one scene. */
export const ALL_SCENES: SceneDefinition[] = [
  { id: 'intro', label: 'Intro and Start screen', description: 'The looping intro and Tap to Start' },
  { id: 'head', label: 'Face page', description: 'Choose your head' },
  { id: 'body', label: 'Pose page', description: 'Choose your pose' },
  { id: 'symbol', label: 'Colours and Power pages', description: 'Choose your colours, and the power awarded' },
  { id: 'world', label: 'Background page', description: 'Choose your background' },
  { id: 'name', label: 'Name, phone and email pages', description: 'The touch keyboard screens' },
  { id: 'quiz', label: 'Power-up questions', description: 'The personality questions' },
  { id: 'review', label: 'Preview and Trump card pages', description: 'The coloring pages and the card' },
  { id: 'celebrate', label: 'Share and Success pages', description: 'The last two screens' },
];
