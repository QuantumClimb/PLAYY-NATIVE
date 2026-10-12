import React from 'react';
import { Asset } from '../../api';
import { ScenePanel } from '../ScenePanel';
import { AnchorsSection } from './AnchorsSection';
import { AssetHeader } from './AssetHeader';
import { AssetPreviews } from './AssetPreviews';
import { HeadColorsSection, MainColorRow } from './ColorSections';
import { FacePlacementSection } from './FacePlacementSection';
import { PairPreviewSection } from './PairPreviewSection';
import { PartsTable } from './PartsTable';
import { useAssetDraft } from './useAssetDraft';

interface AssetEditorProps {
  asset: Asset;
  /** Shared face used to preview heads */
  face?: Asset;
  /** All assets, so a head can be previewed on a body and the other way round */
  assets: Asset[];
  onSaved: (asset: Asset) => void;
  onDeleted: (id: number) => void;
}

const HAS_SCENE_PLACEMENT = ['background', 'body', 'head', 'symbol'];

/** Edit one asset: its name, colours, anchors, placement and the colour rules of every named layer. */
export const AssetEditor: React.FC<AssetEditorProps> = ({ asset, face, assets, onSaved, onDeleted }) => {
  const d = useAssetDraft({ asset, assets, onSaved, onDeleted });

  return (
    <div className="space-y-5">
      <AssetHeader d={d} />

      {d.error && <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-800">{d.error}</div>}
      {d.note && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-sm text-emerald-800">{d.note}</div>
      )}
      {!d.parsed && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm">This SVG could not be read.</div>
      )}

      <AssetPreviews d={d} face={face} />
      <MainColorRow d={d} />
      {d.isHead && <HeadColorsSection d={d} />}
      {d.pairType && <PairPreviewSection d={d} face={face} />}
      {HAS_SCENE_PLACEMENT.includes(asset.type) && (
        <ScenePanel draft={d.draft} assets={assets} face={face} setMeta={d.setMeta} />
      )}
      {d.anchorDefs.length > 0 && <AnchorsSection d={d} />}
      {d.isHead && <FacePlacementSection d={d} face={face} />}
      <PartsTable d={d} />
    </div>
  );
};
