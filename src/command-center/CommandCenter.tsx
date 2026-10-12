import React, { useCallback, useEffect, useState } from 'react';
import { ASSET_TYPES, Asset, AssetType, api } from './api';
import { AssetEditor } from './AssetEditor';
import { SceneBackgroundsPanel } from './SceneBackgroundsPanel';
import { PowerQuizPanel } from './PowerQuizPanel';
import { IntroBadgesPanel } from './IntroBadgesPanel';
import { LogoPanel } from './LogoPanel';
import { defaultParts, parseSvgAsset } from '../lib/assets/svgParts';

const TYPE_LABEL: Record<AssetType, string> = {
  head: 'Heads',
  face: 'Faces',
  body: 'Bodies (poses)',
  symbol: 'Symbols',
  background: 'Backgrounds',
};

const Login: React.FC<{ enabled: boolean; onDone: () => void }> = ({ enabled, onDone }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.login(password);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto mt-32 space-y-4">
      <h1 className="text-2xl font-bold">Command Center</h1>
      {!enabled && (
        <p className="text-amber-300 text-sm">
          Disabled. Set COMMAND_CENTER_PASSWORD in .env and restart the server.
        </p>
      )}
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
      />
      {error && <p className="text-red-300 text-sm">{error}</p>}
      <button type="submit" className="w-full py-2 rounded-lg bg-teal-500 font-bold text-slate-950">
        Sign in
      </button>
    </form>
  );
};

export const CommandCenter: React.FC = () => {
  const [state, setState] = useState<'loading' | 'out' | 'in' | 'offline'>('loading');
  const [activeTab, setActiveTab] = useState<'assets' | 'scene-backgrounds' | 'power-quiz' | 'intro-badges' | 'logo'>('assets');
  const [enabled, setEnabled] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [uploadType, setUploadType] = useState<AssetType>('head');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const s = await api.session();
      setEnabled(s.enabled);
      if (!s.signedIn) return setState('out');
      setAssets(await api.list());
      setState('in');
    } catch {
      setState('offline');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File) => {
    setError(null);
    try {
      const svg = await file.text();
      const parsed = parseSvgAsset(svg);
      const name = file.name.replace(/\.svg$/i, '');
      const asset = await api.create({
        type: uploadType,
        name,
        svg,
        parts: defaultParts(parsed),
        meta: parsed.mainFill ? { main: parsed.mainFill } : {},
      });
      setAssets((a) => [...a, asset]);
      setSelected(asset.id);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const replaceAsset = (next: Asset) =>
    setAssets((a) => a.map((x) => (x.id === next.id ? next : x)));

  const face =
    assets.find((a) => a.type === 'face' && a.enabled) ??
    assets.find((a) => a.type === 'face');
  const current = assets.find((a) => a.id === selected);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 overflow-y-auto h-screen">
      {state === 'loading' && <p>Loading…</p>}
      {state === 'offline' && (
        <p className="text-amber-300">
          The kiosk server is not running. Start it with: npm run server
        </p>
      )}
      {state === 'out' && <Login enabled={enabled} onDone={load} />}

      {state === 'in' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header & Main Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>

              {/* Panel Tabs Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('assets')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'assets'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🎨</span>
                  <span>Character SVG Assets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('scene-backgrounds')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'scene-backgrounds'
                      ? 'bg-teal-900/60 border border-teal-500 text-teal-200 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🖼️</span>
                  <span>Scene Backgrounds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('power-quiz')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'power-quiz'
                      ? 'bg-amber-900/60 border border-amber-500 text-amber-200 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>⚡</span>
                  <span>Power Quiz Questions</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('intro-badges')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'intro-badges'
                      ? 'bg-pink-900/60 border border-pink-500 text-pink-200 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🏷️</span>
                  <span>Intro Badges</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('logo')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'logo'
                      ? 'bg-sky-900/60 border border-sky-500 text-sky-200 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>✨</span>
                  <span>Logo</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              className="text-sm underline text-slate-400 hover:text-white shrink-0"
              onClick={async () => {
                await api.logout();
                setState('out');
              }}
            >
              Sign out
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-950 border border-red-800 p-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* TAB 1: SVG Character Assets */}
          {activeTab === 'assets' && (
            <div className="grid md:grid-cols-[260px_1fr] gap-6">
              <aside className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as AssetType)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm flex-1"
                  >
                    {ASSET_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABEL[t]}
                      </option>
                    ))}
                  </select>
                  <label className="px-3 py-1.5 rounded-lg bg-teal-500 font-bold text-slate-950 text-sm cursor-pointer hover:bg-teal-400">
                    Upload SVG
                    <input
                      type="file"
                      accept=".svg,image/svg+xml"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (f) upload(f);
                      }}
                    />
                  </label>
                </div>

                {ASSET_TYPES.map((t) => {
                  const items = assets.filter((a) => a.type === t);
                  return (
                    <div key={t}>
                      <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                        {TYPE_LABEL[t]} ({items.length})
                      </div>
                      {items.length === 0 && (
                        <div className="text-xs text-slate-600">None yet</div>
                      )}
                      {items.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelected(a.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex justify-between ${
                            a.id === selected ? 'bg-slate-700' : 'hover:bg-slate-800'
                          }`}
                        >
                          <span>{a.name}</span>
                          {!a.enabled && <span className="text-xs text-slate-500">hidden</span>}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </aside>

              <main>
                {current ? (
                  <AssetEditor
                    key={`${current.id}-${current.updated}-${current.svg.length}`}
                    asset={current}
                    face={face}
                    assets={assets}
                    onSaved={replaceAsset}
                    onDeleted={(id) => {
                      setAssets((a) => a.filter((x) => x.id !== id));
                      setSelected(null);
                    }}
                  />
                ) : (
                  <p className="text-slate-400">Upload an SVG or pick an asset to edit it.</p>
                )}
              </main>
            </div>
          )}

          {/* TAB 2: Scene Backgrounds CMS */}
          {activeTab === 'scene-backgrounds' && <SceneBackgroundsPanel />}

          {/* TAB 3: Power Quiz Questions CMS */}
          {activeTab === 'power-quiz' && <PowerQuizPanel />}
          {activeTab === 'intro-badges' && <IntroBadgesPanel />}
          {activeTab === 'logo' && <LogoPanel />}
        </div>
      )}
    </div>
  );
};
