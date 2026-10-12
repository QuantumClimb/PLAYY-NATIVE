import { useState } from 'react';
import { PowerQuizQuestion } from '../../lib/playys/powerQuiz';

/** The visitor's answers to the power-up questions so far (the index of the answer chosen for each question). */
export function usePowerQuiz(questions: PowerQuizQuestion[]) {
  const [answers, setAnswers] = useState<number[]>([]);

  return {
    answers,
    /** Which question is showing (counting from 0) */
    index: answers.length,
    question: questions[answers.length],
    total: questions.length,
    /** Adds an answer. Returns every answer so far, and whether that was the last question. */
    answer: (optionIndex: number) => {
      const next = [...answers, optionIndex];
      setAnswers(next);
      return { answers: next, finished: next.length >= questions.length };
    },
    /** Takes back the last answer. Returns false when there was none. */
    undo: (): boolean => {
      if (answers.length === 0) return false;
      setAnswers(answers.slice(0, -1));
      return true;
    },
  };
}
