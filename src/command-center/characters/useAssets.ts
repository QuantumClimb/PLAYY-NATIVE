import { useCallback, useState } from 'react';
import { defaultParts, parseSvgAsset } from '../../lib/assets/svgParts';
import { Asset, AssetType, ccApi } from '../api';

/** The character assets in the command center: the list, the chosen one, and uploading a new SVG. */
export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => setAssets(await ccApi.list()), []);

  const upload = async (file: File, type: AssetType) => {
    setError(null);
    try {
      const svg = await file.text();
      const parsed = parseSvgAsset(svg);
      const asset = await ccApi.create({
        type,
        name: file.name.replace(/\.svg$/i, ''),
        svg,
        parts: defaultParts(parsed),
        meta: parsed.mainFill ? { main: parsed.mainFill } : {},
      });
      setAssets((list) => [...list, asset]);
      setSelectedId(asset.id);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const replace = (next: Asset) => setAssets((list) => list.map((a) => (a.id === next.id ? next : a)));
  const remove = (id: number) => {
    setAssets((list) => list.filter((a) => a.id !== id));
    setSelectedId(null);
  };

  const selected = assets.find((a) => a.id === selectedId);
  // The shared face, used to preview heads
  const face = assets.find((a) => a.type === 'face' && a.enabled) ?? assets.find((a) => a.type === 'face');

  return { assets, selected, face, setSelectedId, error, load, upload, replace, remove };
}
