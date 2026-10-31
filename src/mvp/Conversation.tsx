import {useEffect,useRef,useState} from 'react';
import {Alert,Animated,Pressable,Text,TextInput,View} from 'react-native';
import * as Speech from 'expo-speech';
import {ApiError} from '../api/http';
import type {MvpSchema} from '../api/mvp-types';
import {newId} from '../platform/storage';
import {useSpeechInput} from '../platform/useSpeechInput';
import {useTts} from '../platform/useTts';
import {mvpApi} from './api';
import {dialogueCurrent,proposalContext,proposalLabel} from './interaction';
import {useMvp} from './Runtime';
import {userMessage} from './core';
import {Body,Button,s} from './ui';

function Wave({active}:{active:boolean}){
  const scale=useRef(new Animated.Value(1)).current;
  useEffect(()=>{if(!active){scale.setValue(.35);return;}const animation=Animated.loop(Animated.sequence([Animated.timing(scale,{toValue:.4,duration:400,useNativeDriver:true}),Animated.timing(scale,{toValue:1,duration:400,useNativeDriver:true})]));animation.start();return()=>animation.stop();},[active,scale]);
  return <View accessibilityLabel={active?'음성 사용 중':'음성 대화 대기'} style={{height:45,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:4}}>{[7,13,20,15,30,38,25,33,19,27,13,17,9,5].map((height,index)=><Animated.View key={index} style={{width:3,height,borderRadius:4,backgroundColor:'#245c74',transform:[{scaleY:scale}]}}/>)}</View>;
}

const delay=(ms:number,signal:AbortSignal)=>new Promise<void>((resolve,reject)=>{
  if(signal.aborted){reject(new Error('cancelled'));return;}
  const cancel=()=>{clearTimeout(timer);reject(new Error('cancelled'));};
  const timer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve();},ms);
  signal.addEventListener('abort',cancel,{once:true});
});

