import React from 'react';
import type { Selection } from '../../lib/assets/library';
import type { PlayyConfiguration } from '../../lib/playys/types';
import { CroppedCharacter, HeadArt } from '../../components/playys/CharacterArt';
import { PlayyScene } from '../../components/playys/PlayyScene';
import { SCENE_H, SCENE_W } from '../../lib/assets/scene';
import type { PreviewKind } from '../flow/steps';

const SPARKS = [1, 2, 3, 4, 5, 6];

interface PreviewCardProps {
  kind: Exclude<PreviewKind, 'none'>;
  selection: Selection;
  config: PlayyConfiguration;
  /** The freeform paint canvas, laid over the character (the character then shows without the saved paint) */
  editor?: React.ReactNode;
}

function Preview({ kind, selection, config, editor }: PreviewCardProps) {
  switch (kind) {
    case 'head':
      return <HeadArt selection={selection} config={config} />;
    case 'character':
    case 'character-with-power':
      return (
        <div className="flex h-full w-full items-center justify-center p-[3vh]">
          <CroppedCharacter
            selection={selection}
            config={editor ? { ...config, paint: undefined } : config}
            showSymbol={kind === 'character-with-power'}
          >
            {editor}
          </CroppedCharacter>
        </div>
      );
    case 'scene':
      return <PlayyScene config={config} mode="color" className="mx-auto h-full rounded-[2vw]" />;
    case 'finished-page':
      return (
        <div className="flex h-full w-full items-center justify-center p-[1.4vh]">
          <PlayyScene config={config} mode="color" finish className="h-full rounded-[1.6vw]" />
        </div>
      );
  }
}

/** The big cream card on the left: a live preview of what the visitor has made so far. */
export const PreviewCard: React.FC<PreviewCardProps> = (props) => (
  <div className="head-preview-column lg:w-[46%] h-[42vh] lg:h-full min-h-0 shrink-0 flex items-center justify-center">
    <div
      className="head-preview-panel relative h-full max-w-full bg-white rounded-[30px] border-[6px] border-amber-300/90 shadow-[0_25px_80px_rgba(0,0,0,0.7)] overflow-hidden"
      style={{ aspectRatio: `${SCENE_W} / ${SCENE_H}` }}
    >
      <Preview {...props} />
      {props.kind === 'head' &&
        SPARKS.map((n) => <i key={n} className={`pick-spark pick-spark-${n}`} aria-hidden="true" />)}
    </div>
  </div>
);
