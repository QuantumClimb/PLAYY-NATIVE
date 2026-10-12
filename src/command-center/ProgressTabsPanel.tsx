import React, { useState } from 'react';
import { DEFAULT_PROGRESS_TABS, MAX_TAB_LABEL, ProgressTabs, cleanProgressTabs } from '../lib/progress/tabs';
import { StageTabsRow, TabIcon, DISPLAY_STAGES } from '../kiosk/components/StageTabs';
import { CmsPanel, SaveBar } from './CmsPanel';
import { IconPicker, iconLabel } from './IconPicker';
import { useCmsSetting } from './useCmsSetting';

const field = 'bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm';

/** Command center: the row of steps along the top of the kiosk pages (labels and icons). */
export const ProgressTabsPanel: React.FC = () => {
  const cms = useCmsSetting<ProgressTabs, { tabs: unknown }>({
    url: '/api/progress-tabs',
    saveUrl: '/api/cc/progress-tabs',
    resetUrl: '/api/cc/progress-tabs/reset',
    read: (data) => cleanProgressTabs(data.tabs) ?? DEFAULT_PROGRESS_TABS,
    defaults: DEFAULT_PROGRESS_TABS,
    savedNote: 'Saved. The kiosk shows the new tabs the next time it loads.',
    resetNote: 'Reset to the original tabs.',
    resetQuestion: 'Reset the tabs to the original labels and icons?',
  });
  const tabs = cms.value;
  const [openPicker, setOpenPicker] = useState<number | null>(null);
  const [previewStep, setPreviewStep] = useState(1);

  const update = (i: number, patch: Partial<ProgressTabs['stages'][number]>) =>
    cms.setValue((t) => ({ ...t, stages: t.stages.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));

  if (cms.loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <CmsPanel
      title="Progress tabs"
      description="The row of steps along the top of the kiosk pages. Rename them, change their icons, or hide the labels and show only the icons."
      error={cms.error}
      note={cms.note}
    >
      <div className="rounded-2xl p-6 progress-tabs-preview">
        <StageTabsRow active={previewStep} tabs={tabs} />
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        Preview the highlight on:
        <select value={previewStep} onChange={(e) => setPreviewStep(Number(e.target.value))} className={field}>
          {tabs.stages.map((s, i) => (
            <option key={i} value={i}>
              {s.label}
            </option>
          ))}
        </select>
        <label className="ml-auto flex items-center gap-2">
          <input
            type="checkbox"
            checked={tabs.showLabels}
            onChange={(e) => cms.setValue((t) => ({ ...t, showLabels: e.target.checked }))}
          />
          Show labels under the icons
        </label>
      </div>

      <div className="space-y-3">
        {tabs.stages.map((s, i) => (
          <div key={i} className="rounded-xl border border-gray-300 p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-6 text-sm text-gray-500">{i + 1}</span>
              <input
                value={s.label}
                maxLength={MAX_TAB_LABEL}
                onChange={(e) => update(i, { label: e.target.value })}
                className={`${field} w-44`}
                placeholder="Label"
              />
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === i ? null : i)}
                className={`${field} min-w-36`}
              >
                Icon: {iconLabel(s.icon)}
              </button>
              <span className="stage-badge" style={{ width: '2.5rem', height: '2.5rem', flex: '0 0 2.5rem' }}>
                <TabIcon icon={s.icon} fallback={DISPLAY_STAGES[i].icon} />
              </span>
            </div>
            {openPicker === i && (
              <IconPicker
                value={s.icon}
                allowOriginal
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

      <SaveBar busy={cms.busy} onSave={cms.save} onReset={cms.reset} saveLabel="Save tabs" />
    </CmsPanel>
  );
};
