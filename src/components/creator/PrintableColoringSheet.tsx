import React from 'react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { PlayyScene } from '../playys/PlayyScene';

interface PrintableColoringSheetProps {
  config: PlayyConfiguration;
}

/** Hidden on screen. Printed as the first page: the black-and-white scene fills the A4 printable area. */
export const PrintableColoringSheet: React.FC<PrintableColoringSheetProps> = ({ config }) => {
  const name = config.kidName?.trim();
  return (
    <div id="printable-coloring-sheet" className="hidden print:block w-full h-full bg-white p-0 m-0">
      <div className="relative w-full h-full">
        <PlayyScene config={config} mode="line" className="w-full h-full" />
        <div className="absolute bottom-[1%] left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white text-[10px] font-bold tracking-wider text-gray-600 whitespace-nowrap border border-gray-400">
          {name ? `PLAYYS • Coloring page created by ${name.toUpperCase()}` : 'PLAYYS • Small Playys. Big Imagination!'}
        </div>
      </div>
    </div>
  );
};
