import { isHexColor } from '../shared/validation.mjs';
import { SFX_EVENTS } from '../shared/sfxEvents.mjs';
import { badRequest } from './http.mjs';

// What the command center may save for each setting. Every function checks the input, throws a 400 with a plain
// message when it is wrong, and returns only the fields that belong (anything extra is dropped).

const ID = /^[A-Za-z0-9_-]{1,60}$/;
const unit = (value) => value >= 0 && value <= 1;

/** @param {unknown} questions */
export function parsePowerQuiz(questions) {
  if (!Array.isArray(questions)) throw badRequest('Questions must be an array');
  return questions;
}

// ---------- Intro badges ----------
const BADGE_ICON = /^(lucide:[A-Za-z0-9]{1,40}|media:[A-Za-z0-9_-]{1,80}|emoji:.{1,8})$/u;
const MAX_BADGES = 5;
const MAX_LABEL = 14;

export function parseIntroBadges(list) {
  if (!Array.isArray(list) || list.length > MAX_BADGES)
    throw badRequest(`Badges must be a list of at most ${MAX_BADGES}`);
  return list.map((badge, i) => {
    if (!badge || typeof badge.label !== 'string' || !badge.label.trim() || badge.label.length > MAX_LABEL)
      throw badRequest(`Each badge needs a label of 1 to ${MAX_LABEL} characters`);
    if (typeof badge.icon !== 'string' || !BADGE_ICON.test(badge.icon)) throw badRequest('Invalid badge icon');
    if (!isHexColor(badge.color)) throw badRequest('Invalid badge color');
    return {
      id: typeof badge.id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(badge.id) ? badge.id : `badge-${i + 1}`,
      label: badge.label.trim(),
      icon: badge.icon,
      color: badge.color,
    };
  });
}

// ---------- Progress tabs ----------
const PROGRESS_ICON = /^(builtin|lucide:[A-Za-z0-9]{1,40}|media:[A-Za-z0-9_-]{1,80}|emoji:.{1,8})$/u;
const TAB_COUNT = 8;

export function parseProgressTabs(body) {
  if (!body || typeof body.showLabels !== 'boolean') throw badRequest('showLabels must be true or false');
  if (!Array.isArray(body.stages) || body.stages.length !== TAB_COUNT)
    throw badRequest(`There must be exactly ${TAB_COUNT} tabs`);
  return {
    showLabels: body.showLabels,
    stages: body.stages.map((tab) => {
      if (!tab || typeof tab.label !== 'string' || !tab.label.trim() || tab.label.length > MAX_LABEL)
        throw badRequest(`Each tab needs a label of 1 to ${MAX_LABEL} characters`);
      if (typeof tab.icon !== 'string' || !PROGRESS_ICON.test(tab.icon)) throw badRequest('Invalid tab icon');
      return { label: tab.label.trim(), icon: tab.icon };
    }),
  };
}

// ---------- Trump card ----------
export function parseTrumpCard(body) {
  if (!body) throw badRequest('Missing settings');
  for (const key of ['outlineColor', 'backBackground', 'backAccent']) {
    if (!isHexColor(body[key])) throw badRequest(`Invalid ${key}`);
  }
  if (!Number.isFinite(body.outlineWidth) || body.outlineWidth < 0 || body.outlineWidth > 40)
    throw badRequest('Outline thickness must be between 0 and 40');
  if (!Number.isFinite(body.radius) || body.radius < 0 || body.radius > 60)
    throw badRequest('Corner radius must be between 0 and 60');
  const { outlineColor, outlineWidth, radius, backBackground, backAccent } = body;
  return { outlineColor, outlineWidth, radius, backBackground, backAccent };
}

// ---------- Sounds and music ----------
const SOUND_REF = /^(none|synth:[a-z0-9-]{1,30}|custom:[A-Za-z0-9_-]{1,60})$/;
const MUSIC_SRC = /^(file:\/assets\/audio\/music\/[A-Za-z0-9 ._()-]{1,120}|media:[A-Za-z0-9_-]{1,80})$/;
const MAX_CUSTOM_SOUNDS = 40;
const MAX_MUSIC_TRACKS = 20;

function parseMusic(music) {
  if (
    !music ||
    typeof music.enabled !== 'boolean' ||
    !unit(music.volume) ||
    !Array.isArray(music.tracks) ||
    music.tracks.length > MAX_MUSIC_TRACKS
  )
    throw badRequest('Invalid music settings');
  return {
    enabled: music.enabled,
    volume: music.volume,
    tracks: music.tracks.map((track) => {
      if (
        typeof track?.id !== 'string' ||
        !ID.test(track.id) ||
        typeof track.src !== 'string' ||
        !MUSIC_SRC.test(track.src)
      )
        throw badRequest('Invalid music track');
      return { id: track.id, name: String(track.name ?? 'Track').slice(0, 60), src: track.src };
    }),
  };
}

export function parseSounds(settings) {
  if (!settings || typeof settings.enabled !== 'boolean' || !unit(settings.volume))
    throw badRequest('Sounds need enabled and a volume from 0 to 1');
  if (!Array.isArray(settings.custom) || settings.custom.length > MAX_CUSTOM_SOUNDS)
    throw badRequest(`Too many custom sounds (${MAX_CUSTOM_SOUNDS} max)`);

  const custom = settings.custom.map((sound) => {
    if (
      typeof sound?.id !== 'string' ||
      !ID.test(sound.id) ||
      typeof sound.mediaId !== 'string' ||
      !ID.test(sound.mediaId)
    )
      throw badRequest('Invalid custom sound');
    return { id: sound.id, name: String(sound.name ?? 'Sound').slice(0, 40), mediaId: sound.mediaId };
  });

  const events = Object.fromEntries(
    SFX_EVENTS.map((event) => {
      const value = settings.events?.[event];
      if (!value || typeof value.sound !== 'string' || !SOUND_REF.test(value.sound) || !unit(value.volume))
        throw badRequest(`Invalid sound for "${event}"`);
      return [event, { sound: value.sound, volume: value.volume }];
    }),
  );

  const clean = { enabled: settings.enabled, volume: settings.volume, custom, events };
  if (settings.music !== undefined) clean.music = parseMusic(settings.music);
  return clean;
}
