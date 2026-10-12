import React from 'react';
import { AssetArt } from '../../components/playys/AssetArt';
import { SYMBOL_MAP } from '../../lib/playys/powerQuiz';
import { copy } from '../copy';
import type { StepProps } from './types';

const UNKNOWN_POWER = { name: 'Power Symbol', attribute: 'Special Ability', icon: '✨' };

/** Power awarded: the symbol, its name and what it means. The character stands on the left, holding it. */
export const PowerStep: React.FC<StepProps> = ({ config, selection }) => {
  const power = SYMBOL_MAP[config.symbol] || UNKNOWN_POWER;
  return (
    <div className="power-award-layout flex min-h-full items-center justify-center p-3">
      <section className="power-award-panel" aria-labelledby="power-awarded-title">
        <div className="power-award-ribbon">
          <span id="power-awarded-title">{copy.power.ribbon}</span>
          <i aria-hidden="true">★</i>
          <b aria-hidden="true">★</b>
        </div>
        <div className="power-award-main">
          <div className="power-symbol-display" aria-label={power.name}>
            <div className="power-symbol-glow" aria-hidden="true" />
            {selection.symbol ? (
              <AssetArt asset={selection.symbol} mode="color" main={selection.headMain} className="power-symbol-art" />
            ) : (
              <span className="power-symbol-fallback">{power.icon}</span>
            )}
          </div>
          <div className="power-award-copy">
            <span className="power-award-label">{copy.power.label}</span>
            <h2>{power.name}</h2>
            <p className="power-award-attribute">{power.attribute}</p>
            <p className="power-award-description">{copy.power.description}</p>
          </div>
        </div>
        <div className="power-award-strip">
          <div className="power-award-thumb" aria-hidden="true">
            <AssetArt asset={selection.head} face={selection.face} mode="color" main={selection.headMain} />
          </div>
          <span>{copy.power.strip}</span>
        </div>
      </section>
    </div>
  );
};
