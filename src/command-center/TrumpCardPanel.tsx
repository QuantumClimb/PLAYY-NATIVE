import React, { useMemo } from 'react';
import { AssetLibraryProvider } from '../lib/assets/library';
import { DEFAULT_CONFIGURATION } from '../lib/playys/configuration';
import { GeneratedCard } from '../lib/playys/cardTypes';
import { makeCard } from '../lib/playys/card';
import { DEFAULT_POWER_QUIZ_QUESTIONS } from '../lib/playys/powerQuiz';
import { DEFAULT_TRUMP_CARD, TrumpCardSettings, cleanTrumpCard } from '../lib/card/settings';
import { TrumpCardBack, TrumpCardFront } from '../components/card/TrumpCard';
import { CmsPanel, SaveBar } from './CmsPanel';
import { ColorSwatches } from './ColorSwatches';
import { useCmsSetting } from './useCmsSetting';

const OUTLINE_PRESETS = ['#14246e', '#0b1646', '#1b3fbf', '#3b1d7a', '#111111', '#7a1020'];
const BACK_PRESETS = ['#1c2f8f', '#14246e', '#2b1a6e', '#0f5b4d', '#5b1330', '#222222'];
const ACCENT_PRESETS = ['#ffd633', '#ff9fd2', '#7de3ff', '#9dffb0', '#ffffff'];

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="rounded-xl border border-gray-300 p-3 space-y-2">
    <div className="font-medium text-sm">{label}</div>
    {children}
  </div>
);

/** Command center: how the trump card is formatted (outline, corners, the back). Content on the card is fixed. */
export const TrumpCardPanel: React.FC = () => {
  const cms = useCmsSetting<TrumpCardSettings, { settings: unknown }>({
    url: '/api/trump-card',
    saveUrl: '/api/cc/trump-card',
    resetUrl: '/api/cc/trump-card/reset',
    read: (data) => cleanTrumpCard(data.settings) ?? DEFAULT_TRUMP_CARD,
    defaults: DEFAULT_TRUMP_CARD,
    savedNote: 'Saved. The kiosk uses the new card formatting the next time it loads.',
    resetNote: 'Reset to the original formatting.',
    resetQuestion: 'Reset the trump card formatting to the original?',
  });
  const settings = cms.value;
  const set = (patch: Partial<TrumpCardSettings>) => cms.setValue((s) => ({ ...s, ...patch }));

  // A sample card so the preview shows real artwork from the library
  const sample = useMemo<GeneratedCard>(
    () => ({
      ...makeCard(
        { ...DEFAULT_CONFIGURATION, kidName: 'Arjun', symbol: 'warm-heart' },
        DEFAULT_POWER_QUIZ_QUESTIONS,
        [0, 1, 2, 3, 0],
      ),
      id: 'sample',
    }),
    [],
  );

  if (cms.loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <CmsPanel
      title="Trump card formatting"
      description="The front is the visitor's finished artwork inside a thick outline; the back shows the power, stats and abilities. The power symbols and stat icons come from the power-up questions and are not edited here."
      error={cms.error}
      note={cms.note}
    >
      <div className="flex flex-wrap gap-8 rounded-2xl p-6 progress-tabs-preview justify-center">
        <AssetLibraryProvider>
          <TrumpCardFront card={sample} scale={0.8} settings={settings} />
          <TrumpCardBack card={sample} scale={0.8} settings={settings} />
        </AssetLibraryProvider>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Outline color">
          <ColorSwatches
            value={settings.outlineColor}
            presets={OUTLINE_PRESETS}
            onChange={(c) => set({ outlineColor: c })}
          />
        </Field>
        <Field label={`Outline thickness: ${settings.outlineWidth}`}>
          <input
            type="range"
            min={0}
            max={40}
            value={settings.outlineWidth}
            onChange={(e) => set({ outlineWidth: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
        <Field label={`Corner roundness: ${settings.radius}`}>
          <input
            type="range"
            min={0}
            max={60}
            value={settings.radius}
            onChange={(e) => set({ radius: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
        <Field label="Back: background">
          <ColorSwatches
            value={settings.backBackground}
            presets={BACK_PRESETS}
            onChange={(c) => set({ backBackground: c })}
          />
        </Field>
        <Field label="Back: headings and highlights">
          <ColorSwatches
            value={settings.backAccent}
            presets={ACCENT_PRESETS}
            onChange={(c) => set({ backAccent: c })}
          />
        </Field>
      </div>

      <SaveBar busy={cms.busy} onSave={cms.save} onReset={cms.reset} saveLabel="Save card formatting" />
    </CmsPanel>
  );
};
