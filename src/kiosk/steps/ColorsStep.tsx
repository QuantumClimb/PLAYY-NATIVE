import React from 'react';
import { COLOR_SWATCHES } from '../../lib/playys/colors';
import { ColorPanel } from '../components/ColorPanel';
import { PickCarousel } from '../components/PickCarousel';
import { colorPanels } from './colorPanels';
import type { StepProps } from './types';

/** Choose your colours: simple (main and secondary) or advanced (every part), swiped left and right. */
export const ColorsStep: React.FC<StepProps> = ({ flow, config, selection }) => {
  const panels = colorPanels(flow.colorMode, selection.body, config.colors);
  const palette = config.colors?.palette?.length ? config.colors.palette : COLOR_SWATCHES;
  return (
    // A new carousel when the mode changes, so it starts on its first page
    <PickCarousel
      key={flow.colorMode}
      variant="colors"
      items={panels}
      keyOf={(panel) => panel.key}
      perPage={2}
      onInteract={flow.touch}
      renderItem={(panel, i) => (
        <ColorPanel
          label={panel.label}
          accent={i % 2 === 0 ? 'yellow' : 'purple'}
          value={panel.value}
          swatches={palette}
          onPick={(color) => flow.setColor(panel.key, color)}
        />
      )}
    />
  );
};
