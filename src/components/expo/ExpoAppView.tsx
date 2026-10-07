import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Dices,
  RotateCcw,
  Printer,
  FileDown,
  Share2,
  BookmarkCheck,
  Palette,
  Image as ImageIcon,
  Code2,
  ChevronRight,
  ChevronLeft,
  Check,
  Trash2,
  ExternalLink,
  Plus,
  Cloud,
} from 'lucide-react';
import { PlayyConfiguration, RenderMode, HeadId, PoseId, SymbolId, BackgroundId } from '../../lib/playys/types';
import { PlayyComposition } from '../playys/PlayyComposition';
import { CharacterPreviewOnly } from '../playys/CharacterPreviewOnly';
import { HeadSelector } from '../creator/HeadSelector';
import { PoseSelector } from '../creator/PoseSelector';
import { SymbolSelector } from '../creator/SymbolSelector';
import { BackgroundSelector } from '../creator/BackgroundSelector';
import { StepIndicator } from '../creator/StepIndicator';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

export type ExpoTab = 'studio' | 'gallery' | 'sheet' | 'code';

interface SavedPlayyItem {
  id: string;
  name: string;
  config: PlayyConfiguration;
  createdAt: string;
}

interface ExpoAppViewProps {
  config: PlayyConfiguration;
  onChangeConfig: (newConfig: PlayyConfiguration) => void;
  onRandomize: () => void;
  onReset: () => void;
  onOpenDevMenu: () => void;
  onOpenExporter: () => void;
  onOpenCloudPrinter?: () => void;
  onPrint: () => void;
  pageSize: 'letter' | 'a4';
  onChangePageSize: (size: 'letter' | 'a4') => void;
}

