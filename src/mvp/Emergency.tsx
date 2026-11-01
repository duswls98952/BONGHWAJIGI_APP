import {useCallback,useEffect,useRef,useState} from 'react';
import {Pressable,Text,View} from 'react-native';
import {useFocusEffect,useLocalSearchParams} from 'expo-router';
import type {MvpSchema} from '../api/mvp-types';
import {useMvp} from './Runtime';
import {mvpApi} from './api';
import {freshUntil,snapshotReady,stageColors,userMessage} from './core';
import {Body,Button,Card,Chip,Group,Icon,Page,s} from './ui';
import {RequireSession} from './Onboarding';
import {EmergencyActions} from './Support';
import MvpMap from './Map';
import {currentMapLocation,validBounds} from './mapGeometry';
import Conversation from './Conversation';
import {installationId} from '../platform/storage';
import {currentConfirmedState,confirmedStateLabels} from './currentState';

type State=MvpSchema<'StatePatch'>;
const emptyState=():State=>({child_present:null,alone_now:'unknown',helper_present:null,can_move:null,injured:null,observed_hazard:'unknown',location_type:'unknown',evacuation_status:'unknown',deescalation_confirmed:false});
function EmergencyBody(){
  const runtime=useMvp();
  const params=useLocalSearchParams<{responseId?:string;alertId?:string;incidentId?:string}>();
  const requestedAlert=typeof params.alertId==='string'?params.alertId:'';
  const [official,setOfficial]=useState<MvpSchema<'AlertData'>|null>(null);
  const listed=runtime.home?.data.alerts.find(item=>item.id===requestedAlert);
  const incident=runtime.home?.data.nearby_disasters.find(item=>params.incidentId?item.id===params.incidentId:params.responseId?item.response_id===params.responseId:true);
  const candidateAlert=listed??(official?.id===requestedAlert?official:undefined)??(!requestedAlert?runtime.home?.data.alerts.find(item=>incident?item.incident_id===incident.id:!params.incidentId&&!params.responseId):undefined);
  const alert=candidateAlert&&(!params.responseId||candidateAlert.response_id===params.responseId)&&(!params.incidentId||candidateAlert.incident_id===params.incidentId)?candidateAlert:undefined;
  const responseId=typeof params.responseId==='string'?params.responseId:alert?.response_id??incident?.response_id??'';
  const value=runtime.snapshots[responseId],data=value?.data,content=data?.content;
  const usable=runtime.status==='connected'&&snapshotReady(value,runtime.required,runtime.now);
  const level=usable?content?.personal_response.level??'unknown':'unknown';
  const color=stageColors[level];
  const label=usable?content?.personal_response.label??'확인 중':'안내 확인 중';
  const [focused,setFocused]=useState(false);
  useFocusEffect(useCallback(()=>{setFocused(true);return()=>setFocused(false);},[]));
  const [state,setState]=useState<State>(emptyState),[stairs,setStairs]=useState<'difficult'|null>(null);
  const [base,setBase]=useState(0),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const [editing,setEditing]=useState(false),[showOfficial,setShowOfficial]=useState(false);
  const receipts=useRef(new Set<string>());
  useEffect(()=>{
    if(!requestedAlert||listed){setOfficial(null);return;}
    let alive=true;void mvpApi.alert(requestedAlert).then(result=>{if(alive)setOfficial(result.data);}).catch(error=>{if(alive)setMessage(userMessage(error));});return()=>{alive=false;};
  },[requestedAlert,listed?.revision]);
  useEffect(()=>{if(responseId)void runtime.loadSnapshot(responseId).catch(error=>setMessage(userMessage(error)));},[responseId,runtime.loadSnapshot]);
  useEffect(()=>{
    if(!data||dirty)return;
    const old=currentConfirmedState(data.user_context,runtime.now);
    setState({...emptyState(),...(old?{child_present:old.child_present,alone_now:old.alone_now,helper_present:old.helper_present,can_move:old.can_move,injured:old.injured,observed_hazard:old.observed_hazard,location_type:old.location_type,evacuation_status:old.evacuation_status,deescalation_confirmed:false}:{})});
    setBase(data.user_context.revision);setStairs(null);
  },[data?.user_context.revision,responseId,dirty]);
  useEffect(()=>{
    if(!alert||!focused||!runtime.foreground)return;
    const key=`${alert.id}:${alert.revision}`;
    if(receipts.current.has(key))return;
    receipts.current.add(key);
    void(async()=>{const installation=await installationId();for(const event of ['displayed','opened'] as const)await mvpApi.receipt(alert.id,{alert_revision:alert.revision,installation_id:installation,event,occurred_at:new Date().toISOString()},`${key}:${event}`);})().catch(()=>{receipts.current.delete(key);});
  },[alert?.id,alert?.revision,focused,runtime.foreground]);
  function update(patch:Partial<State>){setState(old=>({...old,...patch}));setDirty(true);}
  async function save(){
    if(!data)return;setBusy(true);setMessage('');
    try{await runtime.saveContext(responseId,{base_revision:base,observed_at:new Date().toISOString(),confirmation:'user_confirmed',overrides:{mobility:data.user_context.status==='available'?data.user_context.data?.mobility_override??null:null,stairs,alone_now:state.alone_now??'unknown'},state});setDirty(false);setEditing(false);setMessage('현재 상태를 저장했어요.');}
    catch(problem){setMessage(userMessage(problem));}finally{setBusy(false);}
  }
  const locationState=runtime.home?.data.location;
  const location=currentMapLocation(locationState,runtime.now,runtime.required[`location:${runtime.session?.tokens.user_id}`]??0);
  const bounds=content&&typeof content.incident.expires_at==='string'&&freshUntil(content.incident.expires_at,runtime.now)?validBounds(content.incident.area):null;
  const summary=[...confirmedStateLabels(data?.user_context,runtime.now),location?'위치 확인됨':'위치 확인 필요'];
  return <Page footer={<EmergencyActions responseId={responseId} alertId={alert?.id}/>}>
    <View accessibilityLiveRegion="polite" style={{marginHorizontal:-16,marginTop:-6,paddingHorizontal:16,paddingVertical:22,backgroundColor:color.background,alignItems:'center'}}><View style={s.row}><Icon name="warning" color={color.ink} size={26}/><Text style={{fontSize:24,fontWeight:'800',color:color.ink}}>{level==='information'?label:`${label} 산불 ${usable?'발생':''}`.trim()}</Text></View>{usable&&content?.personal_response.number&&<Text style={{fontSize:14,color:color.ink,marginTop:8}}>나의 대응 {content.personal_response.number}단계</Text>}</View>
    <View style={s.section}><Text style={s.heading}>재난 영향 지역</Text><MvpMap location={location} bounds={bounds} height={176} simulation={runtime.home?.meta.mode==='simulation'}/></View>
    <Conversation responseId={responseId} active={usable&&focused&&runtime.foreground}/>
    <View style={s.section}><View style={[s.row,{justifyContent:'space-between'}]}><Text style={s.heading}>내 현재 상태</Text><Pressable accessibilityRole="button" accessibilityLabel="현재 상태 수정" onPress={()=>setEditing(!editing)} style={{minHeight:48,paddingHorizontal:8,justifyContent:'center'}}><Text style={{fontSize:13,color:'#245c74',fontWeight:'700'}}>{editing?'닫기':'수정'}</Text></Pressable></View>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{summary.map(text=><Text key={text} style={{fontSize:12,lineHeight:17,borderWidth:1,borderColor:'#20262d',borderRadius:6,paddingHorizontal:8,paddingVertical:7,backgroundColor:'#f3f5f7'}}>{text}</Text>)}</View>
      {editing&&<Card>
      <Group label="이동과 도움"><Chip label="지금 계단 이용이 어려워요" selected={stairs==='difficult'} onPress={()=>{setStairs(stairs==='difficult'?null:'difficult');setDirty(true);}}/><Chip label="혼자 있어요" selected={state.alone_now==='yes'} onPress={()=>update(state.alone_now==='yes'?{alone_now:'unknown'}:{alone_now:'yes',helper_present:false})}/><Chip label="도와줄 사람이 왔어요" selected={state.helper_present===true} onPress={()=>update(state.helper_present===true?{helper_present:null}:{helper_present:true,alone_now:'no'})}/><Chip label="스스로 이동하기 어려워요" selected={state.can_move===false} onPress={()=>update({can_move:state.can_move===false?null:false})}/><Chip label="스스로 이동할 수 있어요" selected={state.can_move===true} onPress={()=>update({can_move:state.can_move===true?null:true})}/></Group>
      <Group label="아이 동반 여부"><Chip label="지금 아이와 함께 있어요" selected={state.child_present===true} onPress={()=>update({child_present:state.child_present===true?null:true})}/><Chip label="지금 아이와 함께 있지 않아요" selected={state.child_present===false} onPress={()=>update({child_present:state.child_present===false?null:false})}/></Group>
      <Group label="직접 확인한 주변 상황">{([['확인 전','unknown'],['연기·불꽃 보이지 않음','none'],['연기가 보여요','smoke'],['불꽃이 보여요','flames'],['두려움이 커요','fear'],['빠져나가기 어려워요','trapped']] as const).map(([text,hazard])=><Chip key={hazard} label={text} selected={state.observed_hazard===hazard} onPress={()=>update({observed_hazard:hazard})}/>)}</Group>
      <Group label="대피 진행"><Chip label="대피 중이에요" selected={state.evacuation_status==='moving'} onPress={()=>update({evacuation_status:'moving'})}/><Chip label="안내된 장소에 도착했어요" selected={state.evacuation_status==='arrived'} onPress={()=>update({evacuation_status:'arrived'})}/></Group>
      <Group label="상황 재확인"><Chip label="지금 주변 상황과 이동 가능 여부를 다시 확인했어요" selected={state.deescalation_confirmed??false} onPress={()=>update({deescalation_confirmed:!state.deescalation_confirmed})}/></Group>
      <Button title={busy?'상태 저장 중…':'확인한 상태 저장'} disabled={busy||!data||!dirty} onPress={()=>void save()}/>
      {dirty&&data&&data.user_context.revision!==base&&<Button secondary title="최신 상태 다시 불러오기" onPress={()=>{setDirty(false);void runtime.loadSnapshot(responseId).catch(()=>undefined);}}/ >}
    </Card>}</View>
    <View style={s.section}><Text style={s.heading}>맞춤 행동요령</Text><View style={{borderRadius:16,borderWidth:1,borderColor:'#e0e4e8',padding:16}}>{usable?content?.actions.map(item=><View style={s.step} key={item.action_id}><Text style={s.stepNumber}>{item.priority}</Text><View style={{flex:1}}><Body>{item.text}</Body></View></View>):<Body>새 정보가 반영된 안내를 확인하고 있어요.</Body>}{usable&&!content?.actions.length&&<Body>현재 추가로 제공되는 개인 행동요령이 없어요.</Body>}</View></View>
    {!!(message||runtime.error)&&<View accessibilityLiveRegion="polite" style={s.notice}><Body>{message||runtime.error}</Body></View>}
    <View style={{gap:10}}><Pressable accessibilityRole="button" accessibilityState={{expanded:showOfficial}} onPress={()=>setShowOfficial(!showOfficial)} style={{minHeight:48,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={{fontSize:14,fontWeight:'700'}}>공식 경보 원문{alert?.official_severity?` · ${alert.official_severity}`:''}</Text><Text>{showOfficial?'⌃':'⌄'}</Text></Pressable>{showOfficial&&<View style={{gap:10}}>{alert&&<Card title={alert.status==='archived'?'보관된 공식 경보':alert.status==='cancelled'?'공식 경보 해제':alert.status==='active'?'공식 경보 원문':'공식 경보 유효성 확인'}><Body>{alert.original_text}</Body><Body small muted>{alert.authority} · 기관 등급 {alert.official_severity}</Body><Body small muted>발령 {new Date(alert.issued_at).toLocaleString('ko-KR')}</Body>{alert.status==='cancelled'&&<Body small>개인 안내는 아래 최신 내용으로 확인해 주세요.</Body>}</Card>}
    {!alert&&<Card><Body>이 사건에 연결된 공식 경보를 확인하고 있어요.</Body></Card>}
</View>}</View>
    <Button secondary title="최신 안내 다시 확인" onPress={()=>void runtime.refresh().catch(problem=>setMessage(userMessage(problem)))}/>
  </Page>;
}
export default function Emergency(){const params=useLocalSearchParams<{responseId?:string;alertId?:string;incidentId?:string}>();const runtime=useMvp();return <RequireSession><EmergencyBody key={`${runtime.session?.tokens.user_id}:${params.responseId??''}:${params.alertId??''}:${params.incidentId??''}`}/></RequireSession>;}