export default function Conversation({responseId,active}:{responseId:string;active:boolean}){
  const runtime=useMvp(),snapshot=runtime.snapshots[responseId]?.data;
  const scope=`${runtime.session?.tokens.user_id??''}:${responseId}`;
  const [draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState('');
  const [turn,setTurn]=useState<MvpSchema<'TextTurnData'>|null>(null),[lastUser,setLastUser]=useState('');
  const [history,setHistory]=useState<{user:string;answer:string}[]>([]),[showHistory,setShowHistory]=useState(false);
  const controller=useRef<AbortController|null>(null),generation=useRef(0),locked=useRef(false),speechNotice=useRef(false);
  const latest=useRef({scope,active,snapshot,now:runtime.now});latest.current={scope,active,snapshot,now:runtime.now};
  const current=active&&dialogueCurrent(turn,snapshot,runtime.now);
  const proposal=current?proposalContext(turn,snapshot,runtime.now):null;
  const utterance=active?(current&&turn?.assistant?turn.assistant:snapshot?.content?.assistant_utterance):null;
  const speech=useSpeechInput({enabled:active&&!busy&&!saving,sessionKey:scope,onFinal:result=>{setDraft(result.text);void send(result.text);}});
  const recording=['preparing','listening','stopping'].includes(speech.status);
  const tts=useTts(utterance,current&&turn?`turn:${turn.turn_id}`:`${responseId}:${snapshot?.revision}:${snapshot?.content?.assistant_utterance?.id}`,active&&!recording&&!busy&&!saving);

  useEffect(()=>{
    if(!active){generation.current++;controller.current?.abort();controller.current=null;locked.current=false;setBusy(false);setSaving(false);}
    return()=>{generation.current++;controller.current?.abort();locked.current=false;};
  },[scope,active]);
  useEffect(()=>{setBusy(false);setSaving(false);setDraft('');setTurn(null);setLastUser('');setHistory([]);setMessage('');setShowHistory(false);},[scope]);
  useEffect(()=>{if(speech.transcript)setDraft(speech.transcript);},[speech.transcript]);

  async function send(raw:string){
    const text=raw.trim(),start=latest.current;
    if(text.length>1000){setMessage('말씀하신 내용이 길어요. 1,000자 이내로 줄여 보내 주세요.');return;}
    if(!text||!start.active||!start.snapshot||locked.current)return;
    locked.current=true;setBusy(true);setMessage('');setTurn(null);setLastUser(text);tts.setEnabled(false);
    const token=++generation.current,abort=new AbortController();controller.current=abort;
    const id=newId();
    const relevant=()=>!abort.signal.aborted&&generation.current===token&&latest.current.scope===start.scope&&latest.current.active;
    try{
      let response;
      try{response=await mvpApi.textTurn(responseId,{client_turn_id:id,text,base_response_revision:start.snapshot.revision,base_context_revision:start.snapshot.user_context.revision},abort.signal);}
      catch(problem){
        if(!relevant())return;
        if(problem instanceof ApiError&&problem.code!=='TURN_IN_PROGRESS')throw problem;
        response=await mvpApi.textTurnResult(responseId,id,abort.signal);
      }
      for(let attempt=0;response.data.status==='processing'&&attempt<8;attempt++){
        await delay(1000,abort.signal);response=await mvpApi.textTurnResult(responseId,id,abort.signal);
      }
      if(!relevant())return;
      if(response.data.turn_id!==id||!dialogueCurrent(response.data,latest.current.snapshot,latest.current.now)){
        setMessage('안내가 바뀌었어요. 최신 내용을 확인하고 다시 말씀해 주세요.');void runtime.refresh().catch(()=>undefined);return;
      }
      setTurn(response.data);setDraft('');
      if(response.data.assistant)setHistory(old=>[...old,{user:text,answer:response.data.assistant!.text}].slice(-8));
      tts.setEnabled(true);
    }catch(problem){if(relevant()){
      const stale=problem instanceof ApiError&&['TURN_STALE','REVISION_CONFLICT','TURN_SUPERSEDED','TURN_EXPIRED','RESPONSE_REFRESH_REQUIRED','RESPONSE_REVISION_CONFLICT','CONTEXT_REVISION_CONFLICT'].includes(problem.code);
      setMessage(stale?'상태가 바뀌었어요. 최신 안내를 확인하고 다시 보내 주세요.':userMessage(problem));
      if(stale)void runtime.refresh().catch(()=>undefined);
    }}
    finally{if(generation.current===token){locked.current=false;controller.current=null;setBusy(false);}}
  }
  async function confirm(){
    const body=active?proposalContext(turn,latest.current.snapshot,latest.current.now):null;
    if(!body||locked.current)return;
    locked.current=true;setSaving(true);setMessage('');tts.setEnabled(false);
    const token=++generation.current;
    try{await runtime.saveContext(responseId,body);if(generation.current===token){setTurn(null);setMessage('상태를 반영했어요.');}}
    catch(problem){if(generation.current===token){setMessage(userMessage(problem));if(problem instanceof ApiError&&[409,410].includes(problem.status)){setTurn(null);void runtime.refresh().catch(()=>undefined);}}}
    finally{if(generation.current===token){locked.current=false;setSaving(false);}}
  }
  async function beginSpeech(){const start=latest.current.scope;tts.setEnabled(false);await Speech.stop();if(latest.current.scope===start&&latest.current.active)await speech.start();}
  function speak(){
    if(recording){speech.stop();return;}
    if(speechNotice.current){void beginSpeech().catch(()=>setMessage('마이크를 시작하지 못했어요.'));return;}
    const scopeAtOpen=latest.current.scope,versionAtOpen=generation.current;
    Alert.alert('음성 입력','휴대폰의 음성 인식 서비스를 사용해요. 봉화지기 서버에는 인식한 글만 전송해요.',[{text:'취소',style:'cancel'},{text:'시작',onPress:()=>{if(latest.current.scope!==scopeAtOpen||!latest.current.active||generation.current!==versionAtOpen)return;speechNotice.current=true;void beginSpeech().catch(()=>setMessage('마이크를 시작하지 못했어요.'));}}]);
  }
  return <View style={{marginHorizontal:-12,padding:12,borderRadius:24,backgroundColor:'#f7f9fb',gap:12}}>
    <Text style={s.heading}>실시간 음성 대화</Text>
    <Wave active={tts.speaking||speech.status==='listening'}/>
    {!!lastUser&&<Text style={{fontSize:14,lineHeight:22,color:'#58636c',textAlign:'right'}}>나: {lastUser}</Text>}
    <View accessibilityLiveRegion="polite" style={{minHeight:80,borderRadius:16,backgroundColor:'#e8f2f6',padding:14,justifyContent:'center'}}><Text style={{fontSize:17,lineHeight:27,fontWeight:'700',textAlign:'center',color:'#245c74'}}>{busy?'말씀하신 내용을 확인하고 있어요…':utterance?.text??'최신 안내를 확인하고 있어요.'}</Text></View>
    {proposal&&<View style={{gap:10,padding:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#87949d',borderRadius:12}}><Body>이 상태로 안내를 갱신할까요?</Body>{[...new Set(turn!.proposal!.evidence.map(proposalLabel))].map(label=><Body key={label}>• {label}</Body>)}<View style={{flexDirection:'row',gap:8}}><View style={{flex:1}}><Button title={saving?'반영 중…':'상태 반영'} disabled={saving} onPress={()=>void confirm()}/></View><View style={{flex:1}}><Button secondary title="취소" disabled={saving} onPress={()=>setTurn(null)}/></View></View></View>}
    <TextInput accessibilityLabel="대화 내용" value={draft} onChangeText={setDraft} editable={active&&!busy&&!recording&&!saving} placeholder="현재 상황을 말하거나 입력하세요" placeholderTextColor="#737d85" multiline maxLength={1000} style={[s.input,{minHeight:48,maxHeight:120}]}/>
    <View style={{flexDirection:'row',gap:8}}>
      {speech.supported&&<View style={{flex:1}}><Button title={speech.status==='listening'?'말하기 완료':speech.status==='preparing'?'마이크 준비 중…':speech.status==='stopping'?'인식 중…':'말하기'} disabled={!active||busy||saving||['preparing','stopping'].includes(speech.status)} onPress={speak}/></View>}
      <View style={{flex:1}}><Button secondary title="보내기" disabled={!active||busy||saving||recording||!draft.trim()} onPress={()=>void send(draft)}/></View>
    </View>
    {recording&&<Button secondary title="음성 입력 취소" onPress={()=>{speech.cancel();setDraft('');}}/>}
    <Pressable accessibilityRole="button" disabled={!active||recording||busy} onPress={()=>tts.setEnabled(!tts.enabled)} style={{minHeight:48,justifyContent:'center',alignItems:'center'}}><Text style={{color:'#245c74',fontSize:14,fontWeight:'700'}}>{tts.enabled?'음성 읽기 끄기':'안내 읽어주기'}</Text></Pressable>
    {!!(message||speech.error||tts.error)&&<Body>{message||speech.error||tts.error}</Body>}
    {history.length>1&&<><Pressable accessibilityRole="button" accessibilityState={{expanded:showHistory}} onPress={()=>setShowHistory(!showHistory)} style={{minHeight:48,justifyContent:'center'}}><Text style={{fontSize:13,color:'#245c74'}}>이전 대화 {showHistory?'접기':'보기'}</Text></Pressable>{showHistory&&history.slice(0,-1).map((item,index)=><View key={index} style={{gap:5,borderTopWidth:1,borderColor:'#dfe3e7',paddingTop:10}}><Body small>나: {item.user}</Body><Body small>{item.answer}</Body></View>)}</>}
  </View>;
}
