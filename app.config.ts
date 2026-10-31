import type { ExpoConfig } from 'expo/config';

const backgroundLocation = process.env.EXPO_PUBLIC_ENABLE_BACKGROUND_LOCATION === 'true';
const clientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;
const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

const config: ExpoConfig = {
  name: '봉화지기',
  slug: 'bonghwajigi-app',
  version: '0.1.0',
  scheme: 'bonghwajigi',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
  ios: { bundleIdentifier: 'com.bonghwajigi.app', supportsTablet: false },
  android: {
    package: 'com.bonghwajigi.app',
    ...(process.env.GOOGLE_SERVICES_JSON ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON } : {}),
  },
  web: { bundler: 'metro', output: 'single', favicon: './assets/favicon.png' },
  extra: projectId ? { eas: { projectId } } : {},
  plugins: [
    'expo-router',
    'expo-secure-store',
    ['expo-notifications', { defaultChannel: 'disaster-alerts' }],
    ['expo-location', {
      locationWhenInUsePermission: '내 위치와 관련된 재난 정보와 경로를 표시합니다.',
      locationAlwaysAndWhenInUsePermission: '동의한 대피 중 위치 공유를 화면이 꺼져도 이어갑니다.',
      isIosBackgroundLocationEnabled: backgroundLocation,
      isAndroidBackgroundLocationEnabled: backgroundLocation,
      isAndroidForegroundServiceEnabled: backgroundLocation,
    }],
    ['expo-build-properties', { android: { extraMavenRepos: ['https://repository.map.naver.com/archive/maven'] } }],
    ...(clientId ? [['@mj-studio/react-native-naver-map', { client_id: clientId }] as [string, { client_id: string }]] : []),
  ],
};
export default config;
