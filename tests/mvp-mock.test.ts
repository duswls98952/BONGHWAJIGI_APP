import assert from 'node:assert/strict';
import test from 'node:test';
import fixtures from '../docs/api/mvp-fixtures.json';
import {createMvpApi} from '../src/api/client';
import {ApiError} from '../src/api/http';
import type {MvpSchema} from '../src/api/mvp-types';
import {proposalContext} from '../src/mvp/interaction';
import {confirmedStateLabels} from '../src/mvp/currentState';
import {currentTodayGuidance,currentPreparations,guidanceReferenceDate} from '../src/mvp/homeContent';
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
    assert.equal(value.data.content!.official_alerts[0]!.raw_text,fixtures.home.data.alerts[0]!.original_text);
  }
  const route=(await api.route(mock.snapshot().id)).data;
  assert.equal(route.status,'simulation');assert.equal(route.route?.operational_use,false);assert.equal(route.route?.origin,'synthetic');
  assert.ok(route.route!.geometry.coordinates.length>=2);
  assert.deepEqual(Object.keys(route.route!.input_versions).sort(),['incident:fire','location:a']);
  await api.deleteLocation();
  assert.deepEqual((await api.route(mock.snapshot().id)).data,{status:'unavailable',route:null,reason:'LOCATION_NOT_AVAILABLE'});
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


test('captured A/B episodes keep distinct preparations, server questions, routes and confirmed-only current state',async()=>{
  for(const role of ['A','B'] as const){
    const mock=createMvpMock(),api=createMvpApi(mock.transport);
    const profile=(await api.profile()).data;
    await api.saveProfile({base_revision:profile.revision,profile:role==='A'?{dependents:['child'],mobility:'independent'}:{dependents:[],mobility:'walking_aid'}},`profile-${role}`);
    const home=(await api.home()).data,now=Date.now();
    assert.equal(currentTodayGuidance(home,now).length,1);
    assert.equal(guidanceReferenceDate(currentTodayGuidance(home,now)),'자료 기준 2025.03.26');
    const preparations=currentPreparations(home.preparations,profile.revision+1,now,home.location);
    assert.deepEqual(preparations.map(item=>item.kind),['common','personal']);
    assert.equal(preparations[1]!.title,role==='A'?'어린이 비상용품 준비':'이동 보조기구 점검');
    const before=(await api.snapshot(mock.snapshot().id)).data;
    assert.equal(before.content!.personal_response.level,role==='A'?'request_assistance':'act');
    assert.equal(before.content!.assistant_utterance?.text,role==='A'?'지금 아이와 함께 계신가요?':'보조기구를 사용해 혼자 이동할 수 있나요?');
    assert.deepEqual(confirmedStateLabels(before.user_context,now),[]);
    const route=(await api.route(before.id)).data;
    assert.equal(route.status,role==='A'?'unavailable':'simulation');
    if(role==='A'){assert.equal(route.reason,'ROUTE_BLOCKED');assert.equal(route.route,null);}
    else assert.equal(route.route?.operational_use,false);
    const answer=role==='A'?'지금 아이랑 있습니다.':'혼자라 이동할 수 있어요.';
    const turn=(await api.textTurn(before.id,{client_turn_id:`turn-${role}`,text:answer,base_response_revision:before.revision,base_context_revision:before.user_context.revision})).data;
    assert.ok(turn.proposal);
    assert.deepEqual(confirmedStateLabels((await api.snapshot(before.id)).data.user_context,now),[]);
    const confirmation=proposalContext(turn,before,now);assert.ok(confirmation);
    await api.context(before.id,confirmation);
    const after=(await api.snapshot(before.id)).data;
    assert.deepEqual(confirmedStateLabels(after.user_context,now),role==='A'?['아이 동반']:['혼자 있음','이동 가능']);
    assert.ok(after.content!.actions.some(action=>action.text.includes(role==='A'?'아이':'보조기구')));
    assert.equal(after.content!.prediction.probability,null);
  }
});

test('selecting a captured profile after a long onboarding restarts its expiry clock without changing source dates',async()=>{
  const actualNow=Date.now,start=Date.now(),mock=createMvpMock(),api=createMvpApi(mock.transport);
  try{
    Date.now=()=>start+10*60*1000;
    const profile=(await api.profile()).data;
    await api.saveProfile({base_revision:profile.revision,profile:{dependents:['child']}},'delayed-onboarding');
    const home=(await api.home()).data;
    assert.ok(Date.parse(home.location.valid_until!)>Date.now());
    assert.equal(currentTodayGuidance(home,Date.now()).length,1);
    assert.equal(guidanceReferenceDate(home.today_guidance.items),'자료 기준 2025.03.26');
  }finally{Date.now=actualNow;}
});

test('switching the same development account from confirmed A to B clears tags without rolling context revisions back',async()=>{
  const mock=createMvpMock(),api=createMvpApi(mock.transport);
  let previousContext=0;
  for(const role of ['A','B'] as const){
    const profile=(await api.profile()).data;
    await api.saveProfile({base_revision:profile.revision,profile:role==='A'?{dependents:['child']}:{dependents:[],mobility:'walking_aid'}},`switch-${role}`);
    const before=await api.snapshot(mock.snapshot().id),now=Date.now();
    assert.ok(before.data.user_context.revision>previousContext);
    assert.equal(snapshotReady(before,{[`state:${before.data.content!.incident_id}/${before.data.content!.user_id}`]:previousContext}),true);
    assert.deepEqual(confirmedStateLabels(before.data.user_context,now),[]);
    const text=role==='A'?'지금 아이랑 있습니다.':'혼자라 이동할 수 있어요.';
    const turn=(await api.textTurn(before.data.id,{client_turn_id:`switch-turn-${role}`,text,base_response_revision:before.data.revision,base_context_revision:before.data.user_context.revision})).data;
    const body=proposalContext(turn,before.data,now);assert.ok(body);
    const accepted=await api.context(before.data.id,body);
    previousContext=accepted.data.context_revision;
    const after=(await api.snapshot(before.data.id)).data;
    assert.deepEqual(confirmedStateLabels(after.user_context,now),role==='A'?['아이 동반']:['혼자 있음','이동 가능']);
  }
});
