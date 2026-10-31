import assert from 'node:assert/strict';
import test from 'node:test';
import { createApi } from '../src/api/client';
import { ApiError, createHttpTransport, type Transport } from '../src/api/http';
import { createMockServer } from '../src/api/mock';
import { acceptRevision, canUseVoiceTurn, responseUsable, routePoints, toPoint } from '../src/core/presentation';
import { parsePush, validateResponse } from '../src/core/validation';
import { runUpdates } from '../src/core/updates';
import type { Envelope, Schema } from '../src/api/types';

test('mock events deliver a server-authored level and latest utterance together', async () => {
  const server = createMockServer(); const api = createApi(server.transport);
  const home = await api.home();
  const before = await api.response('response_demo_001');
  server.setLevel('act');
  const updates = await api.updates(home.data.sync_cursor);
  assert.equal(updates.data.events[0]?.type, 'response.updated');
  const after = validateResponse(await api.response('response_demo_001'), 'response_demo_001');
  assert.equal(after.data.personal_response.level, 'act');
  assert.ok(after.data.revision > before.data.revision);
  assert.match(after.data.assistant_utterance!.text, /시연/);
  assert.equal(after.data.impact.probability, null);
});
test('older revisions cannot restore old guidance', async () => {
  const server = createMockServer(); const api = createApi(server.transport);
  const old = await api.response('response_demo_001'); server.setLevel('prepare');
  const next = await api.response('response_demo_001');
  assert.equal(acceptRevision(next, old), next);
  assert.equal(acceptRevision(old, next), next);
});
test('route is hidden on expiry, mismatch, stale location and invalid coordinates', async () => {
  const api = createApi(createMockServer().transport);
  const response = await api.response('response_demo_001'); const route = await api.route(response.data.id, response.data.revision);
  assert.equal(routePoints(route, response).length, 2);
  assert.equal(routePoints(route, response, Date.parse(response.data.valid_until)).length, 0);
  const mismatch = structuredClone(route); mismatch.data.response_revision++;
  assert.deepEqual(routePoints(mismatch, response), []);
  const stale = structuredClone(response); stale.data.location.status = 'stale';
  assert.deepEqual(routePoints(route, stale), []);
  const invalid = structuredClone(route); invalid.data.route!.geometry.coordinates[0]![1] = 100;
  assert.deepEqual(routePoints(invalid, response), []);
  assert.deepEqual(toPoint([127, 37, 100]), { longitude: 127, latitude: 37 });
});
test('unavailable prediction cannot masquerade as zero risk', async () => {
  const response = await createApi(createMockServer().transport).response('response_demo_001');
  response.data.impact.probability = 0;
  assert.throws(() => validateResponse(response, response.data.id), /INVALID_RESPONSE/);
});
test('cancelled and expired personal responses stop active guidance', async () => {
  const response = await createApi(createMockServer().transport).response('response_demo_001');
  response.data.status = 'resolved'; assert.equal(responseUsable(response), false);
});
test('confirmed context is a PUT with base revision; conflict is preserved', async () => {
  const api = createApi(createMockServer().transport);
  const body: Schema<'ContextWrite'> = { base_revision: 1, confirmation: 'user_confirmed', observed_at: new Date().toISOString(), overrides: { mobility: null, stairs: 'difficult', alone_now: 'unknown' } };
  const accepted = await api.context('response_demo_001', body);
  assert.equal(accepted.data.context_revision, 2);
  await assert.rejects(() => api.context('response_demo_001', body), (e) => e instanceof ApiError && e.status === 409);
});
test('chat keeps server text and rejects an older turn or response', async () => {
  const api = createApi(createMockServer().transport); const response = await api.response('response_demo_001');
  const pending = await api.createTurn(response.data.id, { client_turn_id: 'test_turn', response_revision: 1, transcript: '계단이 어려워요', captured_at: new Date().toISOString(), locale: 'ko-KR' }, 'same-key');
  const ready = await api.turn(response.data.id, pending.data.turn_id);
  assert.equal(canUseVoiceTurn(ready.data, response.data, 'test_turn'), true);
  assert.equal(canUseVoiceTurn(ready.data, response.data, 'new_turn'), false);
  response.data.revision++;
  assert.equal(canUseVoiceTurn(ready.data, response.data, 'test_turn'), false);
  assert.equal(ready.data.audio_url, null);
});
test('HTTP headers, 204, 401 and Retry-After follow the server contract', async () => {
  let captured: RequestInit | undefined;
  const transport = createHttpTransport('https://api.example.invalid', async () => 'test-not-a-real-token', async (_url, init) => { captured = init; return new Response(null, { status: 204 }); });
  await transport('/v1/me/profile', { method: 'DELETE', idempotencyKey: 'request-key' });
  assert.equal((captured?.headers as Record<string, string>).Authorization, 'Bearer test-not-a-real-token');
  const unauthorized = createHttpTransport('https://api.example.invalid', async () => null, async () => { throw new Error('must not send'); });
  await assert.rejects(() => unauthorized('/v1/home'), (e) => e instanceof ApiError && e.status === 401);
  const limited = createHttpTransport('https://api.example.invalid', async () => 'test', async () => new Response(JSON.stringify({ code: 'RATE_LIMITED' }), { status: 429, headers: { 'Retry-After': '12' } }));
  await assert.rejects(() => limited('/v1/home'), (e) => e instanceof ApiError && e.retryAfterMs === 12000);
});
test('existing route URL is reused and resource IDs are escaped', async () => {
  let path = '';
  const transport: Transport = async <T,>(value: string) => { path = value; return {} as Envelope<T>; };
  await createApi(transport).route('response/a', 7);
  assert.equal(path, '/v1/me/responses/response%2Fa/route?response_revision=7');
});
test('push rejects malformed / expired payloads and never accepts arbitrary URLs as routing instructions', () => {
  assert.equal(parsePush({ url: 'https://example.invalid' }), null);
  const payload = { schema_version: '0.1.0', mode: 'live', event_id: 'e', type: 'response.updated', alert_id: null, response_id: 'r', resource_revision: '3', sent_at: new Date().toISOString(), expires_at: new Date(Date.now() + 10_000).toISOString() };
  assert.equal(parsePush(payload)?.resource_revision, 3);
  assert.equal(parsePush({ ...payload, expires_at: '2020-01-01T00:00:00Z' }), null);
});
test('updates deduplicate events and abort on background transition', async () => {
  const controller = new AbortController(); const applied: string[] = [];
  const event: Schema<'UpdateEvent'> = { event_id: 'e1', type: 'response.updated', resource_id: 'r1', resource_revision: 2, response_id: 'r1', occurred_at: new Date().toISOString() };
  let rounds = 0;
  await runUpdates({ bootstrap: async () => 'initial', poll: async () => { rounds++; return { data: { events: [event, event], next_cursor: 'after', has_more: false } } as Envelope<Schema<'Updates'>>; }, apply: async (e) => { applied.push(e.event_id); }, status: (s) => { if (s === 'connected') controller.abort(); } }, controller.signal);
  assert.deepEqual(applied, ['e1']); assert.equal(rounds, 1);
});

