import assert from 'node:assert/strict';
import test from 'node:test';
import fixtures from '../docs/api/mvp-fixtures.json';
import type {MvpSchema,MvpSnapshot} from '../src/api/mvp-types';
import {dialogueCurrent,proposalContext,routeDependencies,simulationRoutePoints} from '../src/mvp/interaction';

const now = Date.parse('2026-11-01T04:00:00Z');
const future = new Date(now+120000).toISOString();
function snapshot():MvpSnapshot {
  const value = structuredClone(fixtures.snapshots['1'].data) as unknown as MvpSnapshot;
  value.id='response-a';value.revision=4;value.user_context.revision=2;
  value.content!.valid_until=future;
  return value;
}
function turn():MvpSchema<'TextTurnData'> {
  return {turn_id:'spoken-turn-a',response_id:'response-a',status:'complete',response_revision:4,context_revision:2,
    valid_until:future,reason_code:null,assistant:{text:'계단 이용이 어려운 상황으로 반영할까요?',source:'qwen_grounded',action_ids:['action-a']},
    proposal:{requires_confirmation:true,base_revision:2,state:{can_move:null,observed_hazard:'unknown',deescalation_confirmed:false},
      overrides:{stairs:'difficult',mobility:'needs_time',alone_now:'unknown'},
      evidence:[{field:'stairs',value:'difficult',quote:'지금 계단을 이용하기 어려워요'}]}};
}
function route():MvpSchema<'RouteData'> {
  return {status:'simulation',reason:'SYNTHETIC_DEMO_ONLY',route:{id:'route-a',origin:'synthetic',operational_use:false,
    label:'합성 시연 경로',geometry:{type:'LineString',coordinates:[[129.35,36.4],[129.351,36.401],[129.354,36.403]]},
    start:{name:'시연 시작점',latitude:36.4,longitude:129.35},destination:{name:'시연 목적지',latitude:36.403,longitude:129.354},
    steps:[],bounds:{west:129.349,east:129.355,south:36.399,north:36.404},valid_until:future,
    input_versions:{'incident:fire':3,'location:user-a':4}}};
}
const required = {'incident:fire':3,'location:user-a':4};

test('dialogue accepts only the current response and context, never a processing or expired turn',()=>{
  assert.equal(dialogueCurrent(turn(),snapshot(),now),true);
  assert.equal(dialogueCurrent(null,snapshot(),now),false);
  assert.equal(dialogueCurrent(turn(),null,now),false);
  for (const patch of [
    {status:'processing'}, {response_id:'another-response'}, {response_revision:3}, {response_revision:5},
    {context_revision:1}, {context_revision:3}, {valid_until:new Date(now).toISOString()}, {valid_until:'invalid'},
  ]) assert.equal(dialogueCurrent({...turn(),...patch} as MvpSchema<'TextTurnData'>,snapshot(),now),false,JSON.stringify(patch));
  for (const patch of [{pending_update:true},{error_code:'REQUIRED_INPUT_EXPIRED'}]) {
    assert.equal(dialogueCurrent(turn(),{...snapshot(),...patch},now),false);
  }
});

test('dialogue and proposed state are withheld after the underlying policy expires or disappears',()=>{
  const expired = snapshot();expired.content!.valid_until = new Date(now).toISOString();
  for (const policy of [expired,{...snapshot(),content:null}]) {
    assert.equal(dialogueCurrent(turn(),policy,now),false);
    assert.equal(proposalContext(turn(),policy,now),null);
  }
});

test('state confirmation preserves the exact server proposal and binds it to its turn and base revision',()=>{
  const original = turn(),before=structuredClone(original);
  const body = proposalContext(original,snapshot(),now);
  assert.deepEqual(body,{base_revision:2,observed_at:new Date(now).toISOString(),confirmation:'user_confirmed',
    proposal_turn_id:'spoken-turn-a',state:original.proposal!.state,overrides:original.proposal!.overrides});
  assert.deepEqual(original,before);
  const newer = snapshot();newer.user_context.revision++;
  assert.equal(proposalContext(original,newer,now),null);
  const outdated=turn();outdated.proposal!.base_revision=1;
  assert.equal(proposalContext(outdated,snapshot(),now),null);
  assert.equal(proposalContext({...turn(),proposal:null},snapshot(),now),null);
  for (const flag of [false,undefined,'true']) {
    const malformed = turn();
    (malformed.proposal as unknown as {requires_confirmation:unknown}).requires_confirmation=flag;
    assert.equal(proposalContext(malformed,snapshot(),now),null);
  }
});

