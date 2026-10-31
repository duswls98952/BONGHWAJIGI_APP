import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../src/api';
import type { Schema } from '../src/api/types';
import { Screen, Card, Body, Button } from '../src/components/ui';
import { keys, markGuidanceStale, queryClient, useRuntime } from '../src/runtime/Runtime';
import { shareCurrentLocation, startBackgroundLocation, stopBackgroundLocation } from '../src/platform/location';
import { registerPush } from '../src/platform/notifications';
export default function ProfileScreen() {
  const profile = useQuery({ queryKey: keys.profile, queryFn: api.profile });
  const runtime = useRuntime();
  const [draft, setDraft] = useState<Schema<'ProfileInput'>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (profile.data) setDraft(profile.data.data.profile); }, [profile.data?.data.revision]);
  async function perform(fn: () => Promise<unknown>) { setBusy(true); try { await fn(); setMessage('요청을 처리했습니다.'); runtime.restart(); } catch (e) { setMessage(e instanceof Error ? e.message : '처리하지 못했습니다.'); } finally { setBusy(false); } }
  return <Screen>
    <Card title="평소 이동 상태">
      <Body>재난 중 확인한 현재 상태와 별도로 저장합니다.</Body>
      <Button secondary title={draft.mobility === 'independent' ? '독립 보행 선택됨' : '혼자 걸을 수 있어요'} onPress={() => setDraft({ ...draft, mobility: 'independent' })}/>
      <Button secondary title={draft.mobility === 'assistance_required' ? '이동 도움 필요 선택됨' : '이동에 도움이 필요해요'} onPress={() => setDraft({ ...draft, mobility: 'assistance_required' })}/>
      <Button secondary title={draft.stairs === 'difficult' ? '계단 이용 어려움 선택됨' : '계단 이용이 어려워요'} onPress={() => setDraft({ ...draft, stairs: draft.stairs === 'difficult' ? 'unknown' : 'difficult' })}/>
      <Button title="저장" disabled={busy || !profile.data} onPress={() => void perform(async () => { const value = await api.saveProfile({ base_revision: profile.data!.data.revision, profile: draft }); queryClient.setQueryData(keys.profile, value); markGuidanceStale({ profile: value.data.revision }); await queryClient.invalidateQueries({ queryKey: ['response'] }); })}/>
      {profile.isError && <Button title="프로필 다시 불러오기" onPress={() => void profile.refetch()}/ >}
    </Card>
    <Card title="위치와 알림">
      <Button title="현재 위치 공유" disabled={busy} onPress={() => void perform(async () => { const value = await shareCurrentLocation(); markGuidanceStale({ location: value.data.revision }); })}/>
      <Button title="재난 알림 허용" disabled={busy} onPress={() => void perform(registerPush)}/>
      <Body muted>대피 중 위치 공유를 켜면 앱이 화면 뒤에 있어도 위치를 전달하도록 요청합니다. 기기 설정과 절전 상태에 따라 중단될 수 있습니다.</Body>
      <Button secondary title="동의하고 대피 중 위치 공유 시작" disabled={busy} onPress={() => void perform(startBackgroundLocation)}/>
      <Button secondary title="대피 중 위치 공유 중지" disabled={busy} onPress={() => void perform(stopBackgroundLocation)}/>
    </Card>
    {!!message && <Body>{message}</Body>}
  </Screen>;
}
