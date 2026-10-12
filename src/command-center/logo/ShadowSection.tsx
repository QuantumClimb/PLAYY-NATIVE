import React from 'react';
import { BrandShadow, shadowFilter } from '../../lib/brand/brand';
import { SliderRow } from './SliderRow';

interface ShadowSectionProps {
  logoSrc: string;
  shadow: BrandShadow;
  onChange: (shadow: BrandShadow) => void;
}

const SLIDERS = [
  ['blur', 'Blur (px)', 0, 10, 0.5],
  ['offsetY', 'Distance down (px)', 0, 8, 0.5],
  ['opacity', 'Strength', 0, 1, 0.05],
] as const;

/** The tight drop shadow the logo has inside the app, with a preview on light and dark scenery. */
export const ShadowSection: React.FC<ShadowSectionProps> = ({ logoSrc, shadow, onChange }) => (
  <section className="rounded-xl border border-gray-300 p-4 space-y-3">
    <div className="font-semibold">In the app: tight drop shadow</div>
    <div className="grid md:grid-cols-2 gap-4">
      <div
        className="rounded-2xl p-6 flex items-center justify-center h-44"
        style={{ background: 'linear-gradient(#5db7ee, #9ad86c)' }}
      >
        <img
          src={logoSrc}
          alt="Logo on scenery"
          className="h-28 w-auto max-w-full object-contain"
          style={{ filter: shadowFilter(shadow) }}
        />
      </div>
      <div className="rounded-2xl p-6 flex items-center justify-center h-44 bg-gradient-to-b from-indigo-950 to-purple-950">
        <img
          src={logoSrc}
          alt="Logo on dark"
          className="h-14 w-auto max-w-full object-contain"
          style={{ filter: shadowFilter(shadow) }}
        />
      </div>
    </div>
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={shadow.enabled}
        onChange={(e) => onChange({ ...shadow, enabled: e.target.checked })}
      />
      Drop shadow
    </label>
    {SLIDERS.map(([key, label, min, max, step]) => (
      <SliderRow
        key={key}
        label={label}
        value={shadow[key]}
        min={min}
        max={max}
        step={step}
        disabled={!shadow.enabled}
        onChange={(value) => onChange({ ...shadow, [key]: value })}
      />
    ))}
  </section>
);
