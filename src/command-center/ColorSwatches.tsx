import React from 'react';

interface ColorSwatchesProps {
  value: string;
  presets: string[];
  onChange: (color: string) => void;
}

/** A row of preset color dots and a free color picker. */
export const ColorSwatches: React.FC<ColorSwatchesProps> = ({ value, presets, onChange }) => (
  <div className="flex items-center gap-1">
    {presets.map((color) => (
      <button
        key={color}
        type="button"
        onClick={() => onChange(color)}
        aria-label={color}
        className={`w-6 h-6 rounded-full border-2 ${value.toLowerCase() === color ? 'border-gray-900' : 'border-transparent'}`}
        style={{ background: color }}
      />
    ))}
    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 bg-transparent" />
  </div>
);
