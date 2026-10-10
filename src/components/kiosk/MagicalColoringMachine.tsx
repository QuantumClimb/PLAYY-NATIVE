import React, { useState, useEffect } from 'react';
import {
  PlayyConfiguration,
  HeadId,
  PoseId,
  SymbolId,
  BackgroundId,
} from '../../lib/playys/types';
import { useAssetLibrary, useSelection } from '../../lib/assets/library';
import { normalizeColor } from '../../lib/assets/svgParts';
import { SCENE_H, SCENE_W } from '../../lib/assets/scene';
import { AssetArt } from '../playys/AssetArt';
import { PlayyScene } from '../playys/PlayyScene';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';
import { QUIZ_QUESTIONS } from '../../lib/playys/questions';
import { calculateArchetype } from '../../lib/playys/archetypes';
import { BASE_STATS, CharacterStats, GeneratedCard } from '../../lib/playys/cardTypes';
import { TrumpCardFront, TrumpCardBack, CARD_W, CARD_H } from '../card/TrumpCard';

export type MachineStep = 'head' | 'body' | 'symbol' | 'world' | 'name' | 'quiz' | 'review';

interface MagicalColoringMachineProps {
  config: PlayyConfiguration;
  onChangeConfig: (newConfig: PlayyConfiguration) => void;
  card: GeneratedCard | null;
  onCardChange: (card: GeneratedCard | null) => void;
  onFinishAndPrint: () => void;
  onAutoReset: () => void;
}

const STEPS_LIST: MachineStep[] = ['head', 'body', 'symbol', 'world', 'name', 'quiz', 'review'];

const STAT_KEYS: (keyof CharacterStats)[] = ['power', 'speed', 'intelligence', 'energy', 'courage'];

