import React from 'react';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/** A labelled slider with its current value on the right. */
export const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step, disabled, onChange }) => (
  <label className="flex items-center gap-3 text-sm">
    <span className="w-40">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1"
    />
    <span className="w-10 text-right">{value}</span>
  </label>
);
