import {useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Platform} from 'react-native';
import Constants from 'expo-constants';
import type {ExpoSpeechRecognitionResultEvent} from 'expo-speech-recognition';
import {SpeechSession,speechErrorMessage,type SpeechInput,type SpeechInputOptions,type SpeechInputStatus} from './speechSession';
export type {SpeechInput,SpeechInputOptions,SpeechInputResult,SpeechInputStatus} from './speechSession';

type SpeechModule = typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule;
type SpeechEvent = {type:'start'|'end'|'nomatch'}
  | {type:'result';value:ExpoSpeechRecognitionResultEvent}
  | {type:'error';code:string};
type Lease = {
  owner:symbol;
  token:number;
  nativeStarted:boolean;
  onEvent:(event:SpeechEvent)=>void;
  onTimeout:()=>void;
  timeout:ReturnType<typeof setTimeout>|null;
};
let engine:SpeechModule|null|undefined;
let activeLease:Lease|null = null;

function clearTimer(lease:Lease) {
  if (lease.timeout) clearTimeout(lease.timeout);
  lease.timeout = null;
}
function release(lease:Lease) {
  clearTimer(lease);
  if (activeLease === lease) activeLease = null;
}
function dispatch(event:SpeechEvent) {
  const lease = activeLease;
  if (!lease) return;
  // Native `end` is the final event of a session. Do not release on abort or
  // final result: a new screen must not consume the preceding session's events.
  if (event.type === 'end') release(lease);
  lease.onEvent(event);
}
function getEngine():SpeechModule|null {
  if (engine !== undefined) return engine;
  if (Constants.executionEnvironment === 'storeClient') return engine = null;
  try {
    const loaded = require('expo-speech-recognition') as typeof import('expo-speech-recognition');
    const native = loaded.ExpoSpeechRecognitionModule;
    if (!native.isRecognitionAvailable() && !native.supportsOnDeviceRecognition()) return engine = null;
    native.addListener('start',()=>dispatch({type:'start'}));
    native.addListener('end',()=>dispatch({type:'end'}));
    native.addListener('nomatch',()=>dispatch({type:'nomatch'}));
    native.addListener('result',value=>dispatch({type:'result',value}));
    native.addListener('error',value=>dispatch({type:'error',code:value.error}));
    return engine = native;
  } catch { return engine = null; }
}

async function koreanOnDevice(native:SpeechModule):Promise<boolean> {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33 || !native.supportsOnDeviceRecognition()) return false;
  let timeout:ReturnType<typeof setTimeout>|undefined;
  try {
    const locales = await Promise.race([
      native.getSupportedLocales({}),
      new Promise<null>(resolve=>{timeout=setTimeout(()=>resolve(null),3000);}),
    ]);
    return locales?.installedLocales.some(locale=>/^ko(?:[-_]KR)?$/i.test(locale)) ?? false;
  } catch { return false; }
  finally { if (timeout) clearTimeout(timeout); }
}

