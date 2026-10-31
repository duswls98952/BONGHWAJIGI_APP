import assert from 'node:assert/strict';
import test from 'node:test';
import {createMvpApi} from '../src/api/client';
import {ApiError} from '../src/api/http';
import type {MvpEnvelope,MvpSnapshot} from '../src/api/mvp-types';
import {acceptSnapshot,checkSnapshot,freshUntil,snapshotReady} from '../src/mvp/core';
import {createMvpMock} from '../src/mvp/mock';

async function fixture() {
  const mock=createMvpMock();const api=createMvpApi(mock.transport);
  return api.snapshot(mock.snapshot().id);
}

test('MVP snapshot rejects another response ID and mismatched three-stage numbers',async()=>{
  const value=await fixture();assert.equal(checkSnapshot(value,value.data.id),value);
  assert.throws(()=>checkSnapshot(value,'another-response'),error=>error instanceof ApiError && error.code==='INVALID_RESPONSE');
  value.data.content!.personal_response.number=3;
  assert.throws(()=>checkSnapshot(value,value.data.id),error=>error instanceof ApiError && error.code==='INVALID_RESPONSE_LEVEL');
});

test('MVP absent prediction cannot be replaced with a zero probability',async()=>{
  const value=await fixture();
  const invalid=structuredClone(value) as unknown as {data:{content:{prediction:{probability:number}}}};
  invalid.data.content.prediction.probability=0;
  assert.throws(()=>checkSnapshot(invalid as unknown as MvpEnvelope<MvpSnapshot>,value.data.id),/INVALID_RESPONSE/);
});

test('MVP older revisions and older metadata at the same revision cannot restore guidance',async()=>{
  const current=await fixture();current.data.revision=10;
  const old=structuredClone(current);old.data.revision=9;
  assert.equal(acceptSnapshot(current,old),current);
  const same=structuredClone(current);same.meta.generated_at=new Date(Date.parse(current.meta.generated_at)-1).toISOString();
  assert.equal(acceptSnapshot(current,same),current);
  const wrong=structuredClone(current);wrong.data.id='different';wrong.data.revision=99;
  assert.equal(acceptSnapshot(current,wrong),current);
  const next=structuredClone(current);next.data.revision++;
  assert.equal(acceptSnapshot(current,next),next);assert.equal(acceptSnapshot(undefined,next),next);
});

test('MVP expiry, pending update, error, and unavailable scope block active actions',async()=>{
  const value=await fixture();const now=Date.parse(value.meta.generated_at);
  assert.equal(snapshotReady(value,{},now),true);
  assert.equal(snapshotReady(value,{},Date.parse(value.data.content!.valid_until!)),false);
  for (const mutate of [
    (v:MvpEnvelope<MvpSnapshot>)=>{v.data.pending_update=true;},
    (v:MvpEnvelope<MvpSnapshot>)=>{v.data.error_code='POLICY_PENDING';},
    (v:MvpEnvelope<MvpSnapshot>)=>{v.meta.data_status='stale';},
    (v:MvpEnvelope<MvpSnapshot>)=>{v.data.content=null;},
    (v:MvpEnvelope<MvpSnapshot>)=>{v.data.content!.personal_response.level='unknown';},
    ...['pending_update','needs_refresh','outside_scope'].map(state=>(v:MvpEnvelope<MvpSnapshot>)=>{v.data.content!.state=state;}),
  ]) {
    const changed=structuredClone(value);mutate(changed);assert.equal(snapshotReady(changed,{},now),false);
  }
  assert.equal(snapshotReady(undefined),false);
  assert.equal(freshUntil(null,now),false);assert.equal(freshUntil('invalid',now),false);
});

test('MVP accepted input revisions block even newer policies until all inputs are evaluated',async()=>{
  const value=await fixture(),content=value.data.content!;
  const user=String(content.user_id),profile=`profile:${user}`,location=`location:${user}`;
  const required={[profile]:content.input_versions[profile]!+1,[location]:content.input_versions[location]!+1};
  value.data.revision+=100;
  assert.equal(snapshotReady(value,required),false);
  content.input_versions[profile]=required[profile]!;
  assert.equal(snapshotReady(value,required),false);
  content.input_versions[location]=required[location]!;
  assert.equal(snapshotReady(value,required),true);
  const state=`state:${content.incident_id}/${user}`;
  assert.equal(snapshotReady(value,{[state]:2}),false);
  content.input_versions[state]=2;assert.equal(snapshotReady(value,{[state]:2}),true);
  assert.equal(snapshotReady(value,{[`state:another-incident/${user}`]:99}),true);
});

test('MVP cancelled official notice does not falsely resolve an independently current personal policy',async()=>{
  const value=await fixture();
  value.data.content!.official_alerts.forEach(alert=>{alert.state='cancelled';});
  assert.equal(snapshotReady(value),true);
});
