import React from 'react';
import { ICON_REGISTRY, IntroBadgeData } from '../../lib/intro/badges';
import { deriveColor, normalizeColor } from '../../lib/assets/svgParts';

const BadgeIcon: React.FC<{ icon: string; color: string }> = ({ icon, color }) => {
  const [kind, ...rest] = icon.split(':');
  const value = rest.join(':');
  if (kind === 'media') return <img src={`/api/media/${value}`} alt="" draggable={false} className="intro-badge-img" />;
  if (kind === 'emoji') return <span className="intro-badge-emoji" aria-hidden="true">{value}</span>;
  const Icon = ICON_REGISTRY[value] ?? ICON_REGISTRY.Star;
  return <Icon className="intro-badge-svg" fill={color} stroke={deriveColor(color, -18)} strokeWidth={1.6} aria-hidden="true" />;
};

/** One static badge: cream tile, thick accent border, darker lip underneath. */
export const IntroBadge: React.FC<{ badge: IntroBadgeData }> = ({ badge }) => {
  const color = normalizeColor(badge.color) ?? '#f6ae00';
  return (
    <div
      className="intro-badge"
      style={{ ['--c' as string]: color, ['--c-dark' as string]: deriveColor(color, -16) } as React.CSSProperties}
    >
      <div className="intro-badge-icon"><BadgeIcon icon={badge.icon} color={color} /></div>
      <span className="intro-badge-label">{badge.label}</span>
    </div>
  );
};

export const IntroBadges: React.FC<{ badges: IntroBadgeData[]; className?: string }> = ({ badges, className = '' }) => (
  <div className={`intro-badges ${className}`}>
    {badges.map((b) => <IntroBadge key={b.id} badge={b} />)}
  </div>
);
