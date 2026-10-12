import React, { useState } from 'react';
import {
  COLOR_PRESETS,
  DEFAULT_INTRO_BADGES,
  IntroBadgeData,
  MAX_BADGE_LABEL,
  MAX_INTRO_BADGES,
  cleanBadges,
} from '../lib/intro/badges';
import { moveItem } from '../lib/list';
import { IntroBadges } from '../components/intro/IntroBadges';
import { CmsPanel, SaveBar } from './CmsPanel';
import { ColorSwatches } from './ColorSwatches';
import { IconPicker, iconLabel } from './IconPicker';
import { useCmsSetting } from './useCmsSetting';

const field = 'bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm';

/** Command center: the small badges under the START button on the intro screen. */
export const IntroBadgesPanel: React.FC = () => {
  const cms = useCmsSetting<IntroBadgeData[], { badges: unknown }>({
    url: '/api/intro-badges',
    saveUrl: '/api/cc/intro-badges',
    resetUrl: '/api/cc/intro-badges/reset',
    read: (data) => cleanBadges(data.badges) ?? DEFAULT_INTRO_BADGES,
    write: (badges) => ({ badges }),
    defaults: DEFAULT_INTRO_BADGES,
    savedNote: 'Saved. The kiosk shows the new badges the next time the intro screen loads.',
    resetNote: 'Reset to the original badges.',
    resetQuestion: 'Reset the badges to the original four?',
  });
  const badges = cms.value;
  const [openPicker, setOpenPicker] = useState<number | null>(null);

  const update = (i: number, patch: Partial<IntroBadgeData>) =>
    cms.setValue((list) => list.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const addBadge = () =>
    cms.setValue((list) => [
      ...list,
      {
        id: `badge-${Date.now()}`,
        label: 'New',
        icon: 'lucide:Sparkles',
        color: COLOR_PRESETS[list.length % COLOR_PRESETS.length],
      },
    ]);

  if (cms.loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <CmsPanel
      title="Intro screen badges"
      description={`The small tiles under the Tap to Start button. They are labels only (not buttons). Up to ${MAX_INTRO_BADGES}.`}
      error={cms.error}
      note={cms.note}
    >
      <div className="rounded-2xl p-6 intro-badges-preview">
        <IntroBadges badges={badges} />
      </div>

      <div className="space-y-3">
        {badges.map((b, i) => (
          <div key={b.id + i} className="rounded-xl border border-gray-300 p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => cms.setValue((l) => moveItem(l, i, -1))}
                  className="text-xs px-2 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={i === badges.length - 1}
                  onClick={() => cms.setValue((l) => moveItem(l, i, 1))}
                  className="text-xs px-2 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
              <input
                value={b.label}
                maxLength={MAX_BADGE_LABEL}
                onChange={(e) => update(i, { label: e.target.value })}
                className={`${field} w-40`}
                placeholder="Label"
              />
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === i ? null : i)}
                className={`${field} min-w-32`}
              >
                Icon: {iconLabel(b.icon)}
              </button>
              <ColorSwatches value={b.color} presets={COLOR_PRESETS} onChange={(color) => update(i, { color })} />
              <button
                type="button"
                onClick={() => cms.setValue((l) => l.filter((_, idx) => idx !== i))}
                className="cc-btn cc-btn-sm cc-btn-danger ml-auto"
              >
                Remove
              </button>
            </div>
            {openPicker === i && (
              <IconPicker
                value={b.icon}
                run={cms.run}
                onChange={(icon) => {
                  update(i, { icon });
                  setOpenPicker(null);
                }}
              />
            )}
          </div>
        ))}
      </div>

      <button type="button" disabled={badges.length >= MAX_INTRO_BADGES} onClick={addBadge} className="cc-btn">
        + Add badge
      </button>
      <SaveBar
        busy={cms.busy}
        onSave={cms.save}
        onReset={cms.reset}
        saveLabel="Save badges"
        saveDisabled={badges.length === 0}
      />
    </CmsPanel>
  );
};
