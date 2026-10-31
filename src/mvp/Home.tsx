import {Pressable, Text, View} from 'react-native';
import {router} from 'expo-router';
import {useMvp, mvpIsMock} from './Runtime';
import {mvpMock} from './api';
import {freshUntil} from './core';
import {Body, Button, Card, Icon, Page, s} from './ui';
import MvpMap from './Map';
import {RequireSession} from './Onboarding';

function HomeBody(){
  const value=useMvp(),home=value.home?.data;
  const location=home?.location.status==='available'&&freshUntil(home.location.valid_until,value.now)&&(home.location.input_revision>=(value.required[`location:${value.session?.tokens.user_id}`]??0))?home.location.fix:null;
  const preparationCurrent=home&&home.preparations.status==='available'&&home.preparations.profile_revision>=(value.profile?.data.revision??0)&&home.preparations.items.every(item=>freshUntil(item.valid_until,value.now));
  function open(responseId:string|null,alertId?:string,incidentId?:string){router.push({pathname:'/emergency',params:{...(responseId?{responseId}:{}),...(alertId?{alertId}:{} ),...(incidentId?{incidentId}:{})}});}
  return <Page home>
    <View style={s.section}><MvpMap location={location}/><View style={s.row}><Icon name="pin" size={18}/><Body>{location?'현재 위치가 확인됐어요':'현재 위치 미확인'}</Body></View>{!location&&<Button secondary title="위치와 알림 설정" onPress={()=>router.push('/profile')}/>}</View>
    {!!value.error&&<Card><Body>{value.error}</Body><Button secondary title="다시 확인" onPress={()=>void value.refresh().catch(()=>undefined)}/></Card>}
    {!home&&<Card><Body>주변 정보를 확인하고 있어요. 연결이 끝나면 표시합니다.</Body><Button secondary title="다시 불러오기" onPress={()=>void value.refresh().catch(()=>undefined)}/></Card>}
    {!!home?.alerts.length&&<View style={s.section}>{home.alerts.map(alert=><Pressable key={alert.id} accessibilityRole="button" accessibilityLabel={`${alert.status==='active'?'공식 경보':'공식 경보 상태'} 원문 확인`} style={[s.card,{backgroundColor:alert.status==='active'?'#fff0db':'#f0f2f4'}]} onPress={()=>open(alert.response_id,alert.id,alert.incident_id)}><View style={s.row}><Icon name="warning"/><Text style={s.cardTitle}>{alert.status==='active'?'공식 경보 원문 확인':alert.status==='cancelled'?'공식 경보 해제':'공식 경보 유효성 확인'}</Text></View><Body>{alert.original_text}</Body><Body small muted>{alert.authority} · {alert.official_severity}</Body></Pressable>)}</View>}
    <View style={s.section}><Text style={s.heading}>오늘의 행동요령</Text><View style={[s.card,{backgroundColor:'#fcf8fb'}]}><Body small muted>산불 공통 수칙 · 개인 안내는 긴급 화면에서 확인해 주세요.</Body>{home?.basic_rules.items.slice(0,2).map((item,index)=><View key={item.id} style={[s.card,{backgroundColor:'#f6e4ef'}]}><View style={s.row}><Icon name={index?'bag':'warning'}/><View style={{flex:1}}><Body>{item.text}</Body></View></View></View>)}{!home?.basic_rules.items.length&&<Body>현재 제공되는 수칙을 확인하고 있어요.</Body>}</View></View>
    <View style={s.section}><Text style={s.heading}>나의 사전준비</Text><View style={[s.card,{backgroundColor:'#f8faf9'}]}>{preparationCurrent?home.preparations.items.map(item=><View key={item.id} style={[s.card,{backgroundColor:'#e9eeea'}]}><View style={s.row}><Icon name="bag"/><View style={{flex:1}}><Body>{item.text}</Body></View></View></View>):<Body>내 정보가 반영된 준비 안내를 확인하고 있어요.</Body>}{preparationCurrent&&!home.preparations.items.length&&<Body>현재 제공되는 준비 안내가 없어요.</Body>}</View></View>
    <View style={s.section}><Text style={s.heading}>주변 재난 사항</Text><View style={{borderWidth:1,borderColor:'#e0e4e8',borderRadius:16,paddingHorizontal:14}}>{home?.nearby_disasters.map((item,index)=><Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title} 확인`} onPress={()=>open(item.response_id,undefined,item.id)} style={{minHeight:92,paddingVertical:15,flexDirection:'row',alignItems:'center',gap:11,borderTopWidth:index?1:0,borderTopColor:'#edf0f2'}}><Icon name="fire"/><View style={{flex:1,gap:5}}><Text style={{fontSize:15,fontWeight:'700',color:'#20262d'}}>{item.title}</Text><Body small muted>{new Date(item.observed_at).toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})} · {item.data_status==='current'?'최근 자료':'최신성 확인 필요'}</Body></View><Text style={{fontSize:24,color:'#8a959c'}}>›</Text></Pressable>)}{!home?.nearby_disasters.length&&<View style={{paddingVertical:20}}><Body>현재 조회 범위에 표시할 재난 정보가 없어요.</Body><Body small muted>정보가 없다는 사실이 안전하다는 뜻은 아니에요.</Body></View>}</View></View>
    {mvpIsMock&&<Card title="모의 시연 제어"><Body small>테스트 서버에서 캡처한 단계별 응답을 재생해요.</Body><View style={s.choices}>{([['1','경고'],['2','대피'],['3','위급']] as const).map(([stage,label])=><Button key={stage} secondary title={label} onPress={()=>{mvpMock.setStage(stage);void value.refresh().catch(()=>undefined);}}/>)}</View></Card>}
  </Page>;
}
export default function Home(){return <RequireSession><HomeBody/></RequireSession>;}
