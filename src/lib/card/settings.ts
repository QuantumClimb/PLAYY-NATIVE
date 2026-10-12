import { useEffect, useState } from 'react';

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

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Checks what the server or the CMS gives; anything unusable falls back to the default for that setting. */
export function cleanTrumpCard(input: unknown): TrumpCardSettings | null {
  const t = input as Partial<TrumpCardSettings> | null;
  if (!t || typeof t !== 'object') return null;
  const d = DEFAULT_TRUMP_CARD;
  const num = (v: unknown, fallback: number, max: number) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : fallback;
  return {
    outlineColor: typeof t.outlineColor === 'string' && HEX.test(t.outlineColor) ? t.outlineColor : d.outlineColor,
    outlineWidth: num(t.outlineWidth, d.outlineWidth, 40),
    radius: num(t.radius, d.radius, 60),
    backBackground:
      typeof t.backBackground === 'string' && HEX.test(t.backBackground) ? t.backBackground : d.backBackground,
    backAccent: typeof t.backAccent === 'string' && HEX.test(t.backAccent) ? t.backAccent : d.backAccent,
  };
}

let cached: TrumpCardSettings | null = null;

/** The card formatting from the command center, loaded once per page load. */
export function useTrumpCardSettings(): TrumpCardSettings {
  const [settings, setSettings] = useState<TrumpCardSettings>(cached ?? DEFAULT_TRUMP_CARD);
  useEffect(() => {
    if (cached) return;
    let live = true;
    fetch('/api/trump-card')
      .then((r) => r.json())
      .then((d) => {
        cached = cleanTrumpCard(d.settings) ?? DEFAULT_TRUMP_CARD;
        if (live) setSettings(cached);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return settings;
}
