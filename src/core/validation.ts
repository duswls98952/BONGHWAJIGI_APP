import { z } from 'zod';
import { ApiError } from '../api/http';
import type { Envelope, ResponseSnapshot, Schema } from '../api/types';
const date = z.string().refine((v) => Number.isFinite(Date.parse(v)));
const nullableId = z.string().min(1).nullable();
export const pushSchema = z.object({
  schema_version: z.literal('0.1.0'), mode: z.enum(['simulation', 'live']),
  event_id: z.string().min(1), type: z.enum(['alert.upserted', 'alert.cancelled', 'response.updated', 'response.resolved']),
  alert_id: nullableId, response_id: nullableId, resource_revision: z.number().int().nonnegative(), sent_at: date, expires_at: date,
});
const responseGuard = z.object({
  id: z.string().min(1), revision: z.number().int().nonnegative(), status: z.enum(['active', 'resolved', 'expired', 'superseded']),
  evaluated_at: date, valid_until: date,
  personal_response: z.object({ level: z.enum(['information', 'attention', 'prepare', 'act', 'request_assistance', 'unknown']), label: z.string(), policy_version: z.string().nullable(), reason_codes: z.array(z.string()) }),
  input_versions: z.object({ profile: z.number().int(), location: z.number().int(), context: z.number().int() }),
  impact: z.object({ status: z.enum(['available', 'unavailable']), probability: z.number().min(0).max(1).nullable() }).refine((v) => v.status !== 'unavailable' || v.probability === null),
  context: z.object({ revision: z.number().int(), tags: z.array(z.object({ code: z.string(), label: z.string(), origin: z.string() })) }),
  actions: z.array(z.object({ id: z.string(), order: z.number().int().positive(), text: z.string(), source_id: z.string() })),
  assistant_utterance: z.object({ id: z.string(), text: z.string(), created_at: date, origin: z.enum(['template', 'model_explanation']) }).nullable(),
  location: z.object({ revision: z.number().int(), status: z.enum(['available', 'stale', 'unavailable']), valid_until: date.nullable(), fix: z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), accuracy_m: z.number().nonnegative(), captured_at: date }).nullable() }),
  route_availability: z.object({ status: z.enum(['available', 'unavailable', 'pending']), expires_at: date.nullable() }),
});
export function validateResponse(value: Envelope<ResponseSnapshot>, id: string) {
  if (value.data.id !== id || !responseGuard.safeParse(value.data).success) throw new ApiError(502, 'INVALID_RESPONSE_SNAPSHOT');
  return value;
}
export function parsePush(input: unknown, now = Date.now()): Schema<'PushPayload'> | null {
  // FCM data strings may encode the entire logical JSON in a payload field.
  try {
    let data = input;
    if (data && typeof data === 'object' && 'payload' in data && typeof data.payload === 'string') data = JSON.parse(data.payload);
    if (data && typeof data === 'object' && 'resource_revision' in data && typeof data.resource_revision === 'string') data = { ...data, resource_revision: Number(data.resource_revision) };
    const parsed = pushSchema.safeParse(data);
    return parsed.success && Date.parse(parsed.data.expires_at) > now ? parsed.data : null;
  } catch { return null; }
}
