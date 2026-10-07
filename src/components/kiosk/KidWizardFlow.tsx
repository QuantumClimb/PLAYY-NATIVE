import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Printer,
  Check,
  Sparkles,
  Dices,
  Volume2,
  VolumeX,
  Cloud,
  Home,
  Delete,
  Smile,
  Zap,
  Star,
  Globe,
  User,
  CheckCircle2,
} from 'lucide-react';
import { PlayyConfiguration, RenderMode, HeadId, PoseId, SymbolId, BackgroundId } from '../../lib/playys/types';
import { HEADS } from '../../lib/playys/heads';
import { POSES } from '../../lib/playys/poses';
import { SYMBOLS } from '../../lib/playys/symbols';
import { BACKGROUNDS } from '../../lib/playys/backgrounds';
import { PlayyComposition } from '../playys/PlayyComposition';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

export type KidStep = 'head' | 'body' | 'symbol' | 'world' | 'name' | 'review';

interface KidWizardFlowProps {
  config: PlayyConfiguration;
  onChangeConfig: (newConfig: PlayyConfiguration) => void;
  onFinishAndPrint: () => void;
  onBackToStart: () => void;
  onOpenCloudPrinter: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRandomize: () => void;
}

const STEPS_ORDER: KidStep[] = ['head', 'body', 'symbol', 'world', 'name', 'review'];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const PRESET_NAMES = ['LEO', 'EMMA', 'MAX', 'MIA', 'LUCAS', 'AVA', 'NOAH', 'SUPERSTAR'];

