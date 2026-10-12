import type { Asset } from './types';
import type { AssetLibrary } from './library';

/**
 * Sample characters shipped with the app (public/assets/SVG). The kiosk shows them only when the server's asset
 * database cannot be reached, so it is never an empty screen. The command center's assets replace them as soon as
 * they can be loaded.
 */
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

export async function loadLocalFallbackLibrary(): Promise<AssetLibrary> {
  const [face, heads, bodies, symbols, backgrounds] = await Promise.all([
    localAsset(-1, 'face', 'face', 'Face', '/assets/SVG/heads/face.svg'),
    Promise.all([
      localAsset(-2, 'head', 'playy', 'Playy', '/assets/SVG/heads/playy.svg', { main: '#2563eb', headScale: 0.5 }),
      localAsset(-3, 'head', 'dreamyy', 'Dreamyy', '/assets/SVG/heads/dreamyy.svg', {
        main: '#f8fafc',
        headScale: 0.5,
      }),
      localAsset(-4, 'head', 'sparkyy', 'Sparkyy', '/assets/SVG/heads/sparkyy.svg', {
        main: '#ea580c',
        headScale: 0.5,
      }),
    ]),
    Promise.all([
      localAsset(-5, 'body', 'hero', 'Hero Stance', '/assets/SVG/poses/pose1.svg'),
      localAsset(-16, 'body', 'playy-3', 'Playy 3', '/assets/SVG/poses/playy-3.svg', {
        main: '#15489e',
        anchors: { neck: { x: 612, y: 170 }, chest: { x: 612, y: 390 } },
      }),
      localAsset(-17, 'body', 'playy-4', 'Playy 4', '/assets/SVG/poses/playy-4.svg', {
        main: '#15489e',
        anchors: { neck: { x: 612, y: 190 }, chest: { x: 612, y: 405 } },
      }),
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
