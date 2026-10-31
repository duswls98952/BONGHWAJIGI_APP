import {useCallback,useEffect,useRef,useState} from 'react';
import {Animated,Text,View} from 'react-native';
import {useFocusEffect,useLocalSearchParams} from 'expo-router';
import type {MvpSchema} from '../api/mvp-types';
import {useMvp,mvpIsMock} from './Runtime';
import {mvpApi,mvpMock} from './api';
import {freshUntil,snapshotReady,stageColors,userMessage} from './core';
import {Body,Button,Card,Chip,Group,Icon,Page,s} from './ui';
import {RequireSession} from './Onboarding';
import {EmergencyActions} from './Support';
import MvpMap from './Map';
import {useTts} from '../platform/useTts';
import {installationId} from '../platform/storage';

type State=MvpSchema<'StatePatch'>;
const emptyState=():State=>({helper_present:null,can_move:null,injured:null,observed_hazard:'unknown',location_type:'unknown',evacuation_status:'unknown',deescalation_confirmed:false});
function region(value:unknown){
  if(!value||typeof value!=='object')return null;
  const box=value as Record<string,unknown>;
  if(['west','east','south','north'].every(key=>typeof box[key]==='number'&&Number.isFinite(box[key])))return box as unknown as {west:number;east:number;south:number;north:number};
  return null;
}
function Wave({speaking}:{speaking:boolean}){
  const amount=useRef(new Animated.Value(1)).current;
  useEffect(()=>{if(!speaking){amount.setValue(1);return;}const animation=Animated.loop(Animated.sequence([Animated.timing(amount,{toValue:.45,duration:450,useNativeDriver:true}),Animated.timing(amount,{toValue:1,duration:450,useNativeDriver:true})]));animation.start();return()=>animation.stop();},[speaking,amount]);
  return <View accessibilityLabel={speaking?'음성 안내 재생 중':'음성 안내 대기'} style={{height:56,justifyContent:'center',flexDirection:'row',alignItems:'center',gap:4}}>{[8,15,22,17,32,40,27,35,21,29,15,19,11,6].map((height,index)=><Animated.View key={index} style={{width:3,height:speaking?height:5,borderRadius:2,backgroundColor:'#3e6577',transform:[{scaleY:amount}]}}/>)}</View>;
}
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
  const utterance=usable?content?.assistant_utterance:null;
  const tts=useTts(utterance,utterance?`${responseId}:${data?.revision}:${utterance.id}`:'',usable&&focused&&runtime.foreground);
  const [state,setState]=useState<State>(emptyState),[stairs,setStairs]=useState<'difficult'|null>(null);
  const [base,setBase]=useState(0),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const receipts=useRef(new Set<string>());
  useEffect(()=>{
    if(!requestedAlert||listed){setOfficial(null);return;}
    let alive=true;void mvpApi.alert(requestedAlert).then(result=>{if(alive)setOfficial(result.data);}).catch(error=>{if(alive)setMessage(userMessage(error));});return()=>{alive=false;};
  },[requestedAlert,listed?.revision]);
  useEffect(()=>{if(responseId)void runtime.loadSnapshot(responseId).catch(error=>setMessage(userMessage(error)));},[responseId,runtime.loadSnapshot]);
  useEffect(()=>{
    if(!data||dirty)return;
    const old=data.user_context.status==='available'?data.user_context.data:null;
    setState({...emptyState(),...(old?{helper_present:old.helper_present,can_move:old.can_move,injured:old.injured,observed_hazard:old.observed_hazard,location_type:old.location_type,evacuation_status:old.evacuation_status,deescalation_confirmed:false}:{})});
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
    try{await runtime.saveContext(responseId,{base_revision:base,observed_at:new Date().toISOString(),confirmation:'user_confirmed',overrides:{mobility:null,stairs,alone_now:state.helper_present===false?'yes':state.helper_present===true?'no':'unknown'},state});setDirty(false);setMessage('현재 상태를 저장했어요. 새 안내를 확인하고 있어요.');}
    catch(problem){setMessage(userMessage(problem));}finally{setBusy(false);}
  }
  const locationState=runtime.home?.data.location;
  const location=locationState?.status==='available'&&freshUntil(locationState.valid_until,runtime.now)?locationState.fix:null;
  const bounds=content&&typeof content.incident.expires_at==='string'&&freshUntil(content.incident.expires_at,runtime.now)?region(content.incident.area):null;
  return <Page footer={<EmergencyActions responseId={responseId} alertId={alert?.id}/>}>
    <View accessibilityLiveRegion="polite" style={{marginHorizontal:-18,marginTop:-18,paddingHorizontal:18,paddingVertical:25,backgroundColor:color.background,alignItems:'center'}}><View style={s.row}><Icon name="warning" color={color.ink} size={26}/><Text style={{fontSize:24,fontWeight:'800',color:color.ink}}>{level==='information'?label:`${label} 산불 ${usable?'발생':''}`.trim()}</Text></View>{usable&&content?.personal_response.number&&<Text style={{fontSize:14,color:color.ink,marginTop:8}}>나의 대응 {content.personal_response.number}단계</Text>}</View>
    {alert&&<Card title={alert.status==='cancelled'?'공식 경보 해제':alert.status==='active'?'공식 경보 원문':'공식 경보 유효성 확인'}><Body>{alert.original_text}</Body><Body small muted>{alert.authority} · 기관 등급 {alert.official_severity}</Body><Body small muted>발령 {new Date(alert.issued_at).toLocaleString('ko-KR')}</Body>{alert.status==='cancelled'&&<Body small>개인 안내는 아래 최신 내용으로 확인해 주세요.</Body>}</Card>}
    {!alert&&<Card><Body>이 사건에 연결된 공식 경보를 확인하고 있어요.</Body></Card>}
    <View style={s.section}><Text style={s.heading}>재난 영향 지역</Text><MvpMap location={location} bounds={bounds}/><Body small muted>{content?.relevance.status==='inside'?'입력된 관련 지역 안에 있어요.':content?.relevance.status==='outside'?'입력된 관련 지역 바깥에 있어요.':'내 위치와 재난 지역의 관련성을 확인하고 있어요.'}</Body></View>
    <View style={s.section}><Text style={s.heading}>실시간 음성 안내</Text><Card tint="#f7f9fb"><Wave speaking={tts.speaking}/><View style={{backgroundColor:'#e8f2f6',borderRadius:16,padding:18}}><Text style={{fontSize:17,lineHeight:28,color:'#2c5569',fontWeight:'700'}}>{usable?(utterance?.text??'새로운 안내를 기다리고 있어요.'):'최신 안내를 확인하고 있어요. 공식 원문은 위에서 확인할 수 있어요.'}</Text></View><Button secondary title={tts.enabled?'음성 읽기 끄기':'이 안내 음성으로 읽기'} onPress={()=>tts.setEnabled(!tts.enabled)}/>{!!tts.error&&<Body small muted>{tts.error}</Body>}</Card></View>
    <View style={s.section}><Text style={s.heading}>내 현재 상태</Text><Card>
      <Body small muted>지금 직접 확인한 상태를 선택하고 저장해 주세요.</Body>
      <Group label="이동과 도움"><Chip label="지금 계단 이용이 어려워요" selected={stairs==='difficult'} onPress={()=>{setStairs(stairs==='difficult'?null:'difficult');setDirty(true);}}/><Chip label="혼자 있어요" selected={state.helper_present===false} onPress={()=>update({helper_present:state.helper_present===false?null:false})}/><Chip label="도와줄 사람이 왔어요" selected={state.helper_present===true} onPress={()=>update({helper_present:state.helper_present===true?null:true})}/><Chip label="스스로 이동하기 어려워요" selected={state.can_move===false} onPress={()=>update({can_move:state.can_move===false?null:false})}/><Chip label="스스로 이동할 수 있어요" selected={state.can_move===true} onPress={()=>update({can_move:state.can_move===true?null:true})}/></Group>
      <Group label="직접 확인한 주변 상황">{([['확인 전','unknown'],['연기·불꽃 보이지 않음','none'],['연기가 보여요','smoke'],['불꽃이 보여요','flames'],['두려움이 커요','fear'],['빠져나가기 어려워요','trapped']] as const).map(([text,hazard])=><Chip key={hazard} label={text} selected={state.observed_hazard===hazard} onPress={()=>update({observed_hazard:hazard})}/>)}</Group>
      <Group label="대피 진행"><Chip label="대피 중이에요" selected={state.evacuation_status==='moving'} onPress={()=>update({evacuation_status:'moving'})}/><Chip label="안내된 장소에 도착했어요" selected={state.evacuation_status==='arrived'} onPress={()=>update({evacuation_status:'arrived'})}/></Group>
      <Group label="상황 재확인"><Chip label="지금 주변 상황과 이동 가능 여부를 다시 확인했어요" selected={state.deescalation_confirmed??false} onPress={()=>update({deescalation_confirmed:!state.deescalation_confirmed})}/></Group>
      <Body small muted>현재 선택한 상태로 안내를 다시 판단해요. 단계 변경은 서버가 최신 공식 정보와 함께 결정해요.</Body>
      <Button title={busy?'상태 저장 중…':'확인한 상태 저장'} disabled={busy||!data||!dirty} onPress={()=>void save()}/>
      {dirty&&data&&data.user_context.revision!==base&&<Button secondary title="최신 상태 다시 불러오기" onPress={()=>{setDirty(false);void runtime.loadSnapshot(responseId).catch(()=>undefined);}}/ >}
    </Card></View>
    <View style={s.section}><Text style={s.heading}>맞춤 행동요령</Text><View style={{borderRadius:16,borderWidth:1,borderColor:'#e0e4e8',padding:16}}>{usable?content?.actions.map(item=><View style={s.step} key={item.action_id}><Text style={s.stepNumber}>{item.priority}</Text><View style={{flex:1}}><Body>{item.text}</Body></View></View>):<Body>새 정보가 반영된 안내를 확인하고 있어요.</Body>}{usable&&!content?.actions.length&&<Body>현재 추가로 제공되는 개인 행동요령이 없어요.</Body>}</View></View>
    {!!(message||runtime.error)&&<View accessibilityLiveRegion="polite" style={s.notice}><Body>{message||runtime.error}</Body></View>}
    <Button secondary title="최신 안내 다시 확인" onPress={()=>void runtime.refresh().catch(problem=>setMessage(userMessage(problem)))}/>
    {mvpIsMock&&<Card title="모의 시연 제어"><View style={s.choices}>{([['1','경고'],['2','대피'],['3','위급']] as const).map(([stage,title])=><Button key={stage} secondary title={title} onPress={()=>{mvpMock.setStage(stage);void runtime.refresh().catch(()=>undefined);}}/>)}</View></Card>}
  </Page>;
}
export default function Emergency(){const params=useLocalSearchParams<{responseId?:string;alertId?:string;incidentId?:string}>();const runtime=useMvp();return <RequireSession><EmergencyBody key={`${runtime.session?.tokens.user_id}:${params.responseId??''}:${params.alertId??''}:${params.incidentId??''}`}/></RequireSession>;}
