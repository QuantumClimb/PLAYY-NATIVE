import React from 'react';
import type { Asset } from '../../lib/assets/types';
import type { Selection } from '../../lib/assets/library';
import { boundsOf, type Rect, type SceneLayout } from '../../lib/assets/scene';
import { resolveColors } from '../../lib/playys/colors';
import type { CharacterColorConfiguration } from '../../lib/playys/types';
import { AssetArt } from './AssetArt';

/** Where a rectangle sits inside a frame, as percentages, so the drawing scales with whatever box it is put in. */
const placeInFrame = (rect: Rect, frame: Rect): React.CSSProperties => ({
  position: 'absolute',
  left: `${((rect.x - frame.x) / frame.w) * 100}%`,
  top: `${((rect.y - frame.y) / frame.h) * 100}%`,
  width: `${(rect.w / frame.w) * 100}%`,
  height: `${(rect.h / frame.h) * 100}%`,
});

/** The area the paint layer covers: the body and head, never the symbol, so it is the same on every page. */
export const paintBounds = (layout: SceneLayout): Rect => boundsOf([layout.body, layout.head]);

interface SceneLayersProps {
  selection: Selection;
  colors?: CharacterColorConfiguration;
  /** color = the artwork; line = the black-and-white coloring page (which ignores the color choices) */
  mode: 'color' | 'line';
  layout: SceneLayout;
  /** The box the layout's coordinates are measured in: the whole scene, or just the character's bounds */
  frame: Rect;
  showBackground?: boolean;
  showSymbol?: boolean;
  /** Draw this pose instead of the selected one (the pose cards each show their own) */
  body?: Asset;
  /** The freeform paint layer (a PNG covering the body and head bounds); drawn only in freeform color mode */
  paint?: string;
}

/**
 * The layers of a finished scene in order: background, body, power symbol on the chest, head with the shared face.
 * In freeform mode the body and head are the white line art, and the visitor's paint is multiplied over them.
 */
export const SceneLayers: React.FC<SceneLayersProps> = ({
  selection,
  colors,
  mode,
  layout,
  frame,
  showBackground = false,
  showSymbol = false,
  body = selection.body,
  paint,
}) => {
  const rc = resolveColors(selection, colors);
  const freeform = mode === 'color' && colors?.mode === 'freeform';
  const characterMode = freeform ? 'line' : mode;
  return (
    <>
      {showBackground && (
        <AssetArt
          asset={selection.background}
          mode={mode}
          main={selection.headMain}
          stretch
          style={placeInFrame(layout.background, frame)}
        />
      )}
      <AssetArt
        asset={body}
        mode={characterMode}
        main={rc.bodyMain}
        secondary={rc.secondary}
        partColors={mode === 'color' && !freeform ? rc.partColors : undefined}
        style={placeInFrame(layout.body, frame)}
      />
      {showSymbol && selection.symbol && layout.symbol && (
        <AssetArt
          asset={selection.symbol}
          mode={mode}
          main={selection.headMain}
          style={placeInFrame(layout.symbol, frame)}
        />
      )}
      <AssetArt
        asset={selection.head}
        face={selection.face}
        mode={characterMode}
        main={rc.headMain}
        secondary={selection.secondary}
        style={placeInFrame(layout.head, frame)}
      />
      {freeform && paint && (
        <img
          src={paint}
          alt=""
          draggable={false}
          style={{ ...placeInFrame(paintBounds(layout), frame), mixBlendMode: 'multiply', pointerEvents: 'none' }}
        />
      )}
    </>
  );
};
