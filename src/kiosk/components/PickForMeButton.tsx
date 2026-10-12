import React from 'react';
import { copy } from '../copy';

/** The small blue die on the "Pick for Me!" button. */
const DiceIcon: React.FC = () => (
  <svg className="pick-me-dice" viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <linearGradient id="pick-die" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6aa8ff" />
        <stop offset="1" stopColor="#2755d8" />
      </linearGradient>
    </defs>
    <rect x="5" y="5" width="38" height="38" rx="9" fill="url(#pick-die)" stroke="#173a9e" strokeWidth="2.5" />
    {[
      [16, 16],
      [32, 16],
      [24, 24],
      [16, 32],
      [32, 32],
    ].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.4" fill="#fff" />
    ))}
  </svg>
);

/** The yellow "Pick for Me!" button in the top right corner. */
export const PickForMeButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="pick-me-btn btn-3d btn-3d-amber btn-3d-sm flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0"
  >
    <DiceIcon />
    <span>{copy.nav.pickForMe}</span>
  </button>
);
