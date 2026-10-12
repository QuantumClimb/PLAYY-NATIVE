/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { PlayyConfiguration } from './lib/playys/types';
import { DEFAULT_CONFIGURATION } from './lib/playys/configuration';

import { PrintableCardSheet } from './components/card/PrintableCardSheet';
import { GeneratedCard } from './lib/playys/cardTypes';
import { PrintableColoringSheet } from './components/creator/PrintableColoringSheet';
import { KioskIdleMovie } from './components/kiosk/KioskIdleMovie';
import { MagicalColoringMachine } from './components/kiosk/MagicalColoringMachine';
import { KioskCelebrationScreen } from './components/kiosk/KioskCelebrationScreen';
import { PrinterDetectDialog } from './components/kiosk/PrinterDetectDialog';
import { retryPendingShare } from './lib/share/send';

// Operator tools: only loaded when an operator opens them, so the kiosk does not carry their code
const CloudPrinterModal = lazy(() =>
  import('./tools/CloudPrinterModal').then((m) => ({ default: m.CloudPrinterModal })),
);
const ExpoProjectExporterModal = lazy(() =>
  import('./tools/ExpoProjectExporterModal').then((m) => ({ default: m.ExpoProjectExporterModal })),
);

export type MachinePhase = 'idle' | 'create' | 'celebrate';

export default function App() {
  const [configuration, setConfiguration] = useState<PlayyConfiguration>(DEFAULT_CONFIGURATION);
  const [card, setCard] = useState<GeneratedCard | null>(null);
  const [phase, setPhase] = useState<MachinePhase>('idle');

  // Hidden operator / admin modals
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isExporterOpen, setIsExporterOpen] = useState(false);
  const [isPrinterDetectOpen, setIsPrinterDetectOpen] = useState(false);

  // A Playyy that could not be sent last time (no connection) goes out when the kiosk starts again
  useEffect(() => {
    void retryPendingShare();
  }, []);

  // Trigger browser / local print service
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Flow handlers
  const handleStart = () => {
    setPhase('create');
  };

  const handleFinishAndPrint = () => {
    handlePrint();
    setPhase('celebrate');
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
      <PrintableCardSheet card={card} />

      {/* 2. Full-Screen Full-Bleed Magical Coloring Machine */}
      <main className="w-full h-full flex-1 flex flex-col overflow-hidden print:hidden">
        {/* PHASE 1: IDLE MOVIE (Continuous loop with TAP TO CREATE) */}
        {phase === 'idle' && <KioskIdleMovie onStart={handleStart} onAdminTrigger={() => setIsAdminModalOpen(true)} />}

        {/* Inner pages share the footer; the start page has none */}
        {phase !== 'idle' && (
          <div className="kiosk-create-shell flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {/* PHASE 2: ONE SCREEN = ONE DECISION CREATION MACHINE
                  HEAD -> BODY -> POWER -> WORLD -> NAME -> REVIEW */}
              {phase === 'create' && (
                <MagicalColoringMachine
                  config={configuration}
                  onChangeConfig={setConfiguration}
                  card={card}
                  onCardChange={setCard}
                  onFinishAndPrint={handleFinishAndPrint}
                  onAutoReset={handleResetToIdle}
                />
              )}

              {/* PHASE 3: CELEBRATION (YOUR PLAYY IS READY! -> AUTO RETURN TO IDLE) */}
              {phase === 'celebrate' && (
                <KioskCelebrationScreen
                  config={configuration}
                  card={card}
                  onAllDone={handleResetToIdle}
                  onPrintAnother={handlePrint}
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
