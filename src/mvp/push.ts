import {z} from 'zod';
// notifications/service.py의 실제 FCM data 계약. 본문·위치·프로필은 포함하지 않는다.
const schema=z.object({mode:z.literal('simulation'),resource_type:z.enum(['alert','response']),resource_id:z.string().min(1).max(256),revision:z.union([z.number().int().nonnegative(),z.string().regex(/^\d+$/).transform(Number)]).refine(Number.isSafeInteger)});
export function parseMvpPush(value:unknown){const result=schema.safeParse(value);return result.success?result.data:null;}
