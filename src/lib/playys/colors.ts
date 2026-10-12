import type { Selection } from '../assets/library';
import { normalizeId } from '../assets/svgParts';
import type { CharacterColorConfiguration } from './types';

/**
 * How a visitor's color choices turn into the colors drawn on the character.
 *
 * Simple mode: two choices.
 *   MAIN       -> the head and the hoodie, trousers and shoes
 *   SECONDARY  -> only the cuffs, the trim, the soles and the hoodie strings
 * Advanced mode: each part (the head, hoodie, trousers, shoes, cuffs, trim, soles, hoodie strings) can be set on
 * its own; anything not set follows the simple choices.
 * Gloves are always white.
 */

export type RegionGroup = 'main' | 'highlight' | 'gloves' | 'other';

export function regionGroup(key: string): RegionGroup {
  const k = normalizeId(key);
  if (/^(hoodie|jacket|top|shirt|trousers?|pants?|shoes?|sneakers?|boots?)$/.test(k)) return 'main';
  if (/^(cuffs?|trim|soles?|tassles?)$/.test(k)) return 'highlight';
  if (/^gloves?$/.test(k)) return 'gloves';
  return 'other';
}

export interface ResolvedColors {
  /** Color for the head's main layer */
  headMain: string;
  /** Color for the body's main layers (hoodie, trousers, shoes) */
  bodyMain: string;
  /** Fixed color for the body's lighter "derived" layers, when the head sets one */
  secondary?: string;
  /** Exact colors for named body layers, keyed by layer name */
  partColors: Record<string, string>;
}

export function resolveColors(sel: Selection, colors?: CharacterColorConfiguration): ResolvedColors {
  const advanced = colors?.mode === 'advanced';
  const parts = advanced ? (colors?.parts ?? {}) : {};
  const partColors: Record<string, string> = {};

  // Simple choices: the secondary color goes to the cuffs, trim, soles and hoodie strings only
  if (colors?.highlight) {
    ['cuffs', 'trim', 'soles', 'tassles'].forEach((k) => {
      partColors[k] = colors.highlight!;
    });
  }
  // Advanced: individual parts win over the simple choices
  Object.entries(parts).forEach(([key, color]) => {
    if (key !== 'head' && regionGroup(key) !== 'gloves' && color) partColors[key] = color;
  });
  // Gloves stay white
  partColors.gloves = '#ffffff';

  return {
    headMain: parts.head ?? colors?.main ?? sel.headMain,
    bodyMain: colors?.main ?? sel.outfit,
    secondary: sel.secondary,
    partColors,
  };
}

/** The color a part is currently showing, for marking the selected swatch (undefined = the character's default). */
export function effectiveRegionColor(colors: CharacterColorConfiguration | undefined, key: string): string | undefined {
  const advanced = colors?.mode === 'advanced';
  if (advanced && colors?.parts?.[key]) return colors.parts[key];
  if (key === 'head') return colors?.main;
  const g = regionGroup(key);
  if (g === 'main') return colors?.main;
  if (g === 'highlight') return colors?.highlight;
  return undefined;
}

/** The swatches, laid out as in the design: four per row, the last row centered. */
export const COLOR_SWATCHES: string[] = [
  '#ef2b2d',
  '#f7841f',
  '#f9d11f',
  '#38b63b',
  '#17c3e8',
  '#1b57e0',
  '#8a3fe0',
  '#f45fa0',
  '#f98ad0',
  '#a6e22e',
  '#14d8c0',
  '#1e7d2d',
  '#7a4a25',
  '#9aa0a6',
  '#1b1b1f',
];
