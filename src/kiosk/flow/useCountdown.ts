import { useEffect, useRef, useState } from 'react';

/** Counts down from `seconds` and calls `onZero` once when it reaches zero. Returns the seconds left. */
export function useCountdown(seconds: number, onZero: () => void): number {
  const [left, setLeft] = useState(seconds);
  const done = useRef(onZero);
  done.current = onZero;

  useEffect(() => {
    if (left <= 0) {
      done.current();
      return;
    }
    const timer = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  return left;
}
