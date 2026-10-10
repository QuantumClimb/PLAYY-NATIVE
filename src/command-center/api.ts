export * from '../lib/assets/types';
import type { Asset } from '../lib/assets/types';

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
