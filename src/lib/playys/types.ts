export type RenderMode = 'color' | 'coloring';

export type HeadId = string; // asset slug from the command center
export type PoseId = string;
export type SymbolId = string;
export type BackgroundId = string;

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
  head: HeadId;
  pose: PoseId;
  symbol: SymbolId;
  background: BackgroundId;
  kidName?: string;
  phone?: string;
  email?: string;
  colors?: CharacterColorConfiguration;
}

export interface HeadDefinition {
  id: HeadId;
  name: string;
  tagline: string;
  badgeColor: string;
  description: string;
  primaryColor: string;
  accentColor: string;
}

export interface PoseDefinition {
  id: PoseId;
  name: string;
  description: string;
  tagline: string;
}

export interface SymbolDefinition {
  id: SymbolId;
  name: string;
  color: string;
  meaning: string;
}

export interface BackgroundDefinition {
  id: BackgroundId;
  name: string;
  subtitle: string;
  themeColor: string;
  previewBg: string;
}
