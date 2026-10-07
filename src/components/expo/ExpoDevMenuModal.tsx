import React from 'react';
import {
  RotateCw,
  Activity,
  Search,
  QrCode,
  Volume2,
  VolumeX,
  X,
  Layers,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Cpu,
} from 'lucide-react';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

interface ExpoDevMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
  perfMonitorVisible: boolean;
  onTogglePerfMonitor: () => void;
  inspectorActive: boolean;
  onToggleInspector: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenQrCode: () => void;
}

export const ExpoDevMenuModal: React.FC<ExpoDevMenuModalProps> = ({
  isOpen,
  onClose,
  onReload,
  perfMonitorVisible,
  onTogglePerfMonitor,
  inspectorActive,
  onToggleInspector,
  soundEnabled,
  onToggleSound,
  onOpenQrCode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-slate-900 border border-slate-700 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-800/80 px-5 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-md">
              EX
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-1.5">
                <span>Expo Developer Menu</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SDK 52
                </span>
              </div>
              <div className="text-[11px] text-slate-400">playys-native-creator &bull; port 8081</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Items List */}
        <div className="p-3 divide-y divide-slate-800">
          {/* Reload / Fast Refresh */}
          <button
            type="button"
            onClick={() => {
              nativeFeedback.impactLight();
              onReload();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/70 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <RotateCw className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">Reload JS Bundle</div>
                <div className="text-[11px] text-slate-400">Fast Refresh &bull; r in terminal</div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
              ⌘R
            </span>
          </button>

          {/* Toggle Perf Monitor */}
          <button
            type="button"
            onClick={() => {
              nativeFeedback.impactLight();
              onTogglePerfMonitor();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/70 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">Show Performance Monitor</div>
                <div className="text-[11px] text-slate-400">FPS, Hermes memory & thread stats</div>
              </div>
            </div>
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                perfMonitorVisible ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  perfMonitorVisible ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Toggle Element Inspector */}
          <button
            type="button"
            onClick={() => {
              nativeFeedback.impactLight();
              onToggleInspector();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/70 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">Toggle Element Inspector</div>
                <div className="text-[11px] text-slate-400">Inspect React Native views & styles</div>
              </div>
            </div>
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                inspectorActive ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  inspectorActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Haptics & Audio Sound */}
          <button
            type="button"
            onClick={() => {
              onToggleSound();
              nativeFeedback.impactMedium();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/70 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">Tactile Audio & Haptics</div>
                <div className="text-[11px] text-slate-400">Emulates expo-haptics impact</div>
              </div>
            </div>
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* QR Code Scan on Physical Phone */}
          <button
            type="button"
            onClick={() => {
              nativeFeedback.impactLight();
              onClose();
              onOpenQrCode();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/70 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">Expo Go Connect / QR</div>
                <div className="text-[11px] text-slate-400">Scan to run on real iOS or Android device</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
          </button>
        </div>

        {/* Runtime Footer Badges */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hermes 0.76 &bull; New Arch</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Metro Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
