import React from 'react';
import { SceneBackground } from '../components/backgrounds/SceneBackground';
import { useAssetLibrary, useSelection } from '../lib/assets/library';
import type { GeneratedCard } from '../lib/playys/cardTypes';
import type { PlayyConfiguration } from '../lib/playys/types';
import { PageChrome } from './PageChrome';
import { PaintCanvas } from './components/PaintCanvas';
import { PreviewCard } from './components/PreviewCard';
import { useKioskFlow } from './flow/useKioskFlow';
import { STEP_CONTENT } from './steps';

interface KioskFlowProps {
  config: PlayyConfiguration;
  onChangeConfig: (config: PlayyConfiguration) => void;
  card: GeneratedCard | null;
  onCardChange: (card: GeneratedCard | null) => void;
  /** The visitor shared: open the print dialog and show the success screen */
  onFinish: (printed: boolean) => void;
  /** Back to the intro screen (idle too long, or Back on the first page) */
  onExit: () => void;
}

/** The visitor's journey from the first page to SHARE. One page at a time; the flow hook decides where to go next. */
export const KioskFlow: React.FC<KioskFlowProps> = ({
  config,
  onChangeConfig,
  card,
  onCardChange,
  onFinish,
  onExit,
}) => {
  const library = useAssetLibrary();
  const selection = useSelection(config);
  const flow = useKioskFlow({ config, onChangeConfig, onCardChange, library, selection, onFinish, onExit });
  const Content = STEP_CONTENT[flow.step];

  return (
    <div
      onClick={flow.touch}
      className={`kiosk-machine w-full h-full min-h-0 text-white flex flex-col lg:flex-row gap-3 lg:gap-8 px-3 sm:px-5 py-2 select-none relative overflow-hidden ${flow.def.pageClass}`}
    >
      <SceneBackground sceneId={flow.def.scene} />
      {flow.def.preview !== 'none' && (
        <PreviewCard
          kind={flow.def.preview}
          selection={selection}
          config={config}
          editor={
            flow.step === 'colors' && flow.colorMode === 'freeform' ? (
              <PaintCanvas paint={flow.paint} onInteract={flow.touch} />
            ) : undefined
          }
        />
      )}
      <PageChrome flow={flow}>
        <Content flow={flow} config={config} selection={selection} library={library} card={card} />
      </PageChrome>
    </div>
  );
};
