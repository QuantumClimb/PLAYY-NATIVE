import type { Asset } from '../../lib/assets/types';
import { effectiveRegionColor, regionGroup } from '../../lib/playys/colors';
import type { CharacterColorConfiguration, ColorMode } from '../../lib/playys/types';
import { copy } from '../copy';

/** One panel of swatches on the colours page. */
export interface ColorPanelSpec {
  /** `main` and `highlight` in simple mode; `head` or a layer name in advanced mode */
  key: string;
  label: string;
  /** The color showing for it now (undefined = the character's own) */
  value?: string;
}

const REGION_NAMES: Record<string, string> = {
  hoodie: 'Hoodie',
  trousers: 'Trousers',
  shoes: 'Shoes',
  soles: 'Shoe Soles',
  gloves: 'Gloves',
  cuffs: 'Sleeve Cuffs',
  trim: 'Clothing Trim',
  tassles: 'Hoodie Strings',
};

/** The order the parts are offered in; anything else follows. */
const REGION_ORDER = ['hoodie', 'trousers', 'shoes', 'cuffs', 'trim', 'soles', 'tassles'];

/** "shoe_soles" becomes "Shoe Soles" when a layer has no friendlier name. */
export const regionLabel = (key: string): string =>
  REGION_NAMES[key] ?? key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const regionRank = (key: string) => {
  const index = REGION_ORDER.indexOf(key.toLowerCase());
  return index === -1 ? REGION_ORDER.length : index;
};

/**
 * The panels the visitor can colour. Simple mode has two: a main and a secondary colour.
 * Advanced mode has one for the head and one for each part of the chosen pose, except the gloves (always white)
 * and the outlines.
 */
export function colorPanels(
  mode: Exclude<ColorMode, 'freeform'>,
  body: Pick<Asset, 'parts'>,
  colors?: CharacterColorConfiguration,
): ColorPanelSpec[] {
  if (mode === 'simple') {
    return [
      { key: 'main', label: copy.colors.main, value: colors?.main },
      { key: 'highlight', label: copy.colors.secondary, value: colors?.highlight },
    ];
  }
  const parts = Object.keys(body.parts)
    .filter((key) => !/(outline|line)/i.test(key) && regionGroup(key) !== 'gloves')
    .sort((a, b) => regionRank(a) - regionRank(b));
  return [
    { key: 'head', label: copy.colors.head, value: effectiveRegionColor(colors, 'head') },
    ...parts.map((key) => ({ key, label: regionLabel(key), value: effectiveRegionColor(colors, key) })),
  ];
}
