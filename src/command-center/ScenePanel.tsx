import React, { useMemo, useState } from 'react';
import { normalizeColor } from '../lib/assets/svgParts';
import { Asset, AssetMeta, AssetType } from './api';
import { AssetPreview } from './AssetPreview';
import { A4, DEFAULT_CHAR_HEIGHT, DEFAULT_SYMBOL_WIDTH, PRINT_MARGIN_MM, Rect, SCENE_H, SCENE_W, layoutScene } from './scene';

const SCENE_TYPES: AssetType[] = ['background', 'body', 'head', 'symbol'];

const pct = (r: Rect): React.CSSProperties => ({
  position: 'absolute',
  left: `${(r.x / SCENE_W) * 100}%`,
  top: `${(r.y / SCENE_H) * 100}%`,
  width: `${(r.w / SCENE_W) * 100}%`,
  height: `${(r.h / SCENE_H) * 100}%`,
});

interface SheetProps {
  layout: ReturnType<typeof layoutScene>;
  background: Asset; body: Asset; head: Asset; symbol?: Asset; face?: Asset;
  mode: 'color' | 'line';
  headMain: string; outfit: string; secondary?: string;
  guides: boolean;
}

/** One A4 sheet: the printable area inside the page margins, with the scene stretched to fill it. */
const Sheet: React.FC<SheetProps> = ({ layout, background, body, head, symbol, face, mode, headMain, outfit, secondary, guides }) => {
  const mx = (PRINT_MARGIN_MM / A4.w) * 100, my = (PRINT_MARGIN_MM / A4.h) * 100;
  return (
    <div className="relative bg-white shadow-lg mx-auto h-[28rem]" style={{ aspectRatio: `${A4.w} / ${A4.h}` }}>
      <div className="absolute overflow-hidden" style={{ left: `${mx}%`, right: `${mx}%`, top: `${my}%`, bottom: `${my}%` }}>
        <div className="relative w-full h-full">
          <AssetPreview asset={background} mode={mode} main={headMain} stretch style={pct(layout.background)} />
          <AssetPreview asset={body} mode={mode} main={outfit} secondary={secondary} style={pct(layout.body)} />
          {symbol && layout.symbol && <AssetPreview asset={symbol} mode={mode} main={headMain} style={pct(layout.symbol)} />}
          <AssetPreview asset={head} face={face} mode={mode} main={headMain} style={pct(layout.head)} />
        </div>
      </div>
      {guides && (
        <div className="absolute pointer-events-none border border-dashed border-sky-500"
          style={{ left: `${mx}%`, right: `${mx}%`, top: `${my}%`, bottom: `${my}%` }} />
      )}
    </div>
  );
};

interface ScenePanelProps {
  /** The asset being edited, with unsaved changes; it replaces its saved version in the scene */
  draft: Asset;
  assets: Asset[];
  face?: Asset;
  setMeta: (meta: AssetMeta) => void;
}

const field = 'bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm';

export const ScenePanel: React.FC<ScenePanelProps> = ({ draft, assets, face, setMeta }) => {
  const [guides, setGuides] = useState(true);
  const [picked, setPicked] = useState<Partial<Record<AssetType, number>>>({});

  const choose = (type: AssetType): Asset | undefined => {
    if (draft.type === type) return draft;
    const list = assets.filter((a) => a.type === type && a.enabled);
    return list.find((a) => a.id === picked[type]) ?? list[0];
  };

  const background = choose('background'), body = choose('body'), head = choose('head'), symbol = choose('symbol');

  const scene = useMemo(() => {
    if (!background || !body || !head) return null;
    try { return layoutScene({ background, body, head, symbol }); } catch { return null; }
  }, [background, body, head, symbol]);

  const missing = SCENE_TYPES.filter((t) => t !== 'symbol' && !choose(t));
  const headMain = normalizeColor(head?.meta.main) ?? '#3b82f6';
  const outfit = normalizeColor(head?.meta.outfit) ?? headMain;
  const secondary = normalizeColor(head?.meta.secondary) ?? undefined;

  return (
    <div className="rounded-xl border border-slate-700 p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>Scene preview (A4)</span>
        {SCENE_TYPES.map((t) => {
          const list = assets.filter((a) => a.type === t && a.enabled);
          if (draft.type === t) return <span key={t} className="text-xs text-slate-400">{t}: {draft.name} (editing)</span>;
          return (
            <label key={t} className="flex items-center gap-1 text-xs text-slate-300">
              {t}
              <select value={choose(t)?.id ?? ''} onChange={(e) => setPicked({ ...picked, [t]: Number(e.target.value) })} className={field}>
                {t === 'symbol' && <option value="">none</option>}
                {list.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
          );
        })}
        <label className="flex items-center gap-1 text-xs ml-auto">
          <input type="checkbox" checked={guides} onChange={(e) => setGuides(e.target.checked)} /> Show printable area
        </label>
      </div>

      {missing.length > 0 && <div className="text-xs text-slate-400">Upload a {missing.join(' and a ')} to see the scene.</div>}

      {scene && background && body && head && (
        <>
          <div className="grid md:grid-cols-2 gap-4 bg-slate-800/60 rounded-2xl p-4">
            {(['color', 'line'] as const).map((m) => (
              <div key={m} className="space-y-1">
                <div className="text-xs text-slate-400 text-center">{m === 'color' ? 'Color' : 'Print preview (black & white)'}</div>
                <Sheet layout={scene} background={background} body={body} head={head} symbol={symbol} face={face}
                  mode={m} headMain={headMain} outfit={outfit} secondary={secondary} guides={guides} />
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400">
            A4 {A4.w} x {A4.h} mm with a {PRINT_MARGIN_MM} mm margin. The background is stretched to fill the printable area.
          </div>
        </>
      )}

      {draft.type === 'background' && (
        <label className="flex items-center gap-3 text-xs">
          <span className="w-40">Character height</span>
          <input type="range" min={0.2} max={0.9} step={0.01} value={draft.meta.charHeight ?? DEFAULT_CHAR_HEIGHT}
            onChange={(e) => setMeta({ ...draft.meta, charHeight: Number(e.target.value) })} className="flex-1" />
          <span className="w-12 text-right">{(draft.meta.charHeight ?? DEFAULT_CHAR_HEIGHT).toFixed(2)}</span>
        </label>
      )}
      {draft.type === 'symbol' && (
        <label className="flex items-center gap-3 text-xs">
          <span className="w-40">Size on chest (% of body width)</span>
          <input type="range" min={5} max={40} step={0.5} value={draft.meta.widthPct ?? DEFAULT_SYMBOL_WIDTH}
            onChange={(e) => setMeta({ ...draft.meta, widthPct: Number(e.target.value) })} className="flex-1" />
          <span className="w-12 text-right">{(draft.meta.widthPct ?? DEFAULT_SYMBOL_WIDTH).toFixed(1)}</span>
        </label>
      )}
    </div>
  );
};
