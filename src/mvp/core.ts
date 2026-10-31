import {z} from 'zod';
import {ApiError} from '../api/http';
import type {MvpEnvelope, MvpSchema, MvpSnapshot} from '../api/mvp-types';

const date = z.string().refine(value => Number.isFinite(Date.parse(value)));
const snapshotGuard = z.object({
  id:z.string().min(1), revision:z.number().int().nonnegative(), pending_update:z.boolean(),
  user_context:z.object({revision:z.number().int().nonnegative(),status:z.enum(['available','stale','unavailable'])}),
  content:z.object({
    mode:z.literal('simulation'), operational_use:z.literal(false),
    state:z.string(), valid_until:date.nullable(),
    personal_response:z.object({level:z.enum(['prepare','act','request_assistance','information','unknown']),number:z.number().int().nullable(),label:z.string()}),
    actions:z.array(z.object({action_id:z.string(),text:z.string(),priority:z.number().int()})),
    prediction:z.object({status:z.literal('unavailable'),probability:z.null(),used_for_response_level:z.literal(false)}),
    input_versions:z.record(z.string(),z.number().int().nonnegative()),
  }).nullable(),
});

export function checkSnapshot(value:MvpEnvelope<MvpSnapshot>, id:string) {
  if (!snapshotGuard.safeParse(value.data).success || value.data.id !== id) throw new ApiError(502,'INVALID_RESPONSE');
  const personal=value.data.content?.personal_response;
  if (personal && ({prepare:1,act:2,request_assistance:3,information:null,unknown:null}[personal.level] !== personal.number)) throw new ApiError(502,'INVALID_RESPONSE_LEVEL');
  return value;
}
export function acceptSnapshot(old:MvpEnvelope<MvpSnapshot>|undefined, next:MvpEnvelope<MvpSnapshot>) {
  if (old && (next.data.id !== old.data.id || next.data.revision < old.data.revision || (next.data.revision === old.data.revision && Date.parse(next.meta.generated_at) < Date.parse(old.meta.generated_at)))) return old;
  return next;
}
export function freshUntil(value:string|null|undefined, now=Date.now()) {
  return !!value && Number.isFinite(Date.parse(value)) && Date.parse(value) > now;
}
export function snapshotReady(value:MvpEnvelope<MvpSnapshot>|undefined, required:Record<string,number>={}, now=Date.now()) {
  const data=value?.data, content=data?.content;
  return !!(data && content && !data.pending_update && !data.error_code && value?.meta.data_status==='current' && freshUntil(content.valid_until,now) && !['unknown'].includes(content.personal_response.level) && !['pending_update','needs_refresh','outside_scope'].includes(content.state) && Object.entries(required).every(([key,revision]) => key.startsWith('state:')&&!key.startsWith(`state:${content.incident_id}/`) || (content.input_versions[key] ?? -1)>=revision));
}
export const stageColors:Record<MvpSchema<'PersonalResponse'>['level'], {background:string;ink:string}> = {
  prepare:{background:'#fff1b8',ink:'#695000'}, act:{background:'#ffdec2',ink:'#8a3a0c'},
  request_assistance:{background:'#f9d1cc',ink:'#9d2422'}, information:{background:'#e5f0ea',ink:'#264b3d'},
  unknown:{background:'#eff1f4',ink:'#44515e'},
};
export function userMessage(error:unknown) {
  if (error instanceof ApiError) {
    if (error.status===401) return '연결 시간이 끝났습니다. 다시 시작해 주세요.';
    if (error.status===409) return '다른 변경이 먼저 반영됐습니다. 최신 내용을 불러온 뒤 다시 저장해 주세요.';
    if (error.status===429) return '요청이 많아 잠시 기다려야 합니다. 잠시 후 다시 시도해 주세요.';
    if (error.code==='INSTALLATION_REGISTRATION_DISABLED') return '현재 서버에서 새 시연 연결을 준비 중입니다.';
    if (error.status===422) return '입력 내용과 동의 항목을 다시 확인해 주세요.';
    if (error.status===404) return '현재 접근할 수 있는 안내가 없습니다.';
  }
  return '연결하지 못했습니다. 인터넷과 서버 연결을 확인하고 다시 시도해 주세요.';
}
