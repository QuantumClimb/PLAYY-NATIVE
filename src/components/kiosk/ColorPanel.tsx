import React, { useId } from 'react';
import { deriveColor, normalizeColor } from '../../lib/assets/svgParts';

// A flat-topped hexagon with softly rounded corners (the stroke is drawn in the swatch's own color)
const HEX = 'M26 8H74L96 50L74 92H26L4 50Z';

interface HexSwatchProps {
  color: string;
  selected: boolean;
  label: string;
  onPick: () => void;
}

/** One glossy hexagon swatch. The selected one is a little larger, ringed in gold, with a green check. */
export const HexSwatch: React.FC<HexSwatchProps> = ({ color, selected, label, onPick }) => {
  const id = useId();
  const base = normalizeColor(color) ?? '#888888';
  return (
    <button
      type="button"
      className={`hex-swatch ${selected ? 'is-selected' : ''}`}
      aria-label={label}
      aria-pressed={selected}
      data-sfx="select"
      onClick={onPick}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={deriveColor(base, 14)} />
            <stop offset=".55" stopColor={base} />
            <stop offset="1" stopColor={deriveColor(base, -14)} />
          </linearGradient>
        </defs>
        {selected && <path d={HEX} fill="none" stroke="#ffc928" strokeWidth="13" strokeLinejoin="round" />}
        {selected && <path d={HEX} fill="none" stroke="#fff6c8" strokeWidth="5" strokeLinejoin="round" />}
        <path d={HEX} fill={`url(#${id}-g)`} stroke={deriveColor(base, -22)} strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 17H62L48 40H22Z" fill="#fff" opacity=".3" />
      </svg>
      {selected && (
        <span className="hex-check" aria-hidden="true">
          ✓
        </span>
      )}
    </button>
  );
};

interface ColorPanelProps {
  label: string;
  /** Which colored tab sits on the panel's top edge */
  accent: 'yellow' | 'purple';
  /** The color currently showing for this part (undefined = the character's default) */
  value?: string;
  swatches: string[];
  onPick: (color: string) => void;
}

/** A cream panel with a colored name tab and the swatches in rows of four (the last row centered). */
export const ColorPanel: React.FC<ColorPanelProps> = ({ label, accent, value, swatches, onPick }) => {
  const rows: string[][] = [];
  for (let i = 0; i < swatches.length; i += 4) rows.push(swatches.slice(i, i + 4));
  const current = normalizeColor(value);
  return (
    <div className="color-panel">
      <div className={`color-panel-label is-${accent}`}>{label}</div>
      <div className="color-swatches">
        {rows.map((row, r) => (
          <div className="color-row" key={r}>
            {row.map((c) => (
              <HexSwatch
                key={c}
                color={c}
                label={`${label} ${c}`}
                selected={current === normalizeColor(c)}
                onPick={() => onPick(c)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Simple / Advanced switch. */
export const ColorModeToggle: React.FC<{
  mode: 'simple' | 'advanced';
  onChange: (m: 'simple' | 'advanced') => void;
}> = ({ mode, onChange }) => (
  <div className="color-mode-toggle" role="group" aria-label="Colour mode">
    {(['simple', 'advanced'] as const).map((m) => (
      <button
        key={m}
        type="button"
        data-sfx="select"
        aria-pressed={mode === m}
        className={mode === m ? 'is-active' : ''}
        onClick={() => onChange(m)}
      >
        {m === 'simple' ? 'Simple' : 'Advanced'}
      </button>
    ))}
  </div>
);
