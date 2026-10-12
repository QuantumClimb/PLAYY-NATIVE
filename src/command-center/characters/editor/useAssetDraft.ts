import { useMemo, useState } from 'react';
import { ANCHORS_BY_TYPE, Asset, AssetMeta, ccApi } from '../../api';
import { DEFAULT_HEAD_SCALE, anchorOf } from '../../../lib/assets/scene';
import { PartConfig, PartsConfig, defaultParts, normalizeColor, parseSvgAsset } from '../../../lib/assets/svgParts';

interface Options {
  asset: Asset;
  /** All assets, so a head can be previewed on a body and the other way round */
  assets: Asset[];
  onSaved: (asset: Asset) => void;
  onDeleted: (id: number) => void;
}

type Point = { x: number; y: number };

/**
 * Everything the asset editor changes and works out: the unsaved edits (name, parts, meta, color),
 * the head/body pairing used for the preview, the colors that follow from them, and the save, replace and delete actions.
 */
export function useAssetDraft({ asset, assets, onSaved, onDeleted }: Options) {
  const parsed = useMemo(() => {
    try {
      return parseSvgAsset(asset.svg);
    } catch {
      return null;
    }
  }, [asset.svg]);

  const [name, setName] = useState(asset.name);
  const [parts, setParts] = useState<PartsConfig>(asset.parts);
  const [meta, setMeta] = useState<AssetMeta>(asset.meta);
  const [main, setMain] = useState(asset.meta.main ?? parsed?.mainFill ?? '#3b82f6');
  const anchorDefs = ANCHORS_BY_TYPE[asset.type] ?? [];
  const [activeAnchor, setActiveAnchor] = useState(anchorDefs[0]?.name ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // A head is previewed on a body, and a body with a head
  const pairType = asset.type === 'head' ? 'body' : asset.type === 'body' ? 'head' : null;
  const pairs = pairType ? assets.filter((a) => a.type === pairType && a.enabled) : [];
  const [pairId, setPairId] = useState<number | null>(pairs[0]?.id ?? null);
  const pair = pairs.find((a) => a.id === pairId) ?? pairs[0];

  const draft: Asset = { ...asset, name, parts, meta: { ...meta, main } };
  const mainHex = normalizeColor(main) ?? '#3b82f6';
  const isHead = asset.type === 'head';
  const headScale = (isHead ? meta.headScale : pair?.meta.headScale) ?? DEFAULT_HEAD_SCALE;
  const pairHead = isHead ? draft : pair;
  const pairBody = isHead ? pair : draft;

  // One character color: the head's main color drives the head, hoodie, trousers and shoes
  // (and the lighter parts derived from it). Editing a body previews with the chosen head's color.
  const characterColor = isHead ? mainHex : (normalizeColor(pair?.meta.main) ?? mainHex);
  // Outfit follows the head color unless this head sets its own; the secondary is auto unless fixed
  const outfitColor = normalizeColor(isHead ? meta.outfit : pair?.meta.outfit) ?? characterColor;
  const secondaryColor = normalizeColor(isHead ? meta.secondary : pair?.meta.secondary) ?? undefined;

  const neckDefaults =
    pairHead && pairBody
      ? [
          anchorOf(pairHead, 'neck', { x: 0, y: 0 }).isDefault && 'head',
          anchorOf(pairBody, 'neck', { x: 0, y: 0 }).isDefault && 'body',
        ].filter(Boolean)
      : [];

  // SVG markers (anchor_*) are the starting point; anchors placed here override them
  const anchors: Record<string, Point> = { ...(parsed?.anchors ?? {}), ...(meta.anchors ?? {}) };

  const setPart = (key: string, patch: Partial<PartConfig>) =>
    setParts((p) => ({ ...p, [key]: { ...p[key], ...patch } }));
  const clearMeta = (key: 'outfit' | 'secondary') =>
    setMeta((m) => {
      const next = { ...m };
      delete next[key];
      return next;
    });
  const placeAnchor = (anchor: string, pt: Point) =>
    setMeta((m) => ({ ...m, anchors: { ...m.anchors, [anchor]: pt } }));
  const clearAnchor = (anchor: string) =>
    setMeta((m) => {
      const next = { ...m.anchors };
      delete next[anchor];
      return { ...m, anchors: next };
    });

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const save = () =>
    run(async () => {
      onSaved(await ccApi.update(asset.id, { name, parts, meta: draft.meta }));
      setNote('Saved');
    });

  const replaceSvg = (file: File) =>
    run(async () => {
      const svg = await file.text();
      const next = parseSvgAsset(svg);
      // keep settings for parts that still exist, add defaults for new ones
      const merged: PartsConfig = { ...defaultParts(next) };
      next.parts.forEach((p) => {
        if (parts[p.key]) merged[p.key] = parts[p.key];
      });
      onSaved(await ccApi.update(asset.id, { svg, parts: merged }));
      setParts(merged);
      setNote(`SVG replaced (${next.parts.length} named parts)`);
    });

  const remove = () =>
    run(async () => {
      if (!window.confirm(`Delete "${asset.name}"? This cannot be undone.`)) return;
      await ccApi.remove(asset.id);
      onDeleted(asset.id);
    });

  const toggleEnabled = () =>
    run(async () => {
      onSaved(await ccApi.update(asset.id, { enabled: !asset.enabled }));
    });

  return {
    asset,
    parsed,
    draft,
    name,
    setName,
    parts,
    setPart,
    meta,
    setMeta,
    clearMeta,
    main,
    setMain,
    mainHex,
    isHead,
    headScale,
    characterColor,
    outfitColor,
    secondaryColor,
    anchorDefs,
    anchors,
    activeAnchor,
    setActiveAnchor,
    placeAnchor,
    clearAnchor,
    pairType,
    pairs,
    pair,
    setPairId,
    pairHead,
    pairBody,
    neckDefaults,
    busy,
    error,
    note,
    save,
    replaceSvg,
    remove,
    toggleEnabled,
  };
}

export type AssetDraft = ReturnType<typeof useAssetDraft>;
