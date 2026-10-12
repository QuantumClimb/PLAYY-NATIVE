import { api } from '../data/api';
import type { Asset } from '../lib/assets/types';

export * from '../lib/assets/types';

/** The command center's own calls: signing in and managing the character assets. */
export const ccApi = {
  session: () => api.get<{ signedIn: boolean; enabled: boolean }>('/api/cc/session'),
  login: (password: string) => api.post('/api/cc/login', { password }),
  logout: () => api.post('/api/cc/logout'),
  list: () => api.get<{ assets: Asset[] }>('/api/cc/assets').then((r) => r.assets),
  create: (a: Pick<Asset, 'type' | 'name' | 'svg' | 'parts' | 'meta'>) =>
    api.post<{ asset: Asset }>('/api/cc/assets', a).then((r) => r.asset),
  update: (id: number, patch: Partial<Pick<Asset, 'name' | 'svg' | 'parts' | 'meta' | 'enabled'>>) =>
    api.put<{ asset: Asset }>(`/api/cc/assets/${id}`, patch).then((r) => r.asset),
  remove: (id: number) => api.delete(`/api/cc/assets/${id}`),
};
