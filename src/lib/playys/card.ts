import type { PlayyConfiguration } from './types';
import { GeneratedCard } from './cardTypes';
import { PowerQuizQuestion } from './powerQuiz';
import { makeSerial } from './serial';
import { archetypeFor, computeStats } from './stats';

/** The trump card for a finished character, with stats worked out from the quiz answers. */
export function makeCard(config: PlayyConfiguration, questions: PowerQuizQuestion[], answers: number[]): GeneratedCard {
  const stats = computeStats(questions, answers, config.symbol);
  return {
    id: makeSerial(),
    config,
    stats,
    archetype: archetypeFor(stats, config.symbol),
    createdAt: new Date().toISOString(),
  };
}
