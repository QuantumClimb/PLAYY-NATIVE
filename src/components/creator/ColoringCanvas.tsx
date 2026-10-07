import React, { useState } from 'react';
import { PlayyConfiguration, RenderMode } from '../../lib/playys/types';
import { PlayyComposition } from '../playys/PlayyComposition';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Palette,
  Printer,
  Sparkles,
} from 'lucide-react';

interface ColoringCanvasProps {
  config: PlayyConfiguration;
  activeMode: RenderMode;
  onToggleMode: (mode: RenderMode) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onPrint?: () => void;
}

export const ColoringCanvas: React.FC<ColoringCanvasProps> = ({
  config,
  activeMode,
  onToggleMode,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onPrint,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 175));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoomLevel(100);

  return (
    <div
      id="coloring-page-hero-container"
      className={`flex flex-col h-full bg-white rounded-3xl border-3 border-indigo-100 shadow-xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'relative'
      }`}
    >
      {/* Top Banner / Tab Switcher */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-50 bg-gradient-to-r from-blue-50/50 via-pink-50/30 to-amber-50/50">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-sm">
            ★
          </span>
          <h2 className="text-base font-extrabold text-indigo-950 tracking-wide">
            {activeMode === 'coloring' ? 'Printable Coloring Page' : 'Full-Color Adventure Scene'}
          </h2>
        </div>

        {/* View Mode Pill Switcher */}
        <div className="flex items-center bg-indigo-100/70 p-1 rounded-2xl gap-1">
          <button
            id="mode-toggle-coloring"
            type="button"
            onClick={() => onToggleMode('coloring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'coloring'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-indigo-600 hover:text-indigo-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Coloring Page
          </button>
          <button
            id="mode-toggle-color"
            type="button"
            onClick={() => onToggleMode('color')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'color'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-indigo-600 hover:text-pink-600'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Full Color
          </button>
        </div>
      </div>

      {/* Main Canvas SVG Drawing Viewport */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto bg-slate-100/60 relative">
        {/* Paper Sheet Effect */}
        <div
          className="bg-white rounded-2xl shadow-lg border border-slate-300 transition-transform duration-200 ease-out origin-center flex items-center justify-center p-2 sm:p-4 max-h-full max-w-full"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            aspectRatio: '850 / 1100',
            width: 'min(100%, 650px)',
          }}
        >
          <PlayyComposition
            id="main-coloring-svg"
            config={config}
            mode={activeMode}
            showBackground={true}
            showLogoHeader={true}
            className="w-full h-full"
          />
        </div>

        {/* Cute watermark tag at bottom left of paper */}
        <div className="absolute bottom-3 left-4 hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 select-none pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          US Letter / A4 Ready • Crisp Vector SVG
        </div>
      </div>

      {/* Bottom Interactive Toolbar (Undo/Redo | Zoom Slider | Maximize) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-white border-t border-indigo-50 text-gray-700">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            id="btn-undo"
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-700"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            id="btn-redo"
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-700"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-200" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs justify-center">
          <button
            id="btn-zoom-out"
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <input
            id="zoom-slider"
            type="range"
            min="60"
            max="175"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-24 sm:w-36 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          <button
            id="btn-zoom-in"
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-500 min-w-[38px] text-right">
            {zoomLevel}%
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-200" />

        {/* Reset & Fullscreen */}
        <div className="flex items-center gap-1">
          <button
            id="btn-reset-zoom"
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            id="btn-fullscreen"
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
