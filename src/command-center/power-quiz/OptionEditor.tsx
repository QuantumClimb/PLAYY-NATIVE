import React from 'react';
import { POWER_SLUGS, PowerQuizOption, SYMBOL_MAP } from '../../lib/playys/powerQuiz';

interface OptionEditorProps {
  option: PowerQuizOption;
  letter: string;
  onLabel: (label: string) => void;
  onIcon: (icon: string) => void;
  onWeight: (slug: string, weight: number) => void;
}

const input = 'bg-gray-50 border border-gray-300 rounded text-sm text-gray-900';

/** One answer: its icon, its text and how strongly it leans toward each power. */
export const OptionEditor: React.FC<OptionEditorProps> = ({ option, letter, onLabel, onIcon, onWeight }) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center">
        {letter}
      </span>
      <input
        type="text"
        value={option.icon || ''}
        onChange={(e) => onIcon(e.target.value)}
        placeholder="Icon"
        className={`w-12 text-center px-2 py-1 ${input}`}
      />
      <input
        type="text"
        value={option.label}
        onChange={(e) => onLabel(e.target.value)}
        placeholder="Option Label"
        className={`flex-1 px-3 py-1 ${input}`}
      />
    </div>

    <div className="space-y-1 text-xs">
      <div className="text-gray-500 font-semibold">Attribute / Symbol Weights:</div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        {POWER_SLUGS.map((slug) => {
          const info = SYMBOL_MAP[slug];
          return (
            <div
              key={slug}
              className="flex items-center justify-between bg-white px-2 py-1 rounded border border-gray-200"
            >
              <span className="text-[11px] text-gray-600 truncate">
                {info.icon} {info.name}
              </span>
              <input
                type="number"
                min="0"
                max="10"
                value={option.symbolWeights?.[slug] || 0}
                onChange={(e) => onWeight(slug, parseInt(e.target.value, 10) || 0)}
                className={`w-10 text-center text-xs text-indigo-700 font-semibold ${input}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
