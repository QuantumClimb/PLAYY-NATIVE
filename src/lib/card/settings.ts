import { isHexColor } from '../../../shared/validation.mjs';
import { useServerSetting } from '../../data/useServerSetting';

/** How the trump card is formatted. Edited in the command center (Trump card tab). */
export interface TrumpCardSettings {
  /** The thick outline around the front (the artwork) and the back */
  outlineColor: string;
  /** Outline thickness, in card units (the card is 340 wide) */
  outlineWidth: number;
  /** Corner radius of the card, in card units */
  radius: number;
  /** Background of the back (the stats side) */
  backBackground: string;
  /** Headings and highlights on the back */
  backAccent: string;
}

export const DEFAULT_TRUMP_CARD: TrumpCardSettings = {
  outlineColor: '#14246e',
  outlineWidth: 16,
  radius: 28,
  backBackground: '#1c2f8f',
  backAccent: '#ffd633',
};

/** Checks what the server or the CMS gives; anything unusable falls back to the default for that setting. */
export function cleanTrumpCard(input: unknown): TrumpCardSettings | null {
  const t = input as Partial<TrumpCardSettings> | null;
  if (!t || typeof t !== 'object') return null;
  const d = DEFAULT_TRUMP_CARD;
  const num = (v: unknown, fallback: number, max: number) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : fallback;
  return {
    outlineColor: isHexColor(t.outlineColor) ? t.outlineColor : d.outlineColor,
    outlineWidth: num(t.outlineWidth, d.outlineWidth, 40),
    radius: num(t.radius, d.radius, 60),
    backBackground: isHexColor(t.backBackground) ? t.backBackground : d.backBackground,
    backAccent: isHexColor(t.backAccent) ? t.backAccent : d.backAccent,
  };
}

const TRUMP_CARD_SETTING = {
  url: '/api/trump-card',
  key: 'settings',
  clean: (raw: unknown) => cleanTrumpCard(raw) ?? DEFAULT_TRUMP_CARD,
};

/** The card formatting from the command center, loaded once per page load. */
export const useTrumpCardSettings = (): TrumpCardSettings => useServerSetting(TRUMP_CARD_SETTING, DEFAULT_TRUMP_CARD);
