import React, { useState } from 'react';
import { PlayyConfiguration } from '../../lib/playys/types';
import { getHead, getPose, getSymbol } from '../../lib/playys/configuration';
import { CharacterPreviewOnly } from '../playys/CharacterPreviewOnly';
import {
  Printer,
  Download,
  Dices,
  Lightbulb,
  Sparkles,
  FileDown,
  CheckCircle2,
} from 'lucide-react';

interface CharacterPreviewCardProps {
  config: PlayyConfiguration;
  onPrint: () => void;
  onRandomize: () => void;
}

export const CharacterPreviewCard: React.FC<CharacterPreviewCardProps> = ({
  config,
  onPrint,
  onRandomize,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const headDef = getHead(config.head);
  const poseDef = getPose(config.pose);
  const symbolDef = getSymbol(config.symbol);

  // Download SVG
  const handleDownloadSVG = () => {
    const svgEl = document.getElementById('main-coloring-svg') || document.getElementById('playy-composition-svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PLAYYS-${config.head}-${config.pose}-coloring-page.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess('SVG saved!');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  // Download PNG / PDF print helper
  const handleDownloadPNG = () => {
    const svgEl = document.getElementById('main-coloring-svg') || document.getElementById('playy-composition-svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = 1700; // High resolution 2x
    canvas.height = 2200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `PLAYYS-${config.head}-${config.pose}-coloring-page.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setDownloadSuccess('High-Res PNG saved!');
      setTimeout(() => setDownloadSuccess(null), 2500);
    };
    img.src = url;
  };

  return (
    <div id="character-preview-card" className="flex flex-col gap-4">
      {/* 1. Full-Color Assembled Character Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-3 border-sky-100 shadow-md flex flex-col items-center relative overflow-hidden">
        {/* Card Header */}
        <div className="w-full flex items-center justify-between mb-1">
          <div>
            <h3 className="text-lg font-black text-gray-800 tracking-tight leading-none">
              Your Playy
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">Here's your creation!</p>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {headDef.name}
          </div>
        </div>

        {/* Character Visual Area with Speech Bubble */}
        <div className="w-full h-56 sm:h-64 flex items-center justify-center relative my-1">
          {/* Speech Bubble "Awesome!" */}
          <div className="absolute top-2 right-2 sm:right-4 z-10 animate-bounce duration-1000">
            <div className="relative bg-white border-2 border-slate-900 text-slate-900 px-3 py-1 rounded-2xl text-xs font-black shadow-md tracking-wider">
              Awesome!
              <div className="absolute -bottom-2 right-4 w-3 h-3 bg-white border-b-2 border-r-2 border-slate-900 transform rotate-45" />
            </div>
          </div>

          <CharacterPreviewOnly config={config} mode="color" showSparkles={true} />
        </div>

        {/* Subtitle description pill */}
        <div className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-medium">
          <span className="font-bold text-slate-800">{headDef.name}</span>
          <span>•</span>
          <span>{poseDef.name}</span>
          <span>•</span>
          <span className="font-bold text-blue-600">{symbolDef.name}</span>
        </div>
      </div>

      {/* 2. Primary Big Yellow CTA: Print My PLAYY */}
      <button
        id="btn-print-primary"
        type="button"
        onClick={onPrint}
        className="w-full py-3.5 px-4 bg-gradient-to-b from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 active:scale-98 text-amber-950 font-black rounded-2xl shadow-lg hover:shadow-xl border-3 border-amber-500 transition-all duration-150 cursor-pointer flex items-center justify-center gap-3 group"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center text-amber-950 group-hover:scale-110 transition-transform">
          <Printer className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="text-left">
          <div className="text-lg leading-none font-black tracking-wide flex items-center gap-1.5">
            Print My PLAYY
          </div>
          <div className="text-xs text-amber-900/80 font-bold mt-0.5">
            Get your coloring page
          </div>
        </div>
      </button>

      {/* 3. Secondary Actions Grid (Download & Randomize) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Download PDF / Print Dialog */}
        <button
          id="btn-download-pdf"
          type="button"
          onClick={onPrint}
          className="flex items-center justify-center gap-2 p-2.5 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-300 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <FileDown className="w-4 h-4 text-indigo-600" />
          <span>Save as PDF</span>
        </button>

        {/* Randomize / Surprise Me */}
        <button
          id="btn-randomize"
          type="button"
          onClick={onRandomize}
          className="flex items-center justify-center gap-2 p-2.5 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-pink-300 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Dices className="w-4 h-4 text-pink-600" />
          <span>Randomize</span>
        </button>
      </div>

      {/* SVG & High-Res PNG Exports */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-export-svg"
          type="button"
          onClick={handleDownloadSVG}
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download SVG</span>
        </button>
        <button
          id="btn-export-png"
          type="button"
          onClick={handleDownloadPNG}
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>High-Res PNG</span>
        </button>
      </div>

      {/* Success Notification Feedback */}
      {downloadSuccess && (
        <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {downloadSuccess}
        </div>
      )}

      {/* 4. Child-friendly Mascot Tip Box (From reference UI) */}
      <div className="bg-gradient-to-r from-amber-50 to-pink-50 rounded-2xl p-3.5 border-2 border-amber-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Lightbulb className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-xs font-black text-amber-900 tracking-wide">Tip!</div>
          <p className="text-[11px] font-semibold text-slate-600 leading-snug mt-0.5">
            Mix and match different heads, poses, symbols and backgrounds to create your own unique PLAYY!
          </p>
        </div>
        {/* Smiling Cloud Mascot mini */}
        <div className="w-7 h-7 shrink-0 text-slate-400">
          <svg viewBox="0 0 40 30" className="w-full h-full">
            <path
              d="M8 24 C2 24 0 16 4 12 C1 6 8 0 14 3 C18 -2 28 -2 30 5 C36 4 40 10 38 16 C42 22 36 26 30 25 Z"
              fill="#FFFFFF"
              stroke="#111827"
              strokeWidth="2"
            />
            <circle cx="16" cy="12" r="1.5" fill="#111827" />
            <circle cx="24" cy="12" r="1.5" fill="#111827" />
            <path d="M18 16 Q20 19 22 16" fill="none" stroke="#111827" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