test('route coordinates are converted from GeoJSON longitude/latitude and require all current inputs',()=>{
  assert.deepEqual(simulationRoutePoints(route(),now,required),[
    {latitude:36.4,longitude:129.35},{latitude:36.401,longitude:129.351},{latitude:36.403,longitude:129.354},
  ]);
  assert.deepEqual(simulationRoutePoints(route(),now,{...required,'location:user-a':5}),[]);
  assert.deepEqual(simulationRoutePoints(route(),now,{...required,'incident:other':1}),[]);
  const newer = route();newer.route!.input_versions['location:user-a']=5;
  assert.equal(simulationRoutePoints(newer,now,required).length,3);
});

test('route dependencies isolate incident and location while preserving the newest policy and local revisions',()=>{
  const policy=snapshot();
  policy.content!.incident_id='fire';policy.content!.user_id='user-a';
  policy.content!.input_versions={'incident:fire':3,'location:user-a':4,'profile:user-a':7,'state:fire/user-a':9,'guidelines:default':2};
  const localRequired={'profile:user-a':7,'state:fire/user-a':9,'incident:another-fire':99,'location:another-user':99};
  const dependencies=routeDependencies(policy,localRequired,4);
  assert.deepEqual(dependencies,required);
  assert.equal(simulationRoutePoints(route(),now,dependencies!).length,3);
  const newer=routeDependencies(policy,{...localRequired,'incident:fire':5,'location:user-a':2},6);
  assert.deepEqual(newer,{'incident:fire':5,'location:user-a':6});
  assert.deepEqual(simulationRoutePoints(route(),now,newer!),[]);
  assert.deepEqual(routeDependencies(policy,{'location:user-a':2},1),required);
});

test('missing policy dependencies cannot be repaired by a higher local location revision',()=>{
  const policy=snapshot();policy.content!.incident_id='fire';policy.content!.user_id='user-a';
  policy.content!.input_versions={'incident:fire':3};
  const incomplete=routeDependencies(policy,{'location:user-a':4},4);
  assert.deepEqual(incomplete,{'incident:fire':3,'location:user-a':-1});
  assert.deepEqual(simulationRoutePoints(route(),now,incomplete!),[]);
  assert.equal(routeDependencies(null,{},4),null);
  assert.equal(routeDependencies({...policy,content:null},{},4),null);
  policy.content!.input_versions['location:user-a']=4;
  for(const invalid of [-1,NaN,Infinity,4.5]) {
    const dependencies=routeDependencies(policy,{},invalid);
    assert.equal(dependencies!['location:user-a'],-1);
    assert.deepEqual(simulationRoutePoints(route(),now,dependencies!),[]);
  }
});

test('route rejects unavailable, expired, or relabelled real-world geometry',()=>{
  assert.deepEqual(simulationRoutePoints(null,now,required),[]);
  assert.deepEqual(simulationRoutePoints({status:'unavailable',route:null,reason:'NO_ROUTE'},now,required),[]);
  for (const patch of [{origin:'observed'},{origin:undefined},{operational_use:true},{operational_use:undefined},
    {valid_until:new Date(now).toISOString()},{valid_until:'invalid'}]) {
    const data=route();Object.assign(data.route!,patch);
    assert.deepEqual(simulationRoutePoints(data,now,required),[],JSON.stringify(patch));
  }
});

test('invalid and oversized route coordinates are discarded instead of rendered',()=>{
  const invalid:unknown[] = [[],[[129,36]],Array.from({length:101},()=>[129,36]),
    [[181,36],[129,36]],[[129,91],[129,36]],[[NaN,36],[129,36]],[[129,Infinity],[129,36]],
    [['129',36],[129,36]],[[129,36,0],[129,36]],[[129],[129,36]]];
  for (const coordinates of invalid) {
    const data=route();(data.route!.geometry as unknown as {coordinates:unknown}).coordinates=coordinates;
    assert.deepEqual(simulationRoutePoints(data,now,required),[]);
  }
});

test('malformed route response structures and forged input revisions fail closed without throwing',()=>{
  const invalid:unknown[] = [null,{}, {type:'Polygon',coordinates:[[129,36],[129.1,36.1]]},
    {type:'LineString',coordinates:null},{type:'LineString',coordinates:{}},
    {type:'LineString',coordinates:[null,[129,36]]}];
  for (const geometry of invalid) {
    const data=route();(data.route as unknown as {geometry:unknown}).geometry=geometry;
    assert.deepEqual(simulationRoutePoints(data,now,required),[]);
  }
  for (const revision of ['4',4.5,Infinity,NaN,-1]) {
    const data=route();(data.route!.input_versions as unknown as Record<string,unknown>)['location:user-a']=revision;
    assert.deepEqual(simulationRoutePoints(data,now,required),[]);
  }
  const missing=route();(missing.route as unknown as {input_versions:unknown}).input_versions=null;
  assert.deepEqual(simulationRoutePoints(missing,now,required),[]);
});
