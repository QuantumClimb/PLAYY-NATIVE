import React from 'react';
import { LogoArt } from '../../lib/brand/logoArt';

const LETTER_COLORS = ['#ef3b3b', '#f9a11b', '#f6cf1f', '#38b63b', '#1aa3ea', '#7b3fe0', '#f45fa0'];

/** The visitor's name in big lettering with little rays either side: rainbow in color, outlined for coloring in. */
const NameBanner: React.FC<{ name: string; mode: 'color' | 'line' }> = ({ name, mode }) => {
  const text = name.trim().toUpperCase();
  if (!text) return null;
  return (
    <div className="scene-name" data-mode={mode} style={{ ['--n' as string]: text.length } as React.CSSProperties}>
      {['l1', 'l2', 'l3', 'r1', 'r2', 'r3'].map((d) => (
        <i key={d} className={`scene-dash scene-dash-${d}`} aria-hidden="true" />
      ))}
      <span className="scene-name-text">
        {[...text].map((ch, i) => (
          <span
            key={i}
            data-ch={ch}
            style={mode === 'color' ? { color: LETTER_COLORS[i % LETTER_COLORS.length] } : undefined}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </span>
    </div>
  );
};

interface SceneFinishProps {
  mode: 'color' | 'line';
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * What turns the scene into the finished page: the logo top left, the name under the character,
 * and the contact details as a small note along the bottom. The parent needs `scene-cq` (container query units).
 */
export const SceneFinish: React.FC<SceneFinishProps> = ({ mode, name = '', email = '', phone = '' }) => {
  const notes = [email.trim(), phone.trim()].filter(Boolean).join('   ·   ');
  return (
    <>
      <LogoArt mode={mode} className="scene-logo" />
      <NameBanner name={name} mode={mode} />
      {notes && (
        <div className="scene-notes-wrap" data-mode={mode}>
          <span className="scene-notes">Notes: {notes}</span>
        </div>
      )}
    </>
  );
};

/** How much of the scene's bottom the name and notes take, so the character is stood above them. */
export const FINISH_RESERVE_BOTTOM = 0.115;
