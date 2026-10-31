import {useEffect,useMemo,useRef,useState} from 'react';
import {ActivityIndicator,Text,View} from 'react-native';
import Constants from 'expo-constants';
import type {NaverMapViewRef} from '@mj-studio/react-native-naver-map';
import {settings} from '../config';
import MapDiagram from './MapDiagram';
import {mapGeometry,type MvpMapProps} from './mapGeometry';
import {Body,Button,colors} from './ui';

function ConnectedMap({location,bounds,simulation=false}:MvpMapProps){
  // Keep Expo Go and web previews independent of native SDK availability.
  const {NaverMapView,NaverMapMarkerOverlay,NaverMapCircleOverlay,NaverMapPolygonOverlay}=require('@mj-studio/react-native-naver-map') as typeof import('@mj-studio/react-native-naver-map');
  const map=useRef<NaverMapViewRef>(null);
  const [attempt,setAttempt]=useState(0),[initialized,setInitialized]=useState(false),[slow,setSlow]=useState(false);
  const geometry=useMemo(()=>mapGeometry(location,bounds),[location?.latitude,location?.longitude,location?.accuracy_m,bounds?.west,bounds?.east,bounds?.south,bounds?.north]);
  useEffect(()=>{
    setInitialized(false);setSlow(false);
    const timeout=setTimeout(()=>setSlow(true),12000);
    return()=>clearTimeout(timeout);
  },[attempt]);
  useEffect(()=>{
    if(initialized)map.current?.animateRegionTo({...geometry.region,duration:350});
  },[geometry,initialized]);
  return <View style={{borderRadius:17,overflow:'hidden',backgroundColor:'#ecf0ee',borderWidth:1,borderColor:'#d3dadd'}}>
    <NaverMapView key={attempt} ref={map} style={{height:270}} initialRegion={geometry.region}
      mapType="Basic" buildingHeight={0} isTiltGesturesEnabled={false} isRotateGesturesEnabled={false}
      isShowLocationButton={false} isShowZoomControls isShowScaleBar isShowCompass={false}
      logoAlign="BottomLeft" logoMargin={{left:12,bottom:12}} mapPadding={{left:20,right:20,top:24,bottom:24}}
      onInitialized={()=>{setInitialized(true);console.info('[map] native view initialized');}}>
      {geometry.bounds&&<NaverMapPolygonOverlay coords={geometry.polygon} color="#c8514930" outlineColor="#b85c56" outlineWidth={2}/>}
      {geometry.location&&<>
        <NaverMapCircleOverlay latitude={geometry.location.latitude} longitude={geometry.location.longitude} radius={geometry.location.accuracy_m} color="#2670c520" outlineColor="#2670c580" outlineWidth={1}/>
        <NaverMapMarkerOverlay latitude={geometry.location.latitude} longitude={geometry.location.longitude} caption={{text:'공유한 위치',color:'#174a79',haloColor:'#ffffff'}} tintColor="#2670c5"/>
      </>}
    </NaverMapView>
    <View style={{padding:12,gap:7,backgroundColor:'#f6f8f7'}}>
      <Text style={{color:colors.ink,fontSize:14,fontWeight:'700'}}>네이버 지도{simulation?' · 시연 정보 표시':''}</Text>
      {!initialized&&<View style={{flexDirection:'row',gap:8,alignItems:'center'}}><ActivityIndicator/><Body small>{slow?'지도 준비가 지연되고 있어요. 연결 상태를 확인해 주세요.':'지도를 준비하고 있어요…'}</Body></View>}
      {geometry.location?<Body small>공유한 좌표 {geometry.location.latitude.toFixed(4)}, {geometry.location.longitude.toFixed(4)} · 정확도 반경 {Math.round(geometry.location.accuracy_m)}m</Body>:<Body small muted>{geometry.bounds?'재난 관련 지역을 보고 있어요. 현재 위치는 미확인입니다.':'전국 지도 · 현재 위치 미확인. 내정보에서 위치를 공유하면 주변을 표시해요.'}</Body>}
      {geometry.bounds&&<Body small muted>붉은 영역은 수집 자료의 관련 지역 범위예요. 실제 화선·안전 구역·대피 경로를 뜻하지 않아요.</Body>}
      <Body small muted>지도가 보이지 않으면 연결 상태를 확인하고 다시 불러와 주세요.</Body>
      <Button secondary title="지도 다시 불러오기" onPress={()=>setAttempt(old=>old+1)}/>
    </View>
  </View>;
}
export default function MvpMap(props:MvpMapProps){
  if(!settings.naverClientId||Constants.executionEnvironment==='storeClient')return <MapDiagram {...props}/>;
  return <ConnectedMap {...props}/>;
}
