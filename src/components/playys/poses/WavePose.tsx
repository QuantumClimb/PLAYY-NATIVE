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

export const WavePose: React.FC<PoseProps> = ({
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
    <g id="pose-wave" transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* 1. Legs & Feet (Behind or base) */}
      {/* Left Back Leg & Foot (stepping back/side) */}
      <g id="leg-left">
        <path
          d="M-45 120 L-65 190 C-65 200 -55 210 -40 210 L-20 210 C-10 210 -5 200 -5 190 L-10 125 Z"
          fill={pantsColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Pant Cuff */}
        <rect
          x="-66"
          y="188"
          width="62"
          height="16"
          rx="8"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Left Shoe */}
        <path
          d="M-75 204
             C-85 204 -95 215 -90 235
             C-90 250 -70 255 -30 255
             C-5 255 0 245 -5 228
             C-10 212 -25 204 -45 204 Z"
          fill={bootColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Shoe Sole */}
        <path
          d="M-92 242 C-90 258 -65 262 -28 262 C0 262 2 254 -2 242 Z"
          fill={soleColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>

      {/* Right Front Leg & Foot (stepping forward proudly - from reference coloring page) */}
      <g id="leg-right">
        <path
          d="M10 120 L5 180 C5 192 18 202 36 202 L70 202 C85 202 92 192 90 180 L75 120 Z"
          fill={pantsColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Pant Cuff */}
        <rect
          x="6"
          y="182"
          width="82"
          height="20"
          rx="10"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Right Chunky Sneaker */}
        <path
          d="M0 202
             C-15 202 -20 220 -15 242
             C-10 265 15 285 58 285
             C100 285 115 260 110 238
             C105 215 90 202 70 202 Z"
          fill={bootColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Toe Cap / Curved Line */}
        <path
          d="M-10 232 C10 230 45 240 70 242"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Thick Sneaker Sole */}
        <path
          d="M-18 255 C-12 288 20 295 62 295 C105 295 116 275 110 255 Z"
          fill={soleColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>

      {/* 2. Main Body Torso (Hoodie) */}
      <g id="torso">
        <path
          d="M-85 0
             C-95 25 -100 80 -80 120
             C-40 130 40 130 80 120
             C100 80 95 25 85 0
             C50 -10 -50 -10 -85 0 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Ribbed Bottom Hem of Hoodie */}
        <path
          d="M-80 112 C-40 125 40 125 80 112 C82 124 74 136 68 140 C30 148 -30 148 -68 140 C-74 136 -82 124 -80 112 Z"
          fill={isColor ? '#1D4ED8' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Neck Ribbing / Collar */}
        <path
          d="M-55 -4 C-30 14 30 14 55 -4 C60 -18 -60 -18 -55 -4 Z"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Hoodie Center Kangaroo Pocket Stitching */}
        <path
          d="M-50 70 C-30 85 30 85 50 70 L42 110 C25 118 -25 118 -42 110 Z"
          fill="none"
          stroke={isColor ? '#1E40AF' : stroke}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </g>

      {/* 3. Symbol on Chest */}
      <SymbolRenderer id={symbol} mode={mode} x={0} y={55} scale={1.15} />

      {/* 4. Left Arm (Down by hip with clenched/relaxed mitten hand) */}
      <g id="arm-down-rightside">
        {/* Sleeve */}
        <path
          d="M-85 15 C-115 45 -135 85 -118 135 C-105 142 -95 142 -85 130 C-95 90 -85 55 -70 25 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Sleeve Cuff */}
        <rect
          x="-126"
          y="126"
          width="40"
          height="16"
          rx="8"
          transform="rotate(-25 -106 134)"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Mitten Cartoon Hand */}
        <path
          d="M-132 142
             C-145 155 -145 178 -130 188
             C-115 198 -95 192 -88 178
             C-82 165 -92 150 -105 142 Z"
          fill={skinColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Thumb line */}
        <path
          d="M-115 158 C-118 170 -124 175 -130 172"
          fill="none"
          stroke={stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </g>

      {/* 5. Right Arm (High in the air WAVING happily!) */}
      <g id="arm-waving-leftside">
        {/* Sleeve reaching up and out */}
        <path
          d="M80 15 C110 5 145 -10 170 -35 C182 -25 186 -12 174 2 C145 25 110 40 85 45 Z"
          fill={hoodieColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Sleeve Cuff */}
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
        {/* Waving Mitten Hand with Thumb & 4 Fingers */}
        <path
          d="M174 -44
             C185 -55 195 -68 206 -62
             C218 -55 210 -40 216 -32
             C224 -24 220 -10 206 -4
             C192 2 180 5 168 -10
             C162 -20 165 -35 174 -44 Z"
          fill={skinColor}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Palm & Thumb Crease */}
        <path
          d="M182 -32 C192 -26 195 -18 190 -10"
          fill="none"
          stroke={stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};
