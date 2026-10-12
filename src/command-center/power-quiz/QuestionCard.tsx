import React from 'react';
import { PowerQuizQuestion } from '../../lib/playys/powerQuiz';
import { OptionEditor } from './OptionEditor';

interface QuestionCardProps {
  question: PowerQuizQuestion;
  index: number;
  total: number;
  onText: (patch: Partial<Pick<PowerQuizQuestion, 'question' | 'subtitle'>>) => void;
  onLabel: (optionIndex: number, label: string) => void;
  onIcon: (optionIndex: number, icon: string) => void;
  onWeight: (optionIndex: number, slug: string, weight: number) => void;
}

const textInput = 'w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900';

/** One quiz question: its title, subtitle and the answers. */
export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  onText,
  onLabel,
  onIcon,
  onWeight,
}) => (
  <div className="bg-white border border-gray-200 p-5 rounded-2xl space-y-4">
    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
      <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
        Question {index + 1} of {total}
      </span>
      <span className="text-xs text-gray-500 font-mono">ID: q_{index + 1}</span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Question Title</label>
        <input
          type="text"
          value={question.question}
          onChange={(e) => onText({ question: e.target.value })}
          className={textInput}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Subtitle / Instruction</label>
        <input
          type="text"
          value={question.subtitle || ''}
          onChange={(e) => onText({ subtitle: e.target.value })}
          className={textInput}
        />
      </div>
    </div>

    <div className="space-y-3 pt-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Options ({question.options.length})
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, optionIndex) => (
          <OptionEditor
            key={option.id || optionIndex}
            option={option}
            letter={String.fromCharCode(65 + optionIndex)}
            onLabel={(label) => onLabel(optionIndex, label)}
            onIcon={(icon) => onIcon(optionIndex, icon)}
            onWeight={(slug, weight) => onWeight(optionIndex, slug, weight)}
          />
        ))}
      </div>
    </div>
  </div>
);
