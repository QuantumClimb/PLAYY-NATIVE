import React from 'react';
import { GeneratedCard } from '../../lib/playys/cardTypes';
import { TrumpCardFront, TrumpCardBack } from './TrumpCard';

interface PrintableCardSheetProps {
  card: GeneratedCard | null;
}

/** Hidden on screen; printed as its own page after the coloring sheet (front + back side by side). */
export const PrintableCardSheet: React.FC<PrintableCardSheetProps> = ({ card }) => {
  if (!card) return null;
  return (
    <div id="printable-card-sheet" className="hidden print:flex items-center justify-center gap-6 bg-white">
      <TrumpCardFront card={card} scale={1} />
      <TrumpCardBack card={card} scale={1} />
    </div>
  );
};
