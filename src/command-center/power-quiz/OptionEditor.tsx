import React from 'react';
import { mediaUrl, uploadMedia } from '../../data/media';
import { POWER_SLUGS, PowerQuizOption, SYMBOL_MAP } from '../../lib/playys/powerQuiz';

export type IconPatch = Partial<Pick<PowerQuizOption, 'icon' | 'iconKind' | 'iconImage'>>;

interface OptionEditorProps {
  option: PowerQuizOption;
  letter: string;
  onLabel: (label: string) => void;
  onIcon: (patch: IconPatch) => void;
  /** Runs an upload with the panel's busy and error handling */
  run: (action: () => Promise<void>) => Promise<void>;
  onWeight: (slug: string, weight: number) => void;
}

const input = 'bg-gray-50 border border-gray-300 rounded text-sm text-gray-900';
const IMAGE_TYPES = /^image\/(png|svg\+xml)$/;

/** One answer: its icon (an emoji or an uploaded SVG/PNG), its text and how strongly it leans toward each power. */
export const OptionEditor: React.FC<OptionEditorProps> = ({ option, letter, onLabel, onIcon, run, onWeight }) => {
  const kind = option.iconKind ?? 'emoji';
  const upload = (file: File) =>
    run(async () => {
      if (!IMAGE_TYPES.test(file.type)) throw new Error('Use an SVG or PNG image.');
      onIcon({ iconImage: await uploadMedia(file), iconKind: 'image' });
    });

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center">
          {letter}
        </span>
        <input
          type="text"
          value={option.label}
          onChange={(e) => onLabel(e.target.value)}
          placeholder="Option Label"
          className={`flex-1 px-3 py-1 ${input}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden" role="group" aria-label="Icon type">
          {(['emoji', 'image'] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => onIcon({ iconKind: k })}
              className={`px-3 py-1 ${kind === k ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              {k === 'emoji' ? 'Emoji' : 'SVG / PNG'}
            </button>
          ))}
        </div>
        {kind === 'emoji' ? (
          <input
            type="text"
            value={option.icon || ''}
            onChange={(e) => onIcon({ icon: e.target.value })}
            placeholder="Icon"
            className={`w-14 text-center px-2 py-1 ${input}`}
          />
        ) : (
          <>
            {option.iconImage ? (
              <img
                src={mediaUrl(option.iconImage)}
                alt=""
                className="w-10 h-10 object-contain rounded bg-white border border-gray-200"
              />
            ) : (
              <span className="text-gray-500">No image yet</span>
            )}
            <label className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
              {option.iconImage ? 'Replace' : 'Upload'}
              <input
                type="file"
                accept="image/svg+xml,image/png"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) void upload(file);
                }}
              />
            </label>
          </>
        )}
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
};
