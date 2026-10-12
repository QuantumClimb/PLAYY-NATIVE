/** Which kiosk action plays which sound. Edited in the command center under Sounds. */

import { SFX_EVENTS } from '../../../shared/sfxEvents.mjs';

export { SFX_EVENTS };
export type SfxEvent = (typeof SFX_EVENTS)[number];

export const EVENT_DEFS: Record<SfxEvent, { label: string; help: string }> = {
  tap: { label: 'Any other button', help: 'Plays for any button that has no sound of its own.' },
  start: { label: 'Tap to Start', help: 'The big start button, and tapping the intro screen.' },
  next: { label: 'Next', help: 'Next, Start Quiz, Done and Continue buttons.' },
  back: { label: 'Back', help: 'The Back button.' },
  select: { label: 'Choosing a card', help: 'Heads, poses, symbols, backgrounds and colors.' },
  surprise: { label: 'Surprise Me', help: 'The Surprise Me button.' },
  key: { label: 'Keyboard key', help: 'Letters and numbers on the on-screen keyboards.' },
  backspace: { label: 'Backspace', help: 'The delete key on the keyboards.' },
  flip: { label: 'Flip card', help: 'Turning the trump card over.' },
  answer: { label: 'Quiz answer', help: 'Picking an answer in the power quiz.' },
  print: { label: 'Print', help: 'Print My Playy, Print Another.' },
  change: { label: 'Change / start over', help: 'Change Something, Retake, Create Another.' },
  done: { label: 'All done', help: 'All Done, Finish, and when the celebration screen appears.' },
  reveal: { label: 'Trump card appears', help: 'When the finished trump card is revealed.' },
};

/** `none`, `synth:<id>` (built in) or `custom:<id>` (an uploaded file) */
type SoundRef = string;

export interface CustomSound {
  id: string;
  name: string;
  mediaId: string;
}

/** One song in the kiosk's background music playlist. `src` is `file:/assets/...` (shipped with the app) or `media:<id>` (uploaded). */
export interface MusicTrack {
  id: string;
  name: string;
  src: string;
}

export interface MusicSettings {
  enabled: boolean;
  /** Music volume 0 to 1 (separate from the button sounds) */
  volume: number;
  /** The songs play one after the other, then the playlist starts again */
  tracks: MusicTrack[];
}

export const MAX_MUSIC_TRACKS = 20;

/** The URL a track plays from. */
export const trackUrl = (t: MusicTrack): string =>
  t.src.startsWith('media:') ? `/api/media/${t.src.slice(6)}` : encodeURI(t.src.slice(5));

export const DEFAULT_MUSIC: MusicSettings = {
  enabled: true,
  volume: 0.3,
  tracks: [
    { id: 'tune-01', name: 'Playy Tune 01', src: 'file:/assets/audio/music/playy_tune_01.mp3' },
    { id: 'toylike-groove', name: 'Toylike Groove', src: 'file:/assets/audio/music/Toylike Groove.mp3' },
  ],
};

const TRACK_SRC = /^(file:\/assets\/audio\/music\/[A-Za-z0-9 ._()-]{1,120}|media:[A-Za-z0-9_-]{1,80})$/;

export interface SoundSettings {
  enabled: boolean;
  /** Master volume 0 to 1 */
  volume: number;
  events: Record<SfxEvent, { sound: SoundRef; volume: number }>;
  custom: CustomSound[];
  music: MusicSettings;
}

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.8,
  custom: [],
  music: DEFAULT_MUSIC,
  events: {
    tap: { sound: 'synth:pop', volume: 1 },
    start: { sound: 'synth:tada', volume: 1 },
    next: { sound: 'synth:slide-up', volume: 1 },
    back: { sound: 'synth:slide-down', volume: 1 },
    select: { sound: 'synth:bubble', volume: 1 },
    surprise: { sound: 'synth:boing', volume: 1 },
    key: { sound: 'synth:tick', volume: 0.8 },
    backspace: { sound: 'synth:woodblock', volume: 1 },
    flip: { sound: 'synth:whoosh', volume: 1 },
    answer: { sound: 'synth:ding', volume: 1 },
    print: { sound: 'synth:confirm', volume: 1 },
    change: { sound: 'synth:zip', volume: 1 },
    done: { sound: 'synth:sparkle', volume: 1 },
    reveal: { sound: 'synth:chime', volume: 1 },
  },
};

/** Merge whatever the server has over the defaults, dropping anything unknown. */
export function cleanSettings(input: unknown): SoundSettings {
  const d = DEFAULT_SOUND_SETTINGS;
  const s = (input && typeof input === 'object' ? input : {}) as Partial<SoundSettings>;
  const events = { ...d.events };
  SFX_EVENTS.forEach((e) => {
    const v = s.events?.[e];
    if (v && typeof v.sound === 'string') {
      events[e] = { sound: v.sound, volume: typeof v.volume === 'number' ? Math.min(1, Math.max(0, v.volume)) : 1 };
    }
  });
  const m = s.music;
  const music: MusicSettings =
    m && typeof m === 'object' && Array.isArray(m.tracks)
      ? {
          enabled: typeof m.enabled === 'boolean' ? m.enabled : d.music.enabled,
          volume: typeof m.volume === 'number' ? Math.min(1, Math.max(0, m.volume)) : d.music.volume,
          tracks: m.tracks
            .filter((t) => t && typeof t.id === 'string' && typeof t.src === 'string' && TRACK_SRC.test(t.src))
            .slice(0, MAX_MUSIC_TRACKS)
            .map((t) => ({ id: t.id, name: String(t.name ?? 'Track').slice(0, 60), src: t.src })),
        }
      : d.music;
  return {
    music,
    enabled: typeof s.enabled === 'boolean' ? s.enabled : d.enabled,
    volume: typeof s.volume === 'number' ? Math.min(1, Math.max(0, s.volume)) : d.volume,
    events,
    custom: Array.isArray(s.custom)
      ? s.custom
          .filter((c) => c && typeof c.id === 'string' && typeof c.mediaId === 'string')
          .map((c) => ({ id: c.id, name: String(c.name ?? 'Sound').slice(0, 40), mediaId: c.mediaId }))
      : [],
  };
}
