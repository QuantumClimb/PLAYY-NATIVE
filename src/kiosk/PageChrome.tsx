import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../lib/brand/brand';
import { useProgressTabs } from '../lib/progress/tabs';
import { ArchedHeading } from './components/ArchedHeading';
import { ColorModeToggle } from './components/ColorPanel';
import { PickForMeButton } from './components/PickForMeButton';
import { StageTabsRow } from './components/StageTabs';
import { copy } from './copy';
import type { KioskFlow } from './flow/useKioskFlow';

const TITLE_STARS = [
  ['head-title-star-left', '★'],
  ['head-title-star-right', '★'],
  ['head-title-star-bottom-left', '✦'],
  ['head-title-star-bottom-right', '✦'],
] as const;

/** The top row: the logo, the progress tabs, and "Pick for Me!" (with the question counter on the quiz page). */
const Header: React.FC<{ flow: KioskFlow }> = ({ flow }) => {
  const tabs = useProgressTabs();
  const { def, context, quiz } = flow;
  const pickForMe = def.pickForMe(context) ? <PickForMeButton onClick={flow.surprise} /> : <div className="w-20" />;

  return (
    <div className="head-header w-full flex items-center justify-between gap-3 px-1 shrink-0 z-20">
      <BrandLogo className="head-page-logo h-12 sm:h-14 w-auto object-contain" />
      <StageTabsRow active={def.stage} tabs={tabs} />
      {def.id === 'quiz' ? (
        <div className="quiz-header-actions">
          {pickForMe}
          <div
            className="quiz-inline-meta quiz-header-counter"
            aria-label={copy.questionCounter(quiz.index + 1, quiz.total)}
          >
            <div>{copy.questionCounter(quiz.index + 1, quiz.total)}</div>
          </div>
        </div>
      ) : (
        pickForMe
      )}
    </div>
  );
};

/** The big question and the line under it. */
const Title: React.FC<{ flow: KioskFlow }> = ({ flow }) => {
  const title = flow.def.title(flow.context);
  const subtitle = flow.def.subtitle(flow.context);
  return (
    <div className="head-title w-full text-center py-2 shrink-0 z-20">
      {title && (
        <>
          {TITLE_STARS.map(([className, star]) => (
            <span key={className} className={`head-title-star ${className}`} aria-hidden="true">
              {star}
            </span>
          ))}
          <ArchedHeading text={title} />
        </>
      )}
      {subtitle && (
        <p className="head-subtitle" style={{ ['--sub-chars' as string]: subtitle.length } as React.CSSProperties}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

/** Back on the left and the page's main button on the right (the quiz has none: tapping an answer moves on). */
const NavBar: React.FC<{ flow: KioskFlow }> = ({ flow }) => {
  const { def, share } = flow;
  const label = def.id === 'complete' && share.sharing ? copy.nav.sharing : def.nextLabel;
  return (
    <div className="machine-navigation w-full flex items-center justify-between px-2 pt-2 shrink-0 z-20 head-navigation">
      <button
        type="button"
        onClick={flow.back}
        className="btn-3d btn-3d-blue py-4 px-8 font-bold text-lg head-nav-button"
      >
        <ArrowLeft strokeWidth={3.4} aria-hidden="true" />
        <span>{copy.nav.back}</span>
      </button>
      {label && (
        <button
          type="button"
          onClick={flow.next}
          disabled={share.sharing}
          className="btn-3d py-5 px-10 font-bold text-xl sm:text-2xl flex items-center gap-3 head-nav-button head-nav-next"
        >
          <span>{label}</span>
          <ArrowRight strokeWidth={3.4} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

/** Everything around a page's own content: header, title, the colour-mode switch where it applies, and the nav buttons. */
export const PageChrome: React.FC<{ flow: KioskFlow; children: React.ReactNode }> = ({ flow, children }) => (
  <div className="head-content flex-1 min-w-0 min-h-0 flex flex-col">
    <Header flow={flow} />
    <Title flow={flow} />
    {flow.def.id === 'colors' && <ColorModeToggle mode={flow.colorMode} onChange={flow.setColorMode} />}
    <div className="flex-1 min-h-0 overflow-y-auto py-2 z-10 pick-options-area">{children}</div>
    <NavBar flow={flow} />
  </div>
);
