import React, { useEffect, useState } from 'react';
import { ICON_REGISTRY } from '../lib/intro/badges';
import { DEFAULT_PROGRESS_TABS, MAX_TAB_LABEL, ProgressTabs, cleanProgressTabs } from '../lib/progress/tabs';
import { StageTabsRow, TabIcon, DISPLAY_STAGES } from '../components/kiosk/StageTabs';

const field = 'bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm';

/** Command center: the row of steps along the top of the kiosk pages (labels and icons). */
export const ProgressTabsPanel: React.FC = () => {
  const [tabs, setTabs] = useState<ProgressTabs>(DEFAULT_PROGRESS_TABS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [openPicker, setOpenPicker] = useState<number | null>(null);
  const [previewStep, setPreviewStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/progress-tabs')
      .then((r) => r.json())
      .then((d) => setTabs(cleanProgressTabs(d.tabs) ?? DEFAULT_PROGRESS_TABS))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const update = (i: number, patch: Partial<ProgressTabs['stages'][number]>) =>
    setTabs((t) => ({ ...t, stages: t.stages.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));

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
      const d = await request('/api/cc/progress-tabs', { method: 'PUT', body: JSON.stringify(tabs) });
      setTabs(cleanProgressTabs(d.tabs) ?? tabs);
      setNote('Saved. The kiosk shows the new tabs the next time it loads.');
    });

  const reset = () =>
    run(async () => {
      if (!window.confirm('Reset the tabs to the original labels and icons?')) return;
      await request('/api/cc/progress-tabs/reset', { method: 'POST' });
      setTabs(DEFAULT_PROGRESS_TABS);
      setNote('Reset to the original tabs.');
    });

  const uploadIcon = (i: number, file: File) =>
    run(async () => {
      if (!/^image\/(png|jpeg|webp)$/.test(file.type))
        throw new Error('Use a PNG, JPG or WebP image (a transparent PNG works best).');
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
        reader.onerror = () => reject(new Error('Could not read the file'));
        reader.readAsDataURL(file);
      });
      const d = await request('/api/cc/scene-backgrounds/upload', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, mimeType: file.type, base64 }),
      });
      update(i, { icon: `media:${d.mediaId}` });
      setOpenPicker(null);
    });

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold">Progress tabs</h2>
        <p className="text-sm text-gray-500">
          The row of steps along the top of the kiosk pages. Rename them, change their icons, or hide the labels and
          show only the icons.
        </p>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-sm text-red-800">{error}</div>}
      {note && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-sm text-emerald-800">{note}</div>
      )}

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
            onChange={(e) => setTabs((t) => ({ ...t, showLabels: e.target.checked }))}
          />
          Show labels under the icons
        </label>
      </div>

      <div className="space-y-3">
        {tabs.stages.map((s, i) => {
          const [kind, ...rest] = s.icon.split(':');
          return (
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
                  Icon:{' '}
                  {kind === 'builtin'
                    ? 'original'
                    : kind === 'lucide'
                      ? rest.join(':')
                      : kind === 'media'
                        ? 'uploaded image'
                        : rest.join(':')}
                </button>
                <span className="stage-badge" style={{ width: '2.5rem', height: '2.5rem', flex: '0 0 2.5rem' }}>
                  <TabIcon icon={s.icon} fallback={DISPLAY_STAGES[i].icon} />
                </span>
              </div>

              {openPicker === i && (
                <div className="rounded-lg bg-white p-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        update(i, { icon: 'builtin' });
                        setOpenPicker(null);
                      }}
                      className={`px-3 py-2 rounded-lg border text-sm ${s.icon === 'builtin' ? 'border-teal-400 bg-gray-50' : 'border-gray-300 hover:bg-gray-50'}`}
                    >
                      Original
                    </button>
                    {Object.entries(ICON_REGISTRY).map(([name, Icon]) => (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() => {
                          update(i, { icon: `lucide:${name}` });
                          setOpenPicker(null);
                        }}
                        className={`p-2 rounded-lg border ${s.icon === `lucide:${name}` ? 'border-teal-400 bg-gray-50' : 'border-gray-300 hover:bg-gray-50'}`}
                      >
                        <Icon className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">
                      Upload image
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        hidden
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (f) uploadIcon(i, f);
                        }}
                      />
                    </label>
                    <span className="text-gray-500">or an emoji:</span>
                    <input
                      maxLength={4}
                      placeholder="🎨"
                      className={`${field} w-20`}
                      onChange={(e) => e.target.value.trim() && update(i, { icon: `emoji:${e.target.value.trim()}` })}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} disabled={busy} className="cc-btn">
          Reset to original
        </button>
        <button type="button" onClick={save} disabled={busy} className="cc-btn cc-btn-primary ml-auto">
          Save tabs
        </button>
      </div>
    </div>
  );
};
