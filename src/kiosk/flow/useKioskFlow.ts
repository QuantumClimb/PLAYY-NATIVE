import { useEffect, useState } from 'react';
import type { AssetLibrary, Selection } from '../../lib/assets/library';
import { makeCard } from '../../lib/playys/card';
import type { GeneratedCard } from '../../lib/playys/cardTypes';
import { COLOR_SWATCHES } from '../../lib/playys/colors';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';
import { calculatePowerSymbol, usePowerQuizQuestions } from '../../lib/playys/powerQuiz';
import type { PlayyConfiguration } from '../../lib/playys/types';
import { playSfx } from '../../lib/sfx/engine';
import { IDLE_SECONDS, useIdleReset } from './useIdleReset';
import { useDetailsForm } from './useDetailsForm';
import { usePowerQuiz } from './usePowerQuiz';
import { useShare } from './useShare';
import { STEPS, StepContext, StepId, stepAfter, stepBefore } from './steps';

const anyOf = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

interface Options {
  config: PlayyConfiguration;
  onChangeConfig: (config: PlayyConfiguration) => void;
  onCardChange: (card: GeneratedCard | null) => void;
  library: AssetLibrary;
  selection: Selection;
  /** The visitor finished (after SHARE): open the print dialog and show the success screen */
  onFinish: () => void;
  /** Back to the intro screen (idle too long, or Back on the first page) */
  onExit: () => void;
}

/**
 * Where the visitor is and how they move: the current page, Next and Back, "Pick for Me!", the power-up questions,
 * the name, phone and email screens and SHARE. The pages themselves only draw what they are given.
 */
export function useKioskFlow({ config, onChangeConfig, onCardChange, library, selection, onFinish, onExit }: Options) {
  const [step, setStep] = useState<StepId>('head');
  const touch = useIdleReset(onExit, IDLE_SECONDS);

  const change = (patch: Partial<PlayyConfiguration>) => onChangeConfig({ ...config, ...patch });
  const questions = usePowerQuizQuestions();
  const quiz = usePowerQuiz(questions);
  const details = useDetailsForm(config, change);
  const [card, setCard] = useState<GeneratedCard | null>(null);
  const share = useShare({ config, selection, card, touch, onDone: onFinish });

  const colorMode = config.colors?.mode ?? 'simple';
  const context: StepContext = { colorMode, detailsStep: details.step, question: quiz.question };

  // The trump card is revealed with a sound
  useEffect(() => {
    if (step === 'card') playSfx('reveal');
  }, [step]);

  const goTo = (target: StepId) => {
    if (target === 'details') details.restart();
    setStep(target);
  };

  const next = () => {
    touch();
    nativeFeedback.impactLight();
    if (step === 'details') {
      const result = details.forward();
      if (result === 'invalid') return nativeFeedback.impactMedium();
      if (result === 'next-screen') return;
    }
    const target = stepAfter(step);
    if (target) goTo(target);
  };

  const back = () => {
    touch();
    nativeFeedback.impactLight();
    if (step === 'details' && details.back()) return;
    if (step === 'quiz' && quiz.undo()) return;
    if (step === 'power') {
      quiz.undo(); // the last answer is taken back so the last question shows again
      return setStep('quiz');
    }
    const target = stepBefore(step);
    if (!target) return onExit();
    if (target === 'details') details.last();
    setStep(target);
  };

  /** A choice on a card (head, pose, background) */
  const choose = (patch: Partial<PlayyConfiguration>) => {
    touch();
    nativeFeedback.selection();
    change(patch);
  };

  const setColor = (region: string, color: string) => {
    touch();
    nativeFeedback.selection();
    const colors = config.colors ?? {};
    if (region === 'main') change({ colors: { ...colors, main: color } });
    else if (region === 'highlight') change({ colors: { ...colors, highlight: color } });
    else change({ colors: { ...colors, parts: { ...colors.parts, [region]: color } } });
  };

  const setColorMode = (mode: 'simple' | 'advanced') => {
    touch();
    change({ colors: { ...config.colors, mode } });
  };

  /** An answer to a power-up question. The last one awards the power and makes the card. */
  const answerQuiz = (optionIndex: number) => {
    touch();
    nativeFeedback.selection();
    const { answers, finished } = quiz.answer(optionIndex);
    if (!finished) return;
    const symbol = calculatePowerSymbol(
      questions,
      answers,
      library.symbols.map((s) => s.slug),
    );
    const finishedConfig = { ...config, symbol };
    onChangeConfig(finishedConfig);
    const made = makeCard(finishedConfig, questions, answers);
    setCard(made);
    onCardChange(made);
    setStep('power');
  };

  /** "Pick for Me!": a random choice for the page being shown */
  const surprise = () => {
    touch();
    nativeFeedback.impactMedium();
    if (step === 'head') change({ head: anyOf(library.heads).slug });
    else if (step === 'pose') change({ pose: anyOf(library.bodies).slug });
    else if (step === 'world') change({ background: anyOf(library.backgrounds).slug });
    else if (step === 'colors')
      change({ colors: { ...config.colors, main: anyOf(COLOR_SWATCHES), highlight: anyOf(COLOR_SWATCHES) } });
    else if (step === 'quiz' && quiz.question) answerQuiz(Math.floor(Math.random() * quiz.question.options.length));
    else if (step === 'details') details.surprise();
  };

  return {
    step,
    def: STEPS[step],
    context,
    touch,
    /** Back to the intro screen */
    exit: onExit,
    next: step === 'complete' ? share.share : next,
    back,
    surprise,
    choose,
    setColor,
    setColorMode,
    colorMode,
    answerQuiz,
    quiz,
    details,
    share,
  };
}

export type KioskFlow = ReturnType<typeof useKioskFlow>;
