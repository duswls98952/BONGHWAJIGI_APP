import assert from 'node:assert/strict';
import test from 'node:test';
import {createMvpApi} from '../src/api/client';
import {ApiError,createVersionedHttpTransport,validApiUrl,type RequestOptions,type VersionedTransport} from '../src/api/http';
import type {MvpEnvelope,MvpSchema} from '../src/api/mvp-types';

const meta:MvpSchema<'Meta'>={schema_version:'0.2.0-mvp',mode:'simulation',request_id:'synthetic',generated_at:'2026-11-01T00:00:00Z',data_status:'current'};
const response=(body:unknown)=>new Response(JSON.stringify(body),{status:200,headers:{'Content-Type':'application/json'}});

test('MVP transport accepts the current envelope and rejects old versions or missing data',async()=>{
  let wire:unknown={meta,data:{ready:true}};
  const request=createVersionedHttpTransport<MvpSchema<'Meta'>>('https://api.example.invalid',async()=>'synthetic','0.2.0-mvp',{fetcher:async()=>response(wire)});
  assert.deepEqual((await request<{ready:boolean}>('/v1/home')).data,{ready:true});
  for (const invalid of [{meta:{...meta,schema_version:'0.1.0'},data:{}},{meta},{meta:{...meta,mode:'unknown'},data:{}}]) {
    wire=invalid;await assert.rejects(request('/v1/home'),error=>error instanceof ApiError && error.code==='INVALID_ENVELOPE');
  }
});

test('MVP HTTP is allowed only for explicitly enabled loopback development',async()=>{
  for (const url of ['http://localhost:18080','http://127.0.0.1:18080','http://[::1]:18080','http://10.0.2.2:18080']) {
    assert.equal(validApiUrl(url),false);assert.equal(validApiUrl(url,true),true);
  }
  for (const url of ['http://100.116.5.9:8000','http://localhost.example.invalid','http://192.168.1.2','https://user:password@example.invalid','https://api.example.invalid?token=secret','https://api.example.invalid#fragment','file:///tmp/api']) {
    assert.equal(validApiUrl(url,true),false);
  }
  let sent=0;
  const fetcher:typeof fetch=async()=>{sent++;return response({meta,data:{}});};
  const blocked=createVersionedHttpTransport<MvpSchema<'Meta'>>('http://127.0.0.1:18080',async()=>'synthetic','0.2.0-mvp',{fetcher});
  await assert.rejects(blocked('/v1/home'),/HTTPS_API_URL_REQUIRED/);assert.equal(sent,0);
  const enabled=createVersionedHttpTransport<MvpSchema<'Meta'>>('http://127.0.0.1:18080',async()=>'synthetic','0.2.0-mvp',{fetcher,allowLoopbackHttp:true});
  await enabled('/v1/home');assert.equal(sent,1);
});

test('MVP public registration does not load/send access credentials, authenticated writes retain idempotency',async()=>{
  let tokenReads=0;const captured:{url:string;options:RequestInit|undefined}[]=[];
  const request=createVersionedHttpTransport<MvpSchema<'Meta'>>('https://api.example.invalid/',async()=>{tokenReads++;return 'synthetic-access';},'0.2.0-mvp',{fetcher:async(url,options)=>{
    captured.push({url:String(url),options});return response({meta,data:{}});
  }});
  await request('/v1/auth/config',{public:true});
  assert.equal(tokenReads,0);assert.equal(new Headers(captured[0]?.options?.headers).has('Authorization'),false);
  await request('/v1/me/profile',{method:'PUT',body:{base_revision:2,profile:{display_name:'합성 사용자'}},idempotencyKey:'synthetic-key'});
  assert.equal(tokenReads,1);assert.equal(captured[1]?.url,'https://api.example.invalid/v1/me/profile');
  const headers=new Headers(captured[1]?.options?.headers);
  assert.equal(headers.get('Authorization'),'Bearer synthetic-access');assert.equal(headers.get('Idempotency-Key'),'synthetic-key');
  assert.equal(JSON.parse(String(captured[1]?.options?.body)).base_revision,2);
});

test('MVP server detail errors and Retry-After reach the caller unchanged',async()=>{
  const request=createVersionedHttpTransport<MvpSchema<'Meta'>>('https://api.example.invalid',async()=>'synthetic','0.2.0-mvp',{fetcher:async()=>new Response(JSON.stringify({detail:'REGISTRATION_RATE_LIMITED'}),{status:429,headers:{'Retry-After':'7'}})});
  await assert.rejects(request('/v1/auth/installations',{public:true}),error=>error instanceof ApiError && error.code==='REGISTRATION_RATE_LIMITED' && error.retryAfterMs===7000);
});

test('MVP background abort propagates to the pending request',async()=>{
  const controller=new AbortController();let received:AbortSignal|null|undefined;
  let entered!:()=>void;const ready=new Promise<void>(resolve=>{entered=resolve;});
  const request=createVersionedHttpTransport<MvpSchema<'Meta'>>('https://api.example.invalid',async()=>'synthetic','0.2.0-mvp',{fetcher:async(_url,options)=>{
    received=options?.signal;entered();
    return new Promise<Response>((_resolve,reject)=>received?.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true}));
  }});
  const pending=request('/v1/me/updates',{signal:controller.signal});
  const rejected=assert.rejects(pending,error=>error instanceof Error && error.name==='AbortError');
  await ready;controller.abort();await rejected;assert.equal(received?.aborted,true);
});

test('MVP API uses cursor, escapes resource IDs and retains confirmed-write revisions',async()=>{
  const sent:{path:string;options:RequestOptions|undefined}[]=[];
  const transport:VersionedTransport<MvpSchema<'Meta'>>=async<T,>(path:string,options?:RequestOptions)=>{sent.push({path,options});return {meta,data:{}} as MvpEnvelope<T>;};
  const api=createMvpApi(transport);
  await api.updates('cursor+/=&');assert.equal(sent.at(-1)?.path,'/v1/me/updates?wait_seconds=25&cursor=cursor%2B%2F%3D%26');
  await api.updates(undefined,undefined,0);assert.equal(sent.at(-1)?.path,'/v1/me/updates?wait_seconds=0');
  await api.snapshot('response/a');assert.equal(sent.at(-1)?.path,'/v1/me/responses/response%2Fa');
  const body:MvpSchema<'ContextWrite'>={base_revision:4,observed_at:meta.generated_at,confirmation:'user_confirmed',state:{can_move:false}};
  await api.context('response/a',body);
  assert.equal(sent.at(-1)?.path,'/v1/me/responses/response%2Fa/context');assert.equal(sent.at(-1)?.options?.method,'PUT');assert.deepEqual(sent.at(-1)?.options?.body,body);
  await api.refresh('synthetic-refresh');assert.equal(sent.at(-1)?.options?.public,true);
  assert.deepEqual(sent.at(-1)?.options?.body,{refresh_token:'synthetic-refresh'});
});
