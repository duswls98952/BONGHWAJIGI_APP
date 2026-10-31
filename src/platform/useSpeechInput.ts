import {useCallback,useEffect,useState} from 'react';
import type {SpeechInput,SpeechInputOptions} from './speechSession';
export type {SpeechInput,SpeechInputOptions,SpeechInputResult,SpeechInputStatus} from './speechSession';

/** Browser previews remain usable through the conversation's text input. */
export function useSpeechInput({enabled,sessionKey}:SpeechInputOptions):SpeechInput {
  const [error,setError] = useState('');
  const cancel = useCallback(()=>setError(''),[]);
  useEffect(()=>{setError('');},[enabled,sessionKey]);
  const start = useCallback(async()=>{
    if (enabled) setError('음성 입력은 설치한 앱에서 사용할 수 있어요. 글로 입력해 주세요.');
  },[enabled]);
  return {supported:false,status:error?'error':'idle',transcript:'',error,onDevice:null,start,stop:cancel,cancel};
}
