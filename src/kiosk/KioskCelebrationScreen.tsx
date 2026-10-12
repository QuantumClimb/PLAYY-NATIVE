import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Mail, Printer } from 'lucide-react';
import { SceneBackground } from '../components/backgrounds/SceneBackground';
import { CARD_H, TrumpCardFront } from '../components/card/TrumpCard';
import { PlayyScene } from '../components/playys/PlayyScene';
import { BrandLogo } from '../lib/brand/brand';
import { GeneratedCard } from '../lib/playys/cardTypes';
import { nativeFeedback } from '../lib/playys/nativeFeedback';
import { PlayyConfiguration } from '../lib/playys/types';
import { playSfx } from '../lib/sfx/engine';
import { ArchedHeading } from './components/ArchedHeading';
import { useFitScale } from './components/useFitScale';
import { copy } from './copy';
import { useCountdown } from './flow/useCountdown';

interface KioskCelebrationScreenProps {
  config: PlayyConfiguration;
  card: GeneratedCard | null;
  /** FINISH, or the countdown reaching zero: back to the intro screen */
  onAllDone: () => void;
  onPrintAnother: () => void;
}

const AUTO_RETURN_SECONDS = 20;
const CONFETTI_COLORS = ['#F59E0B', '#EC4899', '#38BDF8', '#10B981', '#A855F7'];

/** The last screen: confetti, what happens next, and an automatic return to the intro screen. */
export const KioskCelebrationScreen: React.FC<KioskCelebrationScreenProps> = ({
  config,
  card,
  onAllDone,
  onPrintAnother,
}) => {
  const secondsLeft = useCountdown(AUTO_RETURN_SECONDS, onAllDone);
  const cardScale = useFitScale(CARD_H, 0.5);

  useEffect(() => {
    playSfx('done');
    nativeFeedback.notificationSuccess();
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.55 }, colors: CONFETTI_COLORS });
    const second = setTimeout(() => confetti({ particleCount: 80, spread: 110, origin: { y: 0.4 } }), 800);
    return () => clearTimeout(second);
  }, []);

  return (
    <div className="kiosk-machine pick-page pick-success w-full h-full min-h-0 text-white select-none relative overflow-hidden">
      <SceneBackground sceneId="celebrate" />
      <BrandLogo className="head-page-logo h-12 sm:h-14 w-auto object-contain" />

      <div className="success-title">
        <ArchedHeading text={copy.success.title} />
        <p className="head-subtitle">{copy.success.thanks(config.kidName)}</p>
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
              <b>{copy.success.collect.title}</b>
              <span>{copy.success.collect.text}</span>
            </div>
          </div>
          <div className="success-step">
            <span className="success-step-icon is-pink">
              <Mail strokeWidth={2.6} />
            </span>
            <div>
              <b>{copy.success.sent.title}</b>
              <span>{copy.success.sent.text}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="machine-navigation">
        <button type="button" data-sfx="tap" onClick={onPrintAnother} className="btn-3d btn-3d-blue head-nav-button">
          <Printer strokeWidth={3.2} aria-hidden="true" />
          <span>{copy.success.printAgain}</span>
        </button>
        <div className="success-countdown">{copy.success.countdown(secondsLeft)}</div>
        <button type="button" data-sfx="done" onClick={onAllDone} className="btn-3d head-nav-button head-nav-next">
          <span>{copy.success.finish}</span>
        </button>
      </div>
    </div>
  );
};
