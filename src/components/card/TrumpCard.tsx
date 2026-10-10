import React from 'react';
import { GeneratedCard } from '../../lib/playys/cardTypes';
import { PlayyScene } from '../playys/PlayyScene';

/** Cards are designed at a fixed 340x510 and scaled with `scale` so layout never changes. */
export const CARD_W = 340;
export const CARD_H = 510;

interface TrumpCardProps {
  card: GeneratedCard;
  scale?: number;
}

const exact: React.CSSProperties = {
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
};

const ScaledFrame: React.FC<{ scale: number; border: string; children: React.ReactNode }> = ({
  scale,
  border,
  children,
}) => (
  <div style={{ width: CARD_W * scale, height: CARD_H * scale }}>
    <div
      style={{
        ...exact,
        width: CARD_W,
        height: CARD_H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        background: border,
        borderRadius: 24,
        padding: 8,
        boxSizing: 'border-box',
        boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
      }}
    >
      <div
        className="w-full h-full flex flex-col justify-between text-white"
        style={{
          ...exact,
          background: '#0F172A',
          borderRadius: 18,
          padding: 12,
          boxSizing: 'border-box',
          border: '2px solid #FEF08A',
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

export const heroName = (card: GeneratedCard) => (card.config.kidName?.trim() || 'PLAYY HERO').toUpperCase();

export const TrumpCardFront: React.FC<TrumpCardProps> = ({ card, scale = 1 }) => {
  const { config, stats, archetype, id } = card;
  const pills = [
    { icon: '⚔️', val: stats.power, lbl: 'PWR' },
    { icon: '⚡', val: stats.speed, lbl: 'SPD' },
    { icon: '🧠', val: stats.intelligence, lbl: 'INT' },
    { icon: '✨', val: stats.energy, lbl: 'NRG' },
  ];

  return (
    <ScaledFrame scale={scale} border="#FACC15">
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-xl text-xs border border-sky-400" style={{ ...exact, background: '#1E293B' }}>
          {archetype.element}
        </span>
        <span className="px-2.5 py-1 rounded-xl text-[11px] tracking-wider text-yellow-300" style={{ ...exact, background: '#7C3AED' }}>
          {archetype.rarity.toUpperCase()}
        </span>
      </div>

      <div className="text-center">
        <div className="text-lg truncate" style={{ fontFamily: "'Sniglet', 'Fredoka', sans-serif", fontWeight: 800 }}>
          {heroName(card)}
        </div>
        <div className="text-[11px] tracking-wider text-slate-400">{archetype.title}</div>
      </div>

      <div className="rounded-2xl overflow-hidden bg-white p-1 flex items-center justify-center" style={{ height: CARD_H * 0.6 }}>
        <PlayyScene config={config} mode="color" className="h-full" />
      </div>

      <div className="flex justify-around rounded-2xl p-1.5" style={{ ...exact, background: '#1E293B' }}>
        {pills.map((p) => (
          <div key={p.lbl} className="flex flex-col items-center leading-tight">
            <span className="text-[13px]">{p.icon}</span>
            <span className="text-[13px] text-yellow-400">{p.val}</span>
            <span className="text-[9px] text-slate-500">{p.lbl}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-1 text-[10px] border-t border-slate-700">
        <span className="text-slate-500">ID: #{id.toUpperCase()}</span>
        <span className="text-sky-400">PLAYYS TRUMP CARD</span>
      </div>
    </ScaledFrame>
  );
};

export const TrumpCardBack: React.FC<TrumpCardProps> = ({ card, scale = 1 }) => {
  const { stats, archetype, id } = card;
  const rows = [
    { label: 'POWER', val: stats.power, color: '#EF4444', icon: '⚔️' },
    { label: 'SPEED', val: stats.speed, color: '#EAB308', icon: '⚡' },
    { label: 'INTELLIGENCE', val: stats.intelligence, color: '#3B82F6', icon: '🧠' },
    { label: 'ENERGY', val: stats.energy, color: '#A855F7', icon: '✨' },
    { label: 'COURAGE', val: stats.courage, color: '#10B981', icon: '🦁' },
  ];
  const abilities = [archetype.specialAbility1, archetype.specialAbility2];

  return (
    <ScaledFrame scale={scale} border="#3B82F6">
      <div className="text-center">
        <div className="text-[10px] tracking-[0.2em] text-sky-400">CHARACTER DOSSIER</div>
        <div className="text-lg" style={{ fontFamily: "'Sniglet', 'Fredoka', sans-serif", fontWeight: 800 }}>
          {archetype.title.toUpperCase()}
        </div>
        <div className="text-[11px] text-slate-400">{archetype.subTitle}</div>
      </div>

      <div className="space-y-1.5 rounded-2xl p-2.5" style={{ ...exact, background: '#1E293B' }}>
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-[10px]">
            <span className="w-28 shrink-0 text-slate-300">
              {r.icon} {r.label}
            </span>
            <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden" style={exact}>
              <div className="h-full rounded-full" style={{ ...exact, width: `${r.val}%`, background: r.color }} />
            </div>
            <span className="w-6 text-right text-yellow-400">{r.val}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="text-[11px] tracking-wider text-yellow-300">⚡ SPECIAL ABILITIES</div>
        {abilities.map((a) => (
          <div key={a.name} className="rounded-xl p-2" style={{ ...exact, background: '#1E293B' }}>
            <div className="flex justify-between text-xs">
              <span>{a.name}</span>
              <span className="text-yellow-400">DMG: {a.damage}</span>
            </div>
            <div className="text-[10px] text-slate-400">{a.description}</div>
          </div>
        ))}
      </div>

      <div className="text-center text-[11px] italic text-violet-300">"{archetype.quote}"</div>

      <div className="flex justify-between pt-1 text-[9px] border-t border-slate-700">
        <span className="text-slate-500">CARD SERIAL: #{id.toUpperCase()}</span>
        <span className="text-yellow-400">AUTHENTIC COLLECTIBLE ★</span>
      </div>
    </ScaledFrame>
  );
};
