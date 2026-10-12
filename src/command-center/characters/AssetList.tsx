import React, { useState } from 'react';
import { ASSET_TYPES, Asset, AssetType } from '../api';

const TYPE_LABEL: Record<AssetType, string> = {
  head: 'Heads',
  face: 'Faces',
  body: 'Bodies (poses)',
  symbol: 'Symbols',
  background: 'Backgrounds',
};

interface AssetListProps {
  assets: Asset[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onUpload: (file: File, type: AssetType) => void;
}

/** The sidebar: upload an SVG and pick an asset, grouped by kind. */
export const AssetList: React.FC<AssetListProps> = ({ assets, selectedId, onSelect, onUpload }) => {
  const [uploadType, setUploadType] = useState<AssetType>('head');

  return (
    <aside className="space-y-4">
      <div className="flex gap-2">
        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value as AssetType)}
          className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm flex-1"
        >
          {ASSET_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <label className="px-3 py-1.5 rounded-lg bg-indigo-600 font-semibold text-white text-sm cursor-pointer hover:bg-indigo-700">
          Upload SVG
          <input
            type="file"
            accept=".svg,image/svg+xml"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) onUpload(file, uploadType);
            }}
          />
        </label>
      </div>

      {ASSET_TYPES.map((type) => {
        const items = assets.filter((a) => a.type === type);
        return (
          <div key={type}>
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
              {TYPE_LABEL[type]} ({items.length})
            </div>
            {items.length === 0 && <div className="text-xs text-gray-400">None yet</div>}
            {items.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelect(a.id)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex justify-between ${
                  a.id === selectedId ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <span>{a.name}</span>
                {!a.enabled && <span className="text-xs text-gray-500">hidden</span>}
              </button>
            ))}
          </div>
        );
      })}
    </aside>
  );
};
