import type {MvpHome,MvpSchema} from '../api/mvp-types';
import {freshUntil} from './core';
import {currentMapLocation} from './mapGeometry';

export function currentTodayGuidance(home:MvpHome|null|undefined,now:number,requiredLocation=0){
  const guidance=home?.today_guidance,location=home?.location;
  if(!guidance||!location||!currentMapLocation(location,now,requiredLocation)||guidance.status!=='available'||!freshUntil(guidance.valid_until,now)||guidance.location_input_revision!==location.input_revision||guidance.location_input_revision<requiredLocation||!Array.isArray(guidance.items)||!guidance.items.every(item=>freshUntil(item.valid_until,now)))return [];
  return guidance.items;
}

export function currentPreparations(preparations:MvpSchema<'PreparationsData'>|null|undefined,profileRevision:number,now:number,location?:MvpSchema<'LocationData'>,requiredLocation=0){
  if(preparations?.status!=='available'||preparations.profile_revision<profileRevision||!Array.isArray(preparations.items)||preparations.items.length!==2||!preparations.items.every(item=>freshUntil(item.valid_until,now)))return [];
  if(preparations.items.some(item=>item.reason_code==='LOCAL_FOREST_PREPARATION')&&(!location||!currentMapLocation(location,now,requiredLocation)||preparations.location_input_revision!==location.input_revision))return [];
  const common=preparations.items.find(item=>item.kind==='common'),personal=preparations.items.find(item=>item.kind==='personal');
  return common&&personal?[common,personal]:[];
}

export function guidanceReferenceDate(items:MvpHome['today_guidance']['items']){
  const dates=[...new Set(items.map(item=>item.original_observed_at??[...(item.evidence??[]),item.source].map(source=>source.published_at).filter(date=>Number.isFinite(Date.parse(date))).sort((a,b)=>Date.parse(a)-Date.parse(b))[0]??'').filter(date=>Number.isFinite(Date.parse(date))).map(date=>new Date(date).toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'}).replaceAll('-','.')))];
  return dates.length?`자료 기준 ${dates.join(' · ')}`:null;
}
