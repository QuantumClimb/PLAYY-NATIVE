import { useEffect, useState } from 'react';

/** One step in the row along the top of the kiosk pages. */
interface ProgressTab {
  label: string;
  /** `builtin` (the original drawn icon), `lucide:Star`, `media:<id>` (uploaded image) or `emoji:🎨` */
  icon: string;
}

export interface ProgressTabs {
  showLabels: boolean;
  /** Always the eight steps, in order: face, pose, colors, you, power, background, name, preview */
  stages: ProgressTab[];
}

export const MAX_TAB_LABEL = 14;

export const DEFAULT_PROGRESS_TABS: ProgressTabs = {
  showLabels: true,
  stages: [
    { label: 'Face', icon: 'builtin' },
    { label: 'Pose', icon: 'builtin' },
    { label: 'Colors', icon: 'builtin' },
    { label: 'You', icon: 'builtin' },
    { label: 'Power', icon: 'builtin' },
    { label: 'Background', icon: 'builtin' },
    { label: 'Name', icon: 'builtin' },
    { label: 'Preview', icon: 'builtin' },
  ],
};

/** Checks what the server or the CMS gives; anything unusable falls back to the defaults for that tab. */
export function cleanProgressTabs(input: unknown): ProgressTabs | null {
  const t = input as Partial<ProgressTabs> | null;
  if (!t || !Array.isArray(t.stages)) return null;
  return {
    showLabels: t.showLabels !== false,
    stages: DEFAULT_PROGRESS_TABS.stages.map((d, i) => {
      const s = t.stages![i];
      return s && typeof s.label === 'string' && s.label.trim() && typeof s.icon === 'string'
        ? { label: s.label.slice(0, MAX_TAB_LABEL), icon: s.icon }
        : d;
    }),
  };
}

let cached: ProgressTabs | null = null;

/** The tabs from the command center, loaded once per page load. */
export function useProgressTabs(): ProgressTabs {
  const [tabs, setTabs] = useState<ProgressTabs>(cached ?? DEFAULT_PROGRESS_TABS);
  useEffect(() => {
    if (cached) return;
    let live = true;
    fetch('/api/progress-tabs')
      .then((r) => r.json())
      .then((d) => {
        cached = cleanProgressTabs(d.tabs) ?? DEFAULT_PROGRESS_TABS;
        if (live) setTabs(cached);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return tabs;
}
