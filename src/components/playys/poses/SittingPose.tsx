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

export const SittingPose: React.FC<PoseProps> = ({
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
    <g id="pose-sitting" transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* 1. Ground Shadow/Seat Base */}
      {isColor && (
        <ellipse cx="0" cy="180" rx="140" ry="25" fill="#1E3A8A" opacity="0.25" />
      )}

      {/* 2. Seated Torso & Pants Base */}
      <path
        d="M-90 100 C-110 140 -80 180 0 180 C80 180 110 140 90 100 Z"
        fill={pantsColor}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* 3. Main Torso (Hoodie) */}
      <g id="torso-sitting">
        <path
          d="M-82 0 C-92 25 -95 70 -80 105 C-40 115 40 115 80 105 C95 70 92 25 82 0 C50 -10 -50 -10 -82 0 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <path
          d="M-78 98 C-40 110 40 110 78 98 C80 110 72 122 65 125 C30 132 -30 132 -65 125 C-72 122 -80 110 -78 98 Z"
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

      {/* 4. Symbol on Chest */}
      <SymbolRenderer id={symbol} mode={mode} x={0} y={50} scale={1.1} />

      {/* 5. Seated Legs & Forward Chunky Boots */}
      {/* Left Boot & Cuff */}
      <g id="boot-sit-left">
        <rect
          x="-95"
          y="110"
          width="50"
          height="20"
          rx="10"
          transform="rotate(10 -70 120)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <ellipse
          cx="-65"
          cy="155"
          rx="42"
          ry="32"
          fill={bootColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Sole Tread */}
        <ellipse
          cx="-65"
          cy="162"
          rx="34"
          ry="20"
          fill={soleColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <circle cx="-65" cy="162" r="8" fill={isColor ? '#3B82F6' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
      </g>

      {/* Right Boot & Cuff */}
      <g id="boot-sit-right">
        <rect
          x="45"
          y="110"
          width="50"
          height="20"
          rx="10"
          transform="rotate(-10 70 120)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <ellipse
          cx="65"
          cy="155"
          rx="42"
          ry="32"
          fill={bootColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Sole Tread */}
        <ellipse
          cx="65"
          cy="162"
          rx="34"
          ry="20"
          fill={soleColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <circle cx="65" cy="162" r="8" fill={isColor ? '#3B82F6' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
      </g>

      {/* 6. Hands Resting Beside Legs / On Ground */}
      {/* Left Arm & Hand */}
      <g id="arm-sit-left">
        <path
          d="M-80 15 C-105 35 -120 70 -115 110 C-105 118 -95 115 -90 102 C-95 75 -85 45 -70 25 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <rect
          x="-122"
          y="102"
          width="32"
          height="16"
          rx="8"
          transform="rotate(-15 -106 110)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <circle
          cx="-118"
          cy="128"
          r="16"
          fill={skinColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* Right Arm & Hand */}
      <g id="arm-sit-right">
        <path
          d="M80 15 C105 35 120 70 115 110 C105 118 95 115 90 102 C95 75 85 45 70 25 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <rect
          x="90"
          y="102"
          width="32"
          height="16"
          rx="8"
          transform="rotate(15 106 110)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <circle
          cx="118"
          cy="128"
          r="16"
          fill={skinColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>
    </g>
  );
};
