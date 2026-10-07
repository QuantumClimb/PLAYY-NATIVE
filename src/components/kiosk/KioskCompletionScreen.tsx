import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Printer,
  CheckCircle2,
  RotateCcw,
  Home,
  Sparkles,
  ArrowRight,
  Send,
  Cloud,
  Check,
  Timer,
} from 'lucide-react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { PlayyComposition } from '../playys/PlayyComposition';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

interface KioskCompletionScreenProps {
  config: PlayyConfiguration;
  onBackToStart: () => void;
  onPrintAnotherCopy: () => void;
}

export const KioskCompletionScreen: React.FC<KioskCompletionScreenProps> = ({
  config,
  onBackToStart,
  onPrintAnotherCopy,
}) => {
  const TOTAL_COUNTDOWN = 15; // 15 seconds auto-return
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_COUNTDOWN);
  const [reprintToast, setReprintToast] = useState<boolean>(false);

  // Trigger celebratory confetti and fanfare sound on mount
  useEffect(() => {
    nativeFeedback.notificationSuccess();
    confetti({
      particleCount: 85,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#38BDF8', '#818CF8', '#F472B6', '#FBBF24', '#34D399'],
    });

    const secondConfetti = setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 110,
        origin: { y: 0.5 },
      });
    }, 600);

    return () => clearTimeout(secondConfetti);
  }, []);

  // Auto-countdown to return to start screen
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onBackToStart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onBackToStart]);

  const handlePrintAgain = () => {
    nativeFeedback.notificationSuccess();
    setReprintToast(true);
    onPrintAnotherCopy();
    setTimeout(() => setReprintToast(false), 3000);
  };

  const progressPercent = (secondsRemaining / TOTAL_COUNTDOWN) * 100;

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Top Header */}
      <div className="w-full flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2 font-black text-2xl tracking-tight">
          <span className="text-pink-400">P</span>
          <span className="text-cyan-400">L</span>
          <span className="text-amber-400">A</span>
          <span className="text-orange-400">Y</span>
          <span className="text-lime-400">Y</span>
          <span className="text-purple-400">S</span>
        </div>

        {/* Auto Return Countdown Pill */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-2xl text-xs font-mono text-slate-300 shadow-md">
          <Timer className="w-4 h-4 text-amber-400" />
          <span>Returning to Start Screen in <strong>{secondsRemaining}s</strong></span>
        </div>
      </div>

      {/* Main Center Stage: Printed Sheet + Celebration */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 my-auto py-4 z-10 max-w-6xl mx-auto w-full">
        {/* Left Side: Printed Sheet Representation */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative">
          <div className="relative w-68 h-88 sm:w-80 sm:h-98 bg-white rounded-3xl p-3 shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-4 border-emerald-400/60 flex items-center justify-center transform transition-all animate-in zoom-in-95">
            {/* Live Paper Ejection Label */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-xs px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Printing Complete!</span>
            </div>

            {/* Live Vector Sheet */}
            <PlayyComposition
              config={config}
              mode="coloring"
              showBackground={true}
              showLogoHeader={true}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-3 text-xs text-slate-400 font-semibold text-center">
            Printed sheet: {config.head.toUpperCase()} &bull; {config.pose.toUpperCase()} in {config.background.toUpperCase()}
          </div>
        </div>

        {/* Right Side: Celebration & Next Actions */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Job Sent to Cloud Printer</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Your PLAYY is Ready! 🎨
          </h2>

          <div className="bg-slate-900/90 border border-indigo-900/70 p-5 rounded-3xl space-y-3 max-w-lg w-full text-left">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Collect Your Sheet Below</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Your customized coloring book page is dispensing at the printer tray right now! Grab your crayons and enjoy.
                </p>
              </div>
            </div>

            {reprintToast && (
              <div className="bg-indigo-950 border border-indigo-600/60 p-2.5 rounded-xl text-xs text-indigo-200 font-bold flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Second copy sent to cloud printer!</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-lg flex flex-col sm:flex-row gap-3 pt-2">
            {/* Primary: Done / Back to Start */}
            <button
              type="button"
              onClick={() => {
                nativeFeedback.impactLight();
                onBackToStart();
              }}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black text-base rounded-2xl shadow-xl border-2 border-indigo-400/60 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 transition-all"
            >
              <Home className="w-5 h-5" />
              <span>All Done! Back to Start</span>
            </button>

            {/* Secondary: Print Another Copy */}
            <button
              type="button"
              onClick={handlePrintAgain}
              className="py-4 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Print Another Copy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Countdown Progress Bar */}
      <div className="w-full z-10 shrink-0 max-w-6xl mx-auto">
        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden shadow-inner border border-slate-700/60">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <span>Auto-resetting for the next creator</span>
          <button
            type="button"
            onClick={onBackToStart}
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
          >
            Skip countdown &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
