import React from 'react';
import { Asset } from '../../api';
import { CompositePreview } from '../CompositePreview';
import { AssetDraft } from './useAssetDraft';

const field = 'bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm';
const MODES = ['color', 'line'] as const;

/** A head on a body (or the other way round) in colour and black and white, with the head size control. */
export const PairPreviewSection: React.FC<{ d: AssetDraft; face?: Asset }> = ({ d, face }) => {
  const { pairHead, pairBody, pairs, pair, pairType, isHead, headScale, meta, setMeta } = d;
  return (
    <div className="rounded-xl border border-gray-300 p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>{isHead ? 'Preview on body' : 'Preview with head'}</span>
        {pairs.length > 0 ? (
          <select value={pair?.id} onChange={(e) => d.setPairId(Number(e.target.value))} className={field}>
            {pairs.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-gray-500">Upload a {pairType} to preview the fit.</span>
        )}
        {d.neckDefaults.length > 0 && (
          <span className="text-xs text-amber-700">
            Using a default neck point for the {d.neckDefaults.join(' and ')}. Place the Neck anchor to line them up
            exactly.
          </span>
        )}
      </div>

      {pairHead && pairBody && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {MODES.map((mode) => (
              <div key={mode} className="rounded-2xl p-3 bg-white flex justify-center">
                <CompositePreview
                  head={pairHead}
                  body={pairBody}
                  face={face}
                  mode={mode}
                  headMain={d.characterColor}
                  bodyMain={d.outfitColor}
                  bodySecondary={d.secondaryColor}
                  headScale={headScale}
                  className="h-80"
                />
              </div>
            ))}
          </div>
          {isHead ? (
            <label className="flex items-center gap-3 text-xs">
              <span className="w-32">Head size on body</span>
              <input
                type="range"
                min={0.1}
                max={1.2}
                step={0.01}
                value={headScale}
                onChange={(e) => setMeta({ ...meta, headScale: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="w-12 text-right">{headScale.toFixed(2)}</span>
            </label>
          ) : (
            <div className="text-xs text-gray-500">
              Head size is set on each head (open the head and use Head size on body).
            </div>
          )}
        </>
      )}
    </div>
  );
};
