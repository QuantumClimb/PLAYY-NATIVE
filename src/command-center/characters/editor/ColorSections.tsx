import React from 'react';
import { deriveColor } from '../../../lib/assets/svgParts';
import { AssetDraft } from './useAssetDraft';

const field = 'bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm';

const MAIN_COLOR_LABEL = { body: 'Preview color', head: 'Character color' } as const;
const MAIN_COLOR_HELP = {
  head: 'The head color. The outfit follows it unless you set an outfit color below.',
  body: 'Only for this asset on its own. On a character the color comes from the head.',
} as const;

/** The color used to preview this asset (for a head, the character's color). */
export const MainColorRow: React.FC<{ d: AssetDraft }> = ({ d }) => {
  const type = d.asset.type;
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span>{MAIN_COLOR_LABEL[type as keyof typeof MAIN_COLOR_LABEL] ?? 'Main color'}</span>
      <input
        type="color"
        value={d.mainHex}
        onChange={(e) => d.setMain(e.target.value)}
        className="h-8 w-12 bg-transparent"
      />
      <input value={d.main} onChange={(e) => d.setMain(e.target.value)} className={`${field} w-28`} />
      <span className="text-gray-500 text-xs">
        {MAIN_COLOR_HELP[type as keyof typeof MAIN_COLOR_HELP] ?? 'Preview any color to check the shading.'}
      </span>
    </div>
  );
};

/** A head's outfit color and fixed secondary color; each can follow the head instead. */
export const HeadColorsSection: React.FC<{ d: AssetDraft }> = ({ d }) => {
  const { meta, setMeta, clearMeta, outfitColor, secondaryColor, mainHex } = d;
  return (
    <div className="rounded-xl border border-gray-300 p-3 space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-32">Outfit color</span>
        <input
          type="color"
          value={outfitColor}
          onChange={(e) => setMeta({ ...meta, outfit: e.target.value })}
          className="h-8 w-12 bg-transparent"
        />
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={!meta.outfit}
            onChange={(e) => (e.target.checked ? clearMeta('outfit') : setMeta({ ...meta, outfit: mainHex }))}
          />
          Same as head color
        </label>
        <span className="text-xs text-gray-500">Hoodie, trousers and shoes.</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-32">Secondary color</span>
        <input
          type="color"
          value={secondaryColor ?? deriveColor(outfitColor, 12)}
          onChange={(e) => setMeta({ ...meta, secondary: e.target.value })}
          className="h-8 w-12 bg-transparent"
        />
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={!meta.secondary}
            onChange={(e) =>
              e.target.checked ? clearMeta('secondary') : setMeta({ ...meta, secondary: deriveColor(outfitColor, 12) })
            }
          />
          Auto (a lighter shade of the outfit)
        </label>
        <span className="text-xs text-gray-500">Trim, soles, cuffs and tassles. Fixed once set.</span>
      </div>
    </div>
  );
};
