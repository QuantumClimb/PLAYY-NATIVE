import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Printer,
  Sparkles,
  Dices,
  RotateCcw,
  Volume2,
  VolumeX,
  Cloud,
  CheckCircle2,
  ChevronDown,
  Layers,
  Heart,
  Star,
  Zap,
  Globe,
  Smile,
  Shield,
  Play,
  Pause,
  Timer,
  Sliders,
  Check,
} from 'lucide-react';
import { PlayyConfiguration, RenderMode, HeadId, PoseId, SymbolId, BackgroundId } from '../../lib/playys/types';
import { HEADS } from '../../lib/playys/heads';
import { POSES } from '../../lib/playys/poses';
import { SYMBOLS } from '../../lib/playys/symbols';
import { BACKGROUNDS } from '../../lib/playys/backgrounds';
import { PlayyComposition } from '../playys/PlayyComposition';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

interface TouchTvKioskViewProps {
  config: PlayyConfiguration;
  onChangeConfig: (newConfig: PlayyConfiguration) => void;
  onRandomize: () => void;
  onReset: () => void;
  onOpenCloudPrinter: () => void;
  onLocalPrint: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TouchTvKioskView: React.FC<TouchTvKioskViewProps> = ({
  config,
  onChangeConfig,
  onRandomize,
  onReset,
  onOpenCloudPrinter,
  onLocalPrint,
  soundEnabled,
  onToggleSound,
}) => {
  const [activeCategory, setActiveCategory] = useState<'head' | 'pose' | 'symbol' | 'background'>('head');
  const [renderMode, setRenderMode] = useState<RenderMode>('coloring');
  const [kidsReachMode, setKidsReachMode] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printSuccessToast, setPrintSuccessToast] = useState<boolean>(false);

  // Kiosk Auto-Reset Idle Timer (60s countdown)
  const [idleSeconds, setIdleSeconds] = useState<number>(60);
  const [timerPaused, setTimerPaused] = useState<boolean>(false);

  // Reset idle timer on any user touch
  const handleUserTouch = () => {
    setIdleSeconds(60);
  };

