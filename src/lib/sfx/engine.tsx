import React, { useEffect } from 'react';
import { synthById } from './synth';
import { startMusic } from './music';
import { DEFAULT_SOUND_SETTINGS, SFX_EVENTS, SfxEvent, SoundSettings, cleanSettings } from './settings';

// ---------- the audio context and the loaded settings ----------
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let settings: SoundSettings = DEFAULT_SOUND_SETTINGS;
const buffers = new Map<string, Promise<AudioBuffer | null>>();

/** Browsers only allow audio after a tap; this is called from tap handlers and creates the context on first use. */
function audio(): { ctx: AudioContext; master: GainNode } | null {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return { ctx, master: master! };
  } catch {
    return null;
  }
}

function loadBuffer(mediaId: string): Promise<AudioBuffer | null> {
  let p = buffers.get(mediaId);
  if (!p) {
    const a = audio();
    p = a
      ? fetch(`/api/media/${mediaId}`)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('sound'))))
          .then((b) => a.ctx.decodeAudioData(b))
          .catch(() => null)
      : Promise.resolve(null);
    buffers.set(mediaId, p);
  }
  return p;
}

/** Plays one sound reference (`synth:pop`, `custom:abc`, `none`) at a volume, using the given settings for custom lookups. */
export function playRef(ref: string, volume = 1, cfg: SoundSettings = settings): void {
  if (ref === 'none') return;
  const a = audio();
  if (!a) return;
  a.master.gain.value = cfg.volume;
  const out = a.ctx.createGain();
  out.gain.value = volume;
  out.connect(a.master);

  if (ref.startsWith('synth:')) {
    synthById(ref.slice(6))?.play(a.ctx, out, a.ctx.currentTime + 0.005);
  } else if (ref.startsWith('custom:')) {
    const c = cfg.custom.find((x) => x.id === ref.slice(7));
    if (!c) return;
    void loadBuffer(c.mediaId).then((buf) => {
      if (!buf) return;
      const src = a.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(out);
      src.start();
    });
  }
}

/** Plays the sound assigned to a kiosk action (does nothing when sounds are switched off). */
export function playSfx(event: SfxEvent): void {
  if (!settings.enabled) return;
  const e = settings.events[event] ?? settings.events.tap;
  playRef(e.sound, e.volume);
}

// ---------- working out which action a tapped button is ----------
/** Explicit `data-sfx` wins; otherwise the button's own wording and role decide. */
function inferEvent(el: HTMLElement): SfxEvent | 'none' {
  const tagged = el.closest<HTMLElement>('[data-sfx]')?.dataset.sfx;
  if (tagged === 'none') return 'none';
  if (tagged && (SFX_EVENTS as readonly string[]).includes(tagged)) return tagged as SfxEvent;

  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  const cls = typeof el.className === 'string' ? el.className : '';
  if (cls.includes('intro-start')) return 'start';
  if (/⌫|backspace|delete/i.test(text)) return 'backspace';
  if (/^[←‹<]?\s*back\b/i.test(text)) return 'back';
  if (/surprise|pick for me/i.test(text)) return 'surprise';
  if (/flip/i.test(text)) return 'flip';
  if (/\bprint/i.test(text)) return 'print';
  if (/change something|retake|try again|create another|start over|new playy/i.test(text)) return 'change';
  if (/all done|finish/i.test(text)) return 'done';
  if (/\bnext\b|start quiz|continue|done\s*✓|→/i.test(text)) return 'next';
  if ((text.length > 0 && text.length <= 2) || /^(space|shift)$/i.test(text)) return 'key';
  return 'tap';
}

/** Mount once around the kiosk. It loads the sound settings and plays a sound for every button tap. */
export const SfxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    let live = true;
    fetch('/api/sounds')
      .then((r) => r.json())
      .then((d) => {
        if (live) {
          settings = cleanSettings(d.settings);
          startMusic(settings.music);
        }
      })
      .catch(() => {
        if (live) startMusic(settings.music); /* keep the defaults */
      });

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>('button, [role="button"], a[href], [data-sfx]');
      if (!el) return;
      if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return;
      const event = inferEvent(el);
      if (event !== 'none') playSfx(event);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      live = false;
      document.removeEventListener('click', onClick, true);
    };
  }, []);
  return <>{children}</>;
};
