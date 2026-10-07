import React from 'react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { PlayyComposition } from '../playys/PlayyComposition';

interface PrintableColoringSheetProps {
  config: PlayyConfiguration;
}

export const PrintableColoringSheet: React.FC<PrintableColoringSheetProps> = ({ config }) => {
  return (
    <div
      id="printable-coloring-sheet"
      className="hidden print:block w-full h-full bg-white p-0 m-0"
      style={{ width: '100%', height: '100%' }}
    >
      <div className="w-full h-full flex flex-col items-center justify-between p-2">
        <div className="w-full flex-1 flex items-center justify-center">
          <PlayyComposition
            id="print-svg-target"
            config={config}
            mode="coloring"
            showBackground={true}
            showLogoHeader={true}
            className="w-full max-h-[96vh] object-contain"
          />
        </div>

        {/* Subtle footer */}
        <div className="text-center text-[10px] text-gray-500 font-bold tracking-wider pt-1">
          {config.kidName && config.kidName.trim()
            ? `PLAYYS • Coloring page created by ${config.kidName.toUpperCase()} • Color your brighter world!`
            : 'PLAYYS • Small Playys. Big Imagination! • Color your brighter world!'}
        </div>
      </div>
    </div>
  );
};
