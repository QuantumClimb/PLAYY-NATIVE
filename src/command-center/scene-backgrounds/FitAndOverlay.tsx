import React from 'react';
import { BackgroundFit, BackgroundPosition } from '../../lib/backgrounds/types';
import { POSITION_OPTIONS, SceneForm } from './sceneForm';

interface FitAndOverlayProps {
  form: SceneForm;
  onChange: (change: Partial<SceneForm>) => void;
}

const FITS: BackgroundFit[] = ['cover', 'contain'];

/** How a custom background fills the screen, and the colour wash that keeps the text readable. */
export const FitAndOverlay: React.FC<FitAndOverlayProps> = ({ form, onChange }) => (
  <>
    {form.bgType !== 'default' && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Display Fit</label>
          <div className="grid grid-cols-2 gap-2">
            {FITS.map((fit) => (
              <button
                key={fit}
                type="button"
                onClick={() => onChange({ fit })}
                className={`py-2 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                  form.fit === fit
                    ? 'bg-indigo-600 border-indigo-500 text-gray-900'
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                }`}
              >
                {fit}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">Focal Point Position</label>
          <select
            value={form.position}
            onChange={(e) => onChange({ position: e.target.value as BackgroundPosition })}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
          >
            {POSITION_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    )}

    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">Content Readability Overlay</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.overlayColor}
            onChange={(e) => onChange({ overlayColor: e.target.value })}
            className="w-10 h-10 rounded-lg border border-gray-300 bg-gray-50 cursor-pointer p-1"
          />
          <div>
            <div className="text-xs font-semibold text-gray-900">Overlay Color</div>
            <input
              type="text"
              value={form.overlayColor}
              onChange={(e) => onChange({ overlayColor: e.target.value })}
              className="w-24 bg-gray-50 border border-gray-300 rounded px-2 py-0.5 text-xs text-mono text-gray-600 mt-0.5"
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Overlay Opacity</span>
            <span className="font-mono font-semibold text-indigo-600">{Math.round(form.overlayOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={form.overlayOpacity}
            onChange={(e) => onChange({ overlayOpacity: parseFloat(e.target.value) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  </>
);
