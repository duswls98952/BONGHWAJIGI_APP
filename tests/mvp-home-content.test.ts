import assert from 'node:assert/strict';
import test from 'node:test';
import fixtures from '../docs/api/mvp-fixtures.json';
import type {MvpHome,MvpSchema} from '../src/api/mvp-types';
import {currentPreparations,currentTodayGuidance,guidanceReferenceDate} from '../src/mvp/homeContent';
import {confirmedStateLabels} from '../src/mvp/currentState';
import {proposalLabel} from '../src/mvp/interaction';

const now=Date.parse('2026-11-01T04:00:00Z'),future=new Date(now+60000).toISOString();
const source:MvpSchema<'Source'>={title:'공식 지역 자료',url:'https://example.invalid/source',published_at:'2025-03-26T00:00:00Z',collected_at:future,verified:true};
function home():MvpHome{
  const value=structuredClone(fixtures.home.data) as unknown as MvpHome;
  value.location={...value.location,status:'available',valid_until:future,input_revision:4};
  value.today_guidance={status:'available',location_input_revision:4,generated_at:new Date(now).toISOString(),valid_until:future,reason_codes:[],items:[{id:'regional',title:'건조한 산림 주변 주의',text:'지역 근거가 제공한 문장',source,revision:2,valid_until:future,evidence:[source],origin:'synthetic',original_observed_at:null}]};
  value.preparations={status:'available',profile_revision:3,location_input_revision:4,policy_version:'test',generated_at:new Date(now).toISOString(),items:[
    {id:'personal',kind:'personal',title:'어린이 비상용품 준비',text:'아이에게 필요한 물·간식·여벌 옷을 비상가방에 챙기세요.',source,revision:2,valid_until:future,reason_code:'CHILD_PREPARATION'},
    {id:'common',kind:'common',title:'비상가방 준비',text:'공통 준비 항목',source,revision:2,valid_until:future,reason_code:'COMMON_PREPARATION'},
  ]};
  return value;
}
test('today guidance comes only from current regional evidence, never personal actions or basic rules',()=>{
  const value=home();
  assert.deepEqual(currentTodayGuidance(value,now).map(item=>item.id),['regional']);
  value.today_guidance.status='unavailable';value.today_guidance.items=[];
  assert.ok(value.basic_rules.items.length);
  assert.deepEqual(currentTodayGuidance(value,now),[]);
});
test('new location input, stale location and expired regional evidence withhold the old home guidance',()=>{
  for(const mutate of [
    (value:MvpHome)=>{value.location.input_revision=5;},
    (value:MvpHome)=>{value.location.status='unavailable';},
    (value:MvpHome)=>{value.location.valid_until=new Date(now).toISOString();},
    (value:MvpHome)=>{value.today_guidance.valid_until=new Date(now).toISOString();},
    (value:MvpHome)=>{value.today_guidance.items[0]!.valid_until=new Date(now).toISOString();},
  ]){const value=home();mutate(value);assert.deepEqual(currentTodayGuidance(value,now),[]);}
  assert.deepEqual(currentTodayGuidance(home(),now,5),[]);
});
test('preparations are exactly common above personal, profile current and independently valid without location',()=>{
  const value=home();
  assert.deepEqual(currentPreparations(value.preparations,3,now).map(item=>item.kind),['common','personal']);
  assert.deepEqual(currentPreparations(value.preparations,4,now),[]);
  value.preparations.items[0]!.kind='common';
  assert.deepEqual(currentPreparations(value.preparations,3,now),[]);
  const expired=home();expired.preparations.items[0]!.valid_until=new Date(now).toISOString();
  assert.deepEqual(currentPreparations(expired.preparations,3,now),[]);
});
test('only location-derived personal preparations require the same live location revision',()=>{
  const value=home();value.preparations.items[0]!.reason_code='LOCAL_FOREST_PREPARATION';
  assert.deepEqual(currentPreparations(value.preparations,3,now),[]);
  assert.equal(currentPreparations(value.preparations,3,now,value.location).length,2);
  value.location.input_revision++;
  assert.deepEqual(currentPreparations(value.preparations,3,now,value.location),[]);
});
test('source date disclosure keeps historical dates even in a mixed synthetic scenario',()=>{
  const items=home().today_guidance.items;
  assert.equal(guidanceReferenceDate(items),'자료 기준 2025.03.26');
  items[0]!.original_observed_at='2025-03-25T00:00:00Z';
  assert.equal(guidanceReferenceDate(items),'자료 기준 2025.03.25');
  assert.equal(guidanceReferenceDate([]),null);
});
test('current tags require unexpired confirmed state; helper absence does not imply being alone',()=>{
  const context:MvpSchema<'UserContextData'>={revision:2,status:'available',data:{mode:'simulation',revision:2,observed_at:new Date(now).toISOString(),expires_at:future,helper_present:false,child_present:null,alone_now:'unknown',can_move:null}};
  assert.deepEqual(confirmedStateLabels(context,now),[]);
  context.data!.child_present=true;
  assert.deepEqual(confirmedStateLabels(context,now),['아이 동반']);
  context.data!.child_present=null;context.data!.alone_now='yes';context.data!.can_move=true;
  assert.deepEqual(confirmedStateLabels(context,now),['혼자 있음','이동 가능']);
  assert.deepEqual(confirmedStateLabels({...context,status:'stale'},now),[]);
  context.data!.expires_at=new Date(now).toISOString();
  assert.deepEqual(confirmedStateLabels(context,now),[]);
  assert.equal(proposalLabel({field:'state.helper_present',value:false,quote:'없어요'}),'현재 조력자 없음');
});
