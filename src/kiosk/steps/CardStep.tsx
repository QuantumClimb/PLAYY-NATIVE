import React, { useState } from 'react';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';
import { CARD_H, CARD_W, TrumpCardBack, TrumpCardFront } from '../../components/card/TrumpCard';
import { useFitScale } from '../components/useFitScale';
import { copy } from '../copy';
import type { StepProps } from './types';

/** The trump card: the picture on the front, the stats on the back. Tap the card to turn it over. */
export const CardStep: React.FC<StepProps> = ({ flow, card }) => {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const scale = useFitScale(CARD_H, 0.6, CARD_W, 0.46);
  if (!card) return null;

  const flip = () => {
    flow.touch();
    nativeFeedback.impactLight();
    setSide(side === 'front' ? 'back' : 'front');
  };

  return (
    <div className="trump-stage">
      <button
        type="button"
        data-sfx="reveal"
        aria-label={side === 'front' ? copy.card.flipToStats : copy.card.flipToPicture}
        className={`trump-flip ${side === 'back' ? 'is-back' : ''}`}
        style={{ width: CARD_W * scale, height: CARD_H * scale }}
        onClick={flip}
      >
        <div className="trump-face">
          <TrumpCardFront card={card} scale={scale} />
        </div>
        <div className="trump-face trump-face-back">
          <TrumpCardBack card={card} scale={scale} />
        </div>
      </button>
      <div className="trump-hint">{side === 'front' ? copy.card.seeStats : copy.card.seePicture}</div>
    </div>
  );
};
