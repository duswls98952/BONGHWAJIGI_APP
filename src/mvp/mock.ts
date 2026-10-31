import fixtures from '../../docs/api/mvp-fixtures.json';
import interactionFixtures from '../../docs/api/mvp-interaction-fixtures.json';
import {ApiError, type RequestOptions, type VersionedTransport} from '../api/http';
import type {MvpEnvelope, MvpProfile, MvpSchema, MvpSnapshot} from '../api/mvp-types';
import {delay} from '../core/async';

// 실제 테스트 서버의 합성 응답을 재생한다. 실제 단계 판단 코드가 아니다.
export function createMvpMock() {
  let version=1, chosen:'1'|'2'|'3'='1';
  function refreshed() {
    const offset=Date.now()-Date.parse(fixtures.reference_time);
    const walk=(value:unknown,key=''):unknown=>{
      if (Array.isArray(value)) return value.map(item=>walk(item));
      if (value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,walk(v,k)]));
      if (typeof value==='string' && /^\d{4}-\d\d-\d\dT/.test(value)) return new Date(key==='generated_at'?Date.now():Date.parse(value)+offset).toISOString();
      return value;
    };
    return walk(fixtures) as unknown as typeof fixtures;
  }
  let base=refreshed();
  let profile:MvpProfile={};let profileRevision=1;
  let location=structuredClone(base.home.data.location) as MvpSchema<'LocationData'>;
  const preferences=structuredClone(base.preferences.data);
  const turns=new Map<string,MvpSchema<'TextTurnData'>>();
  const envelope=<T,>(data:T):MvpEnvelope<T>=>({meta:{schema_version:'0.2.0-mvp',mode:'simulation',request_id:`mock-${version}`,generated_at:new Date().toISOString(),data_status:'current'},data});
  function snapshot() {
    const value=structuredClone(base.snapshots[chosen].data) as unknown as MvpSnapshot;
    value.revision=version;
    if(value.content){
      const user=String(value.content.user_id);
      value.content.input_versions[`profile:${user}`]=profileRevision;
      value.content.input_versions[`location:${user}`]=location.input_revision;
      value.content.input_versions[`state:${value.content.incident_id}/${user}`]=value.user_context.revision;
      value.content.assistant_utterance && (value.content.assistant_utterance.id=`mock-utterance-${version}`);
    }
    return value;
  }
  const transport:VersionedTransport<MvpSchema<'Meta'>>=async<T,>(path:string,options:RequestOptions={})=>{
    const url=new URL(path,'https://mock.invalid');
    const method=options.method??'GET';
    const body=options.body as Record<string,unknown>|undefined;
    let data:unknown;
    if(url.pathname==='/v1/auth/config')data={registration_enabled:true,consent_version:'internal-demo-v1',kind:'private_simulation_installation',notice:'모의 서버 시연'};
    else if(url.pathname==='/v1/auth/installations'||url.pathname==='/v1/auth/refresh')data={user_id:'a',scenario_id:'mock',session_id:'mock-session',access_token:'mock-only-no-credential',refresh_token:'mock-only-no-credential',token_type:'Bearer',expires_in:900,refresh_expires_at:new Date(Date.now()+86400000).toISOString()};
    else if(url.pathname==='/v1/app-config')data=base.config.data;
    else if(url.pathname==='/v1/me/profile') {
      if(method==='PUT') {
        if(body?.base_revision!==profileRevision)throw new ApiError(409,'REVISION_CONFLICT');
        profile=structuredClone(body.profile as MvpProfile);profileRevision++;version++;
      } else if(method==='DELETE'){profile={};profileRevision++;version++;}
      data={revision:profileRevision,input_revision:profileRevision,profile};
    } else if(url.pathname==='/v1/me/preferences') {
      if(method==='PUT') {preferences.preferences=body?.preferences as typeof preferences.preferences;preferences.revision++;version++;}
      data=preferences;
    } else if(url.pathname==='/v1/me/location') {
      if(method==='PUT') {
        location={...location,revision:location.revision+1,input_revision:location.input_revision+1,status:'available',fix:body as unknown as typeof location.fix,valid_until:new Date(Date.now()+300000).toISOString(),reason_codes:[]};version++;
      } else if(method==='DELETE'){location={...location,revision:location.revision+1,input_revision:location.input_revision+1,status:'unavailable',fix:null,valid_until:null,reason_codes:['LOCATION_NOT_AVAILABLE']};version++;}
      data=location;
    } else if(url.pathname==='/v1/home') {
      data={...structuredClone(base.home.data),location,preparations:{...base.home.data.preparations,profile_revision:profileRevision}};
    } else if(url.pathname==='/v1/safety-rules/wildfire')data=base.rules.data;
    else if(url.pathname==='/v1/me/preparations')data={...base.home.data.preparations,profile_revision:profileRevision};
    else if(url.pathname==='/v1/me/updates') {
      await delay(1000,options.signal);
      const prior=Number(url.searchParams.get('cursor')??'0');
      data={events:prior<version?[{event_id:`mock-event-${version}`,type:'response.updated',resource_id:snapshot().id,resource_revision:version,occurred_at:new Date().toISOString()}]:[],next_cursor:String(version),has_more:false};
    } else if(url.pathname.endsWith('/text-turns')&&method==='POST') {
      const current=snapshot();
      if(body?.base_response_revision!==current.revision||body?.base_context_revision!==current.user_context.revision)throw new ApiError(409,'REVISION_CONFLICT');
      const key=String(body.client_turn_id),prior=turns.get(key);
      if(prior)data=prior;
      else{
        const item=structuredClone(interactionFixtures.textTurn.data) as MvpSchema<'TextTurnData'>;
        item.turn_id=key;item.response_id=current.id;item.response_revision=current.revision;item.context_revision=current.user_context.revision;item.valid_until=new Date(Date.now()+120000).toISOString();
        // Replay one captured synthetic test turn; no local language model or risk inference.
        if(String(body.text).trim()==='지금 계단 이용이 어려워요'&&item.proposal){item.proposal.base_revision=current.user_context.revision;}
        else{item.proposal=null;item.assistant={text:current.content?.assistant_utterance?.text??'현재 안내를 확인하고 있어요.',source:'reviewed_policy_fallback',action_ids:current.content?.actions.map(a=>a.action_id)??[]};}
        turns.set(key,item);if(turns.size>20)turns.delete(turns.keys().next().value!);data=item;
      }
    } else if(url.pathname.includes('/text-turns/')){
      data=turns.get(decodeURIComponent(url.pathname.split('/').at(-1)!));if(!data)throw new ApiError(404,'TURN_NOT_FOUND');
    } else if(url.pathname.endsWith('/context')) {
      const current=snapshot();
      if(body?.base_revision!==current.user_context.revision)throw new ApiError(409,'REVISION_CONFLICT');
      if(body.proposal_turn_id){const turn=turns.get(String(body.proposal_turn_id));if(!turn?.proposal||turn.response_revision!==current.revision||Date.parse(turn.valid_until)<=Date.now())throw new ApiError(409,'TURN_SUPERSEDED');}
      const record=base.snapshots[chosen].data.user_context as unknown as MvpSnapshot['user_context'];
      record.revision++;record.status='available';
      record.data={mode:'simulation',revision:record.revision,observed_at:new Date().toISOString(),expires_at:new Date(Date.now()+300000).toISOString(),...(body?.state as object)};
      version++;data={context_revision:record.revision,response_id:current.id,expires_at:new Date(Date.now()+300000).toISOString(),reevaluation:'pending'};
    } else if(url.pathname.endsWith('/receipts'))data={receipt_id:'mock-receipt',recorded_at:new Date().toISOString(),meaning:'client_reported_only'};
    else if(url.pathname.includes('/devices/'))data={installation_id:url.pathname.split('/').at(-1),revision:1,push_status:'simulation'};
    else if(url.pathname.endsWith('/route')){
      if(location.status!=='available'||!location.valid_until||Date.parse(location.valid_until)<=Date.now())data={status:'unavailable',route:null,reason:'LOCATION_NOT_AVAILABLE'};
      else{const item=structuredClone(interactionFixtures.route.data) as unknown as MvpSchema<'RouteData'>;if(item.route){item.route.valid_until=location.valid_until;item.route.input_versions=Object.fromEntries(Object.entries(snapshot().content?.input_versions??{}).filter(([key])=>key.startsWith('incident:')||key.startsWith('location:')));}data=item;}
    }
    else if(url.pathname.startsWith('/v1/me/responses/'))data=snapshot();
    else if(url.pathname.startsWith('/v1/me/alerts/'))data=base.home.data.alerts[0];
    else if(url.pathname==='/v1/me/logout')data={status:'logged_out'};
    else throw new ApiError(404,'MOCK_NOT_FOUND');
    return envelope(data as T);
  };
  return {transport,setStage:(stage:'1'|'2'|'3')=>{const prior=snapshot().user_context.revision;chosen=stage;base=refreshed();const context=base.snapshots[chosen].data.user_context;context.revision=Math.max(prior+1,context.revision);version++;},snapshot};
}
