import { useEffect, useState } from 'react';

/**
 * How much to scale something designed at `designHeight` (and optionally `designWidth`) so it takes the given
 * share of the window, kept up to date when the window changes size.
 */
export function useFitScale(
  designHeight: number,
  heightShare: number,
  designWidth?: number,
  widthShare?: number,
): number {
  const compute = () => {
    const byHeight = (window.innerHeight * heightShare) / designHeight;
    return designWidth && widthShare ? Math.min(byHeight, (window.innerWidth * widthShare) / designWidth) : byHeight;
  };
  const [scale, setScale] = useState(compute);

  useEffect(() => {
    const update = () => setScale(compute());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
    // `compute` only reads the arguments, which do not change while a page is showing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designHeight, heightShare, designWidth, widthShare]);

  return scale;
}
