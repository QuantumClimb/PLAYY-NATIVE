import React from 'react';
import { RenderMode } from '../../../lib/playys/types';

interface BackgroundProps {
  mode: RenderMode;
}

export const HappyHillsBackground: React.FC<BackgroundProps> = ({ mode }) => {
  const isColor = mode === 'color';
  const stroke = '#111827';
  const strokeWidth = 3;

  return (
    <g id="bg-happy-hills">
      {/* 1. Sky & Canvas Base */}
      <rect
        x="0"
        y="0"
        width="850"
        height="1100"
        fill={isColor ? '#7DD3FC' : '#FFFFFF'}
      />

      {/* 2. Cheerful Clouds with Cute Faces */}
      {/* Top Left Cloud */}
      <g id="cloud-top-left">
        <path
          d="M300 190
             C275 190 260 170 270 150
             C245 140 250 105 280 100
             C295 70 345 70 365 95
             C390 85 425 105 420 135
             C440 145 440 175 420 190 Z"
          fill={isColor ? '#FFFFFF' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Smiling Eyes & Mouth */}
        <circle cx="330" cy="140" r="3.5" fill={stroke} />
        <circle cx="360" cy="140" r="3.5" fill={stroke} />
        <path d="M340 152 Q345 158 350 152" fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      </g>

      {/* Top Right Big Cloud */}
      <g id="cloud-top-right">
        <path
          d="M620 120
             C580 120 560 90 580 60
             C550 40 565 -5 615 -5
             C640 -40 710 -40 740 0
             C780 -10 820 20 810 65
             C840 85 830 125 790 120 Z"
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <circle cx="680" cy="65" r="4.5" fill={stroke} />
        <circle cx="730" cy="65" r="4.5" fill={stroke} />
        <path d="M695 80 Q705 90 715 80" fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      </g>

      {/* Small Floating Cloud */}
      <g id="cloud-small">
        <path
          d="M580 200
             C560 200 550 185 560 170
             C545 155 555 135 575 135
             C590 120 625 120 640 135
             C655 135 670 150 665 170
             C675 185 665 200 645 200 Z"
          fill="#FFFFFF"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <circle cx="600" cy="165" r="2.5" fill={stroke} />
        <circle cx="620" cy="165" r="2.5" fill={stroke} />
        <path d="M606 172 Q610 176 614 172" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </g>

      {/* 3. Distant Tall Mario-Style Hills with Eyes */}
      <g id="distant-hills">
        {/* Left Tall Hill */}
        <path
          d="M20 500
             C20 250 160 250 160 500
             L160 580 L20 580 Z"
          fill={isColor ? '#86EFAC' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Hill Eyes */}
        <ellipse cx="68" cy="330" rx="6" ry="14" fill={stroke} />
        <circle cx="68" cy="326" r="2" fill="#FFFFFF" />
        <ellipse cx="112" cy="330" rx="6" ry="14" fill={stroke} />
        <circle cx="112" cy="326" r="2" fill="#FFFFFF" />

        {/* Medium Hill */}
        <path
          d="M130 500
             C130 350 240 350 240 500
             L240 580 L130 580 Z"
          fill={isColor ? '#4ADE80' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </g>

      {/* 4. Floating Question Mark Block [ ? ] */}
      <g id="question-block" transform="translate(680, 260)">
        <rect
          x="-45"
          y="-45"
          width="90"
          height="90"
          rx="12"
          fill={isColor ? '#FACC15' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth + 0.5}
        />
        {/* Inner border bevel */}
        <rect
          x="-37"
          y="-37"
          width="74"
          height="74"
          rx="8"
          fill="none"
          stroke={isColor ? '#CA8A04' : stroke}
          strokeWidth={2}
        />
        {/* Corner Rivets */}
        <circle cx="-30" cy="-30" r="3.5" fill={isColor ? '#78350F' : stroke} />
        <circle cx="30" cy="-30" r="3.5" fill={isColor ? '#78350F' : stroke} />
        <circle cx="-30" cy="30" r="3.5" fill={isColor ? '#78350F' : stroke} />
        <circle cx="30" cy="30" r="3.5" fill={isColor ? '#78350F' : stroke} />
        {/* Question Mark */}
        <path
          d="M-14 -16
             C-14 -30 14 -30 14 -16
             C14 -6 0 -4 0 6"
          fill="none"
          stroke={stroke}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <circle cx="0" cy="18" r="4.5" fill={stroke} />
      </g>

      {/* 5. Cute Fairytale Castle on the Right Hill */}
      <g id="castle-right" transform="translate(740, 480)">
        {/* Castle Hill Mount */}
        <path
          d="M-100 120 C-60 20 60 20 100 120 Z"
          fill={isColor ? '#22C55E' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Castle Wall Base */}
        <rect
          x="-45"
          y="0"
          width="90"
          height="70"
          fill={isColor ? '#FDF4FF' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Arched Door */}
        <path
          d="M-14 70 L-14 36 C-14 20 14 20 14 36 L14 70 Z"
          fill={isColor ? '#701A75' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={2.5}
        />
        {/* Central Spire Tower */}
        <rect
          x="-25"
          y="-50"
          width="50"
          height="50"
          fill={isColor ? '#FDF4FF' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Crenellations */}
        <rect x="-25" y="-56" width="12" height="8" fill={isColor ? '#FDF4FF' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <rect x="-6" y="-56" width="12" height="8" fill={isColor ? '#FDF4FF' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <rect x="13" y="-56" width="12" height="8" fill={isColor ? '#FDF4FF' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        {/* Conical Roof */}
        <path
          d="M-30 -56 L0 -110 L30 -56 Z"
          fill={isColor ? '#F43F5E' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Castle Flag */}
        <line x1="0" y1="-110" x2="0" y2="-135" stroke={stroke} strokeWidth={2.5} />
        <path
          d="M0 -135 L26 -125 L0 -115 Z"
          fill={isColor ? '#FBBF24' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={2}
        />
      </g>

      {/* 6. Middle Ground Green Rolling Hills */}
      <g id="middle-hills">
        {/* Left Hill with House/Bush */}
        <path
          d="M-20 620
             C40 500 180 520 260 620
             C300 660 320 700 320 750
             L-20 750 Z"
          fill={isColor ? '#16A34A' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Little Mushrooms / Bushes with circles */}
        <path
          d="M-10 570
             C-10 520 80 520 80 570
             L80 620 L-10 620 Z"
          fill={isColor ? '#F472B6' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <circle cx="15" cy="550" r="6" fill="#FFFFFF" stroke={stroke} strokeWidth={2} />
        <circle cx="45" cy="565" r="7" fill="#FFFFFF" stroke={stroke} strokeWidth={2} />
        <circle cx="55" cy="535" r="5" fill="#FFFFFF" stroke={stroke} strokeWidth={2} />

        {/* Right Bush Mound */}
        <path
          d="M600 640
             C640 580 750 580 820 640
             L860 740 L580 740 Z"
          fill={isColor ? '#15803D' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        <circle cx="700" cy="620" r="7" fill="#FFFFFF" stroke={stroke} strokeWidth={2} />
        <circle cx="740" cy="640" r="6" fill="#FFFFFF" stroke={stroke} strokeWidth={2} />
      </g>

      {/* 7. Wooden Arrow Sign "LET'S PLAY!" (From reference coloring page) */}
      <g id="sign-lets-play" transform="translate(130, 580)">
        {/* Wooden Post */}
        <rect
          x="-10"
          y="20"
          width="20"
          height="120"
          fill={isColor ? '#B45309' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Arrow Plaque pointing right */}
        <path
          d="M-75 -40
             L45 -40
             L75 0
             L45 40
             L-75 40 Z"
          fill={isColor ? '#FDE68A' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Text */}
        <text
          x="-20"
          y="-8"
          fontFamily="Fredoka, Nunito, sans-serif"
          fontWeight="900"
          fontSize="22"
          fill={stroke}
          textAnchor="middle"
        >
          LET'S
        </text>
        <text
          x="-20"
          y="20"
          fontFamily="Fredoka, Nunito, sans-serif"
          fontWeight="900"
          fontSize="22"
          fill={stroke}
          textAnchor="middle"
        >
          PLAY!
        </text>
      </g>

      {/* 8. Winding Walking Path with Pebbles */}
      <g id="pathway">
        <path
          d="M200 900
             C350 780 450 750 620 720
             L700 760
             C520 820 400 900 280 1100
             L80 1100 Z"
          fill={isColor ? '#FEF08A' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Path Pebbles */}
        <ellipse cx="400" cy="790" rx="14" ry="7" fill={isColor ? '#FDE047' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <ellipse cx="460" cy="815" rx="10" ry="5" fill={isColor ? '#FDE047' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <ellipse cx="320" cy="900" rx="16" ry="8" fill={isColor ? '#FDE047' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
        <ellipse cx="580" cy="850" rx="12" ry="6" fill={isColor ? '#FDE047' : '#FFFFFF'} stroke={stroke} strokeWidth={2} />
      </g>

      {/* 9. Foreground Greenery, Rolling Grass, and Daisy Flowers */}
      <g id="foreground-grass">
        {/* Left Bottom Cloud/Bush Puffs */}
        <path
          d="M-40 1100
             C-40 960 60 920 120 980
             C180 940 250 1000 240 1100 Z"
          fill={isColor ? '#22C55E' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Right Bottom Bush Puffs */}
        <path
          d="M600 1100
             C620 980 720 950 760 1020
             C820 960 900 1000 890 1100 Z"
          fill={isColor ? '#22C55E' : '#FFFFFF'}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Cute Daisy Flower (Left) */}
        <g id="flower-left" transform="translate(180, 940)">
          <line x1="0" y1="0" x2="0" y2="40" stroke={stroke} strokeWidth={3} />
          {/* 5 Petals */}
          <circle cx="0" cy="-14" r="9" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="13" cy="-4" r="9" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="8" cy="12" r="9" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="-8" cy="12" r="9" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="-13" cy="-4" r="9" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          {/* Flower Center */}
          <circle cx="0" cy="0" r="9" fill={isColor ? '#FACC15' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
        </g>

        {/* Cute Daisy Flower (Right) */}
        <g id="flower-right" transform="translate(680, 850)">
          <line x1="0" y1="0" x2="0" y2="40" stroke={stroke} strokeWidth={3} />
          <circle cx="0" cy="-14" r="9" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="13" cy="-4" r="9" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="8" cy="12" r="9" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="-8" cy="12" r="9" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="-13" cy="-4" r="9" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="0" cy="0" r="9" fill={isColor ? '#FACC15' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
        </g>

        {/* Daisy Flower 2 (Far Right) */}
        <g id="flower-far-right" transform="translate(770, 830)">
          <line x1="0" y1="0" x2="0" y2="35" stroke={stroke} strokeWidth={3} />
          <circle cx="0" cy="-12" r="8" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="11" cy="-4" r="8" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="7" cy="10" r="8" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="-7" cy="10" r="8" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="-11" cy="-4" r="8" fill={isColor ? '#FFFFFF' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
          <circle cx="0" cy="0" r="8" fill={isColor ? '#F43F5E' : '#FFFFFF'} stroke={stroke} strokeWidth={2.5} />
        </g>
      </g>
    </g>
  );
};
