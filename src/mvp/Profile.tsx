import {useCallback,useEffect,useRef,useState,type ComponentRef} from 'react';
import {Alert,ScrollView,View} from 'react-native';
import {useFocusEffect,useLocalSearchParams} from 'expo-router';
import {useMvp} from './Runtime';
import {Body,Button,Card,Page,s} from './ui';
import {RequireSession} from './Onboarding';
import {emptyProfile,ProfileForm} from './ProfileForm';
import {userMessage} from './core';
import {mvpApi} from './api';
import {shareCurrentLocation,startBackgroundLocation,stopBackgroundLocation} from '../platform/location';
import {registerPush} from '../platform/notifications';
import {settings} from '../config';
import {installationId,newId} from '../platform/storage';

type ActionSection='profile'|'location'|'demo'|'manage';
function ProfileBody(){
  const runtime=useMvp();
  const params=useLocalSearchParams<{section?:string}>();
  const scroll=useRef<ComponentRef<typeof ScrollView>>(null);
  const [locationY,setLocationY]=useState<number|null>(null);
  const [draft,setDraft]=useState(emptyProfile),[base,setBase]=useState(0),[dirty,setDirty]=useState(false);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[messageSection,setMessageSection]=useState<ActionSection>('profile');
  const didScroll=useRef(false);
  const scrollToLocation=useCallback(()=>{
    if(params.section==='location'&&locationY!==null&&!didScroll.current){
      scroll.current?.scrollTo({y:Math.max(0,locationY-6),animated:false});didScroll.current=true;
    }
  },[params.section,locationY]);
  useFocusEffect(useCallback(()=>{didScroll.current=false;const id=requestAnimationFrame(scrollToLocation);return()=>cancelAnimationFrame(id);},[scrollToLocation]));
  useEffect(()=>{if(runtime.profile&&!dirty){setDraft({...emptyProfile(),...runtime.profile.data.profile});setBase(runtime.profile.data.revision);}},[runtime.profile?.data.revision,dirty]);
  async function perform(section:ActionSection,action:()=>Promise<void|string>,success:string){
    setBusy(true);setMessageSection(section);setMessage('처리 중이에요…');
    console.info('[mvp] profile action started');
    try{const result=await action();setMessage(result||success);console.info('[mvp] profile action completed');}
    catch(error){setMessage(error instanceof Error&&/[가-힣]/.test(error.message)?error.message:userMessage(error));console.warn('[mvp] profile action failed',error instanceof Error?error.name:'unknown');}
    finally{setBusy(false);}
  }
  function feedback(section:ActionSection){return !!message&&messageSection===section?<View accessibilityLiveRegion="polite" style={s.notice}><Body>{message}</Body></View>:null;}
  const demoAvailable=runtime.home?.meta.mode==='simulation'&&settings.mode==='live'&&settings.demoLatitude!==''&&settings.demoLongitude!==''&&Number.isFinite(Number(settings.demoLatitude))&&Number.isFinite(Number(settings.demoLongitude));
  return <Page title="내정보" scrollRef={scroll} onContentSizeChange={scrollToLocation}>
    <ProfileForm value={draft} onChange={value=>{setDraft(value);setDirty(true);}}/>
    <Button title={busy?'처리 중…':'저장'} disabled={busy||!runtime.profile} onPress={()=>void perform('profile',async()=>{await runtime.saveProfile(draft,base);setDirty(false);},'저장했어요.')}/>
    {runtime.profile&&dirty&&runtime.profile.data.revision!==base&&<Card><Body>내정보가 변경됐어요. 최신 내용을 불러와 주세요.</Body><Button secondary title="최신 내정보 불러오기" onPress={()=>{setDirty(false);void runtime.refresh().catch(()=>undefined);}}/></Card>}
    {feedback('profile')}
    <View onLayout={event=>setLocationY(event.nativeEvent.layout.y)} nativeID="location-and-notifications">
      <Card title="위치와 알림">
        <Button title="현재 위치 공유" disabled={busy} onPress={()=>void perform('location',async()=>{const result=await shareCurrentLocation();runtime.requireInput('location',result.data.input_revision);await runtime.refresh();},'현재 위치를 공유했어요.')}/>
        <Button secondary title="저장한 현재 위치 삭제" disabled={busy} onPress={()=>void perform('location',async()=>{const result=await mvpApi.deleteLocation();runtime.requireInput('location',result.data.input_revision);await runtime.refresh();},'저장한 현재 위치를 삭제했어요.')}/>
        <Button secondary title="휴대폰 알림 설정" disabled={busy} onPress={()=>void perform('location',async()=>{const result=await registerPush();return result.remoteReady?'휴대폰 알림을 연결했어요.':'알림 권한을 저장했어요. 원격 알림은 준비 중이에요.';},'알림 설정을 저장했어요.')}/>
        {settings.backgroundLocation&&<Button secondary title="동의하고 대피 중 위치 공유" disabled={busy} onPress={()=>void perform('location',startBackgroundLocation,'대피 중 위치 공유를 시작했어요.')}/>}
        {settings.backgroundLocation&&<Button secondary title="대피 중 위치 공유 중지" disabled={busy} onPress={()=>void perform('location',stopBackgroundLocation,'대피 중 위치 공유를 중지했어요.')}/>}
        {feedback('location')}
      </Card>
    </View>
    {demoAvailable&&<Card title="시연 위치">
      <Button secondary title={busy&&messageSection==='demo'?'시연 위치를 저장하고 있어요…':'시연 위치로 안내 확인'} disabled={busy} onPress={()=>void perform('demo',async()=>{const result=await mvpApi.sendLocation({fix_id:newId(),installation_id:await installationId(),latitude:Number(settings.demoLatitude),longitude:Number(settings.demoLongitude),accuracy_m:10,captured_at:new Date().toISOString()});runtime.requireInput('location',result.data.input_revision);await runtime.refresh();},'시연 위치를 저장했어요.')}/>
      {feedback('demo')}
    </Card>}
    <Card title="내 정보 관리">
      <Button secondary title="프로필 삭제" disabled={busy} onPress={()=>Alert.alert('프로필 삭제','저장한 내정보와 건강·의료 메모를 삭제할까요?',[{text:'취소',style:'cancel'},{text:'삭제',style:'destructive',onPress:()=>void perform('manage',async()=>{await runtime.deleteProfile();setDirty(false);},'프로필을 삭제했어요.')}])}/>
      <Button secondary title="로그아웃" disabled={busy} onPress={()=>Alert.alert('로그아웃','로그아웃할까요?',[{text:'취소',style:'cancel'},{text:'로그아웃',onPress:()=>void perform('manage',async()=>{await runtime.logout();},'로그아웃했어요.')}])}/>
      {feedback('manage')}
    </Card>
  </Page>;
}
export default function Profile(){const runtime=useMvp();return <RequireSession><ProfileBody key={runtime.session?.tokens.user_id}/></RequireSession>;}