  useEffect(() => {
    if (timerPaused) return;
    const interval = setInterval(() => {
      setIdleSeconds((prev) => {
        if (prev <= 1) {
          onReset();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerPaused, onReset]);

  const handleSelectHead = (id: HeadId) => {
    handleUserTouch();
    nativeFeedback.selection();
    onChangeConfig({ ...config, head: id });
  };

  const handleSelectPose = (id: PoseId) => {
    handleUserTouch();
    nativeFeedback.selection();
    onChangeConfig({ ...config, pose: id });
  };

  const handleSelectSymbol = (id: SymbolId) => {
    handleUserTouch();
    nativeFeedback.selection();
    onChangeConfig({ ...config, symbol: id });
  };

  const handleSelectBackground = (id: BackgroundId) => {
    handleUserTouch();
    nativeFeedback.selection();
    onChangeConfig({ ...config, background: id });
  };

  const handle1TouchCloudPrint = () => {
    handleUserTouch();
    nativeFeedback.notificationSuccess();
    setIsPrinting(true);

    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#38BDF8', '#818CF8', '#F472B6', '#FBBF24', '#34D399'],
    });

    setTimeout(() => {
      setIsPrinting(false);
      setPrintSuccessToast(true);
      setTimeout(() => setPrintSuccessToast(false), 4000);
    }, 1800);
  };

  return (
    <div
      onClick={handleUserTouch}
      className={`w-full h-full min-h-[660px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white flex flex-col select-none relative overflow-hidden ${
        kidsReachMode ? 'pt-8' : ''
      }`}
    >
      {/* 1. Touch TV Top Status & Kiosk Navigation Bar */}
      <div className="w-full bg-slate-950/80 backdrop-blur-md px-6 py-3 border-b border-indigo-900/60 flex items-center justify-between z-20 shrink-0">
        {/* Left: Branding & TV Mode Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-black text-2xl tracking-wide">
            <span className="text-pink-400">P</span>
            <span className="text-cyan-400">L</span>
            <span className="text-amber-400">A</span>
            <span className="text-orange-400">Y</span>
            <span className="text-lime-400">Y</span>
            <span className="text-purple-400">S</span>
          </div>

          <div className="bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 px-3 py-1 rounded-xl text-xs font-black tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>55&quot; TOUCH SCREEN TV &bull; KIOSK MODE</span>
          </div>
        </div>

        {/* Center: Kids Reach Mode & Kiosk Idle Timer */}
        <div className="flex items-center gap-3">
          {/* Kids Reach Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              nativeFeedback.impactLight();
              setKidsReachMode(!kidsReachMode);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
              kidsReachMode
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Lowers touch controls for children"
          >
            <ChevronDown className={`w-4 h-4 ${kidsReachMode ? 'animate-bounce' : ''}`} />
            <span>{kidsReachMode ? 'Kids Reach: ON (Lowered)' : 'Kids Reach Height'}</span>
          </button>

          {/* Kiosk Auto-Reset Idle Counter */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400">
            <Timer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Idle Reset: {idleSeconds}s</span>
            <button
              type="button"
              onClick={() => setTimerPaused(!timerPaused)}
              className="hover:text-white cursor-pointer ml-1"
              title={timerPaused ? 'Resume countdown' : 'Pause timer'}
            >
              {timerPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Right: Cloud Printer Status & Sound */}
        <div className="flex items-center gap-2.5">
          {/* Cloud Printer Connection Pill */}
          <button
            type="button"
            onClick={onOpenCloudPrinter}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 border border-sky-400/40 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
          >
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>Cloud Printer: Ready</span>
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

      {/* 2. Main Touch TV Widescreen Split Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 gap-6 overflow-hidden">
        {/* LEFT COLUMN (44% Width): GIANT 4K CHARACTER CANVAS & 1-TOUCH PRINT */}
        <div className="w-full lg:w-[44%] flex flex-col justify-between items-center">
          {/* Top Stage Header / Mode Switcher */}
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
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  renderMode === 'color'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Full Color
              </button>
            </div>
          </div>

          {/* Giant Interactive Canvas Card */}
          <div className="w-full flex-1 max-h-[500px] bg-white rounded-3xl p-3 shadow-2xl border-4 border-indigo-500/40 flex items-center justify-center relative overflow-hidden group">
            <PlayyComposition
              config={config}
              mode={renderMode}
              showBackground={true}
              showLogoHeader={true}
              className="w-full h-full object-contain"
            />

            {/* Print Confirmation Banner */}
            {printSuccessToast && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg animate-bounce">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-white">Printing Sent to Cloud Printer!</h3>
                <p className="text-xs text-emerald-300 mt-1 max-w-xs font-bold">
                  Your coloring sheet is printing right now at the kiosk tray beside the TV.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Actions for Touch TV: Giant 1-Touch Print & Surprise Me */}
          <div className="w-full grid grid-cols-3 gap-3 mt-4">
            {/* Giant 1-Touch Cloud Print Button (Spans 2 columns) */}
            <button
              type="button"
              onClick={handle1TouchCloudPrint}
              disabled={isPrinting}
              className="col-span-2 py-4 px-5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl shadow-xl border-3 border-amber-300 flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all"
            >
              <Printer className={`w-7 h-7 text-slate-950 ${isPrinting ? 'animate-spin' : ''}`} />
              <div className="text-left">
                <div className="text-base font-black leading-tight">
                  {isPrinting ? 'Dispensing Printout...' : '1-TOUCH CLOUD PRINT'}
                </div>
                <div className="text-[11px] text-amber-950/80 font-bold">
                  Instant Vector Coloring Page &bull; No Dialog
                </div>
              </div>
            </button>

            {/* Giant Surprise Dice Button */}
            <button
              type="button"
              onClick={() => {
                handleUserTouch();
                nativeFeedback.impactMedium();
                onRandomize();
              }}
              className="py-4 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl border-2 border-indigo-400 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-98 transition-all"
            >
              <Dices className="w-6 h-6 text-amber-300" />
              <span className="text-xs font-black">Surprise Me!</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (56% Width): GIANT TOUCH-FRIENDLY CONFIGURATOR TILES */}
        <div className={`w-full lg:w-[56%] flex flex-col justify-between ${kidsReachMode ? 'pt-8' : ''}`}>
          {/* Top Giant Category Tabs */}
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
                    handleUserTouch();
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

          {/* Giant Touch Tile Grid Area */}
          <div className="flex-1 bg-slate-950/80 p-4 rounded-3xl border-2 border-indigo-900/50 overflow-y-auto max-h-[460px]">
            {/* CATEGORY: HEADS */}
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

            {/* CATEGORY: POSES */}
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

            {/* CATEGORY: SYMBOLS */}
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

            {/* CATEGORY: BACKGROUNDS */}
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

          {/* Quick Footer Helper Bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Touch any item on screen to customize instantly.</span>
            </div>

            <button
              type="button"
              onClick={onOpenCloudPrinter}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
            >
              Configure Cloud Printer &bull; Setup Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
