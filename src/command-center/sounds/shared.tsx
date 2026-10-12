import React from 'react';
import { SoundSettings } from '../../lib/sfx/settings';

/** How a section of the Sounds tab changes the settings being edited. */
export type SoundsUpdate = (change: (current: SoundSettings) => SoundSettings) => void;

interface VolumeSliderProps {
  label: string;
  value: number;
  onChange: (volume: number) => void;
}

/** A labelled 0 to 100% slider. */
export const VolumeSlider: React.FC<VolumeSliderProps> = ({ label, value, onChange }) => (
  <label className="flex items-center gap-4 text-sm">
    <span className="w-32 cc-muted">{label}</span>
    <input
      type="range"
      min={0}
      max={1}
      step={0.05}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 accent-indigo-600"
    />
    <span className="w-10 text-right tabular-nums">{Math.round(value * 100)}%</span>
  </label>
);

/** What is wrong with a chosen audio file, or null when it can be used. */
export function audioFileProblem(file: File, maxMegabytes: number, what: string): string | null {
  if (!/^audio\//.test(file.type)) return 'Choose an audio file (MP3, WAV, OGG or M4A).';
  if (file.size > maxMegabytes * 1024 * 1024) return `Keep ${what} under ${maxMegabytes} MB.`;
  return null;
}

/** "my song.mp3" becomes "my song", cut to fit a name field. */
export const nameFromFile = (file: File, maxLength: number): string =>
  file.name.replace(/\.[^.]+$/, '').slice(0, maxLength);
