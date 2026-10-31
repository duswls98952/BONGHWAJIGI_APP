import { ApiError } from '../api/http';
import { delay } from './async';
import type { Envelope, Schema } from '../api/types';

export type SyncStatus = 'connecting' | 'connected' | 'reconnecting' | 'authentication_required' | 'background';
type Options = {
  bootstrap: (signal: AbortSignal) => Promise<string>;
  poll: (cursor: string, signal: AbortSignal) => Promise<Envelope<Schema<'Updates'>>>;
  apply: (event: Schema<'UpdateEvent'>, signal: AbortSignal) => Promise<void>;
  status: (value: SyncStatus) => void;
};
// One foreground loop. Cursor advances only after every event is applied successfully.
export async function runUpdates(options: Options, signal: AbortSignal) {
  let cursor: string | undefined;
  let failures = 0;
  const seen = new Set<string>();
  while (!signal.aborted) {
    try {
      if (cursor === undefined) { options.status('connecting'); cursor = await options.bootstrap(signal); }
      const result = await options.poll(cursor, signal);
      for (const event of result.data.events) {
        if (signal.aborted) return;
        if (seen.has(event.event_id)) continue;
        await options.apply(event, signal);
        seen.add(event.event_id);
        if (seen.size > 500) seen.delete(seen.values().next().value!);
      }
      cursor = result.data.next_cursor;
      failures = 0;
      options.status('connected');
      // Prevent an empty/instant server response from creating a tight request loop.
      await delay(result.data.has_more ? 20 : 250, signal);
    } catch (error) {
      if (signal.aborted) return;
      if (error instanceof ApiError && error.status === 401) { options.status('authentication_required'); return; }
      if (error instanceof ApiError && error.status === 410) { cursor = undefined; seen.clear(); }
      options.status('reconnecting');
      failures++;
      const retryAfter = error instanceof ApiError ? error.retryAfterMs : 0;
      try { await delay(Math.max(retryAfter, Math.min(30_000, 1000 * 2 ** Math.min(failures - 1, 5))) + Math.random() * 250, signal); } catch { return; }
    }
  }
}
