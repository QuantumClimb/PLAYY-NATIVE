import React from 'react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { PlayyComposition } from '../playys/PlayyComposition';
import { X, Sparkles, Plus, Trash2, Printer } from 'lucide-react';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlayys: PlayyConfiguration[];
  onSelectPlayy: (config: PlayyConfiguration) => void;
  onDeletePlayy: (index: number) => void;
  onAddNew: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  savedPlayys,
  onSelectPlayy,
  onDeletePlayy,
  onAddNew,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-4 border-indigo-200 animate-scale-up">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-sky-400 to-indigo-400 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h2 className="text-lg font-black tracking-wide" style={{ fontFamily: 'Fredoka, Nunito, sans-serif' }}>
              My PLAYYS Gallery
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {savedPlayys.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-700">No saved PLAYYS yet!</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Save your favorite creations into your personal gallery to print or revisit anytime.
              </p>
              <button
                type="button"
                onClick={() => {
                  onAddNew();
                  onClose();
                }}
                className="mt-4 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Save Current PLAYY
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {savedPlayys.map((playy, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-2.5 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col items-center group relative"
                >
                  <button
                    type="button"
                    onClick={() => onDeletePlayy(idx)}
                    title="Delete"
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/90 text-red-500 hover:bg-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div
                    onClick={() => {
                      onSelectPlayy(playy);
                      onClose();
                    }}
                    className="w-full aspect-[4/5] cursor-pointer"
                  >
                    <PlayyComposition
                      config={playy}
                      mode="coloring"
                      showBackground={true}
                      showLogoHeader={false}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="w-full flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 capitalize">
                      {playy.head} • {playy.pose}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPlayy(playy);
                        onClose();
                        window.print();
                      }}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title="Quick Print"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            {savedPlayys.length} PLAYYS in collection
          </span>
          <button
            type="button"
            onClick={() => {
              onAddNew();
              onClose();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Current PLAYY
          </button>
        </div>
      </div>
    </div>
  );
};
