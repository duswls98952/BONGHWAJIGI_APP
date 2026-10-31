import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
export const palette = { ink: '#18332E', muted: '#5C716C', primary: '#146F5B', paper: '#F1F6F3', line: '#D8E3DD', red: '#BA303A' };
export function Screen({ children }: React.PropsWithChildren) { return <ScrollView contentContainerStyle={styles.screen}>{children}</ScrollView>; }
export function Card({ title, children }: React.PropsWithChildren<{ title?: string }>) { return <View style={styles.card}>{title && <Text accessibilityRole="header" style={styles.cardTitle}>{title}</Text>}{children}</View>; }
export function Body({ children, muted = false }: React.PropsWithChildren<{ muted?: boolean }>) { return <Text style={[styles.body, muted && { color: palette.muted }]}>{children}</Text>; }
export function Button({ title, onPress, disabled = false, secondary = false }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.button, secondary && { backgroundColor: '#E1EDE6' }, (disabled || pressed) && { opacity: 0.55 }]}><Text style={[styles.buttonText, secondary && { color: palette.ink }]}>{title}</Text></Pressable>;
}
export const styles = StyleSheet.create({
  screen: { padding: 20, gap: 16, paddingBottom: 36, maxWidth: 720, width: '100%', alignSelf: 'center' },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 18, gap: 12, borderWidth: 1, borderColor: palette.line },
  cardTitle: { fontSize: 20, fontWeight: '700', color: palette.ink },
  body: { fontSize: 17, lineHeight: 26, color: palette.ink },
  title: { fontSize: 29, fontWeight: '800', color: palette.ink },
  button: { minHeight: 50, borderRadius: 12, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  buttonText: { color: 'white', fontSize: 17, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: palette.line, backgroundColor: '#FAFCFA', borderRadius: 10, padding: 12, fontSize: 17, color: palette.ink, minHeight: 50 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
});
