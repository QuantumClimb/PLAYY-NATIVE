import React from 'react';
import { RenderMode, SymbolId } from '../../../lib/playys/types';
import { SymbolRenderer } from '../symbols/SymbolRenderer';

interface PoseProps {
  mode: RenderMode;
  symbol: SymbolId;
  x?: number;
  y?: number;
  scale?: number;
}

export const JumpPose: React.FC<PoseProps> = ({
  mode,
  symbol,
  x = 425,
  y = 540,
  scale = 1,
}) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3.5;

  const hoodieColor = isColor ? '#2563EB' : '#FFFFFF';
  const pantsColor = isColor ? '#1D4ED8' : '#FFFFFF';
  const bootColor = isColor ? '#1E40AF' : '#FFFFFF';
  const soleColor = isColor ? '#F8FAFC' : '#FFFFFF';
  const skinColor = isColor ? '#E0F2FE' : '#FFFFFF';

  return (
    <g id="pose-jump" transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* 1. Jumping Dynamic Legs (Kicked outwards/bent) */}
      {/* Left Leg Kicked Out */}
      <g id="leg-jump-left">
        <path
          d="M-40 115 L-95 165 C-105 172 -100 185 -90 192 L-65 205 C-52 210 -45 200 -40 188 L-15 125 Z"
          fill={pantsColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <rect
          x="-95"
          y="180"
          width="50"
          height="18"
          rx="9"
          transform="rotate(25 -70 189)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Left Shoe tilted */}
        <path
          d="M-115 190 C-125 195 -130 215 -118 235 C-105 252 -75 250 -55 235 C-42 225 -48 208 -62 198 Z"
          fill={bootColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <path
          d="M-122 215 C-115 240 -85 255 -55 245 Z"
          fill={soleColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* Right Leg Bent in mid-air */}
      <g id="leg-jump-right">
        <path
          d="M35 115 L85 165 C95 175 90 188 78 195 L55 205 C42 210 35 200 32 188 L10 125 Z"
          fill={pantsColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <rect
          x="45"
          y="180"
          width="50"
          height="18"
          rx="9"
          transform="rotate(-25 70 189)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Right Shoe */}
        <path
          d="M60 198 C48 208 42 225 55 235 C75 250 105 252 118 235 C130 215 125 195 115 190 Z"
          fill={bootColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <path
          d="M55 245 C85 255 115 240 122 215 Z"
          fill={soleColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* 2. Main Torso */}
      <g id="torso">
        <path
          d="M-85 0 C-95 25 -100 80 -80 120 C-40 130 40 130 80 120 C100 80 95 25 85 0 C50 -10 -50 -10 -85 0 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <path
          d="M-80 112 C-40 125 40 125 80 112 C82 124 74 136 68 140 C30 148 -30 148 -68 140 C-74 136 -82 124 -80 112 Z"
          fill={isColor ? '#1D4ED8' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <path
          d="M-55 -4 C-30 14 30 14 55 -4 C60 -18 -60 -18 -55 -4 Z"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>

      {/* 3. Symbol on Chest */}
      <SymbolRenderer id={symbol} mode={mode} x={0} y={55} scale={1.15} />

      {/* 4. Both Arms Raised High Joyfully (Y-shape celebrating) */}
      {/* Left Arm Raised */}
      <g id="arm-jump-left">
        <path
          d="M-80 15 C-110 5 -145 -10 -170 -35 C-182 -25 -186 -12 -174 2 C-145 25 -110 40 -85 45 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <rect
          x="-174"
          y="-36"
          width="20"
          height="38"
          rx="10"
          transform="rotate(-35 -164 -17)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <path
          d="M-174 -44 C-185 -55 -195 -68 -206 -62 C-218 -55 -210 -40 -216 -32 C-224 -24 -220 -10 -206 -4 C-192 2 -180 5 -168 -10 C-162 -20 -165 -35 -174 -44 Z"
          fill={skinColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>

      {/* Right Arm Raised */}
      <g id="arm-jump-right">
        <path
          d="M80 15 C110 5 145 -10 170 -35 C182 -25 186 -12 174 2 C145 25 110 40 85 45 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <rect
          x="154"
          y="-36"
          width="20"
          height="38"
          rx="10"
          transform="rotate(35 164 -17)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <path
          d="M174 -44 C185 -55 195 -68 206 -62 C218 -55 210 -40 216 -32 C224 -24 220 -10 206 -4 C192 2 180 5 168 -10 C162 -20 165 -35 174 -44 Z"
          fill={skinColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
};
