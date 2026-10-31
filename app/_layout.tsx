import '../src/platform/location';
import { useEffect, useRef } from 'react';
import { Platform, Text, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProviders, isMock, useRuntime } from '../src/runtime/Runtime';
import { Notifications, parsePush } from '../src/platform/notifications';
import { palette } from '../src/components/ui';
import { secure } from '../src/platform/storage';

function Shell() {
  const { status, restart } = useRuntime();
  const handled = useRef(new Set<string>());
  useEffect(() => {
    if (Platform.OS === 'web' || isMock) return;
    const handle = async (notification: Notifications.Notification, opened: boolean) => {
      const payload = parsePush(notification.request.content.data);
      if (!payload || payload.mode !== 'live') return;
      restart();
      if (!opened || handled.current.has(payload.event_id) || await secure.get('last_opened_push') === payload.event_id) return;
      handled.current.add(payload.event_id);
      await secure.set('last_opened_push', payload.event_id);
      if (payload.alert_id || payload.response_id) router.push({ pathname: '/emergency', params: { ...(payload.alert_id ? { alertId: payload.alert_id } : {}), ...(payload.response_id ? { responseId: payload.response_id } : {}) } });
    };
    const received = Notifications.addNotificationReceivedListener((n) => void handle(n, false));
    const opened = Notifications.addNotificationResponseReceivedListener((r) => void handle(r.notification, true));
    void Notifications.getLastNotificationResponseAsync().then((r) => { if (r) void handle(r.notification, true); });
    return () => { received.remove(); opened.remove(); };
  }, []);
  const statusText = { connecting: '정보를 연결하고 있습니다', connected: '최신 정보 연결됨', reconnecting: '연결을 다시 확인 중 · 마지막 정보일 수 있습니다', authentication_required: '서버 로그인 연결이 필요합니다', background: '백그라운드' }[status];
  return <>
    <StatusBar style="dark"/>
    <View style={{ backgroundColor: isMock ? '#FFF1D4' : '#E2EFE8', padding: 9 }}><Text style={{ color: palette.ink, textAlign: 'center', fontSize: 13 }}>{isMock ? '시연 모드 · 실제 재난 정보가 아닙니다 · ' : ''}{statusText}</Text></View>
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#FAFCFA' }, headerTintColor: palette.ink, contentStyle: { backgroundColor: palette.paper } }}>
      <Stack.Screen name="index" options={{ title: '봉화지기' }}/>
      <Stack.Screen name="emergency" options={{ title: '재난 대응' }}/>
      <Stack.Screen name="profile" options={{ title: '나의 대피 정보' }}/>
      <Stack.Screen name="rules" options={{ title: '기본 행동수칙' }}/>
    </Stack>
  </>;
}
export default function RootLayout() { return <SafeAreaProvider><AppProviders><Shell/></AppProviders></SafeAreaProvider>; }
