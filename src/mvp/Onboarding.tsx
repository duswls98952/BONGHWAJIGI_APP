import {useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {useMvp} from './Runtime';
import {Body, Brand, Button, Card, Icon, Loading, Page, s} from './ui';
import {emptyProfile, ProfileForm} from './ProfileForm';
import {userMessage} from './core';

const terms=[
  {title:'서비스 이용 안내',text:'봉화지기는 산불 대응 안내를 확인하는 내부 시연 앱입니다. 현재 자료는 합성 시연이며 실제 기관 경보나 구조 접수를 대신하지 않습니다. 긴급한 실제 상황에서는 공식 안내와 119를 이용하세요.'},
  {title:'개인정보 수집·이용',text:'시연 연결 식별자와 직접 입력한 사전 정보를 봉화지기 서버에 저장해 맞춤 준비와 대응 안내에 사용합니다. 내정보에서 조회·변경·삭제할 수 있습니다. 건강·의료 메모는 별도 동의와 선택 입력으로 처리합니다. 실제 개인정보 대신 합성 정보를 입력해 주세요.'},
  {title:'개인위치정보 이용',text:'위치를 공유하면 내 위치와 관련된 재난 정보와 안내를 확인하는 데 사용합니다. 이 동의만으로 휴대폰 위치 권한이 켜지지 않습니다. 공유 버튼에서 별도로 허용하며 내정보에서 서버에 저장한 현재 위치를 삭제할 수 있습니다.'},
];
export function Onboarding(){
  const runtime=useMvp();
  const [draft,setDraft]=useState(emptyProfile);
  const [consent,setConsent]=useState([false,false,false]);
  const [expanded,setExpanded]=useState<number|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const all=consent.every(Boolean)&&draft.health_consent===true;
  async function save(){setBusy(true);setError('');try{await runtime.onboard(draft);}catch(problem){setError(userMessage(problem));}finally{setBusy(false);}}
  return <Page>
    <View style={{alignItems:'center',paddingTop:10,paddingBottom:4}}><Brand/></View>
    <Text style={s.heading}>이용 동의</Text>
    <Pressable accessibilityRole="checkbox" accessibilityState={{checked:all}} aria-checked={all} style={[s.row,{paddingHorizontal:17,backgroundColor:'#f0f2f7',borderRadius:20,minHeight:48,gap:13}]} onPress={()=>{setConsent([!all,!all,!all]);setDraft(old=>({...old,health_consent:!all,health_notes:all?'':old.health_notes??''}));}}><View style={{width:22,height:22,borderRadius:6,borderWidth:1.5,borderColor:all?colorsNavy:'#9ba3aa',backgroundColor:all?colorsNavy:'#fff',alignItems:'center',justifyContent:'center'}}>{all&&<Icon name="check" size={17} color="#fff"/>}</View><Text style={{fontSize:20,fontWeight:'700'}}>전체 동의</Text></Pressable>
    <View style={{gap:3}}>{terms.map((term,index)=><View key={term.title}><View style={s.row}><Pressable accessibilityRole="checkbox" accessibilityState={{checked:consent[index]??false}} aria-checked={consent[index]??false} onPress={()=>setConsent(old=>old.map((v,i)=>i===index?!v:v))} style={[s.row,{flex:1,minHeight:50,paddingLeft:10}]}><Icon name="check" color={consent[index]?colorsNavy:'#9ba3aa'}/><Text style={{fontSize:15,fontWeight:'700'}}>[필수] {term.title}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`${term.title} 설명 보기`} accessibilityState={{expanded:expanded===index}} onPress={()=>setExpanded(expanded===index?null:index)} style={s.back}><Text style={{fontSize:28,color:'#58636c'}}>{expanded===index?'⌄':'›'}</Text></Pressable></View>{expanded===index&&<Card><Body small>{term.text}</Body></Card>}</View>)}</View>
    <Text style={s.heading}>내 정보 입력</Text>
    <ProfileForm value={draft} onChange={setDraft}/>
    {!!(error||runtime.error)&&<View accessibilityLiveRegion="polite" style={s.notice}><Body>{error||runtime.error}</Body></View>}
    <Button title={busy?'저장하고 연결 중…':'동의하고 저장'} disabled={busy||!consent.every(Boolean)} onPress={()=>void save()}/>
  </Page>;
}
const colorsNavy='#003764';
export function RequireSession({children}:React.PropsWithChildren){const runtime=useMvp();return runtime.status==='restoring'?<Loading/>:!runtime.session?.onboarded?<Onboarding/>:<>{children}</>;}
