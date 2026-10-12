import React from 'react';

interface ChoiceCardProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  /** The artwork fills the whole card edge to edge, with the name laid over its bottom */
  bleed?: boolean;
  children: React.ReactNode;
}

const Check: React.FC = () => (
  <span className="pick-selected-check" aria-label="Selected">
    ✓
  </span>
);

/** One pastel card in a carousel: the picture, its name, and a tick when it is the chosen one. */
export const ChoiceCard: React.FC<ChoiceCardProps> = ({ selected, onClick, label, bleed = false, children }) => (
  <button
    type="button"
    data-sfx="select"
    aria-pressed={selected}
    onClick={onClick}
    className={`pick-card ${bleed ? 'is-bleed' : ''} ${selected ? 'is-selected' : ''}`}
  >
    {selected && <Check />}
    {bleed ? (
      <div className="pick-bleed">
        <div className="pick-bleed-art">{children}</div>
        <div className="pick-card-label">{label}</div>
      </div>
    ) : (
      <>
        <div className="pick-card-art">
          <div>{children}</div>
        </div>
        <div className="pick-card-label">{label}</div>
      </>
    )}
  </button>
);
