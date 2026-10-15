// Caching for what every kiosk reads on start (characters, backgrounds, texts). Vercel's edge keeps a copy for a few
// minutes, so most kiosk starts never reach the database, which is billed by the data it sends.

const KIOSK_READS = new Set([
  '/assets',
  '/scene-backgrounds',
  '/brand',
  '/power-quiz-questions',
  '/intro-badges',
  '/progress-tabs',
  '/trump-card',
  '/sounds',
]);

const SHARED = 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600';

/**
 * Marks successful kiosk reads as cacheable. Someone signed in to the command center always gets fresh data, and a
 * failed answer is never kept. A command center edit reaches the kiosks within about five minutes.
 */
export function cacheKioskReads(req, res, next) {
  if (req.method !== 'GET' || !KIOSK_READS.has(req.path)) return next();
  res.setHeader('Vary', 'Cookie');
  const json = res.json.bind(res);
  res.json = (body) => {
    const signedIn = /(?:^|;\s*)cc_session=/.test(req.headers.cookie || '');
    if (res.statusCode === 200) res.setHeader('Cache-Control', signedIn ? 'no-store' : SHARED);
    return json(body);
  };
  next();
}
