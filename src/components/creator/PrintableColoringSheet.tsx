import React from 'react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { PlayyScene } from '../playys/PlayyScene';

interface PrintableColoringSheetProps {
  config: PlayyConfiguration;
}

/** Hidden on screen. Printed as the first two pages: the black-and-white scene, then the full-colour one, each filling the A4 printable area. */
export const PrintableColoringSheet: React.FC<PrintableColoringSheetProps> = ({ config }) => (
  <div id="printable-coloring-sheet" className="hidden print:block w-full bg-white p-0 m-0">
    <div className="print-page">
      <PlayyScene config={config} mode="line" finish className="w-full h-full" />
    </div>
    <div className="print-page">
      <PlayyScene config={config} mode="color" finish className="w-full h-full" />
    </div>
  </div>
);
