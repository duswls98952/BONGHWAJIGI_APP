import { Text, View } from 'react-native';
import Constants from 'expo-constants';
import { settings } from '../config';
import MapPreview, { type MapProps } from './MapPreview';
import { naverRing } from '../core/presentation';

export default function DisasterMap(props: MapProps) {
  if (!settings.naverClientId || Constants.executionEnvironment === 'storeClient') return <MapPreview {...props}/>;
  // Load only in a custom native build; Expo Go must remain usable for screen work.
  const { NaverMapView, NaverMapMarkerOverlay, NaverMapPathOverlay, NaverMapPolygonOverlay } = require('@mj-studio/react-native-naver-map') as typeof import('@mj-studio/react-native-naver-map');
  const center = props.location ?? props.route?.[0] ?? { latitude: 37.5665, longitude: 126.978 };
  const polygons = props.area?.type === 'Polygon' ? [props.area.coordinates] : props.area?.coordinates ?? [];
  return <View style={{ borderRadius: 14, overflow: 'hidden' }}>
    {props.simulation && <Text style={{ padding: 8, backgroundColor: '#FFF1D4' }}>시연 좌표 · 실제 대피 경로가 아닙니다</Text>}
    <NaverMapView style={{ height: 270 }} initialCamera={{ ...center, zoom: 15, tilt: 0 }} isTiltGesturesEnabled={false}>
      {props.location && <NaverMapMarkerOverlay {...props.location} caption={{ text: '내 위치' }}/>}
      {polygons.map((rings, i) => { try { const outline = rings[0] && naverRing(rings[0]); return outline ? <NaverMapPolygonOverlay key={i} coords={outline} holes={rings.slice(1).map((ring) => naverRing(ring, false))} color="#D3454540" outlineColor="#B83232"/> : null; } catch { return null; } })}
      {!!props.route && props.route.length > 1 && <NaverMapPathOverlay coords={props.route} width={7} color="#146F5B"/>}
    </NaverMapView>
  </View>;
}
