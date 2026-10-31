import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {AppState, Platform} from 'react-native';
import type {MvpConfig, MvpEnvelope, MvpHome, MvpProfile, MvpSchema, MvpSnapshot} from '../api/mvp-types';
import {ApiError} from '../api/http';
import {delay} from '../core/async';
import {installationId, newId} from '../platform/storage';
import {stopBackgroundLocation} from '../platform/location';
import {notifyForegroundAlert} from '../platform/notifications';
import {createAlertUpdates} from './alertUpdates';
import {appIsForeground} from './activity';
import {currentMapLocation} from './mapGeometry';
import {mvpApi, sessions, mockMode} from './api';
import {acceptSnapshot, checkSnapshot, freshUntil, userMessage} from './core';
import type {SavedSession} from './session';

type Status='restoring'|'onboarding'|'connecting'|'connected'|'reconnecting'|'background';
type Runtime={
  status:Status;session:SavedSession|null;foreground:boolean;error:string;now:number;
  home:MvpEnvelope<MvpHome>|null;profile:MvpEnvelope<MvpSchema<'ProfileData'>>|null;config:MvpConfig|null;
  snapshots:Record<string,MvpEnvelope<MvpSnapshot>>;required:Record<string,number>;
  newAlert:MvpSchema<'AlertData'>|null;dismissAlert:()=>void;
  refresh:()=>Promise<void>;loadSnapshot:(id:string)=>Promise<void>;
  onboard:(profile:MvpProfile)=>Promise<void>;saveProfile:(profile:MvpProfile,baseRevision:number)=>Promise<void>;
  saveContext:(id:string,body:MvpSchema<'ContextWrite'>)=>Promise<void>;
  logout:()=>Promise<void>;deleteProfile:()=>Promise<void>;requireInput:(kind:string,revision:number)=>void;
};
const Context=createContext<Runtime|null>(null);
export function MvpProvider({children}:React.PropsWithChildren) {
  const [session,setSession]=useState<SavedSession|null>(null);
  const [status,setStatus]=useState<Status>('restoring');
  const [foreground,setForeground]=useState(()=>appIsForeground(AppState.currentState));
  const [home,setHome]=useState<MvpEnvelope<MvpHome>|null>(null);
  const [profile,setProfile]=useState<MvpEnvelope<MvpSchema<'ProfileData'>>|null>(null);
  const [config,setConfig]=useState<MvpConfig|null>(null);
  const [snapshots,setSnapshots]=useState<Record<string,MvpEnvelope<MvpSnapshot>>>({});
  const [required,setRequired]=useState<Record<string,number>>({});
  const requiredInputs=useRef(required);requiredInputs.current=required;
  const [error,setError]=useState('');
  const [newAlert,setNewAlert]=useState<MvpSchema<'AlertData'>|null>(null);
  const alertUpdates=useRef(createAlertUpdates());
  const [now,setNow]=useState(Date.now());
  const lifecycle=useRef(0),reads=useRef(0);
  const active=useRef(false);
  const actor=useRef<SavedSession|null>(null);actor.current=session;
  useEffect(()=>{
    let alive=true;
    void sessions.load().then(value=>{if(alive){setSession(value);setStatus(value?.onboarded?'connecting':'onboarding');}}).catch(()=>{if(alive){setError('기기에 저장된 연결 정보를 읽지 못했습니다.');setStatus('onboarding');}});
    const change=AppState.addEventListener('change',state=>setForeground(appIsForeground(state)));
    const clock=setInterval(()=>setNow(Date.now()),1000);
    return ()=>{alive=false;change.remove();clearInterval(clock);};
  },[]);

  const loadSnapshot=useCallback(async(id:string)=>{
    const stamp=lifecycle.current;
    const value=checkSnapshot(await mvpApi.snapshot(id),id);
    if(stamp!==lifecycle.current||!active.current)return;
    setSnapshots(old=>({...old,[id]:acceptSnapshot(old[id],value)}));
  },[]);
  const refresh=useCallback(async()=>{
    const stamp=lifecycle.current,index=++reads.current,account=actor.current?.tokens.user_id;
    const [nextHome,nextProfile,nextConfig]=await Promise.all([mvpApi.home(),mvpApi.profile(),mvpApi.config()]);
    if(stamp!==lifecycle.current||index!==reads.current||!active.current||account!==actor.current?.tokens.user_id)return;
    const data=nextHome.data;
    if(!Array.isArray(data.nearby_disasters)||!Array.isArray(data.alerts)||!data.location||!data.preparations)throw new ApiError(502,'INVALID_HOME');
    setHome(nextHome);
    setProfile(old=>old&&old.data.revision>nextProfile.data.revision?old:nextProfile);
    setConfig(nextConfig.data);
    const locationMinimum=requiredInputs.current[`location:${account}`]??0;
    const alerts=account?alertUpdates.current.observe(account,data.alerts,Date.now(),!!currentMapLocation(data.location,Date.now(),locationMinimum)):[];
    if(alerts.length){
      const latest=alerts.at(-1)!;setNewAlert(latest);
      for(const alert of alerts)void notifyForegroundAlert(alert,()=>stamp===lifecycle.current&&index===reads.current&&account===actor.current?.tokens.user_id&&active.current&&freshUntil(alert.valid_until,Date.now())&&!!currentMapLocation(data.location,Date.now(),locationMinimum)).catch(()=>undefined);
    }
    const ids=new Set([
      ...data.nearby_disasters.map(item=>item.response_id),
      ...data.alerts.map(item=>item.response_id),
    ].filter((id):id is string=>!!id));
    // 공식 경보·홈을 먼저 반영한다. 개인 평가 실패가 공식 원문을 막지 않는다.
    const results=await Promise.allSettled([...ids].map(loadSnapshot));
    if(results.some(value=>value.status==='rejected')&&stamp===lifecycle.current)setError('공식 정보는 확인됐습니다. 개인 안내를 다시 확인하고 있습니다.');
  },[loadSnapshot]);
  useEffect(()=>{setNewAlert(null);},[session?.tokens.user_id]);

  useEffect(()=>{
    if(!session?.onboarded){active.current=false;return;}
    if(!foreground){active.current=false;setStatus('background');return;}
    active.current=true;
    const stamp=++lifecycle.current;
    const controller=new AbortController();
    const signal=controller.signal;
    void(async()=>{
      let cursor:string|undefined,failures=0;
      while(!signal.aborted){
        try{
          if(!cursor){
            setStatus('connecting');
            const first=await mvpApi.updates(undefined,signal,0);
            if(signal.aborted||stamp!==lifecycle.current)return;
            cursor=first.data.next_cursor;
            await refresh();
          }
          if(signal.aborted||stamp!==lifecycle.current)return;
          setStatus('connected');setError('');failures=0;
          const changes=await mvpApi.updates(cursor,signal);
          if(signal.aborted||stamp!==lifecycle.current)return;
          if(!Array.isArray(changes.data.events)||typeof changes.data.next_cursor!=='string')throw new ApiError(502,'INVALID_UPDATES');
          if(changes.data.events.length){
            await refresh();
            const ids=new Set(changes.data.events.filter(event=>event.type.startsWith('response.')&&event.resource_id).map(event=>event.resource_id!));
            await Promise.allSettled([...ids].map(loadSnapshot));
          }
          cursor=changes.data.next_cursor;
        }catch(problem){
          if(signal.aborted||stamp!==lifecycle.current)return;
          if(problem instanceof ApiError&&(problem.status===400||problem.status===410)){cursor=undefined;continue;}
          if(problem instanceof ApiError&&problem.status===401){
            await sessions.clear();setSession(null);setHome(null);setProfile(null);setSnapshots({});setRequired({});setStatus('onboarding');setError(userMessage(problem));return;
          }
          setStatus('reconnecting');setError(userMessage(problem));
          const wait=problem instanceof ApiError&&problem.retryAfterMs?problem.retryAfterMs:Math.min(30000,1000*2**Math.min(failures++,5));
          try{await delay(wait,signal);}catch{return;}
          cursor=undefined;
        }
      }
    })();
    return()=>{controller.abort();active.current=false;lifecycle.current++;reads.current++;};
  },[session?.tokens.user_id,session?.onboarded,foreground,refresh,loadSnapshot]);

  const requireInput=useCallback((kind:string,revision:number)=>{
    const user=actor.current?.tokens.user_id;
    if(!user)return;
    requiredInputs.current={...requiredInputs.current,[`${kind}:${user}`]:Math.max(requiredInputs.current[`${kind}:${user}`]??0,revision)};
    setRequired(requiredInputs.current);
    reads.current++;
  },[]);
  const saveProfile=useCallback(async(draft:MvpProfile,baseRevision:number)=>{
    const stamp=lifecycle.current,user=actor.current?.tokens.user_id;
    const value=await mvpApi.saveProfile({base_revision:baseRevision,profile:draft},newId());
    if(stamp!==lifecycle.current||user!==actor.current?.tokens.user_id)return;
    setProfile(value);requireInput('profile',value.data.input_revision);await refresh();
  },[refresh,requireInput]);
  const onboard=useCallback(async(draft:MvpProfile)=>{
    let value=await sessions.load();
    if(!value){
      const tokens=await mvpApi.register({installation_id:await installationId(),consent:{version:'internal-demo-v1',service:true,privacy:true,location:true}});
      value=await sessions.save(tokens.data,false);
      setSession(value);actor.current=value;
    }
    await mvpApi.device(await installationId(),{platform:Platform.OS==='android'?'android':Platform.OS==='ios'?'ios':'web',push_provider:'fcm',push_token:null,notification_permission:'not_determined',app_version:'0.4.0'});
    const current=await mvpApi.profile();
    const saved=await mvpApi.saveProfile({base_revision:current.data.revision,profile:draft},newId());
    setProfile(saved);
    const complete=await sessions.complete();
    setRequired({});setSnapshots({});setSession(complete);setError('');setStatus('connecting');
  },[]);
  const saveContext=useCallback(async(id:string,body:MvpSchema<'ContextWrite'>)=>{
    const stamp=lifecycle.current,user=actor.current?.tokens.user_id;
    const result=await mvpApi.context(id,body);
    if(stamp!==lifecycle.current||user!==actor.current?.tokens.user_id)return;
    const current=snapshots[id]?.data.content;
    if(current)setRequired(old=>({...old,[`state:${current.incident_id}/${actor.current?.tokens.user_id}`]:result.data.context_revision}));
    reads.current++;
    await refresh();
  },[snapshots,refresh]);
  const logout=useCallback(async()=>{
    const results=await Promise.allSettled([stopBackgroundLocation(),mvpApi.logout()]);
    active.current=false;lifecycle.current++;reads.current++;
    await sessions.clear();setSession(null);setHome(null);setProfile(null);setSnapshots({});setRequired({});setStatus('onboarding');
    if(results.some(item=>item.status==='rejected'))setError('기기에서 로그아웃했습니다. 연결 문제로 서버 세션 해제는 확인하지 못했어요.');
  },[]);
  const deleteProfile=useCallback(async()=>{
    const stamp=lifecycle.current,user=actor.current?.tokens.user_id;
    const value=await mvpApi.deleteProfile();
    if(stamp!==lifecycle.current||user!==actor.current?.tokens.user_id)return;
    setProfile(value);requireInput('profile',value.data.input_revision);await refresh();
  },[requireInput,refresh]);
  return <Context.Provider value={{status,session,foreground,error,now,home,profile,config,snapshots,required,newAlert,dismissAlert:()=>setNewAlert(null),refresh,loadSnapshot,onboard,saveProfile,saveContext,logout,deleteProfile,requireInput}}>{children}</Context.Provider>;
}
export function useMvp(){const value=useContext(Context);if(!value)throw new Error('MvpProvider required');return value;}
export const mvpIsMock=mockMode;
