import { useCallback, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, mockServer } from '../src/api';
import type { Envelope, Level, ResponseSnapshot, Schema } from '../src/api/types';
import { settings } from '../src/config';
import { Screen, Card, Body, Button, styles, palette } from '../src/components/ui';
import DisasterMap from '../src/components/DisasterMap';
import { isMock, keys, markGuidanceStale, queryClient, useClock, useRuntime, useSnapshot } from '../src/runtime/Runtime';
import { isFresh, levelStyle, responseUsable, routePoints, utteranceKey } from '../src/core/presentation';
import { useTts } from '../src/platform/useTts';
import { newId } from '../src/platform/storage';

export default function EmergencyScreen() {
  const params = useLocalSearchParams<{ responseId?: string; alertId?: string }>();
  const alertId = typeof params.alertId === 'string' ? params.alertId : '';
  const official = useQuery({ queryKey: keys.alert(alertId), queryFn: ({ signal }) => api.alert(alertId, signal), enabled: !!alertId });
  const responseId = typeof params.responseId === 'string' ? params.responseId : official.data?.data.response_id ?? '';
  const response = useSnapshot(responseId);
  const config = useQuery({ queryKey: keys.config, queryFn: () => api.config() });
  const turn = useQuery({ queryKey: keys.turn(responseId), queryFn: async () => queryClient.getQueryData<Envelope<Schema<'VoiceTurn'>>>(keys.turn(responseId)) ?? null, enabled: false });
  const runtime = useRuntime();
  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const now = useClock();
  const snapshot = response.data?.data;
  const sourceAlert = official.data?.data ?? snapshot?.official_alert;
  const officialEnded = !!sourceAlert && (['cancelled', 'expired'].includes(sourceAlert.status) || (sourceAlert.valid_until !== null && !isFresh(sourceAlert.valid_until, now)));
  const current = responseUsable(response.data, now) && runtime.status === 'connected' && !officialEnded;
  const route = useQuery({ queryKey: keys.route(responseId, snapshot?.revision ?? 0), queryFn: ({ signal }) => api.route(responseId, snapshot!.revision, signal), enabled: current && (isMock || settings.route2d) && snapshot?.route_availability.status === 'available' });
  const points = current ? routePoints(route.data, response.data, now) : [];
  const latestTurn = turn.data?.data;
  const utterance = latestTurn?.status === 'ready' && latestTurn.response_revision === snapshot?.revision && isFresh(latestTurn.expires_at, now) ? latestTurn.utterance : snapshot?.assistant_utterance;
  const tts = useTts(utterance, snapshot && utterance ? utteranceKey(snapshot, utterance) : '', current && runtime.foreground && focused);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [stairs, setStairs] = useState<Schema<'ContextWrite'>['overrides']['stairs']>(null);
  const [alone, setAlone] = useState<'yes' | 'no' | 'unknown'>('unknown');
  const appearance = levelStyle[snapshot?.personal_response.level ?? 'unknown'];
  async function act(fn: () => Promise<void>) { setBusy(true); setMessage(''); try { await fn(); } catch { setMessage('처리하지 못했습니다. 최신 정보를 다시 확인해 주세요.'); } finally { setBusy(false); } }
  async function saveContext() {
    if (!snapshot) return;
    const saved = await api.context(responseId, { base_revision: snapshot.context.revision, observed_at: new Date().toISOString(), confirmation: 'user_confirmed', overrides: { mobility: null, stairs, alone_now: alone } });
    markGuidanceStale({ context: saved.data.context_revision }, responseId);
    setMessage(`상태를 저장했습니다. 새 안내를 확인 중입니다. (${saved.data.context_revision})`);
    await runtime.refreshResponse(responseId);
  }
  return <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
    <Screen>
      <Card title={sourceAlert?.title ?? '공식 재난 정보 확인 중'}>
        <Body>공식 등급: {sourceAlert?.official_severity.label ?? '등급 정보 없음'}</Body>
        <Body>{sourceAlert?.original_text ?? '공식 안내를 불러오고 있습니다.'}</Body>
        {sourceAlert && <Body muted>상태: {sourceAlert.status} · 출처: {sourceAlert.source.agency}</Body>}
      </Card>
      <View accessibilityLiveRegion="polite" style={{ backgroundColor: appearance.color, borderRadius: 16, padding: 20, gap: 8 }}>
        <Text style={{ color: 'white', fontSize: 15 }}>나의 대응 단계{current ? '' : ' · 최신 정보 확인 필요'}</Text>
        <Text style={{ color: 'white', fontSize: 26, fontWeight: '800' }}>{snapshot?.personal_response.label ?? '확인 중'}</Text>
      </View>
      {snapshot && <>
        <DisasterMap location={snapshot.location.status === 'available' && isFresh(snapshot.location.valid_until, now) ? snapshot.location.fix : null} area={snapshot.affected_area} route={points} simulation={response.data?.meta.mode === 'simulation'}/>
        <Body muted>{snapshot.relevance.summary}</Body>
        <Card>
          <Text accessibilityLabel={tts.speaking ? '음성 재생 중' : '음성 대기'} style={{ textAlign: 'center', color: palette.primary, fontSize: 24 }}>{tts.speaking ? '▂ ▅ ▇ ▃ ▆ ▂' : '─ ─ ─'}</Text>
          <Body>{current ? utterance?.text ?? '추가 안내를 기다리고 있습니다.' : '최신 안내를 확인하고 있습니다. 위의 공식 정보를 함께 확인하세요.'}</Body>
          <Button secondary title={tts.enabled ? '음성 읽기 끄기' : '이 화면 음성 읽기 켜기'} onPress={() => tts.setEnabled(!tts.enabled)}/>
          {!!tts.error && <Body muted>{tts.error}</Body>}
          {config.data?.data.features.voice_turns.enabled && <>
            <TextInput accessibilityLabel="서버에 전달할 현재 상황" placeholder="현재 상황을 입력하세요" multiline value={text} onChangeText={setText} style={styles.input}/>
            <Button title="상황 전달" disabled={!current || !text.trim() || busy} onPress={() => void act(async () => { await runtime.sendText(responseId, text.trim()); setText(''); setMessage('전달했습니다. 서버의 답변을 기다립니다.'); })}/>
          </>}
        </Card>
        <Card title="현재 상태">
          {snapshot.context.tags.map((tag) => <Body key={tag.code}>{tag.label}</Body>)}
          <Body muted>직접 확인한 항목을 선택하고 저장해 주세요.</Body>
          <Button secondary title={stairs === 'difficult' ? '계단 이용 어려움 선택됨' : '계단 이용 어려움'} onPress={() => setStairs(stairs === 'difficult' ? null : 'difficult')}/>
          <Button secondary title={alone === 'yes' ? '현재 혼자 있음 선택됨' : '현재 혼자 있음'} onPress={() => setAlone(alone === 'yes' ? 'unknown' : 'yes')}/>
          <Button title="확인한 상태 저장" disabled={busy || !current} onPress={() => void act(saveContext)}/>
        </Card>
        <Card title="맞춤 행동요령">
          {current ? snapshot.actions.map((item) => <Body key={item.id}>{item.order}. {item.text}</Body>) : <Body>새 정보를 확인한 뒤 행동요령을 갱신합니다.</Body>}
        </Card>
        <Card title="2D 경로 안내">
          {points.length ? route.data?.data.route?.instructions.map((item) => <Body key={item.id}>{item.order}. {item.text}</Body>) : <Body>현재 확인된 경로가 없습니다. 공식 안내를 확인해 주세요.</Body>}
          {!!points.length && <Body muted>경로 확인 시각: {route.data?.data.route?.checked_at}</Body>}
        </Card>
      </>}
      {!!message && <Body>{message}</Body>}
      {response.isError && <Button title="안내 다시 확인" onPress={() => { runtime.restart(); void response.refetch(); }}/ >}
      {isMock && <Card title="모의 서버 이벤트"><View style={styles.row}>{(['attention', 'prepare', 'act', 'request_assistance'] as Level[]).map((level) => <Button key={level} title={levelStyle[level].name} secondary onPress={() => mockServer.setLevel(level)}/>)}</View></Card>}
    </Screen>
    <View style={{ padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: palette.line, flexDirection: 'row', gap: 12 }}>
      <View style={{ flex: 1 }}><Button secondary title="기본 수칙" onPress={() => router.push({ pathname: '/rules', params: { disasterType: snapshot?.disaster_type ?? sourceAlert?.disaster_type ?? 'other' } })}/></View>
      <View style={{ flex: 1 }}><Button title="119 신고 안내" onPress={() => Alert.alert('119 신고', isMock ? '시연 모드에서는 전화나 문자를 보내지 않습니다.' : '현재 틀은 신고 연결 전입니다. 긴급 시 기기의 전화 앱에서 119로 직접 연락해 주세요.')}/></View>
    </View>
  </SafeAreaView>;
}
