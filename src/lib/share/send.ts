import type { PlayyConfiguration } from '../playys/types';
import type { ShareCapture } from './capture';

export interface ShareResult {
  ok: boolean;
  /** sent | failed | off (emailing is switched off in the command center) */
  email?: string;
}

interface Pending {
  name: string;
  email: string;
  phone: string;
  thumbnail: string;
  config: Partial<PlayyConfiguration>;
  images: ShareCapture['images'];
}

const PENDING_KEY = 'playys-pending-share';

async function post(body: Pending): Promise<ShareResult> {
  const res = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Share failed (${res.status})`);
  const data = await res.json();
  return { ok: true, email: data.email };
}

/** Logs the Playyy and has the server email the PDFs. If the server cannot be reached it is kept to try again later. */
export async function sendShare(config: PlayyConfiguration, capture: ShareCapture): Promise<ShareResult> {
  const body: Pending = {
    name: config.kidName ?? '',
    email: config.email ?? '',
    phone: config.phone ?? '',
    thumbnail: capture.thumbnail,
    config: { head: config.head, pose: config.pose, symbol: config.symbol, background: config.background, colors: config.colors },
    images: capture.images,
  };
  try {
    return await post(body);
  } catch {
    try { localStorage.setItem(PENDING_KEY, JSON.stringify(body)); } catch { /* storage full or blocked: nothing more to do */ }
    return { ok: false };
  }
}

/** Called when the kiosk starts: sends a Playyy that could not be sent last time. */
export async function retryPendingShare(): Promise<void> {
  let body: Pending | null = null;
  try { body = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null'); } catch { body = null; }
  if (!body) return;
  try {
    await post(body);
    localStorage.removeItem(PENDING_KEY);
  } catch { /* still offline: try again next time */ }
}
