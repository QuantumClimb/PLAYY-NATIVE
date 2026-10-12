import type { PlayyConfiguration } from './types';
import { BASE_STATS, GeneratedCard } from './cardTypes';
import { calculateArchetype } from './archetypes';

/** The trump card for a finished character. */
export function makeCard(config: PlayyConfiguration): GeneratedCard {
  const stats = { ...BASE_STATS };
  return {
    id: Math.random().toString(36).substring(2, 9),
    config,
    stats,
    archetype: calculateArchetype(stats),
    createdAt: new Date().toISOString(),
  };
}
