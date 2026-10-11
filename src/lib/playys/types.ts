export type RenderMode = 'color' | 'coloring';

export type HeadId = string; // asset slug from the command center
export type PoseId = string;
export type SymbolId = string;
export type BackgroundId = string;

export interface CharacterColorConfiguration {
  /** CMS-compatible palette values used by the coloring stage. */
  palette?: string[];
  /** Main body color. */
  body?: string;
  /** Explicit colors for editable body/clothing SVG regions. */
  clothing?: Record<string, string>;
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
