import type {MvpSchema} from '../api/mvp-types';
import {freshUntil} from './core';

export function currentConfirmedState(context:MvpSchema<'UserContextData'>|null|undefined,now:number){
  return context?.status==='available'&&context.data&&freshUntil(context.data.expires_at,now)?context.data:null;
}
/** Profile facts and unconfirmed language-model proposals are deliberately absent. */
export function confirmedStateLabels(context:MvpSchema<'UserContextData'>|null|undefined,now:number):string[]{
  const state=currentConfirmedState(context,now);
  if(!state)return [];
  return [
    state.child_present===true?'아이 동반':null,
    state.alone_now==='yes'?'혼자 있음':state.alone_now==='no'?'동행인 있음':null,
    state.mobility_override==='needs_time'?'이동에 시간 필요':state.mobility_override==='requires_help'?'이동 도움 필요':null,
    state.helper_present===true?'조력자 함께 있음':null,
    state.can_move===false?'스스로 이동 어려움':state.can_move===true?'이동 가능':null,
    state.observed_hazard==='smoke'?'연기 보임':state.observed_hazard==='flames'?'불꽃 보임':state.observed_hazard==='trapped'?'빠져나가기 어려움':null,
    state.evacuation_status==='moving'?'대피 중':state.evacuation_status==='arrived'?'도착 확인':null,
  ].filter((label):label is string=>!!label);
}
