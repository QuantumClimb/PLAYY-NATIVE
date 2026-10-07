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

import { PrintableColoringSheet } from './components/creator/PrintableColoringSheet';
import { KioskIdleMovie } from './components/kiosk/KioskIdleMovie';
import { MagicalColoringMachine } from './components/kiosk/MagicalColoringMachine';
import { KioskCelebrationScreen } from './components/kiosk/KioskCelebrationScreen';
import { CloudPrinterModal } from './components/expo/CloudPrinterModal';
import { ExpoProjectExporterModal } from './components/expo/ExpoProjectExporterModal';

export type MachinePhase = 'idle' | 'create' | 'celebrate';

export default function App() {
  const [configuration, setConfiguration] = useState<PlayyConfiguration>(DEFAULT_CONFIGURATION);
  const [phase, setPhase] = useState<MachinePhase>('idle');

  // Hidden operator / admin modals
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isExporterOpen, setIsExporterOpen] = useState(false);

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
    setPhase('idle');
  };

  // Keyboard shortcut: Cmd+D / Ctrl+D triggers admin controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setIsAdminModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-screen h-screen min-h-screen overflow-hidden bg-slate-950 text-white flex flex-col font-sans select-none print:bg-white print:p-0">
      {/* 1. Dedicated Printable Sheet (Hidden on screen, activated during print) */}
      <PrintableColoringSheet config={configuration} />

      {/* 2. Full-Screen Full-Bleed Magical Coloring Machine */}
      <main className="w-full h-full flex-1 flex flex-col overflow-hidden print:hidden">
        {/* PHASE 1: IDLE MOVIE (Continuous loop with TAP TO CREATE) */}
        {phase === 'idle' && (
          <KioskIdleMovie
            onStart={handleStart}
            onAdminTrigger={() => setIsAdminModalOpen(true)}
          />
        )}

        {/* PHASE 2: ONE SCREEN = ONE DECISION CREATION MACHINE
            HEAD -> BODY -> POWER -> WORLD -> NAME -> REVIEW */}
        {phase === 'create' && (
          <MagicalColoringMachine
            config={configuration}
            onChangeConfig={setConfiguration}
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
      </main>

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
