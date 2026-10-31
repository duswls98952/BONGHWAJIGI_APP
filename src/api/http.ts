import type { Envelope } from './types';
export class ApiError extends Error {
  constructor(public status: number, public code: string, public retryAfterMs = 0) { super(code); }
}
export type RequestOptions = { method?: string; body?: unknown; signal?: AbortSignal; idempotencyKey?: string; public?: boolean };
export type Transport = <T>(path: string, options?: RequestOptions) => Promise<Envelope<T>>;
export function createHttpTransport(baseUrl: string, getToken: () => Promise<string | null>, fetcher: typeof fetch = fetch): Transport {
  return async <T>(path: string, options: RequestOptions = {}) => {
    if (!baseUrl.startsWith('https://')) throw new ApiError(0, 'HTTPS_API_URL_REQUIRED');
    const token = options.public ? null : await getToken();
    if (!options.public && !token) throw new ApiError(401, 'AUTH_PROVIDER_NOT_CONNECTED');
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    if (options.signal?.aborted) controller.abort();
    options.signal?.addEventListener('abort', onAbort, { once: true });
    // Must exceed the server's 20-second long poll wait.
    const timer = setTimeout(() => controller.abort(), 35_000);
    try {
      const res = await fetcher(`${baseUrl.replace(/\/$/, '')}${path}`, {
        method: options.method ?? 'GET', signal: controller.signal,
        headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}) },
        ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      });
      if (!res.ok) {
        const problem = await res.json().catch(() => ({}));
        const retry = res.headers.get('Retry-After');
        const wait = retry ? (Number.isFinite(Number(retry)) ? Number(retry) * 1000 : Date.parse(retry) - Date.now()) : 0;
        throw new ApiError(res.status, typeof problem.code === 'string' ? problem.code : `HTTP_${res.status}`, Math.max(0, wait || 0));
      }
      if (res.status === 204) return undefined as unknown as Envelope<T>;
      const body = await res.json();
      if (!body?.meta || body.meta.schema_version !== '0.1.0' || !['live', 'simulation'].includes(body.meta.mode) || !Object.hasOwn(body, 'data')) throw new ApiError(502, 'INVALID_ENVELOPE');
      return body as Envelope<T>;
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onAbort);
    }
  };
}
