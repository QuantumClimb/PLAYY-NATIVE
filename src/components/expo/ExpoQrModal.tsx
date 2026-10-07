import React, { useState } from 'react';
import { X, Copy, Check, Smartphone, ExternalLink, Terminal, Sparkles } from 'lucide-react';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

interface ExpoQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpoQrModal: React.FC<ExpoQrModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const expoDevUrl = 'exp://192.168.1.100:8081';
  const installCmd = 'npx create-expo-app playys-app && cd playys-app && npx expo install react-native-svg expo-print expo-sharing expo-haptics';

  const copyUrl = () => {
    nativeFeedback.impactLight();
    navigator.clipboard.writeText(expoDevUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyCmd = () => {
    nativeFeedback.impactLight();
    navigator.clipboard.writeText(installCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Test on Physical Device</h3>
              <p className="text-xs text-indigo-200 mt-0.5">Run in Expo Go on iOS & Android</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Simulated QR Code Graphic */}
          <div className="bg-slate-50 p-4 rounded-3xl border-2 border-indigo-100 shadow-inner flex flex-col items-center relative">
            {/* SVG QR Code Pattern */}
            <svg
              viewBox="0 0 160 160"
              className="w-44 h-44 text-slate-900 select-none"
              fill="currentColor"
            >
              {/* Corner 1 */}
              <rect x="10" y="10" width="40" height="40" rx="6" />
              <rect x="18" y="18" width="24" height="24" rx="4" fill="white" />
              <rect x="24" y="24" width="12" height="12" rx="2" />
              {/* Corner 2 */}
              <rect x="110" y="10" width="40" height="40" rx="6" />
              <rect x="118" y="18" width="24" height="24" rx="4" fill="white" />
              <rect x="124" y="24" width="12" height="12" rx="2" />
              {/* Corner 3 */}
              <rect x="10" y="110" width="40" height="40" rx="6" />
              <rect x="18" y="118" width="24" height="24" rx="4" fill="white" />
              <rect x="24" y="124" width="12" height="12" rx="2" />
              {/* Data Blocks */}
              <rect x="60" y="15" width="10" height="10" rx="2" />
              <rect x="75" y="15" width="10" height="25" rx="2" />
              <rect x="90" y="25" width="10" height="10" rx="2" />
              <rect x="60" y="35" width="20" height="10" rx="2" />
              <rect x="15" y="60" width="25" height="10" rx="2" />
              <rect x="35" y="75" width="10" height="20" rx="2" />
              <rect x="15" y="85" width="15" height="15" rx="2" />
              <rect x="60" y="60" width="40" height="40" rx="8" fill="#4F46E5" />
              <circle cx="80" cy="80" r="10" fill="white" />
              <rect x="110" y="60" width="15" height="10" rx="2" />
              <rect x="135" y="65" width="15" height="20" rx="2" />
              <rect x="115" y="85" width="20" height="15" rx="2" />
              <rect x="60" y="110" width="10" height="20" rx="2" />
              <rect x="75" y="125" width="25" height="15" rx="2" />
              <rect x="110" y="110" width="15" height="15" rx="2" />
              <rect x="130" y="130" width="20" height="20" rx="2" />
              <rect x="115" y="135" width="10" height="15" rx="2" />
            </svg>
            <div className="mt-2 text-center text-xs font-bold text-slate-500">
              Metro Server &bull; Expo SDK 52
            </div>
          </div>

          {/* Instructions */}
          <div className="w-full mt-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>How to Scan in 2 steps:</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-1.5 pl-4 list-decimal font-medium">
              <li>
                Open the free <strong className="text-slate-800 font-bold">Expo Go</strong> app on your iPhone (use Camera app) or Android (use Expo Go scanner).
              </li>
              <li>
                Scan the QR code or paste the Metro developer URL below.
              </li>
            </ol>
          </div>

          {/* Expo URL Copy Box */}
          <div className="w-full mt-3 flex items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-xs">
            <span className="font-mono text-slate-700 truncate pr-2">{expoDevUrl}</span>
            <button
              type="button"
              onClick={copyUrl}
              className="flex items-center gap-1 bg-white hover:bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>

          {/* CLI Command Copy Box */}
          <div className="w-full mt-2 flex items-center justify-between bg-slate-900 text-slate-300 p-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono text-[11px] truncate">{installCmd}</span>
            </div>
            <button
              type="button"
              onClick={copyCmd}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0"
            >
              {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
