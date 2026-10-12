import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../../data/api';
import { SceneBackgroundSetting, SceneId } from './types';

interface SceneBackgroundsContextType {
  scenes: Record<string, SceneBackgroundSetting>;
  loading: boolean;
  error: string | null;
  refreshBackgrounds: () => Promise<void>;
  getSceneSetting: (sceneId: SceneId) => SceneBackgroundSetting | undefined;
}

const SceneBackgroundsContext = createContext<SceneBackgroundsContextType | undefined>(undefined);

export const SceneBackgroundsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scenes, setScenes] = useState<Record<string, SceneBackgroundSetting>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBackgrounds = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<{ scenes?: Record<string, SceneBackgroundSetting> }>('/api/scene-backgrounds');
      setScenes(data.scenes || {});
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBackgrounds();
  }, [refreshBackgrounds]);

  const getSceneSetting = useCallback((sceneId: SceneId) => scenes[sceneId], [scenes]);

  return (
    <SceneBackgroundsContext.Provider value={{ scenes, loading, error, refreshBackgrounds, getSceneSetting }}>
      {children}
    </SceneBackgroundsContext.Provider>
  );
};

export function useSceneBackgrounds() {
  const ctx = useContext(SceneBackgroundsContext);
  if (!ctx) {
    throw new Error('useSceneBackgrounds must be used within a SceneBackgroundsProvider');
  }
  return ctx;
}
