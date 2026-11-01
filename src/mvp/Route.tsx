import {useCallback,useEffect,useRef,useState} from 'react';
import {useFocusEffect,useLocalSearchParams} from 'expo-router';
import {Text,View} from 'react-native';
import type {MvpSchema} from '../api/mvp-types';
import {settings} from '../config';
import {installationId,newId} from '../platform/storage';
import {useMvp} from './Runtime';
import {mvpApi} from './api';
import {snapshotReady,userMessage} from './core';
import {routeDependencies,simulationRoutePoints} from './interaction';
import {Body,Button,Card,Page,s} from './ui';
import {RequireSession} from './Onboarding';
import {EmergencyActions} from './Support';
import {currentMapLocation} from './mapGeometry';
import MvpMap from './Map';

function RouteBody(){
  const params=useLocalSearchParams<{responseId?:string;alertId?:string}>(),value=useMvp();
  const alert=value.home?.data.alerts.find(item=>item.id===params.alertId);
  const responseId=params.responseId??alert?.response_id??'';
  const scope=`${value.session?.tokens.user_id??''}:${responseId}`;
  const snapshot=value.snapshots[responseId];
  const [focused,setFocused]=useState(false),[nonce,setNonce]=useState(0),[error,setError]=useState(''),[loading,setLoading]=useState(false),[renewing,setRenewing]=useState(false);
  const [loaded,setLoaded]=useState<{scope:string;revision:number;data:MvpSchema<'RouteData'>}|null>(null);
  const generation=useRef(0),renewLock=useRef(false),latest=useRef({scope,active:false});
  latest.current={scope,active:focused&&value.foreground};
  useFocusEffect(useCallback(()=>{setFocused(true);return()=>setFocused(false);},[]));
  useEffect(()=>{
    let current=true;
    if(responseId)void value.loadSnapshot(responseId).catch(problem=>{if(current)setError(userMessage(problem));});
    return()=>{current=false;};
  },[scope,responseId,value.loadSnapshot]);
  useEffect(()=>{
    generation.current++;renewLock.current=false;setRenewing(false);
    return()=>{generation.current++;renewLock.current=false;};
  },[scope,focused,value.foreground]);
  const ready=focused&&value.foreground&&value.status==='connected'&&snapshotReady(snapshot,value.required,value.now);
  const location=currentMapLocation(value.home?.data.location,value.now,value.required[`location:${value.session?.tokens.user_id}`]??0);
  useEffect(()=>{
    setLoaded(null);setError('');
    if(!responseId||!ready||!snapshot)return;
    const controller=new AbortController();setLoading(true);
    void mvpApi.route(responseId,controller.signal).then(result=>{if(!controller.signal.aborted&&latest.current.scope===scope)setLoaded({scope,revision:snapshot.data.revision,data:result.data});}).catch(problem=>{if(!controller.signal.aborted&&latest.current.scope===scope)setError(userMessage(problem));}).finally(()=>{if(!controller.signal.aborted&&latest.current.scope===scope)setLoading(false);});
    return()=>controller.abort();
  },[scope,responseId,snapshot?.data.revision,ready,nonce]);
  const data=ready&&loaded?.scope===scope&&loaded.revision===snapshot?.data.revision?loaded.data:null;
  const dependencies=routeDependencies(snapshot?.data,value.required,value.home?.data.location.input_revision??-1);
  const points=location&&dependencies?simulationRoutePoints(data,value.now,dependencies):[];
  const route=points.length?data?.route:null;
  const unavailableMessage=data?.reason==='ROUTE_BLOCKED'?'대피 경로가 통제됐어요. 현재 맞춤 행동요령을 확인해 주세요.':data?.reason==='ROUTE_STATUS_UNKNOWN'||data?.reason==='ROUTE_EVIDENCE_UNAVAILABLE'?'경로의 통행 여부를 확인하고 있어요.':data?.reason==='OUTSIDE_SIMULATION_ROUTE_START'?'현재 위치에 연결된 경로가 없어요.':'현재 표시할 대피 경로가 없어요.';
  const demoAvailable=value.home?.meta.mode==='simulation'&&settings.mode==='live'&&settings.demoLatitude!==''&&settings.demoLongitude!=='';
  async function renew(){
    if(renewLock.current||!latest.current.active)return;
    renewLock.current=true;
    const token=++generation.current,scopeAtStart=latest.current.scope;
    const current=()=>generation.current===token&&latest.current.scope===scopeAtStart&&latest.current.active;
    setRenewing(true);setError('');
    try{
      const installation=await installationId();if(!current())return;
      const result=await mvpApi.sendLocation({fix_id:newId(),installation_id:installation,latitude:Number(settings.demoLatitude),longitude:Number(settings.demoLongitude),accuracy_m:10,captured_at:new Date().toISOString()});
      if(!current())return;
      value.requireInput('location',result.data.input_revision);await value.refresh();
      if(current())setNonce(n=>n+1);
    }
    catch(problem){if(current())setError(userMessage(problem));}
    finally{if(generation.current===token){renewLock.current=false;setRenewing(false);}}
  }
  return <Page title="대피로" footer={<EmergencyActions responseId={responseId} alertId={params.alertId}/>}>
    {route&&<Text style={{alignSelf:'flex-start',fontSize:12,color:'#695000',backgroundColor:'#fff1b8',paddingVertical:6,paddingHorizontal:10,borderRadius:6}}>참고 경로 · 실제 통행 여부 확인 필요</Text>}
    <MvpMap location={location} height={380} route={points} destinationLabel={route?.destination.name} simulation={value.home?.meta.mode==='simulation'}/>
    {route?<><View style={s.row}><Text style={s.heading}>{route.destination.name}</Text></View><View style={{borderWidth:1,borderColor:'#dfe3e7',borderRadius:14,padding:16,gap:14}}>{route.steps.map(step=><View key={step.sequence} style={s.row}><Text style={s.stepNumber}>{step.sequence}</Text><View style={{flex:1}}><Body>{step.text}</Body></View></View>)}</View></>:<Card><Body>{loading&&ready?'경로를 확인하고 있어요.':!location?'안내 위치를 설정하면 경로를 확인할 수 있어요.':unavailableMessage}</Body>{demoAvailable&&!location&&<Button title={renewing?'확인 중…':'안내 위치 설정'} disabled={renewing} onPress={()=>void renew()}/>}</Card>}
    {!!error&&<Body>{error}</Body>}
    <Button secondary title="경로 다시 확인" disabled={renewing} onPress={()=>{setNonce(n=>n+1);void value.refresh().catch(problem=>setError(userMessage(problem)));}}/>
  </Page>;
}
export default function Route(){return <RequireSession><RouteBody/></RequireSession>;}
