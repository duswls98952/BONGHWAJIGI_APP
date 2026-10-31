import type {MvpSchema,MvpSnapshot} from '../api/mvp-types';
import {freshUntil} from './core';
import {validCoordinate,type MapPoint} from './mapGeometry';

export function dialogueCurrent(turn:MvpSchema<'TextTurnData'>|null|undefined,snapshot:MvpSnapshot|null|undefined,now:number){
  return !!(turn&&snapshot?.content&&turn.status==='complete'&&turn.response_id===snapshot.id&&turn.response_revision===snapshot.revision&&turn.context_revision===snapshot.user_context.revision&&freshUntil(turn.valid_until,now)&&freshUntil(snapshot.content.valid_until,now)&&snapshot.content.personal_response.level!=='unknown'&&!['pending_update','needs_refresh','outside_scope'].includes(snapshot.content.state)&&!snapshot.pending_update&&!snapshot.error_code);
}
export function proposalContext(turn:MvpSchema<'TextTurnData'>|null|undefined,snapshot:MvpSnapshot|null|undefined,now:number):MvpSchema<'ContextWrite'>|null{
  if(!dialogueCurrent(turn,snapshot,now)||!turn?.proposal||turn.proposal.requires_confirmation!==true||turn.proposal.base_revision!==snapshot?.user_context.revision)return null;
  return {base_revision:turn.proposal.base_revision,observed_at:new Date(now).toISOString(),confirmation:'user_confirmed',proposal_turn_id:turn.turn_id,state:turn.proposal.state,overrides:turn.proposal.overrides};
}
/** The synthetic route contract depends only on its incident and shared location.
 * Policy readiness still checks profile and state separately in the screen. */
export function routeDependencies(snapshot:MvpSnapshot|null|undefined,required:Record<string,number>,locationRevision:number):Record<string,number>|null{
  const content=snapshot?.content;
  if(!content?.incident_id||!content.user_id)return null;
  const incidentKey=`incident:${content.incident_id}`,locationKey=`location:${content.user_id}`;
  const minimum=(key:string,local:number)=>{
    const policy=content.input_versions[key],pending=required[key]??0;
    if(![policy,pending,local].every(value=>Number.isInteger(value)&&value!>=0))return -1;
    return Math.max(policy!,pending,local);
  };
  return {[incidentKey]:minimum(incidentKey,0),[locationKey]:minimum(locationKey,locationRevision)};
}
export function simulationRoutePoints(value:MvpSchema<'RouteData'>|null|undefined,now:number,inputVersions:Record<string,number>):MapPoint[]{
  const route=value?.route;
  if(value?.status!=='simulation'||!route||route.origin!=='synthetic'||route.operational_use!==false||!freshUntil(route.valid_until,now)||route.geometry?.type!=='LineString'||!route.input_versions||typeof route.input_versions!=='object'||Array.isArray(route.input_versions))return [];
  if(!Object.entries(inputVersions).every(([key,revision])=>Number.isInteger(revision)&&revision>=0&&Number.isInteger(route.input_versions[key])&&route.input_versions[key]!>=revision))return [];
  const coordinates=route.geometry.coordinates;
  if(!Array.isArray(coordinates)||coordinates.length<2||coordinates.length>100||!coordinates.every(point=>Array.isArray(point)&&point.length===2&&validCoordinate(point[1]!,point[0]!)))return [];
  return coordinates.map(([longitude,latitude])=>({latitude:latitude!,longitude:longitude!}));
}

export function proposalLabel(evidence:MvpSchema<'ProposalEvidence'>):string{
  const labels:Record<string,Record<string,string>>={
    'state.helper_present':{true:'도와줄 사람이 함께 있음',false:'현재 조력자 없음'},
    'state.child_present':{true:'아이 동반',false:'아이와 함께 있지 않음'},
    'state.alone_now':{yes:'혼자 있음',no:'동행인 있음',unknown:'동행 여부 확인 필요'},
    'state.can_move':{true:'스스로 이동 가능',false:'스스로 이동하기 어려움'},
    'state.injured':{true:'다친 곳이 있음',false:'다친 곳이 없음'},
    'state.observed_hazard':{unknown:'주변 상황 확인 필요',none:'연기·불꽃 보이지 않음',smoke:'연기가 보임',flames:'불꽃이 보임',fear:'두려움이 큼',trapped:'빠져나가기 어려움'},
    'state.location_type':{unknown:'장소 확인 필요',house:'건물 안',outside:'실외',vehicle:'차량 안'},
    'state.evacuation_status':{unknown:'대피 진행 확인 필요',not_started:'대피 전',moving:'대피 중',arrived:'안내 장소에 도착'},
    'overrides.mobility':{independent:'독립 보행',walking_aid:'보조기구 사용',wheelchair:'휠체어 사용',assistance_required:'이동 도움 필요',needs_time:'이동에 시간 필요',requires_help:'이동 도움 필요',unknown:'이동 능력 확인 필요'},
    'overrides.stairs':{able:'계단 이용 가능',difficult:'계단 이용 어려움',unable:'계단 이용 불가능',unknown:'계단 이용 확인 필요'},
    'overrides.alone_now':{yes:'혼자 있음',no:'함께 있는 사람이 있음',unknown:'동행 여부 확인 필요'},
  };
  return labels[evidence.field]?.[String(evidence.value)]??evidence.quote;
}
