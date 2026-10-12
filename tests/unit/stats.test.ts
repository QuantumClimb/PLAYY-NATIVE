import { describe, expect, it } from 'vitest';
import { DEFAULT_POWER_QUIZ_QUESTIONS, PowerQuizQuestion, calculatePowerSymbol } from '../../src/lib/playys/powerQuiz';
import { MAX_STAT, MIN_STAT, archetypeFor, computeStats, rarityFor, topStat } from '../../src/lib/playys/stats';

const questions = DEFAULT_POWER_QUIZ_QUESTIONS;

/** Every possible set of answers to these questions. */
function everyAnswerSet(qs: PowerQuizQuestion[]): number[][] {
  return qs.reduce<number[][]>((sets, q) => sets.flatMap((set) => q.options.map((_, i) => [...set, i])), [[]]);
}

function cardFor(qs: PowerQuizQuestion[], answers: number[]) {
  const power = calculatePowerSymbol(qs, answers);
  const stats = computeStats(qs, answers, power);
  return { power, stats, archetype: archetypeFor(stats, power) };
}

describe('stats from the quiz', () => {
  it('give the same numbers for the same answers', () => {
    const answers = [0, 1, 2, 3, 0];
    expect(cardFor(questions, answers)).toEqual(cardFor(questions, answers));
  });

  it('make a Courage card when every answer leans to kindness', () => {
    const kind = questions.map((q) => {
      const lean = q.options.map((o) => (o.symbolWeights['warm-heart'] ?? 0) + (o.symbolWeights['puppy-paw'] ?? 0));
      return lean.indexOf(Math.max(...lean));
    });
    const { power, stats, archetype } = cardFor(questions, kind);
    expect(['warm-heart', 'puppy-paw']).toContain(power);
    expect(topStat(stats, power)).toBe('courage');
    expect(archetype.id).toBe('nature-guardian');
  });

  it('keep every stat between 35 and 98', () => {
    for (const answers of everyAnswerSet(questions)) {
      const { stats } = cardFor(questions, answers);
      for (const value of Object.values(stats)) {
        expect(value).toBeGreaterThanOrEqual(MIN_STAT);
        expect(value).toBeLessThanOrEqual(MAX_STAT);
      }
    }
  });

  it('let every character type come up, none rarer than 8%', () => {
    const sets = everyAnswerSet(questions);
    const counts: Record<string, number> = {};
    for (const answers of sets) {
      const id = cardFor(questions, answers).archetype.id;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    expect(Object.keys(counts)).toHaveLength(5);
    for (const count of Object.values(counts)) expect(count / sets.length).toBeGreaterThan(0.08);
  });

  it('stay balanced for a quiz that leans heavily on one power', () => {
    const lopsided: PowerQuizQuestion[] = [1, 2, 3, 4].map((id) => ({
      id,
      question: `Question ${id}`,
      options: [
        { id: `${id}a`, label: 'A', symbolWeights: { 'warm-heart': 3, 'puppy-paw': 2 } },
        { id: `${id}b`, label: 'B', symbolWeights: { 'warm-heart': 3 } },
        { id: `${id}c`, label: 'C', symbolWeights: { 'thunder-zap': 3 } },
      ],
    }));
    for (const answers of everyAnswerSet(lopsided)) {
      const { stats } = cardFor(lopsided, answers);
      for (const value of Object.values(stats)) {
        expect(value).toBeGreaterThanOrEqual(MIN_STAT);
        expect(value).toBeLessThanOrEqual(MAX_STAT);
      }
    }
  });

  it('copes with a quiz that has nothing in it', () => {
    expect(computeStats([], [], 'warm-heart')).toEqual({
      power: 58,
      speed: 58,
      intelligence: 61,
      energy: 58,
      courage: 64,
    });
  });
});

describe('top stat and rarity', () => {
  const flat = { power: 50, speed: 50, intelligence: 50, energy: 50, courage: 50 };

  it('settles a tie with the awarded power, then a fixed order', () => {
    expect(topStat(flat, 'thunder-zap')).toBe('speed');
    expect(topStat(flat, 'unknown')).toBe('power');
  });

  it('rates a card by its strongest stat', () => {
    expect(rarityFor({ ...flat, courage: 90 })).toBe('Legendary');
    expect(rarityFor({ ...flat, courage: 80 })).toBe('Epic');
    expect(rarityFor(flat)).toBe('Rare');
  });
});
