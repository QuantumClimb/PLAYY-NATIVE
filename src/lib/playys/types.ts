/** simple: a main and a secondary color. advanced: every part on its own. freeform: painted by hand over the line art. */
export type ColorMode = 'simple' | 'advanced' | 'freeform';

export interface CharacterColorConfiguration {
  /** CMS-compatible palette values used by the coloring stage. */
  palette?: string[];
  mode?: ColorMode;
  /** Main color: the head, hoodie, trousers and shoes. */
  main?: string;
  /** Secondary color: the cuffs, trim and soles only. */
  highlight?: string;
  /** Advanced mode: colors for individual parts, keyed by layer name ('head' for the head). */
  parts?: Record<string, string>;
}

export interface PlayyConfiguration {
  /** Which head, pose, power symbol and background: the slug of the asset from the command center (empty = the first one) */
  head: string;
  pose: string;
  symbol: string;
  background: string;
  kidName?: string;
  phone?: string;
  email?: string;
  colors?: CharacterColorConfiguration;
  /**
   * Freeform mode: the hand-painted layer as a transparent PNG data URL, covering the body and head bounds.
   * Kept out of what is sent to the server (see sendShare).
   */
  paint?: string;
}