export function useSpeechInput(options:SpeechInputOptions):SpeechInput {
  const latest = useRef(options);
  latest.current = options;
  const mounted = useRef(false);
  const owner = useRef(Symbol('speech-input'));
  const session = useRef(new SpeechSession());
  const [supported,setSupported] = useState(false);
  const [status,setStatus] = useState<SpeechInputStatus>('idle');
  const [transcript,setTranscript] = useState('');
  const [error,setError] = useState('');
  const [onDevice,setOnDevice] = useState<boolean|null>(null);

  const cancel = useCallback(()=>{
    session.current.cancel();
    const lease = activeLease;
    if (lease?.owner === owner.current) {
      clearTimer(lease);
      // Detach UI callbacks even if a native engine delays its terminal event.
      lease.onEvent = ()=>undefined;
      if (lease.nativeStarted) {
        try { engine?.abort(); } catch {
          // Retain the lease unless the engine confirms there is no session.
          void engine?.getStateAsync().then(state=>{if (state === 'inactive') release(lease);}).catch(()=>undefined);
        }
      } else release(lease);
    }
    if (mounted.current) {setStatus('idle');setTranscript('');setError('');setOnDevice(null);}
  },[]);

  useEffect(()=>{
    mounted.current = true;
    setSupported(Boolean(getEngine()));
    const listener = AppState.addEventListener('change',state=>{if (state === 'background') cancel();});
    return ()=>{mounted.current=false;cancel();listener.remove();};
  },[cancel]);
  useEffect(()=>{cancel();},[options.enabled,options.sessionKey,cancel]);

  const start = useCallback(async()=>{
    if (!mounted.current || !latest.current.enabled || AppState.currentState === 'background') return;
    const native = getEngine();
    if (!native) {setStatus('error');setError('음성 인식을 사용할 수 없어요. 글로 입력해 주세요.');return;}
    if (activeLease) {
      if (activeLease.owner !== owner.current || !session.current.isCurrent(activeLease.token)) {
        setStatus('error');setError(speechErrorMessage('busy'));
      }
      return;
    }
    const key = latest.current.sessionKey;
    const token = session.current.begin(key);
    if (token === null) return;
    let localRecognition = false;
    const current = ()=>mounted.current && latest.current.enabled && latest.current.sessionKey === key && session.current.isCurrent(token,key);
    const fail = (message:string)=>{
      if (!current()) return;
      session.current.finish(token);
      setStatus('error');setError(message);
    };
    const lease:Lease = {owner:owner.current,token,nativeStarted:false,timeout:null,onTimeout:()=>{
      if (activeLease !== lease) return;
      fail('음성 입력 시간이 끝났어요. 다시 말하거나 글로 입력해 주세요.');
      try {native.abort();} catch { /* Await native end before a new session. */ }
    },onEvent:event=>{
      if (!current()) return;
      if (event.type === 'start') setStatus('listening');
      else if (event.type === 'end') {session.current.finish(token);setStatus('idle');}
      else if (event.type === 'error') {
        clearTimer(lease);
        if (event.code === 'aborted') {session.current.finish(token);setStatus('idle');}
        else fail(speechErrorMessage(event.code));
      } else if (event.type === 'nomatch') fail(speechErrorMessage('no-speech'));
      else if (event.type === 'result') {
        const update = session.current.result(token,event.value.results[0]?.transcript ?? '',event.value.isFinal,localRecognition);
        if (!update) return;
        setTranscript(update.text);
        if (update.final) {
          setStatus('stopping');
          try {latest.current.onFinal?.(update.final);}
          catch {setError('인식한 내용을 보내지 못했어요. 글로 입력해 다시 보내 주세요.');}
        }
      }
    }};
    activeLease = lease;
    setStatus('preparing');setError('');setTranscript('');setOnDevice(null);
    try {
      const permission = await native.requestPermissionsAsync();
      if (!current()) {if (!lease.nativeStarted) release(lease);return;}
      if (!permission.granted) {release(lease);fail(speechErrorMessage('not-allowed'));return;}
      localRecognition = await koreanOnDevice(native);
      if (!current()) {release(lease);return;}
      setOnDevice(localRecognition);
      lease.nativeStarted = true;
      native.start({lang:'ko-KR',interimResults:true,maxAlternatives:1,continuous:false,
        requiresOnDeviceRecognition:localRecognition,recordingOptions:{persist:false}});
      if (activeLease === lease && current()) lease.timeout = setTimeout(lease.onTimeout,45000);
    } catch {
      if (!lease.nativeStarted) release(lease);
      else {try {native.abort();} catch { /* Retain the native session lease. */ }}
      fail(speechErrorMessage('unknown'));
    }
  },[]);

  const stop = useCallback(()=>{
    const lease = activeLease;
    if (lease?.owner !== owner.current) return;
    if (!lease.nativeStarted) {cancel();return;}
    setStatus('stopping');
    clearTimer(lease);
    lease.timeout = setTimeout(lease.onTimeout,10000);
    try {engine?.stop();} catch {cancel();setStatus('error');setError(speechErrorMessage('unknown'));}
  },[cancel]);

  return {supported,status,transcript,error,onDevice,start,stop,cancel};
}
