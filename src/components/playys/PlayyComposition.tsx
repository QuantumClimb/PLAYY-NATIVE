import React from 'react';
import { PlayyConfiguration, RenderMode } from '../../lib/playys/types';

// Heads
import { BlueHead } from './heads/BlueHead';
import { DreamyyHead } from './heads/DreamyyHead';
import { SparkyyHead } from './heads/SparkyyHead';

// Poses
import { HeroPose } from './poses/HeroPose';
import { WavePose } from './poses/WavePose';
import { JumpPose } from './poses/JumpPose';
import { SittingPose } from './poses/SittingPose';

// Backgrounds
import { HappyHillsBackground } from './backgrounds/HappyHillsBackground';
import { MagicCastleBackground } from './backgrounds/MagicCastleBackground';
import { SpaceWorldBackground } from './backgrounds/SpaceWorldBackground';
import { JungleWorldBackground } from './backgrounds/JungleWorldBackground';
import { CloudKingdomBackground } from './backgrounds/CloudKingdomBackground';
import { CityAdventureBackground } from './backgrounds/CityAdventureBackground';

interface PlayyCompositionProps {
  config: PlayyConfiguration;
  mode: RenderMode;
  showBackground?: boolean;
  showLogoHeader?: boolean;
  className?: string;
  id?: string;
}

