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

async function localAsset(
  id: number,
  type: Asset['type'],
  slug: string,
  name: string,
  url: string,
  meta: Asset['meta'] = {},
): Promise<Asset> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Unable to load local fallback asset: ${url}`);
  return {
    id,
    type,
    slug,
    name,
    svg: await res.text(),
    parts: {},
    meta,
    enabled: true,
    sort: id,
    updated: '',
  };
}

async function loadLocalFallbackLibrary(): Promise<AssetLibrary> {
  const [face, heads, bodies, symbols, backgrounds] = await Promise.all([
    localAsset(-1, 'face', 'face', 'Face', '/assets/SVG/heads/face.svg'),
    Promise.all([
      localAsset(-2, 'head', 'playy', 'Playy', '/assets/SVG/heads/playy.svg', { main: '#2563eb', headScale: 0.5 }),
      localAsset(-3, 'head', 'dreamyy', 'Dreamyy', '/assets/SVG/heads/dreamyy.svg', { main: '#f8fafc', headScale: 0.5 }),
      localAsset(-4, 'head', 'sparkyy', 'Sparkyy', '/assets/SVG/heads/sparkyy.svg', { main: '#ea580c', headScale: 0.5 }),
    ]),
    Promise.all([
      localAsset(-5, 'body', 'hero', 'Hero Stance', '/assets/SVG/poses/pose1.svg'),
      localAsset(-16, 'body', 'playy-3', 'Playy 3', '/assets/SVG/poses/playy-3.svg', { main: '#15489e', anchors: { neck: { x: 612, y: 170 }, chest: { x: 612, y: 390 } } }),
      localAsset(-17, 'body', 'playy-4', 'Playy 4', '/assets/SVG/poses/playy-4.svg', { main: '#15489e', anchors: { neck: { x: 612, y: 190 }, chest: { x: 612, y: 405 } } }),
    ]),
    Promise.all([
      localAsset(-6, 'symbol', 'heart', 'Warm Heart', '/assets/SVG/symbols/Warm%20Heart.svg'),
      localAsset(-7, 'symbol', 'lightning', 'Thunder Zap', '/assets/SVG/symbols/Thunderr%20Zap.svg'),
      localAsset(-8, 'symbol', 'paw', 'Puppy Paw', '/assets/SVG/symbols/Puppy%20Paw.svg'),
      localAsset(-9, 'symbol', 'cloud', 'Puffy Cloud', '/assets/SVG/symbols/Puffy%20Cloud.svg'),
      localAsset(-10, 'symbol', 'crown', 'Golden Crown', '/assets/SVG/symbols/Gollden%20Crown.svg'),
      localAsset(-11, 'symbol', 'flame', 'Fire Spark', '/assets/SVG/symbols/Fire%20Spark.svg'),
      localAsset(-12, 'symbol', 'moon', 'Crescent Moon', '/assets/SVG/symbols/Crescent%20Moon.svg'),
    ]),
    Promise.all([
      localAsset(-13, 'background', 'happy-hills', 'Happy Hills', '/assets/SVG/backgrounds/Background_01.svg'),
      localAsset(-14, 'background', 'magic-castle', 'Magic Castle', '/assets/SVG/backgrounds/Background_02.svg'),
      localAsset(-15, 'background', 'space-world', 'Space World', '/assets/SVG/backgrounds/Background_03.svg'),
    ]),
  ]);

  return { face, heads, bodies, symbols, backgrounds };
}

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
      try {
        // Keep the kiosk usable when the optional CMS database is offline.
        // The CMS response remains authoritative whenever it is available.
        setState({ status: 'ready', library: await loadLocalFallbackLibrary() });
        return;
      } catch {
      const msg = (e as Error).message;
      setState({ status: 'error', message: msg === 'Failed to fetch' || /Unexpected token/.test(msg) ? 'The kiosk server is not running.' : msg });
      }
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
