import { describe, expect, it } from 'vitest';
import { STEPS, StepContext, StepId, stepAfter, stepBefore } from '../../src/kiosk/flow/steps';

const context: StepContext = { colorMode: 'simple', detailsStep: 0 };

/** Every page in order, found by following "the page after" from the first one. */
const order = (): StepId[] => {
  const pages: StepId[] = ['head'];
  for (let next = stepAfter('head'); next; next = stepAfter(next)) pages.push(next);
  return pages;
};

describe('the pages', () => {
  it('run from the head to the share screen', () => {
    expect(order()).toEqual([
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
    ]);
  });

  it('go back the same way', () => {
    expect(stepBefore('head')).toBeUndefined();
    expect(stepBefore('pose')).toBe('head');
    expect(stepBefore('complete')).toBe('card');
    expect(stepAfter('complete')).toBeUndefined();
  });

  it('each light one of the eight progress tabs, never going backwards', () => {
    const stages = order().map((id) => STEPS[id].stage);
    expect(Math.min(...stages)).toBe(0);
    expect(Math.max(...stages)).toBe(7);
    expect([...stages].sort((a, b) => a - b)).toEqual(stages);
  });

  it('say which id they are', () => {
    for (const id of order()) expect(STEPS[id].id).toBe(id);
  });
});

describe('page wording', () => {
  it('has a title and a line under it for every page but the power award, which draws its own', () => {
    for (const id of order()) {
      const def = STEPS[id];
      if (id === 'power') {
        expect(def.title(context)).toBeNull();
        expect(def.subtitle(context)).toBeNull();
      } else {
        expect(def.title(context)).toBeTruthy();
        expect(def.subtitle(context)).toBeTruthy();
      }
    }
  });

  it('follows the colour mode and the question showing', () => {
    expect(STEPS.colors.subtitle({ ...context, colorMode: 'advanced' })).not.toBe(STEPS.colors.subtitle(context));
    expect(STEPS.colors.subtitle({ ...context, colorMode: 'freeform' })).toMatch(/paint/i);
    expect(STEPS.colors.pickForMe(context)).toBe(true);
    expect(STEPS.colors.pickForMe({ ...context, colorMode: 'freeform' })).toBe(false);
    expect(STEPS.quiz.title({ ...context, question: { question: 'What do you love?' } })).toBe('WHAT DO YOU LOVE?');
    expect(STEPS.details.title({ ...context, detailsStep: 2 })).not.toBe(STEPS.details.title(context));
  });
});

describe('buttons', () => {
  it('shows "Pick for Me!" where a random choice makes sense', () => {
    expect(STEPS.head.pickForMe(context)).toBe(true);
    expect(STEPS.power.pickForMe(context)).toBe(false);
    expect(STEPS.complete.pickForMe(context)).toBe(false);
  });

  it('offers a fun name only on the first of the three typing screens', () => {
    expect(STEPS.details.pickForMe({ ...context, detailsStep: 0 })).toBe(true);
    expect(STEPS.details.pickForMe({ ...context, detailsStep: 1 })).toBe(false);
    expect(STEPS.details.pickForMe({ ...context, detailsStep: 2 })).toBe(false);
  });

  it('has no Next on the questions (an answer moves on by itself) and SHARE on the last page', () => {
    expect(STEPS.quiz.nextLabel).toBeNull();
    expect(STEPS.complete.nextLabel).toBe('SHARE');
    expect(STEPS.preview.nextLabel).toBe('CONTINUE');
  });
});
