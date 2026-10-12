import type { PowerQuizOption, PowerQuizQuestion } from '../../lib/playys/powerQuiz';

/** Each function returns a changed copy of the questions; the input is never modified. */

export function updateQuestion(
  questions: PowerQuizQuestion[],
  questionIndex: number,
  patch: Partial<Pick<PowerQuizQuestion, 'question' | 'subtitle'>>,
): PowerQuizQuestion[] {
  return questions.map((q, i) => (i === questionIndex ? { ...q, ...patch } : q));
}

export function updateOption(
  questions: PowerQuizQuestion[],
  questionIndex: number,
  optionIndex: number,
  patch: Partial<Pick<PowerQuizOption, 'label' | 'icon'>>,
): PowerQuizQuestion[] {
  return questions.map((q, i) =>
    i === questionIndex ? { ...q, options: q.options.map((o, j) => (j === optionIndex ? { ...o, ...patch } : o)) } : q,
  );
}

/** Sets how much an answer leans toward a power. Zero removes the power from the answer. */
export function setSymbolWeight(
  questions: PowerQuizQuestion[],
  questionIndex: number,
  optionIndex: number,
  slug: string,
  weight: number,
): PowerQuizQuestion[] {
  return questions.map((q, i) => {
    if (i !== questionIndex) return q;
    return {
      ...q,
      options: q.options.map((o, j) => {
        if (j !== optionIndex) return o;
        const { [slug]: _removed, ...rest } = o.symbolWeights ?? {};
        return { ...o, symbolWeights: weight > 0 ? { ...rest, [slug]: weight } : rest };
      }),
    };
  });
}
