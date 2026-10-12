import React from 'react';
import { AssetArt } from '../../components/playys/AssetArt';
import { normalizeColor } from '../../lib/assets/svgParts';
import { ChoiceCard } from '../components/ChoiceCard';
import { PickCarousel } from '../components/PickCarousel';
import type { StepProps } from './types';

/** Choose your head: a swipeable set of cards, one per head. */
export const HeadStep: React.FC<StepProps> = ({ flow, selection, library }) => (
  <PickCarousel
    items={library.heads}
    keyOf={(head) => head.id}
    selectedKey={selection.head.id}
    onInteract={flow.touch}
    renderItem={(head) => (
      <ChoiceCard
        selected={selection.head.slug === head.slug}
        onClick={() => flow.choose({ head: head.slug })}
        label={head.name}
      >
        <AssetArt
          asset={head}
          face={library.face}
          mode="color"
          main={normalizeColor(head.meta.main) ?? '#3b82f6'}
          className="h-full w-auto max-w-full"
        />
      </ChoiceCard>
    )}
  />
);
