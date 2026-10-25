import { useState } from 'react';
import type { PlayyConfiguration } from '../../lib/playys/types';

export interface Brush {
  color: string;
  /** Stroke width in canvas pixels (the canvas is about 1000 px wide) */
  size: number;
  erase: boolean;
}

/** Brush sizes offered on the freeform page: small, medium, large. */
export const BRUSH_SIZES = [14, 34, 70] as const;

const MAX_UNDO = 10;

/**
 * The freeform page's painting state: the brush, and the earlier versions of the paint for Undo.
 * The paint itself lives in the configuration, so every preview and the printed page show it.
 */
export function usePaint(paint: string | undefined, setPaint: (paint: string | undefined) => void, firstColor: string) {
  const [brush, setBrush] = useState<Brush>({ color: firstColor, size: BRUSH_SIZES[1], erase: false });
  const [history, setHistory] = useState<(string | undefined)[]>([]);

  const commit = (next: string | undefined) => {
    setHistory((h) => [...h, paint].slice(-MAX_UNDO));
    setPaint(next);
  };

  const undo = () => {
    if (!history.length) return;
    setPaint(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  return {
    paint,
    brush,
    setBrush: (patch: Partial<Brush>) => setBrush((b) => ({ ...b, ...patch })),
    commit,
    undo,
    clear: () => paint && commit(undefined),
    canUndo: history.length > 0,
    canClear: !!paint,
  };
}

export type PaintState = ReturnType<typeof usePaint>;

export const withoutPaint = (config: PlayyConfiguration): PlayyConfiguration => ({ ...config, paint: undefined });
