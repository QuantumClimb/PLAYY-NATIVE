import React from 'react';
import { AssetDraft } from './useAssetDraft';

/** The attachment points this kind of asset needs. Pick one, then click or drag on the colour preview. */
export const AnchorsSection: React.FC<{ d: AssetDraft }> = ({ d }) => (
  <div className="rounded-xl border border-gray-300 p-3 space-y-2">
    <div className="text-sm">
      Anchors <span className="text-xs text-gray-500">Pick one, then click or drag on the color preview.</span>
    </div>
    {d.anchorDefs.map((def) => {
      const pt = d.anchors[def.name];
      const placed = d.meta.anchors?.[def.name];
      return (
        <label key={def.name} className="flex items-center gap-3 text-sm">
          <input
            type="radio"
            name="anchor"
            checked={d.activeAnchor === def.name}
            onChange={() => d.setActiveAnchor(def.name)}
          />
          <span className="flex-1">{def.label}</span>
          <span className="text-xs text-gray-500 w-32">
            {pt ? `${pt.x.toFixed(0)}, ${pt.y.toFixed(0)}${placed ? '' : ' (from SVG)'}` : 'not set'}
          </span>
          {placed && (
            <button type="button" onClick={() => d.clearAnchor(def.name)} className="text-xs underline text-gray-500">
              clear
            </button>
          )}
        </label>
      );
    })}
  </div>
);
