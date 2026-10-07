import React from 'react';
import { RenderMode } from '../../../lib/playys/types';

interface BackgroundProps {
  mode: RenderMode;
}

export const CloudKingdomBackground: React.FC<BackgroundProps> = ({ mode }) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3;

  return (
    <g id="bg-cloud-kingdom">
      <rect x="0" y="0" width="850" height="1100" fill={isColor ? '#BAE6FD' : '#FFFFFF'} />

      {/* Floating Rainbow Slide */}
      <g id="rainbow-slide" transform="translate(425, 380)">
        <path d="M-400 300 C-200 0 100 -120 400 -20" fill="none" stroke={isColor ? '#F43F5E' : stroke} strokeWidth={isColor ? 14 : 3} />
        <path d="M-400 320 C-200 20 100 -100 400 0" fill="none" stroke={isColor ? '#FBBF24' : stroke} strokeWidth={isColor ? 14 : 3} />
        <path d="M-400 340 C-200 40 100 -80 400 20" fill="none" stroke={isColor ? '#34D399' : stroke} strokeWidth={isColor ? 14 : 3} />
        <path d="M-400 360 C-200 60 100 -60 400 40" fill="none" stroke={isColor ? '#60A5FA' : stroke} strokeWidth={isColor ? 14 : 3} />
        <path d="M-400 380 C-200 80 100 -40 400 60" fill="none" stroke={isColor ? '#C084FC' : stroke} strokeWidth={isColor ? 14 : 3} />
      </g>

      {/* Fluffy Floating Islands */}
      <g id="cloud-island-left" transform="translate(160, 480)">
        <path
          d="M-100 40 C-140 40 -150 0 -110 -20 C-130 -60 -70 -70 -40 -40 C-10 -70 50 -60 60 -30 C100 -40 120 0 90 30 C130 50 100 90 70 80 C40 100 -80 100 -100 40 Z"
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Star sticking out of cloud */}
        <path
          d="M-20 -50 L-14 -32 L4 -32 L-10 -22 L-5 -4 L-20 -15 L-35 -4 L-30 -22 L-44 -32 L-26 -32 Z"
          fill={isColor ? '#FDE047' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={2}
        />
      </g>

      <g id="cloud-island-right" transform="translate(680, 420)">
        <path
          d="M-90 30 C-120 30 -130 0 -100 -20 C-120 -50 -70 -60 -40 -30 C-10 -60 50 -50 60 -20 C90 -30 110 0 90 30 C120 50 90 80 60 70 C30 90 -70 90 -90 30 Z"
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* Floating Cloud Sea (Foreground) */}
      <g id="cloud-floor">
        <path
          d="M-20 850
             C-20 750 120 750 180 820
             C240 730 380 740 425 820
             C480 730 620 740 680 820
             C740 750 880 750 880 850
             L880 1100 L-20 1100 Z"
          fill={isColor ? '#F8FAFC' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Smiling Cloud faces in foreground */}
        <circle cx="280" cy="940" r="4" fill={stroke} />
        <circle cx="340" cy="940" r="4" fill={stroke} />
        <path d="M300 955 Q310 965 320 955" fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" />

        <circle cx="560" cy="920" r="4" fill={stroke} />
        <circle cx="620" cy="920" r="4" fill={stroke} />
        <path d="M580 935 Q590 945 600 935" fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
};