test('accepted input writes block newer snapshots based on older inputs', async () => {
  const { createInputRequirements } = await import('../src/core/inputVersions');
  const required = createInputRequirements();
  const { data } = await createApi(createMockServer().transport).response('response_demo_001');
  required.require({ profile: data.input_versions.profile + 1 });
  data.revision += 10;
  assert.equal(required.satisfied(data), false);
  data.input_versions.profile++;
  assert.equal(required.satisfied(data), true);
  required.require({ context: data.input_versions.context + 1 }, data.id);
  assert.equal(required.satisfied(data), false);
  assert.equal(required.satisfied({ ...data, id: 'another-response' }), true);
  data.input_versions.context++;
  assert.equal(required.satisfied(data), true);
});
test('GeoJSON polygon winding is converted for Naver without modifying source', async () => {
  const { naverRing } = await import('../src/core/presentation');
  const ring = [[126, 37], [127, 37], [127, 38], [126, 38], [126, 37]];
  const original = structuredClone(ring);
  const outer = naverRing(ring); const hole = naverRing(ring, false);
  const area = (p: typeof outer) => p.reduce((n, a, i) => { const b = p[(i + 1) % p.length]!; return n + a.longitude * b.latitude - b.longitude * a.latitude; }, 0);
  assert.ok(area(outer) < 0); assert.ok(area(hole) > 0);
  assert.deepEqual(ring, original);
  assert.throws(() => naverRing(ring.slice(0, 4)));
});
test('expired cursor bootstraps fresh state before polling again', async () => {
  const controller = new AbortController(); let boots = 0; const cursors: string[] = [];
  await runUpdates({ bootstrap: async () => `cursor-${++boots}`, poll: async (cursor) => {
    cursors.push(cursor);
    if (cursors.length === 1) throw new ApiError(410, 'CURSOR_EXPIRED');
    return { meta: { schema_version: '0.1.0', mode: 'simulation', request_id: 'test', generated_at: new Date().toISOString(), data_status: 'current' }, data: { events: [], next_cursor: 'done', has_more: false } };
  }, apply: async () => {}, status: (status) => { if (status === 'connected') controller.abort(); } }, controller.signal);
  assert.deepEqual(cursors, ['cursor-1', 'cursor-2']);
});
