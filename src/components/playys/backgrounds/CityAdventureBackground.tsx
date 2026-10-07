import React from 'react';
import { RenderMode } from '../../../lib/playys/types';

interface BackgroundProps {
  mode: RenderMode;
}

export const CityAdventureBackground: React.FC<BackgroundProps> = ({ mode }) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3;

  return (
    <g id="bg-city-adventure">
      <rect x="0" y="0" width="850" height="1100" fill={isColor ? '#FDE68A' : '#FFFFFF'} />

      {/* Cheerful Sun */}
      <circle cx="425" cy="180" r="55" fill={isColor ? '#F59E0B' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />

      {/* Skyline of Colorful Cartoon Towers */}
      <g id="city-skyline">
        {/* Tower 1 (Left Far) */}
        <rect x="20" y="380" width="110" height="420" fill={isColor ? '#38BDF8' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        {/* Windows */}
        {[420, 480, 540, 600, 660].map((y) => (
          <g key={y}>
            <rect x="40" y={y} width="25" height="35" rx="4" fill={isColor ? '#FEF08A' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
            <rect x="85" y={y} width="25" height="35" rx="4" fill={isColor ? '#FEF08A' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
          </g>
        ))}

        {/* Tower 2 (Left Middle) with Antenna */}
        <rect x="140" y="300" width="120" height="500" fill={isColor ? '#F472B6' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <line x1="200" y1="300" x2="200" y2="240" stroke={stroke} strokeWidth={3} />
        <circle cx="200" cy="235" r="7" fill={isColor ? '#EF4444' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />

        {/* Tower 3 (Center Deep) */}
        <rect x="360" y="320" width="130" height="480" fill={isColor ? '#A78BFA' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />

        {/* Tower 4 (Right Middle) with Curved Top */}
        <path
          d="M580 800 L580 340 C580 280 700 280 700 340 L700 800 Z"
          fill={isColor ? '#34D399' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />

        {/* Tower 5 (Right Far) */}
        <rect x="710" y="390" width="120" height="410" fill={isColor ? '#FB923C' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
      </g>

      {/* Street & Crosswalk (Foreground) */}
      <g id="city-street">
        <path
          d="M0 780 L850 780 L850 1100 L0 1100 Z"
          fill={isColor ? '#64748B' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Crosswalk stripes */}
        <rect x="340" y="830" width="30" height="90" rx="6" fill="#FFFFFF" stroke={stroke} strokeWidth={2} />
        <rect x="390" y="830" width="30" height="90" rx="6" fill="#FFFFFF" stroke={stroke} strokeWidth={2} />
        <rect x="440" y="830" width="30" height="90" rx="6" fill="#FFFFFF" stroke={stroke} strokeWidth={2} />
        <rect x="490" y="830" width="30" height="90" rx="6" fill="#FFFFFF" stroke={stroke} strokeWidth={2} />

        {/* Cute Traffic Light on the right */}
        <g id="traffic-light" transform="translate(760, 680)">
          <rect x="-8" y="40" width="16" height="150" fill={isColor ? '#334155' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
          <rect x="-24" y="-70" width="48" height="110" rx="10" fill={isColor ? '#FACC15' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx="0" cy="-45" r="12" fill={isColor ? '#EF4444' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
          <circle cx="0" cy="-15" r="12" fill={isColor ? '#FBBF24' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
          <circle cx="0" cy="15" r="12" fill={isColor ? '#22C55E' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        </g>
      </g>
    </g>
  );
};