export const PlayyComposition: React.FC<PlayyCompositionProps> = ({
  config,
  mode,
  showBackground = true,
  showLogoHeader = true,
  className = 'w-full h-full',
  id = 'playy-composition-svg',
}) => {
  const { head, pose, symbol, background } = config;
  const isColoring = mode === 'coloring';
  const stroke = '#111827';

  // Render the appropriate head
  const renderHead = () => {
    switch (head) {
      case 'blue':
        return <BlueHead mode={mode} x={425} y={440} scale={1} />;
      case 'dreamyy':
        return <DreamyyHead mode={mode} x={425} y={440} scale={1} />;
      case 'sparkyy':
        return <SparkyyHead mode={mode} x={425} y={440} scale={1} />;
      default:
        return <BlueHead mode={mode} x={425} y={440} scale={1} />;
    }
  };

  // Render the appropriate pose
  const renderPose = () => {
    switch (pose) {
      case 'hero':
        return <HeroPose mode={mode} symbol={symbol} x={425} y={560} scale={1} />;
      case 'wave':
        return <WavePose mode={mode} symbol={symbol} x={425} y={560} scale={1} />;
      case 'jump':
        return <JumpPose mode={mode} symbol={symbol} x={425} y={540} scale={1} />;
      case 'sitting':
        return <SittingPose mode={mode} symbol={symbol} x={425} y={560} scale={1} />;
      default:
        return <WavePose mode={mode} symbol={symbol} x={425} y={560} scale={1} />;
    }
  };

  // Render background
  const renderBackground = () => {
    if (!showBackground) return null;
    switch (background) {
      case 'happy-hills':
        return <HappyHillsBackground mode={mode} />;
      case 'magic-castle':
        return <MagicCastleBackground mode={mode} />;
      case 'space-world':
        return <SpaceWorldBackground mode={mode} />;
      case 'jungle-world':
        return <JungleWorldBackground mode={mode} />;
      case 'cloud-kingdom':
        return <CloudKingdomBackground mode={mode} />;
      case 'city-adventure':
        return <CityAdventureBackground mode={mode} />;
      default:
        return <HappyHillsBackground mode={mode} />;
    }
  };

  return (
    <svg
      id={id}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 850 1100"
      className={`${className} transition-all duration-300 select-none`}
      style={{
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision',
      }}
    >
      {/* Layer 1: Background Scenery */}
      {renderBackground()}

      {/* Layer 2: Coloring Page Logo Header (If on full coloring page sheet) */}
      {showLogoHeader && (
        <g id="page-logo-header" transform="translate(180, 75)">
          {/* PLAYYS Header text in coloring/color mode */}
          <g transform="scale(1.15)">
            <path
              d="M12 45 L12 12 C12 6 16 0 24 0 L36 0 C48 0 56 8 56 20 C56 32 48 40 36 40 L24 40 L24 45 C24 48 21 51 17 51 C14 51 12 48 12 45 Z"
              fill={isColoring ? '#FFFFFF' : '#EC4899'}
              stroke={stroke}
              strokeWidth={3}
            />
            <path d="M24 12 L34 12 C40 12 44 15 44 20 C44 25 40 28 34 28 L24 28 Z" fill={isColoring ? '#FFFFFF' : '#FDF2F8'} stroke={stroke} strokeWidth={2} />

            <path d="M68 45 L68 12 C68 6 72 0 78 0 C84 0 88 6 88 12 L88 35 L106 35 C111 35 115 39 115 44 C115 49 111 51 106 51 L78 51 C72 51 68 48 68 45 Z" fill={isColoring ? '#FFFFFF' : '#06B6D4'} stroke={stroke} strokeWidth={3} />

            <path d="M135 0 C142 0 148 5 151 12 L166 43 C168 48 165 51 159 51 C154 51 151 48 149 43 L145 35 L128 35 L124 43 C122 48 119 51 114 51 C108 51 105 48 107 43 L122 12 C125 5 130 0 135 0 Z" fill={isColoring ? '#FFFFFF' : '#FACC15'} stroke={stroke} strokeWidth={3} />
            <path d="M135 14 L131 26 L141 26 Z" fill={isColoring ? '#FFFFFF' : '#FEF08A'} stroke={stroke} strokeWidth={2} />

            <path d="M178 8 C178 3 182 -1 187 3 L197 18 L207 3 C212 -1 216 3 216 8 L204 26 L204 45 C204 49 201 51 197 51 C193 51 190 49 190 45 L190 26 L178 8 Z" fill={isColoring ? '#FFFFFF' : '#F97316'} stroke={stroke} strokeWidth={3} />
            <path d="M222 8 C222 3 226 -1 231 3 L241 18 L251 3 C256 -1 260 3 260 8 L248 26 L248 45 C248 49 245 51 241 51 C237 51 234 49 234 45 L234 26 L222 8 Z" fill={isColoring ? '#FFFFFF' : '#84CC16'} stroke={stroke} strokeWidth={3} />

            <path d="M285 8 C285 3 281 0 275 0 C267 0 260 6 260 14 C260 23 270 26 276 29 C282 32 286 36 286 42 C286 49 279 53 271 53 C263 53 257 49 257 42 C257 38 261 35 266 35 C271 35 274 38 274 41 C274 43 276 45 280 45 C284 45 286 43 286 40 C286 36 278 33 272 30 C266 27 260 23 260 15 C260 7 267 0 276 0 C284 0 290 5 290 8 Z" fill={isColoring ? '#FFFFFF' : '#A855F7'} stroke={stroke} strokeWidth={3} />
          </g>

          {/* Subtitle */}
          <text
            x="170"
            y="95"
            fontFamily="Fredoka, Nunito, sans-serif"
            fontWeight="700"
            fontSize="21"
            fill={stroke}
            textAnchor="middle"
            letterSpacing="2"
          >
            {config.kidName && config.kidName.trim()
              ? `${config.kidName.toUpperCase()}'S PLAYY ☆ COLOR YOUR WORLD!`
              : 'Imagine ☆ Create ☆ Play'}
          </text>
        </g>
      )}

      {/* Layer 3: Character Pose / Body & Arms */}
      {renderPose()}

      {/* Layer 4: Character Head */}
      {renderHead()}

      {/* Outer Border Frame (for printable coloring sheet) */}
      <rect
        x="8"
        y="8"
        width="834"
        height="1084"
        rx="18"
        fill="none"
        stroke={isColoring ? stroke : 'transparent'}
        strokeWidth={isColoring ? 3.5 : 0}
      />
    </svg>
  );
};
