import React from 'react';
import { CmsPanel } from '../CmsPanel';
import { BackgroundSource } from './BackgroundSource';
import { FitAndOverlay } from './FitAndOverlay';
import { IntroLayout } from './IntroLayout';
import { SceneSelector } from './SceneSelector';
import { ScenePreview } from './ScenePreview';
import { useSceneEditor } from './useSceneEditor';

/** Command center: the background image or video of each kiosk screen, with the intro screen's layout. */
export const SceneBackgroundsPanel: React.FC = () => {
  const editor = useSceneEditor();
  const { form, patch, scene } = editor;

  return (
    <CmsPanel
      title="Scene backgrounds"
      description="Customize background images, videos, and overlays for each kiosk scene. Images up to 10MB (PNG, JPG, WebP), videos up to 30MB (MP4, WebM)."
      error={editor.error}
      note={editor.note}
    >
      <SceneSelector scenes={editor.scenes} selected={editor.sceneId} onSelect={editor.setSceneId} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-gray-200 p-6 rounded-2xl">
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Background settings for: <span className="text-indigo-600">{scene.label}</span>
            </h3>
            <p className="text-xs text-gray-500">{scene.description}</p>
          </div>

          <BackgroundSource form={form} uploading={editor.uploading} onChange={patch} onUpload={editor.upload} />
          <FitAndOverlay form={form} onChange={patch} />
          {editor.sceneId === 'intro' && <IntroLayout form={form} onChange={patch} />}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={editor.save}
              disabled={editor.saving}
              className="cc-btn cc-btn-primary flex-1 justify-center py-3"
            >
              {editor.saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button type="button" onClick={editor.reset} disabled={editor.saving} className="cc-btn py-3">
              Reset Scene
            </button>
          </div>
        </div>

        <ScenePreview sceneId={editor.sceneId} sceneLabel={scene.label} form={form} />
      </div>
    </CmsPanel>
  );
};
