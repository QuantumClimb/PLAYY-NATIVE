import React from 'react';
import { BackgroundType } from '../../lib/backgrounds/types';
import { SceneForm } from './sceneForm';

interface BackgroundSourceProps {
  form: SceneForm;
  uploading: 'main' | 'fallback' | null;
  onChange: (change: Partial<SceneForm>) => void;
  onUpload: (file: File, target: 'main' | 'fallback') => void;
}

const SOURCES: { id: BackgroundType; label: string; desc: string }[] = [
  { id: 'default', label: 'Existing Default', desc: 'Default background' },
  { id: 'image', label: 'Custom Image', desc: 'PNG, JPG, WebP' },
  { id: 'video', label: 'Custom Video', desc: 'MP4, WebM' },
];

const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.webp,image/*';
const VIDEO_ACCEPT = '.mp4,.webm,video/mp4,video/webm';

const FileButton: React.FC<{
  accept: string;
  className: string;
  onFile: (file: File) => void;
  children: React.ReactNode;
}> = ({ accept, className, onFile, children }) => (
  <label className={className}>
    {children}
    <input
      type="file"
      accept={accept}
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) onFile(file);
      }}
    />
  </label>
);

/** Default, custom image or custom video, with the upload buttons for the chosen kind. */
export const BackgroundSource: React.FC<BackgroundSourceProps> = ({ form, uploading, onChange, onUpload }) => {
  const isVideo = form.bgType === 'video';
  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Background Source</label>
        <div className="grid grid-cols-3 gap-3">
          {SOURCES.map((source) => (
            <button
              key={source.id}
              type="button"
              onClick={() => onChange({ bgType: source.id })}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                form.bgType === source.id
                  ? 'bg-indigo-50 border-indigo-500 text-gray-900 font-semibold'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm">{source.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{source.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {form.bgType !== 'default' && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              {isVideo ? 'Video File' : 'Image File'} Upload
            </label>
            {form.mediaId && <span className="text-xs text-emerald-600 font-mono">✓ {form.mediaId}</span>}
          </div>
          <FileButton
            accept={isVideo ? VIDEO_ACCEPT : IMAGE_ACCEPT}
            className="flex px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-300 text-sm text-gray-800 cursor-pointer items-center justify-center gap-2 transition-all"
            onFile={(file) => onUpload(file, 'main')}
          >
            <span>Select & Upload {isVideo ? 'Video (MP4/WebM)' : 'Image (PNG/JPG/WebP)'}</span>
          </FileButton>
          {uploading === 'main' && <div className="text-xs text-indigo-600">Uploading file…</div>}

          {isVideo && (
            <div className="pt-2 border-t border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Poster / Fallback Image (Optional)
                </label>
                {form.fallbackMediaId && (
                  <span className="text-xs text-emerald-600 font-mono">✓ {form.fallbackMediaId}</span>
                )}
              </div>
              <FileButton
                accept={IMAGE_ACCEPT}
                className="flex w-full px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-50 border border-gray-300 text-xs text-gray-600 cursor-pointer items-center justify-center gap-2"
                onFile={(file) => onUpload(file, 'fallback')}
              >
                <span>Upload Poster Image (PNG, JPG, WebP)</span>
              </FileButton>
              {uploading === 'fallback' && <div className="text-xs text-purple-600">Uploading poster…</div>}
            </div>
          )}
        </div>
      )}
    </>
  );
};
