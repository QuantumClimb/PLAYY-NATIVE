import { useState } from 'react';
import { detailProblem } from '../../../shared/validation.mjs';
import type { PlayyConfiguration } from '../../lib/playys/types';
import { DETAIL_FIELDS, DETAIL_LIMITS, DetailField, applyDetailKey } from './detailsInput';

const FUN_NAMES = [
  'Sparky',
  'Bubbles',
  'Zippy',
  'Giggles',
  'Twinkle',
  'Pip',
  'Biscuit',
  'Jellybean',
  'Waffles',
  'Doodle',
  'Sunny',
  'Pickles',
];

type DetailStep = 0 | 1 | 2;

/** What the visitor has typed for a field. */
const valueOf = (config: PlayyConfiguration, field: DetailField): string =>
  (field === 'name' ? config.kidName : config[field]) ?? '';

/**
 * The name, phone and email screens: which one is showing, what has been typed, and the rules for moving on.
 * Nothing can be skipped, so each screen is checked before the next one opens.
 */
export function useDetailsForm(config: PlayyConfiguration, change: (patch: Partial<PlayyConfiguration>) => void) {
  const [step, setStep] = useState<DetailStep>(0);
  const [error, setError] = useState('');

  const field = DETAIL_FIELDS[step];
  const value = valueOf(config, field);

  const write = (text: string) => {
    setError('');
    change(field === 'name' ? { kidName: text } : { [field]: text });
  };

  return {
    /** 0 name, 1 phone, 2 email */
    step,
    field,
    value,
    error,
    onKey: (key: string) => {
      const next = applyDetailKey(field, value, key);
      if (next !== null) write(next);
    },
    clear: () => write(''),
    /** A fun name for the first screen when the visitor taps "Pick for Me!" */
    surprise: () => {
      setError('');
      change({ kidName: FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)].slice(0, DETAIL_LIMITS.name) });
    },
    /** Moves to the next screen. Returns false when this was the last one (or the answer is not good enough yet). */
    forward: (): 'next-screen' | 'done' | 'invalid' => {
      const problem = detailProblem(field, value);
      if (problem) {
        setError(problem);
        return 'invalid';
      }
      setError('');
      if (step < DETAIL_FIELDS.length - 1) {
        setStep((step + 1) as DetailStep);
        return 'next-screen';
      }
      return 'done';
    },
    /** Moves to the previous screen. Returns false when already on the first one. */
    back: (): boolean => {
      if (step === 0) return false;
      setStep((step - 1) as DetailStep);
      setError('');
      return true;
    },
    /** Start from the name screen (used when the visitor arrives from the page before) */
    restart: () => setStep(0),
    /** Start from the email screen (used when the visitor comes back from the page after) */
    last: () => setStep((DETAIL_FIELDS.length - 1) as DetailStep),
  };
}
