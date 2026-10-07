import React, { useState, useEffect } from 'react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { PlayyComposition } from '../playys/PlayyComposition';

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
      className="w-full h-full min-h-screen bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950 text-white flex flex-col items-center justify-between p-6 sm:p-10 select-none relative overflow-hidden cursor-pointer"
    >
      {/* Background Animated Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-3xl animate-pulse duration-1000" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse duration-700" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl animate-pulse duration-1000" />

        {/* Ambient floating playful stars & sparks */}
        <div className="absolute top-16 left-12 text-amber-300 text-6xl animate-bounce duration-1000 opacity-60">
          ★
        </div>
        <div className="absolute top-32 right-20 text-pink-400 text-5xl animate-pulse duration-700 opacity-60">
          ♥
        </div>
        <div className="absolute bottom-28 left-20 text-cyan-300 text-6xl animate-bounce duration-1000 opacity-60">
          ⚡
        </div>
        <div className="absolute bottom-36 right-24 text-amber-400 text-7xl animate-pulse duration-700 opacity-60">
          ★
        </div>
      </div>

      {/* Top Header: Brand Logo with Secret Admin Hold */}
      <div className="w-full flex items-center justify-center z-20 shrink-0">
        <div
          onMouseDown={handleLogoTouchStart}
          onMouseUp={handleLogoTouchEnd}
          onTouchStart={handleLogoTouchStart}
          onTouchEnd={handleLogoTouchEnd}
          className="flex items-center gap-1.5 font-black text-5xl sm:text-6xl tracking-tight filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] cursor-pointer select-none"
        >
          <span className="text-pink-400">P</span>
          <span className="text-cyan-400">L</span>
          <span className="text-amber-400">A</span>
          <span className="text-orange-400">Y</span>
          <span className="text-lime-400">Y</span>
          <span className="text-purple-400">S</span>
        </div>
      </div>

      {/* Center Stage: The Live Showcase Movie Loop */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto z-10 w-full max-w-4xl">
        <div className="relative w-80 h-96 sm:w-96 sm:h-[460px] bg-white rounded-[44px] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.7)] border-4 border-amber-300/80 flex items-center justify-center transform transition-transform duration-700 hover:scale-105">
          {/* Animated Ribbon Callout */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 text-slate-950 font-black text-sm px-6 py-2 rounded-full shadow-xl uppercase tracking-wider whitespace-nowrap animate-pulse">
            ★ MAGICAL COLORING MACHINE ★
          </div>

          {/* Render Active Looping Character */}
          <PlayyComposition
            config={activeConfig}
            mode="color"
            showBackground={true}
            showLogoHeader={true}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Bottom Giant Touch Prompt: TAP TO CREATE YOUR PLAYY */}
      <div className="w-full flex flex-col items-center justify-center z-20 shrink-0 pb-4">
        <div className="w-full max-w-2xl py-6 px-10 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-2xl sm:text-4xl rounded-[36px] shadow-[0_15px_45px_rgba(251,191,36,0.5)] border-4 border-yellow-200 flex items-center justify-center gap-4 animate-bounce duration-1000">
          <span>✨</span>
          <span>TAP TO CREATE YOUR PLAYY!</span>
          <span>✨</span>
        </div>
        <p className="text-sm font-bold text-slate-400 mt-4 tracking-wide uppercase">
          Touch anywhere on screen to play
        </p>
      </div>
    </div>
  );
};
