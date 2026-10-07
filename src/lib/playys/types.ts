export type RenderMode = 'color' | 'coloring';

export type HeadId = 'blue' | 'dreamyy' | 'sparkyy';
export type PoseId = 'hero' | 'wave' | 'jump' | 'sitting';
export type SymbolId = 'star' | 'cloud' | 'flame' | 'heart' | 'lightning' | 'moon' | 'paw' | 'gear' | 'crown';
export type BackgroundId = 'happy-hills' | 'magic-castle' | 'space-world' | 'jungle-world' | 'cloud-kingdom' | 'city-adventure';

export interface PlayyConfiguration {
  head: HeadId;
  pose: PoseId;
  symbol: SymbolId;
  background: BackgroundId;
  kidName?: string;
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
