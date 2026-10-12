/** An error with an HTTP status. Its message is safe to show the person using the command center or the kiosk. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (message) => new HttpError(400, message);
export const notFound = (message = 'Not found') => new HttpError(404, message);

/** Wraps a route so a thrown error reaches the error handler instead of being lost. */
export const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

/** The last middleware: known errors keep their status and message, anything else is logged and answered with a plain 500. */
// Express recognises an error handler by its four parameters
export function errorHandler(err, req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'That is too big to send' });
  console.error(`${req.method} ${req.originalUrl} failed:`, err);
  res.status(500).json({ error: 'Something went wrong on the server' });
}

/** Allows `limit` calls per minute for each caller (kept in memory, so it is per server instance). */
export function rateLimiter(limit) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < 60_000);
    recent.push(now);
    hits.set(key, recent);
    return recent.length <= limit;
  };
}
