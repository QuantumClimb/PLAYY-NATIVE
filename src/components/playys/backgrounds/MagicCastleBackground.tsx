import React from 'react';
import { RenderMode } from '../../../lib/playys/types';

interface BackgroundProps {
  mode: RenderMode;
}

export const MagicCastleBackground: React.FC<BackgroundProps> = ({ mode }) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3;

  return (
    <g id="bg-magic-castle">
      <rect x="0" y="0" width="850" height="1100" fill={isColor ? '#E0E7FF' : '#FFFFFF'} />

      {/* Rainbow in the sky */}
      <g id="rainbow" transform="translate(425, 450)">
        <path d="M-360 0 C-360 -260 360 -260 360 0" fill="none" stroke={isColor ? '#F43F5E' : stroke} strokeWidth={isColor ? 18 : 3} />
        <path d="M-340 0 C-340 -240 340 -240 340 0" fill="none" stroke={isColor ? '#FBBF24' : stroke} strokeWidth={isColor ? 18 : 3} />
        <path d="M-320 0 C-320 -220 320 -220 320 0" fill="none" stroke={isColor ? '#34D399' : stroke} strokeWidth={isColor ? 18 : 3} />
        <path d="M-300 0 C-300 -200 300 -200 300 0" fill="none" stroke={isColor ? '#60A5FA' : stroke} strokeWidth={isColor ? 18 : 3} />
        <path d="M-280 0 C-280 -180 280 -180 280 0" fill="none" stroke={isColor ? '#A855F7' : stroke} strokeWidth={isColor ? 18 : 3} />
      </g>

      {/* Fluffy clouds with smiles */}
      <g id="castle-clouds">
        <path
          d="M60 140 C40 140 30 115 50 95 C40 70 65 40 100 45 C120 15 170 15 190 45 C215 35 245 60 235 90 C255 105 245 140 215 140 Z"
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <path
          d="M650 160 C630 160 620 135 640 115 C630 90 655 60 690 65 C710 35 760 35 780 65 C805 55 835 80 825 110 C845 125 835 160 805 160 Z"
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* Huge Fairytale Magic Castle in the background */}
      <g id="grand-castle" transform="translate(425, 480)">
        {/* Mountain/Hill Base */}
        <path
          d="M-350 200 C-250 80 -100 60 0 60 C100 60 250 80 350 200 Z"
          fill={isColor ? '#C084FC' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Main Central Tower */}
        <rect x="-65" y="-120" width="130" height="150" fill={isColor ? '#F5D0FE' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <path d="M-80 -120 L0 -240 L80 -120 Z" fill={isColor ? '#9333EA' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <line x1="0" y1="-240" x2="0" y2="-275" stroke={stroke} strokeWidth={3} />
        <path d="M0 -275 L35 -260 L0 -245 Z" fill={isColor ? '#FDE047' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />

        {/* Left Side Tower */}
        <rect x="-170" y="-80" width="80" height="120" fill={isColor ? '#F5D0FE' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <path d="M-180 -80 L-130 -170 L-80 -80 Z" fill={isColor ? '#EC4899' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <line x1="-130" y1="-170" x2="-130" y2="-200" stroke={stroke} strokeWidth={2.5} />
        <path d="M-130 -200 L-105 -188 L-130 -176 Z" fill={isColor ? '#FDE047' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />

        {/* Right Side Tower */}
        <rect x="90" y="-80" width="80" height="120" fill={isColor ? '#F5D0FE' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <path d="M80 -80 L130 -170 L180 -80 Z" fill={isColor ? '#EC4899' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <line x1="130" y1="-170" x2="130" y2="-200" stroke={stroke} strokeWidth={2.5} />
        <path d="M130 -200 L155 -188 L130 -176 Z" fill={isColor ? '#FDE047' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />

        {/* Main Castle Gate Door */}
        <path d="M-30 30 L-30 -25 C-30 -50 30 -50 30 -25 L30 30 Z" fill={isColor ? '#581C87' : '#FFFFFF'} stroke={stroke} strokeWidth={3} />
        <circle cx="16" cy="2" r="3.5" fill={isColor ? '#FDE047' : stroke} />
      </g>

      {/* Stone Bridge & Sparkling Water */}
      <g id="stone-bridge">
        <path
          d="M0 720 C200 700 650 700 850 720 L850 820 L0 820 Z"
          fill={isColor ? '#38BDF8' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Stone Path */}
        <path
          d="M320 710 L530 710 L590 1100 L260 1100 Z"
          fill={isColor ? '#E2E8F0' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Stone Pavers */}
        <rect x="360" y="760" width="60" height="25" rx="6" fill={isColor ? '#CBD5E1' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <rect x="440" y="760" width="55" height="25" rx="6" fill={isColor ? '#CBD5E1' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <rect x="330" y="840" width="70" height="30" rx="8" fill={isColor ? '#CBD5E1' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <rect x="420" y="840" width="75" height="30" rx="8" fill={isColor ? '#CBD5E1' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
      </g>

      {/* Foreground Rose bushes and flower pots */}
      <g id="foreground-magic">
        <path d="M-20 1100 C-20 950 120 950 160 1100 Z" fill={isColor ? '#A855F7' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <path d="M700 1100 C740 950 880 950 880 1100 Z" fill={isColor ? '#A855F7' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        <circle cx="80" cy="1000" r="16" fill={isColor ? '#F472B6' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
        <circle cx="780" cy="1000" r="16" fill={isColor ? '#F472B6' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
      </g>
    </g>
  );
};
