import React from 'react';
import { CARD_H, CARD_W, TrumpCardBack, TrumpCardFront } from '../../components/card/TrumpCard';
import { useFitScale } from '../components/useFitScale';
import type { StepProps } from './types';

/** The trump card: the picture (front) and the stats (back) shown side by side. Nothing to tap or flip. */
export const CardStep: React.FC<StepProps> = ({ card }) => {
  // Two cards share the width, so each one gets just under a quarter of the window
  const scale = useFitScale(CARD_H, 0.6, CARD_W, 0.23);
  if (!card) return null;

  const size = { width: CARD_W * scale, height: CARD_H * scale };

  return (
    <div className="trump-stage">
      <div className="trump-face" style={size}>
        <TrumpCardFront card={card} scale={scale} />
      </div>
      <div className="trump-face" style={size}>
        <TrumpCardBack card={card} scale={scale} />
      </div>
    </div>
  );
};
