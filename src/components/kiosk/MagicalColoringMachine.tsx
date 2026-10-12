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
import { BrandLogo } from '../../lib/brand/brand';
import { playSfx } from '../../lib/sfx/engine';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PickCarousel } from './PickCarousel';
import { ColorModeToggle, ColorPanel } from './ColorPanel';
import { DetailField, DetailsKeyboard } from './DetailsKeyboard';
import { COLOR_SWATCHES, effectiveRegionColor, regionGroup, resolveColors } from '../../lib/playys/colors';
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

const DEFAULT_COLOR_PALETTE = COLOR_SWATCHES;

const DETAIL_TITLES = ["WHAT'S YOUR NAME?", "WHAT'S YOUR PHONE NUMBER?", "WHAT'S YOUR EMAIL?"];
const DETAIL_SUBTITLES = [
  'Type your name so we can add it to your Playyy!',
  'Ask a grown-up for their phone number so we can send your Playyy!',
  'Ask a grown-up for their email so we can send your Playyy!',
];
const DETAIL_PLACEHOLDERS = ['Type your name', 'Type a phone number', 'Type an email address'];
const FUN_NAMES = ['Sparky', 'Bubbles', 'Zippy', 'Giggles', 'Twinkle', 'Pip', 'Biscuit', 'Jellybean', 'Waffles', 'Doodle', 'Sunny', 'Pickles'];

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

const FRIENDLY_REGION_NAMES: Record<string, string> = {
  hoodie: 'Hoodie',
  trousers: 'Trousers',
  shoes: 'Shoes',
  soles: 'Shoe Soles',
  gloves: 'Gloves',
  cuffs: 'Sleeve Cuffs',
  trim: 'Clothing Trim',
  tassles: 'Hoodie Strings',
};

const regionLabel = (key: string) => FRIENDLY_REGION_NAMES[key] ?? key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const DISPLAY_STAGES = [
  { label: 'FACE', icon: 'face' },
  { label: 'POSE', icon: 'pose' },
  { label: 'COLORS', icon: 'palette' },
  { label: 'YOU', icon: 'heart' },
  { label: 'POWER', icon: 'star' },
  { label: 'BACKGROUND', icon: 'landscape' },
  { label: 'NAME', icon: 'name' },
  { label: 'PREVIEW', icon: 'printer' },
] as const;

const displayStageIndex = (step: MachineStep) => {
  if (step === 'head') return 0;
  if (step === 'pose') return 1;
  if (step === 'colors') return 2;
  if (step === 'quiz') return 3;
  if (step === 'power') return 4;
  if (step === 'world') return 5;
  if (step === 'details') return 6;
  return 7;
};

const StageIcon: React.FC<{ type: (typeof DISPLAY_STAGES)[number]['icon'] }> = ({ type }) => {
  if (type === 'face') return <><circle cx="32" cy="28" r="11" /><circle cx="27" cy="27" r="2" fill="currentColor" stroke="none" /><circle cx="37" cy="27" r="2" fill="currentColor" stroke="none" /><path d="M26 32c3 4 9 4 12 0" /></>;
  if (type === 'pose') return <><circle cx="32" cy="17" r="4" /><path d="M32 22v14M32 26l-9 7M32 26l9 7M32 36l-7 9M32 36l7 9" /></>;
  if (type === 'palette') return <><path d="M32 14c-11 0-19 7-19 16 0 8 6 13 13 13h4c2 0 3-2 2-4-1-2 0-4 3-4h4c7 0 12-5 12-11 0-6-8-10-19-10Z" /><circle cx="22" cy="26" r="2" fill="currentColor" stroke="none" /><circle cx="29" cy="21" r="2" fill="currentColor" stroke="none" /><circle cx="38" cy="21" r="2" fill="currentColor" stroke="none" /><path d="m45 14 6-6" /></>;
  if (type === 'heart') return <path d="M32 43S15 33 15 23c0-5 4-8 8-8 4 0 7 3 9 6 2-3 5-6 9-6 4 0 8 3 8 8 0 10-17 20-17 20Z" fill="currentColor" stroke="none" />;
  if (type === 'star') return <path d="m32 13 5.5 11 12 1.8-8.7 8.5 2 12-10.8-5.7-10.8 5.7 2-12-8.7-8.5 12-1.8Z" fill="currentColor" stroke="none" />;
  if (type === 'landscape') return <><path d="M15 43 27 29l6 7 6-8 10 15Z" fill="currentColor" stroke="none" /><circle cx="43" cy="20" r="4" fill="currentColor" stroke="none" /></>;
  if (type === 'name') return <><path d="M17 19h30M17 29h30M17 39h21" /><path d="M23 12v34" /></>;
  return <><rect x="17" y="18" width="30" height="22" rx="2" /><path d="M22 18v-6h20v6M23 40v6h18v-6M22 33h20" /><circle cx="41" cy="23" r="2" fill="currentColor" stroke="none" /></>;
};

