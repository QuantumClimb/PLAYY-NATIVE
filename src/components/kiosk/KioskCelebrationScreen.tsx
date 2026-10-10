import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayyConfiguration } from '../../lib/playys/types';
import { PlayyScene } from '../playys/PlayyScene';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

interface KioskCelebrationScreenProps {
  config: PlayyConfiguration;
  onAllDone: () => void;
  onPrintAnother: () => void;
}

export const KioskCelebrationScreen: React.FC<KioskCelebrationScreenProps> = ({
  config,
  onAllDone,
  onPrintAnother,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [isPaperFed, setIsPaperFed] = useState(false);

  // Confetti celebration & audio on mount
  useEffect(() => {
    nativeFeedback.notificationSuccess();

    // First burst
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#EC4899', '#38BDF8', '#10B981', '#A855F7'],
    });

    // Second burst
    const timer1 = setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 100,
        origin: { y: 0.4 },
      });
      setIsPaperFed(true);
    }, 800);

    return () => clearTimeout(timer1);
  }, []);

  // Auto-reset countdown back to idle movie (15s)
  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          onAllDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [onAllDone]);

  return (
    <div className="w-full h-full min-h-0 bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950 text-white flex flex-col items-center justify-between p-6 sm:p-10 select-none relative overflow-hidden">
      {/* Background Star Bursts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Top Header: Celebration Announcement */}
      <div className="w-full flex flex-col items-center text-center z-20 shrink-0">
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-5 py-1.5 rounded-full text-sm font-black uppercase tracking-wider mb-2">
          <span>★ PRINTING COMPLETE ★</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-lg">
          YOUR PLAYY IS READY! 🎉
        </h1>
        <p className="text-base sm:text-xl font-bold text-amber-300 mt-2">
          TAKE YOUR COLORING SHEET FROM THE TRAY!
        </p>
      </div>

      {/* Center Hero: Physical Coloring Sheet Emerging */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto z-10 w-full max-w-xl">
        <div
          className={`relative h-[min(60vh,760px)] aspect-[200/287] bg-white rounded-[28px] p-2 shadow-[0_30px_90px_rgba(0,0,0,0.8)] border-6 border-emerald-400/80 flex items-center justify-center transform transition-all duration-700 ${
            isPaperFed ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95 opacity-80'
          }`}
        >
          {/* Top Sheet Label */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm px-6 py-1.5 rounded-full shadow-lg uppercase tracking-wider whitespace-nowrap">
            ★ YOUR OFFICIAL COLORING PAGE ★
          </div>

          {/* Clean Vector Preview */}
          <PlayyScene config={config} mode="line" className="w-full h-full rounded-[18px]" />
        </div>
      </div>

      {/* Bottom Big Action Buttons: ALL DONE vs PRINT ANOTHER */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-center gap-4 z-20 shrink-0 pb-2">
        {/* Giant Primary: ALL DONE! */}
        <button
          type="button"
          onClick={onAllDone}
          className="btn-3d flex-1 w-full py-5 px-8 font-bold text-xl sm:text-2xl flex items-center justify-center gap-3"
        >
          <span>⭐ ALL DONE!</span>
        </button>

        {/* Secondary: PRINT ANOTHER COPY */}
        <button
          type="button"
          onClick={onPrintAnother}
          className="btn-3d btn-3d-blue py-5 px-8 font-bold text-lg sm:text-xl flex items-center justify-center gap-2.5"
        >
          <span>🖨️ PRINT ANOTHER</span>
        </button>
      </div>

      {/* Subtle Auto-Reset Countdown */}
      <div className="text-xs text-slate-400 font-bold z-20 shrink-0">
        New creator starting in {secondsLeft}s
      </div>
    </div>
  );
};
