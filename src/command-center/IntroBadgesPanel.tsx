import React, { useEffect, useState } from 'react';
import {
  COLOR_PRESETS,
  DEFAULT_INTRO_BADGES,
  ICON_REGISTRY,
  IntroBadgeData,
  MAX_BADGE_LABEL,
  MAX_INTRO_BADGES,
  cleanBadges,
} from '../lib/intro/badges';
import { IntroBadges } from '../components/intro/IntroBadges';

const field = 'bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm';

/** Command center: the four small badges under the START button on the intro screen. */
export const IntroBadgesPanel: React.FC = () => {
  const [badges, setBadges] = useState<IntroBadgeData[]>(DEFAULT_INTRO_BADGES);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [openPicker, setOpenPicker] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/intro-badges')
      .then((r) => r.json())
      .then((d) => setBadges(cleanBadges(d.badges) ?? DEFAULT_INTRO_BADGES))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const update = (i: number, patch: Partial<IntroBadgeData>) =>
    setBadges((list) => list.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const move = (i: number, dir: -1 | 1) =>
    setBadges((list) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

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
    const d = await request('/api/cc/intro-badges', { method: 'PUT', body: JSON.stringify({ badges }) });
    setBadges(cleanBadges(d.badges) ?? badges);
    setNote('Saved. The kiosk shows the new badges the next time the intro screen loads.');
  });

  const reset = () => run(async () => {
    if (!window.confirm('Reset the badges to the original four?')) return;
    await request('/api/cc/intro-badges/reset', { method: 'POST' });
    setBadges(DEFAULT_INTRO_BADGES);
    setNote('Reset to the original badges.');
  });

  const uploadIcon = (i: number, file: File) => run(async () => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error('Use a PNG, JPG or WebP image (a transparent PNG works best).');
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
      reader.onerror = () => reject(new Error('Could not read the file'));
      reader.readAsDataURL(file);
    });
    const d = await request('/api/cc/scene-backgrounds/upload', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, mimeType: file.type, base64 }),
    });
    update(i, { icon: `media:${d.mediaId}` });
    setOpenPicker(null);
  });

  if (loading) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold">Intro screen badges</h2>
        <p className="text-sm text-slate-400">
          The small tiles under the Tap to Start button. They are labels only (not buttons). Up to {MAX_INTRO_BADGES}.
        </p>
      </div>

      {error && <div className="rounded-lg bg-red-950 border border-red-800 p-2 text-sm text-red-200">{error}</div>}
      {note && <div className="rounded-lg bg-emerald-950 border border-emerald-800 p-2 text-sm text-emerald-200">{note}</div>}

      <div className="rounded-2xl p-6 intro-badges-preview">
        <IntroBadges badges={badges} />
      </div>

      <div className="space-y-3">
        {badges.map((b, i) => {
          const [kind, ...rest] = b.icon.split(':');
          return (
            <div key={b.id + i} className="rounded-xl border border-slate-700 p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="text-xs px-2 disabled:opacity-30" aria-label="Move up">▲</button>
                  <button type="button" disabled={i === badges.length - 1} onClick={() => move(i, 1)} className="text-xs px-2 disabled:opacity-30" aria-label="Move down">▼</button>
                </div>
                <input value={b.label} maxLength={MAX_BADGE_LABEL} onChange={(e) => update(i, { label: e.target.value })}
                  className={`${field} w-40`} placeholder="Label" />
                <button type="button" onClick={() => setOpenPicker(openPicker === i ? null : i)} className={`${field} min-w-32`}>
                  Icon: {kind === 'lucide' ? rest.join(':') : kind === 'media' ? 'uploaded image' : kind === 'emoji' ? rest.join(':') : '?'}
                </button>
                <div className="flex items-center gap-1">
                  {COLOR_PRESETS.map((c) => (
                    <button key={c} type="button" onClick={() => update(i, { color: c })} aria-label={c}
                      className={`w-6 h-6 rounded-full border-2 ${b.color.toLowerCase() === c ? 'border-white' : 'border-transparent'}`} style={{ background: c }} />
                  ))}
                  <input type="color" value={b.color} onChange={(e) => update(i, { color: e.target.value })} className="h-7 w-9 bg-transparent" />
                </div>
                <button type="button" onClick={() => setBadges((l) => l.filter((_, idx) => idx !== i))}
                  className="ml-auto text-xs px-3 py-1 rounded-lg bg-red-900 hover:bg-red-800">Remove</button>
              </div>

              {openPicker === i && (
                <div className="rounded-lg bg-slate-900 p-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ICON_REGISTRY).map(([name, Icon]) => (
                      <button key={name} type="button" title={name}
                        onClick={() => { update(i, { icon: `lucide:${name}` }); setOpenPicker(null); }}
                        className={`p-2 rounded-lg border ${b.icon === `lucide:${name}` ? 'border-teal-400 bg-slate-800' : 'border-slate-700 hover:bg-slate-800'}`}>
                        <Icon className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 cursor-pointer">
                      Upload image
                      <input type="file" accept="image/png,image/jpeg,image/webp" hidden
                        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) uploadIcon(i, f); }} />
                    </label>
                    <span className="text-slate-400">or an emoji:</span>
                    <input maxLength={4} placeholder="🎨" className={`${field} w-20`}
                      onChange={(e) => e.target.value.trim() && update(i, { icon: `emoji:${e.target.value.trim()}` })} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={badges.length >= MAX_INTRO_BADGES}
          onClick={() => setBadges((l) => [...l, { id: `badge-${Date.now()}`, label: 'New', icon: 'lucide:Sparkles', color: COLOR_PRESETS[l.length % COLOR_PRESETS.length] }])}
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm disabled:opacity-40">+ Add badge</button>
        <button type="button" onClick={reset} disabled={busy} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm">Reset to original</button>
        <button type="button" onClick={save} disabled={busy || badges.length === 0}
          className="ml-auto px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm disabled:opacity-50">Save badges</button>
      </div>
    </div>
  );
};
