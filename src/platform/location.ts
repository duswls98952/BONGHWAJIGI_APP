import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { api } from '../api';
import { settings } from '../config';
import { installationId, newId, secure } from './storage';
export const LOCATION_TASK = 'bonghwajigi-evacuation-location';

async function sendFix(location: Location.LocationObject) {
  if (location.coords.accuracy === null || location.coords.accuracy < 0) throw new Error('위치 정확도를 확인할 수 없습니다.');
  return api.location({ fix_id: newId(), installation_id: await installationId(), latitude: location.coords.latitude, longitude: location.coords.longitude, accuracy_m: location.coords.accuracy, captured_at: new Date(location.timestamp).toISOString() });
}
// Must be defined at module scope. No React state or persistent socket is used here.
if (Platform.OS !== 'web' && !TaskManager.isTaskDefined(LOCATION_TASK)) {
  TaskManager.defineTask<{ locations: Location.LocationObject[] }>(LOCATION_TASK, async ({ data, error }) => {
    if (error || settings.mode !== 'live' || await secure.get('background_location_consent') !== 'yes') return;
    const last = data?.locations.at(-1);
    if (!last) return;
    try { await sendFix(last); await secure.set('background_location_last_success', new Date().toISOString()); }
    catch { await secure.set('background_location_last_error', new Date().toISOString()); }
  });
}
export async function shareCurrentLocation() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') throw new Error('위치 권한이 필요합니다. 권한 없이도 공식 안내를 볼 수 있습니다.');
  return sendFix(await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }));
}
export async function startBackgroundLocation() {
  if (!settings.backgroundLocation || Platform.OS === 'web' || settings.mode === 'mock') throw new Error('백그라운드 위치는 실제 앱 개발용 빌드와 서버 연결 후 검증합니다.');
  if ((await Location.requestForegroundPermissionsAsync()).status !== 'granted') throw new Error('위치 권한이 필요합니다.');
  if ((await Location.requestBackgroundPermissionsAsync()).status !== 'granted') throw new Error('항상 위치 접근 권한이 허용되지 않았습니다.');
  await secure.set('background_location_consent', 'yes');
  try {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.High, distanceInterval: 20, timeInterval: 15_000,
      showsBackgroundLocationIndicator: true,
      foregroundService: { notificationTitle: '봉화지기 위치 공유 중', notificationBody: '대피 중 위치를 공유합니다. 앱에서 언제든 중지할 수 있습니다.' },
    });
  } catch (e) { await secure.remove('background_location_consent'); throw e; }
}
export async function stopBackgroundLocation() {
  await secure.remove('background_location_consent');
  if (Platform.OS !== 'web' && await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
}
