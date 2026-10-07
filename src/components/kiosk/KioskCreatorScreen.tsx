import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Dices,
  RotateCcw,
  Volume2,
  VolumeX,
  Cloud,
  ChevronDown,
  Printer,
  Home,
  Check,
  Smile,
  Zap,
  Star,
  Globe,
  Timer,
  Pause,
  Play,
  FileText,
} from 'lucide-react';
import { PlayyConfiguration, RenderMode, HeadId, PoseId, SymbolId, BackgroundId } from '../../lib/playys/types';
import { HEADS } from '../../lib/playys/heads';
import { POSES } from '../../lib/playys/poses';
import { SYMBOLS } from '../../lib/playys/symbols';
import { BACKGROUNDS } from '../../lib/playys/backgrounds';
import { PlayyComposition } from '../playys/PlayyComposition';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

interface KioskCreatorScreenProps {
  config: PlayyConfiguration;
  onChangeConfig: (newConfig: PlayyConfiguration) => void;
  onRandomize: () => void;
  onFinishAndPrint: () => void;
  onBackToStart: () => void;
  onOpenCloudPrinter: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const KioskCreatorScreen: React.FC<KioskCreatorScreenProps> = ({
  config,
  onChangeConfig,
  onRandomize,
  onFinishAndPrint,
  onBackToStart,
  onOpenCloudPrinter,
  soundEnabled,
  onToggleSound,
}) => {
  const [activeCategory, setActiveCategory] = useState<'head' | 'pose' | 'symbol' | 'background'>('head');
  const [renderMode, setRenderMode] = useState<RenderMode>('coloring');
  const [kidsReachMode, setKidsReachMode] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Kiosk Inactivity Idle Timer (90 seconds of inactivity returns to start)
  const [idleSeconds, setIdleSeconds] = useState<number>(90);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);

  const resetIdleTimer = () => {
    setIdleSeconds(90);
  };

