import React from 'react';
import type { Asset } from '../../lib/assets/types';
import type { Selection } from '../../lib/assets/library';
import { boundsOf, layoutScene } from '../../lib/assets/scene';
import { resolveColors } from '../../lib/playys/colors';
import type { PlayyConfiguration } from '../../lib/playys/types';
import { AssetArt } from './AssetArt';
import { SceneLayers } from './SceneLayers';

interface CharacterArtProps {
  selection: Selection;
  config: PlayyConfiguration;
  /** Draw this pose instead of the selected one (the pose cards each show their own) */
  body?: Asset;
  showSymbol?: boolean;
}

/** The body and head (and the power symbol) cropped to their own bounds, so the character fills whatever box it is put in. */
export const CroppedCharacter: React.FC<CharacterArtProps> = ({
  selection,
  config,
  body = selection.body,
  showSymbol = false,
}) => {
  const layout = layoutScene({
    background: selection.background,
    body,
    head: selection.head,
    symbol: showSymbol ? selection.symbol : null,
  });
  const frame = boundsOf([layout.body, layout.head, ...(showSymbol && layout.symbol ? [layout.symbol] : [])]);

  return (
    <div className="relative h-full max-w-full" style={{ aspectRatio: `${frame.w} / ${frame.h}` }}>
      <SceneLayers
        selection={selection}
        colors={config.colors}
        mode="color"
        layout={layout}
        frame={frame}
        showSymbol={showSymbol}
        body={body}
      />
    </div>
  );
};

/** Just the head with its face, standing on a soft shadow. */
export const HeadArt: React.FC<{ selection: Selection; config: PlayyConfiguration }> = ({ selection, config }) => (
  <div className="head-preview-inner w-full h-full flex items-center justify-center bg-white rounded-2xl p-8">
    <div className="head-preview-shadow" aria-hidden="true" />
    <AssetArt
      asset={selection.head}
      face={selection.face}
      mode="color"
      main={resolveColors(selection, config.colors).headMain}
      secondary={selection.secondary}
      className="h-[78%] w-auto max-w-[92%]"
    />
  </div>
);
