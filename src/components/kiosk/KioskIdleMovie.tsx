import React, { useEffect, useState } from 'react';
import { Play, Star } from 'lucide-react';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { IntroBadges } from '../intro/IntroBadges';
import { BrandLogo } from '../../lib/brand/brand';
import { useSceneBackgrounds } from '../../lib/backgrounds/context';
import { DEFAULT_INTRO_BADGES, IntroBadgeData, cleanBadges } from '../../lib/intro/badges';
import { BadgePlacement, IntroFloatAnimation, StartButtonPlacement } from '../../lib/backgrounds/types';

interface KioskIdleMovieProps {
  onStart: () => void;
  onAdminTrigger: () => void;
}

/** Where the whole column (logo, sign, button, badges) sits. Right-center keeps a comfortable gap from the edge. */
const COLUMN_PLACEMENT: Record<StartButtonPlacement, string> = {
  'right-center': 'right-[5vw] top-1/2 -translate-y-1/2',
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  'bottom-center': 'bottom-[3vh] left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-[3vh] right-[5vw]',
  'top-right': 'top-[3vh] right-[5vw]',
};

/** Badges can also be pinned elsewhere on the screen (a Scene Backgrounds setting). */
const BADGE_PLACEMENT: Record<Exclude<BadgePlacement, 'below-start-button' | 'hidden'>, string> = {
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-left': 'top-4 left-[4vw]',
  'top-right': 'top-4 right-[4vw]',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-4 left-[4vw]',
  'bottom-right': 'bottom-4 right-[4vw]',
};

const SPARKS = ['intro-spark-l1', 'intro-spark-l2', 'intro-spark-l3', 'intro-spark-r1', 'intro-spark-r2', 'intro-spark-r3'];

export const KioskIdleMovie: React.FC<KioskIdleMovieProps> = ({ onStart, onAdminTrigger }) => {
  const { getSceneSetting } = useSceneBackgrounds();
  const setting = getSceneSetting('intro');

  const badgePlacement: BadgePlacement = setting?.badgePlacement || 'below-start-button';
  const startPlacement: StartButtonPlacement = setting?.startButtonPlacement || 'right-center';
  const floatAnimation: IntroFloatAnimation = setting?.floatAnimation || 'gentle';
  const large = (setting?.startButtonSize || 'extra-large') === 'large';
  const floatClass = floatAnimation === 'gentle' ? 'playys-intro-float' : floatAnimation === 'slow' ? 'playys-intro-float-slow' : '';

  // Badges come from the command center (Intro Badges); nothing is shown until they have loaded.
  const [badges, setBadges] = useState<IntroBadgeData[] | null>(null);
  useEffect(() => {
    let live = true;
    fetch('/api/intro-badges')
      .then((r) => r.json())
      .then((d) => live && setBadges(cleanBadges(d.badges) ?? DEFAULT_INTRO_BADGES))
      .catch(() => live && setBadges(DEFAULT_INTRO_BADGES));
    return () => { live = false; };
  }, []);

  // Hidden admin gesture: hold the logo for 4.5 seconds
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const holdStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setHoldTimer(setTimeout(onAdminTrigger, 4500));
  };
  const holdEnd = () => {
    if (holdTimer) clearTimeout(holdTimer);
    setHoldTimer(null);
  };

  const showBadgesBelow = badgePlacement === 'below-start-button' && badges && badges.length > 0;
  const showBadgesElsewhere = badgePlacement !== 'below-start-button' && badgePlacement !== 'hidden' && badges && badges.length > 0;

  return (
    <div
      onClick={onStart}
      className="playys-intro-screen w-full h-full min-h-screen bg-slate-950 text-white select-none relative overflow-hidden cursor-pointer"
    >
      <SceneBackground sceneId="intro" />

      {/* One column on one center line: logo, sign, start button, badges */}
      <div className={`intro-hero absolute z-20 ${COLUMN_PLACEMENT[startPlacement]}`} onClick={(e) => { e.stopPropagation(); onStart(); }}>
        <BrandLogo
          onMouseDown={holdStart}
          onMouseUp={holdEnd}
          onMouseLeave={holdEnd}
          onTouchStart={holdStart}
          onTouchEnd={holdEnd}
          className="intro-hero-logo"
        />

        <div className="intro-sign" aria-hidden="true">
          <Star className="intro-sign-star" fill="#ff5fb0" stroke="#fff" strokeWidth={1.5} />
          <span>Let’s Make</span>
          <strong>Something Awesome!</strong>
        </div>

        <div className="intro-start-wrap">
          {SPARKS.map((c) => <i key={c} className={`intro-spark ${c}`} />)}
          <button type="button" className={`intro-start ${large ? 'intro-start-large' : ''} ${floatClass}`}>
            <span className="intro-start-icon"><Play fill="currentColor" strokeWidth={0} /></span>
            <span className="intro-start-text">Tap to Start!</span>
          </button>
        </div>

        {showBadgesBelow && <IntroBadges badges={badges!} />}
      </div>

      {showBadgesElsewhere && (
        <div
          className={`absolute z-20 ${BADGE_PLACEMENT[badgePlacement as keyof typeof BADGE_PLACEMENT] ?? BADGE_PLACEMENT['top-center']}`}
          onClick={(e) => e.stopPropagation()}
        >
          <IntroBadges badges={badges!} />
        </div>
      )}
    </div>
  );
};
