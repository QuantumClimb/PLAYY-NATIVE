// @vitest-environment node
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// The routes run for real; only the database is replaced by a small in-memory stand-in.
const saved: Record<string, unknown> = {};
const memory = (name: string) => ({
  get: vi.fn(async () => saved[name] ?? null),
  save: vi.fn(async (value: unknown) => (saved[name] = value)),
  reset: vi.fn(async () => {
    delete saved[name];
  }),
});

vi.mock('../../server/db/index.mjs', () => ({
  ASSET_TYPES: ['head', 'face', 'body', 'symbol', 'background'],
  listAssets: vi.fn(async () => [{ id: 1, type: 'head', slug: 'playy', name: 'Playy' }]),
  createAsset: vi.fn(),
  updateAsset: vi.fn(async () => null),
  deleteAsset: vi.fn(),
  getBrand: vi.fn(async () => null),
  saveBrandLogo: vi.fn(),
  saveBrandSettings: vi.fn(),
  createMediaFile: vi.fn(),
  getMediaFile: vi.fn(async () => null),
  listSceneBackgrounds: vi.fn(async () => []),
  upsertSceneBackground: vi.fn(),
  resetSceneBackground: vi.fn(),
  addLead: vi.fn(),
  addVisit: vi.fn(),
  countUsers: vi.fn(async () => ({ started: 0, first_time: 0, returning: 0, finished: 0 })),
  clearUsers: vi.fn(),
  listAbandonedLeads: vi.fn(async () => []),
  addSubmission: vi.fn(),
  listSubmissions: vi.fn(async () => []),
  setSubmissionEmail: vi.fn(),
  settings: {
    powerQuiz: memory('quiz'),
    introBadges: memory('badges'),
    progressTabs: memory('tabs'),
    trumpCard: memory('card'),
    shareSettings: memory('share'),
    soundSettings: memory('sounds'),
  },
}));

let server: Server;
let base: string;
let cookie = '';

beforeAll(async () => {
  vi.stubEnv('COMMAND_CENTER_PASSWORD', 'open-sesame');
  vi.stubEnv('VERCEL', '');
  const { default: app } = await import('../../server/app.mjs');
  server = app.listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});

afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

const call = (path: string, init: RequestInit & { json?: unknown } = {}) =>
  fetch(base + path, {
    method: init.method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: init.json === undefined ? undefined : JSON.stringify(init.json),
  });

describe('public routes', () => {
  it('serve the kiosk its content', async () => {
    const res = await call('/assets');
    expect(res.status).toBe(200);
    expect((await res.json()).assets).toHaveLength(1);
  });

  it('let the edge keep the kiosk reads for a few minutes, but never for someone signed in or for a failure', async () => {
    const visitor = await fetch(base + '/assets');
    expect(visitor.headers.get('cache-control')).toContain('s-maxage=300');
    const admin = await fetch(base + '/assets', { headers: { cookie: 'cc_session=abc' } });
    expect(admin.headers.get('cache-control')).toBe('no-store');
    const db = await import('../../server/db/index.mjs');
    vi.mocked(db.listAssets).mockRejectedValueOnce(new Error('down'));
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failed = await fetch(base + '/assets');
    expect(failed.status).toBe(500);
    expect(failed.headers.get('cache-control') ?? '').not.toContain('s-maxage');
    quiet.mockRestore();
  });

  it('answer null for a setting nobody saved yet', async () => {
    expect(await (await call('/progress-tabs')).json()).toEqual({ tabs: null });
  });

  it('send the built-in intro picture to the static file, which works on Vercel too', async () => {
    const res = await fetch(base + '/media/cheerful-castle-initial', { redirect: 'manual' });
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/assets/Cheerful-Mascot-Castle-Adventure.png');
  });

  it('answer 404 as JSON for an unknown API path', async () => {
    const res = await call('/nothing-here');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});

describe('the command center', () => {
  it('turns away anyone who is not signed in', async () => {
    expect((await call('/cc/progress-tabs', { method: 'PUT', json: {} })).status).toBe(401);
    expect((await call('/cc/submissions')).status).toBe(401);
    expect((await call('/cc/leads')).status).toBe(401);
    expect((await call('/cc/user-counts')).status).toBe(401);
    expect((await call('/cc/users', { method: 'DELETE' })).status).toBe(401);
    expect((await call('/cc/session').then((r) => r.json())).signedIn).toBe(false);
  });

  it('refuses a wrong password and accepts the right one', async () => {
    expect((await call('/cc/login', { method: 'POST', json: { password: 'nope' } })).status).toBe(401);
    const ok = await call('/cc/login', { method: 'POST', json: { password: 'open-sesame' } });
    expect(ok.status).toBe(200);
    cookie = (ok.headers.get('set-cookie') ?? '').split(';')[0];
    expect((await call('/cc/session').then((r) => r.json())).signedIn).toBe(true);
  });

  it('rejects a bad setting with a plain message and nothing is saved', async () => {
    const res = await call('/cc/trump-card', { method: 'PUT', json: { outlineColor: 'red' } });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid outlineColor');
    expect(saved.card).toBeUndefined();
  });

  it('saves a valid setting, serves it to the kiosk and resets it', async () => {
    const card = {
      outlineColor: '#112233',
      outlineWidth: 12,
      radius: 20,
      backBackground: '#000000',
      backAccent: '#ffffff',
    };
    expect(await (await call('/cc/trump-card', { method: 'PUT', json: card })).json()).toEqual({ settings: card });
    expect(await (await call('/trump-card')).json()).toEqual({ settings: card });
    await call('/cc/trump-card/reset', { method: 'POST' });
    expect(await (await call('/trump-card')).json()).toEqual({ settings: null });
  });

  it('checks the recipient emails', async () => {
    const res = await call('/cc/share-settings', {
      method: 'PUT',
      json: { enabled: true, recipients: ['not-an-email'] },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('One of the emails is not valid');
  });
});

describe('sharing', () => {
  it('refuses a share without a name and says why', async () => {
    const res = await call('/submissions', { method: 'POST', json: { name: '' } });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('A name is needed');
  });

  it('counts a FIRST TIME visit and refuses any other kind', async () => {
    const db = await import('../../server/db/index.mjs');
    expect((await call('/visits', { method: 'POST', json: { kind: 'x' } })).status).toBe(400);
    expect((await call('/visits', { method: 'POST', json: { kind: 'first' } })).status).toBe(200);
    expect(db.addVisit).toHaveBeenCalledWith('first');
  });

  it('keeps the phone number from "Already a PlayyPal?" and refuses a bad one', async () => {
    const db = await import('../../server/db/index.mjs');
    expect((await call('/leads', { method: 'POST', json: { phone: '12' } })).status).toBe(400);
    expect((await call('/leads', { method: 'POST', json: { phone: '+91 98765 43210' } })).status).toBe(200);
    expect(db.addLead).toHaveBeenCalledWith('+91 98765 43210');
  });
});

describe('errors', () => {
  it('never show the inside of a failure to the caller', async () => {
    const db = await import('../../server/db/index.mjs');
    vi.mocked(db.listAssets).mockRejectedValueOnce(new Error('connection string postgres://secret'));
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await call('/assets');
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain('secret');
    quiet.mockRestore();
  });
});
