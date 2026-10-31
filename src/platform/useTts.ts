import { useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
export function useTts(utterance: {text:string} | null | undefined, key: string, allowed: boolean) {
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  const spoken = useRef(new Set<string>());
  const generation = useRef(0);
  useEffect(() => {
    const version = ++generation.current;
    let disposed = false;
    setSpeaking(false);
    void Speech.stop().then(() => {
      if (disposed || version !== generation.current || !enabled || !allowed || !utterance || spoken.current.has(key)) return;
      spoken.current.add(key);
      if (spoken.current.size > 200) spoken.current.delete(spoken.current.values().next().value!);
      Speech.speak(utterance.text, { language: 'ko-KR', rate: 0.9,
        onStart: () => { if (!disposed) { setSpeaking(true); setError(''); } },
        onDone: () => { if (!disposed) setSpeaking(false); },
        onError: () => { if (!disposed) { setSpeaking(false); setError('음성을 재생하지 못했습니다. 화면 안내를 확인해 주세요.'); } },
      });
    }).catch(() => { if (!disposed) setError('이 기기에서 음성 안내를 시작할 수 없습니다.'); });
    return () => { disposed = true; void Speech.stop(); };
  }, [enabled, key, allowed, utterance?.text]);
  return { enabled, setEnabled, speaking, error };
}
