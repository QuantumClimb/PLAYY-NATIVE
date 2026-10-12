import React from 'react';
import { CARD_H, TrumpCardFront } from '../../components/card/TrumpCard';
import { PlayyScene } from '../../components/playys/PlayyScene';
import { ShareSheets } from '../components/ShareSheets';
import { useFitScale } from '../components/useFitScale';
import { copy } from '../copy';
import type { StepProps } from './types';

const PAGES = [
  { mode: 'line', label: copy.share.coloring },
  { mode: 'color', label: copy.share.colour },
] as const;

/** The finished pieces in a row. The SHARE button prints, emails and logs them. */
export const ShareStep: React.FC<StepProps> = ({ flow, config, card }) => {
  const cardScale = useFitScale(CARD_H, 0.56);
  if (!card) return null;
  return (
    <div className="complete-row">
      {PAGES.map(({ mode, label }) => (
        <div key={mode} className={`preview-card preview-card-${mode}`}>
          <div className="preview-card-label">{label}</div>
          <div className="preview-card-art">
            <PlayyScene config={config} mode={mode} finish className="h-full w-full" />
          </div>
        </div>
      ))}
      <div className="complete-card">
        <div className="preview-card-label">{copy.share.card}</div>
        <TrumpCardFront card={card} scale={cardScale} />
      </div>
      {/* The full-size pictures that get emailed are drawn here, out of sight */}
      <ShareSheets ref={flow.share.sheets} config={config} card={card} />
      {flow.share.sharing && (
        <div className="share-busy" role="status">
          <i aria-hidden="true" />
          {copy.share.busy}
        </div>
      )}
    </div>
  );
};
