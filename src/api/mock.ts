import fixtures from '../../docs/api/upstream-examples.json';
import { ApiError, type RequestOptions, type Transport } from './http';
import type { Envelope, Level, Schema } from './types';
import { levelStyle } from '../core/presentation';

import { delay } from '../core/async';

const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
export function createMockServer(now: () => number = Date.now) {
  const offset = now() - Date.parse(fixtures.reference_clock);
  function example<T>(name: string): Envelope<T> {
    const value = fixtures.exchanges.find((e) => e.id === name)?.response.body;
    if (!value) throw new Error(`Unknown fixture: ${name}`);
    return JSON.parse(JSON.stringify(value), (_key, v) => typeof v === 'string' && /^\d{4}-\d\d-\d\dT/.test(v) && Number.isFinite(Date.parse(v)) ? new Date(Date.parse(v) + offset).toISOString() : v);
  }
  const response = example<Schema<'ResponseSnapshot'>>('getResponse');
  const profile = example<Schema<'Profile'>>('getProfile');
  const config = example<Schema<'Config'>>('getAppConfig');
  const home = example<Schema<'Home'>>('getHome');
  const route = example<Schema<'Route'>>('route_available_simulation');
  let cursor = 0;
  const events: (Schema<'UpdateEvent'> & { sequence: number })[] = [];
  const turns = new Map<string, Schema<'VoiceTurn'>>();
  config.data.features.voice_turns = { enabled: true, reason_code: null };
  home.data.capabilities.voice_turns = { enabled: true, reason_code: null };
  response.data.route_availability = { status: 'available', expires_at: response.data.valid_until, reason_code: null };
  function emit(type: Schema<'UpdateEvent'>['type'], resourceId: string, revision: number) {
    cursor++;
    events.push({ event_id: `mock_event_${cursor}`, type, resource_id: resourceId, resource_revision: revision, response_id: response.data.id, occurred_at: new Date(now()).toISOString(), sequence: cursor });
    if (events.length > 200) events.shift();
  }
  function refreshResponse() {
    response.data.revision++;
    response.data.evaluated_at = new Date(now()).toISOString();
    response.data.valid_until = new Date(now() + 300_000).toISOString();
    response.data.route_availability.expires_at = response.data.valid_until;
    route.data.response_revision = response.data.revision;
    if (route.data.route) {
      route.data.route.response_revision = response.data.revision;
      route.data.route.valid_until = response.data.valid_until;
    }
    emit('response.updated', response.data.id, response.data.revision);
  }
  function setLevel(level: Level) {
    response.data.personal_response = { level, label: `[시연] ${levelStyle[level].name}`, policy_version: 'mock-only', reason_codes: ['SIMULATION_ONLY'] };
    response.data.assistant_utterance = { id: `mock_utterance_${cursor + 1}`, text: `[시연] 서버가 보낸 ${levelStyle[level].name} 단계의 안내 문장입니다. 실제 대피 안내가 아닙니다.`, origin: 'template', created_at: new Date(now()).toISOString() };
    refreshResponse();
  }
  const envelope = <T,>(data: T): Envelope<T> => ({ meta: { ...response.meta, request_id: `mock_${cursor}`, generated_at: new Date(now()).toISOString() }, data });
  const transport: Transport = async <T,>(path: string, options: RequestOptions = {}) => {
    const url = new URL(path, 'https://mock.invalid');
    const p = url.pathname;
    const method = options.method ?? 'GET';
    let result: unknown;
    if (p === '/v1/me/updates') {
      const after = Number(url.searchParams.get('after')?.replace('mock_', ''));
      if (!Number.isFinite(after) || after > cursor || (events[0] && after < events[0].sequence - 1)) throw new ApiError(410, 'CURSOR_EXPIRED');
      await delay(700, options.signal);
      result = envelope({ events: events.filter((e) => e.sequence > after).map(({ sequence: _, ...event }) => event), next_cursor: `mock_${cursor}`, has_more: false });
    } else if (p === '/v1/app-config') result = config;
    else if (p === '/v1/home') result = { ...home, data: { ...home.data, sync_cursor: `mock_${cursor}` } };
    else if (p === '/v1/me/profile') {
      if (method === 'PUT') {
        const body = options.body as Schema<'ProfileWrite'>;
        if (body.base_revision !== profile.data.revision) throw new ApiError(409, 'REVISION_CONFLICT');
        profile.data.profile = body.profile;
        profile.data.revision++;
        profile.data.updated_at = new Date(now()).toISOString();
        response.data.input_versions.profile = profile.data.revision;
        emit('profile.updated', 'me', profile.data.revision);
        refreshResponse();
      }
      result = profile;
    } else if (p === '/v1/me/preferences') result = example('getPreferences');
    else if (p === '/v1/me/location') {
      if (method === 'PUT') {
        response.data.location = { revision: response.data.location.revision + 1, status: 'available', fix: options.body as Schema<'LocationWrite'>, valid_until: new Date(now() + 300_000).toISOString(), reason_codes: [] };
        response.data.input_versions.location = response.data.location.revision;
        home.data.location = response.data.location;
        refreshResponse();
      }
      result = envelope(response.data.location);
    } else if (p === `/v1/me/alerts/${response.data.official_alert?.id}`) result = envelope(response.data.official_alert);
    else if (p === `/v1/me/responses/${response.data.id}`) result = response;
    else if (p === `/v1/me/responses/${response.data.id}/route`) {
      if (Number(url.searchParams.get('response_revision')) !== response.data.revision) throw new ApiError(409, 'RESPONSE_CHANGED');
      result = route;
    } else if (p.endsWith('/context') && method === 'PUT') {
      const body = options.body as Schema<'ContextWrite'>;
      if (body.base_revision !== response.data.context.revision) throw new ApiError(409, 'REVISION_CONFLICT');
      response.data.context.revision++;
      response.data.context.tags = Object.entries(body.overrides).filter(([, value]) => value !== null).map(([key, value]) => ({ code: `${key}_${value}`, label: `[확인] ${key}: ${value}`, origin: 'user_confirmed', confirmed_at: body.observed_at, expires_at: new Date(now() + 3_600_000).toISOString() }));
      response.data.input_versions.context = response.data.context.revision;
      refreshResponse();
      result = envelope({ context_revision: response.data.context.revision, response_id: response.data.id, expires_at: new Date(now() + 3_600_000).toISOString(), reevaluation: 'pending' });
    } else if (p.endsWith('/voice-turns') && method === 'POST') {
      const body = options.body as Schema<'VoiceTurnWrite'>;
      if (body.response_revision !== response.data.revision) throw new ApiError(409, 'RESPONSE_CHANGED');
      const turn: Schema<'VoiceTurn'> = { turn_id: body.client_turn_id, client_turn_id: body.client_turn_id, response_revision: body.response_revision, status: 'ready', utterance: { id: `utter_${body.client_turn_id}`, text: '[시연] 입력을 받았습니다. 현재 상태는 아래에서 직접 확인·수정해 주세요.', origin: 'template', created_at: new Date(now()).toISOString() }, proposed_context: null, audio_url: null, audio_expires_at: null, reason_code: null, expires_at: new Date(now() + 60_000).toISOString() };
      turns.set(turn.turn_id, turn);
      emit('voice_turn.ready', turn.turn_id, 1);
      result = envelope({ ...turn, status: 'pending', utterance: null });
    } else if (p.includes('/voice-turns/')) {
      const turn = turns.get(decodeURIComponent(p.split('/').at(-1)!));
      if (!turn) throw new ApiError(404, 'NOT_FOUND');
      if (method === 'DELETE') turn.status = 'cancelled';
      result = envelope(turn);
    } else if (p.startsWith('/v1/safety-rules/')) result = example('getSafetyRules');
    else if (p.endsWith('/support-drafts')) result = example('createSupportDraft');
    else if (p.includes('/devices/')) result = example('putDevice');
    else if (p.endsWith('/receipts')) result = example('postAlertReceipt');
    else throw new ApiError(404, 'MOCK_ENDPOINT_NOT_IMPLEMENTED');
    return copy(result) as Envelope<T>;
  };
  return { transport, setLevel };
}
