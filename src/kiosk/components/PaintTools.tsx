import React from 'react';
import { Eraser, Trash2, Undo2 } from 'lucide-react';
import { normalizeColor } from '../../lib/assets/svgParts';
import { BRUSH_SIZES, type PaintState } from '../flow/usePaint';

interface PaintToolsProps {
  paint: PaintState;
  palette: string[];
}

/** The right-hand side of the freeform page: colours, brush sizes, eraser, undo and clear. */
export const PaintTools: React.FC<PaintToolsProps> = ({ paint, palette }) => {
  const { brush } = paint;
  const current = normalizeColor(brush.color);
  return (
    <div className="paint-tools">
      <div className="paint-palette" role="group" aria-label="Paint colour">
        {palette.map((c) => (
          <button
            key={c}
            type="button"
            data-sfx="select"
            aria-label={c}
            aria-pressed={!brush.erase && current === normalizeColor(c)}
            className={`paint-dot ${!brush.erase && current === normalizeColor(c) ? 'is-selected' : ''}`}
            style={{ background: c }}
            onClick={() => paint.setBrush({ color: c, erase: false })}
          />
        ))}
      </div>
      <div className="paint-row" role="group" aria-label="Brush size">
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            data-sfx="select"
            aria-label={`Brush size ${size}`}
            aria-pressed={brush.size === size}
            className={`paint-size ${brush.size === size ? 'is-active' : ''}`}
            onClick={() => paint.setBrush({ size })}
          >
            <i style={{ width: `${size / 2.4}%`, aspectRatio: '1' }} />
          </button>
        ))}
      </div>
      <div className="paint-row">
        <button
          type="button"
          data-sfx="select"
          className={`paint-action ${brush.erase ? 'is-active' : ''}`}
          aria-pressed={brush.erase}
          onClick={() => paint.setBrush({ erase: !brush.erase })}
        >
          <Eraser aria-hidden="true" />
          <span>Eraser</span>
        </button>
        <button type="button" data-sfx="select" className="paint-action" disabled={!paint.canUndo} onClick={paint.undo}>
          <Undo2 aria-hidden="true" />
          <span>Undo</span>
        </button>
        <button type="button" data-sfx="select" className="paint-action" disabled={!paint.canClear} onClick={paint.clear}>
          <Trash2 aria-hidden="true" />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};
