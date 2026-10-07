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

export const HeroPose: React.FC<PoseProps> = ({
  mode,
  symbol,
  x = 425,
  y = 560,
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
    <g id="pose-hero" transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* 1. Symmetrical Grounded Legs */}
      {/* Left Leg */}
      <g id="leg-left">
        <path
          d="M-50 120 L-65 185 C-65 195 -50 205 -35 205 L-12 205 L-8 125 Z"
          fill={pantsColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <rect
          x="-68"
          y="185"
          width="60"
          height="18"
          rx="9"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Left Boot */}
        <path
          d="M-82 205 C-92 205 -98 220 -92 245 C-85 265 -55 265 -20 265 C-5 265 0 248 -5 230 C-10 215 -25 205 -45 205 Z"
          fill={bootColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <path
          d="M-92 245 C-85 268 -50 272 -18 272 C-2 272 2 260 -2 245 Z"
          fill={soleColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* Right Leg */}
      <g id="leg-right">
        <path
          d="M50 120 L65 185 C65 195 50 205 35 205 L12 205 L8 125 Z"
          fill={pantsColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <rect
          x="8"
          y="185"
          width="60"
          height="18"
          rx="9"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Right Boot */}
        <path
          d="M82 205 C92 205 98 220 92 245 C85 265 55 265 20 265 C5 265 0 248 5 230 C10 215 25 205 45 205 Z"
          fill={bootColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <path
          d="M92 245 C85 268 50 272 18 272 C2 272 -2 260 2 245 Z"
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

      {/* 4. Left Arm (Grounded ready pose) */}
      <g id="arm-left">
        <path
          d="M-82 15 C-110 40 -125 85 -112 135 C-100 140 -90 138 -80 126 C-90 85 -80 50 -68 25 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <rect
          x="-120"
          y="126"
          width="40"
          height="16"
          rx="8"
          transform="rotate(-20 -100 134)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <path
          d="M-122 142 C-135 155 -132 176 -118 185 C-105 192 -90 186 -85 174 C-80 162 -90 148 -100 142 Z"
          fill={skinColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>

      {/* 5. Right Arm (Grounded ready pose) */}
      <g id="arm-right">
        <path
          d="M82 15 C110 40 125 85 112 135 C100 140 90 138 80 126 C90 85 80 50 68 25 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <rect
          x="80"
          y="126"
          width="40"
          height="16"
          rx="8"
          transform="rotate(20 100 134)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <path
          d="M122 142 C135 155 132 176 118 185 C105 192 90 186 85 174 C80 162 90 148 100 142 Z"
          fill={skinColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
};
