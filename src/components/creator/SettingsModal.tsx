import React from 'react';
import { X, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageSize: 'letter' | 'a4';
  onSetPageSize: (size: 'letter' | 'a4') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  pageSize,
  onSetPageSize,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full flex flex-col overflow-hidden shadow-2xl border-4 border-slate-200">
        <div className="p-4 bg-slate-800 text-white flex items-center justify-between">
          <h3 className="text-base font-bold">Print & Page Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 bg-slate-50">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Default Paper Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSetPageSize('letter')}
                className={`p-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-between cursor-pointer transition-all ${
                  pageSize === 'letter'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="font-black">US Letter</div>
                  <div className="text-[10px] text-slate-500">8.5 × 11 in</div>
                </div>
                {pageSize === 'letter' && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => onSetPageSize('a4')}
                className={`p-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-between cursor-pointer transition-all ${
                  pageSize === 'a4'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="font-black">A4 Standard</div>
                  <div className="text-[10px] text-slate-500">210 × 297 mm</div>
                </div>
                {pageSize === 'a4' && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs text-slate-600">
            <p className="font-bold text-slate-800 mb-1">Coloring Tip</p>
            <p>
              When printing, choose "Fit to printable area" or "100% scale" in your printer settings
              for optimal crisp line art reproduction.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
