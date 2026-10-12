import React from 'react';
import { ICON_REGISTRY } from '../lib/intro/badges';
import { uploadMedia } from '../data/media';

const IMAGE_TYPES = /^image\/(png|jpeg|webp)$/;

/** What an icon value looks like to the person editing it ("Star", "uploaded image", ...). */
export function iconLabel(icon: string): string {
  const [kind, ...rest] = icon.split(':');
  if (kind === 'builtin') return 'original';
  if (kind === 'media') return 'uploaded image';
  return rest.join(':');
}

interface IconPickerProps {
  /** The current icon: `builtin`, `lucide:Star`, `media:<id>` or `emoji:🎨` */
  value: string;
  onChange: (icon: string) => void;
  /** Offers an "Original" choice (the tabs have a drawn icon of their own) */
  allowOriginal?: boolean;
  /** Runs an action with the panel's busy, error and note handling */
  run: (action: () => Promise<void>) => Promise<void>;
}

const choice = (selected: boolean) =>
  `rounded-lg border ${selected ? 'border-teal-400 bg-gray-50' : 'border-gray-300 hover:bg-gray-50'}`;

/** A built-in icon, an uploaded image or an emoji. Used by the intro badges and the progress tabs. */
export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, allowOriginal, run }) => {
  const upload = (file: File) =>
    run(async () => {
      if (!IMAGE_TYPES.test(file.type)) throw new Error('Use a PNG, JPG or WebP image (a transparent PNG works best).');
      onChange(`media:${await uploadMedia(file)}`);
    });

  return (
    <div className="rounded-lg bg-white p-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        {allowOriginal && (
          <button
            type="button"
            onClick={() => onChange('builtin')}
            className={`px-3 py-2 text-sm ${choice(value === 'builtin')}`}
          >
            Original
          </button>
        )}
        {Object.entries(ICON_REGISTRY).map(([name, Icon]) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(`lucide:${name}`)}
            className={`p-2 ${choice(value === `lucide:${name}`)}`}
          >
            <Icon className="w-6 h-6" />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
          Upload image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void upload(file);
            }}
          />
        </label>
        <span className="text-gray-500">or an emoji:</span>
        <input
          maxLength={4}
          placeholder="🎨"
          className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm w-20"
          onChange={(e) => e.target.value.trim() && onChange(`emoji:${e.target.value.trim()}`)}
        />
      </div>
    </div>
  );
};
