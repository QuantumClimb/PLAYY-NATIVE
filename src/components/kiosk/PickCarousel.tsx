import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PickCarouselProps<T> {
  items: T[];
  keyOf: (item: T) => string | number;
  /** The selected item's key; the carousel scrolls to its page when it changes */
  selectedKey?: string | number;
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Cards per page: 3 columns by 2 rows, like the design */
  perPage?: number;
  /** 'colors': two large panels per page instead of the 3 x 2 grid of cards */
  variant?: 'colors';
  /** Called on any touch, drag or scroll, so the kiosk's inactivity timer stays quiet while someone browses */
  onInteract?: () => void;
}

/**
 * Pages of cards you swipe left and right (no vertical scrolling). Touch uses native scroll-snap;
 * a mouse can drag, and there are arrow buttons and page dots when there is more than one page.
 */
export function PickCarousel<T>({ items, keyOf, selectedKey, renderItem, perPage = 6, variant, onInteract }: PickCarouselProps<T>) {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 });
  const [page, setPage] = useState(0);

  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage));

  const goTo = useCallback((index: number, smooth = true) => {
    const el = scroller.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(pages.length - 1, index));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  }, [pages.length]);

  // Keep the dots in step with the scroll position
  const onScroll = () => {
    const el = scroller.current;
    if (!el || !el.clientWidth) return;
    setPage(Math.round(el.scrollLeft / el.clientWidth));
    onInteract?.();
  };

  // Bring the selected card into view (for example after "Pick for Me!")
  useEffect(() => {
    if (selectedKey === undefined) return;
    const idx = items.findIndex((it) => keyOf(it) === selectedKey);
    if (idx >= 0) goTo(Math.floor(idx / perPage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  // Mouse dragging (touch already scrolls natively)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = scroller.current!;
    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: el.scrollLeft };
    el.style.scrollSnapType = 'none';
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 6) d.moved = true;
    if (d.moved) scroller.current!.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    const el = scroller.current!;
    el.style.scrollSnapType = '';
    if (d.moved) goTo(Math.round(el.scrollLeft / el.clientWidth));
  };
  // A drag must not count as a tap on the card underneath
  const swallowClickAfterDrag = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      drag.current.moved = false;
    }
  };

  const many = pages.length > 1;

  return (
    <div className={`pick-carousel ${variant === 'colors' ? 'is-colors' : ''}`}>
      <div
        ref={scroller}
        className="pick-scroller"
        onScroll={onScroll}
        onPointerDown={(e) => { onInteract?.(); onPointerDown(e); }}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={swallowClickAfterDrag}
      >
        {pages.map((chunk, p) => (
          <div className="pick-page-grid" key={p}>
            {chunk.map((item, i) => (
              <React.Fragment key={keyOf(item)}>{renderItem(item, p * perPage + i)}</React.Fragment>
            ))}
          </div>
        ))}
      </div>

      {many && (
        <>
          <button type="button" data-sfx="back" className="pick-arrow pick-arrow-left" aria-label="Previous options" disabled={page === 0} onClick={() => goTo(page - 1)}>
            <ChevronLeft strokeWidth={3.5} />
          </button>
          <button type="button" data-sfx="next" className="pick-arrow pick-arrow-right" aria-label="More options" disabled={page === pages.length - 1} onClick={() => goTo(page + 1)}>
            <ChevronRight strokeWidth={3.5} />
          </button>
          <div className="pick-dots" role="tablist" aria-label="Pages">
            {pages.map((_, p) => (
              <button type="button" data-sfx="tap" key={p} role="tab" aria-selected={p === page} aria-label={`Page ${p + 1}`}
                className={`pick-dot ${p === page ? 'is-active' : ''}`} onClick={() => goTo(p)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
