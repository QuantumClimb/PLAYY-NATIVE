import React, { useMemo, useState } from 'react';
import { ANCHORS_BY_TYPE, Asset, AssetMeta, api } from './api';
import { AssetPreview } from './AssetPreview';
import { CompositePreview, DEFAULT_HEAD_SCALE, anchorOf } from './CompositePreview';
import {
  BwRule,
  PartConfig,
  PartMode,
  PartsConfig,
  defaultParts,
  deriveColor,
  normalizeColor,
  parseSvgAsset,
} from '../lib/assets/svgParts';

interface AssetEditorProps {
  asset: Asset;
  /** Shared face used to preview heads */
  face?: Asset;
  /** All assets, so a head can be previewed on a body and the other way round */
  assets: Asset[];
  onSaved: (asset: Asset) => void;
  onDeleted: (id: number) => void;
}

const field = 'bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm';

export const AssetEditor: React.FC<AssetEditorProps> = ({ asset, face, assets, onSaved, onDeleted }) => {
  const parsed = useMemo(() => {
    try { return parseSvgAsset(asset.svg); } catch { return null; }
  }, [asset.svg]);

  const [name, setName] = useState(asset.name);
  const [parts, setParts] = useState<PartsConfig>(asset.parts);
  const [meta, setMeta] = useState<AssetMeta>(asset.meta);
  const [main, setMain] = useState(asset.meta.main ?? parsed?.mainFill ?? '#3b82f6');
  const anchorDefs = ANCHORS_BY_TYPE[asset.type] ?? [];
  const [activeAnchor, setActiveAnchor] = useState(anchorDefs[0]?.name ?? '');
  const pairType = asset.type === 'head' ? 'body' : asset.type === 'body' ? 'head' : null;
  const pairs = pairType ? assets.filter((a) => a.type === pairType && a.enabled) : [];
  const [pairId, setPairId] = useState<number | null>(pairs[0]?.id ?? null);
  const pair = pairs.find((a) => a.id === pairId) ?? pairs[0];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const draft: Asset = { ...asset, name, parts, meta: { ...meta, main } };
  const mainHex = normalizeColor(main) ?? '#3b82f6';

  const setPart = (key: string, patch: Partial<PartConfig>) =>
    setParts((p) => ({ ...p, [key]: { ...p[key], ...patch } }));

  async function run(fn: () => Promise<void>) {
    setBusy(true); setError(null); setNote(null);
    try { await fn(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  const save = () => run(async () => {
    onSaved(await api.update(asset.id, { name, parts, meta: draft.meta }));
    setNote('Saved');
  });

  const replaceSvg = (file: File) => run(async () => {
    const svg = await file.text();
    const next = parseSvgAsset(svg);
    // keep settings for parts that still exist, add defaults for new ones
    const merged: PartsConfig = { ...defaultParts(next) };
    next.parts.forEach((p) => { if (parts[p.key]) merged[p.key] = parts[p.key]; });
    onSaved(await api.update(asset.id, { svg, parts: merged }));
    setParts(merged);
    setNote(`SVG replaced (${next.parts.length} named parts)`);
  });

  const remove = () => run(async () => {
    if (!window.confirm(`Delete "${asset.name}"? This cannot be undone.`)) return;
    await api.remove(asset.id);
    onDeleted(asset.id);
  });

  const toggle = () => run(async () => {
    onSaved(await api.update(asset.id, { enabled: !asset.enabled }));
  });

  const isHead = asset.type === 'head';
  const headScale = (isHead ? meta.headScale : pair?.meta.headScale) ?? DEFAULT_HEAD_SCALE;
  const pairHead = isHead ? draft : pair;
  // One character color: the head's main color drives the head, hoodie, trousers and shoes
  // (and the lighter parts derived from it). Editing a body previews with the chosen head's color.
  const characterColor = isHead ? mainHex : normalizeColor(pair?.meta.main) ?? mainHex;
  const pairBody = isHead ? pair : draft;
  const neckDefaults =
    pairHead && pairBody
      ? [
          anchorOf(pairHead, 'neck', { x: 0, y: 0 }).isDefault && 'head',
          anchorOf(pairBody, 'neck', { x: 0, y: 0 }).isDefault && 'body',
        ].filter(Boolean)
      : [];

  // SVG markers (anchor_*) are the starting point; anchors placed here override them
  const anchors = { ...(parsed?.anchors ?? {}), ...(meta.anchors ?? {}) };
  const placeAnchor = (name: string, pt: { x: number; y: number }) =>
    setMeta((m) => ({ ...m, anchors: { ...m.anchors, [name]: pt } }));
  const clearAnchor = (name: string) =>
    setMeta((m) => {
      const next = { ...m.anchors };
      delete next[name];
      return { ...m, anchors: next };
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className={`${field} text-lg w-64`} />
        <span className="text-xs uppercase tracking-wider text-slate-400">{asset.type}</span>
        <button type="button" onClick={toggle} className={`text-xs px-3 py-1 rounded-full ${asset.enabled ? 'bg-emerald-700' : 'bg-slate-700'}`}>
          {asset.enabled ? 'Live on kiosk' : 'Hidden'}
        </button>
        <div className="ml-auto flex gap-2">
          <label className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm cursor-pointer">
            Replace SVG
            <input type="file" accept=".svg,image/svg+xml" hidden onChange={(e) => e.target.files?.[0] && replaceSvg(e.target.files[0])} />
          </label>
          <button type="button" onClick={remove} className="px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-sm">Delete</button>
          <button type="button" onClick={save} disabled={busy} className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm disabled:opacity-50">Save</button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-950 border border-red-800 p-2 text-sm text-red-200">{error}</div>}
      {note && <div className="rounded-lg bg-emerald-950 border border-emerald-800 p-2 text-sm text-emerald-200">{note}</div>}
      {!parsed && <div className="rounded-lg bg-red-950 border border-red-800 p-2 text-sm">This SVG could not be read.</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {(['color', 'line'] as const).map((m) => (
          <div key={m} className="rounded-2xl p-4 bg-white">
            <div className="text-xs text-slate-500 mb-2">{m === 'color' ? 'COLOR' : 'BLACK & WHITE'}</div>
            <AssetPreview
              asset={draft} face={face} mode={m} main={mainHex} className="w-full max-h-72 mx-auto"
              {...(m === 'color' && anchorDefs.length
                ? { anchors, activeAnchor, onPlaceAnchor: placeAnchor }
                : {})}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>{asset.type === 'body' ? 'Preview color' : asset.type === 'head' ? 'Character color' : 'Main color'}</span>
        <input type="color" value={mainHex} onChange={(e) => setMain(e.target.value)} className="h-8 w-12 bg-transparent" />
        <input value={main} onChange={(e) => setMain(e.target.value)} className={`${field} w-28`} />
        <span className="text-slate-400 text-xs">
          {asset.type === 'head'
            ? 'Drives the head and the body (hoodie, trousers, shoes) together. Saved as this head\'s default color.'
            : asset.type === 'body'
            ? 'Only for this asset on its own. On a character the color comes from the head.'
            : 'Preview any color to check the shading.'}
        </span>
      </div>

      {pairType && (
        <div className="rounded-xl border border-slate-700 p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>{isHead ? 'Preview on body' : 'Preview with head'}</span>
            {pairs.length > 0 ? (
              <select value={pair?.id} onChange={(e) => setPairId(Number(e.target.value))} className={field}>
                {pairs.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            ) : (
              <span className="text-xs text-slate-400">Upload a {pairType} to preview the fit.</span>
            )}
            {neckDefaults.length > 0 && (
              <span className="text-xs text-amber-300">
                Using a default neck point for the {neckDefaults.join(' and ')}. Place the Neck anchor to line them up exactly.
              </span>
            )}
          </div>

          {pairHead && pairBody && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {(['color', 'line'] as const).map((m) => (
                  <div key={m} className="rounded-2xl p-3 bg-white flex justify-center">
                    <CompositePreview
                      head={pairHead} body={pairBody} face={face} mode={m}
                      headMain={characterColor}
                      bodyMain={characterColor}
                      headScale={headScale} className="h-80"
                    />
                  </div>
                ))}
              </div>
              {isHead ? (
                <label className="flex items-center gap-3 text-xs">
                  <span className="w-32">Head size on body</span>
                  <input type="range" min={0.1} max={1.2} step={0.01} value={headScale}
                    onChange={(e) => setMeta({ ...meta, headScale: Number(e.target.value) })} className="flex-1" />
                  <span className="w-12 text-right">{headScale.toFixed(2)}</span>
                </label>
              ) : (
                <div className="text-xs text-slate-400">Head size is set on each head (open the head and use Head size on body).</div>
              )}
            </>
          )}
        </div>
      )}

      {anchorDefs.length > 0 && (
        <div className="rounded-xl border border-slate-700 p-3 space-y-2">
          <div className="text-sm">Anchors <span className="text-xs text-slate-400">Pick one, then click or drag on the color preview.</span></div>
          {anchorDefs.map((d) => {
            const pt = anchors[d.name];
            return (
              <label key={d.name} className="flex items-center gap-3 text-sm">
                <input type="radio" name="anchor" checked={activeAnchor === d.name} onChange={() => setActiveAnchor(d.name)} />
                <span className="flex-1">{d.label}</span>
                <span className="text-xs text-slate-400 w-32">{pt ? `${pt.x.toFixed(0)}, ${pt.y.toFixed(0)}${meta.anchors?.[d.name] ? '' : ' (from SVG)'}` : 'not set'}</span>
                {meta.anchors?.[d.name] && <button type="button" onClick={() => clearAnchor(d.name)} className="text-xs underline text-slate-400">clear</button>}
              </label>
            );
          })}
        </div>
      )}

      {isHead && (
        <div className="rounded-xl border border-slate-700 p-3 space-y-2">
          <div className="text-sm">Face placement {face ? `(using "${face.name}")` : '(upload a face asset to preview)'}</div>
          {([['faceScale', 'Size', 0.2, 1, 0.01, 0.61], ['faceDx', 'Left / right (%)', -30, 30, 0.5, 0], ['faceDy', 'Up / down (%)', -30, 30, 0.5, 0]] as const).map(
            ([k, label, min, max, step, def]) => (
              <label key={k} className="flex items-center gap-3 text-xs">
                <span className="w-32">{label}</span>
                <input type="range" min={min} max={max} step={step} value={meta[k] ?? def} onChange={(e) => setMeta({ ...meta, [k]: Number(e.target.value) })} className="flex-1" />
                <span className="w-12 text-right">{(meta[k] ?? def).toFixed(2)}</span>
              </label>
            ),
          )}
        </div>
      )}

      <div>
        <div className="text-sm mb-2">Named parts ({parsed?.parts.length ?? 0})</div>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 text-left">
              <tr><th className="p-2">Part</th><th>Drawn</th><th>Mode</th><th>Setting</th><th>Black &amp; white</th></tr>
            </thead>
            <tbody>
              {parsed?.parts.map((p) => {
                const cfg = parts[p.key] ?? p.defaults;
                return (
                  <tr key={p.key} className="border-t border-slate-800">
                    <td className="p-2">{p.id}{p.isGroup && <span className="text-slate-500 text-xs"> (group)</span>}</td>
                    <td><span className="inline-block w-5 h-5 rounded border border-slate-600 align-middle" style={{ background: p.fill ?? 'transparent' }} /></td>
                    <td>
                      <select value={cfg.mode} onChange={(e) => setPart(p.key, { ...cfg, mode: e.target.value as PartMode })} className={field}>
                        <option value="main">Main color</option>
                        <option value="derived">Derived from main</option>
                        <option value="fixed">Fixed color</option>
                        <option value="line">Line art</option>
                      </select>
                    </td>
                    <td>
                      {cfg.mode === 'derived' && (
                        <span className="flex items-center gap-2">
                          <input type="number" step={1} value={cfg.dL ?? 0} onChange={(e) => setPart(p.key, { ...cfg, dL: Number(e.target.value) })} className={`${field} w-20`} />
                          <span className="text-xs text-slate-400">lightness</span>
                          <span className="inline-block w-5 h-5 rounded border border-slate-600" style={{ background: deriveColor(mainHex, cfg.dL ?? 0) }} />
                        </span>
                      )}
                      {cfg.mode === 'fixed' && (
                        <span className="flex items-center gap-2">
                          <input type="color" value={normalizeColor(cfg.color) ?? normalizeColor(p.fill) ?? '#000000'} onChange={(e) => setPart(p.key, { ...cfg, color: e.target.value })} className="h-7 w-10 bg-transparent" />
                          {cfg.color && <button type="button" onClick={() => setPart(p.key, { ...cfg, color: undefined })} className="text-xs text-slate-400 underline">use drawn</button>}
                        </span>
                      )}
                    </td>
                    <td>
                      <select value={cfg.bw} onChange={(e) => setPart(p.key, { ...cfg, bw: e.target.value as BwRule })} className={field}>
                        <option value="auto">Auto (light becomes white)</option>
                        <option value="white">White</option>
                        <option value="keep">Keep drawn color</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {parsed && Object.keys(parsed.anchors).length > 0 && (
          <div className="text-xs text-slate-400 mt-2">
            Anchors found: {(Object.entries(parsed.anchors) as [string, { x: number; y: number }][]).map(([k, v]) => `${k} (${v.x.toFixed(0)}, ${v.y.toFixed(0)})`).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};
