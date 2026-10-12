import React from 'react';
import { Asset } from '../../api';
import { AssetDraft } from './useAssetDraft';

const SLIDERS = [
  ['faceScale', 'Size', 0.2, 1, 0.01, 0.61],
  ['faceDx', 'Left / right (%)', -30, 30, 0.5, 0],
  ['faceDy', 'Up / down (%)', -30, 30, 0.5, 0],
] as const;

/** Where the shared face sits on a head. */
export const FacePlacementSection: React.FC<{ d: AssetDraft; face?: Asset }> = ({ d, face }) => (
  <div className="rounded-xl border border-gray-300 p-3 space-y-2">
    <div className="text-sm">Face placement {face ? `(using "${face.name}")` : '(upload a face asset to preview)'}</div>
    {SLIDERS.map(([key, label, min, max, step, fallback]) => {
      const value = d.meta[key] ?? fallback;
      return (
        <label key={key} className="flex items-center gap-3 text-xs">
          <span className="w-32">{label}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => d.setMeta({ ...d.meta, [key]: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-12 text-right">{value.toFixed(2)}</span>
        </label>
      );
    })}
  </div>
);
