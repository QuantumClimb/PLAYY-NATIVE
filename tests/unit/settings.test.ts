import { describe, expect, it } from 'vitest';
import { DEFAULT_MUSIC, DEFAULT_SOUND_SETTINGS, SFX_EVENTS, cleanSettings, trackUrl } from '../../src/lib/sfx/settings';
import { DEFAULT_PROGRESS_TABS, cleanProgressTabs } from '../../src/lib/progress/tabs';
import { DEFAULT_TRUMP_CARD, cleanTrumpCard } from '../../src/lib/card/settings';

describe('sound settings', () => {
  it('falls back to the defaults for junk', () => {
    expect(cleanSettings(null)).toEqual(DEFAULT_SOUND_SETTINGS);
    expect(cleanSettings('x')).toEqual(DEFAULT_SOUND_SETTINGS);
  });

  it('clamps volumes and keeps every event', () => {
    const s = cleanSettings({ volume: 5, events: { tap: { sound: 'none', volume: -1 } } });
    expect(s.volume).toBe(1);
    expect(s.events.tap).toEqual({ sound: 'none', volume: 0 });
    expect(Object.keys(s.events).sort()).toEqual([...SFX_EVENTS].sort());
  });

  it('keeps only music tracks with a safe source', () => {
    const s = cleanSettings({
      music: {
        enabled: true,
        volume: 0.5,
        tracks: [
          { id: 'a', name: 'Good', src: 'file:/assets/audio/music/a.mp3' },
          { id: 'b', name: 'Uploaded', src: 'media:med_1_abc' },
          { id: 'c', name: 'Bad', src: 'https://evil.example/x.mp3' },
          { id: 'd', name: 'Escape', src: 'file:/assets/audio/music/../../secret' },
        ],
      },
    });
    expect(s.music.tracks.map((t) => t.id)).toEqual(['a', 'b']);
  });

  it('turns a track source into a url', () => {
    expect(trackUrl({ id: 'x', name: 'x', src: 'media:med_1' })).toBe('/api/media/med_1');
    expect(trackUrl(DEFAULT_MUSIC.tracks[1])).toBe('/assets/audio/music/Toylike%20Groove.mp3');
  });
});

describe('progress tabs', () => {
  it('returns null for junk and fills missing tabs from the defaults', () => {
    expect(cleanProgressTabs(null)).toBeNull();
    const t = cleanProgressTabs({ showLabels: false, stages: [{ label: 'Hi', icon: 'emoji:x' }] })!;
    expect(t.showLabels).toBe(false);
    expect(t.stages).toHaveLength(8);
    expect(t.stages[0]).toEqual({ label: 'Hi', icon: 'emoji:x' });
    expect(t.stages[1]).toEqual(DEFAULT_PROGRESS_TABS.stages[1]);
  });
});

describe('trump card settings', () => {
  it('rejects bad colors and clamps numbers', () => {
    const s = cleanTrumpCard({ outlineColor: 'red', outlineWidth: 999, radius: -4, backBackground: '#123456' })!;
    expect(s.outlineColor).toBe(DEFAULT_TRUMP_CARD.outlineColor);
    expect(s.outlineWidth).toBe(40);
    expect(s.radius).toBe(0);
    expect(s.backBackground).toBe('#123456');
  });
});
