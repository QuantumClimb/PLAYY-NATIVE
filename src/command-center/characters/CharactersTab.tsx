import React from 'react';
import { AssetEditor } from './editor/AssetEditor';
import { AssetList } from './AssetList';
import { useAssets } from './useAssets';

type Assets = ReturnType<typeof useAssets>;

/** Command center: the heads, faces, poses, symbols and backgrounds, and the editor for the chosen one. */
export const CharactersTab: React.FC<{ state: Assets }> = ({ state }) => {
  const { assets, selected, face } = state;
  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-6">
      <AssetList
        assets={assets}
        selectedId={selected?.id ?? null}
        onSelect={state.setSelectedId}
        onUpload={state.upload}
      />
      <main>
        {selected ? (
          <AssetEditor
            key={`${selected.id}-${selected.updated}-${selected.svg.length}`}
            asset={selected}
            face={face}
            assets={assets}
            onSaved={state.replace}
            onDeleted={state.remove}
          />
        ) : (
          <p className="text-gray-500">Upload an SVG or pick an asset to edit it.</p>
        )}
      </main>
    </div>
  );
};
