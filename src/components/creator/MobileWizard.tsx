import React, { useState } from 'react';
import { PlayyConfiguration, RenderMode, HeadId, PoseId, SymbolId, BackgroundId } from '../../lib/playys/types';
import { HeadSelector } from './HeadSelector';
import { PoseSelector } from './PoseSelector';
import { SymbolSelector } from './SymbolSelector';
import { BackgroundSelector } from './BackgroundSelector';
import { PlayyComposition } from '../playys/PlayyComposition';
import { CharacterPreviewOnly } from '../playys/CharacterPreviewOnly';
import { StepIndicator } from './StepIndicator';
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  FileDown,
  Share2,
  Sparkles,
  Dices,
  RotateCcw,
} from 'lucide-react';

interface MobileWizardProps {
  config: PlayyConfiguration;
  onChangeConfig: (newConfig: PlayyConfiguration) => void;
  onPrint: () => void;
  onRandomize: () => void;
}

export const MobileWizard: React.FC<MobileWizardProps> = ({
  config,
  onChangeConfig,
  onPrint,
  onRandomize,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState<RenderMode>('coloring');

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

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
    <div id="mobile-wizard-container" className="flex flex-col min-h-screen bg-slate-100 pb-16">
      {/* Top Floating Preview Area */}
      <div className="bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 p-4 rounded-b-3xl shadow-sm border-b-2 border-sky-300 flex flex-col items-center relative overflow-hidden">
        {/* Step Banner Callout */}
        <div className="flex items-center justify-between w-full mb-2">
          <div className="bg-white/90 px-3 py-1 rounded-full text-xs font-black text-indigo-900 shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {currentStep === 5 ? 'All Set!' : "Let's Build Your Playy!"}
          </div>

          <button
            type="button"
            onClick={onRandomize}
            className="bg-white/90 p-1.5 rounded-full text-pink-600 shadow-sm hover:bg-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Randomize"
          >
            <Dices className="w-4 h-4" />
          </button>
        </div>

        {/* Live Visual Preview */}
        <div className="w-full max-w-xs h-56 flex items-center justify-center relative">
          {currentStep === 5 ? (
            // Full Page Preview at Step 5
            <div className="w-full h-full bg-white rounded-2xl shadow-md border-2 border-slate-200 p-1.5 flex items-center justify-center">
              <PlayyComposition
                config={config}
                mode={previewMode}
                showBackground={true}
                showLogoHeader={true}
                className="w-full h-full"
              />
            </div>
          ) : (
            // Character-Only Preview for Steps 1-4
            <CharacterPreviewOnly config={config} mode="color" showSparkles={true} />
          )}
        </div>

        {/* Step 5 Mode Switcher (Coloring Page vs Preview) */}
        {currentStep === 5 && (
          <div className="flex items-center bg-white/90 p-1 rounded-2xl gap-1 mt-3 shadow-sm">
            <button
              type="button"
              onClick={() => setPreviewMode('coloring')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                previewMode === 'coloring' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Coloring Page
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('color')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                previewMode === 'color' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Color Preview
            </button>
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="py-2 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <StepIndicator currentStep={currentStep} onSelectStep={(s) => setCurrentStep(s)} />
      </div>

      {/* Main Step Interaction Card */}
      <div className="p-4 flex-1 flex flex-col justify-between max-w-lg mx-auto w-full">
        <div className="flex-1">
          {currentStep === 1 && (
            <HeadSelector selectedHead={config.head} onSelectHead={handleSelectHead} />
          )}

          {currentStep === 2 && (
            <PoseSelector
              selectedHead={config.head}
              selectedPose={config.pose}
              onSelectPose={handleSelectPose}
            />
          )}

          {currentStep === 3 && (
            <SymbolSelector selectedSymbol={config.symbol} onSelectSymbol={handleSelectSymbol} />
          )}

          {currentStep === 4 && (
            <BackgroundSelector
              selectedBackground={config.background}
              onSelectBackground={handleSelectBackground}
            />
          )}

          {currentStep === 5 && (
            <div className="bg-white rounded-3xl p-5 border-2 border-indigo-100 shadow-md flex flex-col gap-3">
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-800">Your PLAYY is Ready!</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Ready to color, save, or print right from your device.
                </p>
              </div>

              {/* Primary Print Button */}
              <button
                type="button"
                onClick={onPrint}
                className="w-full py-4 px-4 bg-gradient-to-b from-amber-300 to-amber-400 text-amber-950 font-black rounded-2xl shadow-lg border-3 border-amber-500 flex items-center justify-center gap-3 cursor-pointer active:scale-98"
              >
                <Printer className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-base font-black leading-none">Print My PLAYY</div>
                  <div className="text-[11px] text-amber-900/80 font-bold">Get your coloring page</div>
                </div>
              </button>

              {/* Download PDF & Share */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={onPrint}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200"
                >
                  <FileDown className="w-4 h-4 text-indigo-600" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'My PLAYYS Coloring Page',
                        text: 'Look at the cute PLAYY character coloring page I just built!',
                        url: window.location.href,
                      });
                    } else {
                      onPrint();
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200"
                >
                  <Share2 className="w-4 h-4 text-pink-600" />
                  <span>Share</span>
                </button>
              </div>

              {/* Reset to make another */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-indigo-600 font-bold hover:underline text-center py-2 cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Make Another PLAYY
              </button>
            </div>
          )}
        </div>

        {/* Navigation Buttons (Back / Next) */}
        {currentStep < 5 && (
          <div className="flex items-center gap-3 mt-4 pt-2">
            {currentStep > 1 && (
              <button
                id="btn-mobile-back"
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 px-4 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <button
              id="btn-mobile-next"
              type="button"
              onClick={handleNext}
              className={`flex-1 py-3 px-4 font-black rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                currentStep === 4
                  ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-500'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-slate-900 border-2 border-yellow-500'
              }`}
            >
              <span>{currentStep === 4 ? 'Create My Playy!' : 'Next'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
