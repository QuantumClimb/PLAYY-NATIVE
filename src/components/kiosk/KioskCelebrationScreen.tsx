import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Mail, Printer } from 'lucide-react';
import { playSfx } from '../../lib/sfx/engine';
import { PlayyConfiguration } from '../../lib/playys/types';
import { GeneratedCard } from '../../lib/playys/cardTypes';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';
import { SceneBackground } from '../backgrounds/SceneBackground';
import { BrandLogo } from '../../lib/brand/brand';
import { PlayyScene } from '../playys/PlayyScene';
import { CARD_H, TrumpCardFront } from '../card/TrumpCard';

interface KioskCelebrationScreenProps {
  config: PlayyConfiguration;
  card: GeneratedCard | null;
  onAllDone: () => void;
  onPrintAnother: () => void;
}

const AUTO_RETURN_SECONDS = 20;

/** The last screen: confetti, what happens next, and an automatic return to the intro screen. */
export const KioskCelebrationScreen: React.FC<KioskCelebrationScreenProps> = ({
  config,
  card,
  onAllDone,
  onPrintAnother,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RETURN_SECONDS);

  useEffect(() => {
    playSfx('done');
    nativeFeedback.notificationSuccess();
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#F59E0B', '#EC4899', '#38BDF8', '#10B981', '#A855F7'],
    });
    const t = setTimeout(() => confetti({ particleCount: 80, spread: 110, origin: { y: 0.4 } }), 800);
    return () => clearTimeout(t);
  }, []);

  // Back to the intro screen on its own, ready for the next visitor
  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(countdown);
          onAllDone();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [onAllDone]);

  const cardScale = (window.innerHeight * 0.5) / CARD_H;

  return (
    <div className="kiosk-machine pick-page pick-success w-full h-full min-h-0 text-white select-none relative overflow-hidden">
      <SceneBackground sceneId="celebrate" />
      <BrandLogo className="head-page-logo h-12 sm:h-14 w-auto object-contain" />

      <div className="success-title">
        <h1 className="head-arched-heading" aria-label="Your Playyy is ready!">
          {'YOUR PLAYYY IS READY!'
            .split('')
            .map((letter, i) =>
              letter === ' ' ? (
                <span className="head-heading-space" key={i} aria-hidden="true" />
              ) : (
                <span key={i}>{letter}</span>
              ),
            )}
        </h1>
        <p className="head-subtitle">Thank you for playing{config.kidName ? `, ${config.kidName}` : ''}!</p>
      </div>

      <div className="success-body">
        <div className="success-page-thumb">
          <PlayyScene config={config} mode="color" finish className="h-full w-full" />
        </div>
        {card && (
          <div className="success-card">
            <TrumpCardFront card={card} scale={cardScale} />
          </div>
        )}
        <div className="success-steps">
          <div className="success-step">
            <span className="success-step-icon">
              <Printer strokeWidth={2.6} />
            </span>
            <div>
              <b>Collect your pages</b>
              <span>Your coloring pages and trump card are printing now.</span>
            </div>
          </div>
          <div className="success-step">
            <span className="success-step-icon is-pink">
              <Mail strokeWidth={2.6} />
            </span>
            <div>
              <b>Sent to our team</b>
              <span>Your Playyy and trump card are on their way to the Playyy Kingdom team.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="machine-navigation">
        <button type="button" data-sfx="tap" onClick={onPrintAnother} className="btn-3d btn-3d-blue head-nav-button">
          <Printer strokeWidth={3.2} aria-hidden="true" />
          <span>PRINT AGAIN</span>
        </button>
        <div className="success-countdown">Back to the start in {secondsLeft}s</div>
        <button type="button" data-sfx="done" onClick={onAllDone} className="btn-3d head-nav-button head-nav-next">
          <span>FINISH</span>
        </button>
      </div>
    </div>
  );
};
