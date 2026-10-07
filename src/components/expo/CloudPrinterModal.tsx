import React, { useState } from 'react';
import {
  X,
  Printer,
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  Server,
  Zap,
  ShieldCheck,
  ChevronRight,
  Code2,
  Terminal,
  Cpu,
  Usb,
} from 'lucide-react';
import {
  CloudPrinterConfig,
  DEFAULT_CLOUD_PRINTER_CONFIG,
  PrintJobStatus,
  CLOUD_PRINT_CODE_SNIPPETS,
} from '../../lib/playys/cloudPrintService';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

interface CloudPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterDescription: string;
}

export const CloudPrinterModal: React.FC<CloudPrinterModalProps> = ({
  isOpen,
  onClose,
  characterDescription,
}) => {
  const [config, setConfig] = useState<CloudPrinterConfig>(DEFAULT_CLOUD_PRINTER_CONFIG);
  const [activeTab, setActiveTab] = useState<'canonUsb' | 'test' | 'code'>('canonUsb');
  const [codeLanguage, setCodeLanguage] = useState<'canonUsbKiosk' | 'printnodeUsb' | 'nodeUsbService' | 'raspberryPiCups'>('canonUsbKiosk');
  const [copiedCode, setCopiedCode] = useState(false);

  // Simulated Print Job dispatch state
  const [jobStatus, setJobStatus] = useState<PrintJobStatus>({
    id: '',
    stage: 'idle',
    progress: 0,
    message: 'Ready to dispatch to Canon PIXMA G2430 USB connection.',
    timestamp: '',
  });

  if (!isOpen) return null;

  const handleCopyCode = () => {
    nativeFeedback.impactLight();
    navigator.clipboard.writeText(CLOUD_PRINT_CODE_SNIPPETS[codeLanguage]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTriggerPrint = () => {
    nativeFeedback.notificationSuccess();
    const jobId = 'USB-G2430-' + Math.floor(1000 + Math.random() * 9000);

    // Step 1: Rendering
    setJobStatus({
      id: jobId,
      stage: 'generating',
      progress: 25,
      message: '1. Converting vector SVG coloring page into 300 DPI print data...',
      timestamp: new Date().toLocaleTimeString(),
      jobId,
    });

    // Step 2: Transmitting over USB Cable
    setTimeout(() => {
      nativeFeedback.impactLight();
      setJobStatus({
        id: jobId,
        stage: 'transmitting',
        progress: 60,
        message: '2. Sending raw print stream over USB cable to Canon PIXMA G2430...',
        timestamp: new Date().toLocaleTimeString(),
        jobId,
      });
    }, 700);

    // Step 3: Spooling & Head Movement
    setTimeout(() => {
      nativeFeedback.impactMedium();
      setJobStatus({
        id: jobId,
        stage: 'spooling',
        progress: 85,
        message: '3. Canon PIXMA G2430 hardware detected print job. Feeding paper from rear tray...',
        timestamp: new Date().toLocaleTimeString(),
        jobId,
      });
    }, 1500);

    // Step 4: Completed
    setTimeout(() => {
      nativeFeedback.notificationSuccess();
      setJobStatus({
        id: jobId,
        stage: 'completed',
        progress: 100,
        message: '4. Paper fed and printed! Ready in output tray for the child.',
        timestamp: new Date().toLocaleTimeString(),
        jobId,
      });
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-700 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Usb className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Canon PIXMA G2430 USB Printing Guide</h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Wired USB Model
                </span>
              </div>
              <p className="text-xs text-sky-100 font-medium">
                How to dispatch prints to the non-Wi-Fi Canon G2430 from touch screen kiosks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 px-5 pt-3 border-b border-slate-800 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              nativeFeedback.selection();
              setActiveTab('canonUsb');
            }}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all cursor-pointer border-t-2 ${
              activeTab === 'canonUsb'
                ? 'bg-slate-900 text-white border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            1. USB Physical Setup & How It Works
          </button>

          <button
            type="button"
            onClick={() => {
              nativeFeedback.selection();
              setActiveTab('test');
            }}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all cursor-pointer border-t-2 ${
              activeTab === 'test'
                ? 'bg-slate-900 text-white border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            2. Test USB Print Queue
          </button>

          <button
            type="button"
            onClick={() => {
              nativeFeedback.selection();
              setActiveTab('code');
            }}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all cursor-pointer border-t-2 ${
              activeTab === 'code'
                ? 'bg-slate-900 text-white border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            3. 1-Click Kiosk Scripts & Code
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-900">
          {/* TAB 1: HOW THE CANON G2430 USB DISPATCH WORKS */}
          {activeTab === 'canonUsb' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Highlight Card */}
              <div className="bg-amber-500/10 border border-amber-400/30 p-4 rounded-2xl">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 mb-1">
                  <Usb className="w-4 h-4 text-amber-400" />
                  Your Hardware: Canon PIXMA G2430 (USB Only, No Wi-Fi)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Because the <strong>Canon PIXMA G2430</strong> does not have built-in Wi-Fi, it cannot receive wireless signals directly on its own. 
                  However, you can easily connect and dispatch prints in <strong>two common ways</strong>:
                </p>
              </div>

              {/* Physical Wiring Diagram */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Physical Hardware Wiring Diagram
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
                  <div className="flex-1 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-sm font-bold text-indigo-400">1. Touch Screen TV</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Kids tap &quot;Print My Playy&quot;</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 hidden sm:block" />
                  <div className="flex-1 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-sm font-bold text-sky-400">2. Host Computer / Pi</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Mini-PC mounted behind TV</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 hidden sm:block" />
                  <div className="flex-1 bg-slate-900 p-3.5 rounded-xl border border-amber-400/40 bg-amber-950/20">
                    <div className="text-sm font-bold text-amber-400">3. USB Type-B Cable</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">Direct wired connection</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 hidden sm:block" />
                  <div className="flex-1 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-sm font-bold text-emerald-400">4. Canon G2430</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Prints coloring sheet!</div>
                  </div>
                </div>
              </div>

              {/* The Two Best Solutions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method A: Silent Kiosk Print (Simplest & Best) */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-indigo-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        Method A: Recommended
                      </span>
                      <span className="text-xs text-slate-400 font-mono">0 Extra Hardware</span>
                    </div>
                    <h4 className="text-base font-bold text-white">Direct Silent Kiosk USB Mode</h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      If the Touch Screen TV is connected to a mini-PC, laptop, or Intel NUC running Windows or Linux:
                    </p>
                    <ol className="text-xs text-slate-300 mt-2 space-y-1.5 list-decimal pl-4">
                      <li>Plug the Canon G2430 USB cable into the PC and set it as <strong>Default Printer</strong> in Windows.</li>
                      <li>Launch Chrome/Edge with the <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono text-[11px]">--kiosk-printing</code> flag.</li>
                      <li><strong>Done!</strong> When the kid taps &quot;Print&quot;, Windows sends the job over the USB cable instantly with <strong>zero dialogs or popups</strong>.</li>
                    </ol>
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-4 font-bold border-t border-slate-700 pt-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Takes 1 minute to set up &bull; 100% reliable</span>
                  </div>
                </div>

                {/* Method B: Turn Canon G2430 into a Cloud / Wireless Printer */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-sky-400 bg-sky-400/10 px-2.5 py-0.5 rounded-full border border-sky-400/30">
                        Method B: Cloud Bridge
                      </span>
                      <span className="text-xs text-slate-400 font-mono">PrintNode or Raspberry Pi</span>
                    </div>
                    <h4 className="text-base font-bold text-white">PrintNode USB Cloud Bridge</h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      If you want to print from an Android TV box, iPad, or mobile device over the cloud to your USB Canon G2430:
                    </p>
                    <ol className="text-xs text-slate-300 mt-2 space-y-1.5 list-decimal pl-4">
                      <li>Plug the Canon G2430 into any computer or a $35 Raspberry Pi.</li>
                      <li>Install the lightweight <strong>PrintNode client</strong> on that computer.</li>
                      <li>PrintNode exposes your USB Canon G2430 to the cloud.</li>
                      <li>Any touch screen, tablet, or web app can now print to it over HTTPS from anywhere!</li>
                    </ol>
                  </div>
                  <div className="text-[11px] text-sky-400 mt-4 font-bold border-t border-slate-700 pt-2 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4" />
                    <span>Ideal for multi-kiosk cloud setups</span>
                  </div>
                </div>
              </div>

              {/* Ready-to-use launch script callout */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Ready 1-Click Kiosk Launcher Script:</div>
                    <div className="text-[11px] text-slate-400 font-mono">start-kiosk.bat (Windows) &bull; start-kiosk.sh (Linux/Raspberry Pi)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('code');
                    setCodeLanguage('canonUsbKiosk');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  View Script &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TEST PRINT QUEUE (SIMULATION) */}
          {activeTab === 'test' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Canon PIXMA G2430 USB Dispatch Simulation</span>
                  <span className="text-[11px] text-emerald-400 font-normal flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> USB Port Active
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Connection Method
                    </label>
                    <select
                      value={config.provider}
                      onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="canon_usb">Direct USB (Silent Kiosk Printing)</option>
                      <option value="printnode">PrintNode USB Bridge</option>
                      <option value="ipp_network">Raspberry Pi USB CUPS Server</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Target Printer Name
                    </label>
                    <input
                      type="text"
                      value={config.printerName}
                      onChange={(e) => setConfig({ ...config, printerName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Paper Size
                    </label>
                    <select
                      value={config.paperSize}
                      onChange={(e) => setConfig({ ...config, paperSize: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="A4">A4 (Canon G2430 standard)</option>
                      <option value="Letter">US Letter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Silent Dialog Bypassing
                    </label>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-emerald-400 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Enabled (--kiosk-printing)</span>
                    </div>
                  </div>
                </div>

                {/* Print Dispatch Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTriggerPrint}
                    disabled={jobStatus.stage === 'generating' || jobStatus.stage === 'transmitting' || jobStatus.stage === 'spooling'}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                  >
                    <Printer className="w-5 h-5 stroke-[2.5]" />
                    <span>Send Test Print to Canon PIXMA G2430</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    Current Page: <strong>{characterDescription}</strong>
                  </p>
                </div>
              </div>

              {/* Real-Time Job Status Timeline */}
              {jobStatus.stage !== 'idle' && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      USB Spooler Job ID: <span className="font-mono text-indigo-400">{jobStatus.id}</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{jobStatus.timestamp}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        jobStatus.stage === 'completed' ? 'bg-emerald-400' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${jobStatus.progress}%` }}
                    />
                  </div>

                  <div className="text-xs font-medium text-slate-300 flex items-center gap-2">
                    {jobStatus.stage === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                    )}
                    <span>{jobStatus.message}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CODE & SCRIPTS */}
          {activeTab === 'code' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Code Snippet Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCodeLanguage('canonUsbKiosk')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      codeLanguage === 'canonUsbKiosk' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1. Silent Kiosk Batch Script
                  </button>

                  <button
                    type="button"
                    onClick={() => setCodeLanguage('printnodeUsb')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      codeLanguage === 'printnodeUsb' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2. PrintNode USB Bridge (Expo)
                  </button>

                  <button
                    type="button"
                    onClick={() => setCodeLanguage('nodeUsbService')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      codeLanguage === 'nodeUsbService' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    3. Local Node.js USB Daemon
                  </button>

                  <button
                    type="button"
                    onClick={() => setCodeLanguage('raspberryPiCups')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      codeLanguage === 'raspberryPiCups' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    4. Raspberry Pi Wi-Fi Adapter
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Code Panel */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[460px]">
                <pre>
                  <code>{CLOUD_PRINT_CODE_SNIPPETS[codeLanguage]}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
