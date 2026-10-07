import React from 'react';
import {
  PlayyConfiguration,
  RenderMode,
  HeadId,
  PoseId,
  SymbolId,
  BackgroundId,
} from '../../lib/playys/types';
import { HeadSelector } from './HeadSelector';
import { PoseSelector } from './PoseSelector';
import { SymbolSelector } from './SymbolSelector';
import { BackgroundSelector } from './BackgroundSelector';
import { ColoringCanvas } from './ColoringCanvas';
import { CharacterPreviewCard } from './CharacterPreviewCard';
import { Sparkles } from 'lucide-react';

interface DesktopConfiguratorProps {
  config: PlayyConfiguration;
  activeMode: RenderMode;
  onToggleMode: (mode: RenderMode) => void;
  onChangeConfig: (newConfig: PlayyConfiguration) => void;
  onPrint: () => void;
  onRandomize: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const DesktopConfigurator: React.FC<DesktopConfiguratorProps> = ({
  config,
  activeMode,
  onToggleMode,
  onChangeConfig,
  onPrint,
  onRandomize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const handleSelectHead = (head: HeadId) => {
    onChangeConfig({ ...config, head });
  };

  const handleSelectPose = (pose: PoseId) => {
    onChangeConfig({ ...config, pose });
  };

  const handleSelectSymbol = (symbol: SymbolId) => {
    onChangeConfig({ ...config, symbol });
  };

  const handleSelectBackground = (background: BackgroundId) => {
    onChangeConfig({ ...config, background });
  };

  return (
    <div
      id="desktop-configurator-grid"
      className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-12 gap-5 items-start"
    >
      {/* COLUMN 1: Configuration Selectors (30-35% -> col-span-4) */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <HeadSelector selectedHead={config.head} onSelectHead={handleSelectHead} />
        <PoseSelector
          selectedHead={config.head}
          selectedPose={config.pose}
          onSelectPose={handleSelectPose}
        />
        <SymbolSelector
          selectedSymbol={config.symbol}
          onSelectSymbol={handleSelectSymbol}
        />
        <BackgroundSelector
          selectedBackground={config.background}
          onSelectBackground={handleSelectBackground}
        />

        {/* Bottom Wooden Sign Banner from reference screenshot */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-100 py-2.5 px-4 rounded-2xl shadow-md border-3 border-amber-950 flex items-center justify-center gap-2 text-center">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span
            className="font-black text-sm tracking-wider"
            style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
          >
            Color a Brighter World!
          </span>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
      </div>

      {/* COLUMN 2: Hero Coloring Page Preview (45-50% -> col-span-5) */}
      <div className="col-span-12 lg:col-span-5 h-[760px]">
        <ColoringCanvas
          config={config}
          activeMode={activeMode}
          onToggleMode={onToggleMode}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          onPrint={onPrint}
        />
      </div>

      {/* COLUMN 3: Your Playy & Actions (20-25% -> col-span-3) */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
        <CharacterPreviewCard
          config={config}
          onPrint={onPrint}
          onRandomize={onRandomize}
        />
      </div>
    </div>
  );
};
