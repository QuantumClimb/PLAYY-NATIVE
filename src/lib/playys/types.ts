export interface CharacterColorConfiguration {
  /** CMS-compatible palette values used by the coloring stage. */
  palette?: string[];
  /** simple: a main and a secondary color. advanced: every part can be set on its own. */
  mode?: 'simple' | 'advanced';
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
}
