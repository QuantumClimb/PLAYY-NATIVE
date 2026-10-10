import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PlayyConfiguration } from '../playys/types';
import { normalizeColor } from './svgParts';
import type { Asset } from './types';

/** Everything the kiosk can offer, loaded once from the kiosk server (enabled assets only). */
export interface AssetLibrary {
  heads: Asset[];
  bodies: Asset[];
  symbols: Asset[];
  backgrounds: Asset[];
  face?: Asset;
}

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; library: AssetLibrary };

const Ctx = createContext<AssetLibrary | null>(null);

/** Shows a loading / error screen until the library is ready, then renders children. */
export const AssetLibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/assets');
      if (!res.ok) throw new Error(`Server answered ${res.status}`);
      const { assets } = (await res.json()) as { assets: Asset[] };
      const of = (type: Asset['type']) => assets.filter((a) => a.type === type);
      const library: AssetLibrary = {
        heads: of('head'), bodies: of('body'), symbols: of('symbol'), backgrounds: of('background'), face: of('face')[0],
      };
      const missing = (['heads', 'bodies', 'backgrounds'] as const).filter((k) => library[k].length === 0);
      if (missing.length) {
        throw new Error(`Add at least one ${missing.map((m) => m.replace(/s$/, '').replace('bodie', 'pose')).join(', ')} in the command center.`);
      }
      setState({ status: 'ready', library });
    } catch (e) {
      const msg = (e as Error).message;
      setState({ status: 'error', message: msg === 'Failed to fetch' || /Unexpected token/.test(msg) ? 'The kiosk server is not running.' : msg });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (state.status === 'ready') return <Ctx.Provider value={state.library}>{children}</Ctx.Provider>;

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
      {state.status === 'loading' ? (
        <p className="text-2xl">Loading…</p>
      ) : (
        <>
          <p className="text-2xl">{state.message}</p>
          <button type="button" onClick={load} className="btn-3d btn-3d-blue px-8 py-3 text-lg">TRY AGAIN</button>
        </>
      )}
    </div>
  );
};

export function useAssetLibrary(): AssetLibrary {
  const lib = useContext(Ctx);
  if (!lib) throw new Error('useAssetLibrary must be used inside AssetLibraryProvider');
  return lib;
}

/** The assets a configuration points at (by slug), falling back to the first of each type. */
export interface Selection {
  head: Asset;
  body: Asset;
  symbol?: Asset;
  background: Asset;
  face?: Asset;
  /** Character color: head, outfit and secondary all come from the chosen head */
  headMain: string;
  outfit: string;
  secondary?: string;
}

export function resolveSelection(lib: AssetLibrary, config: PlayyConfiguration): Selection {
  const pick = (list: Asset[], slug: string) => list.find((a) => a.slug === slug) ?? list[0];
  const head = pick(lib.heads, config.head);
  const headMain = normalizeColor(head.meta.main) ?? '#3b82f6';
  return {
    head,
    body: pick(lib.bodies, config.pose),
    symbol: lib.symbols.length ? pick(lib.symbols, config.symbol) : undefined,
    background: pick(lib.backgrounds, config.background),
    face: lib.face,
    headMain,
    outfit: normalizeColor(head.meta.outfit) ?? headMain,
    secondary: normalizeColor(head.meta.secondary) ?? undefined,
  };
}

export function useSelection(config: PlayyConfiguration): Selection {
  const lib = useAssetLibrary();
  return useMemo(() => resolveSelection(lib, config), [lib, config.head, config.pose, config.symbol, config.background]);
}
