import React from 'react';
import { Asset } from '../../api';
import { AssetPreview } from '../AssetPreview';
import { AssetDraft } from './useAssetDraft';

const MODES = ['color', 'line'] as const;

/** The asset in colour and in black and white. The colour one is where anchors are placed. */
export const AssetPreviews: React.FC<{ d: AssetDraft; face?: Asset }> = ({ d, face }) => (
  <div className="grid md:grid-cols-2 gap-4">
    {MODES.map((mode) => (
      <div key={mode} className="rounded-2xl p-4 bg-white">
        <div className="text-xs text-gray-500 mb-2">{mode === 'color' ? 'COLOR' : 'BLACK & WHITE'}</div>
        <AssetPreview
          asset={d.draft}
          face={face}
          mode={mode}
          main={d.mainHex}
          className="w-full max-h-72 mx-auto"
          {...(mode === 'color' && d.anchorDefs.length
            ? { anchors: d.anchors, activeAnchor: d.activeAnchor, onPlaceAnchor: d.placeAnchor }
            : {})}
        />
      </div>
    ))}
  </div>
);
