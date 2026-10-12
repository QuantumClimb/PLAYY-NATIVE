import React from 'react';
import type { StepProps } from './types';

/** A power-up question: a row of answer cards. Tapping one moves straight on. */
export const QuizStep: React.FC<StepProps> = ({ flow }) => (
  <div className="quiz-panel">
    <div className="quiz-options">
      {flow.quiz.question?.options.map((option, i) => (
        <button
          key={option.id || i}
          type="button"
          data-sfx="answer"
          onClick={() => flow.answerQuiz(i)}
          className="quiz-card"
        >
          <div className="quiz-card-art">{option.icon && <span>{option.icon}</span>}</div>
          <div className="quiz-card-label">{option.label}</div>
        </button>
      ))}
    </div>
  </div>
);
