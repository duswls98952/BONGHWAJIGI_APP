import {Text, View} from 'react-native';
import Svg, {Circle, Line, Polygon, Rect} from 'react-native-svg';
import type {MvpSchema} from '../api/mvp-types';
import {Body, colors} from './ui';

export type MvpMapProps={location?:MvpSchema<'LocationWrite'>|null;bounds?:{west:number;east:number;south:number;north:number}|null};
export default function MvpMap({location,bounds}:MvpMapProps) {
  let point:{x:number;y:number}|null=null;
  if(location){
    if(bounds&&bounds.east>bounds.west&&bounds.north>bounds.south)point={x:30+(location.longitude-bounds.west)/(bounds.east-bounds.west)*280,y:160-(location.latitude-bounds.south)/(bounds.north-bounds.south)*130};
    else point={x:170,y:95};
  }
  const inside=point&&point.x>=0&&point.x<=340&&point.y>=0&&point.y<=190;
  return <View style={{borderRadius:17,overflow:'hidden',backgroundColor:'#ecf0ee',borderWidth:1,borderColor:'#d3dadd'}}>
    <Svg width="100%" height={168} viewBox="0 0 340 190">
      <Rect width={340} height={190} fill="#edf1ef"/>
      {[40,100,160,220,280].map(x=><Line key={x} x1={x} x2={x} y1={0} y2={190} stroke="#dce3df"/>)}
      {[40,95,150].map(y=><Line key={y} x1={0} x2={340} y1={y} y2={y} stroke="#dce3df"/>)}
      {bounds&&<Polygon points="30,30 310,30 310,160 30,160" fill="#c8514930" stroke="#b85c56" strokeDasharray="7 5"/>}
      {inside&&point&&<><Circle cx={point.x} cy={point.y} r={19} fill="#2670c52e" stroke="#264d7e"/><Circle cx={point.x} cy={point.y} r={6} fill="#2670c5" stroke="white" strokeWidth={3}/></>}
    </Svg>
    <View style={{padding:12,gap:4,backgroundColor:'#f6f8f7'}}><Text style={{color:colors.ink,fontSize:13,fontWeight:'700'}}>지도 연결 준비 중 · 실제 도로가 아닌 도식</Text><Body small muted>{bounds?'입력된 관련 지역 범위입니다. 실제 화선·대피 경로를 나타내지 않아요.':'지도 정보가 준비되면 주변 도로를 확인할 수 있어요.'}</Body>{location&&<Body small>현재 좌표 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}{bounds&&!inside?' · 표시 범위 바깥':''}</Body>}</View>
  </View>;
}
