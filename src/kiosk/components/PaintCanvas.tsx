import React, { useEffect, useRef } from 'react';
import type { PaintState } from '../flow/usePaint';

const BACKING_WIDTH = 1000;

interface PaintCanvasProps {
  paint: PaintState;
  /** Any touch or stroke counts as activity, so the kiosk does not time out mid-painting */
  onInteract: () => void;
}

/**
 * A transparent canvas laid over the character's frame. Strokes ignore the outlines; the layer is multiplied over the
 * line art, so the black lines stay black and the white fills take the paint's colour.
 * The PNG goes to the configuration when a stroke ends; Undo and Clear come back in through `paint.paint`.
 */
export const PaintCanvas: React.FC<PaintCanvasProps> = ({ paint, onInteract }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  // The version this canvas last wrote out, so it only redraws when the paint changed from outside
  const emitted = useRef<string | undefined>(undefined);

  // Size the backing store to the element's shape once, so strokes are the same on every screen
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ratio = canvas.clientHeight / Math.max(1, canvas.clientWidth);
    canvas.width = BACKING_WIDTH;
    canvas.height = Math.max(1, Math.round(BACKING_WIDTH * ratio));
    emitted.current = undefined;
    redraw(paint.paint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paint.paint !== emitted.current) redraw(paint.paint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paint.paint]);

  function redraw(source: string | undefined) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    emitted.current = source;
    if (!source) return;
    const img = new Image();
    img.onload = () => {
      if (emitted.current === source) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = source;
  }

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const box = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - box.left) / box.width) * canvas.width,
      y: ((e.clientY - box.top) / box.height) * canvas.height,
    };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.globalCompositeOperation = paint.brush.erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = paint.brush.color;
    ctx.fillStyle = paint.brush.color;
    ctx.lineWidth = paint.brush.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    // A midpoint curve keeps quick finger strokes smooth instead of angular
    ctx.quadraticCurveTo(from.x, from.y, (from.x + to.x) / 2, (from.y + to.y) / 2);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    onInteract();
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = point(e);
    // A tap leaves a dot
    stroke(last.current, last.current);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!last.current) return;
    const next = point(e);
    stroke(last.current, next);
    last.current = next;
  };

  const up = () => {
    if (!last.current) return;
    last.current = null;
    onInteract();
    const canvas = canvasRef.current!;
    // An erased-to-nothing canvas still exports a PNG; store nothing in that case
    const empty = !canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data.some((v, i) => i % 4 === 3 && v);
    const next = empty ? undefined : canvas.toDataURL('image/png');
    emitted.current = next;
    paint.commit(next);
  };

  return (
    <canvas
      ref={canvasRef}
      aria-label="Painting canvas"
      className="paint-canvas"
      style={{ mixBlendMode: 'multiply' }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    />
  );
};
