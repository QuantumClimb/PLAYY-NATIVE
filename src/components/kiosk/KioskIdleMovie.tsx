import React, { useState } from 'react';
import { Star, Palette, Gamepad2, Printer, Play } from 'lucide-react';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { useSceneBackgrounds } from '../../lib/backgrounds/context';
import {
  BadgePlacement,
  IntroBadgeGap,
  IntroButtonSize,
  IntroFloatAnimation,
  StartButtonPlacement,
} from '../../lib/backgrounds/types';

interface KioskIdleMovieProps {
  onStart: () => void;
  onAdminTrigger: () => void;
}

export const KioskIdleMovie: React.FC<KioskIdleMovieProps> = ({
  onStart,
  onAdminTrigger,
}) => {
  const { getSceneSetting } = useSceneBackgrounds();
  const setting = getSceneSetting('intro');

  const badgePlacement: BadgePlacement = setting?.badgePlacement || 'below-start-button';
  const startButtonPlacement: StartButtonPlacement = setting?.startButtonPlacement || 'right-center';
  const startButtonSize: IntroButtonSize = setting?.startButtonSize || 'extra-large';
  const badgeGap: IntroBadgeGap = setting?.badgeGap || 'comfortable';
  const floatAnimation: IntroFloatAnimation = setting?.floatAnimation || 'gentle';

  const buttonSizeClass = startButtonSize === 'extra-large'
    ? 'px-4 sm:px-12 lg:px-16 py-5 sm:py-7 lg:py-8 text-2xl sm:text-4xl lg:text-5xl'
    : 'px-4 sm:px-10 lg:px-12 py-4 sm:py-6 lg:py-7 text-xl sm:text-3xl lg:text-4xl';
  const iconSizeClass = startButtonSize === 'extra-large'
    ? 'w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-2xl sm:text-3xl lg:text-4xl'
    : 'w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-xl sm:text-2xl lg:text-3xl';
  const badgeGapClass = badgeGap === 'relaxed' ? 'mt-6 sm:mt-7' : 'mt-4 sm:mt-5';
  const floatClass = floatAnimation === 'gentle'
    ? 'playys-intro-float'
    : floatAnimation === 'slow'
    ? 'playys-intro-float-slow'
    : '';

  const [adminPressTimer, setAdminPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Hidden admin gesture: hold logo for 4.5 seconds
  const handleLogoTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    const t = setTimeout(() => {
      onAdminTrigger();
    }, 4500);
    setAdminPressTimer(t);
  };

  const handleLogoTouchEnd = () => {
    if (adminPressTimer) {
      clearTimeout(adminPressTimer);
      setAdminPressTimer(null);
    }
  };

  // Helper function for responsive badge positioning classes
  const getBadgePlacementClass = (placement: BadgePlacement) => {
    switch (placement) {
      case 'below-start-button':
        return '';
      case 'top-left':
        return 'top-4 sm:top-8 left-4 sm:left-10 items-start';
      case 'top-right':
        return 'top-4 sm:top-8 right-4 sm:right-10 items-end';
      case 'bottom-center':
        return 'bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 items-center';
      case 'bottom-left':
        return 'bottom-4 sm:bottom-8 left-4 sm:left-10 items-start';
      case 'bottom-right':
        return 'bottom-4 sm:bottom-8 right-4 sm:right-10 items-end';
      case 'hidden':
        return 'hidden';
      case 'top-center':
      default:
        return 'top-4 sm:top-8 left-1/2 -translate-x-1/2 items-center';
    }
  };

  // Helper function for responsive start button positioning classes
  const getStartButtonPlacementClass = (placement: StartButtonPlacement) => {
    switch (placement) {
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom-center':
        return 'bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-8 sm:bottom-12 right-6 sm:right-12 lg:right-16';
      case 'top-right':
        return 'top-8 sm:top-12 right-6 sm:right-12 lg:right-16';
      case 'right-center':
      default:
        return 'right-3 sm:right-8 lg:right-16 top-[37%] -translate-y-1/2';
    }
  };

  return (
    <div
      onClick={onStart}
      className="playys-intro-screen w-full h-full min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between select-none relative overflow-hidden cursor-pointer"
    >
      {/* 1. Dynamic CMS Scene Background (Image or Video) */}
      <SceneBackground sceneId="intro" />

      {/* Intro logo, centered above the hero controls. */}
      <div
        onMouseDown={handleLogoTouchStart}
        onMouseUp={handleLogoTouchEnd}
        onTouchStart={handleLogoTouchStart}
        onTouchEnd={handleLogoTouchEnd}
        className="absolute inset-x-0 top-3 z-20 flex justify-center select-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] sm:top-5 md:top-6"
      >
        <div className="intro-wood-sign intro-top-sign cursor-pointer transition-transform hover:scale-105" aria-hidden="true">
          <span>Let’s Make</span>
          <strong>Something Awesome!</strong>
        </div>
        <img
          src="/assets/logo.png"
          alt="PLAYYS"
          draggable={false}
          className="intro-logo absolute left-4 top-0 h-16 w-auto max-w-[13rem] cursor-pointer object-contain sm:left-7 sm:h-20 md:left-8 md:h-24"
        />
      </div>

      {/* 2. CMS Controlled Badges Container */}
      {badgePlacement !== 'hidden' && badgePlacement !== 'below-start-button' && (
        <div
          className={`absolute z-20 flex flex-col gap-3 transition-all duration-300 pointer-events-auto ${getBadgePlacementClass(
            badgePlacement
          )}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Interactive Feature Badges Row */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-5">
            {/* Choose Badge */}
            <div className="intro-shortcut intro-shortcut-yellow">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-500 mb-1.5">
                <Star className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
              </div>
              <span className="intro-shortcut-label">
                Choose
              </span>
            </div>

            {/* Color Badge */}
            <div className="intro-shortcut intro-shortcut-blue">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-500 mb-1.5">
                <Palette className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
              </div>
              <span className="intro-shortcut-label">
                Color
              </span>
            </div>

            {/* Play Badge */}
            <div className="intro-shortcut intro-shortcut-purple">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-500 mb-1.5">
                <Gamepad2 className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
              </div>
              <span className="intro-shortcut-label">
                Play
              </span>
            </div>

            {/* Print Badge */}
            <div className="intro-shortcut intro-shortcut-mint">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500 mb-1.5">
                <Printer className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
              </div>
              <span className="intro-shortcut-label">
                Print
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. CMS Controlled Start Button Container */}
      <div
        className={`absolute z-20 pointer-events-auto transition-all duration-300 intro-controls intro-controls-group ${
          badgePlacement === 'below-start-button'
            ? `${getStartButtonPlacementClass(startButtonPlacement)} flex w-[min(100vw-2rem,40rem)] max-w-full flex-col items-center`
            : getStartButtonPlacementClass(startButtonPlacement)
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
      >
        <div className="intro-wood-sign intro-group-sign cursor-pointer transition-transform hover:scale-105" aria-hidden="true">
          <span>Let&apos;s Make</span>
          <strong>Something Awesome!</strong>
        </div>
        <button
          type="button"
          onClick={onStart}
          className={`intro-start-button btn-3d btn-3d-amber group w-full max-w-full cursor-pointer text-slate-950 font-black ${buttonSizeClass} rounded-[2rem] active:scale-[.98] transition-all select-none ${floatClass}`}
        >
          <span className="intro-start-content">
            <span className={`${iconSizeClass} intro-start-icon rounded-full bg-white flex items-center justify-center text-orange-500 shadow-md shrink-0`}>
              <Play className="w-1/2 h-1/2 fill-current" />
            </span>
            <span
              className="font-extrabold tracking-tight drop-shadow-sm whitespace-nowrap"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              Tap to Start
            </span>
          </span>
        </button>

        {badgePlacement === 'below-start-button' && (
          <div
            className={`absolute left-1/2 top-full z-20 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap sm:flex-nowrap items-center justify-center gap-3 sm:gap-5 ${badgeGapClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Existing badges, kept in their original order and appearance. */}
            <div className="intro-shortcut intro-shortcut-yellow">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-500 mb-1.5">
                <Star className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
              </div>
              <span className="intro-shortcut-label">Choose</span>
            </div>
            <div className="intro-shortcut intro-shortcut-blue">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-500 mb-1.5">
                <Palette className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
              </div>
              <span className="intro-shortcut-label">Color</span>
            </div>
            <div className="intro-shortcut intro-shortcut-purple">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-500 mb-1.5">
                <Gamepad2 className="w-7 h-7 sm:w-9 sm:h-9 fill-current" />
              </div>
              <span className="intro-shortcut-label">Play</span>
            </div>
            <div className="intro-shortcut intro-shortcut-mint">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500 mb-1.5">
                <Printer className="w-7 h-7 sm:w-9 sm:h-9 fill-sky-400 stroke-sky-500" />
              </div>
              <span className="intro-shortcut-label">Print</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
