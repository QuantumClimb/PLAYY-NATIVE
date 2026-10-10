import { PartsConfig } from '../lib/assets/svgParts';

export const ASSET_TYPES = ['head', 'face', 'body', 'symbol', 'background'] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export interface AssetMeta {
  /** Default main color for this asset (for a head: the head color) */
  main?: string;
  /** Head only: outfit color (hoodie, trousers, shoes). Follows the head color when unset */
  outfit?: string;
  /** Head only: fixed color for the outfit's secondary parts (trim, soles, cuffs). Auto when unset */
  secondary?: string;
  /** Head only: where the shared face sits on it (scale = face width / head width, offsets in % of head size) */
  faceScale?: number;
  faceDx?: number;
  faceDy?: number;
  /** Head only: size on a body, as a multiple of the head SVG's own size */
  headScale?: number;
  /** Background only: character height as a fraction of the printable height */
  charHeight?: number;
  /** Symbol only: width on the chest as a % of the body width */
  widthPct?: number;
  /** Attachment points in the asset's own viewBox coordinates (override anchor_* markers in the SVG) */
  anchors?: Record<string, { x: number; y: number }>;
}

/** Which anchors each asset type needs: head and body meet at the neck, symbols sit on the chest. */
export const ANCHORS_BY_TYPE: Partial<Record<AssetType, { name: string; label: string }[]>> = {
  head: [{ name: 'neck', label: 'Neck (where the head sits on the body)' }],
  body: [
    { name: 'neck', label: 'Neck (where the head attaches)' },
    { name: 'chest', label: 'Chest (where the symbol goes)' },
  ],
  symbol: [{ name: 'center', label: 'Center (placed on the chest point)' }],
  background: [{ name: 'stand', label: 'Stand point (where the character\'s feet go)' }],
};

export interface Asset {
  id: number;
  type: AssetType;
  slug: string;
  name: string;
  svg: string;
  parts: PartsConfig;
  meta: AssetMeta;
  enabled: boolean;
  sort: number;
  updated: string;
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status });
  return data as T;
}

export const api = {
  session: () => call<{ signedIn: boolean; enabled: boolean }>('/api/cc/session'),
  login: (password: string) => call('/api/cc/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => call('/api/cc/logout', { method: 'POST' }),
  list: () => call<{ assets: Asset[] }>('/api/cc/assets').then((r) => r.assets),
  create: (a: Pick<Asset, 'type' | 'name' | 'svg' | 'parts' | 'meta'>) =>
    call<{ asset: Asset }>('/api/cc/assets', { method: 'POST', body: JSON.stringify(a) }).then((r) => r.asset),
  update: (id: number, patch: Partial<Pick<Asset, 'name' | 'svg' | 'parts' | 'meta' | 'enabled'>>) =>
    call<{ asset: Asset }>(`/api/cc/assets/${id}`, { method: 'PUT', body: JSON.stringify(patch) }).then((r) => r.asset),
  remove: (id: number) => call(`/api/cc/assets/${id}`, { method: 'DELETE' }),
};