export const ExpoAppView: React.FC<ExpoAppViewProps> = ({
  config,
  onChangeConfig,
  onRandomize,
  onReset,
  onOpenDevMenu,
  onOpenExporter,
  onOpenCloudPrinter,
  onPrint,
  pageSize,
  onChangePageSize,
}) => {
  const [activeTab, setActiveTab] = useState<ExpoTab>('studio');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState<RenderMode>('coloring');

  // Simulated AsyncStorage for Gallery
  const [savedCollection, setSavedCollection] = useState<SavedPlayyItem[]>(() => {
    try {
      const stored = localStorage.getItem('playys_expo_saved');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'sample-1',
        name: 'Cosmic Bluey',
        config: { head: 'blue', pose: 'hero', symbol: 'star', background: 'space-world' },
        createdAt: 'Just now',
      },
      {
        id: 'sample-2',
        name: 'Dreamyy Hills',
        config: { head: 'dreamyy', pose: 'wave', symbol: 'heart', background: 'happy-hills' },
        createdAt: 'Earlier',
      },
    ];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNextStep = () => {
    nativeFeedback.impactLight();
    const next = Math.min(currentStep + 1, 5);
    setCurrentStep(next);

    if (next === 5) {
      nativeFeedback.notificationSuccess();
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#EC4899', '#FBBF24', '#38BDF8', '#10B981'],
      });
    }
  };

  const handlePrevStep = () => {
    nativeFeedback.impactLight();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSelectHead = (head: HeadId) => {
    nativeFeedback.selection();
    onChangeConfig({ ...config, head });
  };

  const handleSelectPose = (pose: PoseId) => {
    nativeFeedback.selection();
    onChangeConfig({ ...config, pose });
  };

  const handleSelectSymbol = (symbol: SymbolId) => {
    nativeFeedback.selection();
    onChangeConfig({ ...config, symbol });
  };

  const handleSelectBackground = (background: BackgroundId) => {
    nativeFeedback.selection();
    onChangeConfig({ ...config, background });
  };

  const handleSaveToCollection = () => {
    nativeFeedback.notificationSuccess();
    const newItem: SavedPlayyItem = {
      id: `playy-${Date.now()}`,
      name: `${config.head.toUpperCase()} ${config.pose.toUpperCase()}`,
      config: { ...config },
      createdAt: 'Just now',
    };
    const updated = [newItem, ...savedCollection];
    setSavedCollection(updated);
    try {
      localStorage.setItem('playys_expo_saved', JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
    showToast('Saved to My Collection! ⭐');
  };

  const handleDeleteItem = (id: string) => {
    nativeFeedback.impactLight();
    const updated = savedCollection.filter((item) => item.id !== id);
    setSavedCollection(updated);
    try {
      localStorage.setItem('playys_expo_saved', JSON.stringify(updated));
    } catch {
      // fallback
    }
    showToast('Removed from collection');
  };

  const handleLoadItem = (item: SavedPlayyItem) => {
    nativeFeedback.impactMedium();
    onChangeConfig(item.config);
    setActiveTab('studio');
    setCurrentStep(5);
    showToast(`Loaded ${item.name}!`);
  };

  const handleShare = () => {
    nativeFeedback.impactMedium();
    if (navigator.share) {
      navigator.share({
        title: 'PLAYYS Native Coloring Sheet',
        text: `Look at my PLAYY character: ${config.head} in ${config.background}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      onPrint();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative min-h-full">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. React Native Safe Area Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
        {/* Left: Branding & Expo Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-black text-slate-900 text-lg tracking-tight">
            <span className="text-pink-500">P</span>
            <span className="text-cyan-500">L</span>
            <span className="text-amber-500">A</span>
            <span className="text-orange-500">Y</span>
            <span className="text-lime-500">Y</span>
            <span className="text-purple-500">S</span>
          </div>

          <div
            onClick={onOpenDevMenu}
            className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors border border-indigo-200/60"
            title="Tap to open Expo Developer Menu"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <span>EXPO NATIVE</span>
          </div>
        </div>

        {/* Right: Actions (Randomize Dice & Reset) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              nativeFeedback.impactMedium();
              onRandomize();
              showToast('Randomized character! 🎲');
            }}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Surprise me (Randomize)"
          >
            <Dices className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Random</span>
          </button>

          <button
            type="button"
            onClick={() => {
              nativeFeedback.impactLight();
              onReset();
              setCurrentStep(1);
              showToast('Reset to default');
            }}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Tab Body */}
      <div className="flex-1 flex flex-col overflow-y-auto pb-16">
        {/* TAB 1: STUDIO WIZARD */}
        {activeTab === 'studio' && (
          <div className="flex-1 flex flex-col">
            {/* Live Character Preview Stage */}
            <div className="bg-gradient-to-b from-sky-200 via-sky-100 to-slate-50 p-3 sm:p-4 flex flex-col items-center border-b border-sky-200/60 relative">
              <div className="w-full max-w-xs flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-indigo-900 bg-white/80 px-2.5 py-0.5 rounded-full shadow-2xs border border-white">
                  {currentStep === 5 ? 'Step 5 of 5 • Finished' : `Step ${currentStep} of 5`}
                </span>

                {currentStep === 5 && (
                  <button
                    type="button"
                    onClick={handleSaveToCollection}
                    className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 bg-white/90 hover:bg-white px-2.5 py-0.5 rounded-full shadow-2xs border border-indigo-100 cursor-pointer"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {/* Viewport Canvas Card */}
              <div className="w-full max-w-[280px] h-[240px] bg-white rounded-3xl shadow-md border-2 border-slate-200/80 p-2 flex items-center justify-center overflow-hidden relative">
                {currentStep === 5 ? (
                  <PlayyComposition
                    config={config}
                    mode={previewMode}
                    showBackground={true}
                    showLogoHeader={true}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <CharacterPreviewOnly
                    config={config}
                    mode="color"
                    showSparkles={true}
                  />
                )}
              </div>

              {/* Mode Toggle on Step 5 */}
              {currentStep === 5 && (
                <div className="flex items-center bg-white/90 p-1 rounded-2xl gap-1 mt-2.5 shadow-2xs border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      nativeFeedback.selection();
                      setPreviewMode('coloring');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      previewMode === 'coloring'
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Coloring Page
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      nativeFeedback.selection();
                      setPreviewMode('color');
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      previewMode === 'color'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Color Preview
                  </button>
                </div>
              )}
            </div>

            {/* Step Indicator Bar */}
            <div className="bg-white/95 backdrop-blur-xs py-2 px-3 border-b border-slate-200">
              <StepIndicator
                currentStep={currentStep}
                onSelectStep={(s) => {
                  nativeFeedback.selection();
                  setCurrentStep(s);
                }}
              />
            </div>

            {/* Step Selection Content */}
            <div className="p-4 flex-1 flex flex-col justify-between max-w-md mx-auto w-full">
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
                  <SymbolSelector
                    selectedSymbol={config.symbol}
                    onSelectSymbol={handleSelectSymbol}
                  />
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
                      <h3 className="text-lg font-black text-slate-800">Your PLAYY is Complete!</h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Print high-resolution coloring page via Expo Print or share with friends.
                      </p>
                    </div>

                    {/* Primary Print Button */}
                    <button
                      type="button"
                      onClick={() => {
                        nativeFeedback.notificationSuccess();
                        onPrint();
                      }}
                      className="w-full py-3.5 px-4 bg-gradient-to-b from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black rounded-2xl shadow-md border-2 border-amber-500 flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all"
                    >
                      <Printer className="w-5 h-5 stroke-[2.5]" />
                      <div className="text-left">
                        <div className="text-sm font-black leading-none">Print My Coloring Page</div>
                        <div className="text-[10px] text-amber-900/80 font-bold">Expo Print &bull; 300 DPI Vector PDF</div>
                      </div>
                    </button>

                    {/* Cloud Printer Trigger Banner */}
                    {onOpenCloudPrinter && (
                      <button
                        type="button"
                        onClick={onOpenCloudPrinter}
                        className="w-full py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-xl text-xs font-black flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4 text-sky-600" />
                          <span>Silent Cloud Print (PrintNode / Kiosk)</span>
                        </div>
                        <span className="text-[10px] bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded-full font-bold">
                          Configure
                        </span>
                      </button>
                    )}

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleSaveToCollection}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                        <span>Save to Gallery</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShare}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-pink-600" />
                        <span>Expo Share</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        nativeFeedback.impactLight();
                        setCurrentStep(1);
                      }}
                      className="text-xs text-indigo-600 font-bold hover:underline text-center py-1 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Another PLAYY</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Step Nav */}
              {currentStep < 5 && (
                <div className="flex items-center gap-3 mt-4 pt-2">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className={`flex-1 py-3 px-4 font-black rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all ${
                      currentStep === 4
                        ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-2 border-amber-500'
                        : 'bg-yellow-400 hover:bg-yellow-300 text-slate-900 border-2 border-yellow-500'
                    }`}
                  >
                    <span>{currentStep === 4 ? 'Complete Playy!' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GALLERY */}
        {activeTab === 'gallery' && (
          <div className="p-4 max-w-lg mx-auto w-full flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-base font-black text-slate-900">Saved Characters</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Stored locally via simulated AsyncStorage ({savedCollection.length} saved)
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  nativeFeedback.impactLight();
                  setActiveTab('studio');
                  setCurrentStep(1);
                }}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {savedCollection.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center flex flex-col items-center">
                <Sparkles className="w-10 h-10 text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No saved characters yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Create a character in Studio and tap "Save to Gallery" to build your coloring book collection!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {savedCollection.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-2.5 border-2 border-slate-200 hover:border-indigo-400 transition-all shadow-xs flex flex-col"
                  >
                    <div
                      className="w-full h-36 bg-slate-50 rounded-xl overflow-hidden p-1 flex items-center justify-center cursor-pointer"
                      onClick={() => handleLoadItem(item)}
                    >
                      <PlayyComposition
                        config={item.config}
                        mode="color"
                        showBackground={true}
                        showLogoHeader={false}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <div className="text-xs font-extrabold text-slate-800 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          {item.createdAt}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLoadItem(item)}
                      className="mt-2 w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Load in Studio
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FULL PRINT SHEET */}
        {activeTab === 'sheet' && (
          <div className="p-4 max-w-lg mx-auto w-full flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Printable Coloring Sheet</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Vector 300 DPI coloring book page
                </p>
              </div>

              {/* Page size toggle */}
              <div className="flex items-center bg-slate-200 p-0.5 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => onChangePageSize('letter')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    pageSize === 'letter' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  US Letter
                </button>
                <button
                  type="button"
                  onClick={() => onChangePageSize('a4')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    pageSize === 'a4' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  A4
                </button>
              </div>
            </div>

            {/* Sheet Preview Card */}
            <div className="w-full bg-white rounded-3xl p-3 border-2 border-slate-300 shadow-md flex items-center justify-center">
              <div className="w-full aspect-[8.5/11] max-h-[460px] flex items-center justify-center">
                <PlayyComposition
                  config={config}
                  mode="coloring"
                  showBackground={true}
                  showLogoHeader={true}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  nativeFeedback.notificationSuccess();
                  onPrint();
                }}
                className="py-3 px-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-2xl shadow-sm border border-amber-500 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>Print Page</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-3 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Share2 className="w-4 h-4" />
                <span>Expo Share</span>
              </button>
            </div>

            {onOpenCloudPrinter && (
              <button
                type="button"
                onClick={onOpenCloudPrinter}
                className="w-full py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer mt-1"
              >
                <Cloud className="w-4 h-4 text-sky-600" />
                <span>Send to Cloud Printer (PrintNode / Kiosk)</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 4: EXPO CODE */}
        {activeTab === 'code' && (
          <div className="p-4 max-w-lg mx-auto w-full flex flex-col gap-3">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Expo Native Codebase</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto mt-0.5">
                Full React Native source files configured with Expo SDK 52 and EAS build ready.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                <span>Architecture</span>
                <span className="text-indigo-600 font-mono">React Native 0.76 (New Arch)</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                <span>Vector Engine</span>
                <span className="text-indigo-600 font-mono">react-native-svg 15.9</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                <span>Export & Print</span>
                <span className="text-indigo-600 font-mono">expo-print &bull; expo-sharing</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
                <span>Haptics & Tactile</span>
                <span className="text-indigo-600 font-mono">expo-haptics</span>
              </div>

              <button
                type="button"
                onClick={onOpenExporter}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Code2 className="w-4 h-4" />
                <span>Open Code Explorer & Download (.zip)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. React Native Bottom Tab Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around z-20 shadow-md">
        {/* Tab 1: Studio */}
        <button
          type="button"
          onClick={() => {
            nativeFeedback.selection();
            setActiveTab('studio');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'studio' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Palette className={`w-5 h-5 ${activeTab === 'studio' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-black">Studio</span>
        </button>

        {/* Tab 2: Gallery */}
        <button
          type="button"
          onClick={() => {
            nativeFeedback.selection();
            setActiveTab('gallery');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'gallery' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ImageIcon className={`w-5 h-5 ${activeTab === 'gallery' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-black">Gallery</span>
        </button>

        {/* Tab 3: Print Sheet */}
        <button
          type="button"
          onClick={() => {
            nativeFeedback.selection();
            setActiveTab('sheet');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'sheet' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Printer className={`w-5 h-5 ${activeTab === 'sheet' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-black">Sheet</span>
        </button>

        {/* Tab 4: Expo Code */}
        <button
          type="button"
          onClick={() => {
            nativeFeedback.selection();
            setActiveTab('code');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'code' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Code2 className={`w-5 h-5 ${activeTab === 'code' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-black">Expo Code</span>
        </button>
      </div>
    </div>
  );
};
