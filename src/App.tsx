/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PlayyConfiguration } from './lib/playys/types';
import {
  DEFAULT_CONFIGURATION,
  generateRandomConfiguration,
} from './lib/playys/configuration';

import { PrintableCardSheet } from './components/card/PrintableCardSheet';
import { GeneratedCard } from './lib/playys/cardTypes';
import { PrintableColoringSheet } from './components/creator/PrintableColoringSheet';
import { KioskIdleMovie } from './components/kiosk/KioskIdleMovie';
import { MagicalColoringMachine } from './components/kiosk/MagicalColoringMachine';
import { KioskCelebrationScreen } from './components/kiosk/KioskCelebrationScreen';
import { PrinterDetectDialog } from './components/kiosk/PrinterDetectDialog';
import { CloudPrinterModal } from './components/expo/CloudPrinterModal';
import { ExpoProjectExporterModal } from './components/expo/ExpoProjectExporterModal';

export type MachinePhase = 'idle' | 'create' | 'celebrate';

export default function App() {
  const [configuration, setConfiguration] = useState<PlayyConfiguration>(DEFAULT_CONFIGURATION);
  const [card, setCard] = useState<GeneratedCard | null>(null);
  const [phase, setPhase] = useState<MachinePhase>('idle');

  // Hidden operator / admin modals
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isExporterOpen, setIsExporterOpen] = useState(false);
  const [isPrinterDetectOpen, setIsPrinterDetectOpen] = useState(false);

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
        {phase === 'idle' && (
          <KioskIdleMovie
            onStart={handleStart}
            onAdminTrigger={() => setIsAdminModalOpen(true)}
          />
        )}

        {/* Inner pages share the footer; the start page has none */}
        {phase !== 'idle' && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
                  onAllDone={handleResetToIdle}
                  onPrintAnother={handlePrint}
                />
              )}
            </div>
            <img
              src="/assets/footer.png"
              alt=""
              draggable={false}
              className="w-full h-auto max-h-24 object-contain shrink-0 bg-slate-950"
            />
          </div>
        )}
      </main>

      <PrinterDetectDialog
        isOpen={isPrinterDetectOpen}
        onClose={() => setIsPrinterDetectOpen(false)}
        onTestPrint={handlePrint}
      />

      {/* 3. Hidden Operator / Cloud & USB Printer Modal (Triggered by 5s Logo Hold or Cmd+D) */}
      <CloudPrinterModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        characterDescription={`${configuration.head.toUpperCase()} - ${configuration.pose.toUpperCase()} by ${
          configuration.kidName ? configuration.kidName.toUpperCase() : 'PLAYY'
        }`}
      />

      {/* 4. Operator Project Code Exporter Modal */}
      <ExpoProjectExporterModal
        isOpen={isExporterOpen}
        onClose={() => setIsExporterOpen(false)}
      />
    </div>
  );
}
