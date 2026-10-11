import React, { useState, useEffect } from 'react';
import {
  PlayyConfiguration,
  HeadId,
  PoseId,
  BackgroundId,
} from '../../lib/playys/types';
import { useAssetLibrary, useSelection, Selection } from '../../lib/assets/library';
import { normalizeColor } from '../../lib/assets/svgParts';
import { SCENE_H, SCENE_W, layoutScene } from '../../lib/assets/scene';
import { AssetArt } from '../playys/AssetArt';
import { PlayyScene } from '../playys/PlayyScene';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';
import { calculateArchetype } from '../../lib/playys/archetypes';
import { BASE_STATS, CharacterStats, GeneratedCard } from '../../lib/playys/cardTypes';
import { TrumpCardFront, TrumpCardBack, CARD_W, CARD_H } from '../card/TrumpCard';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { SceneId } from '../../lib/backgrounds/types';
import {
  DEFAULT_POWER_QUIZ_QUESTIONS,
  PowerQuizQuestion,
  SYMBOL_MAP,
  calculatePowerSymbol,
} from '../../lib/playys/powerQuiz';

export type MachineStep = 'head' | 'pose' | 'colors' | 'quiz' | 'power' | 'world' | 'details' | 'preview' | 'card' | 'complete';

interface MagicalColoringMachineProps {
  config: PlayyConfiguration;
  onChangeConfig: (newConfig: PlayyConfiguration) => void;
  card: GeneratedCard | null;
  onCardChange: (card: GeneratedCard | null) => void;
  onFinishAndPrint: () => void;
  onAutoReset: () => void;
}

const STEPS_LIST: MachineStep[] = ['head', 'pose', 'colors', 'quiz', 'power', 'world', 'details', 'preview', 'card', 'complete'];

const DEFAULT_COLOR_PALETTE = [
  '#ef4444', '#f97316', '#facc15', '#84cc16', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
  '#f8fafc', '#1e293b',
];

const KEYBOARD_LETTERS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const rectStyle = (r: { x: number; y: number; w: number; h: number }): React.CSSProperties => ({
  position: 'absolute',
  left: `${(r.x / SCENE_W) * 100}%`,
  top: `${(r.y / SCENE_H) * 100}%`,
  width: `${(r.w / SCENE_W) * 100}%`,
  height: `${(r.h / SCENE_H) * 100}%`,
});

const regionLabel = (key: string) => key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const CMS_SCENE_BY_STEP: Record<MachineStep, SceneId> = {
  head: 'head',
  pose: 'body',
  colors: 'symbol',
  quiz: 'quiz',
  power: 'symbol',
  world: 'world',
  details: 'name',
  preview: 'review',
  card: 'review',
  complete: 'celebrate',
};

const CharacterStagePreview: React.FC<{
  selection: Selection;
  config: PlayyConfiguration;
  mode?: 'color' | 'line';
  headOnly?: boolean;
  showSymbol?: boolean;
  showBackground?: boolean;
}> = ({ selection, config, mode = 'color', headOnly = false, showSymbol = false, showBackground = false }) => {
  if (headOnly) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl p-8">
        <AssetArt
          asset={selection.head}
          face={selection.face}
          mode={mode}
          main={selection.headMain}
          secondary={selection.secondary}
          className="h-[78%] w-auto max-w-[92%]"
        />
      </div>
    );
  }

  const layout = layoutScene({
    background: selection.background,
    body: selection.body,
    head: selection.head,
    symbol: showSymbol ? selection.symbol : null,
  });

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-white" style={{ aspectRatio: `${SCENE_W} / ${SCENE_H}` }}>
      {/* The visitor-selected world background belongs inside the character
          preview card; SceneBackground above is only the kiosk chrome. */}
      {showBackground && (
        <AssetArt
          asset={selection.background}
          mode={mode}
          main={selection.headMain}
          stretch
          style={rectStyle(layout.background)}
        />
      )}
      <AssetArt
        asset={selection.body}
        mode={mode}
        main={config.colors?.body ?? selection.outfit}
        secondary={selection.secondary}
        partColors={config.colors?.clothing}
        style={rectStyle(layout.body)}
      />
      {showSymbol && selection.symbol && layout.symbol && (
        <AssetArt
          asset={selection.symbol}
          mode={mode}
          main={selection.headMain}
          style={rectStyle(layout.symbol)}
        />
      )}
      <AssetArt
        asset={selection.head}
        face={selection.face}
        mode={mode}
        main={selection.headMain}
        secondary={selection.secondary}
        style={rectStyle(layout.head)}
      />
    </div>
  );
};

