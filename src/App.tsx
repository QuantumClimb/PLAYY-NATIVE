/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { PlayyConfiguration } from './lib/playys/types';
import { DEFAULT_CONFIGURATION } from './lib/playys/configuration';

import { PrintableCardSheet } from './components/card/PrintableCardSheet';
import { GeneratedCard } from './lib/playys/cardTypes';
import { PrintableColoringSheet } from './components/creator/PrintableColoringSheet';
import { KioskIdleMovie } from './kiosk/KioskIdleMovie';
import { KioskFlow } from './kiosk/KioskFlow';
import { KioskWelcome } from './kiosk/KioskWelcome';
import { KioskCelebrationScreen } from './kiosk/KioskCelebrationScreen';
import { PrinterDetectDialog } from './kiosk/PrinterDetectDialog';
import { printSilently } from './lib/print/silentPrint';
import { saveLead } from './lib/share/leads';
import { retryPendingShare } from './lib/share/send';

// Operator tools: only loaded when an operator opens them, so the kiosk does not carry their code
const CloudPrinterModal = lazy(() =>
  import('./tools/CloudPrinterModal').then((m) => ({ default: m.CloudPrinterModal })),
);
const ExpoProjectExporterModal = lazy(() =>
  import('./tools/ExpoProjectExporterModal').then((m) => ({ default: m.ExpoProjectExporterModal })),
);

export type MachinePhase = 'idle' | 'welcome' | 'create' | 'celebrate';

export default function App() {
  const [configuration, setConfiguration] = useState<PlayyConfiguration>(DEFAULT_CONFIGURATION);
  const [card, setCard] = useState<GeneratedCard | null>(null);
  const [phase, setPhase] = useState<MachinePhase>('idle');

  // The card is made when the power-up questions end, before the name is typed: it always shows the current choices
  const liveCard = useMemo(() => (card ? { ...card, config: configuration } : null), [card, configuration]);

  // Hidden operator / admin modals
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isExporterOpen, setIsExporterOpen] = useState(false);
  const [isPrinterDetectOpen, setIsPrinterDetectOpen] = useState(false);

  // A Playy that could not be sent last time (no connection) goes out when the kiosk starts again
  useEffect(() => {
    void retryPendingShare();
  }, []);

  // Trigger browser / local print service
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Flow handlers
  const handleStart = () => {
    setPhase('welcome');
  };

  /** "FIRST TIME?" carries on as is; "Already a PlayyPal?" brings a phone number that is kept and pre-filled */
  const handleWelcomed = (phone?: string) => {
    if (phone) {
      saveLead(phone);
      setConfiguration((c) => ({ ...c, phone }));
    }
    setPhase('create');
  };

  // Pages the print helper already printed need no print dialog
  const handleFinishAndPrint = (printed: boolean) => {
    if (!printed) handlePrint();
    setPhase('celebrate');
  };

  const handlePrintAgain = async () => {
    if (!(await printSilently(null))) handlePrint();
  };

  const handleResetToIdle = () => {
    setConfiguration(DEFAULT_CONFIGURATION);
    setCard(null);
    setPhase('idle');
  };

  // Keyboard shortcut: Cmd+D / Ctrl+D triggers admin controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Shift+P opens DETECT PRINTER (not reserved by the browser or Windows)
      if (e.altKey && e.shiftKey && e.code === 'KeyP') {
        e.preventDefault();
        setIsPrinterDetectOpen((prev) => !prev);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setIsAdminModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-screen h-screen min-h-screen overflow-hidden bg-slate-950 text-white flex flex-col select-none print:bg-white print:p-0 print:h-auto print:overflow-visible">
      {/* 1. Dedicated Printable Sheet (Hidden on screen, activated during print) */}
      <PrintableColoringSheet config={configuration} />
      <PrintableCardSheet card={liveCard} />

      {/* 2. Full-Screen Full-Bleed Magical Coloring Machine */}
      <main className="w-full h-full flex-1 flex flex-col overflow-hidden print:hidden">
        {/* PHASE 1: IDLE MOVIE (Continuous loop with TAP TO CREATE) */}
        {phase === 'idle' && <KioskIdleMovie onStart={handleStart} onAdminTrigger={() => setIsAdminModalOpen(true)} />}

        {/* Inner pages share the footer; the start page has none */}
        {phase !== 'idle' && (
          <div className="kiosk-create-shell flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {phase === 'welcome' && <KioskWelcome onContinue={handleWelcomed} onExit={handleResetToIdle} />}

              {/* PHASE 2: ONE SCREEN = ONE DECISION CREATION MACHINE
                  the whole journey, from the first choice to SHARE */}
              {phase === 'create' && (
                <KioskFlow
                  config={configuration}
                  onChangeConfig={setConfiguration}
                  card={liveCard}
                  onCardChange={setCard}
                  onFinish={handleFinishAndPrint}
                  onExit={handleResetToIdle}
                />
              )}

              {/* PHASE 3: CELEBRATION (YOUR PLAYY IS READY! -> AUTO RETURN TO IDLE) */}
              {phase === 'celebrate' && (
                <KioskCelebrationScreen
                  config={configuration}
                  card={liveCard}
                  onAllDone={handleResetToIdle}
                  onPrintAnother={handlePrintAgain}
                />
              )}
            </div>
            <img
              src="/assets/footer.png"
              alt=""
              draggable={false}
              className="kiosk-footer w-full h-auto max-h-20 object-contain shrink-0 bg-slate-950"
            />
          </div>
        )}
      </main>

      <PrinterDetectDialog
        isOpen={isPrinterDetectOpen}
        onClose={() => setIsPrinterDetectOpen(false)}
        onTestPrint={handlePrint}
      />

      {/* 3. Hidden operator tools (opened by holding the logo for 4.5 seconds, or Ctrl+D) */}
      <Suspense fallback={null}>
        {isAdminModalOpen && (
          <CloudPrinterModal
            isOpen
            onClose={() => setIsAdminModalOpen(false)}
            characterDescription={`${configuration.head.toUpperCase()} - ${configuration.pose.toUpperCase()} by ${
              configuration.kidName ? configuration.kidName.toUpperCase() : 'PLAYY'
            }`}
          />
        )}
        {isExporterOpen && <ExpoProjectExporterModal isOpen onClose={() => setIsExporterOpen(false)} />}
      </Suspense>
    </div>
  );
}