export const KidWizardFlow: React.FC<KidWizardFlowProps> = ({
  config,
  onChangeConfig,
  onFinishAndPrint,
  onBackToStart,
  onOpenCloudPrinter,
  soundEnabled,
  onToggleSound,
  onRandomize,
}) => {
  const [currentStep, setCurrentStep] = useState<KidStep>('head');
  const [renderMode, setRenderMode] = useState<RenderMode>('coloring');

  const currentStepIndex = STEPS_ORDER.indexOf(currentStep);

  const handleNext = () => {
    nativeFeedback.impactLight();
    const nextIdx = Math.min(currentStepIndex + 1, STEPS_ORDER.length - 1);
    setCurrentStep(STEPS_ORDER[nextIdx]);
  };

  const handleBack = () => {
    nativeFeedback.impactLight();
    if (currentStepIndex === 0) {
      onBackToStart();
    } else {
      setCurrentStep(STEPS_ORDER[currentStepIndex - 1]);
    }
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

  // Keyboard handlers for ENTER YOUR NAME
  const handleKeyPress = (char: string) => {
    nativeFeedback.impactLight();
    const currentName = config.kidName || '';
    if (currentName.length < 15) {
      onChangeConfig({ ...config, kidName: currentName + char });
    }
  };

  const handleBackspace = () => {
    nativeFeedback.impactLight();
    const currentName = config.kidName || '';
    onChangeConfig({ ...config, kidName: currentName.slice(0, -1) });
  };

  const handleClearName = () => {
    nativeFeedback.impactLight();
    onChangeConfig({ ...config, kidName: '' });
  };

  const handleSetPresetName = (name: string) => {
    nativeFeedback.impactMedium();
    onChangeConfig({ ...config, kidName: name });
  };

  const stepTitle =
    currentStep === 'head'
      ? '1. PICK MY HEAD'
      : currentStep === 'body'
      ? '2. PICK MY BODY'
      : currentStep === 'symbol'
      ? '3. PICK MY SYMBOL'
      : currentStep === 'world'
      ? '4. PICK MY WORLD'
      : currentStep === 'name'
      ? '5. ENTER YOUR NAME'
      : '6. OK OR RETRY?';

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden">
      {/* 1. Kid Navigation Header Bar */}
      <div className="w-full bg-slate-950/75 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-2xl border border-indigo-900/60 flex items-center justify-between z-20 shrink-0 mb-3 shadow-lg">
        {/* Left: Home / Start Screen button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToStart}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
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

        {/* Center: Big Step Title Callout */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-5 py-1.5 rounded-full font-black text-sm sm:text-base tracking-wide shadow-md flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{stepTitle}</span>
          </div>
        </div>

        {/* Right: Surprise, Cloud Printer & Sound */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              nativeFeedback.impactMedium();
              onRandomize();
            }}
            className="flex items-center gap-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-black border border-indigo-400/50 shadow-xs cursor-pointer active:scale-95 transition-all"
            title="Randomize"
          >
            <Dices className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Surprise!</span>
          </button>

          <button
            type="button"
            onClick={onOpenCloudPrinter}
            className="flex items-center gap-1 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-400/40 px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-xs"
            title="Cloud Printer"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </button>

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

      {/* 2. Step Progress Dots Pill */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-4 mb-3 shrink-0">
        {STEPS_ORDER.map((s, idx) => {
          const isCurrent = s === currentStep;
          const isPassed = idx < currentStepIndex;
          const stepLabel =
            s === 'head'
              ? 'Head'
              : s === 'body'
              ? 'Body'
              : s === 'symbol'
              ? 'Symbol'
              : s === 'world'
              ? 'World'
              : s === 'name'
              ? 'Name'
              : 'OK?';

          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                nativeFeedback.selection();
                setCurrentStep(s);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer border ${
                isCurrent
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                  : isPassed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
            >
              <span>{idx + 1}.</span>
              <span className="hidden sm:inline">{stepLabel}</span>
              {isPassed && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
            </button>
          );
        })}
      </div>

      {/* 3. Main Workspace Area: Split Screen (Character on Left, Step Choices on Right) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch overflow-hidden">
        {/* LEFT COLUMN: LIVE CHARACTER PREVIEW STAGE */}
        <div className="w-full lg:w-[42%] flex flex-col justify-between items-center shrink-0">
          {/* Stage Header */}
          <div className="w-full flex items-center justify-between mb-1.5">
            <span className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Your PLAYY Preview
            </span>

            {/* Mode Switcher */}
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
                Color Preview
              </button>
            </div>
          </div>

          {/* Character Canvas Card */}
          <div className="w-full flex-1 max-h-[500px] bg-white rounded-3xl p-3 shadow-2xl border-4 border-indigo-500/40 flex items-center justify-center relative overflow-hidden">
            <PlayyComposition
              config={config}
              mode={renderMode}
              showBackground={true}
              showLogoHeader={true}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Current Selection summary pill */}
          <div className="mt-2 text-xs font-bold text-slate-400 text-center">
            {config.kidName ? (
              <span className="text-amber-300 font-extrabold">{config.kidName}&apos;s PLAYY &bull; </span>
            ) : null}
            <span>{config.head.toUpperCase()} &bull; {config.pose.toUpperCase()} &bull; {config.symbol.toUpperCase()} &bull; {config.background.toUpperCase()}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: DEDICATED KID-FRIENDLY CHOICES FOR CURRENT STEP */}
        <div className="w-full lg:w-[58%] flex flex-col justify-between overflow-hidden">
          {/* STEP 1: PICK MY HEAD */}
          {currentStep === 'head' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="bg-slate-950/80 p-5 rounded-3xl border-2 border-indigo-900/50 flex-1 flex flex-col justify-center">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-black text-amber-300">Choose Your Head</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Tap on the head you like best!</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {HEADS.map((h) => {
                    const isSelected = config.head === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleSelectHead(h.id)}
                        className={`min-h-[140px] p-5 rounded-3xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border-4 ${
                          isSelected
                            ? 'bg-gradient-to-b from-indigo-700 to-indigo-900 text-white border-amber-400 shadow-2xl scale-105'
                            : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        <div
                          className="w-14 h-14 rounded-full border-3 border-white/80 mb-3 shadow-lg"
                          style={{ backgroundColor: h.primaryColor }}
                        />
                        <div className="text-lg font-black">{h.name}</div>
                        <div className="text-xs text-slate-400 mt-1 font-semibold">{h.tagline}</div>
                        {isSelected && (
                          <div className="mt-2 bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>CHOSEN</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Step Nav */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-base rounded-2xl border-2 border-slate-700 cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl border-3 border-amber-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span>NEXT: PICK MY BODY</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PICK MY BODY */}
          {currentStep === 'body' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="bg-slate-950/80 p-5 rounded-3xl border-2 border-indigo-900/50 flex-1 flex flex-col justify-center">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-black text-amber-300">Choose Your Body Pose</h3>
                  <p className="text-xs text-slate-400 mt-0.5">How should your PLAYY stand?</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {POSES.map((p) => {
                    const isSelected = config.pose === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPose(p.id)}
                        className={`min-h-[110px] p-5 rounded-3xl flex items-center justify-between text-left transition-all cursor-pointer border-4 ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-700 to-indigo-900 text-white border-amber-400 shadow-2xl scale-[1.03]'
                            : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="text-lg font-black">{p.name}</div>
                          <div className="text-xs text-slate-400 mt-1 font-semibold">{p.description}</div>
                        </div>
                        {isSelected ? (
                          <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Step Nav */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-base rounded-2xl border-2 border-slate-700 cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl border-3 border-amber-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span>NEXT: PICK MY SYMBOL</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PICK MY SYMBOL */}
          {currentStep === 'symbol' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="bg-slate-950/80 p-5 rounded-3xl border-2 border-indigo-900/50 flex-1 flex flex-col justify-center">
                <div className="text-center mb-3">
                  <h3 className="text-2xl font-black text-amber-300">Choose Your Chest Symbol</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pick the emblem for your character&apos;s shirt!</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {SYMBOLS.map((s) => {
                    const isSelected = config.symbol === s.id;
                    const emoji =
                      s.name === 'Star'
                        ? '⭐'
                        : s.name === 'Heart'
                        ? '💖'
                        : s.name === 'Lightning'
                        ? '⚡'
                        : s.name === 'Cloud'
                        ? '☁️'
                        : s.name === 'Flame'
                        ? '🔥'
                        : s.name === 'Moon'
                        ? '🌙'
                        : s.name === 'Crown'
                        ? '👑'
                        : s.name === 'Paw'
                        ? '🐾'
                        : '⚙️';

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSymbol(s.id)}
                        className={`min-h-[85px] p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-3 ${
                          isSelected
                            ? 'bg-indigo-700 text-white border-amber-400 shadow-2xl scale-105'
                            : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        <span className="text-3xl mb-1">{emoji}</span>
                        <span className="text-xs font-black">{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Step Nav */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-base rounded-2xl border-2 border-slate-700 cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl border-3 border-amber-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span>NEXT: PICK MY WORLD</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PICK MY WORLD */}
          {currentStep === 'world' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="bg-slate-950/80 p-5 rounded-3xl border-2 border-indigo-900/50 flex-1 flex flex-col justify-center">
                <div className="text-center mb-3">
                  <h3 className="text-2xl font-black text-amber-300">Choose Your World Background</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Where is your PLAYY playing today?</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BACKGROUNDS.map((b) => {
                    const isSelected = config.background === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBackground(b.id)}
                        className={`min-h-[100px] p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border-3 ${
                          isSelected
                            ? 'bg-indigo-700 text-white border-amber-400 shadow-2xl scale-105'
                            : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl mb-2 shadow-xs border border-white/40"
                          style={{ backgroundColor: b.themeColor }}
                        />
                        <span className="text-sm font-black leading-tight">{b.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Step Nav */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-base rounded-2xl border-2 border-slate-700 cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl border-3 border-amber-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span>NEXT: ENTER YOUR NAME</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: ENTER YOUR NAME */}
          {currentStep === 'name' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="bg-slate-950/80 p-5 rounded-3xl border-2 border-indigo-900/50 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-center mb-3">
                    <h3 className="text-2xl font-black text-amber-300">What is Your Name?</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Your name will be printed on the coloring sheet!</p>
                  </div>

                  {/* Big Name Display Box */}
                  <div className="w-full bg-slate-900 border-3 border-indigo-500 rounded-2xl p-3 flex items-center justify-between mb-3 shadow-inner">
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-6 h-6 text-indigo-400 shrink-0" />
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Coloring Page By:</span>
                      <span className="text-2xl font-black text-amber-300 tracking-wider truncate font-mono">
                        {config.kidName && config.kidName.trim() ? config.kidName.toUpperCase() : 'YOUR NAME HERE'}
                      </span>
                    </div>

                    {config.kidName && (
                      <button
                        type="button"
                        onClick={handleClearName}
                        className="text-xs text-slate-400 hover:text-red-400 font-bold px-2 py-1 rounded-lg bg-slate-800"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Quick Preset Nicknames / Stickers for younger kids */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center mb-3">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Picks:</span>
                    {PRESET_NAMES.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleSetPresetName(name)}
                        className={`text-xs font-black px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                          config.kidName === name
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* On-Screen Touch Virtual Keyboard */}
                <div className="w-full flex flex-col gap-1.5 max-w-lg mx-auto">
                  {KEYBOARD_ROWS.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex justify-center gap-1.5">
                      {row.map((char) => (
                        <button
                          key={char}
                          type="button"
                          onClick={() => handleKeyPress(char)}
                          className="w-9 h-11 sm:w-11 sm:h-12 bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-white font-black text-base sm:text-lg rounded-xl shadow-md border border-slate-700 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                        >
                          {char}
                        </button>
                      ))}
                    </div>
                  ))}

                  {/* Space and Delete Row */}
                  <div className="flex justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => handleKeyPress(' ')}
                      className="flex-1 max-w-xs h-11 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-sm rounded-xl border border-slate-700 cursor-pointer flex items-center justify-center"
                    >
                      SPACE
                    </button>
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="w-16 h-11 bg-slate-800 hover:bg-slate-700 text-red-300 font-black text-sm rounded-xl border border-slate-700 cursor-pointer flex items-center justify-center"
                    >
                      ⌫
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Step Nav */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-base rounded-2xl border-2 border-slate-700 cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl border-3 border-amber-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span>NEXT: CHECK MY PLAYY</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: OK / RETRY CONFIRMATION */}
          {currentStep === 'review' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="bg-slate-950/80 p-5 rounded-3xl border-2 border-indigo-900/50 flex-1 flex flex-col justify-between text-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Step 6: Ready to Print</span>
                  </div>

                  <h3 className="text-3xl font-black text-white">How Does Your PLAYY Look?</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                    Check your character below. If you want to change anything, tap <strong>RETRY</strong>. If you love it, tap <strong>OK! PRINT MY PLAYY</strong>!
                  </p>
                </div>

                {/* Summary Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 max-w-lg mx-auto w-full">
                  <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Head</div>
                    <div className="text-sm font-black text-indigo-300">{config.head.toUpperCase()}</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Body</div>
                    <div className="text-sm font-black text-indigo-300">{config.pose.toUpperCase()}</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Symbol</div>
                    <div className="text-sm font-black text-indigo-300">{config.symbol.toUpperCase()}</div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Name</div>
                    <div className="text-sm font-black text-amber-300 truncate">
                      {config.kidName && config.kidName.trim() ? config.kidName.toUpperCase() : 'SUPERSTAR'}
                    </div>
                  </div>
                </div>

                {/* Two Giant Buttons: OK vs RETRY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto w-full pt-2">
                  {/* RETRY / CHANGE SOMETHING */}
                  <button
                    type="button"
                    onClick={() => {
                      nativeFeedback.impactMedium();
                      setCurrentStep('head');
                    }}
                    className="py-5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-base sm:text-lg rounded-2xl border-2 border-slate-700 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 transition-all shadow-lg"
                  >
                    <RotateCcw className="w-5 h-5 text-amber-400" />
                    <span>RETRY / CHANGE</span>
                  </button>

                  {/* OK! PRINT MY PLAYY! */}
                  <button
                    type="button"
                    onClick={() => {
                      nativeFeedback.notificationSuccess();
                      onFinishAndPrint();
                    }}
                    className="py-5 px-6 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black text-lg sm:text-xl rounded-2xl border-3 border-emerald-300 flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition-all shadow-[0_10px_35px_rgba(16,185,129,0.4)] animate-pulse"
                  >
                    <Printer className="w-6 h-6 stroke-[2.5]" />
                    <span>OK! PRINT PLAYY!</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
