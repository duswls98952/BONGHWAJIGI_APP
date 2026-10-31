import { View, Text } from 'react-native';
import Svg, { Polyline, Polygon, Circle } from 'react-native-svg';
import type { GeoPoint, Schema } from '../api/types';
export type MapProps = { location?: GeoPoint | null; area?: Schema<'AreaGeometry'> | null; route?: GeoPoint[]; simulation?: boolean };
export default function MapPreview({ route = [], location }: MapProps) {
  // An explicitly labelled illustration, never presented as a road map.
  return <View style={{ backgroundColor: '#E6EFEB', borderRadius: 14, overflow: 'hidden', padding: 12 }}>
    <Text style={{ color: '#365A4B', fontSize: 15 }}>지도 연결 전 도식 · 실제 도로/대피로가 아닙니다</Text>
    <Svg height={170} viewBox="0 0 320 170">
      <Polygon points="30,20 150,20 150,100 30,100" fill="#E9B7B7" opacity={0.6}/>
      {route.length > 1 && <Polyline points="160,130 200,110 245,65" fill="none" stroke="#17715D" strokeWidth={5}/>}
      {location && <Circle cx={160} cy={130} r={7} fill="#245A9E"/>}
    </Svg>
    <Text style={{ color: '#365A4B', fontSize: 14 }}>실제 지도는 네이버 지도 키와 개발용 앱 빌드에서 확인합니다.</Text>
  </View>;
}
