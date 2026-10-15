import React from 'react';
import { GeneratedCard } from '../../lib/playys/cardTypes';
import { PlayyScene } from '../playys/PlayyScene';
import { AssetArt } from '../playys/AssetArt';
import { useSelection } from '../../lib/assets/library';
import { SYMBOL_MAP } from '../../lib/playys/powerQuiz';
import { TrumpCardSettings, useTrumpCardSettings } from '../../lib/card/settings';

/** Cards are designed at a fixed 340x510 and scaled with `scale` so layout never changes. */
export const CARD_W = 340;
export const CARD_H = 510;

interface TrumpCardProps {
  card: GeneratedCard;
  scale?: number;
  /** Formatting to use instead of the saved one (the command center's live preview) */
  settings?: TrumpCardSettings;
}

const exact: React.CSSProperties = {
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
};

/** The card with its thick outline; `children` fill the space inside it. */
const ScaledFrame: React.FC<{
  scale: number;
  settings: TrumpCardSettings;
  background: string;
  children: React.ReactNode;
}> = ({ scale, settings, background, children }) => (
  <div style={{ width: CARD_W * scale, height: CARD_H * scale }}>
    <div
      style={{
        ...exact,
        width: CARD_W,
        height: CARD_H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        background: settings.outlineColor,
        borderRadius: settings.radius,
        padding: settings.outlineWidth,
        boxSizing: 'border-box',
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          ...exact,
          background,
          borderRadius: Math.max(0, settings.radius - settings.outlineWidth),
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const heroName = (card: GeneratedCard) => (card.config.kidName?.trim() || 'PLAYY HERO').toUpperCase();

/** The front: the final colored artwork the visitor made, with the logo and name, inside the outline. */
export const TrumpCardFront: React.FC<TrumpCardProps> = ({ card, scale = 1, settings }) => {
  const saved = useTrumpCardSettings();
  const s = settings ?? saved;
  return (
    <ScaledFrame scale={scale} settings={s} background="#ffffff">
      {/* The A4 artwork with the logo and name fills the card (centered, a sliver of the sides is trimmed) */}
      <PlayyScene config={card.config} mode="color" finish className="absolute left-1/2 top-0 h-full -translate-x-1/2" />
    </ScaledFrame>
  );
};

const FONT = "'Sniglet', 'Fredoka', sans-serif";

/** The back: the power, the stats and the special abilities. */
export const TrumpCardBack: React.FC<TrumpCardProps> = ({ card, scale = 1, settings }) => {
  const saved = useTrumpCardSettings();
  const s = settings ?? saved;
  const sel = useSelection(card.config);
  const { stats, archetype, id } = card;
  const power = SYMBOL_MAP[card.config.symbol] ?? { name: 'Power Symbol', attribute: 'Special Ability', icon: '✨' };
  const rows = [
    { label: 'POWER', val: stats.power, color: '#EF4444', icon: '⚔️' },
    { label: 'SPEED', val: stats.speed, color: '#EAB308', icon: '⚡' },
    { label: 'INTELLIGENCE', val: stats.intelligence, color: '#3B82F6', icon: '🧠' },
    { label: 'ENERGY', val: stats.energy, color: '#A855F7', icon: '✨' },
    { label: 'COURAGE', val: stats.courage, color: '#10B981', icon: '🦁' },
  ];
  const abilities = [archetype.specialAbility1, archetype.specialAbility2];
  const panel: React.CSSProperties = { ...exact, background: 'rgba(0, 0, 0, .24)' };

  return (
    <ScaledFrame scale={scale} settings={s} background={s.backBackground}>
      <div className="flex h-full w-full flex-col justify-between p-3 text-white">
        <div className="text-center">
          <div className="text-[10px] tracking-[0.2em]" style={{ color: s.backAccent }}>
            {heroName(card)}
          </div>
          <div className="text-lg leading-tight" style={{ fontFamily: FONT, fontWeight: 800 }}>
            {archetype.title.toUpperCase()}
          </div>
          <div className="text-[11px] text-white/70">{archetype.subTitle}</div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl p-2" style={panel}>
          <div className="h-12 w-12 shrink-0 rounded-full bg-white p-1.5 flex items-center justify-center">
            {sel.symbol ? (
              <AssetArt asset={sel.symbol} mode="color" main={sel.headMain} className="h-full w-auto" />
            ) : (
              <span className="text-2xl">{power.icon}</span>
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-[9px] tracking-widest" style={{ color: s.backAccent }}>
              YOUR POWER
            </div>
            <div className="truncate text-sm" style={{ fontFamily: FONT, fontWeight: 800 }}>
              {power.name}
            </div>
            <div className="text-[10px] leading-tight text-white/70">{power.attribute}</div>
          </div>
        </div>

        <div className="space-y-1.5 rounded-2xl p-2.5" style={panel}>
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-2 text-[10px]">
              <span className="w-28 shrink-0 text-white/85">
                {r.icon} {r.label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/30" style={exact}>
                <div className="h-full rounded-full" style={{ ...exact, width: `${r.val}%`, background: r.color }} />
              </div>
              <span className="w-6 text-right" style={{ color: s.backAccent }}>
                {r.val}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] tracking-wider" style={{ color: s.backAccent }}>
            ⚡ SPECIAL ABILITIES
          </div>
          {abilities.map((a) => (
            <div key={a.name} className="rounded-xl p-2" style={panel}>
              <div className="flex justify-between gap-2 whitespace-nowrap text-xs">
                <span>{a.name}</span>
                <span style={{ color: s.backAccent }}>DMG: {a.damage}</span>
              </div>
              <div className="text-[10px] text-white/70">{a.description}</div>
            </div>
          ))}
        </div>

        <div className="text-center text-[11px] italic text-white/80">"{archetype.quote}"</div>

        <div className="flex justify-between border-t border-white/20 pt-1 text-[9px]">
          <span className="whitespace-nowrap text-white/60">SERIAL #{id}</span>
          <span className="whitespace-nowrap" style={{ color: s.backAccent }}>
            AUTHENTIC COLLECTIBLE ★
          </span>
        </div>
      </div>
    </ScaledFrame>
  );
};
