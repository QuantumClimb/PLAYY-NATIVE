import React, { useEffect, useMemo, useState } from 'react';
import { AssetLibraryProvider } from '../lib/assets/library';
import { DEFAULT_CONFIGURATION } from '../lib/playys/configuration';
import { BASE_STATS, GeneratedCard } from '../lib/playys/cardTypes';
import { calculateArchetype } from '../lib/playys/archetypes';
import { DEFAULT_TRUMP_CARD, TrumpCardSettings, cleanTrumpCard } from '../lib/card/settings';
import { TrumpCardBack, TrumpCardFront } from '../components/card/TrumpCard';

const OUTLINE_PRESETS = ['#14246e', '#0b1646', '#1b3fbf', '#3b1d7a', '#111111', '#7a1020'];
const BACK_PRESETS = ['#1c2f8f', '#14246e', '#2b1a6e', '#0f5b4d', '#5b1330', '#222222'];


const Swatches: React.FC<{ value: string; presets: string[]; onChange: (c: string) => void }> = ({ value, presets, onChange }) => (
  <div className="flex items-center gap-1">
    {presets.map((c) => (
      <button key={c} type="button" onClick={() => onChange(c)} aria-label={c}
        className={`w-6 h-6 rounded-full border-2 ${value.toLowerCase() === c ? 'border-gray-900' : 'border-transparent'}`} style={{ background: c }} />
    ))}
    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 bg-transparent" />
  </div>
);

/** Command center: how the trump card is formatted (outline, corners, the back). Content on the card is fixed. */
export const TrumpCardPanel: React.FC = () => {
  const [settings, setSettings] = useState<TrumpCardSettings>(DEFAULT_TRUMP_CARD);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/trump-card')
      .then((r) => r.json())
      .then((d) => setSettings(cleanTrumpCard(d.settings) ?? DEFAULT_TRUMP_CARD))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const set = (patch: Partial<TrumpCardSettings>) => setSettings((s) => ({ ...s, ...patch }));

  // A sample card so the preview shows real artwork from the library
  const sample = useMemo<GeneratedCard>(() => ({
    id: 'sample',
    config: { ...DEFAULT_CONFIGURATION, kidName: 'Arjun' },
    stats: { ...BASE_STATS },
    archetype: calculateArchetype({ ...BASE_STATS }),
    createdAt: new Date().toISOString(),
  }), []);

  async function request(url: string, init: RequestInit) {
    const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError(null); setNote(null);
    try { await fn(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  const save = () => run(async () => {
    const d = await request('/api/cc/trump-card', { method: 'PUT', body: JSON.stringify(settings) });
    setSettings(cleanTrumpCard(d.settings) ?? settings);
    setNote('Saved. The kiosk uses the new card formatting the next time it loads.');
  });

  const reset = () => run(async () => {
    if (!window.confirm('Reset the trump card formatting to the original?')) return;
    await request('/api/cc/trump-card/reset', { method: 'POST' });
    setSettings(DEFAULT_TRUMP_CARD);
    setNote('Reset to the original formatting.');
  });

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold">Trump card formatting</h2>
        <p className="text-sm text-gray-500">
          The front is the visitor's finished artwork inside a thick outline; the back shows the power, stats and abilities.
          The power symbols and stat icons come from the power-up questions and are not edited here.
        </p>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-800">{error}</div>}
      {note && <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-sm text-emerald-800">{note}</div>}

      <div className="flex flex-wrap gap-8 rounded-2xl p-6 progress-tabs-preview justify-center">
        <AssetLibraryProvider>
          <TrumpCardFront card={sample} scale={0.8} settings={settings} />
          <TrumpCardBack card={sample} scale={0.8} settings={settings} />
        </AssetLibraryProvider>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-300 p-3 space-y-2">
          <div className="font-medium text-sm">Outline color</div>
          <Swatches value={settings.outlineColor} presets={OUTLINE_PRESETS} onChange={(c) => set({ outlineColor: c })} />
        </div>
        <div className="rounded-xl border border-gray-300 p-3 space-y-2">
          <div className="font-medium text-sm">Outline thickness: {settings.outlineWidth}</div>
          <input type="range" min={0} max={40} value={settings.outlineWidth} onChange={(e) => set({ outlineWidth: Number(e.target.value) })} className="w-full" />
        </div>
        <div className="rounded-xl border border-gray-300 p-3 space-y-2">
          <div className="font-medium text-sm">Corner roundness: {settings.radius}</div>
          <input type="range" min={0} max={60} value={settings.radius} onChange={(e) => set({ radius: Number(e.target.value) })} className="w-full" />
        </div>
        <div className="rounded-xl border border-gray-300 p-3 space-y-2">
          <div className="font-medium text-sm">Back: background</div>
          <Swatches value={settings.backBackground} presets={BACK_PRESETS} onChange={(c) => set({ backBackground: c })} />
        </div>
        <div className="rounded-xl border border-gray-300 p-3 space-y-2">
          <div className="font-medium text-sm">Back: headings and highlights</div>
          <Swatches value={settings.backAccent} presets={['#ffd633', '#ff9fd2', '#7de3ff', '#9dffb0', '#ffffff']} onChange={(c) => set({ backAccent: c })} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} disabled={busy} className="cc-btn">Reset to original</button>
        <button type="button" onClick={save} disabled={busy} className={`cc-btn cc-btn-primary ml-auto`}>Save card formatting</button>
      </div>
    </div>
  );
};
