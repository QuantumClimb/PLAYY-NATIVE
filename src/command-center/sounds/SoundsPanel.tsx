import React from 'react';
import { DEFAULT_SOUND_SETTINGS, SoundSettings, cleanSettings } from '../../lib/sfx/settings';
import { CmsPanel, SaveBar } from '../CmsPanel';
import { useCmsSetting } from '../useCmsSetting';
import { ButtonSoundsTable } from './ButtonSoundsTable';
import { CustomSoundsSection } from './CustomSoundsSection';
import { MusicSection } from './MusicSection';
import { VolumeSlider } from './shared';

/** Command center: which sound each kiosk button plays, and the background music. */
export const SoundsPanel: React.FC = () => {
  const cms = useCmsSetting<SoundSettings, { settings: unknown }>({
    url: '/api/sounds',
    saveUrl: '/api/cc/sounds',
    resetUrl: '/api/cc/sounds/reset',
    read: (data) => cleanSettings(data.settings),
    write: (settings) => ({ settings }),
    defaults: DEFAULT_SOUND_SETTINGS,
    savedNote: 'Saved. The kiosk uses the new sounds the next time a page loads.',
    resetNote: 'Reset to the defaults.',
    resetQuestion: 'Reset every button to its default sound? Uploaded sounds are removed from the list.',
  });
  const settings = cms.value;

  if (cms.loading) return <p className="cc-muted">Loading…</p>;

  return (
    <CmsPanel
      title="Sounds"
      description="Choose the sound each kiosk button plays. Changes apply to the kiosk after you save."
      error={cms.error}
      note={cms.note}
    >
      <section className="cc-card cc-card-pad space-y-4">
        <h3 className="text-sm">General</h3>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => cms.setValue({ ...settings, enabled: e.target.checked })}
            className="h-4 w-4 accent-indigo-600"
          />
          Play sounds on the kiosk
        </label>
        <VolumeSlider
          label="Master volume"
          value={settings.volume}
          onChange={(volume) => cms.setValue({ ...settings, volume })}
        />
      </section>

      <MusicSection
        music={settings.music}
        onChange={(music) => cms.setValue({ ...settings, music })}
        busy={cms.busy}
        run={cms.run}
      />

      <ButtonSoundsTable
        settings={settings}
        onChange={(event, change) =>
          cms.setValue({
            ...settings,
            events: { ...settings.events, [event]: { ...settings.events[event], ...change } },
          })
        }
      />

      <CustomSoundsSection settings={settings} update={cms.setValue} busy={cms.busy} run={cms.run} />

      <SaveBar busy={cms.busy} onSave={cms.save} onReset={cms.reset} saveLabel="Save changes" />
    </CmsPanel>
  );
};
