import React, { useEffect, useState } from 'react';
import {
  BrandShadow,
  BrandStroke,
  logoSrc,
  refreshBrand,
  shadowFilter,
  useBrand,
} from '../lib/brand/brand';
import { LogoArt } from '../lib/brand/logoArt';

const row = 'flex items-center gap-3 text-sm';

/** Command center: the logo (SVG slot), its tight drop shadow in the app, and its stroke on finished artwork. */
export const LogoPanel: React.FC = () => {
  const brand = useBrand();
  const [shadow, setShadow] = useState<BrandShadow>(brand.shadow);
  const [stroke, setStroke] = useState<BrandStroke>(brand.stroke);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // Load the saved settings into the editable copies once
  useEffect(() => {
    refreshBrand().then(() => undefined);
  }, []);
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (synced) return;
    setShadow(brand.shadow);
    setStroke(brand.stroke);
    setSynced(true);
  }, [brand, synced]);

  async function put(url: string, body: unknown) {
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  }
  const run = async (fn: () => Promise<void>, done: string) => {
    setBusy(true); setError(null); setNote(null);
    try { await fn(); await refreshBrand(); setNote(done); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  const upload = (file: File) => run(async () => {
    if (!/\.svg$/i.test(file.name) && file.type !== 'image/svg+xml') throw new Error('Choose an .svg file.');
    await put('/api/cc/brand/logo', { svg: await file.text() });
  }, 'Logo replaced. The kiosk shows it the next time a page loads.');
  const useBuiltIn = () => run(() => put('/api/cc/brand/logo', { svg: null }), 'Back to the built-in logo.');
  const save = () => run(() => put('/api/cc/brand/settings', { shadow, stroke }), 'Saved.');

  const src = logoSrc(brand);
  const num = (v: string) => Number(v);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold">Logo</h2>
        <p className="text-sm text-gray-500">
          Used in the app (intro screen and the creation-screen header) and, later, composited onto the finished artwork.
          Currently: <strong>{brand.logoUrl ? 'your uploaded SVG' : 'the built-in SVG'}</strong>.
        </p>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-800">{error}</div>}
      {note && <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-sm text-emerald-800">{note}</div>}

      <div className="flex flex-wrap items-center gap-3">
        <label className="cc-btn cc-btn-primary cursor-pointer">
          Upload SVG logo
          <input type="file" accept=".svg,image/svg+xml" hidden disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); }} />
        </label>
        {brand.logoUrl && (
          <button type="button" onClick={useBuiltIn} disabled={busy} className="cc-btn">
            Go back to the built-in logo
          </button>
        )}
      </div>
      <ul className="text-xs text-gray-500 list-disc pl-5 space-y-0.5">
        <li>Name the layers: the black-and-white version keeps dark layers (eyes, boxes) black and turns the colored ones white.</li>
        <li>Convert text to outlines. Flat vector shapes only: embedded bitmaps, scripts and external links are rejected. Under 2 MB.</li>
      </ul>

      {/* ---- In the app: tight drop shadow ---- */}
      <section className="rounded-xl border border-gray-300 p-4 space-y-3">
        <div className="font-semibold">In the app: tight drop shadow</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 flex items-center justify-center h-44" style={{ background: 'linear-gradient(#5db7ee, #9ad86c)' }}>
            <img src={src} alt="Logo on scenery" className="h-28 w-auto max-w-full object-contain" style={{ filter: shadowFilter(shadow) }} />
          </div>
          <div className="rounded-2xl p-6 flex items-center justify-center h-44 bg-gradient-to-b from-indigo-950 to-purple-950">
            <img src={src} alt="Logo on dark" className="h-14 w-auto max-w-full object-contain" style={{ filter: shadowFilter(shadow) }} />
          </div>
        </div>
        <label className={row}>
          <input type="checkbox" checked={shadow.enabled} onChange={(e) => setShadow({ ...shadow, enabled: e.target.checked })} /> Drop shadow
        </label>
        {([['blur', 'Blur (px)', 0, 10, 0.5], ['offsetY', 'Distance down (px)', 0, 8, 0.5], ['opacity', 'Strength', 0, 1, 0.05]] as const).map(([k, label, min, max, step]) => (
          <label key={k} className={row}>
            <span className="w-40">{label}</span>
            <input type="range" min={min} max={max} step={step} value={shadow[k]} disabled={!shadow.enabled}
              onChange={(e) => setShadow({ ...shadow, [k]: num(e.target.value) })} className="flex-1" />
            <span className="w-10 text-right">{shadow[k]}</span>
          </label>
        ))}
      </section>

      {/* ---- On the finished artwork: stroke ---- */}
      <section className="rounded-xl border border-gray-300 p-4 space-y-3">
        <div className="font-semibold">On the finished artwork: stroke</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Color artwork</div>
            <div className="rounded-2xl p-6 flex items-center justify-center h-44"
              style={{ background: 'repeating-linear-gradient(45deg, #5db7ee 0 24px, #ffd92e 24px 48px, #f49ac1 48px 72px)' }}>
              <LogoArt mode="color" stroke={stroke} className="h-28 w-full" />
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Black-and-white coloring page</div>
            <div className="rounded-2xl p-6 flex items-center justify-center h-44 bg-white">
              <LogoArt mode="line" stroke={stroke} className="h-28 w-full" />
            </div>
          </div>
        </div>
        <label className={row}>
          <input type="checkbox" checked={stroke.enabled} onChange={(e) => setStroke({ ...stroke, enabled: e.target.checked })} /> Stroke around the logo
        </label>
        <label className={row}>
          <span className="w-40">Width (% of logo height)</span>
          <input type="range" min={0} max={8} step={0.1} value={stroke.width} disabled={!stroke.enabled}
            onChange={(e) => setStroke({ ...stroke, width: num(e.target.value) })} className="flex-1" />
          <span className="w-10 text-right">{stroke.width}</span>
        </label>
        <label className={row}>
          <span className="w-40">Color (color artwork)</span>
          <input type="color" value={stroke.color} disabled={!stroke.enabled}
            onChange={(e) => setStroke({ ...stroke, color: e.target.value })} className="h-8 w-12 bg-transparent" />
        </label>
        <p className="text-xs text-gray-500">
          Color artwork gets a rounded edge around the whole logo. The coloring page gets a black line around every shape (always at least a thin one, so the white shapes show on white paper).
        </p>
      </section>

      <button type="button" onClick={save} disabled={busy}
        className="cc-btn cc-btn-primary">Save logo settings</button>
    </div>
  );
};
