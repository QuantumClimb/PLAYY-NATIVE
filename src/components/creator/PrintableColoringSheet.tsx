import React from 'react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { PlayyScene } from '../playys/PlayyScene';

interface PrintableColoringSheetProps {
  config: PlayyConfiguration;
}

/** Hidden on screen. Printed as the first page: the finished black-and-white scene fills the A4 printable area. */
export const PrintableColoringSheet: React.FC<PrintableColoringSheetProps> = ({ config }) => (
  <div id="printable-coloring-sheet" className="hidden print:block w-full h-full bg-white p-0 m-0">
    <PlayyScene config={config} mode="line" finish className="w-full h-full" />
  </div>
);
