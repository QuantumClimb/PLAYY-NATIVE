import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { PlayyConfiguration } from '../../lib/playys/types';
import type { GeneratedCard } from '../../lib/playys/cardTypes';
import { PlayyScene } from '../playys/PlayyScene';
import { TrumpCardBack, TrumpCardFront } from '../card/TrumpCard';
import { CaptureNodes, prepareFonts } from '../../lib/share/capture';
import { SCENE_H, SCENE_W } from '../../lib/assets/scene';

export interface ShareSheetsHandle {
  nodes: () => CaptureNodes | null;
}

interface ShareSheetsProps {
  config: PlayyConfiguration;
  card: GeneratedCard;
}

/**
 * The four pictures that get emailed, drawn at full size far off-screen so they can be photographed:
 * the black-and-white page, the colour page, and the front and back of the trump card.
 */
export const ShareSheets = forwardRef<ShareSheetsHandle, ShareSheetsProps>(({ config, card }, ref) => {
  const bw = useRef<HTMLDivElement>(null);
  const color = useRef<HTMLDivElement>(null);
  const cardFront = useRef<HTMLDivElement>(null);
  const cardBack = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    nodes: () => (bw.current && color.current && cardFront.current && cardBack.current
      ? { bw: bw.current, color: color.current, cardFront: cardFront.current, cardBack: cardBack.current }
      : null),
  }));

  // Read the fonts now, while the visitor is still looking at the page, so sharing is quicker
  useEffect(() => {
    if (color.current) void prepareFonts(color.current);
  }, []);

  return (
    <div aria-hidden="true" style={{ position: 'fixed', left: -20000, top: 0, pointerEvents: 'none' }}>
      <div ref={bw} style={{ width: SCENE_W, height: SCENE_H, background: '#fff' }}>
        <PlayyScene config={config} mode="line" finish className="h-full w-full" />
      </div>
      <div ref={color} style={{ width: SCENE_W, height: SCENE_H, background: '#fff' }}>
        <PlayyScene config={config} mode="color" finish className="h-full w-full" />
      </div>
      <div ref={cardFront} style={{ width: 340, height: 510 }}><TrumpCardFront card={card} scale={1} /></div>
      <div ref={cardBack} style={{ width: 340, height: 510 }}><TrumpCardBack card={card} scale={1} /></div>
    </div>
  );
});
ShareSheets.displayName = 'ShareSheets';
