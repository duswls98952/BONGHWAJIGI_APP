import type { Transport } from './http';
import type { Schema } from './types';
const id = encodeURIComponent;
export function createApi(request: Transport) {
  return {
    config: (signal?: AbortSignal) => request<Schema<'Config'>>('/v1/app-config', { public: true, signal }),
    home: (signal?: AbortSignal) => request<Schema<'Home'>>('/v1/home', { signal }),
    alert: (alertId: string, signal?: AbortSignal) => request<Schema<'Alert'>>(`/v1/me/alerts/${id(alertId)}`, { signal }),
    response: (responseId: string, signal?: AbortSignal) => request<Schema<'ResponseSnapshot'>>(`/v1/me/responses/${id(responseId)}`, { signal }),
    profile: () => request<Schema<'Profile'>>('/v1/me/profile'),
    saveProfile: (body: Schema<'ProfileWrite'>) => request<Schema<'Profile'>>('/v1/me/profile', { method: 'PUT', body }),
    preferences: () => request<Schema<'Preferences'>>('/v1/me/preferences'),
    location: (body: Schema<'LocationWrite'>) => request<Schema<'Location'>>('/v1/me/location', { method: 'PUT', body }),
    deleteLocation: (revision: number) => request<void>(`/v1/me/location?base_revision=${revision}`, { method: 'DELETE' }),
    device: (installationId: string, body: Schema<'DeviceWrite'>) => request<Schema<'Device'>>(`/v1/me/devices/${id(installationId)}`, { method: 'PUT', body }),
    deleteDevice: (installationId: string) => request<void>(`/v1/me/devices/${id(installationId)}`, { method: 'DELETE' }),
    updates: (cursor: string, signal?: AbortSignal) => request<Schema<'Updates'>>(`/v1/me/updates?after=${id(cursor)}&wait_seconds=20`, { signal }),
    route: (responseId: string, revision: number, signal?: AbortSignal) => request<Schema<'Route'>>(`/v1/me/responses/${id(responseId)}/route?response_revision=${revision}`, { signal }),
    rules: (kind: Schema<'Rules'>['disaster_type'], signal?: AbortSignal) => request<Schema<'Rules'>>(`/v1/safety-rules/${id(kind)}?locale=ko-KR`, { signal }),
    context: (responseId: string, body: Schema<'ContextWrite'>) => request<Schema<'ContextAccepted'>>(`/v1/me/responses/${id(responseId)}/context`, { method: 'PUT', body }),
    createTurn: (responseId: string, body: Schema<'VoiceTurnWrite'>, key: string) => request<Schema<'VoiceTurn'>>(`/v1/me/responses/${id(responseId)}/voice-turns`, { method: 'POST', body, idempotencyKey: key }),
    turn: (responseId: string, turnId: string, signal?: AbortSignal) => request<Schema<'VoiceTurn'>>(`/v1/me/responses/${id(responseId)}/voice-turns/${id(turnId)}`, { signal }),
    cancelTurn: (responseId: string, turnId: string) => request<void>(`/v1/me/responses/${id(responseId)}/voice-turns/${id(turnId)}`, { method: 'DELETE' }),
    receipt: (alertId: string, body: Schema<'ReceiptWrite'>, key: string) => request<Schema<'Receipt'>>(`/v1/me/alerts/${id(alertId)}/receipts`, { method: 'POST', body, idempotencyKey: key }),
    supportDraft: (responseId: string, body: Schema<'SupportDraftWrite'>, key: string) => request<Schema<'SupportDraft'>>(`/v1/me/responses/${id(responseId)}/support-drafts`, { method: 'POST', body, idempotencyKey: key }),
  };
}
export type AppApi = ReturnType<typeof createApi>;
