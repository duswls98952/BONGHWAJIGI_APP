import assert from 'node:assert/strict';
import test from 'node:test';
import {createMvpApi} from '../src/api/client';
import {ApiError} from '../src/api/http';
import type {MvpSchema} from '../src/api/mvp-types';
import {checkSnapshot,snapshotReady} from '../src/mvp/core';
import {createMvpMock} from '../src/mvp/mock';

test('MVP server fixtures replay 경고, 대피, 위급 with simulation and unavailable prediction intact',async()=>{
  const mock=createMvpMock(),api=createMvpApi(mock.transport);let revision=0;
  for (const [stage,level,label] of [['1','prepare','경고'],['2','act','대피'],['3','request_assistance','위급']] as const) {
    mock.setStage(stage);const value=checkSnapshot(await api.snapshot(mock.snapshot().id),mock.snapshot().id);
    assert.equal(value.meta.mode,'simulation');assert.equal(value.data.content!.operational_use,false);
    assert.equal(value.data.content!.personal_response.level,level);assert.equal(value.data.content!.personal_response.number,Number(stage));assert.equal(value.data.content!.personal_response.label,label);
    assert.equal(value.data.content!.prediction.probability,null);assert.equal(value.data.content!.prediction.used_for_response_level,false);
    assert.ok(value.data.revision>revision);revision=value.data.revision;
    assert.equal(snapshotReady(value),true);assert.ok(value.data.content!.actions.length>0);
    assert.equal(value.data.content!.assistant_utterance?.source,'reviewed_policy_text');
    assert.match(String(value.data.content!.official_alerts[0]!.raw_text),/합성 시연/);
  }
  assert.deepEqual((await api.route(mock.snapshot().id)).data,{status:'unavailable',route:null,reason:'NO_VERIFIED_ROUTE_GEOMETRY'});
});

test('MVP profile writes use revisions, reject stale saves and advance policy input requirements',async()=>{
  const mock=createMvpMock(),api=createMvpApi(mock.transport);
  const before=await api.profile();assert.deepEqual(before.data.profile,{});
  const body:MvpSchema<'ProfileWrite'>={base_revision:before.data.revision,profile:{display_name:'합성 사용자',mobility:'walking_aid',health_consent:false}};
  const saved=await api.saveProfile(body,'test-profile-write');
  assert.equal(saved.data.revision,before.data.revision+1);assert.equal(saved.data.profile.mobility,'walking_aid');
  await assert.rejects(api.saveProfile(body,'test-stale-write'),error=>error instanceof ApiError && error.status===409);
  const snapshot=await api.snapshot(mock.snapshot().id);
  assert.equal(snapshotReady(snapshot,{[`profile:${snapshot.data.content!.user_id}`]:saved.data.input_revision}),true);
  assert.equal((await api.preparations()).data.profile_revision,saved.data.revision);
  const removed=await api.deleteProfile();assert.deepEqual(removed.data.profile,{});assert.ok(removed.data.revision>saved.data.revision);
});

test('MVP confirmed context updates advance the corresponding policy state input version',async()=>{
  const mock=createMvpMock(),api=createMvpApi(mock.transport);const before=await api.snapshot(mock.snapshot().id);
  const body:MvpSchema<'ContextWrite'>={base_revision:before.data.user_context.revision,observed_at:new Date().toISOString(),confirmation:'user_confirmed',state:{helper_present:true,can_move:true}};
  const saved=await api.context(before.data.id,body);
  const after=await api.snapshot(before.data.id);
  assert.equal(after.data.user_context.revision,saved.data.context_revision);assert.equal(after.data.user_context.data?.helper_present,true);
  const key=`state:${after.data.content!.incident_id}/${after.data.content!.user_id}`;
  assert.equal(snapshotReady(after,{[key]:saved.data.context_revision}),true);
  await assert.rejects(api.context(before.data.id,body),error=>error instanceof ApiError && error.status===409);
});

test('MVP changing a demo stage cannot roll back accepted context revisions',async()=>{
  const mock=createMvpMock(),api=createMvpApi(mock.transport);const before=await api.snapshot(mock.snapshot().id);
  const saved=await api.context(before.data.id,{base_revision:before.data.user_context.revision,observed_at:new Date().toISOString(),confirmation:'user_confirmed',state:{helper_present:true}});
  const key=`state:${before.data.content!.incident_id}/${before.data.content!.user_id}`;
  for (const stage of ['2','3','1'] as const) {
    mock.setStage(stage);const after=await api.snapshot(before.data.id);
    assert.ok(after.data.user_context.revision>=saved.data.context_revision);
    assert.equal(snapshotReady(after,{[key]:saved.data.context_revision}),true);
  }
});

test('MVP mock updates return the changed response once per cursor',async()=>{
  const mock=createMvpMock(),api=createMvpApi(mock.transport);
  const initial=await api.updates(undefined,undefined,0);mock.setStage('2');
  const changed=await api.updates(initial.data.next_cursor,undefined,0);
  assert.equal(changed.data.events.length,1);assert.equal(changed.data.events[0]?.resource_id,mock.snapshot().id);
  assert.equal(changed.data.events[0]?.resource_revision,mock.snapshot().revision);
  const unchanged=await api.updates(changed.data.next_cursor,undefined,0);assert.deepEqual(unchanged.data.events,[]);
});
