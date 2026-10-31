export type SpeechInputStatus = 'idle' | 'preparing' | 'listening' | 'stopping' | 'error';

export type SpeechInputResult = {
  id: number;
  sessionKey: string;
  text: string;
  onDevice: boolean;
};

export type SpeechInputOptions = {
  enabled: boolean;
  sessionKey: string;
  onFinal?: (result: SpeechInputResult) => void;
};

export type SpeechInput = {
  supported: boolean;
  status: SpeechInputStatus;
  transcript: string;
  error: string;
  onDevice: boolean | null;
  start: () => Promise<void>;
  stop: () => void;
  cancel: () => void;
};

/** A recognizer's events have no request ID. The native adapter holds its lease
 * until `end`; this guard additionally rejects async work from older screens. */
export class SpeechSession {
  private sequence = 0;
  private active: {id:number;sessionKey:string;finalDelivered:boolean} | null = null;

  begin(sessionKey:string):number|null {
    if (this.active) return null;
    const id = ++this.sequence;
    this.active = {id,sessionKey,finalDelivered:false};
    return id;
  }

  isCurrent(id:number,sessionKey?:string):boolean {
    return this.active?.id === id && (sessionKey === undefined || this.active.sessionKey === sessionKey);
  }

  result(id:number,text:string,isFinal:boolean,onDevice:boolean):{text:string;final:SpeechInputResult|null}|null {
    const active = this.active;
    if (!active || active.id !== id || active.finalDelivered) return null;
    const trimmed = text.trim();
    if (!trimmed) return null;
    if (isFinal) active.finalDelivered = true;
    return {text:trimmed,final:isFinal?{id,sessionKey:active.sessionKey,text:trimmed,onDevice}:null};
  }

  finish(id:number):boolean {
    if (!this.isCurrent(id)) return false;
    this.active = null;
    return true;
  }

  cancel():void { this.active = null; }
}

export function speechErrorMessage(code:string):string {
  switch (code) {
    case 'not-allowed': return '마이크 권한이 필요해요. 설정에서 허용해 주세요.';
    case 'no-speech': case 'speech-timeout': return '말소리를 듣지 못했어요. 다시 말하거나 글로 입력해 주세요.';
    case 'network': return '음성 인식에 연결하지 못했어요. 다시 시도하거나 글로 입력해 주세요.';
    case 'language-not-supported': return '한국어 음성 인식을 사용할 수 없어요. 글로 입력해 주세요.';
    case 'service-not-allowed': return '이 기기에서 음성 인식을 사용할 수 없어요. 글로 입력해 주세요.';
    case 'busy': case 'too-many-requests': return '음성 인식을 마무리하고 있어요. 잠시 후 다시 눌러 주세요.';
    case 'audio-capture': case 'interrupted': return '마이크 사용이 중단됐어요. 다시 말하거나 글로 입력해 주세요.';
    default: return '음성을 인식하지 못했어요. 다시 말하거나 글로 입력해 주세요.';
  }
}
