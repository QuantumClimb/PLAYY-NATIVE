import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Dices,
  Volume2,
  VolumeX,
  Cloud,
  ChevronRight,
  Code2,
  Printer,
  Heart,
  Star,
  Zap,
} from 'lucide-react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { PlayyComposition } from '../playys/PlayyComposition';
import { CharacterPreviewOnly } from '../playys/CharacterPreviewOnly';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

interface KioskStartScreenProps {
  onStart: () => void;
  onSurpriseStart: () => void;
  onOpenCloudPrinter: () => void;
  onOpenExporter: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const KioskStartScreen: React.FC<KioskStartScreenProps> = ({
  onStart,
  onSurpriseStart,
  onOpenCloudPrinter,
  onOpenExporter,
  soundEnabled,
  onToggleSound,
}) => {
  // Rotate sample characters on the start screen every 4 seconds
  const sampleConfigs: PlayyConfiguration[] = [
    { head: 'blue', pose: 'wave', symbol: 'star', background: 'happy-hills' },
    { head: 'dreamyy', pose: 'jump', symbol: 'heart', background: 'magic-castle' },
    { head: 'sparkyy', pose: 'hero', symbol: 'lightning', background: 'space-world' },
  ];

  const [activeSampleIndex, setActiveSampleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSampleIndex((prev) => (prev + 1) % sampleConfigs.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [sampleConfigs.length]);

  const activeConfig = sampleConfigs[activeSampleIndex];

  const handleStartClick = () => {
    nativeFeedback.notificationSuccess();
    onStart();
  };

  const handleSurpriseClick = () => {
    nativeFeedback.impactMedium();
    onSurpriseStart();
  };

  return (
    <div
      onClick={handleStartClick}
      className="w-full h-full min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none relative overflow-hidden cursor-pointer"
    >
      {/* Background Decorative Ambient Blobs & Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />

        {/* Floating playful background icons */}
        <div className="absolute top-20 left-16 text-amber-400/20 text-5xl animate-bounce duration-1000">⭐</div>
        <div className="absolute top-36 right-24 text-pink-400/20 text-6xl animate-pulse duration-700">💖</div>
        <div className="absolute bottom-28 left-24 text-cyan-400/20 text-5xl animate-bounce duration-1000">⚡</div>
        <div className="absolute bottom-36 right-32 text-emerald-400/20 text-6xl animate-pulse duration-700">☁️</div>
      </div>

      {/* Top Kiosk Navigation & Status Bar */}
      <div className="w-full flex items-center justify-between z-20 shrink-0 relative">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-black text-3xl sm:text-4xl tracking-tight filter drop-shadow-md">
            <span className="text-pink-400">P</span>
            <span className="text-cyan-400">L</span>
            <span className="text-amber-400">A</span>
            <span className="text-orange-400">Y</span>
            <span className="text-lime-400">Y</span>
            <span className="text-purple-400">S</span>
          </div>
          <span className="text-xs font-black bg-indigo-900/80 border border-indigo-700/70 text-indigo-200 px-3 py-1 rounded-full tracking-wider uppercase hidden sm:inline-block">
            Coloring Book Station
          </span>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {/* Cloud Printer Status Button */}
          <button
            type="button"
            onClick={onOpenCloudPrinter}
            className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-sky-300 border border-sky-400/40 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shadow-md"
            title="Cloud Printer Settings"
          >
            <Cloud className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Cloud Printer: Online</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
          </button>

          {/* Audio / Haptic Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              soundEnabled
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-800/80 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Sound ON' : 'Sound MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Expo Project Code Exporter Trigger */}
          <button
            type="button"
            onClick={onOpenExporter}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Expo Project Code & Download (.zip)"
          >
            <Code2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Hero Attract Stage */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 my-auto py-6 z-10 max-w-7xl mx-auto w-full">
        {/* Left Side: Animated Character Preview Cards Showcase */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative">
          <div className="relative w-72 h-88 sm:w-84 sm:h-96 bg-white/95 rounded-[40px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-indigo-400/40 flex items-center justify-center transform transition-transform duration-500 hover:scale-105">
            {/* Tag Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tap Anywhere to Start!</span>
            </div>

            {/* Render Sample Character */}
            <PlayyComposition
              config={activeConfig}
              mode="color"
              showBackground={true}
              showLogoHeader={false}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Sample Character Dots Indicator */}
          <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
            {sampleConfigs.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  nativeFeedback.selection();
                  setActiveSampleIndex(idx);
                }}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  activeSampleIndex === idx ? 'bg-amber-400 scale-125' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Big Welcome Callouts & Start Actions */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-pink-500/20 border border-amber-400/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Interactive Coloring Station</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            Build Your Own <br />
            <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              PLAYY Character
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-lg font-medium leading-relaxed">
            Choose heads, dynamic action poses, chest symbols, and magical worlds. Then print your personalized coloring sheet instantly!
          </p>

          {/* Primary Action Buttons */}
          <div className="w-full max-w-md flex flex-col sm:flex-row gap-4 pt-2" onClick={(e) => e.stopPropagation()}>
            {/* Giant Bouncy Start Button */}
            <button
              type="button"
              onClick={handleStartClick}
              className="flex-1 py-5 px-8 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-lg sm:text-xl rounded-3xl shadow-[0_10px_35px_rgba(245,158,11,0.4)] border-3 border-amber-300 flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition-all animate-bounce duration-1000"
            >
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
              <span>START CREATING</span>
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Quick Surprise Me Button */}
            <button
              type="button"
              onClick={handleSurpriseClick}
              className="py-5 px-6 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold text-sm sm:text-base rounded-3xl shadow-lg border-2 border-slate-700 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 transition-all"
            >
              <Dices className="w-5 h-5 text-amber-300" />
              <span>Surprise Me!</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info Bar */}
      <div className="w-full flex flex-wrap items-center justify-between text-xs text-slate-400 z-10 shrink-0 border-t border-slate-800/80 pt-4">
        <div className="flex items-center gap-2">
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Equipped with Instant Cloud & Wi-Fi Kiosk Printing</span>
        </div>

        <div className="text-slate-500 font-medium">
          Touch the screen anywhere to get started &bull; Ready for all ages
        </div>
      </div>
    </div>
  );
};
