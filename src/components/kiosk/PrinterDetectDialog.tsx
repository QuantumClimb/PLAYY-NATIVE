import React, { useCallback, useEffect, useState } from 'react';
import { X, Printer, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PrinterInfo {
  name: string;
  isDefault: boolean;
  status: 'ready' | 'printing' | 'warming-up' | 'error' | 'offline' | 'unknown';
}

interface PrinterDetectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTestPrint: () => void;
}

const STATUS_LABEL: Record<PrinterInfo['status'], { text: string; ok: boolean }> = {
  ready: { text: 'Ready', ok: true },
  printing: { text: 'Printing', ok: true },
  'warming-up': { text: 'Warming up', ok: true },
  error: { text: 'Error', ok: false },
  offline: { text: 'Offline', ok: false },
  unknown: { text: 'Unknown', ok: false },
};

export const PrinterDetectDialog: React.FC<PrinterDetectDialogProps> = ({
  isOpen,
  onClose,
  onTestPrint,
}) => {
  const [printers, setPrinters] = useState<PrinterInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const call = useCallback(async (url: string, init?: RequestInit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, init);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setPrinters(data.printers);
    } catch (e) {
      setPrinters(null);
      const msg = (e as Error).message;
      setError(
        e instanceof SyntaxError || msg === 'Failed to fetch'
          ? 'Printer helper not running. Start it with: npm run server'
          : msg,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const detect = useCallback(() => call('/api/printers'), [call]);

  const setDefault = (name: string) =>
    call('/api/printers/default', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

  useEffect(() => {
    if (isOpen) detect();
  }, [isOpen, detect]);

  if (!isOpen) return null;

  const defaultPrinter = printers?.find((p) => p.isDefault);
  const defaultOk = !!defaultPrinter && STATUS_LABEL[defaultPrinter.status].ok;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 print:hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 text-white shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl flex items-center gap-2">
            <Printer className="w-6 h-6" /> DETECT PRINTER
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-950/60 border border-red-800 p-3 text-sm text-red-200">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {printers && printers.length === 0 && (
          <p className="text-sm text-slate-300">No printers found on this computer. Check the USB cable and driver.</p>
        )}

        {printers && printers.length > 0 && (
          <ul className="space-y-2 max-h-72 overflow-y-auto">
            {printers.map((p) => {
              const st = STATUS_LABEL[p.status];
              return (
                <li
                  key={p.name}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                    p.isDefault ? 'border-teal-400 bg-teal-950/40' : 'border-slate-700 bg-slate-800/60'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate">{p.name}</div>
                    <div className={`text-xs flex items-center gap-1 ${st.ok ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {st.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {st.text}
                      {p.isDefault && <span className="text-teal-300 ml-2">DEFAULT</span>}
                    </div>
                  </div>
                  {!p.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefault(p.name)}
                      className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600"
                    >
                      Set as default
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {printers && printers.length > 0 && (
          <p className={`text-sm ${defaultOk ? 'text-emerald-300' : 'text-amber-300'}`}>
            {defaultOk
              ? `Prints will go straight to "${defaultPrinter!.name}" when Chrome runs with --kiosk-printing.`
              : 'Set a ready printer as the default. Prints use the default printer.'}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={detect}
            disabled={loading}
            className="btn-3d btn-3d-blue flex-1 py-3 px-4 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> DETECT
          </button>
          <button
            type="button"
            onClick={onTestPrint}
            disabled={!defaultOk}
            className="btn-3d flex-1 py-3 px-4 disabled:opacity-50"
          >
            TEST PRINT
          </button>
        </div>
        <p className="text-xs text-slate-400">Shortcut: Alt + Shift + P</p>
      </div>
    </div>
  );
};
