import React from 'react';
import { PlayyConfiguration, RenderMode } from '../../lib/playys/types';

import { BlueHead } from './heads/BlueHead';
import { DreamyyHead } from './heads/DreamyyHead';
import { SparkyyHead } from './heads/SparkyyHead';

import { HeroPose } from './poses/HeroPose';
import { WavePose } from './poses/WavePose';
import { JumpPose } from './poses/JumpPose';
import { SittingPose } from './poses/SittingPose';

interface CharacterPreviewOnlyProps {
  config: PlayyConfiguration;
  mode?: RenderMode;
  showSparkles?: boolean;
  className?: string;
}

export const CharacterPreviewOnly: React.FC<CharacterPreviewOnlyProps> = ({
  config,
  mode = 'color',
  showSparkles = true,
  className = 'w-full h-full',
}) => {
  const { head, pose, symbol } = config;
  const isColor = mode === 'color';

  const renderHead = () => {
    switch (head) {
      case 'blue':
        return <BlueHead mode={mode} x={300} y={320} scale={1.1} />;
      case 'dreamyy':
        return <DreamyyHead mode={mode} x={300} y={320} scale={1.1} />;
      case 'sparkyy':
        return <SparkyyHead mode={mode} x={300} y={320} scale={1.1} />;
      default:
        return <BlueHead mode={mode} x={300} y={320} scale={1.1} />;
    }
  };

  const renderPose = () => {
    switch (pose) {
      case 'hero':
        return <HeroPose mode={mode} symbol={symbol} x={300} y={450} scale={1.1} />;
      case 'wave':
        return <WavePose mode={mode} symbol={symbol} x={300} y={450} scale={1.1} />;
      case 'jump':
        return <JumpPose mode={mode} symbol={symbol} x={300} y={430} scale={1.1} />;
      case 'sitting':
        return <SittingPose mode={mode} symbol={symbol} x={300} y={450} scale={1.1} />;
      default:
        return <WavePose mode={mode} symbol={symbol} x={300} y={450} scale={1.1} />;
    }
  };

  return (
    <svg
      viewBox="50 140 500 660"
      className={`${className} select-none overflow-visible`}
      style={{ shapeRendering: 'geometricPrecision' }}
    >
      {/* Platform Stage Shadow */}
      {isColor && (
        <ellipse cx="300" cy="740" rx="140" ry="24" fill="#E2E8F0" opacity="0.8" />
      )}

      {/* Decorative Sparkles */}
      {showSparkles && isColor && (
        <g id="sparkles">
          {/* Top Left Yellow Star */}
          <path
            d="M90 260 L94 246 L108 246 L97 238 L101 224 L90 232 L79 224 L83 238 L72 246 L86 246 Z"
            fill="#FACC15"
            stroke="#111827"
            strokeWidth={2}
          />
          {/* Top Right Star */}
          <path
            d="M500 320 L504 308 L516 308 L506 300 L510 288 L500 295 L490 288 L494 300 L484 308 L496 308 Z"
            fill="#FACC15"
            stroke="#111827"
            strokeWidth={2}
          />
          {/* Left Mid Sparkle */}
          <path
            d="M80 400 L85 390 L95 390 L87 384 L90 374 L80 380 L70 374 L73 384 L65 390 L75 390 Z"
            fill="#FACC15"
            stroke="#111827"
            strokeWidth={1.5}
          />
          {/* Right Bottom Star */}
          <path
            d="M490 510 L494 498 L506 498 L496 490 L500 478 L490 485 L480 478 L484 490 L474 498 L486 498 Z"
            fill="#FACC15"
            stroke="#111827"
            strokeWidth={1.5}
          />
        </g>
      )}

      {/* Character Pose */}
      {renderPose()}

      {/* Character Head */}
      {renderHead()}
    </svg>
  );
};