  useEffect(() => {
    if (timerPaused) return;
    const interval = setInterval(() => {
      setIdleSeconds((prev) => {
        if (prev <= 1) {
          onBackToStart();
          return 90;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerPaused, onBackToStart]);

  const handleSelectHead = (id: HeadId) => {
    resetIdleTimer();
    nativeFeedback.selection();
    onChangeConfig({ ...config, head: id });
  };

  const handleSelectPose = (id: PoseId) => {
    resetIdleTimer();
    nativeFeedback.selection();
    onChangeConfig({ ...config, pose: id });
  };

  const handleSelectSymbol = (id: SymbolId) => {
    resetIdleTimer();
    nativeFeedback.selection();
    onChangeConfig({ ...config, symbol: id });
  };

  const handleSelectBackground = (id: BackgroundId) => {
    resetIdleTimer();
    nativeFeedback.selection();
    onChangeConfig({ ...config, background: id });
  };

  const handlePrintClick = () => {
    resetIdleTimer();
    nativeFeedback.notificationSuccess();
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      onFinishAndPrint();
    }, 600);
  };

  return (
    <div
      onClick={resetIdleTimer}
      className={`w-full h-full min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden ${
        kidsReachMode ? 'pt-8' : ''
      }`}
    >
      {/* 1. Top Kiosk Navigation & Status Bar */}
      <div className="w-full bg-slate-950/70 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-2xl border border-indigo-900/60 flex items-center justify-between z-20 shrink-0 mb-3 shadow-lg">
        {/* Left: Back to Start + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              nativeFeedback.impactLight();
              onBackToStart();
            }}
            className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
            title="Return to Start Screen"
          >
            <Home className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Start Screen</span>
          </button>

          <div className="flex items-center gap-1 font-black text-2xl tracking-tight filter drop-shadow-xs">
            <span className="text-pink-400">P</span>
            <span className="text-cyan-400">L</span>
            <span className="text-amber-400">A</span>
            <span className="text-orange-400">Y</span>
            <span className="text-lime-400">Y</span>
            <span className="text-purple-400">S</span>
          </div>
        </div>

        {/* Center: Kids Reach Mode & Idle Timer */}
        <div className="flex items-center gap-2.5">
          {/* Kids Reach Height Mode */}
          <button
            type="button"
            onClick={() => {
              nativeFeedback.impactLight();
              setKidsReachMode(!kidsReachMode);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
              kidsReachMode
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Lowers touch controls for younger children"
          >
            <ChevronDown className={`w-3.5 h-3.5 ${kidsReachMode ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">{kidsReachMode ? 'Kids Reach: ON' : 'Kids Reach Height'}</span>
            <span className="md:hidden">Kids</span>
          </button>

          {/* Idle Timeout Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400">
            <Timer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Idle: {idleSeconds}s</span>
          </div>
        </div>

        {/* Right: Cloud Printer, Surprise Dice & Sound */}
        <div className="flex items-center gap-2">
          {/* Surprise Me Dice */}
          <button
            type="button"
            onClick={() => {
              resetIdleTimer();
              nativeFeedback.impactMedium();
              onRandomize();
            }}
            className="flex items-center gap-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-black border border-indigo-400/50 shadow-xs cursor-pointer active:scale-95 transition-all"
            title="Randomize character"
          >
            <Dices className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Surprise!</span>
          </button>

          {/* Cloud Printer Status Pill */}
          <button
            type="button"
            onClick={onOpenCloudPrinter}
            className="flex items-center gap-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-400/40 px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-xs"
            title="Cloud Printer Settings"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              soundEnabled
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main Creator Workspace (Widescreen Full Bleed) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch overflow-hidden">
        {/* LEFT COLUMN (42% Width): LIVE VECTOR CHARACTER STAGE + PRINT BUTTON */}
        <div className="w-full lg:w-[42%] flex flex-col justify-between items-center">
          {/* Stage Header */}
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Live Character Canvas
            </span>

            {/* Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-indigo-900/80 gap-1">
              <button
                type="button"
                onClick={() => {
                  nativeFeedback.selection();
                  setRenderMode('coloring');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  renderMode === 'coloring'
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Coloring Sheet
              </button>
              <button
                type="button"
                onClick={() => {
                  nativeFeedback.selection();
                  setRenderMode('color');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  renderMode === 'color'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Full Color
              </button>
            </div>
          </div>

          {/* Character Canvas Display Card */}
          <div className="w-full flex-1 max-h-[520px] bg-white rounded-3xl p-3 shadow-2xl border-4 border-indigo-500/40 flex items-center justify-center relative overflow-hidden">
            <PlayyComposition
              config={config}
              mode={renderMode}
              showBackground={true}
              showLogoHeader={true}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Giant Print & Finish Button */}
          <div className="w-full mt-3">
            <button
              type="button"
              onClick={handlePrintClick}
              disabled={isPrinting}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg sm:text-xl rounded-2xl shadow-xl border-3 border-amber-300 flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all"
            >
              <Printer className={`w-7 h-7 text-slate-950 ${isPrinting ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <div className="leading-tight font-black">
                  {isPrinting ? 'Sending to Cloud Printer...' : 'PRINT MY PLAYY!'}
                </div>
                <div className="text-xs text-amber-950/80 font-bold">
                  Instant Vector Coloring Sheet &bull; Finished
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (58% Width): TOUCH CUSTOMIZER TILES */}
        <div className={`w-full lg:w-[58%] flex flex-col justify-between ${kidsReachMode ? 'pt-8' : ''}`}>
          {/* Category Tabs */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { id: 'head', label: '1. Heads', icon: Smile, color: 'text-pink-400' },
              { id: 'pose', label: '2. Poses', icon: Zap, color: 'text-yellow-400' },
              { id: 'symbol', label: '3. Symbols', icon: Star, color: 'text-amber-400' },
              { id: 'background', label: '4. Worlds', icon: Globe, color: 'text-cyan-400' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    resetIdleTimer();
                    nativeFeedback.selection();
                    setActiveCategory(tab.id as any);
                  }}
                  className={`py-3.5 px-2 rounded-2xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer border-2 shadow-md ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-400 scale-[1.02]'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Tiles Scroll Container */}
          <div className="flex-1 bg-slate-950/80 p-4 rounded-3xl border-2 border-indigo-900/50 overflow-y-auto max-h-[480px]">
            {/* HEADS */}
            {activeCategory === 'head' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {HEADS.map((h) => {
                  const isSelected = config.head === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleSelectHead(h.id)}
                      className={`min-h-[110px] p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border-3 ${
                        isSelected
                          ? 'bg-gradient-to-b from-indigo-700 to-indigo-900 text-white border-amber-400 shadow-xl scale-[1.02]'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white/60 mb-2 shadow-md"
                        style={{ backgroundColor: h.primaryColor }}
                      />
                      <div className="text-sm font-black">{h.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">{h.tagline}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* POSES */}
            {activeCategory === 'pose' && (
              <div className="grid grid-cols-2 gap-3">
                {POSES.map((p) => {
                  const isSelected = config.pose === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPose(p.id)}
                      className={`min-h-[100px] p-4 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-700 to-indigo-900 text-white border-amber-400 shadow-xl scale-[1.02]'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-base font-black">{p.name}</div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">{p.description}</div>
                      </div>
                      {isSelected && <Check className="w-6 h-6 text-amber-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* SYMBOLS */}
            {activeCategory === 'symbol' && (
              <div className="grid grid-cols-3 gap-2.5">
                {SYMBOLS.map((s) => {
                  const isSelected = config.symbol === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSymbol(s.id)}
                      className={`min-h-[85px] p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-3 ${
                        isSelected
                          ? 'bg-indigo-700 text-white border-amber-400 shadow-xl scale-105'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <span className="text-2xl mb-1">{s.name === 'Star' ? '⭐' : s.name === 'Heart' ? '💖' : s.name === 'Lightning' ? '⚡' : s.name === 'Cloud' ? '☁️' : s.name === 'Flame' ? '🔥' : s.name === 'Moon' ? '🌙' : s.name === 'Crown' ? '👑' : s.name === 'Paw' ? '🐾' : '⚙️'}</span>
                      <span className="text-xs font-black">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* BACKGROUNDS */}
            {activeCategory === 'background' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {BACKGROUNDS.map((b) => {
                  const isSelected = config.background === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBackground(b.id)}
                      className={`min-h-[90px] p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border-3 ${
                        isSelected
                          ? 'bg-indigo-700 text-white border-amber-400 shadow-xl scale-105'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg mb-1.5 shadow-xs border border-white/40"
                        style={{ backgroundColor: b.themeColor }}
                      />
                      <span className="text-xs font-black leading-tight">{b.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Helper Bottom Bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Tap options to customize &bull; Hit &quot;PRINT MY PLAYY&quot; when ready</span>
            </div>

            <button
              type="button"
              onClick={onOpenCloudPrinter}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
            >
              Cloud Printer Gateway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
