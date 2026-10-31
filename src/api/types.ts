import type { components } from './generated';
export type Schema<K extends keyof components['schemas']> = components['schemas'][K];
export type Envelope<T> = { meta: Schema<'Meta'>; data: T };
export type ResponseSnapshot = Schema<'ResponseSnapshot'>;
export type Level = ResponseSnapshot['personal_response']['level'];
export type GeoPoint = { latitude: number; longitude: number };
