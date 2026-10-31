import type { Envelope, GeoPoint, Level, ResponseSnapshot, Schema } from '../api/types';

// Colors describe the server's code; they never calculate or rank danger.
export const levelStyle: Record<Level, { color: string; name: string }> = {
  information: { color: '#166B54', name: '정보 안내' },
  attention: { color: '#85620D', name: '주의' },
  prepare: { color: '#A64D15', name: '대응 준비' },
  act: { color: '#BA303A', name: '행동 필요' },
  request_assistance: { color: '#6F358E', name: '도움 요청 필요' },
  unknown: { color: '#586776', name: '확인 중' },
};

export function isFresh(expires: string | null | undefined, now = Date.now()) {
  return typeof expires === 'string' && Number.isFinite(Date.parse(expires)) && Date.parse(expires) > now;
}
export function responseUsable(value: Envelope<ResponseSnapshot> | undefined, now = Date.now()) {
  return !!value && value.meta.data_status === 'current' && value.data.status === 'active' && isFresh(value.data.valid_until, now);
}
export function acceptRevision<T extends { id: string; revision: number }>(old: Envelope<T> | undefined, next: Envelope<T>) {
  return old?.data.id === next.data.id && old.data.revision >= next.data.revision ? old : next;
}
export function toPoint(position: readonly number[]): GeoPoint {
  const [longitude, latitude] = position;
  if (longitude === undefined || latitude === undefined || !Number.isFinite(longitude) || !Number.isFinite(latitude) || Math.abs(longitude) > 180 || Math.abs(latitude) > 90) {
    throw new Error('좌표 형식이 올바르지 않습니다.');
  }
  return { latitude, longitude };
}
export function naverRing(ring: readonly (readonly number[])[], clockwise = true): GeoPoint[] {
  const points = ring.map(toPoint);
  if (points.length < 4) throw new Error('닫힌 다각형이 필요합니다.');
  const first = points[0]!;
  const last = points.at(-1)!;
  if (first.latitude !== last.latitude || first.longitude !== last.longitude) throw new Error('닫히지 않은 다각형입니다.');
  points.pop();
  const area = points.reduce((sum, p, i) => { const q = points[(i + 1) % points.length]!; return sum + p.longitude * q.latitude - q.longitude * p.latitude; }, 0);
  if (area === 0) throw new Error('면적이 없는 다각형입니다.');
  return (area < 0) === clockwise ? points : points.reverse();
}
export function routePoints(route: Envelope<Schema<'Route'>> | undefined, response: Envelope<ResponseSnapshot> | undefined, now = Date.now()): GeoPoint[] {
  if (!responseUsable(response, now) || !response || route?.meta.data_status !== 'current') return [];
  const snapshot = response.data;
  const data = route.data;
  if (snapshot.route_availability.status !== 'available' || !isFresh(snapshot.route_availability.expires_at, now) || data.status !== 'available' || !data.route) return [];
  if (data.response_revision !== snapshot.revision || data.route.response_revision !== snapshot.revision || !isFresh(data.route.valid_until, now)) return [];
  if (snapshot.location.status !== 'available' || !snapshot.location.fix || !isFresh(snapshot.location.valid_until, now)) return [];
  if (data.route.geometry.type !== 'LineString' || data.route.geometry.coordinates.length < 2) return [];
  try { return data.route.geometry.coordinates.map(toPoint); } catch { return []; }
}
export function utteranceKey(response: ResponseSnapshot, utterance: Schema<'Utterance'>) {
  return `${response.id}:${response.revision}:${utterance.id}`;
}
export function canUseVoiceTurn(turn: Schema<'VoiceTurn'>, response: ResponseSnapshot, latestClientTurn: string, now = Date.now()) {
  return turn.status === 'ready' && turn.client_turn_id === latestClientTurn && turn.response_revision === response.revision && !!turn.utterance && isFresh(turn.expires_at, now);
}
