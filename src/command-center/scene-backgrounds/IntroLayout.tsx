import React from 'react';
import {
  BADGE_GAP_OPTIONS,
  BADGE_PLACEMENT_OPTIONS,
  FLOAT_ANIMATION_OPTIONS,
  START_BUTTON_PLACEMENT_OPTIONS,
  START_BUTTON_SIZE_OPTIONS,
  SceneForm,
} from './sceneForm';

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}

function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface IntroLayoutProps {
  form: SceneForm;
  onChange: (change: Partial<SceneForm>) => void;
}

/** Where the Tap to Start button and the badges sit on the intro screen (only for that scene). */
export const IntroLayout: React.FC<IntroLayoutProps> = ({ form, onChange }) => (
  <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Intro screen layout</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SelectField
        label="Intro Badge Position"
        value={form.badgePlacement}
        options={BADGE_PLACEMENT_OPTIONS}
        onChange={(badgePlacement) => onChange({ badgePlacement })}
      />
      <SelectField
        label="Start Button Position"
        value={form.startButtonPlacement}
        options={START_BUTTON_PLACEMENT_OPTIONS}
        onChange={(startButtonPlacement) => onChange({ startButtonPlacement })}
      />
      <SelectField
        label="Start Button Size"
        value={form.startButtonSize}
        options={START_BUTTON_SIZE_OPTIONS}
        onChange={(startButtonSize) => onChange({ startButtonSize })}
      />
      <SelectField
        label="Badge Spacing"
        value={form.badgeGap}
        options={BADGE_GAP_OPTIONS}
        onChange={(badgeGap) => onChange({ badgeGap })}
      />
      <SelectField
        label="Button Float Animation"
        value={form.floatAnimation}
        options={FLOAT_ANIMATION_OPTIONS}
        onChange={(floatAnimation) => onChange({ floatAnimation })}
      />
    </div>
  </div>
);
