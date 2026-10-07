import React from 'react';
import { RenderMode } from '../../../lib/playys/types';

interface BackgroundProps {
  mode: RenderMode;
}

export const SpaceWorldBackground: React.FC<BackgroundProps> = ({ mode }) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3;

  return (
    <g id="bg-space-world">
      <rect x="0" y="0" width="850" height="1100" fill={isColor ? '#0F172A' : '#FFFFFF'} />

      {/* Twinkling Stars in Space */}
      <g id="space-stars">
        {[
          { x: 120, y: 100, s: 0.8 },
          { x: 260, y: 160, s: 0.6 },
          { x: 740, y: 80, s: 0.9 },
          { x: 620, y: 220, s: 0.7 },
          { x: 180, y: 320, s: 0.5 },
          { x: 780, y: 380, s: 0.8 },
          { x: 80, y: 550, s: 0.6 },
          { x: 750, y: 620, s: 0.7 },
        ].map((star, idx) => (
          <path
            key={idx}
            d={`M${star.x} ${star.y - 18 * star.s} L${star.x + 5 * star.s} ${star.y - 5 * star.s} L${star.x + 18 * star.s} ${star.y} L${star.x + 5 * star.s} ${star.y + 5 * star.s} L${star.x} ${star.y + 18 * star.s} L${star.x - 5 * star.s} ${star.y + 5 * star.s} L${star.x - 18 * star.s} ${star.y} L${star.x - 5 * star.s} ${star.y - 5 * star.s} Z`}
            fill={isColor ? '#FDE047' : '#FFFFFF'}
            stroke={stroke}
            strokeWidth={2}
          />
        ))}
      </g>

      {/* Saturn-Style Giant Ringed Planet (Top Left) */}
      <g id="ringed-planet" transform="translate(180, 220)">
        {/* Planet sphere */}
        <circle cx="0" cy="0" r="70" fill={isColor ? '#F472B6' : '#FFFFFF'} stroke={stroke} strokeWidth={strokeWidth} />
        {/* Striping */}
        <path d="M-60 10 Q0 -20 60 10" fill="none" stroke={isColor ? '#EC4899' : stroke} strokeWidth={4} />
        {/* Ring */}
        <ellipse
          cx="0"
          cy="0"
          rx="125"
          ry="32"
          transform="rotate(-22)"
          fill="none"
          stroke={isColor ? '#A855F7' : stroke}
          strokeWidth={strokeWidth + 2}
        />
        {/* Craters */}
        <circle cx="-25" cy="-28" r="8" fill={isColor ? '#FDF2F8' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <circle cx="20" cy="30" r="11" fill={isColor ? '#FDF2F8' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
      </g>

      {/* Friendly Crescent Moon with Sleepy Eye (Top Right) */}
      <g id="crescent-moon" transform="translate(700, 180)">
        <path
          d="M0 -60 C45 -40 60 10 35 55 C10 95 -45 80 -60 45 C-15 45 15 15 0 -60 Z"
          fill={isColor ? '#FDE047' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Cute closed eye */}
        <path d="M-6 8 Q0 16 6 8" fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      </g>

      {/* Cute Cartoon Rocket Flying */}
      <g id="rocket" transform="translate(420, 140) rotate(30)">
        {/* Flames */}
        <path d="M-12 50 L0 80 L12 50 Z" fill={isColor ? '#EF4444' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <path d="M-6 50 L0 68 L6 50 Z" fill={isColor ? '#FBBF24' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        {/* Rocket Body */}
        <path
          d="M0 -45 C25 -10 25 30 20 50 L-20 50 C-25 30 -25 -10 0 -45 Z"
          fill={isColor ? '#E0E7FF' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Fins */}
        <path d="M-20 30 L-40 55 L-20 50 Z" fill={isColor ? '#EF4444' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <path d="M20 30 L40 55 L20 50 Z" fill={isColor ? '#EF4444' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        {/* Window */}
        <circle cx="0" cy="5" r="12" fill={isColor ? '#38BDF8' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
      </g>

      {/* Floating Space Asteroid Platforms */}
      <g id="space-platforms">
        {/* Left Floating Rock */}
        <path
          d="M-30 680 C30 650 150 660 200 700 C180 750 100 770 -30 740 Z"
          fill={isColor ? '#475569' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Right Floating Rock */}
        <path
          d="M650 690 C720 660 840 660 880 700 C880 760 760 770 650 720 Z"
          fill={isColor ? '#475569' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* Moon Crater Surface (Foreground) */}
      <g id="moon-surface">
        <path
          d="M-20 820 C180 760 670 760 870 820 L870 1100 L-20 1100 Z"
          fill={isColor ? '#334155' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Giant Moon Craters to color */}
        <ellipse cx="180" cy="920" rx="75" ry="32" fill={isColor ? '#1E293B' : '#FFFFFF'} stroke={stroke} strokeWidth={3} />
        <ellipse cx="680" cy="940" rx="90" ry="38" fill={isColor ? '#1E293B' : '#FFFFFF'} stroke={stroke} strokeWidth={3} />
        <ellipse cx="425" cy="1020" rx="110" ry="42" fill={isColor ? '#1E293B' : '#FFFFFF'} stroke={stroke} strokeWidth={3} />
      </g>
    </g>
  );
};
