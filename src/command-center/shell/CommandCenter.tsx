import React, { useCallback, useEffect, useState } from 'react';
import { ccApi } from '../api';
import { CharactersTab } from '../characters/CharactersTab';
import { useAssets } from '../characters/useAssets';
import { Login } from './Login';
import { TABS, TabId } from './tabs';

type Session = 'loading' | 'out' | 'in' | 'offline';

export const CommandCenter: React.FC = () => {
  const [session, setSession] = useState<Session>('loading');
  const [loginEnabled, setLoginEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('characters');
  const assets = useAssets();
  const { load: loadAssets } = assets;

  const start = useCallback(async () => {
    try {
      const status = await ccApi.session();
      setLoginEnabled(status.enabled);
      if (!status.signedIn) return setSession('out');
      await loadAssets();
      setSession('in');
    } catch {
      setSession('offline');
    }
  }, [loadAssets]);

  useEffect(() => {
    void start();
  }, [start]);

  const signOut = async () => {
    await ccApi.logout();
    setSession('out');
  };

  const ActivePanel = TABS.find((t) => t.id === activeTab)?.Panel;

  return (
    <div className="cc-root min-h-screen h-screen overflow-y-auto">
      {session === 'loading' && <p className="p-8 cc-muted">Loading…</p>}
      {session === 'offline' && (
        <div className="p-8">
          <div className="cc-alert cc-alert-warn max-w-xl">
            The kiosk server is not running. Start it with: npm run server
          </div>
        </div>
      )}
      {session === 'out' && <Login enabled={loginEnabled} onDone={start} />}

      {session === 'in' && (
        <>
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
              <h1 className="text-base">Command Center</h1>
              <button type="button" className="cc-btn cc-btn-sm" onClick={signOut}>
                Sign out
              </button>
            </div>
            <nav className="max-w-7xl mx-auto px-6 flex gap-6 overflow-x-auto" aria-label="Sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </header>

          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {assets.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-800">{assets.error}</div>
            )}
            {/* Kept mounted so the chosen asset is still there when you come back to this tab */}
            <div hidden={activeTab !== 'characters'}>
              <CharactersTab state={assets} />
            </div>
            {ActivePanel && <ActivePanel />}
          </div>
        </>
      )}
    </div>
  );
};
