import {useEffect,useMemo,useRef,useState} from 'react';
import {ActivityIndicator,View} from 'react-native';
import Constants from 'expo-constants';
import type {NaverMapViewRef} from '@mj-studio/react-native-naver-map';
import {settings} from '../config';
import MapDiagram from './MapDiagram';
import {mapGeometry,type MvpMapProps} from './mapGeometry';
import {Body,Button} from './ui';

function ConnectedMap({location,bounds,height=184,route=[],destinationLabel}:MvpMapProps){
  // Keep Expo Go and web previews independent of native SDK availability.
  const {NaverMapView,NaverMapMarkerOverlay,NaverMapCircleOverlay,NaverMapPolygonOverlay,NaverMapPolylineOverlay}=require('@mj-studio/react-native-naver-map') as typeof import('@mj-studio/react-native-naver-map');
  const map=useRef<NaverMapViewRef>(null);
  const [attempt,setAttempt]=useState(0),[initialized,setInitialized]=useState(false),[slow,setSlow]=useState(false);
  const routeKey=JSON.stringify(route);
  const geometry=useMemo(()=>mapGeometry(location,bounds,route),[location?.latitude,location?.longitude,location?.accuracy_m,bounds?.west,bounds?.east,bounds?.south,bounds?.north,routeKey]);
  useEffect(()=>{
    setInitialized(false);setSlow(false);
    const timeout=setTimeout(()=>setSlow(true),12000);
    return()=>clearTimeout(timeout);
  },[attempt]);
  useEffect(()=>{
    if(initialized)map.current?.animateRegionTo({...geometry.region,duration:350});
  },[geometry,initialized]);
  return <View style={{borderRadius:17,overflow:'hidden',backgroundColor:'#ecf0ee',borderWidth:1,borderColor:'#d3dadd'}}>
    <NaverMapView key={attempt} ref={map} style={{height}} initialRegion={geometry.region}
      mapType="Basic" buildingHeight={0} isTiltGesturesEnabled={false} isRotateGesturesEnabled={false}
      isShowLocationButton={false} isShowZoomControls isShowScaleBar isShowCompass={false}
      logoAlign="BottomLeft" logoMargin={{left:12,bottom:12}} mapPadding={{left:20,right:20,top:24,bottom:24}}
      onInitialized={()=>{setInitialized(true);console.info('[map] native view initialized');}}>
      {geometry.bounds&&<NaverMapPolygonOverlay coords={geometry.polygon} color="#c8514930" outlineColor="#b85c56" outlineWidth={2}/>}
      {!!geometry.route.length&&<NaverMapPolylineOverlay coords={geometry.route} color="#245c74" width={6}/>}
      {!!geometry.route.length&&<NaverMapMarkerOverlay {...geometry.route[geometry.route.length-1]!} caption={{text:destinationLabel??'도착점',color:'#003764',haloColor:'#ffffff'}} tintColor="#003764"/>}
      {geometry.location&&<>
        <NaverMapCircleOverlay latitude={geometry.location.latitude} longitude={geometry.location.longitude} radius={geometry.location.accuracy_m} color="#2670c520" outlineColor="#2670c580" outlineWidth={1}/>
        <NaverMapMarkerOverlay latitude={geometry.location.latitude} longitude={geometry.location.longitude} caption={{text:'공유한 위치',color:'#174a79',haloColor:'#ffffff'}} tintColor="#2670c5"/>
      </>}
    </NaverMapView>
    {!initialized&&<View style={{padding:10,gap:8}}><View style={{flexDirection:'row',gap:8,alignItems:'center'}}><ActivityIndicator/><Body small>{slow?'지도 연결을 확인해 주세요.':'지도 불러오는 중…'}</Body></View>{slow&&<Button secondary title="다시 불러오기" onPress={()=>setAttempt(old=>old+1)}/>}</View>}
  </View>;
}
export default function MvpMap(props:MvpMapProps){
  if(!settings.naverClientId||Constants.executionEnvironment==='storeClient')return <MapDiagram {...props}/>;
  return <ConnectedMap {...props}/>;
}