const PoseCardPreview: React.FC<{
  selection: Selection;
  body: Selection['body'];
  config: PlayyConfiguration;
}> = ({ selection, body, config }) => {
  const layout = layoutScene({
    background: selection.background,
    body,
    head: selection.head,
    symbol: null,
  });

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl bg-white"
      style={{ aspectRatio: `${SCENE_W} / ${SCENE_H}` }}
    >
      <AssetArt
        asset={body}
        mode="color"
        main={config.colors?.body ?? selection.outfit}
        secondary={selection.secondary}
        partColors={config.colors?.clothing}
        style={rectStyle(layout.body)}
      />
      <AssetArt
        asset={selection.head}
        face={selection.face}
        mode="color"
        main={selection.headMain}
        secondary={selection.secondary}
        style={rectStyle(layout.head)}
      />
    </div>
  );
};

const ChoiceCard: React.FC<{
  selected: boolean;
  onClick: () => void;
  label: string;
  selectionCard?: boolean;
  children: React.ReactNode;
}> = ({ selected, onClick, label, selectionCard = false, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${selectionCard ? 'group flex h-full min-h-[238px] w-full flex-col items-center p-3 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/80' : 'flex flex-col items-center justify-between gap-2 p-3'} rounded-[28px] border-[5px] transition-all cursor-pointer ${
      selected
        ? 'bg-gradient-to-b from-indigo-700 to-indigo-900 text-white border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.6)]'
        : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
    } ${!selectionCard && selected ? 'scale-[1.03]' : ''}`}
  >
    {selectionCard ? (
      <div className="flex h-44 min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl bg-white/95 p-3 sm:h-52">
        <div className="flex h-full w-full min-h-0 items-center justify-center">{children}</div>
      </div>
    ) : (
      <div className="flex h-32 w-full items-center justify-center sm:h-44">{children}</div>
    )}
    <div className={`${selectionCard ? 'mt-3 min-h-[2.5rem] sm:text-base' : ''} text-center text-sm font-black uppercase leading-tight`}>{label}</div>
    {selectionCard && !selected && <div className="min-h-4" aria-hidden="true" />}
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
  const [detailsStep, setDetailsStep] = useState<1 | 2 | 3>(1);
  const [activeDetailField, setActiveDetailField] = useState<'name' | 'phone' | 'email'>('name');
  const [nameShift, setNameShift] = useState(true);
  const [detailsError, setDetailsError] = useState('');
  const [idleSeconds, setIdleSeconds] = useState(45);
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
    if (currentStep === 'details' && detailsStep < 3) {
      setDetailsStep((step) => (step + 1) as 1 | 2 | 3);
      setActiveDetailField(detailsStep === 1 ? 'phone' : 'email');
      return;
    }
    if (currentStep === 'details' && detailsStep === 3) {
      if (!config.kidName?.trim() || !config.phone?.trim() || !config.email?.trim()) {
        setDetailsError('Please complete your name, phone number, and email.');
        return;
      }
      setDetailsError('');
    }
    const nextIdx = Math.min(stepIndex + 1, STEPS_LIST.length - 1);
    setCurrentStep(STEPS_LIST[nextIdx]);
  };

  // Power Quiz state
  const [powerQuestions, setPowerQuestions] = useState<PowerQuizQuestion[]>(DEFAULT_POWER_QUIZ_QUESTIONS);
  const [powerQuizAnswers, setPowerQuizAnswers] = useState<number[]>([]);
  const [powerQuestionIdx, setPowerQuestionIdx] = useState<number>(0);

  useEffect(() => {
    fetch('/api/power-quiz-questions')
      .then((r) => r.json())
      .then((d) => {
        if (d.questions && Array.isArray(d.questions) && d.questions.length > 0) {
          setPowerQuestions(d.questions);
        }
      })
      .catch(() => {});
  }, []);

  const handlePowerAnswer = (optionIndex: number) => {
    resetIdleTimer();
    nativeFeedback.selection();
    const nextAnswers = [...powerQuizAnswers, optionIndex];
    setPowerQuizAnswers(nextAnswers);

    if (nextAnswers.length < powerQuestions.length) {
      setPowerQuestionIdx(nextAnswers.length);
    } else {
      const availableSlugs = lib.symbols.map((s) => s.slug);
      const winningSlug = calculatePowerSymbol(powerQuestions, nextAnswers, availableSlugs);
      const nextConfig = { ...config, symbol: winningSlug };
      const stats: CharacterStats = { ...BASE_STATS };
      onChangeConfig(nextConfig);
      onCardChange({
        id: Math.random().toString(36).substring(2, 9),
        config: nextConfig,
        stats,
        archetype: calculateArchetype(stats),
        createdAt: new Date().toISOString(),
      });
      setCardSide('front');
      setCurrentStep('power');
    }
  };

  const handleRetakePowerQuiz = () => {
    resetIdleTimer();
    nativeFeedback.impactLight();
    setPowerQuizAnswers([]);
    setPowerQuestionIdx(0);
  };

  const goBack = () => {
    resetIdleTimer();
    nativeFeedback.impactLight();
    if (currentStep === 'details' && detailsStep > 1) {
      setDetailsStep((step) => (step - 1) as 1 | 2 | 3);
      setActiveDetailField(detailsStep === 3 ? 'phone' : 'name');
      setDetailsError('');
      return;
    }
    if (currentStep === 'quiz' && powerQuizAnswers.length > 0) {
      const prev = powerQuizAnswers.slice(0, -1);
      setPowerQuizAnswers(prev);
      setPowerQuestionIdx(prev.length);
      return;
    }
    if (currentStep === 'power') {
      const prev = powerQuizAnswers.slice(0, -1);
      setPowerQuizAnswers(prev);
      setCurrentStep('quiz');
      setPowerQuestionIdx(prev.length);
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

  const handleSelectBackground = (background: BackgroundId) => {
    resetIdleTimer();
    nativeFeedback.selection();
    onChangeConfig({ ...config, background });
  };

  const updateDetailField = (field: 'name' | 'phone' | 'email', value: string) => {
    if (field === 'name') onChangeConfig({ ...config, kidName: value.slice(0, 30) });
    else if (field === 'phone') onChangeConfig({ ...config, phone: value.slice(0, 24) });
    else onChangeConfig({ ...config, email: value.slice(0, 64) });
  };

  const detailValue = (field: 'name' | 'phone' | 'email') => field === 'name' ? (config.kidName || '') : (config[field] || '');

  const handleDetailKey = (key: string) => {
    resetIdleTimer();
    nativeFeedback.impactLight();
    if (key === 'SHIFT') {
      setNameShift((shift) => !shift);
      return;
    }
    const current = detailValue(activeDetailField);
    const value = key === 'BACKSPACE' ? current.slice(0, -1) : current + (activeDetailField === 'name' && !nameShift ? key.toLowerCase() : key);
    updateDetailField(activeDetailField, value);
  };

  const handleSkipName = () => {
    resetIdleTimer();
    nativeFeedback.impactMedium();
    onChangeConfig({ ...config, kidName: '' });
    setActiveDetailField('phone');
    goNext();
  };

  const handlePhone = (phone: string) => {
    resetIdleTimer();
    onChangeConfig({ ...config, phone });
  };

  const handleEmail = (email: string) => {
    resetIdleTimer();
    onChangeConfig({ ...config, email });
  };

  const handleColorChange = (region: string, color: string) => {
    resetIdleTimer();
    nativeFeedback.selection();
    if (region === 'body') {
      onChangeConfig({
        ...config,
        colors: { ...config.colors, body: color },
      });
      return;
    }
    onChangeConfig({
      ...config,
      colors: {
        ...config.colors,
        clothing: { ...config.colors?.clothing, [region]: color },
      },
    });
  };

  // Surprise Me per step
  const handleStepSurprise = () => {
    resetIdleTimer();
    nativeFeedback.impactMedium();
    const any = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
    if (currentStep === 'head') {
      onChangeConfig({ ...config, head: any(lib.heads).slug });
    } else if (currentStep === 'pose') {
      onChangeConfig({ ...config, pose: any(lib.bodies).slug });
    } else if (currentStep === 'world') {
      onChangeConfig({ ...config, background: any(lib.backgrounds).slug });
    }
  };

  // Screen Title: ONE BIG QUESTION
  const questionTitle =
    currentStep === 'head'
      ? 'CHOOSE YOUR HEAD'
      : currentStep === 'pose'
      ? 'CHOOSE YOUR POSE'
      : currentStep === 'colors'
      ? 'CHOOSE YOUR COLORS'
      : currentStep === 'quiz'
      ? powerQuizAnswers.length < powerQuestions.length
        ? (powerQuestions[powerQuestionIdx]?.question.toUpperCase() ?? 'DISCOVER YOUR POWER')
        : 'POWER QUESTIONS COMPLETE'
      : currentStep === 'power'
      ? 'POWER AWARD'
      : currentStep === 'world'
      ? 'CHOOSE YOUR BACKGROUND'
      : currentStep === 'details'
      ? 'YOUR DETAILS'
      : currentStep === 'preview'
      ? 'COLORING PAGE PREVIEW'
      : currentStep === 'card'
      ? 'TRUMP CARD'
      : 'PRINT & COMPLETE';

  const isReview = currentStep === 'card';
  const palette = config.colors?.palette?.length ? config.colors.palette : DEFAULT_COLOR_PALETTE;
  const editableRegions = Object.keys(sel.body.parts).filter((key) => !/(outline|line)/i.test(key));

  return (
    <div
      onClick={resetIdleTimer}
      className="w-full h-full min-h-0 text-white flex flex-col lg:flex-row gap-3 lg:gap-8 px-3 sm:px-5 py-2 select-none relative overflow-hidden"
    >
      {/* Dynamic CMS Scene Background */}
      <SceneBackground sceneId={CMS_SCENE_BY_STEP[currentStep]} />
      {/* LEFT: the live preview, as tall as the screen allows (an A4 page) */}
      {!isReview && currentStep !== 'complete' && (
        <div className="lg:w-[46%] h-[42vh] lg:h-full min-h-0 shrink-0 flex items-center justify-center">
          <div
            className="relative h-full max-w-full bg-white rounded-[30px] border-[6px] border-amber-300/90 shadow-[0_25px_80px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{ aspectRatio: `${SCENE_W} / ${SCENE_H}` }}
          >
            <CharacterStagePreview
              selection={sel}
              config={config}
              headOnly={currentStep === 'head'}
              showSymbol={['power', 'world', 'details', 'preview'].includes(currentStep)}
              showBackground={['world', 'details', 'preview'].includes(currentStep)}
            />
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
        {!['details', 'quiz', 'power', 'preview', 'card', 'complete'].includes(currentStep) ? (
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
            <div className="grid grid-cols-2 items-stretch gap-4 p-2 min-h-full content-center xl:grid-cols-3">
              {lib.heads.map((h) => (
                <ChoiceCard key={h.id} selected={sel.head.slug === h.slug} onClick={() => handleSelectHead(h.slug)} label={h.name} selectionCard>
                  <AssetArt asset={h} face={lib.face} mode="color" main={normalizeColor(h.meta.main) ?? '#3b82f6'} className="h-full w-auto max-w-full" />
                </ChoiceCard>
              ))}
            </div>
          )}

          {/* STEP 2: CHOOSE YOUR POSE */}
          {currentStep === 'pose' && (
            <div className="grid grid-cols-2 items-stretch gap-4 p-2 min-h-full content-center xl:grid-cols-3">
              {lib.bodies.map((b) => (
                <ChoiceCard key={b.id} selected={sel.body.slug === b.slug} onClick={() => handleSelectPose(b.slug)} label={b.name} selectionCard>
                  <PoseCardPreview selection={sel} body={b} config={config} />
                </ChoiceCard>
              ))}
            </div>
          )}

          {/* STEP 3: CHOOSE YOUR COLORS */}
          {currentStep === 'colors' && (
            <div className="flex flex-col gap-4 p-2 min-h-full justify-center">
              <div className="rounded-[28px] border-4 border-indigo-800/70 bg-slate-950/85 p-5 shadow-xl">
                <div className="mb-4 text-center">
                  <h2 className="text-2xl font-black text-amber-300">Color Your Playy</h2>
                  <p className="mt-1 text-sm text-slate-300">Choose a color for the body and each editable clothing part.</p>
                </div>
                <div className="space-y-4">
                  {[{ key: 'body', label: 'Body', value: config.colors?.body ?? sel.outfit }, ...editableRegions.map((key) => ({
                    key,
                    label: regionLabel(key),
                    value: config.colors?.clothing?.[key] ?? '',
                  }))].map((region) => (
                    <div key={region.key} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-black uppercase tracking-wide text-white">{region.label}</span>
                        <span className="font-mono text-xs font-bold uppercase text-slate-400">{region.value || 'AUTO'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {palette.map((color) => {
                          const selected = region.value.toLowerCase() === color.toLowerCase();
                          return (
                            <button
                              key={`${region.key}-${color}`}
                              type="button"
                              aria-label={`${region.label} ${color}`}
                              aria-pressed={selected}
                              onClick={() => handleColorChange(region.key, color)}
                              className={`relative h-11 w-11 cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/80 ${selected ? 'scale-110' : ''}`}
                              style={{
                                backgroundColor: color,
                                clipPath: 'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)',
                                border: selected ? '3px solid #fbbf24' : '2px solid rgba(255,255,255,0.45)',
                              }}
                            >
                              {selected && <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-950">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: POWER QUESTIONNAIRE */}
          {currentStep === 'quiz' && (
            <div className="flex flex-col gap-4 p-2 min-h-full justify-center">
              {powerQuizAnswers.length < powerQuestions.length ? (
                <>
                  {/* Progress Subtitle */}
                  <div className="text-center mb-1">
                    <div className="text-xs font-black text-amber-300 tracking-widest uppercase">
                      QUESTION {powerQuestionIdx + 1} OF {powerQuestions.length}
                    </div>
                    <div className="text-slate-300 text-sm mt-0.5">
                      {powerQuestions[powerQuestionIdx]?.subtitle || 'Choose one answer'}
                    </div>
                  </div>

                  {/* 4 Choices Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {powerQuestions[powerQuestionIdx]?.options.map((opt, i) => (
                      <button
                        key={opt.id || i}
                        type="button"
                        onClick={() => handlePowerAnswer(i)}
                        className="min-h-[115px] p-4 rounded-[28px] flex flex-col items-center justify-center text-center cursor-pointer border-[5px] bg-slate-900/90 hover:bg-indigo-950 text-slate-200 border-slate-800 hover:border-amber-400 active:scale-95 transition-all shadow-xl"
                      >
                        {opt.icon && <div className="text-3xl mb-1.5">{opt.icon}</div>}
                        <div className="text-base sm:text-lg font-black leading-tight uppercase">
                          {opt.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Quiz Complete Reveal Card */
                (() => {
                  const symbolSlug = config.symbol;
                  const symbolInfo = SYMBOL_MAP[symbolSlug] || {
                    name: 'Power Symbol',
                    attribute: 'Special Ability',
                    icon: '✨',
                  };
                  return (
                    <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center bg-slate-900/95 border-4 border-amber-400 rounded-[32px] max-w-lg mx-auto shadow-2xl">
                      <div className="text-6xl animate-bounce">{symbolInfo.icon}</div>
                      <div>
                        <div className="text-xs font-black text-amber-300 uppercase tracking-widest mb-1">
                          ★ UNLOCKED PLAYPAL POWER ★
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                          {symbolInfo.name}
                        </h2>
                        <div className="text-base font-bold text-teal-300 mt-1">
                          Attribute: {symbolInfo.attribute}
                        </div>
                      </div>
                      <p className="text-sm text-slate-200 italic px-4 font-medium">
                        “My PlayPal has these powers because of who I am!”
                      </p>
                      <button
                        type="button"
                        onClick={handleRetakePowerQuiz}
                        className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer pt-2"
                      >
                        🔄 Retake Power Quiz
                      </button>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* STEP 5: POWER AWARD */}
          {currentStep === 'power' && (
            <div className="flex min-h-full flex-col items-center justify-center gap-5 p-4 text-center">
              {(() => {
                const symbolInfo = SYMBOL_MAP[config.symbol] || {
                  name: 'Power Symbol',
                  attribute: 'Special Ability',
                  icon: '✨',
                };
                return (
                  <div className="w-full max-w-xl rounded-[32px] border-4 border-amber-400 bg-slate-900/95 p-6 shadow-2xl">
                    <div className="mb-2 text-6xl animate-bounce">{symbolInfo.icon}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-amber-300">POWER AWARDED</div>
                    <h2 className="mt-2 text-3xl font-black uppercase text-white sm:text-4xl">{symbolInfo.name}</h2>
                    <p className="mt-2 text-base font-bold text-teal-300">{symbolInfo.attribute}</p>
                    <p className="mt-4 text-sm font-medium italic text-slate-200">Your completed character now carries this power symbol.</p>
                    <div className="mx-auto mt-5 h-36 w-32 rounded-3xl border-2 border-amber-300 bg-white p-2">
                      <CharacterStagePreview selection={sel} config={config} showSymbol />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* STEP 6: CHOOSE YOUR BACKGROUND */}
          {currentStep === 'world' && (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 p-2 min-h-full content-center">
              {lib.backgrounds.map((bg) => (
                <ChoiceCard key={bg.id} selected={sel.background.slug === bg.slug} onClick={() => handleSelectBackground(bg.slug)} label={bg.name}>
                  <AssetArt asset={bg} mode="color" main={sel.headMain} className="h-full max-w-full rounded-xl overflow-hidden" />
                </ChoiceCard>
              ))}
            </div>
          )}

          {/* STEP 7: YOUR DETAILS */}
          {currentStep === 'details' && (
            <div className="flex flex-col items-center justify-center p-2 space-y-4">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Your Details · Step {detailsStep} of 3</div>
              <div className="grid w-full max-w-2xl grid-cols-3 gap-2">
                {([['name', 'Your Name'], ['phone', 'Your Phone Number'], ['email', 'Your Email']] as const).map(([field, label]) => (
                  <button key={field} type="button" onClick={() => { setActiveDetailField(field); setDetailsStep(field === 'name' ? 1 : field === 'phone' ? 2 : 3); setDetailsError(''); }} className={`rounded-xl border-2 p-2 text-left ${activeDetailField === field ? 'border-amber-300 bg-amber-400/20' : 'border-slate-700 bg-slate-900/80'}`}>
                    <span className="block text-[10px] font-black uppercase text-sky-200">{label}</span>
                    <span className="mt-1 block min-h-6 truncate text-sm font-bold text-white">{detailValue(field) || 'Tap to enter'}</span>
                  </button>
                ))}
              </div>
              {activeDetailField === 'phone' ? (
                <div className="grid w-full max-w-2xl grid-cols-4 gap-2 rounded-2xl border-2 border-sky-800/70 bg-slate-900/90 p-3">
                  {['1','2','3','4','5','6','7','8','9','+','0','BACKSPACE'].map((key) => <button key={key} type="button" onClick={() => handleDetailKey(key)} className="min-h-12 rounded-xl bg-slate-800 text-lg font-black text-white active:bg-amber-400 active:text-slate-950">{key === 'BACKSPACE' ? '⌫' : key}</button>)}
                </div>
              ) : (
                <div className="w-full max-w-2xl rounded-2xl border-2 border-sky-800/70 bg-slate-900/90 p-3">
                  <div className="grid grid-cols-10 gap-1.5">
                    {(activeDetailField === 'email' ? [...'1234567890', ...'QWERTYUIOP', ...'ASDFGHJKL', ...'ZXCVBNM'] : KEYBOARD_LETTERS.flat()).map((key, index) => <button key={`${key}-${index}`} type="button" onClick={() => handleDetailKey(key)} className="min-h-10 rounded-lg bg-slate-800 text-base font-black text-white active:bg-amber-400 active:text-slate-950">{activeDetailField === 'name' && !nameShift ? key.toLowerCase() : key}</button>)}
                  </div>
                  {activeDetailField === 'email' && <div className="mt-2 grid grid-cols-4 gap-2">{['@', '.', '-', '_'].map((key) => <button key={key} type="button" onClick={() => handleDetailKey(key)} className="min-h-11 rounded-xl bg-indigo-700 text-lg font-black text-white">{key}</button>)}</div>}
                  {activeDetailField === 'name' && <button type="button" onClick={() => handleDetailKey(' ')} className="mt-2 min-h-11 w-full rounded-xl bg-slate-700 text-sm font-black text-white">SPACE</button>}
                  {activeDetailField === 'name' && <button type="button" onClick={() => handleDetailKey('SHIFT')} className={`mt-2 min-h-11 w-full rounded-xl text-sm font-black text-white ${nameShift ? 'bg-amber-600' : 'bg-slate-700'}`}>SHIFT</button>}
                  <button type="button" onClick={() => handleDetailKey('BACKSPACE')} className="mt-2 min-h-11 w-full rounded-xl bg-rose-900 text-lg font-black text-white">⌫ BACKSPACE</button>
                </div>
              )}
              {detailsError && <div className="text-center text-sm font-bold text-rose-300">{detailsError}</div>}
              {/* Legacy name keyboard is intentionally replaced by the field-aware touchscreen keyboard above. */}
              {false && <>
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
                        onClick={() => handleDetailKey(letter)}
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
                    onClick={() => handleDetailKey(' ')}
                    className="flex-1 max-w-xs h-13 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-base rounded-2xl border-2 border-slate-700 cursor-pointer flex items-center justify-center"
                  >
                    SPACE
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDetailKey('BACKSPACE')}
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
              </>}

              {detailsStep === 2 && <div className="w-full max-w-lg rounded-2xl border-2 border-sky-800/70 bg-slate-900/80 p-5">
                <label htmlFor="phone" className="block text-sm font-black uppercase tracking-wide text-sky-200">Phone Number</label>
                <input id="phone" type="tel" inputMode="tel" value={config.phone || ''} onChange={(event) => handlePhone(event.target.value)} placeholder="Enter phone number" className="mt-3 w-full rounded-xl border-2 border-slate-700 bg-slate-800 px-4 py-3 text-base font-bold text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none" />
              </div>}
              {detailsStep === 3 && <div className="w-full max-w-lg rounded-2xl border-2 border-sky-800/70 bg-slate-900/80 p-5">
                <label htmlFor="email" className="block text-sm font-black uppercase tracking-wide text-sky-200">Email</label>
                <input id="email" type="email" inputMode="email" value={config.email || ''} onChange={(event) => handleEmail(event.target.value)} placeholder="Enter email address" className="mt-3 w-full rounded-xl border-2 border-slate-700 bg-slate-800 px-4 py-3 text-base font-bold text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none" />
              </div>}
            </div>
          )}

          {/* STEP 9: COLORING PAGE PREVIEW */}
          {currentStep === 'preview' && (
            <div className="grid min-h-full grid-cols-1 gap-4 p-2 lg:grid-cols-2">
              {[
                { label: 'BLACK & WHITE', mode: 'line' as const, border: 'border-slate-300' },
                { label: 'FULL COLOR', mode: 'color' as const, border: 'border-amber-300' },
              ].map((preview) => (
                <div key={preview.label} className={`flex min-h-[360px] flex-col rounded-[28px] border-4 ${preview.border} bg-white p-3 shadow-xl`}>
                  <div className="mb-2 text-center text-xs font-black tracking-widest text-slate-700">{preview.label}</div>
                  <div className="min-h-0 flex-1">
                    <PlayyScene config={config} mode={preview.mode} className="h-full w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 10: TRUMP CARD */}
          {currentStep === 'card' && card && (() => {
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
                      resetIdleTimer();
                      nativeFeedback.impactLight();
                      setCurrentStep('complete');
                    }}
                    className="btn-3d w-full py-6 px-8 font-bold text-2xl sm:text-3xl flex items-center justify-center gap-3"
                  >
                    <span>🖨️</span>
                    <span>CONTINUE TO PRINT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep('preview')}
                    className="btn-3d btn-3d-blue w-full py-3 px-6 font-bold text-base"
                  >
                    BACK TO PREVIEW
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

          {/* STEP 11: PRINT & COMPLETE (printing behavior intentionally unchanged for Phase 1) */}
          {currentStep === 'complete' && (
            <div className="flex min-h-full flex-col items-center justify-center gap-5 p-4 text-center">
              <div className="w-full max-w-xl rounded-[32px] border-4 border-emerald-400 bg-slate-900/95 p-6 shadow-2xl">
                <div className="text-5xl">✨</div>
                <h2 className="mt-2 text-3xl font-black uppercase text-white">Ready to Print &amp; Complete</h2>
                <p className="mt-3 text-sm font-medium text-slate-300">
                  PDF generation, print queue confirmation, and email delivery will be connected in later phases.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    nativeFeedback.notificationSuccess();
                    onFinishAndPrint();
                  }}
                  className="btn-3d mt-6 w-full py-6 px-8 font-bold text-2xl sm:text-3xl flex items-center justify-center gap-3"
                >
                  <span>PRINT MY PLAYY!</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('card')}
                  className="btn-3d btn-3d-blue mt-4 w-full py-3 px-6 font-bold text-base"
                >
                  BACK TO TRUMP CARD
                </button>
              </div>
            </div>
          )}
      </div>

      {/* 4. Bottom Navigation: BACK on left, ONE DOMINANT NEXT ON RIGHT */}
      {!['card', 'complete'].includes(currentStep) && (
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
