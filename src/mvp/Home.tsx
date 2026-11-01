import {useState,type PropsWithChildren} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import Svg,{Path,Defs,LinearGradient,Stop,Rect} from 'react-native-svg';
import {router} from 'expo-router';
import {useMvp} from './Runtime';
import {currentTodayGuidance,currentPreparations,guidanceReferenceDate} from './homeContent';
import {Body,Button,Card,Icon,Page,s} from './ui';
import MvpMap from './Map';
import {currentMapLocation} from './mapGeometry';
import {RequireSession} from './Onboarding';

function HomeSection({title,color,children}:PropsWithChildren<{title:string;color:string}>){
  const [size,setSize]=useState({width:0,height:0}),[tabWidth,setTabWidth]=useState(0);
  const {width,height}=size;
  const tab=Math.min(tabWidth,Math.max(24,width-72));
  // One continuous silhouette avoids seams between the tab and rounded body.
  const outline=width&&height&&tabWidth?`M24 0H${tab-24}Q${tab} 0 ${tab} 24Q${tab} 48 ${tab+24} 48H${width-24}Q${width} 48 ${width} 72V${height-24}Q${width} ${height} ${width-24} ${height}H24Q0 ${height} 0 ${height-24}V24Q0 0 24 0Z`:'';
  return <View style={h.tabSection} onLayout={event=>{const {width,height}=event.nativeEvent.layout;setSize(old=>old.width===width&&old.height===height?old:{width,height});}}>
    {!!outline&&<View pointerEvents="none" style={StyleSheet.absoluteFill}><Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}><Path d={outline} fill={color}/></Svg></View>}
    <View style={{alignSelf:'flex-start',paddingHorizontal:12,paddingTop:12,paddingBottom:15}} onLayout={event=>setTabWidth(event.nativeEvent.layout.width)}><Text style={s.heading}>{title}</Text></View>
    <View style={{padding:12,paddingTop:0,gap:12}}>{children}</View>
  </View>;
}
function Tip({title,text,icon,tint,border}:{title:string;text:string;icon:string;tint:string;border:string}){
  return <View style={[h.tip,{backgroundColor:tint,borderColor:border}]}><Icon name={icon} color="#243238"/><View style={{flex:1,gap:5}}><Text style={h.tipText}>{title}</Text><Text style={{fontSize:14,lineHeight:21,color:'#17242b'}}>{text}</Text></View></View>;
}
function HomeBody(){
  const value=useMvp(),home=value.home?.data;
  const location=currentMapLocation(home?.location,value.now,value.required[`location:${value.session?.tokens.user_id}`]??0);
  const today=currentTodayGuidance(home,value.now,value.required[`location:${value.session?.tokens.user_id}`]??0);
  const preparations=currentPreparations(home?.preparations,value.profile?.data.revision??0,value.now,home?.location,value.required[`location:${value.session?.tokens.user_id}`]??0);
  const referenceDate=guidanceReferenceDate(today);
  function open(responseId:string|null,alertId?:string,incidentId?:string){router.push({pathname:'/emergency',params:{...(responseId?{responseId}:{}),...(alertId?{alertId}:{}),...(incidentId?{incidentId}:{})}});}
  const settings=()=>router.push({pathname:'/profile',params:{section:'location'}});
  return <Page home>
    <View style={{gap:12}}>
      <View pointerEvents="none" style={{position:'absolute',top:-14,left:-16,right:-16,height:220}}><Svg width="100%" height="100%"><Defs><LinearGradient id="homeFade" x1="0" x2="0" y1="0" y2="1"><Stop offset="0" stopColor="#f2f4f4"/><Stop offset="1" stopColor="#fff"/></LinearGradient></Defs><Rect width="100%" height="100%" fill="url(#homeFade)"/></Svg></View>
      <MvpMap location={location} simulation={value.home?.meta.mode==='simulation'}/>
      <View style={[s.row,{justifyContent:'space-between'}]}><View style={s.row}><Icon name="pin" size={19} color="#245c74"/><Text style={{fontSize:15,fontWeight:'700',color:'#20262d'}}>{location?'공유한 위치':'현재 위치 미확인'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="위치와 알림 설정" onPress={settings} style={{minHeight:48,justifyContent:'center',paddingHorizontal:5}}><Text style={{fontSize:13,color:'#245c74',fontWeight:'700'}}>위치와 알림 설정</Text></Pressable></View>
    </View>
    {!!value.error&&<Card><Body>{value.error}</Body><Button secondary title="다시 확인" onPress={()=>void value.refresh().catch(()=>undefined)}/></Card>}
    {!home&&<Card><Body>주변 정보를 확인하고 있어요.</Body><Button secondary title="다시 불러오기" onPress={()=>void value.refresh().catch(()=>undefined)}/></Card>}
    <HomeSection title="오늘의 행동요령" color="#f3deed">
      {today.map((item,index)=><Tip key={item.id} title={item.title} text={item.text} icon={index?'bag':'sun'} tint="#e5b8d2" border="#bd8baa"/>)}
      {!today.length&&<Body>{location?'현재 위치의 지역·기상 자료를 확인하고 있어요.':'안내 위치를 설정하면 지역 행동요령을 확인할 수 있어요.'}</Body>}
      {referenceDate&&<Text style={{fontSize:12,lineHeight:18,color:'#59354d'}}>{referenceDate}</Text>}
    </HomeSection>
    <HomeSection title="나의 사전준비" color="#e2ece5">
      {preparations.length?preparations.map((item,index)=><Tip key={item.id} title={item.title} text={item.text} icon={index?'checklist':'bag'} tint="#bfd5c5" border="#90b19b"/>):<Body>준비 안내를 확인하고 있어요.</Body>}
    </HomeSection>
    <View style={s.section}><Text style={s.heading}>주변 재난 사항</Text><View style={h.feed}>
      {home?.alerts.map((alert,index)=><Pressable key={alert.id} accessibilityRole="button" accessibilityLabel={`${alert.status==='active'?'공식 경보':'공식 경보 상태'} 원문 확인`} style={[h.feedRow,index>0&&h.feedBorder]} onPress={()=>open(alert.response_id,alert.id,alert.incident_id)}>
        <View style={h.feedIcon}><Icon name="warning" size={19}/></View><View style={{flex:1,gap:6}}><View style={{flexDirection:'row',justifyContent:'space-between',gap:5}}><Text style={h.feedTitle}>{alert.status==='active'?'공식 경보 원문 확인':alert.status==='cancelled'?'공식 경보 해제':'공식 경보 유효성 확인'}</Text><Text style={[h.badge,alert.status!=='active'&&{backgroundColor:'#eef0f1',color:'#20262d'}]}>{alert.status==='active'?'발령 중':alert.status==='cancelled'?'해제':'확인 필요'}</Text></View><Text numberOfLines={2} style={h.feedDetail}>{alert.original_text}</Text></View>
      </Pressable>)}
      {home?.nearby_disasters.map((item,index)=><Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title} 확인`} onPress={()=>open(item.response_id,undefined,item.id)} style={[h.feedRow,(index>0||!!home.alerts.length)&&h.feedBorder]}><View style={h.feedIcon}><Icon name="fire" size={19}/></View><View style={{flex:1,gap:7}}><Text style={h.feedTitle}>{item.title}</Text><Text style={h.feedDetail}>{new Date(item.observed_at).toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}{item.data_status!=='current'?' · 최신성 확인 필요':''}</Text></View></Pressable>)}
      {!home?.nearby_disasters.length&&!home?.alerts.length&&<View style={{paddingVertical:20}}><Body>표시할 재난 정보가 없어요.</Body></View>}
    </View></View>
  </Page>;
}
const h=StyleSheet.create({
  tabSection:{marginHorizontal:-12,minHeight:108},tip:{minHeight:80,borderRadius:16,borderWidth:1,flexDirection:'row',gap:13,padding:16,alignItems:'flex-start'},tipText:{fontSize:15,fontWeight:'700',lineHeight:23,color:'#17242b'},
  feed:{borderWidth:1,borderColor:'#e4e7e9',borderRadius:14,marginHorizontal:-3,paddingHorizontal:13},feedRow:{minHeight:86,flexDirection:'row',alignItems:'center',gap:9,paddingVertical:14},feedBorder:{borderTopWidth:1,borderTopColor:'#eef0f1'},feedIcon:{width:37,height:37,borderRadius:8,backgroundColor:'#f3f5f7',alignItems:'center',justifyContent:'center'},feedTitle:{fontSize:14,fontWeight:'700',color:'#20262d',flexShrink:1},feedDetail:{fontSize:13,lineHeight:19,color:'#20262d'},badge:{fontSize:12,color:'#a03a16',backgroundColor:'#ffebe3',borderRadius:20,paddingHorizontal:8,paddingVertical:3},
});
export default function Home(){return <RequireSession><HomeBody/></RequireSession>;}