const KEYBOARD_LETTERS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const ChoiceCard: React.FC<{
  selected: boolean;
  onClick: () => void;
  label: string;
  compact?: boolean;
  children: React.ReactNode;
}> = ({ selected, onClick, label, compact, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 rounded-[28px] flex flex-col items-center justify-between gap-2 transition-all cursor-pointer border-[5px] ${
      selected
        ? 'bg-gradient-to-b from-indigo-700 to-indigo-900 text-white border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.6)] scale-[1.03]'
        : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
    }`}
  >
    <div className={`${compact ? 'h-20 sm:h-24' : 'h-32 sm:h-44'} w-full flex items-center justify-center`}>{children}</div>
    <div className="text-sm sm:text-base font-black uppercase leading-tight text-center">{label}</div>
    {selected && <div className="text-amber-300 font-black text-xs">✔ SELECTED</div>}
  </button>
);

export const MagicalColoringMachine: React.FC<MagicalColoringMachineProps> = ({
  config,
  onChangeConfig,
  card,
  onCardChange,
  onFinishAndPrint,
  onAutoReset,
}) => {
  const lib = useAssetLibrary();
  const sel = useSelection(config);
  const [currentStep, setCurrentStep] = useState<MachineStep>('head');
  const [idleSeconds, setIdleSeconds] = useState(45);
  const [answers, setAnswers] = useState<number[]>([]);
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');

  const stepIndex = STEPS_LIST.indexOf(currentStep);

  // Inactivity auto-reset: 45 seconds of no touches returns to idle movie
  const resetIdleTimer = () => {
    setIdleSeconds(45);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIdleSeconds((prev) => {
        if (prev <= 1) {
          onAutoReset();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onAutoReset]);

  // Navigation handlers
  const goNext = () => {
    resetIdleTimer();
    nativeFeedback.impactLight();
    const nextIdx = Math.min(stepIndex + 1, STEPS_LIST.length - 1);
    setCurrentStep(STEPS_LIST[nextIdx]);
  };

  // Quiz: each answer adds its stat boost on top of the base stats (capped at 100)
  const handleAnswer = (optionIndex: number) => {
    resetIdleTimer();
    nativeFeedback.selection();
    const next = [...answers, optionIndex];
    if (next.length < QUIZ_QUESTIONS.length) {
      setAnswers(next);
      return;
    }
    const stats: CharacterStats = { ...BASE_STATS };
    next.forEach((optIdx, qIdx) => {
      const boost = QUIZ_QUESTIONS[qIdx].options[optIdx].statBoost;
      STAT_KEYS.forEach((k) => {
        stats[k] = Math.min(100, stats[k] + (boost[k] ?? 0));
      });
    });
    onCardChange({
      id: Math.random().toString(36).substring(2, 9),
      config,
      stats,
      archetype: calculateArchetype(stats),
      createdAt: new Date().toISOString(),
    });
    setAnswers([]);
    setCardSide('front');
    setCurrentStep('review');
  };

  const goBack = () => {
    resetIdleTimer();
    nativeFeedback.impactLight();
    if (currentStep === 'quiz' && answers.length > 0) {
      setAnswers(answers.slice(0, -1));
      return;
    }
    if (stepIndex === 0) {
      onAutoReset();
    } else {
      setCurrentStep(STEPS_LIST[stepIndex - 1]);
    }
  };

  // Selection handlers
  const handleSelectHead = (head: HeadId) => {
    resetIdleTimer();
    nativeFeedback.selection();
    onChangeConfig({ ...config, head });
  };

  const handleSelectPose = (pose: PoseId) => {
    resetIdleTimer();
    nativeFeedback.selection();
    onChangeConfig({ ...config, pose });
  };

  const handleSelectSymbol = (symbol: SymbolId) => {
    resetIdleTimer();
    nativeFeedback.selection();
    onChangeConfig({ ...config, symbol });
  };

  const handleSelectBackground = (background: BackgroundId) => {
    resetIdleTimer();
    nativeFeedback.selection();
    onChangeConfig({ ...config, background });
  };

  // Keyboard letter inputs
  const handleLetterTap = (letter: string) => {
    resetIdleTimer();
    nativeFeedback.impactLight();
    const current = config.kidName || '';
    if (current.length < 10) {
      onChangeConfig({ ...config, kidName: current + letter });
    }
  };

  const handleBackspace = () => {
    resetIdleTimer();
    nativeFeedback.impactLight();
    const current = config.kidName || '';
    onChangeConfig({ ...config, kidName: current.slice(0, -1) });
  };

  const handleSkipName = () => {
    resetIdleTimer();
    nativeFeedback.impactMedium();
    onChangeConfig({ ...config, kidName: '' });
    goNext();
  };

  // Surprise Me per step
  const handleStepSurprise = () => {
    resetIdleTimer();
    nativeFeedback.impactMedium();
    const any = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
    if (currentStep === 'head') {
      onChangeConfig({ ...config, head: any(lib.heads).slug });
    } else if (currentStep === 'body') {
      onChangeConfig({ ...config, pose: any(lib.bodies).slug });
    } else if (currentStep === 'symbol' && lib.symbols.length) {
      onChangeConfig({ ...config, symbol: any(lib.symbols).slug });
    } else if (currentStep === 'world') {
      onChangeConfig({ ...config, background: any(lib.backgrounds).slug });
    }
  };

  // Screen Title: ONE BIG QUESTION
  const questionTitle =
    currentStep === 'head'
      ? 'CHOOSE YOUR HEAD'
      : currentStep === 'body'
      ? 'HOW SHOULD YOUR PLAYY MOVE?'
      : currentStep === 'symbol'
      ? 'PICK YOUR POWER'
      : currentStep === 'world'
      ? 'WHERE WILL YOUR PLAYY GO?'
      : currentStep === 'name'
      ? "WHAT'S YOUR NAME?"
      : currentStep === 'quiz'
      ? QUIZ_QUESTIONS[answers.length]?.question ?? ''
      : 'YOUR PLAYY TRUMP CARD IS READY!';

  const isReview = currentStep === 'review';

  return (
    <div
      onClick={resetIdleTimer}
      className="w-full h-full min-h-0 bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950 text-white flex flex-col lg:flex-row gap-3 lg:gap-8 px-3 sm:px-5 py-2 select-none relative overflow-hidden"
    >
      {/* LEFT: the live preview, as tall as the screen allows (an A4 page) */}
      {!isReview && (
        <div className="lg:w-[46%] h-[42vh] lg:h-full min-h-0 shrink-0 flex items-center justify-center">
          <div
            className="relative h-full max-w-full bg-white rounded-[30px] border-[6px] border-amber-300/90 shadow-[0_25px_80px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{ aspectRatio: `${SCENE_W} / ${SCENE_H}` }}
          >
            <PlayyScene config={config} mode="color" className="w-full h-full" />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-xs px-4 py-1 rounded-full shadow-md uppercase tracking-wider whitespace-nowrap">
              ★ MAGIC MIRROR ★
            </div>
          </div>
        </div>
      )}

      {/* RIGHT: progress, the one big question, the choices, and navigation */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
      <div className="w-full flex items-center justify-between gap-3 px-1 shrink-0 z-20">
        <img src="/assets/logo.png" alt="PLAYYS" draggable={false} className="h-12 sm:h-14 w-auto object-contain" />

        {/* Minimal Stepper dots */}
        <div className="flex items-center gap-2 sm:gap-3">
          {STEPS_LIST.map((step, idx) => (
            <React.Fragment key={step}>
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  idx === stepIndex
                    ? 'bg-amber-400 scale-125 shadow-[0_0_12px_#FBBF24]'
                    : idx < stepIndex
                    ? 'bg-emerald-400'
                    : 'bg-slate-800'
                }`}
              />
              {idx < STEPS_LIST.length - 1 && (
                <div
                  className={`w-4 sm:w-6 h-1 rounded-full ${
                    idx < stepIndex ? 'bg-emerald-500/80' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Surprise me mini toy button */}
        {currentStep !== 'name' && currentStep !== 'quiz' && currentStep !== 'review' ? (
          <button
            type="button"
            onClick={handleStepSurprise}
            className="btn-3d btn-3d-amber btn-3d-sm flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0"
          >
            <span>✨</span>
            <span className="hidden sm:inline">SURPRISE ME</span>
          </button>
        ) : (
          <div className="w-20" />
        )}
      </div>

      {/* 2. Top Title: ONE BIG QUESTION */}
      <div className="w-full text-center py-2 shrink-0 z-20">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
          {questionTitle}
        </h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-2 z-10">
          {/* STEP 1: CHOOSE YOUR HEAD */}
          {currentStep === 'head' && (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 p-2 min-h-full content-center">
              {lib.heads.map((h) => (
                <ChoiceCard key={h.id} selected={sel.head.slug === h.slug} onClick={() => handleSelectHead(h.slug)} label={h.name}>
                  <AssetArt asset={h} face={lib.face} mode="color" main={normalizeColor(h.meta.main) ?? '#3b82f6'} className="h-full max-w-full" />
                </ChoiceCard>
              ))}
            </div>
          )}

          {/* STEP 2: HOW SHOULD YOUR PLAYY MOVE? */}
          {currentStep === 'body' && (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 p-2 min-h-full content-center">
              {lib.bodies.map((b) => (
                <ChoiceCard key={b.id} selected={sel.body.slug === b.slug} onClick={() => handleSelectPose(b.slug)} label={b.name}>
                  <AssetArt asset={b} mode="color" main={sel.outfit} secondary={sel.secondary} className="h-full max-w-full" />
                </ChoiceCard>
              ))}
            </div>
          )}

          {/* STEP 3: PICK YOUR POWER */}
          {currentStep === 'symbol' && (
            <div className="grid grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-2 min-h-full content-center">
              {lib.symbols.map((sy) => (
                <ChoiceCard key={sy.id} selected={sel.symbol?.slug === sy.slug} onClick={() => handleSelectSymbol(sy.slug)} label={sy.name} compact>
                  <AssetArt asset={sy} mode="color" main={sel.headMain} className="h-full max-w-full" />
                </ChoiceCard>
              ))}
            </div>
          )}

          {/* STEP 4: WHERE WILL YOUR PLAYY GO? */}
          {currentStep === 'world' && (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 p-2 min-h-full content-center">
              {lib.backgrounds.map((bg) => (
                <ChoiceCard key={bg.id} selected={sel.background.slug === bg.slug} onClick={() => handleSelectBackground(bg.slug)} label={bg.name}>
                  <AssetArt asset={bg} mode="color" main={sel.headMain} className="h-full max-w-full rounded-xl overflow-hidden" />
                </ChoiceCard>
              ))}
            </div>
          )}

          {/* STEP 5: WHAT'S YOUR NAME? */}
          {currentStep === 'name' && (
            <div className="flex flex-col items-center justify-center p-2 space-y-4">
              {/* Large Name Display Card */}
              <div className="w-full max-w-lg bg-slate-900 border-4 border-amber-400 rounded-[28px] p-4 text-center shadow-xl">
                <div className="text-xs font-black text-amber-300 uppercase tracking-widest mb-1">
                  COLORING SHEET BY:
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-wider min-h-[56px] flex items-center justify-center">
                  {config.kidName && config.kidName.trim()
                    ? config.kidName.toUpperCase()
                    : '__________'}
                </div>
              </div>

              {/* Kid-Friendly Giant Touch Keyboard */}
              <div className="w-full max-w-lg flex flex-col gap-2">
                {KEYBOARD_LETTERS.map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-center gap-1.5 sm:gap-2">
                    {row.map((letter) => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => handleLetterTap(letter)}
                        className="w-10 h-13 sm:w-12 sm:h-14 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white font-black text-xl rounded-2xl shadow-md border-2 border-slate-700 transition-all cursor-pointer flex items-center justify-center"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                ))}

                {/* Bottom Backspace and Space Row */}
                <div className="flex justify-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleLetterTap(' ')}
                    className="flex-1 max-w-xs h-13 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-base rounded-2xl border-2 border-slate-700 cursor-pointer flex items-center justify-center"
                  >
                    SPACE
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="w-20 h-13 bg-slate-800 hover:bg-slate-700 text-red-300 font-black text-lg rounded-2xl border-2 border-slate-700 cursor-pointer flex items-center justify-center"
                  >
                    ⌫
                  </button>
                </div>
              </div>

              {/* Small Secondary Option: SKIP NAME */}
              <button
                type="button"
                onClick={handleSkipName}
                className="text-sm font-bold text-slate-400 hover:text-white underline cursor-pointer pt-1"
              >
                Skip Name &rarr;
              </button>
            </div>
          )}

          {/* STEP 6: QUESTIONNAIRE (3 questions, auto-advance) */}
          {currentStep === 'quiz' && QUIZ_QUESTIONS[answers.length] && (
            <div className="flex flex-col gap-4 p-2">
              <div className="text-center">
                <div className="text-sm font-bold text-amber-300 tracking-widest">
                  QUESTION {answers.length + 1} OF {QUIZ_QUESTIONS.length}
                </div>
                <div className="text-slate-300 text-base">{QUIZ_QUESTIONS[answers.length].subtitle}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {QUIZ_QUESTIONS[answers.length].options.map((opt, i) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleAnswer(i)}
                    className="min-h-[130px] p-5 rounded-[32px] flex flex-col items-center justify-center text-center cursor-pointer border-6 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-amber-400 active:scale-95 transition-all"
                  >
                    <div className="text-4xl mb-2">{opt.icon}</div>
                    <div className="text-lg font-black leading-tight">{opt.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: TRUMP CARD REVEAL (flip front/back, then print) */}
          {currentStep === 'review' && card && (() => {
            const scale = Math.min(1, (window.innerHeight * 0.52) / CARD_H, (window.innerWidth - 48) / CARD_W);
            return (
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8 p-2">
                <div className="flex flex-col items-center gap-3">
                  {cardSide === 'front' ? (
                    <TrumpCardFront card={card} scale={scale} />
                  ) : (
                    <TrumpCardBack card={card} scale={scale} />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      resetIdleTimer();
                      nativeFeedback.impactLight();
                      setCardSide(cardSide === 'front' ? 'back' : 'front');
                    }}
                    className="btn-3d btn-3d-blue py-3 px-6 font-bold text-base"
                  >
                    🔄 FLIP CARD
                  </button>
                </div>

                <div className="w-full max-w-md flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      nativeFeedback.notificationSuccess();
                      onFinishAndPrint();
                    }}
                    className="btn-3d w-full py-6 px-8 font-bold text-2xl sm:text-3xl flex items-center justify-center gap-3"
                  >
                    <span>🖨️</span>
                    <span>PRINT MY PLAYY!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      nativeFeedback.impactLight();
                      onCardChange(null);
                      setCurrentStep('head');
                    }}
                    className="btn-3d btn-3d-blue w-full py-4 px-6 font-bold text-lg"
                  >
                    <span>🔄 CHANGE SOMETHING</span>
                  </button>
                </div>
              </div>
            );
          })()}
      </div>

      {/* 4. Bottom Navigation: BACK on left, ONE DOMINANT NEXT ON RIGHT */}
      {currentStep !== 'review' && (
        <div className="w-full flex items-center justify-between px-2 pt-2 shrink-0 z-20">
          <button
            type="button"
            onClick={goBack}
            className="btn-3d btn-3d-blue py-4 px-8 font-bold text-lg"
          >
            ← BACK
          </button>

          {currentStep !== 'quiz' && (
          <button
            type="button"
            onClick={goNext}
            className="btn-3d py-5 px-10 font-bold text-xl sm:text-2xl flex items-center gap-3"
          >
            <span>NEXT</span>
            <span>→</span>
          </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
