import React, { useMemo } from 'react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { useSelection } from '../../lib/assets/library';
import { Rect, SCENE_H, SCENE_W, layoutScene } from '../../lib/assets/scene';
import { AssetArt } from './AssetArt';
import { FINISH_RESERVE_BOTTOM, SceneFinish } from './SceneFinish';
import { resolveColors } from '../../lib/playys/colors';

const rectStyle = (r: Rect): React.CSSProperties => ({
  position: 'absolute',
  left: `${(r.x / SCENE_W) * 100}%`,
  top: `${(r.y / SCENE_H) * 100}%`,
  width: `${(r.w / SCENE_W) * 100}%`,
  height: `${(r.h / SCENE_H) * 100}%`,
});

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
    () => layoutScene({ background: sel.background, body: sel.body, head: sel.head, symbol: sel.symbol, reserveBottom: finish ? FINISH_RESERVE_BOTTOM : 0 }),
    [sel, finish],
  );

  // The visitor's color choices. The black-and-white coloring page ignores them (it is for coloring in).
  const rc = resolveColors(sel, config.colors);

  return (
    <div className={`relative overflow-hidden bg-white scene-cq ${className}`} style={{ aspectRatio: `${SCENE_W} / ${SCENE_H}` }}>
      <AssetArt asset={sel.background} mode={mode} main={sel.headMain} stretch style={rectStyle(layout.background)} />
      <AssetArt
        asset={sel.body}
        mode={mode}
        main={rc.bodyMain}
        secondary={rc.secondary}
        partColors={mode === 'color' ? rc.partColors : undefined}
        style={rectStyle(layout.body)}
      />
      {sel.symbol && layout.symbol && (
        <AssetArt asset={sel.symbol} mode={mode} main={sel.headMain} style={rectStyle(layout.symbol)} />
      )}
      <AssetArt asset={sel.head} face={sel.face} mode={mode} main={rc.headMain} style={rectStyle(layout.head)} />
      {finish && <SceneFinish mode={mode} name={config.kidName} email={config.email} phone={config.phone} />}
    </div>
  );
};
