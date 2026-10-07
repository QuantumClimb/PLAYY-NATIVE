import React from 'react';
import { RenderMode } from '../../../lib/playys/types';

interface HeadProps {
  mode: RenderMode;
  x?: number;
  y?: number;
  scale?: number;
}

export const DreamyyHead: React.FC<HeadProps> = ({
  mode,
  x = 425,
  y = 440,
  scale = 1,
}) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3.5;

  return (
    <g id="head-dreamyy" transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* 1. Fluffy Cloud Silhouette with top swirl */}
      <path
        d="M0 -155
           C25 -155 35 -140 28 -120
           C55 -125 90 -105 105 -75
           C125 -65 145 -35 140 5
           C150 35 135 75 110 95
           C90 115 60 125 30 128
           C15 130 -15 130 -30 128
           C-60 125 -90 115 -110 95
           C-135 75 -150 35 -140 5
           C-145 -35 -125 -65 -105 -75
           C-90 -105 -55 -125 -28 -120
           C-35 -140 -25 -155 0 -155 Z"
        fill={isColor ? '#F8FAFC' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Cloud Swirl at the top */}
      <path
        d="M-10 -140 C10 -150 24 -135 15 -118 C6 -105 -12 -110 -15 -125"
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Cloud Puffs Shading */}
      {isColor && (
        <>
          <path
            d="M-80 80 C-40 110 40 110 80 80"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={10}
            strokeLinecap="round"
            opacity="0.6"
          />
          <ellipse cx="-55" cy="30" rx="16" ry="10" fill="#F472B6" opacity="0.4" />
          <ellipse cx="55" cy="30" rx="16" ry="10" fill="#F472B6" opacity="0.4" />
        </>
      )}

      {/* 2. Inner Face Opening */}
      <ellipse
        cx="0"
        cy="10"
        rx="78"
        ry="68"
        fill={isColor ? '#FFFBEB' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* 3. Eyebrows */}
      <path
        d="M-42 -24 C-36 -34 -20 -34 -14 -24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M14 -24 C20 -34 36 -34 42 -24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* 4. Eye Markings (Violet/Pink) */}
      <rect
        x="-40"
        y="-18"
        width="22"
        height="40"
        rx="11"
        fill={isColor ? '#A855F7' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <rect
        x="-5"
        y="-8"
        width="10"
        height="28"
        rx="5"
        fill={isColor ? '#EC4899' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <rect
        x="18"
        y="-18"
        width="22"
        height="40"
        rx="11"
        fill={isColor ? '#A855F7' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* 5. Pupils */}
      <ellipse
        cx="-29"
        cy="2"
        rx="6.5"
        ry="9"
        fill={isColor ? '#1E1B4B' : '#111827'}
      />
      <circle cx="-31" cy="-2" r="3" fill="#FFFFFF" />
      <circle cx="-26" cy="6" r="1.5" fill="#FFFFFF" />

      <ellipse
        cx="29"
        cy="2"
        rx="6.5"
        ry="9"
        fill={isColor ? '#1E1B4B' : '#111827'}
      />
      <circle cx="27" cy="-2" r="3" fill="#FFFFFF" />
      <circle cx="32" cy="6" r="1.5" fill="#FFFFFF" />

      {/* 6. Gentle Sweet Smile */}
      <path
        d="M-26 28 C-16 44 16 44 26 28"
        fill={isColor ? '#F43F5E' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* 7. Drawstrings */}
      <g id="drawstrings-dreamyy">
        <path
          d="M-24 78 C-24 96 -20 106 -18 120"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <rect
          x="-22"
          y="120"
          width="8"
          height="14"
          rx="4"
          fill={isColor ? '#C084FC' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={2.5}
        />
        <path
          d="M24 78 C24 96 20 106 18 120"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <rect
          x="14"
          y="120"
          width="8"
          height="14"
          rx="4"
          fill={isColor ? '#C084FC' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={2.5}
        />
      </g>
    </g>
  );
};
