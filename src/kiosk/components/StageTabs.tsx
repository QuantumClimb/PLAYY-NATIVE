import React from 'react';
import { ICON_REGISTRY } from '../../lib/intro/badges';
import type { ProgressTabs } from '../../lib/progress/tabs';

export const DISPLAY_STAGES = [
  { label: 'FACE', icon: 'face' },
  { label: 'POSE', icon: 'pose' },
  { label: 'COLORS', icon: 'palette' },
  { label: 'YOU', icon: 'heart' },
  { label: 'POWER', icon: 'star' },
  { label: 'BACKGROUND', icon: 'landscape' },
  { label: 'NAME', icon: 'name' },
  { label: 'PREVIEW', icon: 'printer' },
] as const;

const StageIcon: React.FC<{ type: (typeof DISPLAY_STAGES)[number]['icon'] }> = ({ type }) => {
  if (type === 'face')
    return (
      <>
        <circle cx="32" cy="28" r="11" />
        <circle cx="27" cy="27" r="2" fill="currentColor" stroke="none" />
        <circle cx="37" cy="27" r="2" fill="currentColor" stroke="none" />
        <path d="M26 32c3 4 9 4 12 0" />
      </>
    );
  if (type === 'pose')
    return (
      <>
        <circle cx="32" cy="17" r="4" />
        <path d="M32 22v14M32 26l-9 7M32 26l9 7M32 36l-7 9M32 36l7 9" />
      </>
    );
  if (type === 'palette')
    return (
      <>
        <path d="M32 14c-11 0-19 7-19 16 0 8 6 13 13 13h4c2 0 3-2 2-4-1-2 0-4 3-4h4c7 0 12-5 12-11 0-6-8-10-19-10Z" />
        <circle cx="22" cy="26" r="2" fill="currentColor" stroke="none" />
        <circle cx="29" cy="21" r="2" fill="currentColor" stroke="none" />
        <circle cx="38" cy="21" r="2" fill="currentColor" stroke="none" />
        <path d="m45 14 6-6" />
      </>
    );
  if (type === 'heart')
    return (
      <path
        d="M32 43S15 33 15 23c0-5 4-8 8-8 4 0 7 3 9 6 2-3 5-6 9-6 4 0 8 3 8 8 0 10-17 20-17 20Z"
        fill="currentColor"
        stroke="none"
      />
    );
  if (type === 'star')
    return (
      <path
        d="m32 13 5.5 11 12 1.8-8.7 8.5 2 12-10.8-5.7-10.8 5.7 2-12-8.7-8.5 12-1.8Z"
        fill="currentColor"
        stroke="none"
      />
    );
  if (type === 'landscape')
    return (
      <>
        <path d="M15 43 27 29l6 7 6-8 10 15Z" fill="currentColor" stroke="none" />
        <circle cx="43" cy="20" r="4" fill="currentColor" stroke="none" />
      </>
    );
  if (type === 'name')
    return (
      <>
        <path d="M17 19h30M17 29h30M17 39h21" />
        <path d="M23 12v34" />
      </>
    );
  return (
    <>
      <rect x="17" y="18" width="30" height="22" rx="2" />
      <path d="M22 18v-6h20v6M23 40v6h18v-6M22 33h20" />
      <circle cx="41" cy="23" r="2" fill="currentColor" stroke="none" />
    </>
  );
};

export const TabIcon: React.FC<{ icon: string; fallback: (typeof DISPLAY_STAGES)[number]['icon'] }> = ({
  icon,
  fallback,
}) => {
  const [kind, ...rest] = icon.split(':');
  const value = rest.join(':');
  if (kind === 'media') return <img src={`/api/media/${value}`} alt="" draggable={false} className="stage-badge-img" />;
  if (kind === 'emoji')
    return (
      <span className="stage-badge-emoji" aria-hidden="true">
        {value}
      </span>
    );
  if (kind === 'lucide' && ICON_REGISTRY[value]) {
    const Icon = ICON_REGISTRY[value];
    return <Icon className="stage-badge-lucide" aria-hidden="true" />;
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <StageIcon type={fallback} />
    </svg>
  );
};

export const StageTabsRow: React.FC<{ active: number; tabs: ProgressTabs }> = ({ active, tabs }) => {
  return (
    <div
      className="stage-indicator"
      aria-label={`Progress: ${tabs.stages[active]?.label ?? DISPLAY_STAGES[active].label}`}
    >
      <div className="stage-indicator-line" aria-hidden="true" />
      {DISPLAY_STAGES.map((stage, index) => (
        <div className={`stage-item ${index === active ? 'is-active' : ''}`} key={stage.label}>
          <div className="stage-badge">
            <TabIcon icon={tabs.stages[index]?.icon ?? 'builtin'} fallback={stage.icon} />
          </div>
          {tabs.showLabels && <span>{tabs.stages[index]?.label ?? stage.label}</span>}
        </div>
      ))}
    </div>
  );
};
