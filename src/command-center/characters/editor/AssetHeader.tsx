import React from 'react';
import { AssetDraft } from './useAssetDraft';

const field = 'bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm';

/** The top row: the name shown on the kiosk, whether it is live, and replace, delete and save. */
export const AssetHeader: React.FC<{ d: AssetDraft }> = ({ d }) => (
  <div className="flex flex-wrap items-center gap-3">
    <label className="flex flex-col text-xs text-gray-500">
      Name shown on the kiosk
      <input
        value={d.name}
        onChange={(e) => d.setName(e.target.value)}
        className={`${field} text-lg w-64`}
        placeholder="e.g. Thumbs Up"
      />
    </label>
    <span className="text-xs uppercase tracking-wider text-gray-500">{d.asset.type}</span>
    <button
      type="button"
      onClick={d.toggleEnabled}
      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${d.asset.enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
    >
      {d.asset.enabled ? 'Live on kiosk' : 'Hidden'}
    </button>
    <div className="ml-auto flex gap-2">
      <label className="cc-btn cursor-pointer">
        Replace SVG
        <input
          type="file"
          accept=".svg,image/svg+xml"
          hidden
          onChange={(e) => e.target.files?.[0] && d.replaceSvg(e.target.files[0])}
        />
      </label>
      <button type="button" onClick={d.remove} className="cc-btn cc-btn-danger">
        Delete
      </button>
      <button type="button" onClick={d.save} disabled={d.busy} className="cc-btn cc-btn-primary">
        Save
      </button>
    </div>
  </div>
);
