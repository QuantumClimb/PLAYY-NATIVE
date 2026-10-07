export type HeadId = 'blue' | 'dreamyy' | 'sparkyy';
export type PoseId = 'hero' | 'wave' | 'jump' | 'sitting';
export type SymbolId = 'star' | 'cloud' | 'flame' | 'heart' | 'lightning' | 'moon' | 'paw' | 'gear' | 'crown';
export type BackgroundId = 'happy-hills' | 'magic-castle' | 'space-world' | 'jungle-world' | 'cloud-kingdom' | 'city-adventure';

export interface PlayyConfig {
  head: HeadId;
  pose: PoseId;
  symbol: SymbolId;
  background: BackgroundId;
}
