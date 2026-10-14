import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { detailProblem } from '../../shared/validation.mjs';
import { SceneBackground } from '../components/backgrounds/SceneBackground';
import { BrandLogo } from '../lib/brand/brand';
import { DetailField, DetailsKeyboard } from './components/DetailsKeyboard';
import { copy } from './copy';
import { applyDetailKey } from './flow/detailsInput';
import { IDLE_SECONDS, useIdleReset } from './flow/useIdleReset';

interface KioskWelcomeProps {
  /** Carry on to the normal flow; `phone` is set when the visitor typed their number */
  onContinue: (phone?: string) => void;
  /** Back to the intro screen (idle too long) */
  onExit: () => void;
}

/** After "Tap to Start": first-timers go straight on, returning PlayyPals type their phone number first. */
export const KioskWelcome: React.FC<KioskWelcomeProps> = ({ onContinue, onExit }) => {
  const [typing, setTyping] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const touch = useIdleReset(onExit, IDLE_SECONDS);

  const press = (key: string) => {
    touch();
    if (key === 'DONE') {
      const problem = detailProblem('phone', phone);
      if (problem) return setError(problem);
      return onContinue(phone.trim());
    }
    const next = applyDetailKey('phone', phone, key);
    if (next !== null) {
      setPhone(next);
      setError('');
    }
  };

  return (
    <div
      onClick={touch}
      className="kiosk-machine welcome-screen w-full h-full min-h-0 text-white select-none relative overflow-hidden"
    >
      <SceneBackground sceneId={typing ? 'name' : 'intro'} />
      <BrandLogo className="welcome-logo" />

      {!typing ? (
        <div className="welcome-choices">
          <button
            type="button"
            data-sfx="start"
            className="btn-3d btn-3d-amber welcome-btn"
            onClick={() => onContinue()}
          >
            {copy.welcome.firstTime}
          </button>
          <button
            type="button"
            data-sfx="start"
            className="btn-3d btn-3d-blue welcome-btn"
            onClick={() => setTyping(true)}
          >
            {copy.welcome.returning}
          </button>
        </div>
      ) : (
        <div className="welcome-phone">
          <h2 className="welcome-title">{copy.welcome.phoneTitle}</h2>
          <p className="welcome-subtitle">{copy.welcome.phoneSubtitle}</p>
          <div className="details-panel">
            <DetailField
              value={phone}
              placeholder={copy.welcome.phonePlaceholder}
              onClear={() => {
                touch();
                setPhone('');
              }}
            />
            <div className="details-error" role="alert">
              {error}
            </div>
            <DetailsKeyboard layout="phone" onKey={press} />
          </div>
          <button
            type="button"
            className="btn-3d btn-3d-blue welcome-back"
            onClick={() => {
              touch();
              setTyping(false);
            }}
          >
            <ArrowLeft strokeWidth={3.4} aria-hidden="true" />
            <span>{copy.nav.back}</span>
          </button>
        </div>
      )}
    </div>
  );
};
