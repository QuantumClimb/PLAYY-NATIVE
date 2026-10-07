import React from 'react';
import { RenderMode } from '../../../lib/playys/types';

interface BackgroundProps {
  mode: RenderMode;
}

export const JungleWorldBackground: React.FC<BackgroundProps> = ({ mode }) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3;

  return (
    <g id="bg-jungle-world">
      <rect x="0" y="0" width="850" height="1100" fill={isColor ? '#38BDF8' : '#FFFFFF'} />

      {/* Radiant Sun in the sky */}
      <g id="tropical-sun" transform="translate(720, 160)">
        <circle cx="0" cy="0" r="50" fill={isColor ? '#FACC15' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="0"
            y1="-62"
            x2="0"
            y2="-78"
            transform={`rotate(${angle})`}
            stroke={stroke}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Smiling Puffy Tropical Cloud */}
      <g id="tropical-cloud" transform="translate(180, 120)">
        <path
          d="M-80 30 C-110 30 -120 0 -90 -20 C-110 -50 -70 -70 -40 -50 C-20 -80 30 -80 50 -50 C80 -60 110 -30 90 0 C120 20 100 50 70 50 Z"
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <circle cx="-10" cy="-10" r="3.5" fill={stroke} />
        <circle cx="25" cy="-10" r="3.5" fill={stroke} />
        <path d="M0 5 Q8 12 16 5" fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      </g>

      {/* Distant Volcano / Tropical Mountain */}
      <path
        d="M-50 620 L160 380 L360 620 Z"
        fill={isColor ? '#059669' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* Beautiful Palm Tree (Left Side) */}
      <g id="palm-tree-left" transform="translate(140, 520)">
        {/* Curved Trunk with Segments */}
        <path
          d="M-20 280 C-40 180 10 70 -10 -80 C-25 70 -60 180 -45 280 Z"
          fill={isColor ? '#B45309' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Trunk lines */}
        <line x1="-38" y1="180" x2="-22" y2="180" stroke={stroke} strokeWidth={2.5} />
        <line x1="-35" y1="120" x2="-18" y2="120" stroke={stroke} strokeWidth={2.5} />
        <line x1="-28" y1="60" x2="-12" y2="60" stroke={stroke} strokeWidth={2.5} />
        <line x1="-20" y1="0" x2="-8" y2="0" stroke={stroke} strokeWidth={2.5} />

        {/* 5 Big Tropical Palm Leaves */}
        {/* Left-most Leaf */}
        <path
          d="M-10 -80 C-70 -120 -140 -110 -180 -60 C-120 -60 -70 -70 -10 -80 Z"
          fill={isColor ? '#22C55E' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Top-Left Leaf */}
        <path
          d="M-10 -80 C-40 -160 -100 -200 -140 -190 C-100 -140 -60 -110 -10 -80 Z"
          fill={isColor ? '#16A34A' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Top-Right Leaf */}
        <path
          d="M-10 -80 C30 -160 80 -180 120 -150 C70 -120 30 -100 -10 -80 Z"
          fill={isColor ? '#22C55E' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Right-most Leaf */}
        <path
          d="M-10 -80 C60 -110 130 -80 160 -30 C100 -40 50 -60 -10 -80 Z"
          fill={isColor ? '#15803D' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Hanging Coconuts */}
        <circle cx="-25" cy="-70" r="14" fill={isColor ? '#78350F' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
        <circle cx="-5" cy="-65" r="14" fill={isColor ? '#78350F' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
        <circle cx="-15" cy="-52" r="14" fill={isColor ? '#78350F' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
      </g>

      {/* Ocean Waves */}
      <g id="ocean-waves">
        <path
          d="M0 680
             C100 660 180 700 280 680
             C380 660 480 700 580 680
             C680 660 780 700 850 680
             L850 780 L0 780 Z"
          fill={isColor ? '#0EA5E9' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* Sandy Beach Shore (Foreground) */}
      <g id="beach-sand">
        <path
          d="M0 760
             C220 730 600 730 850 770
             L850 1100 L0 1100 Z"
          fill={isColor ? '#FDE047' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Little Beach Starfish */}
        <g transform="translate(180, 890)">
          <path
            d="M0 -22 L6 -6 L22 -6 L10 4 L14 20 L0 10 L-14 20 L-10 4 L-22 -6 L-6 -6 Z"
            fill={isColor ? '#FB7185' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={2.5}
          />
        </g>
        {/* Cute Seashell */}
        <g transform="translate(680, 870)">
          <path
            d="M-22 15 C-25 -5 0 -22 22 -22 C44 -22 45 -5 40 15 Z"
            fill={isColor ? '#F472B6' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={2.5}
          />
          <line x1="10" y1="15" x2="10" y2="-18" stroke={stroke} strokeWidth={2} />
          <line x1="-5" y1="15" x2="-2" y2="-15" stroke={stroke} strokeWidth={2} />
          <line x1="25" y1="15" x2="22" y2="-15" stroke={stroke} strokeWidth={2} />
        </g>
      </g>
    </g>
  );
};
