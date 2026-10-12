import React from 'react';
import { CardStep } from './CardStep';
import { ColorsStep } from './ColorsStep';
import { DetailsStep } from './DetailsStep';
import { HeadStep } from './HeadStep';
import { PoseStep } from './PoseStep';
import { PowerStep } from './PowerStep';
import { PreviewStep } from './PreviewStep';
import { QuizStep } from './QuizStep';
import { ShareStep } from './ShareStep';
import type { StepProps } from './types';
import { WorldStep } from './WorldStep';
import type { StepId } from '../flow/steps';

/** The content of each page. */
export const STEP_CONTENT: Record<StepId, React.FC<StepProps>> = {
  head: HeadStep,
  pose: PoseStep,
  colors: ColorsStep,
  quiz: QuizStep,
  power: PowerStep,
  world: WorldStep,
  details: DetailsStep,
  preview: PreviewStep,
  card: CardStep,
  complete: ShareStep,
};
