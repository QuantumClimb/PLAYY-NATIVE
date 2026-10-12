import type { SceneId } from '../../lib/backgrounds/types';
import { copy } from '../copy';

export type StepId =
  'head' | 'pose' | 'colors' | 'quiz' | 'power' | 'world' | 'details' | 'preview' | 'card' | 'complete';

/** The pages in the order a visitor sees them. */
const STEP_ORDER: readonly StepId[] = [
  'head',
  'pose',
  'colors',
  'quiz',
  'power',
  'world',
  'details',
  'preview',
  'card',
  'complete',
];

/** What the left side of the page shows: nothing, a head, the character cropped, or the whole scene. */
export type PreviewKind = 'none' | 'head' | 'character' | 'character-with-power' | 'scene' | 'finished-page';

/** What a page's wording can depend on. */
export interface StepContext {
  colorMode: 'simple' | 'advanced';
  /** 0 name, 1 phone, 2 email */
  detailsStep: number;
  /** The power-up question showing, if any */
  question?: { question: string; subtitle?: string };
}

export interface StepDef {
  id: StepId;
  /** Which background set in the command center this page uses */
  scene: SceneId;
  /** The layout class for this page (see the page styles) */
  pageClass: string;
  /** Which of the eight progress tabs is lit */
  stage: number;
  /** The big heading, or null for a page that draws its own (the power award) */
  title: (ctx: StepContext) => string | null;
  subtitle: (ctx: StepContext) => string | null;
  preview: PreviewKind;
  /** Whether the "Pick for Me!" button shows */
  pickForMe: (ctx: StepContext) => boolean;
  /** The right-hand button: its label, or null when the page moves on by itself */
  nextLabel: string | null;
}

const always = () => true;
const never = () => false;

export const STEPS: Record<StepId, StepDef> = {
  head: {
    id: 'head',
    scene: 'head',
    pageClass: 'pick-page',
    stage: 0,
    title: () => copy.head.title,
    subtitle: () => copy.head.subtitle,
    preview: 'head',
    pickForMe: always,
    nextLabel: copy.nav.next,
  },
  pose: {
    id: 'pose',
    scene: 'body',
    pageClass: 'pick-page',
    stage: 1,
    title: () => copy.pose.title,
    subtitle: () => copy.pose.subtitle,
    preview: 'character',
    pickForMe: always,
    nextLabel: copy.nav.next,
  },
  colors: {
    id: 'colors',
    scene: 'symbol',
    pageClass: 'pick-page pick-colors',
    stage: 2,
    title: () => copy.colors.title,
    subtitle: ({ colorMode }) => copy.colors[colorMode],
    preview: 'character',
    pickForMe: always,
    nextLabel: copy.nav.next,
  },
  quiz: {
    id: 'quiz',
    scene: 'quiz',
    pageClass: 'pick-page pick-quiz',
    stage: 3,
    title: ({ question }) => question?.question.toUpperCase() ?? copy.quiz.fallbackTitle,
    subtitle: ({ question }) => question?.subtitle || copy.quiz.fallbackSubtitle,
    preview: 'none',
    pickForMe: always,
    nextLabel: null,
  },
  power: {
    id: 'power',
    scene: 'symbol',
    pageClass: 'pick-page pick-power',
    stage: 4,
    title: () => null,
    subtitle: () => null,
    preview: 'character-with-power',
    pickForMe: never,
    nextLabel: copy.nav.next,
  },
  world: {
    id: 'world',
    scene: 'world',
    pageClass: 'pick-page pick-world',
    stage: 5,
    title: () => copy.world.title,
    subtitle: () => copy.world.subtitle,
    preview: 'scene',
    pickForMe: always,
    nextLabel: copy.nav.next,
  },
  details: {
    id: 'details',
    scene: 'name',
    pageClass: 'pick-page pick-details',
    stage: 6,
    title: ({ detailsStep }) => copy.details.titles[detailsStep],
    subtitle: ({ detailsStep }) => copy.details.subtitles[detailsStep],
    preview: 'finished-page',
    // A fun name only makes sense on the first screen
    pickForMe: ({ detailsStep }) => detailsStep === 0,
    nextLabel: copy.nav.next,
  },
  preview: {
    id: 'preview',
    scene: 'review',
    pageClass: 'pick-page pick-preview',
    stage: 7,
    title: () => copy.preview.title,
    subtitle: () => copy.preview.subtitle,
    preview: 'none',
    pickForMe: never,
    nextLabel: copy.nav.continue,
  },
  card: {
    id: 'card',
    scene: 'review',
    pageClass: 'pick-page pick-trump',
    stage: 7,
    title: () => copy.card.title,
    subtitle: () => copy.card.subtitle,
    preview: 'none',
    pickForMe: never,
    nextLabel: copy.nav.continue,
  },
  complete: {
    id: 'complete',
    scene: 'celebrate',
    pageClass: 'pick-page pick-complete',
    stage: 7,
    title: () => copy.share.title,
    subtitle: () => copy.share.subtitle,
    preview: 'none',
    pickForMe: never,
    nextLabel: copy.nav.share,
  },
};

export const stepAfter = (id: StepId): StepId | undefined => STEP_ORDER[STEP_ORDER.indexOf(id) + 1];
export const stepBefore = (id: StepId): StepId | undefined => STEP_ORDER[STEP_ORDER.indexOf(id) - 1];
