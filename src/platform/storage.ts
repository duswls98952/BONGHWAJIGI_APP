import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
const memory = new Map<string, string>();
export const secure = {
  get: (key: string) => Platform.OS === 'web' ? Promise.resolve(memory.get(key) ?? null) : SecureStore.getItemAsync(key),
  set: async (key: string, value: string) => { if (Platform.OS === 'web') memory.set(key, value); else await SecureStore.setItemAsync(key, value); },
  remove: async (key: string) => { if (Platform.OS === 'web') memory.delete(key); else await SecureStore.deleteItemAsync(key); },
};
// The real authentication provider must write this key after login. Never use EXPO_PUBLIC_* for tokens.
export const getAccessToken = () => secure.get('access_token');
export const newId = () => Crypto.randomUUID();
export async function installationId() {
  const stored = await secure.get('installation_id');
  if (stored) return stored;
  const value = newId(); await secure.set('installation_id', value); return value;
}
