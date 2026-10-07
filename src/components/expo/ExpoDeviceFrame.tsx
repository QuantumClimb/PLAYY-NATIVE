import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Tv,
  Maximize2,
  RotateCcw,
  Volume2,
  VolumeX,
  Code2,
  QrCode,
  Sparkles,
  Wifi,
  Layers,
  Activity,
  Zap,
  Cloud,
} from 'lucide-react';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

export type DeviceModel = 'iphone' | 'pixel' | 'ipad' | 'tv' | 'fullscreen';

interface ExpoDeviceFrameProps {
  deviceModel: DeviceModel;
  onChangeDeviceModel: (model: DeviceModel) => void;
  onTriggerShake: () => void;
  onOpenDevMenu: () => void;
  onOpenExporter: () => void;
  onOpenQrCode: () => void;
  onOpenCloudPrinter: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  perfMonitorVisible: boolean;
  isReloading: boolean;
  children: React.ReactNode;
}

export const ExpoDeviceFrame: React.FC<ExpoDeviceFrameProps> = ({
  deviceModel,
  onChangeDeviceModel,
  onTriggerShake,
  onOpenDevMenu,
  onOpenExporter,
  onOpenQrCode,
  onOpenCloudPrinter,
  soundEnabled,
  onToggleSound,
  perfMonitorVisible,
  isReloading,
  children,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');
  const [islandState, setIslandState] = useState<'idle' | 'active'>('idle');

  // Clock updates every minute
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      let hours = d.getHours();
      const minutes = d.getMinutes();
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes < 10 ? '0' : ''}${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleDeviceChange = (model: DeviceModel) => {
    nativeFeedback.selection();
    onChangeDeviceModel(model);
  };

  const handleDynamicIslandClick = () => {
    nativeFeedback.impactLight();
    setIslandState((prev) => (prev === 'idle' ? 'active' : 'idle'));
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 1. Device Simulator Toolbar (Always visible above device) */}
      <div className="w-full max-w-6xl px-3 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200">
        {/* Left: Device Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleDeviceChange('iphone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              deviceModel === 'iphone'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="iPhone 16 Pro"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">iPhone 16 Pro</span>
            <span className="sm:hidden">iPhone</span>
          </button>

          <button
            type="button"
            onClick={() => handleDeviceChange('pixel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              deviceModel === 'pixel'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Google Pixel 9 Pro"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pixel 9 Pro</span>
            <span className="sm:hidden">Pixel</span>
          </button>

          <button
            type="button"
            onClick={() => handleDeviceChange('ipad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              deviceModel === 'ipad'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="iPad / Tablet"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>iPad</span>
          </button>

          {/* TOUCH SCREEN TV BUTTON */}
          <button
            type="button"
            onClick={() => handleDeviceChange('tv')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              deviceModel === 'tv'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-indigo-600'
            }`}
            title="55-inch Touch Screen TV / Interactive Kiosk Display"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Touch Screen TV</span>
            <span className="text-[9px] font-extrabold bg-amber-400 text-slate-950 px-1 py-0.2 rounded-xs">
              55&quot;
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDeviceChange('fullscreen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              deviceModel === 'fullscreen'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Full Web View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web View</span>
          </button>
        </div>

        {/* Center: Expo Dev Controls */}
        <div className="flex items-center gap-2">
          {/* Shake Device Button */}
          <button
            type="button"
            onClick={onTriggerShake}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Simulate device shake to open Expo Dev Menu"
          >
            <span>📳</span>
            <span className="hidden md:inline">Shake Device</span>
          </button>

          {/* Expo Dev Menu Button */}
          <button
            type="button"
            onClick={onOpenDevMenu}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Expo Dev Menu</span>
          </button>
        </div>

        {/* Right: Cloud Printer, Sound, QR & Export Code Buttons */}
        <div className="flex items-center gap-2">
          {/* Cloud Printer Integration Center */}
          <button
            type="button"
            onClick={onOpenCloudPrinter}
            className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Configure and test Cloud Printer integration"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span>Cloud Printer</span>
          </button>

          {/* Sound / Haptics Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              soundEnabled
                ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Haptics & Sound ON' : 'Haptics & Sound MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Expo Go QR Modal */}
          <button
            type="button"
            onClick={onOpenQrCode}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs"
            title="Scan in Expo Go app"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Expo Go QR</span>
          </button>

          {/* Project Source Code & Exporter */}
          <button
            type="button"
            onClick={onOpenExporter}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95"
            title="View Expo code & download project zip"
          >
            <Code2 className="w-4 h-4" />
            <span>Export Expo App</span>
          </button>
        </div>
      </div>

      {/* 2. Device Viewport Rendering */}
      {deviceModel === 'fullscreen' ? (
        // Fullscreen edge-to-edge container
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative min-h-[780px]">
          {isReloading && (
            <div className="absolute inset-0 z-50 bg-indigo-600/20 backdrop-blur-2xs flex items-center justify-center animate-in fade-in">
              <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold">
                <RotateCcw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Fast Refreshing...</span>
              </div>
            </div>
          )}
          {children}
        </div>
      ) : deviceModel === 'tv' ? (
        // Commercial 55" Touch Screen TV Frame
        <div className="w-full max-w-[1040px] flex flex-col items-center">
          {/* Wall Mount Shadow & Metal Bezel Chassis */}
          <div className="w-full rounded-[24px] p-4 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-950 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.65)] border-[6px] border-neutral-700 relative">
            {/* Top Frame Bezel Banner with TV Spec */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-800 text-neutral-300 px-4 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider border border-neutral-600 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>55&quot; 4K UHD INTERACTIVE TOUCH DISPLAY &bull; 16:9</span>
            </div>

            {/* Inner TV Glass Screen Bezel */}
            <div className="w-full rounded-[14px] overflow-hidden bg-slate-950 relative flex flex-col min-h-[660px] border-2 border-neutral-800 shadow-inner">
              {children}
            </div>

            {/* Bottom TV Chassis Details: Power LED & Touch Sensor strip */}
            <div className="mt-2 flex items-center justify-between px-3 text-[11px] text-neutral-400 select-none">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-widest text-neutral-300">SMART TOUCH KIOSK</span>
                <span className="text-neutral-500">&bull;</span>
                <span className="text-neutral-400">IR Touch 40-Point &bull; Zero Lag</span>
              </div>

              {/* Status LED */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400">ACTIVE</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
              </div>
            </div>
          </div>

          {/* TV Stand Legs / Wall Bracket Mount Simulation */}
          <div className="w-64 h-3 bg-gradient-to-b from-neutral-800 to-neutral-950 rounded-b-xl shadow-md -mt-1" />
        </div>
      ) : (
        // Mobile / Tablet Chassis Frame (iPhone, Pixel, iPad)
        <div
          className={`relative transition-all duration-300 ${
            deviceModel === 'ipad'
              ? 'w-full max-w-[820px] rounded-[48px] p-5 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-4 border-slate-700'
              : deviceModel === 'pixel'
              ? 'w-full max-w-[420px] rounded-[52px] p-3.5 bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-[6px] border-neutral-700'
              : 'w-full max-w-[420px] rounded-[54px] p-3.5 bg-gradient-to-b from-slate-900 via-neutral-900 to-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border-[6px] border-slate-700'
          }`}
        >
          {/* Subtle Outer Hardware Buttons (iPhone style) */}
          {deviceModel === 'iphone' && (
            <>
              {/* Mute switch / Action button */}
              <div className="absolute -left-[9px] top-28 w-[3px] h-8 bg-slate-600 rounded-l-md" />
              {/* Volume Up */}
              <div className="absolute -left-[9px] top-42 w-[3px] h-12 bg-slate-600 rounded-l-md" />
              {/* Volume Down */}
              <div className="absolute -left-[9px] top-58 w-[3px] h-12 bg-slate-600 rounded-l-md" />
              {/* Power / Siri button */}
              <div className="absolute -right-[9px] top-40 w-[3px] h-16 bg-slate-600 rounded-r-md" />
            </>
          )}

          {/* Inner Screen Bezel */}
          <div
            className={`w-full bg-slate-900 overflow-hidden relative flex flex-col ${
              deviceModel === 'ipad'
                ? 'rounded-[36px] min-h-[760px]'
                : deviceModel === 'pixel'
                ? 'rounded-[44px] min-h-[820px]'
                : 'rounded-[46px] min-h-[820px]'
            }`}
          >
            {/* 3. Native Phone Status Bar Header */}
            <div className="w-full bg-white text-slate-900 pt-3 px-6 pb-1.5 flex items-center justify-between z-30 shrink-0 border-b border-slate-100 select-none">
              {/* Left: Clock */}
              <div className="text-[13px] font-black tracking-tight text-slate-900 w-16">
                {currentTime}
              </div>

              {/* Center: Dynamic Island (iPhone) or Punchhole Camera (Pixel) */}
              {deviceModel === 'iphone' ? (
                <div
                  onClick={handleDynamicIslandClick}
                  className={`bg-black text-white rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer shadow-xs ${
                    islandState === 'active'
                      ? 'w-44 h-8 px-3 gap-2'
                      : 'w-28 h-6 px-2 gap-1.5 hover:scale-105'
                  }`}
                  title="Dynamic Island - Tap for Expo Status"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                  <span className="text-[10px] font-bold text-slate-200 truncate">
                    {islandState === 'active' ? 'Expo SDK 52 • 60 FPS' : 'Expo Go'}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-slate-800 ml-auto shrink-0" />
                </div>
              ) : deviceModel === 'pixel' ? (
                <div className="w-3.5 h-3.5 rounded-full bg-black ring-2 ring-slate-800" />
              ) : (
                <div className="text-[11px] font-extrabold text-indigo-600 tracking-wider">
                  EXPO TABLET
                </div>
              )}

              {/* Right: Signal, WiFi, Battery */}
              <div className="flex items-center gap-1.5 text-slate-800 w-16 justify-end">
                <div className="text-[10px] font-black">5G</div>
                <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
                <div className="flex items-center gap-0.5">
                  <div className="w-5 h-2.5 rounded-[3px] border border-slate-800 p-0.5 flex items-center">
                    <div className="w-full h-full bg-slate-900 rounded-[1px]" />
                  </div>
                  <div className="w-[1.5px] h-1.5 bg-slate-800 rounded-r-[1px]" />
                </div>
              </div>
            </div>

            {/* Live Performance Monitor Overlay (if enabled in Expo Dev Menu) */}
            {perfMonitorVisible && (
              <div className="absolute top-12 left-4 right-4 z-40 bg-slate-950/90 backdrop-blur-md text-emerald-400 p-2.5 rounded-2xl border border-emerald-500/30 shadow-xl flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">UI: 60 FPS</span>
                  <span className="text-slate-500">|</span>
                  <span className="font-bold">JS: 60 FPS</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  RAM: 42 MB &bull; Hermes
                </div>
              </div>
            )}

            {/* Fast Refresh Flash Overlay */}
            {isReloading && (
              <div className="absolute inset-0 z-50 bg-indigo-900/30 backdrop-blur-2xs flex items-center justify-center animate-in fade-in">
                <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-700">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                  <span>Fast Refreshing JS Bundle...</span>
                </div>
              </div>
            )}

            {/* Inner App Container */}
            <div className="flex-1 w-full bg-slate-50 flex flex-col overflow-y-auto relative">
              {children}
            </div>

            {/* Bottom Home Indicator Bar (iOS / Android) */}
            <div className="w-full bg-white py-2 flex items-center justify-center shrink-0 border-t border-slate-100">
              <div
                className={`bg-slate-900 rounded-full transition-all hover:bg-slate-700 cursor-pointer ${
                  deviceModel === 'pixel' ? 'w-20 h-1' : 'w-32 h-1'
                }`}
                onClick={onOpenDevMenu}
                title="Tap for Expo Developer Menu"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