const StageIndicator: React.FC<{ currentStep: MachineStep }> = ({ currentStep }) => {
  const active = displayStageIndex(currentStep);
  return (
    <div className="stage-indicator" aria-label={`Progress: ${DISPLAY_STAGES[active].label}`}>
      <div className="stage-indicator-line" aria-hidden="true" />
      {DISPLAY_STAGES.map((stage, index) => (
        <div className={`stage-item ${index === active ? 'is-active' : ''}`} key={stage.label}>
          <div className="stage-badge">
            <svg viewBox="0 0 64 64" aria-hidden="true"><StageIcon type={stage.icon} /></svg>
          </div>
          <span>{index + 1}. {stage.label}</span>
        </div>
      ))}
    </div>
  );
};

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
  /** Head, pose and background pages only: 'crop' fills the box with the character, 'scene' centers the A4 scene */
  fit?: 'crop' | 'scene';
}> = ({ selection, config, mode = 'color', headOnly = false, showSymbol = false, showBackground = false, fit }) => {
  const rc = resolveColors(selection, config.colors);
  if (headOnly) {
    return (
      <div className="head-preview-inner w-full h-full flex items-center justify-center bg-white rounded-2xl p-8">
        <div className="head-preview-shadow" aria-hidden="true" />
        <AssetArt
          asset={selection.head}
          face={selection.face}
          mode={mode}
          main={rc.headMain}
          secondary={selection.secondary}
          className="h-[78%] w-auto max-w-[92%]"
        />
      </div>
    );
  }

  if (fit === 'crop') {
    return (
      <div className="flex h-full w-full items-center justify-center p-[3vh]">
        <CroppedCharacter selection={selection} body={selection.body} config={config} showSymbol={showSymbol} />
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
    <div className={fit === 'scene' ? 'relative mx-auto h-full overflow-hidden rounded-[2vw] bg-white' : 'relative w-full h-full overflow-hidden rounded-2xl bg-white'} style={{ aspectRatio: `${SCENE_W} / ${SCENE_H}` }}>
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
        main={rc.bodyMain}
        secondary={rc.secondary}
        partColors={mode === 'color' ? rc.partColors : undefined}
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
        main={rc.headMain}
        secondary={selection.secondary}
        style={rectStyle(layout.head)}
      />
    </div>
  );
};

/** The body and head cropped to their own bounds, so the character fills whatever box it is put in. */
const CroppedCharacter: React.FC<{
  selection: Selection;
  body: Selection['body'];
  config: PlayyConfiguration;
  showSymbol?: boolean;
}> = ({ selection, body, config, showSymbol = false }) => {
  const rc = resolveColors(selection, config.colors);
  const layout = layoutScene({
    background: selection.background,
    body,
    head: selection.head,
    symbol: showSymbol ? selection.symbol : null,
  });
  const rects = [layout.body, layout.head, ...(showSymbol && layout.symbol ? [layout.symbol] : [])];
  const x0 = Math.min(...rects.map((r) => r.x));
  const y0 = Math.min(...rects.map((r) => r.y));
  const W = Math.max(...rects.map((r) => r.x + r.w)) - x0;
  const H = Math.max(...rects.map((r) => r.y + r.h)) - y0;
  const at = (r: { x: number; y: number; w: number; h: number }): React.CSSProperties => ({
    position: 'absolute',
    left: `${((r.x - x0) / W) * 100}%`,
    top: `${((r.y - y0) / H) * 100}%`,
    width: `${(r.w / W) * 100}%`,
    height: `${(r.h / H) * 100}%`,
  });

  return (
    <div className="relative h-full max-w-full" style={{ aspectRatio: `${W} / ${H}` }}>
      <AssetArt
        asset={body}
        mode="color"
        main={rc.bodyMain}
        secondary={rc.secondary}
        partColors={rc.partColors}
        style={at(layout.body)}
      />
      {showSymbol && selection.symbol && layout.symbol && (
        <AssetArt asset={selection.symbol} mode="color" main={selection.headMain} style={at(layout.symbol)} />
      )}
      <AssetArt asset={selection.head} face={selection.face} mode="color" main={rc.headMain} secondary={selection.secondary} style={at(layout.head)} />
    </div>
  );
};

const PoseCardPreview: React.FC<{
  selection: Selection;
  body: Selection['body'];
  config: PlayyConfiguration;
}> = ({ selection, body, config }) => <CroppedCharacter selection={selection} body={body} config={config} />;

/** The small blue die on the "Pick for Me!" button. */
const DiceIcon: React.FC = () => (
  <svg className="pick-me-dice" viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <linearGradient id="pick-die" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6aa8ff" /><stop offset="1" stopColor="#2755d8" /></linearGradient>
    </defs>
    <rect x="5" y="5" width="38" height="38" rx="9" fill="url(#pick-die)" stroke="#173a9e" strokeWidth="2.5" />
    <circle cx="16" cy="16" r="3.4" fill="#fff" /><circle cx="32" cy="16" r="3.4" fill="#fff" />
    <circle cx="24" cy="24" r="3.4" fill="#fff" />
    <circle cx="16" cy="32" r="3.4" fill="#fff" /><circle cx="32" cy="32" r="3.4" fill="#fff" />
  </svg>
);

const ChoiceCard: React.FC<{
  selected: boolean;
  onClick: () => void;
  label: string;
  selectionCard?: boolean;
  children: React.ReactNode;
}> = ({ selected, onClick, label, selectionCard = false, children }) =>
  selectionCard ? (
    <button
      type="button"
      data-sfx="select"
      aria-pressed={selected}
      onClick={onClick}
      className={`pick-card ${selected ? 'is-selected' : ''}`}
    >
      {selected && <span className="pick-selected-check" aria-label="Selected">✓</span>}
      <div className="pick-card-art"><div>{children}</div></div>
      <div className="pick-card-label">{label}</div>
    </button>
  ) : (
    <button
      type="button"
      data-sfx="select"
      onClick={onClick}
      className={`flex flex-col items-center justify-between gap-2 p-3 rounded-[28px] border-[5px] transition-all cursor-pointer ${
        selected
          ? 'bg-gradient-to-b from-indigo-700 to-indigo-900 text-white border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.6)] scale-[1.03]'
          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex h-32 w-full items-center justify-center sm:h-44">{children}</div>
      <div className="text-center text-sm font-black uppercase leading-tight">{label}</div>
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
  const [detailsError, setDetailsError] = useState('');
  const detailField: 'name' | 'phone' | 'email' = detailsStep === 1 ? 'name' : detailsStep === 2 ? 'phone' : 'email';
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
    if (currentStep === 'details') {
      const problem = validateDetail(detailField);
      if (problem) {
        setDetailsError(problem);
        nativeFeedback.impactMedium();
        return;
      }
      setDetailsError('');
      if (detailsStep < 3) {
        setDetailsStep((step) => (step + 1) as 1 | 2 | 3);
        return;
      }
    }
    const nextIdx = Math.min(stepIndex + 1, STEPS_LIST.length - 1);
    if (STEPS_LIST[nextIdx] === 'details') setDetailsStep(1);
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
      if (STEPS_LIST[stepIndex - 1] === 'details') setDetailsStep(3);
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
    if (field === 'name') onChangeConfig({ ...config, kidName: value.slice(0, 16) });
    else if (field === 'phone') onChangeConfig({ ...config, phone: value.slice(0, 15) });
    else onChangeConfig({ ...config, email: value.slice(0, 64) });
  };

  const detailValue = (field: 'name' | 'phone' | 'email') => field === 'name' ? (config.kidName || '') : (config[field] || '');

  // Every screen must be filled in: there is no skipping
  const validateDetail = (field: 'name' | 'phone' | 'email'): string => {
    const value = detailValue(field).trim();
    if (field === 'name') return value ? '' : 'Please type your name.';
    if (field === 'phone') return value.replace(/\D/g, '').length >= 7 ? '' : 'Please type a phone number (at least 7 digits).';
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? '' : 'Please type a valid email, like name@example.com.';
  };

  const handleDetailKey = (key: string) => {
    resetIdleTimer();
    if (key === 'DONE') {
      goNext();
      return;
    }
    nativeFeedback.impactLight();
    const field = detailField;
    const current = detailValue(field);
    let next = current;
    if (key === 'BACKSPACE') {
      next = current.slice(0, -1);
    } else if (field === 'name') {
      if (!/^[A-Za-z0-9 '\-]$/.test(key)) return;
      if (key === ' ' && (current === '' || current.endsWith(' '))) return;
      // Capital letter at the start of each word, the rest lowercase
      const startOfWord = current === '' || current.endsWith(' ') || current.endsWith('-');
      next = current + (startOfWord ? key.toUpperCase() : key.toLowerCase());
    } else if (field === 'phone') {
      if (!/^[0-9+]$/.test(key)) return;
      if (key === '+' && current.length > 0) return;
      next = current + key;
    } else {
      if (key === ' ') return;
      next = current + key.toLowerCase();
    }
    setDetailsError('');
    updateDetailField(field, next);
  };

  const handleColorChange = (region: string, color: string) => {
    resetIdleTimer();
    nativeFeedback.selection();
    const cur = config.colors ?? {};
    if (region === 'main') onChangeConfig({ ...config, colors: { ...cur, main: color } });
    else if (region === 'highlight') onChangeConfig({ ...config, colors: { ...cur, highlight: color } });
    else onChangeConfig({ ...config, colors: { ...cur, parts: { ...cur.parts, [region]: color } } });
  };

  const handleColorMode = (mode: 'simple' | 'advanced') => {
    resetIdleTimer();
    onChangeConfig({ ...config, colors: { ...config.colors, mode } });
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
    } else if (currentStep === 'details' && detailsStep === 1) {
      onChangeConfig({ ...config, kidName: any(FUN_NAMES) });
      setDetailsError('');
    }
  };

  // Screen Title: ONE BIG QUESTION
  const questionTitle =
    currentStep === 'head'
      ? 'CHOOSE YOUR HEAD'
      : currentStep === 'pose'
      ? 'CHOOSE YOUR POSE'
      : currentStep === 'colors'
      ? 'CHOOSE YOUR COLOURS!'
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
      ? 'YOUR COLORING PAGE!'
      : currentStep === 'card'
      ? 'TRUMP CARD'
      : 'PRINT & COMPLETE';

  const isReview = currentStep === 'card';
  const isPick = currentStep === 'head' || currentStep === 'pose' || currentStep === 'world' || currentStep === 'colors' || currentStep === 'details';
  const colorMode = config.colors?.mode ?? 'simple';
  // Advanced mode: one panel per part, in a sensible order (gloves are always white, so they are not offered)
  const REGION_ORDER = ['hoodie', 'trousers', 'shoes', 'cuffs', 'trim', 'soles', 'tassles'];
  const regionRank = (k: string) => { const i = REGION_ORDER.indexOf(k.toLowerCase()); return i === -1 ? 99 : i; };
  const bodyRegions = Object.keys(sel.body.parts)
    .filter((k) => !/(outline|line)/i.test(k) && regionGroup(k) !== 'gloves')
    .sort((a, b) => regionRank(a) - regionRank(b));
  const colorPanels = colorMode === 'advanced'
    ? [{ key: 'head', label: 'Head', value: effectiveRegionColor(config.colors, 'head') },
       ...bodyRegions.map((k) => ({ key: k, label: regionLabel(k), value: effectiveRegionColor(config.colors, k) }))]
    : [{ key: 'main', label: 'Main colour', value: config.colors?.main },
       { key: 'highlight', label: 'Secondary colour', value: config.colors?.highlight }];
  useEffect(() => {
    if (currentStep === 'card') playSfx('reveal');
  }, [currentStep]);
  const palette = config.colors?.palette?.length ? config.colors.palette : DEFAULT_COLOR_PALETTE;

  return (
    <div
      onClick={resetIdleTimer}
      className={`kiosk-machine w-full h-full min-h-0 text-white flex flex-col lg:flex-row gap-3 lg:gap-8 px-3 sm:px-5 py-2 select-none relative overflow-hidden ${currentStep === 'head' || currentStep === 'pose' || currentStep === 'world' ? 'pick-page' : currentStep === 'colors' ? 'pick-page pick-colors' : currentStep === 'details' ? 'pick-page pick-details' : currentStep === 'quiz' ? 'quiz-selection-page' : currentStep === 'power' ? 'power-selection-page' : ''}`}
    >
      {/* Dynamic CMS Scene Background */}
      <SceneBackground sceneId={CMS_SCENE_BY_STEP[currentStep]} />
      {/* LEFT: the live preview, as tall as the screen allows (an A4 page) */}
      {!isReview && currentStep !== 'complete' && (
        <div className="head-preview-column lg:w-[46%] h-[42vh] lg:h-full min-h-0 shrink-0 flex items-center justify-center">
          <div
            className="head-preview-panel relative h-full max-w-full bg-white rounded-[30px] border-[6px] border-amber-300/90 shadow-[0_25px_80px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{ aspectRatio: `${SCENE_W} / ${SCENE_H}` }}
          >
            {currentStep === 'details' ? (
              <div className="flex h-full w-full items-center justify-center p-[1.4vh]">
                <PlayyScene config={config} mode="color" finish className="h-full rounded-[1.6vw]" />
              </div>
            ) : (
            <CharacterStagePreview
              selection={sel}
              config={config}
              headOnly={currentStep === 'head'}
              showSymbol={['power', 'world', 'details', 'preview'].includes(currentStep)}
              showBackground={['world', 'details', 'preview'].includes(currentStep)}
              fit={currentStep === 'pose' || currentStep === 'colors' ? 'crop' : currentStep === 'world' ? 'scene' : undefined}
            />
            )}
            {currentStep === 'head' && [1, 2, 3, 4, 5, 6].map((n) => <i key={n} className={`pick-spark pick-spark-${n}`} aria-hidden="true" />)}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-xs px-4 py-1 rounded-full shadow-md uppercase tracking-wider whitespace-nowrap">
              ★ MAGIC MIRROR ★
            </div>
          </div>
        </div>
      )}

      {/* RIGHT: progress, the one big question, the choices, and navigation */}
      <div className="head-content flex-1 min-w-0 min-h-0 flex flex-col">
      <div className="head-header w-full flex items-center justify-between gap-3 px-1 shrink-0 z-20">
        <BrandLogo className="head-page-logo h-12 sm:h-14 w-auto object-contain" />

        <StageIndicator currentStep={currentStep} />

        {/* Keep the questionnaire's Surprise Me control in its normal slot, with progress beneath it. */}
        {currentStep === 'quiz' ? (
          <div className="quiz-header-actions">
            <button
              type="button"
              onClick={handleStepSurprise}
              className="pick-me-btn btn-3d btn-3d-amber btn-3d-sm flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0"
            >
              <DiceIcon />
              <span>Pick for Me!</span>
            </button>
            <div className="quiz-inline-meta quiz-header-counter" aria-label={`Question ${powerQuestionIdx + 1} of ${powerQuestions.length}`}>
              <div>QUESTION {powerQuestionIdx + 1} OF {powerQuestions.length}</div>
            </div>
          </div>
        ) : !['power'].includes(currentStep) && !(currentStep === 'details' && detailsStep !== 1) ? (
          <button
            type="button"
            onClick={handleStepSurprise}
            className="pick-me-btn btn-3d btn-3d-amber btn-3d-sm flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0"
          >
            <DiceIcon />
            <span>Pick for Me!</span>
          </button>
        ) : (
          <div className="w-20" />
        )}
      </div>

      {/* 2. Top Title: ONE BIG QUESTION */}
      <div className="head-title w-full text-center py-2 shrink-0 z-20">
        {(currentStep === 'head' || currentStep === 'pose' || currentStep === 'colors' || currentStep === 'quiz' || currentStep === 'world' || currentStep === 'details') && <>
          <span className="head-title-star head-title-star-left" aria-hidden="true">★</span>
          <span className="head-title-star head-title-star-right" aria-hidden="true">★</span>
          <span className="head-title-star head-title-star-bottom-left" aria-hidden="true">✦</span>
          <span className="head-title-star head-title-star-bottom-right" aria-hidden="true">✦</span>
        </>}
        {currentStep === 'quiz' ? (
          <h1 className="head-arched-heading quiz-question-heading" aria-label={questionTitle}>{questionTitle}</h1>
        ) : currentStep === 'head' || currentStep === 'pose' || currentStep === 'colors' || currentStep === 'world' || currentStep === 'details' ? (() => {
          const headingText = currentStep === 'head' ? 'CHOOSE YOUR HEAD' : currentStep === 'pose' ? 'CHOOSE YOUR POSE' : currentStep === 'colors' ? 'CHOOSE YOUR COLOURS!' : currentStep === 'details' ? DETAIL_TITLES[detailsStep - 1] : 'CHOOSE YOUR BACKGROUND';
          return (
            <h1 className="head-arched-heading" style={{ ['--title-chars' as string]: headingText.length } as React.CSSProperties} aria-label={headingText}>
              {headingText.split('').map((letter, index) => (
                letter === ' '
                  ? <span className="head-heading-space" key={`space-${index}`} aria-hidden="true" />
                  : <span key={`${letter}-${index}`}>{letter}</span>
              ))}
            </h1>
          );
        })() : (
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">{questionTitle}</h1>
        )}
        {(currentStep === 'head' || currentStep === 'pose' || currentStep === 'colors' || currentStep === 'quiz' || currentStep === 'world' || currentStep === 'details' || currentStep === 'card') && (() => {
          const subtitleText: string = currentStep === 'head' ? 'Pick a face for your Playy!' : currentStep === 'pose' ? 'Pick a pose for your Playy!' : currentStep === 'colors' ? (colorMode === 'advanced' ? 'Pick a colour for each part of your Playyy!' : 'Pick a main colour and a secondary colour for your Playyy!') : currentStep === 'world' ? 'Pick a world for your Playyy!' : currentStep === 'details' ? DETAIL_SUBTITLES[detailsStep - 1] : currentStep === 'card' ? 'A special card just for you!' : (powerQuestions[powerQuestionIdx]?.subtitle || 'Choose the answer that feels most like you!');
          return <p className="head-subtitle" style={{ ['--sub-chars' as string]: subtitleText.length } as React.CSSProperties}>{subtitleText}</p>;
        })()}
      </div>

      {currentStep === 'colors' && <ColorModeToggle mode={colorMode} onChange={handleColorMode} />}

      <div className={`flex-1 min-h-0 overflow-y-auto py-2 z-10 ${isPick ? 'pick-options-area' : ''}`}>
          {/* STEP 1: CHOOSE YOUR HEAD */}
          {currentStep === 'head' && (
            <PickCarousel
              items={lib.heads}
              keyOf={(h) => h.id}
              selectedKey={sel.head.id}
              onInteract={resetIdleTimer}
              renderItem={(h) => (
                <ChoiceCard selected={sel.head.slug === h.slug} onClick={() => handleSelectHead(h.slug)} label={h.name} selectionCard>
                  <AssetArt asset={h} face={lib.face} mode="color" main={normalizeColor(h.meta.main) ?? '#3b82f6'} className="h-full w-auto max-w-full" />
                </ChoiceCard>
              )}
            />
          )}

          {/* STEP 2: CHOOSE YOUR POSE */}
          {currentStep === 'pose' && (
            <PickCarousel
              items={lib.bodies}
              keyOf={(b) => b.id}
              selectedKey={sel.body.id}
              onInteract={resetIdleTimer}
              renderItem={(b) => (
                <ChoiceCard selected={sel.body.slug === b.slug} onClick={() => handleSelectPose(b.slug)} label={b.name} selectionCard>
                  <PoseCardPreview selection={sel} body={b} config={config} />
                </ChoiceCard>
              )}
            />
          )}

          {/* STEP 3: CHOOSE YOUR COLOURS: simple (main + secondary) or advanced (every part), swiped left and right */}
          {currentStep === 'colors' && (
            <React.Fragment key={colorMode}>
            <PickCarousel
              variant="colors"
              items={colorPanels}
              keyOf={(p) => p.key}
              perPage={2}
              onInteract={resetIdleTimer}
              renderItem={(panel, i) => (
                <ColorPanel
                  label={panel.label}
                  accent={i % 2 === 0 ? 'yellow' : 'purple'}
                  value={panel.value}
                  swatches={palette}
                  onPick={(c) => handleColorChange(panel.key, c)}
                />
              )}
            />
            </React.Fragment>
          )}

          {/* STEP 4: POWER QUESTIONNAIRE */}
          {currentStep === 'quiz' && (
            <div className="flex flex-col gap-4 p-2 min-h-full justify-center">
              {powerQuizAnswers.length < powerQuestions.length ? (
                <>
                  {/* 4 Choices Grid */}
                  <div className="quiz-options grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {powerQuestions[powerQuestionIdx]?.options.map((opt, i) => (
                      <button
                        key={opt.id || i}
                        type="button"
                        data-sfx="answer"
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
            <div className="power-award-layout flex min-h-full items-center justify-center p-3">
              {(() => {
                const symbolInfo = SYMBOL_MAP[config.symbol] || {
                  name: 'Power Symbol',
                  attribute: 'Special Ability',
                  icon: '✨',
                };
                return (
                  <section className="power-award-panel" aria-labelledby="power-awarded-title">
                    <div className="power-award-ribbon">
                      <span id="power-awarded-title">POWER AWARDED!</span>
                      <i aria-hidden="true">â˜…</i>
                      <b aria-hidden="true">â˜…</b>
                    </div>
                    <div className="power-award-main">
                      <div className="power-symbol-display" aria-label={symbolInfo.name}>
                        <div className="power-symbol-glow" aria-hidden="true" />
                        {sel.symbol ? (
                          <AssetArt asset={sel.symbol} mode="color" main={sel.headMain} className="power-symbol-art" />
                        ) : (
                          <span className="power-symbol-fallback">{symbolInfo.icon}</span>
                        )}
                      </div>
                      <div className="power-award-copy">
                        <span className="power-award-label">YOUR POWER</span>
                        <h2>{symbolInfo.name}</h2>
                        <p className="power-award-attribute">{symbolInfo.attribute}</p>
                        <p className="power-award-description">Your Playy now carries this power symbol on all your creations!</p>
                      </div>
                    </div>
                    <div className="power-award-strip">
                      <div className="power-award-thumb" aria-hidden="true">
                        <AssetArt asset={sel.head} face={sel.face} mode="color" main={sel.headMain} />
                      </div>
                      <span>Your Playy carries this special power wherever your imagination takes you!</span>
                    </div>
                  </section>
                );
              })()}
            </div>
          )}

          {/* STEP 6: CHOOSE YOUR BACKGROUND */}
          {currentStep === 'world' && (
            <PickCarousel
              items={lib.backgrounds}
              keyOf={(bg) => bg.id}
              selectedKey={sel.background.id}
              onInteract={resetIdleTimer}
              renderItem={(bg) => (
                <ChoiceCard selected={sel.background.slug === bg.slug} onClick={() => handleSelectBackground(bg.slug)} label={bg.name} selectionCard>
                  <AssetArt asset={bg} mode="color" main={sel.headMain} className="h-full max-w-full rounded-xl overflow-hidden" />
                </ChoiceCard>
              )}
            />
          )}

          {/* STEP 7: YOUR DETAILS: name, phone number and email, one screen each (nothing can be skipped) */}
          {currentStep === 'details' && (
            <div className="details-panel">
              <DetailField
                value={detailValue(detailField)}
                placeholder={DETAIL_PLACEHOLDERS[detailsStep - 1]}
                onClear={() => { resetIdleTimer(); setDetailsError(''); updateDetailField(detailField, ''); }}
              />
              <div className="details-error" role="alert">{detailsError}</div>
              <DetailsKeyboard key={detailField} layout={detailField} onKey={handleDetailKey} />
            </div>
          )}

          {/* STEP 9: COLORING PAGE PREVIEW */}
          {currentStep === 'preview' && (
            <div className="preview-panels grid h-full min-h-0 grid-cols-1 gap-4 p-2 lg:grid-cols-[3fr_2fr]">
              {[
                { label: 'BLACK & WHITE', mode: 'line' as const, border: 'border-slate-300' },
                { label: 'FULL COLOR', mode: 'color' as const, border: 'border-amber-300' },
              ].map((preview) => (
                <div key={preview.label} className={`preview-panel preview-panel-${preview.mode} flex min-h-[360px] flex-col rounded-[28px] border-4 ${preview.border} bg-white p-3 shadow-xl`}>
                  <div className="preview-panel-label mb-2 text-center text-xs font-black tracking-widest text-slate-700">{preview.mode === 'line' ? '✏️ YOUR COLORING PAGE' : '🎨 FULL COLOUR PREVIEW'}</div>
                  <div className="min-h-0 flex-1">
                    <PlayyScene config={config} mode={preview.mode} finish className="h-full w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 10: TRUMP CARD */}
          {currentStep === 'card' && card && (() => {
            const scale = Math.min(1, (window.innerHeight * 0.52) / CARD_H, (window.innerWidth - 48) / CARD_W);
            return (
              <div className="card-review-layout flex flex-col lg:flex-row items-center justify-center gap-8 p-2">
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
            <div className="complete-page flex min-h-full flex-col items-end justify-center gap-5 p-4 text-right">
              <h2 className="complete-page-heading">PRINT &amp;<br />COMPLETE</h2>
              <img className="complete-mascot" src="/assets/generated/print-mascot.png" alt="Playyy holding the completed coloring page" />
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
                  EDIT MY PLAYYY
                </button>
                <button type="button" onClick={() => { nativeFeedback.notificationSuccess(); onAutoReset(); }} className="complete-finish btn-3d mt-4 w-full py-3 px-6 font-bold text-base">→ FINISH</button>
              </div>
            </div>
          )}
      </div>

      {/* 4. Bottom Navigation: BACK on left, ONE DOMINANT NEXT ON RIGHT */}
      {!['card', 'complete'].includes(currentStep) && (
        <div className={`machine-navigation w-full flex items-center justify-between px-2 pt-2 shrink-0 z-20 ${currentStep === 'head' || currentStep === 'pose' || currentStep === 'colors' || currentStep === 'quiz' || currentStep === 'power' || currentStep === 'world' ? 'head-navigation' : ''}`}>
          <button
            type="button"
            onClick={goBack}
            className={`btn-3d btn-3d-blue py-4 px-8 font-bold text-lg ${currentStep === 'head' || currentStep === 'pose' || currentStep === 'colors' || currentStep === 'quiz' || currentStep === 'power' || currentStep === 'world' ? 'head-nav-button' : ''}`}
          >
            <ArrowLeft strokeWidth={3.4} aria-hidden="true" />
            <span>BACK</span>
          </button>

          {currentStep !== 'quiz' && (
          <button
            type="button"
            onClick={goNext}
            className={`btn-3d py-5 px-10 font-bold text-xl sm:text-2xl flex items-center gap-3 ${currentStep === 'head' || currentStep === 'pose' || currentStep === 'colors' || currentStep === 'quiz' || currentStep === 'power' || currentStep === 'world' ? 'head-nav-button head-nav-next' : ''}`}
          >
            <span>NEXT</span>
            <ArrowRight strokeWidth={3.4} aria-hidden="true" />
          </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
