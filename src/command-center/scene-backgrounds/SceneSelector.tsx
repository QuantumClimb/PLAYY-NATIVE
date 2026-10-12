import React from 'react';
import { ALL_SCENES, SceneBackgroundSetting, SceneId } from '../../lib/backgrounds/types';

interface SceneSelectorProps {
  scenes: Record<string, SceneBackgroundSetting>;
  selected: SceneId;
  onSelect: (id: SceneId) => void;
}

const TYPE_BADGE = {
  video: { label: 'Video', style: 'bg-purple-900 text-purple-200' },
  image: { label: 'Image', style: 'bg-blue-900 text-blue-200' },
  default: { label: 'Default', style: 'bg-gray-50 text-gray-500' },
};

/** One card per kiosk screen whose background can be changed. */
export const SceneSelector: React.FC<SceneSelectorProps> = ({ scenes, selected, onSelect }) => (
  <div>
    <div className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">
      Select Scene ({ALL_SCENES.length})
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {ALL_SCENES.map((scene) => {
        const badge = TYPE_BADGE[scenes[scene.id]?.bgType || 'default'];
        const isSelected = scene.id === selected;
        return (
          <button
            key={scene.id}
            type="button"
            onClick={() => onSelect(scene.id)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
              isSelected
                ? 'bg-indigo-50 border-indigo-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                : 'bg-white border-gray-200 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="font-semibold text-sm text-gray-900 line-clamp-1">{scene.label}</div>
              <div className="text-xs text-gray-500 line-clamp-1">{scene.description}</div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gray-50 text-gray-600">
                ID: {scene.id}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${badge.style}`}>{badge.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);
