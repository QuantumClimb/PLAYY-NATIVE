export type SceneId =
  | 'intro'
  | 'head'
  | 'body'
  | 'symbol'
  | 'world'
  | 'name'
  | 'quiz'
  | 'review'
  | 'celebrate';

export type BackgroundType = 'default' | 'image' | 'video';
export type BackgroundFit = 'cover' | 'contain';
export type BackgroundPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right';

export type BadgePlacement =
  | 'below-start-button'
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'hidden';

export type StartButtonPlacement =
  | 'right-center'
  | 'center'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-right';

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

export const ALL_SCENES: SceneDefinition[] = [
  { id: 'intro', label: 'Intro & Start Screen', description: 'Kiosk idle loop and TAP TO START screen' },
  { id: 'head', label: 'Step 1: Choose Head', description: 'First step in character creation' },
  { id: 'body', label: 'Step 2: Pose & Movement', description: 'Body pose selection step' },
  { id: 'symbol', label: 'Step 3: Power Symbol', description: 'Power symbol selection step' },
  { id: 'world', label: 'Step 4: World & Environment', description: 'Environment selection step' },
  { id: 'name', label: 'Step 5: Creator Name Input', description: 'Keyboard name entry screen' },
  { id: 'quiz', label: 'Step 6: Personality Quiz', description: '3-question stats questionnaire' },
  { id: 'review', label: 'Step 7: Card Review & Print', description: 'Trump card review screen' },
  { id: 'celebrate', label: 'Celebration & Completion Screen', description: 'Printing complete celebration screen' },
];
