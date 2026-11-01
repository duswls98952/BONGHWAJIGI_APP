import type {components} from './mvp-generated';
export type MvpSchema<K extends keyof components['schemas']> = components['schemas'][K];
export type MvpEnvelope<T> = {meta: MvpSchema<'Meta'>; data: T};
export type MvpProfile = MvpSchema<'AppProfile'>;
export type MvpSnapshot = MvpSchema<'SnapshotData'>;
export type MvpHome = MvpSchema<'HomeData'>;
export type MvpTokens = MvpSchema<'SessionTokens'>;
export type MvpConfig = {
  contract_version: '0.2.0-mvp';
  levels: {level: string; number: number; label: string}[];
  features: Record<string, boolean | string>;
  location_max_age_seconds: number;
  updates_wait_seconds: number;
  emergency_phone: string;
  automatic_emergency_call: false;
};
export type MvpUpdates = {
  events: {event_id: string; type: string; resource_id: string | null; resource_revision: number; occurred_at: string}[];
  next_cursor: string; has_more: boolean;
};
