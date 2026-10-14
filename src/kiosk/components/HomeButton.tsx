import React from 'react';
import { Home } from 'lucide-react';
import { copy } from '../copy';

/** The round button right of "Pick for Me!": back to the intro screen. */
export const HomeButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={copy.nav.home}
    className="home-btn btn-3d btn-3d-blue btn-3d-sm flex items-center justify-center shrink-0"
  >
    <Home strokeWidth={3} aria-hidden="true" />
  </button>
);
