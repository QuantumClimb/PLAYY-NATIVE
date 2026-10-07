import React from 'react';
import Svg, { G, Path, Rect, Circle, Ellipse, Text as SvgText } from 'react-native-svg';
import { PlayyConfig } from '../types';

interface PlayySvgProps {
  config: PlayyConfig;
  mode: 'color' | 'coloring';
  width?: number;
  height?: number;
}

export const PlayySvg: React.FC<PlayySvgProps> = ({
  config,
  mode,
  width = 300,
  height = 380,
}) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3.5;

  return (
    <Svg width={width} height={height} viewBox="0 0 850 1100">
      {/* Background layer */}
      {config.background === 'happy-hills' && (
        <G id="bg-hills">
          <Rect width="850" height="1100" fill={isColor ? '#E0F2FE' : '#FFFFFF'} />
          <Path
            d="M-50 800 Q 200 680, 500 760 T 900 720 L 900 1100 L -50 1100 Z"
            fill={isColor ? '#86EFAC' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M-50 880 Q 300 800, 600 860 T 900 830 L 900 1100 L -50 1100 Z"
            fill={isColor ? '#4ADE80' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </G>
      )}

      {config.background === 'space-world' && (
        <G id="bg-space">
          <Rect width="850" height="1100" fill={isColor ? '#1E1B4B' : '#FFFFFF'} />
          <Circle cx="150" cy="200" r="40" fill={isColor ? '#F59E0B' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
          <Circle cx="720" cy="300" r="60" fill={isColor ? '#EC4899' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        </G>
      )}

      {/* Character Pose */}
      <G id="pose" transform="translate(425, 560)">
        <Rect
          x="-90"
          y="0"
          width="180"
          height="190"
          rx="45"
          fill={isColor ? '#3B82F6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Chest Symbol Emblem */}
        <Circle cx="0" cy="70" r="34" fill={isColor ? '#FEF08A' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <SvgText
          x="0"
          y="80"
          fontSize="28"
          textAnchor="middle"
          fill={isColor ? '#D97706' : '#111827'}
        >
          {config.symbol === 'star' ? '★' : config.symbol === 'heart' ? '♥' : '⚡'}
        </SvgText>
      </G>

      {/* Character Head */}
      <G id="head" transform="translate(425, 440)">
        <Ellipse
          cx="0"
          cy="0"
          rx="88"
          ry="82"
          fill={isColor ? '#2563EB' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <Ellipse
          cx="0"
          cy="4"
          rx="78"
          ry="72"
          fill={isColor ? '#FFF1F2' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Eyes */}
        <Circle cx="-30" cy="-2" r="8" fill="#111827" />
        <Circle cx="30" cy="-2" r="8" fill="#111827" />
        {/* Smile */}
        <Path
          d="M-24 24 Q 0 44, 24 24"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};
