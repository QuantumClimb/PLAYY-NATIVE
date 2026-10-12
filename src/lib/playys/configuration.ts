import type { PlayyConfiguration } from './types';

// Empty slugs mean "the first asset of each kind"; see resolveSelection in lib/assets/library.
export const DEFAULT_CONFIGURATION: PlayyConfiguration = {
  head: '',
  pose: '',
  symbol: '',
  background: '',
  kidName: '',
};
