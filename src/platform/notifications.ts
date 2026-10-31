import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { api } from '../api';
import { settings } from '../config';
import { installationId } from './storage';
import { parsePush } from '../core/validation';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
export async function registerPush() {
  if (Platform.OS === 'web' || settings.mode === 'mock') throw new Error('푸시는 실제 Android/iOS 개발용 빌드에서 검증합니다.');
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('disaster-alerts', { name: '재난 안내', importance: Notifications.AndroidImportance.HIGH, sound: 'default' });
  const permissions = await Notifications.requestPermissionsAsync();
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const granted = permissions.granted;
  // Native token, not an ExpoPushToken. This matches the existing backend contract.
  const token = granted ? await Notifications.getDevicePushTokenAsync() : null;
  await api.device(await installationId(), { platform, push_provider: platform === 'ios' ? 'apns' : 'fcm', push_token: token ? String(token.data) : null, notification_permission: granted ? 'granted' : 'denied', app_version: '0.1.0' });
  if (!granted) throw new Error('알림 권한이 허용되지 않았습니다.');
}
export { Notifications, parsePush };
