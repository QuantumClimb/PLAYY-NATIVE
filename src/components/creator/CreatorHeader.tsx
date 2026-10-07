import React from 'react';
import { PlayyLogo } from '../playys/PlayyLogo';
import { Home, BookOpen, Settings, RotateCcw, Sparkles } from 'lucide-react';

interface CreatorHeaderProps {
  onReset?: () => void;
  onOpenGallery?: () => void;
  onOpenSettings?: () => void;
}

export const CreatorHeader: React.FC<CreatorHeaderProps> = ({
  onReset,
  onOpenGallery,
  onOpenSettings,
}) => {
  return (
    <header
      id="creator-header"
      className="w-full bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 p-2.5 sm:p-3.5 shadow-md relative z-20"
    >
      {/* Background Decorative Cloud Puffs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-6 left-1/4 w-32 h-16 bg-white rounded-full blur-[1px]" />
        <div className="absolute -top-4 right-1/3 w-48 h-20 bg-white rounded-full blur-[1px]" />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        {/* Left: PLAYYS Logo */}
        <div className="flex items-center gap-3 bg-white/95 px-3.5 py-1.5 rounded-2xl shadow-sm border-2 border-white/60">
          <PlayyLogo mode="color" size="sm" showSubtitle={true} />
        </div>

        {/* Center: "Build Your Playy!" Cloud Banner */}
        <div className="hidden md:flex items-center">
          <div className="relative bg-white text-indigo-900 px-6 py-2 rounded-full border-3 border-amber-300 shadow-md transform -rotate-1 hover:rotate-0 transition-transform">
            <span
              className="text-lg font-black tracking-wide text-indigo-950 flex items-center gap-2"
              style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}
            >
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
              Build Your Playy!
            </span>
          </div>
        </div>

        {/* Right Nav & Slogan */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Small Slogan Pill */}
          <div className="hidden lg:flex items-center gap-1.5 bg-yellow-300 text-amber-950 px-3 py-1.5 rounded-full text-xs font-black shadow-sm border-2 border-amber-400">
            <span>★</span>
            <span>Small Playys. Big Imagination!</span>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-1 bg-white/90 p-1 rounded-2xl shadow-sm border border-white">
            <button
              id="btn-nav-home"
              type="button"
              onClick={onReset}
              title="Home / Reset"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              id="btn-nav-gallery"
              type="button"
              onClick={onOpenGallery}
              title="Gallery"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Gallery</span>
            </button>

            <button
              id="btn-nav-settings"
              type="button"
              onClick={onOpenSettings}
              title="Settings"
              className="p-1.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
