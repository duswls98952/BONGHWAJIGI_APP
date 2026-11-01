import {Text,View} from 'react-native';
import Svg,{Circle,Line,Polygon,Polyline,Rect} from 'react-native-svg';
import {mapGeometry,type MvpMapProps} from './mapGeometry';

export default function MapDiagram({location,bounds,route,height=184}:MvpMapProps){
  const geometry=mapGeometry(location,bounds,route),region=geometry.region;
  const project=(p:{latitude:number;longitude:number})=>({x:(p.longitude-region.longitude)/region.longitudeDelta*340,y:190-(p.latitude-region.latitude)/region.latitudeDelta*190});
  const points=(values:{latitude:number;longitude:number}[])=>values.map(p=>{const v=project(p);return `${v.x},${v.y}`;}).join(' ');
  const point=geometry.location?project(geometry.location):null;
  return <View style={{borderRadius:14,overflow:'hidden',backgroundColor:'#ecf0ee',borderWidth:1,borderColor:'#d3dadd'}}>
    <Svg width="100%" height={height} viewBox="0 0 340 190">
      <Rect width={340} height={190} fill="#edf1ef"/>
      {[40,100,160,220,280].map(x=><Line key={x} x1={x} x2={x} y1={0} y2={190} stroke="#dce3df"/>)}
      {[40,95,150].map(y=><Line key={y} x1={0} x2={340} y1={y} y2={y} stroke="#dce3df"/>)}
      {geometry.bounds&&<Polygon points={points(geometry.polygon)} fill="#c8514930" stroke="#b85c56" strokeDasharray="7 5"/>}
      {!!geometry.route.length&&<Polyline points={points(geometry.route)} fill="none" stroke="#245c74" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"/>}
      {point&&<><Circle cx={point.x} cy={point.y} r={16} fill="#2670c52e" stroke="#264d7e"/><Circle cx={point.x} cy={point.y} r={6} fill="#2670c5" stroke="white" strokeWidth={3}/></>}
    </Svg>
    <Text style={{position:'absolute',bottom:7,left:9,fontSize:11,color:'#58636c',backgroundColor:'#ffffffdc',paddingHorizontal:6,paddingVertical:3,borderRadius:4}}>지도 미리보기 · 실제 도로 아님</Text>
  </View>;
}
