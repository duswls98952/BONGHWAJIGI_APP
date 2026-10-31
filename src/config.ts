export const settings = {
  mode: process.env.EXPO_PUBLIC_API_MODE === 'live' ? 'live' : 'mock',
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  naverClientId: process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ?? '',
  route2d: process.env.EXPO_PUBLIC_ROUTE_2D_CONTRACT_ENABLED === 'true',
  backgroundLocation: process.env.EXPO_PUBLIC_ENABLE_BACKGROUND_LOCATION === 'true',
} as const;
