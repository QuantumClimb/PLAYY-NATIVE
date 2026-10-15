import { MusicSettings, trackUrl } from './settings';

/**
 * Background music for the kiosk: the playlist plays one song after another and starts over at the end.
 * Browsers only start sound after a tap, so it begins on the first touch (or at once if the browser allows it).
 */
let player: HTMLAudioElement | null = null;
let music: MusicSettings | null = null;
let index = 0;
let failures = 0;
let unlockBound = false;

const MUTE_KEY = 'playys-muted';

/** Whether all sound (music and button sounds) is switched off on this PC. Kept in this browser. */
let muted = (() => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
})();

export const audioMuted = () => muted;

export function setAudioMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    /* storage blocked: the setting just does not stick */
  }
  if (player) player.muted = value;
}

function ensurePlayer(): HTMLAudioElement {
  if (!player) {
    player = new Audio();
    player.preload = 'auto';
    player.muted = muted;
    player.addEventListener('ended', () => playIndex(index + 1));
    player.addEventListener('error', () => {
      // Skip a song that cannot be played; give up if none of them can
      failures += 1;
      if (music && failures <= music.tracks.length) playIndex(index + 1);
    });
    player.addEventListener('playing', () => {
      failures = 0;
    });
  }
  return player;
}

function playIndex(next: number) {
  if (!music || !music.enabled || music.tracks.length === 0) return;
  const p = ensurePlayer();
  index = ((next % music.tracks.length) + music.tracks.length) % music.tracks.length;
  p.src = trackUrl(music.tracks[index]);
  p.volume = music.volume;
  void p.play().catch(() => {
    /* blocked until the first tap; the unlock handler tries again */
  });
}

function bindUnlock() {
  if (unlockBound) return;
  unlockBound = true;
  const unlock = () => {
    if (!music?.enabled || !player) return;
    if (player.paused) void player.play().catch(() => {});
    else {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
      unlockBound = false;
    }
  };
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);
}

/** Starts (or restarts with new settings) the playlist. */
export function startMusic(settings: MusicSettings): void {
  music = settings;
  failures = 0;
  if (!settings.enabled || settings.tracks.length === 0) {
    stopMusic();
    return;
  }
  const p = ensurePlayer();
  p.volume = settings.volume;
  // Keep playing the current song if it is still in the list; otherwise begin at the top
  const current = p.src ? settings.tracks.findIndex((t) => p.src.endsWith(trackUrl(t))) : -1;
  if (current >= 0 && !p.paused) {
    index = current;
    return;
  }
  playIndex(0);
  bindUnlock();
}

function stopMusic(): void {
  if (player) {
    player.pause();
    player.removeAttribute('src');
    player.load();
  }
}
