import React from 'react';
import { RenderMode } from '../../../lib/playys/types';

interface HeadProps {
  mode: RenderMode;
  x?: number;
  y?: number;
  scale?: number;
}

export const SparkyyHead: React.FC<HeadProps> = ({
  mode,
  x = 425,
  y = 440,
  scale = 1,
}) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3.5;

  return (
    <g id="head-sparkyy" transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* 1. Dynamic Flame Teardrop Silhouette with flickers */}
      <path
        d="M0 -165
           C30 -130 50 -120 70 -95
           C105 -85 130 -50 135 -10
           C145 35 125 80 100 105
           C75 125 45 132 15 132
           C-15 132 -45 125 -75 105
           C-125 80 -145 35 -135 -10
           C-130 -50 -105 -85 -70 -95
           C-50 -120 -30 -130 0 -165 Z"
        fill={isColor ? '#EA580C' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Flame top dynamic curved lick */}
      <path
        d="M-5 -160 C15 -140 30 -150 15 -130"
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Fire gradient inner glow in color mode */}
      {isColor && (
        <>
          <path
            d="M0 -135
               C20 -105 35 -95 50 -75
               C75 -65 95 -40 100 -10
               C105 25 90 60 70 80
               C-70 80 -105 25 -100 -10
               C-95 -40 -75 -65 -50 -75
               C-35 -95 -20 -105 0 -135 Z"
            fill="#F97316"
            stroke="#FBBF24"
            strokeWidth={3}
            opacity="0.8"
          />
          <ellipse cx="-50" cy="25" rx="14" ry="8" fill="#FEF08A" opacity="0.6" />
          <ellipse cx="50" cy="25" rx="14" ry="8" fill="#FEF08A" opacity="0.6" />
        </>
      )}

      {/* 2. Inner Face Opening */}
      <ellipse
        cx="0"
        cy="8"
        rx="78"
        ry="70"
        fill={isColor ? '#FFF7ED' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* 3. Eyebrows (Fiery angled arched) */}
      <path
        d="M-44 -26 C-36 -38 -18 -36 -12 -28"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M12 -28 C18 -36 36 -38 44 -26"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* 4. Eye Markings (Violet/Pink) */}
      <rect
        x="-42"
        y="-20"
        width="22"
        height="42"
        rx="11"
        fill={isColor ? '#9333EA' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <rect
        x="-6"
        y="-10"
        width="12"
        height="30"
        rx="6"
        fill={isColor ? '#EC4899' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <rect
        x="20"
        y="-20"
        width="22"
        height="42"
        rx="11"
        fill={isColor ? '#9333EA' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* 5. Pupils */}
      <ellipse
        cx="-31"
        cy="0"
        rx="6.5"
        ry="9"
        fill={isColor ? '#3B0764' : '#111827'}
      />
      <circle cx="-33" cy="-4" r="3.2" fill="#FFFFFF" />
      <circle cx="-28" cy="4" r="1.6" fill="#FFFFFF" />

      <ellipse
        cx="31"
        cy="0"
        rx="6.5"
        ry="9"
        fill={isColor ? '#3B0764' : '#111827'}
      />
      <circle cx="29" cy="-4" r="3.2" fill="#FFFFFF" />
      <circle cx="34" cy="4" r="1.6" fill="#FFFFFF" />

      {/* 6. Playful Cheerful Smile */}
      <path
        d="M-28 28 C-18 46 18 46 28 28"
        fill={isColor ? '#EF4444' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* 7. Drawstrings */}
      <g id="drawstrings-sparkyy">
        <path
          d="M-26 78 C-26 96 -22 106 -20 120"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <rect
          x="-24"
          y="120"
          width="8"
          height="14"
          rx="4"
          fill={isColor ? '#FBBF24' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={2.5}
        />
        <path
          d="M26 78 C26 96 22 106 20 120"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <rect
          x="16"
          y="120"
          width="8"
          height="14"
          rx="4"
          fill={isColor ? '#FBBF24' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={2.5}
        />
      </g>
    </g>
  );
};
