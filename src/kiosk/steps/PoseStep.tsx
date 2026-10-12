import React from 'react';
import { CroppedCharacter } from '../../components/playys/CharacterArt';
import { ChoiceCard } from '../components/ChoiceCard';
import { PickCarousel } from '../components/PickCarousel';
import type { StepProps } from './types';

/** Choose your pose: each card shows that pose on the chosen head, in the chosen colors. */
export const PoseStep: React.FC<StepProps> = ({ flow, config, selection, library }) => (
  <PickCarousel
    items={library.bodies}
    keyOf={(body) => body.id}
    selectedKey={selection.body.id}
    onInteract={flow.touch}
    renderItem={(body) => (
      <ChoiceCard
        selected={selection.body.slug === body.slug}
        onClick={() => flow.choose({ pose: body.slug })}
        label={body.name}
      >
        <CroppedCharacter selection={selection} config={config} body={body} />
      </ChoiceCard>
    )}
  />
);
