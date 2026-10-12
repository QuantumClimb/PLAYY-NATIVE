import type { AssetLibrary, Selection } from '../../lib/assets/library';
import type { GeneratedCard } from '../../lib/playys/cardTypes';
import type { PlayyConfiguration } from '../../lib/playys/types';
import type { KioskFlow } from '../flow/useKioskFlow';

/** What every page content gets to work with. */
export interface StepProps {
  flow: KioskFlow;
  config: PlayyConfiguration;
  selection: Selection;
  library: AssetLibrary;
  /** The visitor trump card, once the power-up questions are done */
  card: GeneratedCard | null;
}
