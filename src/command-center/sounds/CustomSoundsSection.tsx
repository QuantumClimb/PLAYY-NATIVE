import React from 'react';
import { Play, Trash2, Upload } from 'lucide-react';
import { playRef } from '../../lib/sfx/engine';
import { CustomSound, DEFAULT_SOUND_SETTINGS, SFX_EVENTS, SoundSettings } from '../../lib/sfx/settings';
import { uploadMedia } from '../../data/media';
import { SoundsUpdate, audioFileProblem, nameFromFile } from './shared';

interface CustomSoundsSectionProps {
  settings: SoundSettings;
  update: SoundsUpdate;
  busy: boolean;
  run: (action: () => Promise<void>) => Promise<void>;
}

/** The sounds the client uploaded, available to every button above. */
export const CustomSoundsSection: React.FC<CustomSoundsSectionProps> = ({ settings, update, busy, run }) => {
  const upload = (file: File) =>
    run(async () => {
      const problem = audioFileProblem(file, 2, 'sounds. They should be short effects');
      if (problem) throw new Error(problem);
      const sound: CustomSound = {
        id: `snd_${Date.now().toString(36)}`,
        name: nameFromFile(file, 40),
        mediaId: await uploadMedia(file),
      };
      update((cur) => ({ ...cur, custom: [...cur.custom, sound] }));
    });

  // A button that used a removed sound goes back to its default
  const remove = (id: string) =>
    update((cur) => ({
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

  return (
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void upload(file);
            }}
          />
        </label>
      </div>
      {settings.custom.length === 0 ? (
        <p className="text-sm cc-muted">None yet. MP3, WAV, OGG or M4A, up to 2 MB each. Short effects work best.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {settings.custom.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-2">
              <input
                value={c.name}
                maxLength={40}
                className="cc-input flex-1"
                onChange={(e) =>
                  update((cur) => ({
                    ...cur,
                    custom: cur.custom.map((y) => (y.id === c.id ? { ...y, name: e.target.value } : y)),
                  }))
                }
              />
              <button
                type="button"
                className="cc-btn cc-btn-sm"
                onClick={() => playRef(`custom:${c.id}`, 1, settings)}
                aria-label={`Play ${c.name}`}
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="cc-btn cc-btn-sm cc-btn-danger"
                onClick={() => remove(c.id)}
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
  );
};
