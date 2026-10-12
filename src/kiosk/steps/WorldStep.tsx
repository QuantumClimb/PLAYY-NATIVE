import React from 'react';
import { AssetArt } from '../../components/playys/AssetArt';
import { ChoiceCard } from '../components/ChoiceCard';
import { PickCarousel } from '../components/PickCarousel';
import type { StepProps } from './types';

const FILL: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  aspectRatio: 'auto',
};

/** Choose your background: portrait cards with the artwork edge to edge, three to a page. */
export const WorldStep: React.FC<StepProps> = ({ flow, selection, library }) => (
  <PickCarousel
    items={library.backgrounds}
    keyOf={(background) => background.id}
    selectedKey={selection.background.id}
    onInteract={flow.touch}
    perPage={3}
    variant="portrait"
    renderItem={(background) => (
      <ChoiceCard
        selected={selection.background.slug === background.slug}
        onClick={() => flow.choose({ background: background.slug })}
        label={background.name}
        bleed
      >
        <AssetArt asset={background} mode="color" main={selection.headMain} stretch style={FILL} />
      </ChoiceCard>
    )}
  />
);
