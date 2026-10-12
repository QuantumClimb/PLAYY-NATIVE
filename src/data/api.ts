/** A failed request to the server, with the HTTP status and the message the server gave. */
class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function send<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  return data as T;
}

/** The only place the app talks to the server: JSON in, JSON out, failures thrown as `ApiError`. */
export const api = {
  get: <T>(url: string) => send<T>('GET', url),
  post: <T>(url: string, body?: unknown) => send<T>('POST', url, body ?? {}),
  put: <T>(url: string, body: unknown) => send<T>('PUT', url, body),
  delete: <T>(url: string) => send<T>('DELETE', url),
};
