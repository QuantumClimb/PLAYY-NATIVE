import { api } from '../../data/api';
import type { ShareCapture } from '../share/capture';

/** The print helper that runs on the kiosk PC (npm run print-helper). */
export const HELPER_URL = 'http://127.0.0.1:3002';

// The setting has no switch on screen any more; this key is new so an old value from the removed switch is ignored.
// To use the print helper on a PC: localStorage.setItem('playys-silent-print-helper', '1') in the browser console.
const KEY = 'playys-silent-print-helper';

/** Whether prints go through the helper (no print preview). Kept in this browser, so each kiosk PC has its own setting. */
export function silentPrintOn(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

// The pages of the last Playy, so PRINT AGAIN can send them again
let lastImages: ShareCapture['images'] | null = null;

/** Sends the finished pages to the helper. Returns false when silent printing is off or the helper cannot be reached. */
export async function printSilently(images: ShareCapture['images'] | null): Promise<boolean> {
  if (images) lastImages = images;
  if (!silentPrintOn() || !lastImages) return false;
  try {
    await api.post(`${HELPER_URL}/api/print`, { images: lastImages });
    return true;
  } catch (e) {
    console.error('Silent print failed', e);
    return false;
  }
}
