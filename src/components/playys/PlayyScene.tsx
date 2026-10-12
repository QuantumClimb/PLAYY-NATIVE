import React, { useMemo } from 'react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { useSelection } from '../../lib/assets/library';
import { SCENE_H, SCENE_W, layoutScene } from '../../lib/assets/scene';
import { SceneLayers } from './SceneLayers';
import { FINISH_RESERVE_BOTTOM, SceneFinish } from './SceneFinish';

const SCENE_FRAME = { x: 0, y: 0, w: SCENE_W, h: SCENE_H };

interface PlayySceneProps {
  config: PlayyConfiguration;
  /** color = the artwork; line = the black-and-white coloring page */
  mode: 'color' | 'line';
  /** The finished page: adds the logo, the name under the character and the contact details as a small note */
  finish?: boolean;
  className?: string;
}

/**
 * The finished artwork: background stretched to the A4 printable area, the character standing on it
 * (body, symbol on the chest, head with the shared face). Sizes itself to its container.
 */
export const PlayyScene: React.FC<PlayySceneProps> = ({ config, mode, finish = false, className = '' }) => {
  const sel = useSelection(config);
  const layout = useMemo(
    () =>
      layoutScene({
        background: sel.background,
        body: sel.body,
        head: sel.head,
        symbol: sel.symbol,
        reserveBottom: finish ? FINISH_RESERVE_BOTTOM : 0,
      }),
    [sel, finish],
  );

  return (
    <div
      className={`relative overflow-hidden bg-white scene-cq ${className}`}
      style={{ aspectRatio: `${SCENE_W} / ${SCENE_H}` }}
    >
      <SceneLayers
        selection={sel}
        colors={config.colors}
        mode={mode}
        layout={layout}
        frame={SCENE_FRAME}
        showBackground
        showSymbol
      />
      {finish && <SceneFinish mode={mode} name={config.kidName} email={config.email} phone={config.phone} />}
    </div>
  );
};
