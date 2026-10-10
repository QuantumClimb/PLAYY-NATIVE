import { PlayyConfiguration, HeadId, PoseId, SymbolId, BackgroundId } from './types';
import { HEADS } from './heads';
import { POSES } from './poses';
import { SYMBOLS } from './symbols';
import { BACKGROUNDS } from './backgrounds';

// Empty slugs mean "the first asset of each kind"; see resolveSelection in lib/assets/library.
export const DEFAULT_CONFIGURATION: PlayyConfiguration = {
  head: '',
  pose: '',
  symbol: '',
  background: '',
  kidName: '',
};

export function getRandomElement<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

export function generateRandomConfiguration(): PlayyConfiguration {
  const randomHead = getRandomElement(HEADS).id;
  const randomPose = getRandomElement(POSES).id;
  const randomSymbol = getRandomElement(SYMBOLS).id;
  const randomBackground = getRandomElement(BACKGROUNDS).id;

  return {
    head: randomHead,
    pose: randomPose,
    symbol: randomSymbol,
    background: randomBackground,
  };
}

export function getHead(id: HeadId) {
  return HEADS.find((h) => h.id === id) || HEADS[0];
}

export function getPose(id: PoseId) {
  return POSES.find((p) => p.id === id) || POSES[0];
}

export function getSymbol(id: SymbolId) {
  return SYMBOLS.find((s) => s.id === id) || SYMBOLS[0];
}

export function getBackground(id: BackgroundId) {
  return BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0];
}
