import type { Transport } from './http';
import type { Schema } from './types';
import type {VersionedTransport} from './http';
import type {MvpSchema, MvpConfig, MvpUpdates} from './mvp-types';
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

// 현재 실행 계약. 0.1 화면 초안은 이력·기존 검사와 구분하여 보존한다.
export function createMvpApi(request: VersionedTransport<MvpSchema<'Meta'>>) {
  return {
    registrationConfig: () => request<{registration_enabled: boolean; consent_version: 'internal-demo-v1'; kind: string; notice: string}>('/v1/auth/config', {public:true}),
    register: (body: MvpSchema<'InstallationRegistration'>) => request<MvpSchema<'SessionTokens'>>('/v1/auth/installations', {method:'POST',body,public:true}),
    refresh: (refreshToken: string) => request<MvpSchema<'SessionTokens'>>('/v1/auth/refresh', {method:'POST',body:{refresh_token:refreshToken},public:true}),
    config: (signal?: AbortSignal) => request<MvpConfig>('/v1/app-config', {signal}),
    home: (signal?: AbortSignal) => request<MvpSchema<'HomeData'>>('/v1/home', {signal}),
    profile: () => request<MvpSchema<'ProfileData'>>('/v1/me/profile'),
    saveProfile: (body: MvpSchema<'ProfileWrite'>, key: string) => request<MvpSchema<'ProfileData'>>('/v1/me/profile', {method:'PUT',body,idempotencyKey:key}),
    deleteProfile: () => request<MvpSchema<'ProfileData'>>('/v1/me/profile', {method:'DELETE'}),
    preferences: () => request<{revision: number; preferences: MvpSchema<'Preferences'>}>('/v1/me/preferences'),
    savePreferences: (body: MvpSchema<'PreferencesWrite'>) => request<{revision: number; preferences: MvpSchema<'Preferences'>}>('/v1/me/preferences', {method:'PUT',body}),
    location: () => request<MvpSchema<'LocationData'>>('/v1/me/location'),
    sendLocation: (body: MvpSchema<'LocationWrite'>) => request<MvpSchema<'LocationData'>>('/v1/me/location', {method:'PUT',body}),
    deleteLocation: () => request<MvpSchema<'LocationData'>>('/v1/me/location', {method:'DELETE'}),
    device: (installation: string, body: MvpSchema<'DeviceWrite'>) => request<{installation_id:string;revision:number;push_status:string}>(`/v1/me/devices/${id(installation)}`, {method:'PUT',body}),
    deleteDevice: (installation: string) => request<unknown>(`/v1/me/devices/${id(installation)}`, {method:'DELETE'}),
    alert: (alertId: string, signal?: AbortSignal) => request<MvpSchema<'AlertData'>>(`/v1/me/alerts/${id(alertId)}`, {signal}),
    snapshot: (responseId: string, signal?: AbortSignal) => request<MvpSchema<'SnapshotData'>>(`/v1/me/responses/${id(responseId)}`, {signal}),
    context: (responseId: string, body: MvpSchema<'ContextWrite'>) => request<{context_revision:number;response_id:string;expires_at:string;reevaluation:string}>(`/v1/me/responses/${id(responseId)}/context`, {method:'PUT',body}),
    updates: (cursor?: string, signal?: AbortSignal, wait=25) => request<MvpUpdates>(`/v1/me/updates?wait_seconds=${wait}${cursor ? `&cursor=${id(cursor)}` : ''}`, {signal}),
    rules: () => request<MvpSchema<'RulesData'>>('/v1/safety-rules/wildfire'),
    preparations: () => request<MvpSchema<'PreparationsData'>>('/v1/me/preparations'),
    receipt: (alertId: string, body: MvpSchema<'ReceiptWrite'>, key: string) => request<{receipt_id:string;recorded_at:string;meaning:string}>(`/v1/me/alerts/${id(alertId)}/receipts`, {method:'POST',body,idempotencyKey:key}),
    logout: () => request<{status:string}>('/v1/me/logout', {method:'POST'}),
    route: (responseId: string) => request<{status:'unavailable';route:null;reason:string}>(`/v1/me/responses/${id(responseId)}/route`),
  };
}
export type MvpApi = ReturnType<typeof createMvpApi>;
