import React, { useCallback, useEffect, useState } from 'react';
import { ASSET_TYPES, Asset, AssetType, api } from './api';
import { AssetEditor } from './AssetEditor';
import { SceneBackgroundsPanel } from './SceneBackgroundsPanel';
import { PowerQuizPanel } from './PowerQuizPanel';
import { IntroBadgesPanel } from './IntroBadgesPanel';
import { ProgressTabsPanel } from './ProgressTabsPanel';
import { TrumpCardPanel } from './TrumpCardPanel';
import { UsersPanel } from './UsersPanel';
import { ShareSettingsPanel } from './ShareSettingsPanel';
import { LogoPanel } from './LogoPanel';
import { SoundsPanel } from './SoundsPanel';
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
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={submit} className="cc-card cc-card-pad w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl">Command Center</h1>
          <p className="text-sm cc-muted">Sign in to manage the kiosk content.</p>
        </div>
        {!enabled && (
          <div className="cc-alert cc-alert-warn">
            Disabled. Set COMMAND_CENTER_PASSWORD in .env and restart the server.
          </div>
        )}
        <label className="block text-sm font-medium text-gray-700">
          Password
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="cc-input w-full mt-1"
          />
        </label>
        {error && <div className="cc-alert cc-alert-error">{error}</div>}
        <button type="submit" className="cc-btn cc-btn-primary w-full">
          Sign in
        </button>
      </form>
    </div>
  );
};

export const CommandCenter: React.FC = () => {
  const [state, setState] = useState<'loading' | 'out' | 'in' | 'offline'>('loading');
  const [activeTab, setActiveTab] = useState<
    | 'assets'
    | 'scene-backgrounds'
    | 'power-quiz'
    | 'intro-badges'
    | 'progress-tabs'
    | 'trump-card'
    | 'users'
    | 'share'
    | 'logo'
    | 'sounds'
  >('assets');
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

  const replaceAsset = (next: Asset) => setAssets((a) => a.map((x) => (x.id === next.id ? next : x)));

  const face = assets.find((a) => a.type === 'face' && a.enabled) ?? assets.find((a) => a.type === 'face');
  const current = assets.find((a) => a.id === selected);

  const TABS = [
    { id: 'assets', label: 'Characters' },
    { id: 'scene-backgrounds', label: 'Scene backgrounds' },
    { id: 'intro-badges', label: 'Intro badges' },
    { id: 'progress-tabs', label: 'Progress tabs' },
    { id: 'trump-card', label: 'Trump card' },
    { id: 'users', label: 'Users' },
    { id: 'share', label: 'Share & email' },
    { id: 'power-quiz', label: 'Power quiz' },
    { id: 'logo', label: 'Logo' },
    { id: 'sounds', label: 'Sounds' },
  ] as const;

  return (
    <div className="cc-root min-h-screen h-screen overflow-y-auto">
      {state === 'loading' && <p className="p-8 cc-muted">Loading…</p>}
      {state === 'offline' && (
        <div className="p-8">
          <div className="cc-alert cc-alert-warn max-w-xl">
            The kiosk server is not running. Start it with: npm run server
          </div>
        </div>
      )}
      {state === 'out' && <Login enabled={enabled} onDone={load} />}

      {state === 'in' && (
        <>
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
              <h1 className="text-base">Command Center</h1>
              <button
                type="button"
                className="cc-btn cc-btn-sm"
                onClick={async () => {
                  await api.logout();
                  setState('out');
                }}
              >
                Sign out
              </button>
            </div>
            <nav className="max-w-7xl mx-auto px-6 flex gap-6 overflow-x-auto" aria-label="Sections">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                    activeTab === t.id
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </header>

          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-800">{error}</div>
            )}

            {/* TAB 1: SVG Character Assets */}
            {activeTab === 'assets' && (
              <div className="grid md:grid-cols-[260px_1fr] gap-6">
                <aside className="space-y-4">
                  <div className="flex gap-2">
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as AssetType)}
                      className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm flex-1"
                    >
                      {ASSET_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TYPE_LABEL[t]}
                        </option>
                      ))}
                    </select>
                    <label className="px-3 py-1.5 rounded-lg bg-indigo-600 font-semibold text-white text-sm cursor-pointer hover:bg-indigo-700">
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
                        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                          {TYPE_LABEL[t]} ({items.length})
                        </div>
                        {items.length === 0 && <div className="text-xs text-gray-400">None yet</div>}
                        {items.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setSelected(a.id)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex justify-between ${
                              a.id === selected ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span>{a.name}</span>
                            {!a.enabled && <span className="text-xs text-gray-500">hidden</span>}
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
                    <p className="text-gray-500">Upload an SVG or pick an asset to edit it.</p>
                  )}
                </main>
              </div>
            )}

            {/* TAB 2: Scene Backgrounds CMS */}
            {activeTab === 'scene-backgrounds' && <SceneBackgroundsPanel />}

            {/* TAB 3: Power Quiz Questions CMS */}
            {activeTab === 'power-quiz' && <PowerQuizPanel />}
            {activeTab === 'intro-badges' && <IntroBadgesPanel />}
            {activeTab === 'progress-tabs' && <ProgressTabsPanel />}
            {activeTab === 'trump-card' && <TrumpCardPanel />}
            {activeTab === 'users' && <UsersPanel />}
            {activeTab === 'share' && <ShareSettingsPanel />}
            {activeTab === 'logo' && <LogoPanel />}
            {activeTab === 'sounds' && <SoundsPanel />}
          </div>
        </>
      )}
    </div>
  );
};
