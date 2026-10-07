import React from 'react';
import { SymbolId } from '../../lib/playys/types';
import { SYMBOLS } from '../../lib/playys/symbols';
import { SymbolRenderer } from '../playys/symbols/SymbolRenderer';
import { Check } from 'lucide-react';

interface SymbolSelectorProps {
  selectedSymbol: SymbolId;
  onSelectSymbol: (symbol: SymbolId) => void;
}

export const SymbolSelector: React.FC<SymbolSelectorProps> = ({
  selectedSymbol,
  onSelectSymbol,
}) => {
  return (
    <div id="step-3-symbol" className="bg-white rounded-2xl p-4 shadow-sm border-2 border-blue-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
          3
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800 leading-tight">Choose a Symbol</h3>
          <p className="text-xs text-gray-700">Put something special on the hoodie</p>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {SYMBOLS.map((symbol) => {
          const isSelected = selectedSymbol === symbol.id;
          return (
            <button
              key={symbol.id}
              id={`symbol-btn-${symbol.id}`}
              type="button"
              onClick={() => onSelectSymbol(symbol.id)}
              title={symbol.name}
              className={`relative flex flex-col items-center justify-center aspect-square p-2 rounded-xl border-3 transition-all duration-200 cursor-pointer bg-slate-50 hover:bg-white hover:shadow-md ${
                isSelected
                  ? 'border-pink-500 bg-pink-50/60 shadow-md ring-2 ring-pink-300 scale-105'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1 w-4.5 h-4.5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm z-10">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <svg viewBox="-40 -40 80 80" className="w-full h-full overflow-visible pointer-events-none">
                  <SymbolRenderer id={symbol.id} mode="color" x={0} y={0} scale={0.9} />
                </svg>
              </div>

              <span
                className={`text-[10px] font-bold mt-1 text-center truncate max-w-full ${
                  isSelected ? 'text-pink-600' : 'text-gray-600'
                }`}
              >
                {symbol.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
