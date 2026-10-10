import React, { useState, useEffect } from 'react';
import { PlayyConfiguration } from '../../lib/playys/types';

interface KioskIdleMovieProps {
  onStart: () => void;
  onAdminTrigger: () => void;
}

export const KioskIdleMovie: React.FC<KioskIdleMovieProps> = ({
  onStart,
  onAdminTrigger,
}) => {
  // Loop through showcase characters every 3.5 seconds
  const showcaseConfigs: PlayyConfiguration[] = [
    { head: 'blue', pose: 'wave', symbol: 'star', background: 'happy-hills' },
    { head: 'dreamyy', pose: 'jump', symbol: 'heart', background: 'magic-castle' },
    { head: 'sparkyy', pose: 'hero', symbol: 'lightning', background: 'space-world' },
    { head: 'blue', pose: 'sitting', symbol: 'crown', background: 'cloud-kingdom' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [adminPressTimer, setAdminPressTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcaseConfigs.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [showcaseConfigs.length]);

  const activeConfig = showcaseConfigs[currentIndex];

  // Hidden admin gesture: hold logo for 5 seconds
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

  return (
    <div
      onClick={onStart}
      className="w-full h-full min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-6 sm:p-10 select-none relative overflow-hidden cursor-pointer"
    >
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        src="/assets/Playys.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-slate-950/30 pointer-events-none" />

      {/* Top Header: Brand Logo with Secret Admin Hold */}
      <div className="w-full flex items-center justify-center z-20 shrink-0">
        <div
          onMouseDown={handleLogoTouchStart}
          onMouseUp={handleLogoTouchEnd}
          onTouchStart={handleLogoTouchStart}
          onTouchEnd={handleLogoTouchEnd}
          className="cursor-pointer select-none filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
        >
          <img
            src="/assets/logo.png"
            alt="PLAYYS"
            draggable={false}
            className="h-32 sm:h-44 w-auto object-contain"
          />
        </div>
      </div>

      {/* Spacer keeps the button at the bottom */}
      <div className="flex-1" />

      {/* Bottom Giant Touch Prompt: TAP TO CREATE YOUR PLAYY */}
      <div className="w-full flex flex-col items-center justify-center z-20 shrink-0 pb-4">
        <div className="btn-3d w-full max-w-md py-6 px-10 font-bold text-3xl sm:text-5xl tracking-wide flex items-center justify-center gap-4 animate-bounce duration-1000">
          <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700 }}>START</span>
        </div>
              </div>
    </div>
  );
};
