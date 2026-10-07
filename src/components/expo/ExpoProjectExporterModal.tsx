import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  FolderGit2,
  Terminal,
  ExternalLink,
  Sparkles,
  Layers,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { EXPO_PROJECT_FILES, ExpoProjectFile } from '../../lib/playys/expoProjectFiles';
import { downloadExpoProjectZip } from '../../lib/playys/expoZipExporter';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';

interface ExpoProjectExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpoProjectExporterModal: React.FC<ExpoProjectExporterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<ExpoProjectFile>(EXPO_PROJECT_FILES[0]);
  const [copiedFile, setCopiedFile] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    nativeFeedback.impactLight();
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      nativeFeedback.notificationSuccess();
      await downloadExpoProjectZip('playys-expo-creator');
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-800/90 px-5 py-4 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Expo Project Code & Exporter</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Expo SDK 52 &bull; New Arch
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% Native React Native &bull; react-native-svg &bull; expo-print &bull; expo-sharing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isDownloading ? 'Packaging...' : 'Download Project (.zip)'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: File Sidebar + Code Viewer */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-64 sm:w-72 bg-slate-950/70 border-r border-slate-800 flex flex-col shrink-0">
            <div className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800/80">
              <span>Project Files</span>
              <span className="text-slate-500">{EXPO_PROJECT_FILES.length} files</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {EXPO_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => {
                      nativeFeedback.selection();
                      setSelectedFile(file);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <FileCode
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-indigo-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{file.path}</span>
                  </button>
                );
              })}
            </div>

            {/* Quickrun helper in sidebar footer */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Run in terminal:</span>
              </div>
              <div className="font-mono text-[10px] bg-slate-950 p-2 rounded-lg text-emerald-400 border border-slate-800">
                npx expo start
              </div>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* File info bar */}
            <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs font-bold text-slate-200 truncate">
                  {selectedFile.path}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">&bull;</span>
                <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
                  {selectedFile.description}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                {copiedFile ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed selection:bg-indigo-500/30">
              <pre className="whitespace-pre">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="px-5 py-3 bg-slate-800/80 border-t border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ready for EAS Build &bull; iOS & Android &bull; Web &bull; Expo Go</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>iOS: bundleIdentifier: com.playys.native.creator</span>
            <span>Android: package: com.playys.native.creator</span>
          </div>
        </div>
      </div>
    </div>
  );
};
