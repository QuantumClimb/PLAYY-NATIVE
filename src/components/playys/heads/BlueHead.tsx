import React from 'react';
import { RenderMode } from '../../../lib/playys/types';

interface HeadProps {
  mode: RenderMode;
  x?: number;
  y?: number;
  scale?: number;
}

export const BlueHead: React.FC<HeadProps> = ({
  mode,
  x = 425,
  y = 440,
  scale = 1,
}) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3.5;

  return (
    <g id="head-blue" transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* 1. Outer 7-point Spiky Star Crown */}
      <path
        d="M0 -150
           C12 -125 28 -110 48 -108
           C80 -125 110 -115 130 -85
           C115 -60 115 -40 128 -20
           C155 0 160 30 142 60
           C125 68 115 82 118 102
           C112 128 85 145 55 135
           C38 126 22 128 10 134
           C-2 134 -8 134 -10 134
           C-22 128 -38 126 -55 135
           C-85 145 -112 128 -118 102
           C-115 82 -125 68 -142 60
           C-160 30 -155 0 -128 -20
           C-115 -40 -115 -60 -130 -85
           C-110 -115 -80 -125 -48 -108
           C-28 -110 -12 -125 0 -150 Z"
        fill={isColor ? '#2563EB' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 3D Volume highlights on spiky crown if color mode */}
      {isColor && (
        <>
          <path
            d="M0 -140 L35 -105 L-35 -105 Z"
            fill="#60A5FA"
            opacity="0.6"
          />
          <path
            d="M100 -75 L70 -50 L115 -30 Z"
            fill="#60A5FA"
            opacity="0.5"
          />
          <path
            d="M-100 -75 L-70 -50 L-115 -30 Z"
            fill="#3B82F6"
            opacity="0.4"
          />
        </>
      )}

      {/* 2. Inner Hood Ring Frame */}
      <ellipse
        cx="0"
        cy="0"
        rx="88"
        ry="82"
        fill={isColor ? '#1D4ED8' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* 3. Face Base */}
      <ellipse
        cx="0"
        cy="4"
        rx="78"
        ry="72"
        fill={isColor ? '#FFF1F2' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* Cheeks if color mode */}
      {isColor && (
        <>
          <ellipse cx="-52" cy="22" rx="14" ry="9" fill="#FDA4AF" opacity="0.6" />
          <ellipse cx="52" cy="22" rx="14" ry="9" fill="#FDA4AF" opacity="0.6" />
        </>
      )}

      {/* 4. Arched Cute Eyebrows */}
      <path
        d="M-44 -32 C-38 -44 -20 -44 -14 -32"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M14 -32 C20 -44 38 -44 44 -32"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* 5. Iconic PLAYYS Eye Pill Markings */}
      {/* Left Eye Marking */}
      <rect
        x="-42"
        y="-24"
        width="24"
        height="44"
        rx="12"
        fill={isColor ? '#D946EF' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Center Nose Pill */}
      <rect
        x="-6"
        y="-14"
        width="12"
        height="32"
        rx="6"
        fill={isColor ? '#7C3AED' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Right Eye Marking */}
      <rect
        x="18"
        y="-24"
        width="24"
        height="44"
        rx="12"
        fill={isColor ? '#D946EF' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* 6. Pupils & Shiny Eye Sparkles */}
      {/* Left Pupil */}
      <ellipse
        cx="-30"
        cy="-2"
        rx="7"
        ry="10"
        fill={isColor ? '#0F172A' : '#111827'}
      />
      <circle cx="-32" cy="-6" r="3.5" fill="#FFFFFF" />
      <circle cx="-27" cy="3" r="1.8" fill="#FFFFFF" />

      {/* Right Pupil */}
      <ellipse
        cx="30"
        cy="-2"
        rx="7"
        ry="10"
        fill={isColor ? '#0F172A' : '#111827'}
      />
      <circle cx="28" cy="-6" r="3.5" fill="#FFFFFF" />
      <circle cx="33" cy="3" r="1.8" fill="#FFFFFF" />

      {/* 7. Big Happy Cheerful Smile */}
      <path
        d="M-30 26 C-20 48 20 48 30 26"
        fill={isColor ? '#E11D48' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tongue detail */}
      <path
        d="M-14 38 C-8 44 8 44 14 38"
        fill={isColor ? '#FB7185' : '#FFFFFF'}
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* 8. Hoodie Drawstrings Hanging at Neck */}
      <g id="drawstrings">
        {/* Left String */}
        <path
          d="M-28 72 C-28 92 -26 102 -22 118"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <rect
          x="-26"
          y="118"
          width="8"
          height="14"
          rx="4"
          fill={isColor ? '#93C5FD' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={2.5}
        />

        {/* Right String */}
        <path
          d="M28 72 C28 92 26 102 22 118"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <rect
          x="18"
          y="118"
          width="8"
          height="14"
          rx="4"
          fill={isColor ? '#93C5FD' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={2.5}
        />
      </g>
    </g>
  );
};
