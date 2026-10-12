import { CharacterStats, PersonalityArchetype } from './cardTypes';
import { calculateArchetype } from './archetypes';
import { PowerQuizQuestion } from './powerQuiz';

type StatName = keyof CharacterStats;

/** Every power is a mix of stats that adds up to 1. */
const SYMBOL_STATS: Record<string, Partial<Record<StatName, number>>> = {
  'golden-crown': { power: 0.6, courage: 0.4 },
  'shining-star': { courage: 0.6, energy: 0.4 },
  'thunder-zap': { speed: 0.7, power: 0.3 },
  'fire-spark': { energy: 0.7, speed: 0.3 },
  'crescent-moon': { intelligence: 0.7, energy: 0.3 },
  'puffy-cloud': { intelligence: 0.6, courage: 0.4 },
  'warm-heart': { courage: 0.6, intelligence: 0.4 },
  'puppy-paw': { courage: 0.5, energy: 0.5 },
};

/** Older saved quizzes use these short names for the same powers. */
const SYMBOL_ALIASES: Record<string, string> = {
  star: 'shining-star',
  cloud: 'puffy-cloud',
  heart: 'warm-heart',
  lightning: 'thunder-zap',
  crown: 'golden-crown',
};

const STAT_NAMES: StatName[] = ['power', 'speed', 'intelligence', 'energy', 'courage'];
const POINTS_PER_ANSWER = 10;
const AVERAGE_STAT = 58;
const SPREAD = 13;
const MAIN_BONUS = 6;
const SECOND_BONUS = 3;
export const MIN_STAT = 35;
export const MAX_STAT = 98;

const emptyPoints = (): CharacterStats => ({ power: 0, speed: 0, intelligence: 0, energy: 0, courage: 0 });
const symbolKey = (slug: string) => SYMBOL_ALIASES[slug] ?? slug;

/** A power's stats, biggest share first. Powers that are not in the table count as an even mix. */
function mixOf(slug: string): [StatName, number][] {
  const mix = SYMBOL_STATS[symbolKey(slug)];
  if (!mix) return STAT_NAMES.map((stat) => [stat, 1 / STAT_NAMES.length]);
  return (Object.entries(mix) as [StatName, number][]).sort((a, b) => b[1] - a[1]);
}

/** The stat points one answer is worth: 10 points shared between its powers, each power spread over its stats. */
function pointsOfOption(weights: Record<string, number>): CharacterStats {
  const points = emptyPoints();
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return points;
  for (const [slug, weight] of Object.entries(weights)) {
    for (const [stat, share] of mixOf(slug)) points[stat] += ((POINTS_PER_ANSWER * weight) / total) * share;
  }
  return points;
}

/** The average and spread of each stat over every possible set of answers, worked out from the questions themselves. */
function calibrationOf(questions: PowerQuizQuestion[]) {
  const mean = emptyPoints();
  const variance = emptyPoints();
  for (const question of questions) {
    if (question.options.length === 0) continue;
    const options = question.options.map((option) => pointsOfOption(option.symbolWeights ?? {}));
    for (const stat of STAT_NAMES) {
      const average = options.reduce((sum, p) => sum + p[stat], 0) / options.length;
      mean[stat] += average;
      variance[stat] += options.reduce((sum, p) => sum + (p[stat] - average) ** 2, 0) / options.length;
    }
  }
  const spread = emptyPoints();
  for (const stat of STAT_NAMES) spread[stat] = Math.sqrt(variance[stat]);
  return { mean, spread };
}

/** The card's five stats for these answers. The same answers always give the same numbers. */
export function computeStats(questions: PowerQuizQuestion[], answers: number[], awardedPower: string): CharacterStats {
  const points = emptyPoints();
  answers.forEach((optionIndex, questionIndex) => {
    const option = questions[questionIndex]?.options[optionIndex];
    if (!option) return;
    const answerPoints = pointsOfOption(option.symbolWeights ?? {});
    for (const stat of STAT_NAMES) points[stat] += answerPoints[stat];
  });

  const { mean, spread } = calibrationOf(questions);
  const [main, second] = mixOf(awardedPower);
  const bonus: Partial<Record<StatName, number>> = { [main[0]]: MAIN_BONUS };
  if (second) bonus[second[0]] = SECOND_BONUS;

  const stats = emptyPoints();
  for (const stat of STAT_NAMES) {
    const z = spread[stat] > 0 ? (points[stat] - mean[stat]) / spread[stat] : 0;
    const value = Math.round(AVERAGE_STAT + SPREAD * z + (bonus[stat] ?? 0));
    stats[stat] = Math.min(MAX_STAT, Math.max(MIN_STAT, value));
  }
  return stats;
}

/** The highest stat. A tie goes to the awarded power's main stat, then to the order power, speed, intelligence, energy, courage. */
export function topStat(stats: CharacterStats, awardedPower: string): StatName {
  const highest = Math.max(...STAT_NAMES.map((stat) => stats[stat]));
  const tied = STAT_NAMES.filter((stat) => stats[stat] === highest);
  const preferred = mixOf(awardedPower)[0][0];
  return tied.includes(preferred) ? preferred : tied[0];
}

export function rarityFor(stats: CharacterStats): PersonalityArchetype['rarity'] {
  const peak = Math.max(...STAT_NAMES.map((stat) => stats[stat]));
  if (peak >= 88) return 'Legendary';
  if (peak >= 78) return 'Epic';
  return 'Rare';
}

/** The character type, with the rarity that goes with this card's strongest stat. */
export function archetypeFor(stats: CharacterStats, awardedPower: string): PersonalityArchetype {
  const top = topStat(stats, awardedPower);
  const archetype = calculateArchetype({ ...emptyPoints(), [top]: 1 });
  return { ...archetype, rarity: rarityFor(stats) };
}
