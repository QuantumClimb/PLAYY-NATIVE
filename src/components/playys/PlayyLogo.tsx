import React from 'react';
import { RenderMode } from '../../lib/playys/types';

interface PlayyLogoProps {
  mode?: RenderMode;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const PlayyLogo: React.FC<PlayyLogoProps> = ({
  mode = 'color',
  size = 'md',
  showSubtitle = true,
}) => {
  const isColor = mode === 'color';
  const stroke = '#111827';

  // Responsive scaling
  const scale = size === 'sm' ? 0.65 : size === 'lg' ? 1.2 : 0.95;

  return (
    <div className="inline-flex flex-col items-center select-none">
      <svg
        viewBox="0 0 340 90"
        style={{ width: `${340 * scale}px`, height: `${90 * scale}px` }}
        className="overflow-visible filter drop-shadow-sm"
      >
        <defs>
          <filter id="logo-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>

        <g id="playys-letters" filter={isColor ? 'url(#logo-shadow)' : undefined}>
          {/* P */}
          <g id="letter-P" transform="translate(20, 10)">
            <path
              d="M12 65 L12 12 C12 6 18 0 26 0 L40 0 C54 0 65 10 65 24 C65 38 54 48 40 48 L28 48 L28 65 C28 70 24 74 18 74 C14 74 12 70 12 65 Z"
              fill={isColor ? '#EC4899' : '#FFFFFF'}
              stroke={stroke}
              strokeWidth={isColor ? 4.5 : 4}
              strokeLinejoin="round"
            />
            {/* P inner hole */}
            <path
              d="M28 14 L38 14 C44 14 48 18 48 24 C48 30 44 34 38 34 L28 34 Z"
              fill={isColor ? '#FDF2F8' : '#FFFFFF'}
              stroke={stroke}
              strokeWidth={3}
            />
          </g>

          {/* L */}
          <g id="letter-L" transform="translate(85, 10)">
            <path
              d="M12 65 L12 12 C12 6 18 0 24 0 C30 0 36 6 36 12 L36 50 L58 50 C64 50 70 56 70 62 C70 68 64 74 58 74 L24 74 C16 74 12 70 12 65 Z"
              fill={isColor ? '#06B6D4' : '#FFFFFF'}
              stroke={stroke}
              strokeWidth={isColor ? 4.5 : 4}
              strokeLinejoin="round"
            />
          </g>

          {/* A */}
          <g id="letter-A" transform="translate(142, 10)">
            <path
              d="M32 0 C40 0 46 6 50 14 L68 60 C71 67 66 74 58 74 C52 74 48 70 46 64 L41 50 L23 50 L18 64 C16 70 12 74 6 74 C-2 74 -6 67 -3 60 L14 14 C18 6 24 0 32 0 Z"
              fill={isColor ? '#FACC15' : '#FFFFFF'}
              stroke={stroke}
              strokeWidth={isColor ? 4.5 : 4}
              strokeLinejoin="round"
            />
            {/* A inner hole */}
            <path
              d="M32 18 L26 36 L38 36 Z"
              fill={isColor ? '#FEF08A' : '#FFFFFF'}
              stroke={stroke}
              strokeWidth={3}
            />
          </g>

          {/* Y1 */}
          <g id="letter-Y1" transform="translate(202, 10)">
            <path
              d="M10 8 C10 2 16 -3 22 2 L34 22 L46 2 C52 -3 58 2 58 8 L44 32 L44 65 C44 70 40 74 34 74 C28 74 24 70 24 65 L24 32 L10 8 Z"
              fill={isColor ? '#F97316' : '#FFFFFF'}
              stroke={stroke}
              strokeWidth={isColor ? 4.5 : 4}
              strokeLinejoin="round"
            />
          </g>

          {/* Y2 */}
          <g id="letter-Y2" transform="translate(252, 10)">
            <path
              d="M10 8 C10 2 16 -3 22 2 L34 22 L46 2 C52 -3 58 2 58 8 L44 32 L44 65 C44 70 40 74 34 74 C28 74 24 70 24 65 L24 32 L10 8 Z"
              fill={isColor ? '#84CC16' : '#FFFFFF'}
              stroke={stroke}
              strokeWidth={isColor ? 4.5 : 4}
              strokeLinejoin="round"
            />
          </g>

          {/* S */}
          <g id="letter-S" transform="translate(295, 10)">
            <path
              d="M35 12 C35 6 29 2 22 2 C12 2 4 10 4 20 C4 32 18 36 26 40 C34 44 40 50 40 60 C40 70 30 76 18 76 C8 76 0 70 0 60 C0 54 6 50 12 50 C18 50 24 56 30 56 C34 56 36 54 36 50 C36 44 26 40 18 36 C10 32 0 26 0 16 C0 6 10 -4 22 -4 C32 -4 40 2 40 12 Z"
              fill={isColor ? '#A855F7' : '#FFFFFF'}
              stroke={stroke}
              strokeWidth={isColor ? 4.5 : 4}
              strokeLinejoin="round"
            />
          </g>

          {/* Sparkle Star at Top Right */}
          <g id="sparkle-star" transform="translate(325, 6) rotate(15)">
            <path
              d="M0 -14 L3 -4 L13 -4 L5 2 L8 12 L0 6 L-8 12 L-5 2 L-13 -4 L-3 -4 Z"
              fill={isColor ? '#FACC15' : '#FFFFFF'}
              stroke={stroke}
              strokeWidth={2.5}
            />
          </g>
        </g>
      </svg>

      {showSubtitle && (
        <span
          className={`text-xs font-bold tracking-wider -mt-1 ${
            isColor ? 'text-indigo-900' : 'text-gray-900'
          }`}
          style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
        >
          Imagine <span className="text-yellow-500">☆</span> Create{' '}
          <span className="text-pink-500">☆</span> Color{' '}
          <span className="text-cyan-500">☆</span> Play
        </span>
      )}
    </div>
  );
};
