import { describe, expect, it } from 'vitest';
import { DEFAULT_POWER_QUIZ_QUESTIONS } from '../../src/lib/playys/powerQuiz';
import { setSymbolWeight, updateOption, updateQuestion } from '../../src/command-center/power-quiz/quizEdit';

const questions = DEFAULT_POWER_QUIZ_QUESTIONS;

describe('quiz editing', () => {
  it('changes one question without touching the original', () => {
    const next = updateQuestion(questions, 1, { question: 'New?' });
    expect(next[1].question).toBe('New?');
    expect(next[0]).toBe(questions[0]);
    expect(questions[1].question).not.toBe('New?');
  });

  it('changes one answer', () => {
    const next = updateOption(questions, 0, 2, { label: 'Hello', icon: '🙂' });
    expect(next[0].options[2]).toMatchObject({ label: 'Hello', icon: '🙂' });
    expect(next[0].options[1]).toBe(questions[0].options[1]);
  });

  it('sets, changes and removes a power weight', () => {
    const set = setSymbolWeight(questions, 0, 0, 'thunder-zap', 4);
    expect(set[0].options[0].symbolWeights['thunder-zap']).toBe(4);
    expect(set[0].options[0].symbolWeights['warm-heart']).toBe(2);

    const removed = setSymbolWeight(set, 0, 0, 'thunder-zap', 0);
    expect(removed[0].options[0].symbolWeights).not.toHaveProperty('thunder-zap');
    expect(questions[0].options[0].symbolWeights).not.toHaveProperty('thunder-zap');
  });
});
