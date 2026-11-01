import React from 'react';
import {Text, View} from 'react-native';
import type {MvpProfile} from '../api/mvp-types';
import {Body, Card, Chip, Field, Group, s} from './ui';

export const emptyProfile=():MvpProfile=>({display_name:'',age_band:'unknown',mobility:'unknown',stairs:'unknown',communication_preference:'text',sensory_supports:[],dependents:[],health_consent:false,health_notes:'',emergency_contact:'',usual_place:'',building_floor:'',helper_registered:null,vehicle_access:null});
export function ProfileForm({value,onChange}:{value:MvpProfile;onChange:(value:MvpProfile)=>void}) {
  const update=(key:keyof MvpProfile,next:unknown)=>onChange({...value,[key]:next});
  const toggle=(key:'sensory_supports'|'dependents',item:string)=>{const current=value[key]??[];update(key,current.includes(item as never)?current.filter(entry=>entry!==item):[...current,item]);};
  const choices=(key:keyof MvpProfile,items:readonly(readonly[string,string])[])=>items.map(([label,item])=><Chip key={item} label={label} selected={value[key]===item} onPress={()=>update(key,item)}/>);
  return <>
    <Card title="기본 정보">
      <Field label="이름 또는 호칭" value={value.display_name??''} onChangeText={text=>update('display_name',text)} placeholder="이름 또는 호칭 입력" maxLength={40}/>
      <Group label="연령대">{choices('age_band',[['19세 이하','under_20'],['20–39세','20_39'],['40–59세','40_59'],['60세 이상','60_plus']])}</Group>
    </Card>
    <Card title="이동과 의사소통">
      <Group label="이동 능력">{choices('mobility',[['독립 보행','independent'],['보조기구 사용','walking_aid'],['휠체어','wheelchair'],['도움 필요','assistance_required']])}</Group>
      <Group label="계단 이용 가능 여부">{choices('stairs',[['가능','able'],['어려움','difficult'],['불가능','unable']])}</Group>
      <Group label="선호 안내">{choices('communication_preference',[['음성','voice'],['문자','text'],['모두','both']])}</Group>
      <Group label="시각 지원 필요 여부"><Chip label="필요 없음" selected={!value.sensory_supports?.includes('vision')} onPress={()=>update('sensory_supports',(value.sensory_supports??[]).filter(item=>item!=='vision'))}/><Chip label="필요함" selected={value.sensory_supports?.includes('vision')??false} onPress={()=>toggle('sensory_supports','vision')}/></Group>
      <Group label="청각 지원 필요 여부"><Chip label="필요 없음" selected={!value.sensory_supports?.includes('hearing')} onPress={()=>update('sensory_supports',(value.sensory_supports??[]).filter(item=>item!=='hearing'))}/><Chip label="필요함" selected={value.sensory_supports?.includes('hearing')??false} onPress={()=>toggle('sensory_supports','hearing')}/></Group>
      <Group label="함께 대피할 보호 대상"><Chip label="없음" selected={!value.dependents?.length} onPress={()=>update('dependents',[])}/>{([['어린이','child'],['고령자','care_recipient'],['반려동물','pet'],['기타','other']] as const).map(([label,item])=><Chip key={item} label={label} selected={value.dependents?.includes(item)??false} onPress={()=>toggle('dependents',item)}/>)}</Group>
      <Group label="미리 연락할 조력자"><Chip label="있음" selected={value.helper_registered===true} onPress={()=>update('helper_registered',true)}/><Chip label="없음" selected={value.helper_registered===false} onPress={()=>update('helper_registered',false)}/></Group>
    </Card>
    <Card title="건강 및 의료 특이사항(선택)">
      <Chip label="건강·의료 정보 처리에 동의" selected={value.health_consent??false} onPress={()=>onChange({...value,health_consent:!value.health_consent,health_notes:value.health_consent?'':value.health_notes??''})}/>
      <Field label="건강 및 의료 특이사항" value={value.health_notes??''} onChangeText={text=>update('health_notes',text)} disabled={!value.health_consent} placeholder="동의 후 선택 입력" multiline maxLength={500}/>
      <Field label="긴급 연락처" value={value.emergency_contact??''} onChangeText={text=>update('emergency_contact',text)} placeholder="이름·연락 방법" maxLength={120}/>
      <Field label="주요 생활 장소" value={value.usual_place??''} onChangeText={text=>update('usual_place',text)} placeholder="자주 머무는 장소" maxLength={200}/>
      <Field label="건물 층수" value={value.building_floor??''} onChangeText={text=>update('building_floor',text)} placeholder="예: 지상 2층" maxLength={40}/>
    </Card>
  </>;
}
