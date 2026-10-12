import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Pause, Play, Trash2, Upload } from 'lucide-react';
import { DEFAULT_MUSIC, MAX_MUSIC_TRACKS, MusicSettings, MusicTrack, trackUrl } from '../../lib/sfx/settings';
import { moveItem } from '../../lib/list';
import { uploadMedia } from '../../data/media';
import { VolumeSlider, audioFileProblem, nameFromFile } from './shared';

interface MusicSectionProps {
  music: MusicSettings;
  onChange: (music: MusicSettings) => void;
  busy: boolean;
  run: (action: () => Promise<void>) => Promise<void>;
}

/** Background music: on/off, volume and the playlist (order, names, preview, adding songs). */
export const MusicSection: React.FC<MusicSectionProps> = ({ music, onChange, busy, run }) => {
  // Listening to a song in the playlist
  const preview = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  useEffect(() => () => preview.current?.pause(), []);

  const stopPreview = () => {
    preview.current?.pause();
    setPlayingId(null);
  };
  const togglePreview = (track: MusicTrack) =>
    run(async () => {
      if (playingId === track.id) return stopPreview();
      if (!preview.current) {
        preview.current = new Audio();
        preview.current.addEventListener('ended', () => setPlayingId(null));
      }
      preview.current.src = trackUrl(track);
      preview.current.volume = music.volume;
      await preview.current.play().catch(() => {
        throw new Error('Could not play this song.');
      });
      setPlayingId(track.id);
    });

  const setTracks = (tracks: MusicTrack[]) => onChange({ ...music, tracks });
  const rename = (id: string, name: string) => setTracks(music.tracks.map((t) => (t.id === id ? { ...t, name } : t)));
  const remove = (id: string) => {
    if (playingId === id) stopPreview();
    setTracks(music.tracks.filter((t) => t.id !== id));
  };
  const add = (track: MusicTrack) => setTracks([...music.tracks, track]);

  const uploadSong = (file: File) =>
    run(async () => {
      const problem = audioFileProblem(file, 10, 'songs');
      if (problem) throw new Error(problem);
      add({
        id: `trk_${Date.now().toString(36)}`,
        name: nameFromFile(file, 60),
        src: `media:${await uploadMedia(file)}`,
      });
    });

  const shippedMissing = DEFAULT_MUSIC.tracks.filter((d) => !music.tracks.some((t) => t.src === d.src));

  return (
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
          checked={music.enabled}
          onChange={(e) => onChange({ ...music, enabled: e.target.checked })}
          className="h-4 w-4 accent-indigo-600"
        />
        Play music on the kiosk
      </label>
      <VolumeSlider
        label="Music volume"
        value={music.volume}
        onChange={(volume) => {
          onChange({ ...music, volume });
          if (preview.current) preview.current.volume = volume;
        }}
      />

      {music.tracks.length === 0 ? (
        <p className="text-sm cc-muted">The playlist is empty, so no music will play.</p>
      ) : (
        <ol className="divide-y divide-gray-100">
          {music.tracks.map((t, i) => (
            <li key={t.id} className="flex items-center gap-2 py-2">
              <span className="w-6 text-sm cc-muted tabular-nums">{i + 1}</span>
              <input
                value={t.name}
                maxLength={60}
                className="cc-input flex-1"
                onChange={(e) => rename(t.id, e.target.value)}
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
                onClick={() => setTracks(moveItem(music.tracks, i, -1))}
                aria-label="Move up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="cc-btn cc-btn-sm"
                disabled={i === music.tracks.length - 1}
                onClick={() => setTracks(moveItem(music.tracks, i, 1))}
                aria-label="Move down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="cc-btn cc-btn-sm cc-btn-danger"
                onClick={() => remove(t.id)}
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
          className={`cc-btn cc-btn-sm cursor-pointer ${music.tracks.length >= MAX_MUSIC_TRACKS ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Upload className="w-3.5 h-3.5" /> Add a song
          <input
            type="file"
            accept="audio/*"
            hidden
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void uploadSong(file);
            }}
          />
        </label>
        {shippedMissing.map((d) => (
          <button key={d.id} type="button" className="cc-btn cc-btn-sm" onClick={() => add(d)}>
            + {d.name}
          </button>
        ))}
      </div>
      <p className="text-xs cc-muted">
        MP3, WAV, OGG or M4A, up to 10 MB each (on the hosted site, files over about 3 MB cannot be uploaded: put those
        in public/assets/audio/music instead). Make sure you hold the rights to any music you add.
      </p>
    </section>
  );
};
