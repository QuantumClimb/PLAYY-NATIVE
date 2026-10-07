import React from 'react';
import { BackgroundId } from '../../lib/playys/types';
import { BACKGROUNDS } from '../../lib/playys/backgrounds';
import { HappyHillsBackground } from '../playys/backgrounds/HappyHillsBackground';
import { MagicCastleBackground } from '../playys/backgrounds/MagicCastleBackground';
import { SpaceWorldBackground } from '../playys/backgrounds/SpaceWorldBackground';
import { JungleWorldBackground } from '../playys/backgrounds/JungleWorldBackground';
import { CloudKingdomBackground } from '../playys/backgrounds/CloudKingdomBackground';
import { CityAdventureBackground } from '../playys/backgrounds/CityAdventureBackground';
import { Check } from 'lucide-react';

interface BackgroundSelectorProps {
  selectedBackground: BackgroundId;
  onSelectBackground: (background: BackgroundId) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  selectedBackground,
  onSelectBackground,
}) => {
  const renderMiniBackground = (id: BackgroundId) => {
    switch (id) {
      case 'happy-hills':
        return <HappyHillsBackground mode="color" />;
      case 'magic-castle':
        return <MagicCastleBackground mode="color" />;
      case 'space-world':
        return <SpaceWorldBackground mode="color" />;
      case 'jungle-world':
        return <JungleWorldBackground mode="color" />;
      case 'cloud-kingdom':
        return <CloudKingdomBackground mode="color" />;
      case 'city-adventure':
        return <CityAdventureBackground mode="color" />;
      default:
        return <HappyHillsBackground mode="color" />;
    }
  };

  return (
    <div id="step-4-background" className="bg-white rounded-2xl p-4 shadow-sm border-2 border-purple-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
          4
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800 leading-tight">Choose a Background</h3>
          <p className="text-xs text-gray-700">Pick the page your Playy will explore</p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {BACKGROUNDS.map((bg) => {
          const isSelected = selectedBackground === bg.id;
          return (
            <button
              key={bg.id}
              id={`bg-btn-${bg.id}`}
              type="button"
              onClick={() => onSelectBackground(bg.id)}
              className={`relative flex flex-col items-center justify-between p-1 rounded-xl border-3 transition-all duration-200 cursor-pointer bg-slate-50 hover:bg-white hover:shadow-md ${
                isSelected
                  ? 'border-pink-500 bg-pink-50/50 shadow-md ring-2 ring-pink-300 scale-102'
                  : 'border-slate-200 hover:border-purple-300'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1 w-4.5 h-4.5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm z-10">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div className="w-full aspect-[4/5] rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                <svg viewBox="0 0 850 1100" className="w-full h-full object-cover pointer-events-none">
                  {renderMiniBackground(bg.id)}
                </svg>
              </div>

              <span
                className={`text-[10px] font-bold mt-1 text-center truncate max-w-full ${
                  isSelected ? 'text-pink-600' : 'text-gray-700'
                }`}
              >
                {bg.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
