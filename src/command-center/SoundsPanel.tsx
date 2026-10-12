import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Pause, Play, Trash2, Upload } from 'lucide-react';
import { SYNTHS } from '../lib/sfx/synth';
import { playRef } from '../lib/sfx/engine';
import {
  CustomSound,
  DEFAULT_MUSIC,
  DEFAULT_SOUND_SETTINGS,
  MAX_MUSIC_TRACKS,
  MusicTrack,
  trackUrl,
  EVENT_DEFS,
  SFX_EVENTS,
  SoundSettings,
  cleanSettings,
} from '../lib/sfx/settings';

/** Command center: which sound each kiosk button plays. */
export const SoundsPanel: React.FC = () => {
  const [s, setS] = useState<SoundSettings>(DEFAULT_SOUND_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // Listening to a song in the playlist
  const preview = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  useEffect(
    () => () => {
      preview.current?.pause();
    },
    [],
  );
  const togglePreview = (t: MusicTrack) => {
    if (!preview.current) {
      preview.current = new Audio();
      preview.current.addEventListener('ended', () => setPlayingId(null));
    }
    const a = preview.current;
    if (playingId === t.id) {
      a.pause();
      setPlayingId(null);
      return;
    }
    a.src = trackUrl(t);
    a.volume = s.music.volume;
    void a.play().catch(() => setError('Could not play this song.'));
    setPlayingId(t.id);
  };

  const setMusic = (patch: Partial<SoundSettings['music']>) =>
    setS((cur) => ({ ...cur, music: { ...cur.music, ...patch } }));
  const moveTrack = (i: number, dir: -1 | 1) =>
    setS((cur) => {
      const j = i + dir;
      if (j < 0 || j >= cur.music.tracks.length) return cur;
      const tracks = [...cur.music.tracks];
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
      return { ...cur, music: { ...cur.music, tracks } };
    });
  const removeTrack = (id: string) => {
    if (playingId === id) {
      preview.current?.pause();
      setPlayingId(null);
    }
    setS((cur) => ({ ...cur, music: { ...cur.music, tracks: cur.music.tracks.filter((t) => t.id !== id) } }));
  };
  const addTrack = (t: MusicTrack) =>
    setS((cur) => ({ ...cur, music: { ...cur.music, tracks: [...cur.music.tracks, t] } }));

  const uploadSong = (file: File) =>
    run(async () => {
      if (!/^audio\//.test(file.type)) throw new Error('Choose an audio file (MP3, WAV, OGG or M4A).');
      if (file.size > 10 * 1024 * 1024) throw new Error('Keep songs under 10 MB.');
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
        r.onerror = () => reject(new Error('Could not read the file'));
        r.readAsDataURL(file);
      });
      const d = await request('/api/cc/scene-backgrounds/upload', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, mimeType: file.type, base64 }),
      });
      addTrack({
        id: `trk_${Date.now().toString(36)}`,
        name: file.name.replace(/\.[^.]+$/, '').slice(0, 60),
        src: `media:${d.mediaId}`,
      });
      setNote('Song added to the end of the playlist. Save to use it on the kiosk.');
    });

  useEffect(() => {
    fetch('/api/sounds')
      .then((r) => r.json())
      .then((d) => setS(cleanSettings(d.settings)))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  async function request(url: string, init: RequestInit) {
    const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const save = () =>
    run(async () => {
      const d = await request('/api/cc/sounds', { method: 'PUT', body: JSON.stringify({ settings: s }) });
      setS(cleanSettings(d.settings));
      setNote('Saved. The kiosk uses the new sounds the next time a page loads.');
    });
  const reset = () =>
    run(async () => {
      if (!window.confirm('Reset every button to its default sound? Uploaded sounds are removed from the list.'))
        return;
      await request('/api/cc/sounds/reset', { method: 'POST' });
      setS(DEFAULT_SOUND_SETTINGS);
      setNote('Reset to the defaults.');
    });

  const upload = (file: File) =>
    run(async () => {
      if (!/^audio\//.test(file.type)) throw new Error('Choose an audio file (MP3, WAV, OGG or M4A).');
      if (file.size > 2 * 1024 * 1024) throw new Error('Keep sounds under 2 MB. They should be short effects.');
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
        r.onerror = () => reject(new Error('Could not read the file'));
        r.readAsDataURL(file);
      });
      const d = await request('/api/cc/scene-backgrounds/upload', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, mimeType: file.type, base64 }),
      });
      const sound: CustomSound = {
        id: `snd_${Date.now().toString(36)}`,
        name: file.name.replace(/\.[^.]+$/, '').slice(0, 40),
        mediaId: d.mediaId,
      };
      setS((cur) => ({ ...cur, custom: [...cur.custom, sound] }));
      setNote('Uploaded. Assign it to a button below, then save.');
    });

  const removeCustom = (id: string) =>
    setS((cur) => ({
      ...cur,
      custom: cur.custom.filter((c) => c.id !== id),
      events: Object.fromEntries(
        SFX_EVENTS.map((e) => [
          e,
          cur.events[e].sound === `custom:${id}`
            ? { ...cur.events[e], sound: DEFAULT_SOUND_SETTINGS.events[e].sound }
            : cur.events[e],
        ]),
      ) as SoundSettings['events'],
    }));

  if (loading) return <p className="cc-muted">Loading…</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg">Sounds</h2>
        <p className="text-sm cc-muted">
          Choose the sound each kiosk button plays. Changes apply to the kiosk after you save.
        </p>
      </div>

      {error && <div className="cc-alert cc-alert-error">{error}</div>}
      {note && <div className="cc-alert cc-alert-ok">{note}</div>}

      <section className="cc-card cc-card-pad space-y-4">
        <h3 className="text-sm">General</h3>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={s.enabled}
            onChange={(e) => setS({ ...s, enabled: e.target.checked })}
            className="h-4 w-4 accent-indigo-600"
          />
          Play sounds on the kiosk
        </label>
        <label className="flex items-center gap-4 text-sm">
          <span className="w-32 cc-muted">Master volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.volume}
            onChange={(e) => setS({ ...s, volume: Number(e.target.value) })}
            className="flex-1 accent-indigo-600"
          />
          <span className="w-10 text-right tabular-nums">{Math.round(s.volume * 100)}%</span>
        </label>
      </section>

      <section className="cc-card cc-card-pad space-y-4">
        <div>
          <h3 className="text-sm">Background music</h3>
          <p className="text-xs cc-muted">
            The songs play one after the other on every kiosk screen, then the playlist starts again. It begins at the
            first tap on the kiosk.
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={s.music.enabled}
            onChange={(e) => setMusic({ enabled: e.target.checked })}
            className="h-4 w-4 accent-indigo-600"
          />
          Play music on the kiosk
        </label>
        <label className="flex items-center gap-4 text-sm">
          <span className="w-32 cc-muted">Music volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.music.volume}
            onChange={(e) => {
              setMusic({ volume: Number(e.target.value) });
              if (preview.current) preview.current.volume = Number(e.target.value);
            }}
            className="flex-1 accent-indigo-600"
          />
          <span className="w-10 text-right tabular-nums">{Math.round(s.music.volume * 100)}%</span>
        </label>

        {s.music.tracks.length === 0 ? (
          <p className="text-sm cc-muted">The playlist is empty, so no music will play.</p>
        ) : (
          <ol className="divide-y divide-gray-100">
            {s.music.tracks.map((t, i) => (
              <li key={t.id} className="flex items-center gap-2 py-2">
                <span className="w-6 text-sm cc-muted tabular-nums">{i + 1}</span>
                <input
                  value={t.name}
                  maxLength={60}
                  className="cc-input flex-1"
                  onChange={(x) =>
                    setMusic({
                      tracks: s.music.tracks.map((y) => (y.id === t.id ? { ...y, name: x.target.value } : y)),
                    })
                  }
                />
                <button
                  type="button"
                  className="cc-btn cc-btn-sm"
                  onClick={() => togglePreview(t)}
                  aria-label={`${playingId === t.id ? 'Pause' : 'Play'} ${t.name}`}
                >
                  {playingId === t.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  className="cc-btn cc-btn-sm"
                  disabled={i === 0}
                  onClick={() => moveTrack(i, -1)}
                  aria-label="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="cc-btn cc-btn-sm"
                  disabled={i === s.music.tracks.length - 1}
                  onClick={() => moveTrack(i, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="cc-btn cc-btn-sm cc-btn-danger"
                  onClick={() => removeTrack(t.id)}
                  aria-label={`Remove ${t.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`cc-btn cc-btn-sm cursor-pointer ${s.music.tracks.length >= MAX_MUSIC_TRACKS ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Upload className="w-3.5 h-3.5" /> Add a song
            <input
              type="file"
              accept="audio/*"
              hidden
              disabled={busy}
              onChange={(x) => {
                const f = x.target.files?.[0];
                x.target.value = '';
                if (f) uploadSong(f);
              }}
            />
          </label>
          {DEFAULT_MUSIC.tracks
            .filter((d) => !s.music.tracks.some((t) => t.src === d.src))
            .map((d) => (
              <button key={d.id} type="button" className="cc-btn cc-btn-sm" onClick={() => addTrack(d)}>
                + {d.name}
              </button>
            ))}
        </div>
        <p className="text-xs cc-muted">
          MP3, WAV, OGG or M4A, up to 10 MB each (on the hosted site, files over about 3 MB cannot be uploaded: put
          those in public/assets/audio/music instead). Make sure you hold the rights to any music you add.
        </p>
      </section>

      <section className="cc-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm">Buttons</h3>
        </div>
        <table className="cc-table w-full text-sm">
          <thead>
            <tr>
              <th>Action</th>
              <th>Sound</th>
              <th className="w-40">Volume</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {SFX_EVENTS.map((e) => {
              const ev = s.events[e];
              return (
                <tr key={e}>
                  <td>
                    <div className="font-medium">{EVENT_DEFS[e].label}</div>
                    <div className="text-xs cc-muted">{EVENT_DEFS[e].help}</div>
                  </td>
                  <td>
                    <select
                      value={ev.sound}
                      className="cc-select w-full"
                      onChange={(x) => setS({ ...s, events: { ...s.events, [e]: { ...ev, sound: x.target.value } } })}
                    >
                      <option value="none">No sound</option>
                      <optgroup label="Built-in">
                        {SYNTHS.map((y) => (
                          <option key={y.id} value={`synth:${y.id}`}>
                            {y.label}
                          </option>
                        ))}
                      </optgroup>
                      {s.custom.length > 0 && (
                        <optgroup label="Uploaded">
                          {s.custom.map((c) => (
                            <option key={c.id} value={`custom:${c.id}`}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </td>
                  <td>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={ev.volume}
                      onChange={(x) =>
                        setS({ ...s, events: { ...s.events, [e]: { ...ev, volume: Number(x.target.value) } } })
                      }
                      className="w-full accent-indigo-600"
                    />
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="cc-btn cc-btn-sm"
                      onClick={() => playRef(ev.sound, ev.volume, s)}
                      aria-label={`Play ${EVENT_DEFS[e].label}`}
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="cc-card cc-card-pad space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm">Your own sounds</h3>
          <label className="cc-btn cc-btn-sm cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Upload sound
            <input
              type="file"
              accept="audio/*"
              hidden
              disabled={busy}
              onChange={(x) => {
                const f = x.target.files?.[0];
                x.target.value = '';
                if (f) upload(f);
              }}
            />
          </label>
        </div>
        {s.custom.length === 0 ? (
          <p className="text-sm cc-muted">None yet. MP3, WAV, OGG or M4A, up to 2 MB each. Short effects work best.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {s.custom.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2">
                <input
                  value={c.name}
                  maxLength={40}
                  className="cc-input flex-1"
                  onChange={(x) =>
                    setS({ ...s, custom: s.custom.map((y) => (y.id === c.id ? { ...y, name: x.target.value } : y)) })
                  }
                />
                <button
                  type="button"
                  className="cc-btn cc-btn-sm"
                  onClick={() => playRef(`custom:${c.id}`, 1, s)}
                  aria-label={`Play ${c.name}`}
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="cc-btn cc-btn-sm cc-btn-danger"
                  onClick={() => removeCustom(c.id)}
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs cc-muted">
          The built-in sounds are generated in the browser, so there are no audio files and no licensing to worry about.
          Make sure you hold the rights to anything you upload.
        </p>
      </section>

      <div className="flex gap-3">
        <button type="button" className="cc-btn cc-btn-primary" onClick={save} disabled={busy}>
          Save changes
        </button>
        <button type="button" className="cc-btn" onClick={reset} disabled={busy}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
};
