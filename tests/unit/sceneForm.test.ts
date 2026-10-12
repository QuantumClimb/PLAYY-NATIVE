import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SCENE_FORM,
  formFromScene,
  mediaFileProblem,
} from '../../src/command-center/scene-backgrounds/sceneForm';
import type { SceneBackgroundSetting } from '../../src/lib/backgrounds/types';

const file = (name: string, type: string, megabytes: number) => ({ name, type, size: megabytes * 1024 * 1024 }) as File;

describe('formFromScene', () => {
  it('uses the defaults for a scene that was never saved', () => {
    expect(formFromScene(undefined)).toEqual(DEFAULT_SCENE_FORM);
  });

  it('reads a saved scene and fills in what is missing', () => {
    const saved = {
      sceneId: 'intro',
      bgType: 'video',
      mediaId: 'med_1',
      fit: 'contain',
      position: 'top',
      overlayColor: '#112233',
      overlayOpacity: 0.4,
    } as SceneBackgroundSetting;
    const form = formFromScene(saved);
    expect(form).toMatchObject({ bgType: 'video', mediaId: 'med_1', fit: 'contain', overlayOpacity: 0.4 });
    expect(form.fallbackMediaId).toBeNull();
    expect(form.badgePlacement).toBe(DEFAULT_SCENE_FORM.badgePlacement);
  });
});

describe('mediaFileProblem', () => {
  it('accepts images and videos within the limits', () => {
    expect(mediaFileProblem(file('a.png', 'image/png', 2), 'main')).toBeNull();
    expect(mediaFileProblem(file('a.mp4', 'video/mp4', 20), 'main')).toBeNull();
  });
  it('rejects other file types', () => {
    expect(mediaFileProblem(file('a.pdf', 'application/pdf', 1), 'main')).toContain('Unsupported');
  });
  it('rejects files over the limit', () => {
    expect(mediaFileProblem(file('big.png', 'image/png', 11), 'main')).toContain('10MB');
    expect(mediaFileProblem(file('big.mp4', 'video/mp4', 31), 'main')).toContain('30MB');
  });
  it('only takes an image as the poster', () => {
    expect(mediaFileProblem(file('a.mp4', 'video/mp4', 1), 'fallback')).toContain('must be an image');
    expect(mediaFileProblem(file('a.png', 'image/png', 1), 'fallback')).toBeNull();
  });
});
