import { describe, expect, it } from 'vitest';
import { DEFAULT_POWER_QUIZ_QUESTIONS, calculatePowerSymbol } from '../../src/lib/playys/powerQuiz';

describe('calculatePowerSymbol', () => {
  it('picks the symbol with the most weight across the answers', () => {
    expect(calculatePowerSymbol(DEFAULT_POWER_QUIZ_QUESTIONS, [0, 0, 3, 1, 1])).toBe('warm-heart');
  });

  it('is deterministic', () => {
    const answers = [1, 2, 0, 3, 2];
    expect(calculatePowerSymbol(DEFAULT_POWER_QUIZ_QUESTIONS, answers)).toBe(
      calculatePowerSymbol(DEFAULT_POWER_QUIZ_QUESTIONS, answers),
    );
  });

  it('falls back to a symbol that exists in the library', () => {
    expect(calculatePowerSymbol(DEFAULT_POWER_QUIZ_QUESTIONS, [0, 0, 3, 1, 1], ['heart'])).toBe('heart');
    expect(calculatePowerSymbol(DEFAULT_POWER_QUIZ_QUESTIONS, [0, 0, 3, 1, 1], ['crown', 'moon'])).toBe('crown');
  });

  it('ignores answers that do not exist', () => {
    expect(calculatePowerSymbol(DEFAULT_POWER_QUIZ_QUESTIONS, [99])).toBe('warm-heart');
  });
});
