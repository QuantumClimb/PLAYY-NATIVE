import React, { useCallback, useEffect, useState } from 'react';
import { X, Printer, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../data/api';
import { HELPER_URL, setSilentPrint, silentPrintOn } from '../lib/print/silentPrint';

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

const HOSTED_MESSAGE =
  'This kiosk is opened from the hosted website, which cannot see the printers on this computer, so none are listed. ' +
  'Printing itself still works through Chrome. To skip the print preview, switch on silent printing below (it needs the print helper on this PC) or start Chrome with --kiosk-printing.';

export const PrinterDetectDialog: React.FC<PrinterDetectDialogProps> = ({ isOpen, onClose, onTestPrint }) => {
  const [printers, setPrinters] = useState<PrinterInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [silent, setSilent] = useState(silentPrintOn);
  const [testing, setTesting] = useState(false);
  // With silent printing on, the printers are the ones the helper sees on this PC
  const base = silent ? HELPER_URL : '';

  const load = useCallback(async (request: () => Promise<{ printers: PrinterInfo[] }>) => {
    setLoading(true);
    setError(null);
    try {
      setPrinters((await request()).printers);
    } catch (e) {
      setPrinters(null);
      const msg = (e as Error).message;
      if ((e as { status?: number }).status === 404)
        // The hosted website has no access to this PC's printers (only the server on the kiosk PC does)
        setError(HOSTED_MESSAGE);
      else
        setError(
          e instanceof SyntaxError || msg === 'Failed to fetch'
            ? 'Print helper not running. Start it on this PC with: npm run print-helper'
            : msg,
        );
    } finally {
      setLoading(false);
    }
  }, []);

  const detect = useCallback(() => load(() => api.get(`${base}/api/printers`)), [load, base]);
  const setDefault = (name: string) => load(() => api.post(`${base}/api/printers/default`, { name }));

  useEffect(() => {
    if (isOpen) detect();
  }, [isOpen, detect]);

  const toggleSilent = () => {
    setSilentPrint(!silent);
    setSilent(!silent);
  };

  const testPrint = async () => {
    if (!silent) return onTestPrint();
    setTesting(true);
    setError(null);
    try {
      await api.post(`${HELPER_URL}/api/print/test`);
    } catch (e) {
      setError(`The test page could not be printed: ${(e as Error).message}`);
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  const defaultPrinter = printers?.find((p) => p.isDefault);
  const defaultOk = !!defaultPrinter && STATUS_LABEL[defaultPrinter.status].ok;

  return (
    <div
      data-sfx="none"
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

        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 space-y-1">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span>Silent printing (no print preview)</span>
            <input type="checkbox" checked={silent} onChange={toggleSilent} className="h-6 w-6 accent-teal-400" />
          </label>
          <p className="text-xs text-slate-400">
            {silent
              ? 'Prints are sent to the print helper on this PC (npm run print-helper). If it is not running, the normal print dialog opens.'
              : 'Prints open the browser print dialog. Switch on to print straight to the default printer.'}
          </p>
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
            onClick={testPrint}
            disabled={!defaultOk || testing}
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
