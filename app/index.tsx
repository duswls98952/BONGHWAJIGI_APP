import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api, mockServer } from '../src/api';
import { Screen, Card, Body, Button, styles } from '../src/components/ui';
import DisasterMap from '../src/components/DisasterMap';
import { isMock, keys, useRuntime, useClock } from '../src/runtime/Runtime';
import { isFresh, levelStyle } from '../src/core/presentation';
import type { Level } from '../src/api/types';
export default function HomeScreen() {
  const home = useQuery({ queryKey: keys.home, queryFn: ({ signal }) => api.home(signal) });
  const { restart } = useRuntime();
  const [demoLevel, setDemoLevel] = useState(0);
  const now = useClock();
  const data = home.data?.data;
  const location = data?.location.status === 'available' && isFresh(data.location.valid_until, now) ? data.location.fix : null;
  return <Screen>
    <Text style={styles.title}>오늘도, 안전하게</Text>
    <Body muted>주변 소식과 나에게 필요한 안내를 확인하세요.</Body>
    <Button title="나의 대피 정보 설정" secondary onPress={() => router.push('/profile')}/>
    {home.isPending && <Card><Body>주변 정보를 불러오고 있습니다.</Body></Card>}
    {home.isError && <Card><Body>정보를 불러오지 못했습니다. 연결과 로그인을 확인해 주세요.</Body><Button title="다시 확인" onPress={() => { restart(); void home.refetch(); }}/></Card>}
    {data && <>
      <DisasterMap location={location} simulation={home.data?.meta.mode === 'simulation'}/>
      <Card title="오늘의 안전 행동요령">
        {!data.today_rules.items.length && <Body>현재 제공되는 안내가 없습니다.</Body>}
        {data.today_rules.items.map((item) => <Body key={item.id}>{item.text}</Body>)}
      </Card>
      {data.active_alert_ids.map((alertId) => <Button key={alertId} title="현재 재난 안내 확인" onPress={() => router.push({ pathname: '/emergency', params: { alertId } })}/>)}
      <Card title="최근 주변 재난 정보">
        {data.feed.data_status !== 'current' && <Body muted>자료가 지연되거나 일부만 제공되고 있습니다.</Body>}
        {!data.feed.items.length && <Body>조회 조건에 맞는 정보가 없습니다.</Body>}
        {data.feed.items.map((item) => <Card key={item.id}><Body>{item.status === 'past' ? '과거 기록' : '진행 상황'} · {item.region_label}</Body><Body>{item.display_title}</Body><Body muted>{item.summary}</Body></Card>)}
      </Card>
    </>}
    {isMock && <Card title="개발 시연">
      <Body muted>모의 서버의 대응 레벨과 안내 문장을 바꿉니다. 긴급 화면을 열어 실시간 반영을 확인할 수 있습니다.</Body>
      <Button title="다음 대응 레벨 보내기" onPress={() => { const levels = Object.keys(levelStyle) as Level[]; mockServer.setLevel(levels[demoLevel % levels.length]!); setDemoLevel((v) => v + 1); }}/>
    </Card>}
  </Screen>;
}
