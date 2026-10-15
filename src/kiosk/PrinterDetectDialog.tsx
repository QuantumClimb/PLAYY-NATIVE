import React, { useState } from 'react';
import { X, Printer, Volume2, VolumeX } from 'lucide-react';
import { audioMuted, setAudioMuted } from '../lib/sfx/music';

interface PrinterDetectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTestPrint: () => void;
}

/** Operator tool (Alt + Shift + P): prints one test page the same way the kiosk prints. */
export const PrinterDetectDialog: React.FC<PrinterDetectDialogProps> = ({ isOpen, onClose, onTestPrint }) => {
  const [muted, setMuted] = useState(audioMuted);
  if (!isOpen) return null;
  return (
    <div
      data-sfx="none"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 print:hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 text-white shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl flex items-center gap-2">
            <Printer className="w-6 h-6" /> OPERATOR
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <button type="button" onClick={onTestPrint} className="btn-3d w-full py-3 px-4">
          TEST PRINT
        </button>
        <button
          type="button"
          aria-pressed={muted}
          onClick={() => {
            setAudioMuted(!muted);
            setMuted(!muted);
          }}
          className={`btn-3d w-full py-3 px-4 flex items-center justify-center gap-2 ${muted ? 'btn-3d-amber' : 'btn-3d-blue'}`}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          {muted ? 'SOUND OFF (TAP TO TURN ON)' : 'SOUND ON (TAP TO MUTE)'}
        </button>
      </div>
    </div>
  );
};
