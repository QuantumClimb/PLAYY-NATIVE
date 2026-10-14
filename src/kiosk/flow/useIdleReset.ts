import { useCallback, useEffect, useRef } from 'react';

/** Seconds without a touch before the kiosk goes back to the intro screen */
export const IDLE_SECONDS = 240;

/**
 * Calls `onIdle` after `seconds` without activity. Returns a function that restarts the countdown;
 * call it on every touch. The countdown lives in a ref, so counting down never re-renders the page.
 */
export function useIdleReset(onIdle: () => void, seconds: number): () => void {
  const left = useRef(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      left.current -= 1;
      if (left.current <= 0) {
        left.current = seconds;
        onIdle();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [onIdle, seconds]);

  return useCallback(() => {
    left.current = seconds;
  }, [seconds]);
}
