import React from 'react';
import { HeadId } from '../../lib/playys/types';
import { HEADS } from '../../lib/playys/heads';
import { BlueHead } from '../playys/heads/BlueHead';
import { DreamyyHead } from '../playys/heads/DreamyyHead';
import { SparkyyHead } from '../playys/heads/SparkyyHead';
import { Check } from 'lucide-react';

interface HeadSelectorProps {
  selectedHead: HeadId;
  onSelectHead: (head: HeadId) => void;
}

export const HeadSelector: React.FC<HeadSelectorProps> = ({
  selectedHead,
  onSelectHead,
}) => {
  const renderMiniHead = (id: HeadId) => {
    switch (id) {
      case 'blue':
        return (
          <svg viewBox="280 270 290 280" className="w-full h-full object-contain">
            <BlueHead mode="color" x={425} y={420} scale={0.95} />
          </svg>
        );
      case 'dreamyy':
        return (
          <svg viewBox="280 270 290 280" className="w-full h-full object-contain">
            <DreamyyHead mode="color" x={425} y={420} scale={0.95} />
          </svg>
        );
      case 'sparkyy':
        return (
          <svg viewBox="280 260 290 290" className="w-full h-full object-contain">
            <SparkyyHead mode="color" x={425} y={420} scale={0.95} />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div id="step-1-head" className="bg-white rounded-2xl p-4 shadow-sm border-2 border-pink-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
          1
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800 leading-tight">Choose a Head</h3>
          <p className="text-xs text-gray-700">Pick your Playy's personality</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {HEADS.map((head) => {
          const isSelected = selectedHead === head.id;
          return (
            <button
              key={head.id}
              id={`head-btn-${head.id}`}
              type="button"
              onClick={() => onSelectHead(head.id)}
              className={`relative flex flex-col items-center justify-between p-2 rounded-xl border-3 transition-all duration-200 cursor-pointer bg-slate-50 hover:bg-white hover:shadow-md ${
                isSelected
                  ? 'border-pink-500 bg-pink-50/50 shadow-md ring-2 ring-pink-300 scale-102'
                  : 'border-slate-200 hover:border-pink-200'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center overflow-hidden">
                {renderMiniHead(head.id)}
              </div>

              <span
                className={`text-xs font-bold mt-1 tracking-wide ${
                  isSelected ? 'text-pink-600' : 'text-gray-700'
                }`}
              >
                {head.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
