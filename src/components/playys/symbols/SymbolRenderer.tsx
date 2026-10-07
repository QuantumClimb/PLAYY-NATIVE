import React from 'react';
import { SymbolId, RenderMode } from '../../../lib/playys/types';

interface SymbolRendererProps {
  id: SymbolId;
  mode: RenderMode;
  x?: number;
  y?: number;
  scale?: number;
}

export const SymbolRenderer: React.FC<SymbolRendererProps> = ({
  id,
  mode,
  x = 0,
  y = 0,
  scale = 1,
}) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {id === 'star' && (
        <g id="symbol-star">
          {/* Outer Star */}
          <path
            d="M0 -32 L9 -10 L32 -9 L15 8 L21 31 L0 18 L-21 31 L-15 8 L-32 -9 L-9 -10 Z"
            fill={isColor ? '#3B82F6' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Inner Star */}
          <path
            d="M0 -20 L5 -6 L20 -5 L9 5 L13 20 L0 11 L-13 20 L-9 5 L-20 -5 L-5 -6 Z"
            fill={isColor ? '#93C5FD' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={isColor ? 2 : 2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      )}

      {id === 'cloud' && (
        <g id="symbol-cloud">
          <path
            d="M-22 14 C-30 14 -34 6 -28 -2 C-32 -14 -16 -22 -6 -16 C-2 -26 18 -26 22 -14 C32 -16 36 -2 30 6 C36 12 30 20 22 20 C18 20 -20 20 -22 14 Z"
            fill={isColor ? '#60A5FA' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Cute cloud inner smile */}
          <path
            d="M-6 2 Q0 8 6 2"
            fill="none"
            stroke={isColor ? '#1E3A8A' : stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>
      )}

      {id === 'flame' && (
        <g id="symbol-flame">
          <path
            d="M0 -30 C12 -18 26 -8 22 10 C18 26 -2 30 -12 24 C-24 16 -24 -2 -14 -12 C-14 -2 -4 -6 -2 -14 C0 -22 -2 -26 0 -30 Z"
            fill={isColor ? '#EF4444' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M-2 2 C4 8 10 12 8 20 C6 24 -2 26 -6 22 C-10 18 -8 10 -4 6 Z"
            fill={isColor ? '#FBBF24' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </g>
      )}

      {id === 'heart' && (
        <g id="symbol-heart">
          <path
            d="M0 24 C-20 10 -30 -6 -24 -18 C-18 -28 -4 -22 0 -12 C4 -22 18 -28 24 -18 C30 -6 20 10 0 24 Z"
            fill={isColor ? '#EC4899' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {isColor && (
            <path
              d="M-12 -16 C-18 -12 -18 -6 -14 0"
              fill="none"
              stroke="#FDF2F8"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )}
        </g>
      )}

      {id === 'lightning' && (
        <g id="symbol-lightning">
          <path
            d="M4 -30 L-18 0 L-2 2 L-10 30 L18 -2 L2 -4 Z"
            fill={isColor ? '#EAB308' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      )}

      {id === 'moon' && (
        <g id="symbol-moon">
          <path
            d="M-4 -28 C14 -24 24 -10 20 10 C16 26 0 32 -16 28 C2 24 8 12 4 -4 C0 -16 -12 -22 -4 -28 Z"
            fill={isColor ? '#8B5CF6' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="16" cy="-14" r="3" fill={isColor ? '#DDD6FE' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        </g>
      )}

      {id === 'paw' && (
        <g id="symbol-paw">
          {/* Main paw pad */}
          <path
            d="M0 22 C-14 22 -20 12 -14 2 C-10 -4 10 -4 14 2 C20 12 14 22 0 22 Z"
            fill={isColor ? '#6366F1' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* 4 Toes */}
          <ellipse cx="-16" cy="-10" rx="5" ry="7" fill={isColor ? '#818CF8' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <ellipse cx="-6" cy="-18" rx="5.5" ry="8" fill={isColor ? '#818CF8' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <ellipse cx="6" cy="-18" rx="5.5" ry="8" fill={isColor ? '#818CF8' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <ellipse cx="16" cy="-10" rx="5" ry="7" fill={isColor ? '#818CF8' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
        </g>
      )}

      {id === 'gear' && (
        <g id="symbol-gear">
          <path
            d="M-6 -26 L6 -26 L8 -20 L16 -16 L22 -20 L28 -14 L24 -8 L28 0 L32 6 L28 14 L20 12 L16 18 L18 26 L10 28 L6 22 L-6 22 L-10 28 L-18 26 L-16 18 L-20 12 L-28 14 L-32 6 L-28 0 L-24 -8 L-28 -14 L-22 -20 L-16 -16 L-8 -20 Z"
            fill={isColor ? '#64748B' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <circle cx="0" cy="0" r="8" fill={isColor ? '#CBD5E1' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
        </g>
      )}

      {id === 'crown' && (
        <g id="symbol-crown">
          <path
            d="M-24 16 L24 16 L22 -10 L10 2 L0 -18 L-10 2 L-22 -10 Z"
            fill={isColor ? '#F59E0B' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="-22" cy="-12" r="3" fill={isColor ? '#FDE68A' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
          <circle cx="0" cy="-20" r="3.5" fill={isColor ? '#FDE68A' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
          <circle cx="22" cy="-12" r="3" fill={isColor ? '#FDE68A' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        </g>
      )}
    </g>
  );
};
