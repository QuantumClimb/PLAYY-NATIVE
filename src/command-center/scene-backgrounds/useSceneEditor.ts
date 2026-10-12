import { useCallback, useEffect, useState } from 'react';
import { api } from '../../data/api';
import { uploadMedia } from '../../data/media';
import { ALL_SCENES, SceneId } from '../../lib/backgrounds/types';
import { useSceneBackgrounds } from '../../lib/backgrounds/context';
import { SceneForm, formFromScene, mediaFileProblem } from './sceneForm';

type UploadTarget = 'main' | 'fallback';

/** The state and actions of the scene backgrounds editor: the chosen scene, its form, uploading, saving and resetting. */
export function useSceneEditor() {
  const { scenes, refreshBackgrounds } = useSceneBackgrounds();
  const [sceneId, setSceneId] = useState<SceneId>('intro');
  const [form, setForm] = useState<SceneForm>(() => formFromScene(scenes.intro));
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const scene = ALL_SCENES.find((s) => s.id === sceneId)!;

  // Show the saved settings of the chosen scene
  useEffect(() => {
    setForm(formFromScene(scenes[sceneId]));
    setError(null);
    setNote(null);
  }, [sceneId, scenes]);

  const patch = useCallback((change: Partial<SceneForm>) => setForm((f) => ({ ...f, ...change })), []);

  const upload = async (file: File, target: UploadTarget) => {
    setError(null);
    setNote(null);
    const problem = mediaFileProblem(file, target);
    if (problem) return setError(problem);
    setUploading(target);
    try {
      const mediaId = await uploadMedia(file);
      if (target === 'main') {
        patch({ mediaId, bgType: file.type.startsWith('video/') ? 'video' : 'image' });
        setNote(`Uploaded ${file.name} successfully! Click "Save Settings" to apply.`);
      } else {
        patch({ fallbackMediaId: mediaId });
        setNote(`Uploaded fallback image ${file.name} successfully!`);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(null);
    }
  };

  const work = async (action: () => Promise<void>) => {
    setError(null);
    setNote(null);
    setSaving(true);
    try {
      await action();
      await refreshBackgrounds();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const save = () =>
    work(async () => {
      await api.put(`/api/cc/scene-backgrounds/${sceneId}`, form);
      setNote(`Scene "${scene.label}" background settings saved!`);
    });

  const reset = () => {
    if (!window.confirm(`Reset "${scene.label}" background to existing default?`)) return;
    void work(async () => {
      await api.post(`/api/cc/scene-backgrounds/${sceneId}/reset`);
      setNote(`Reset "${scene.label}" to default.`);
    });
  };

  return {
    scenes,
    scene,
    sceneId,
    setSceneId,
    form,
    patch,
    upload,
    uploading,
    saving,
    save,
    reset,
    error,
    note,
    dismissError: () => setError(null),
    dismissNote: () => setNote(null),
  };
}
