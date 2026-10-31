import {useEffect, useState} from 'react';
import {Alert, View} from 'react-native';
import {useMvp} from './Runtime';
import {Body, Button, Card, Page, s} from './ui';
import {RequireSession} from './Onboarding';
import {emptyProfile, ProfileForm} from './ProfileForm';
import {userMessage} from './core';
import {mvpApi} from './api';
import {shareCurrentLocation,startBackgroundLocation,stopBackgroundLocation} from '../platform/location';
import {registerPush} from '../platform/notifications';
import {settings} from '../config';
import {installationId,newId} from '../platform/storage';

function ProfileBody(){
  const runtime=useMvp();
  const [draft,setDraft]=useState(emptyProfile),[base,setBase]=useState(0),[dirty,setDirty]=useState(false);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  useEffect(()=>{if(runtime.profile&&!dirty){setDraft({...emptyProfile(),...runtime.profile.data.profile});setBase(runtime.profile.data.revision);}},[runtime.profile?.data.revision,dirty]);
  async function perform(action:()=>Promise<void>,success:string){setBusy(true);setMessage('');try{await action();setMessage(success);}catch(error){setMessage(error instanceof Error&&/[가-힣]/.test(error.message)?error.message:userMessage(error));}finally{setBusy(false);}}
  const demoAvailable=runtime.home?.meta.mode==='simulation'&&settings.mode==='live'&&settings.demoLatitude!==''&&settings.demoLongitude!==''&&Number.isFinite(Number(settings.demoLatitude))&&Number.isFinite(Number(settings.demoLongitude));
  return <Page title="내정보">
    <ProfileForm value={draft} onChange={value=>{setDraft(value);setDirty(true);}}/>
    <Button title={busy?'처리 중…':'저장'} disabled={busy||!runtime.profile} onPress={()=>void perform(async()=>{await runtime.saveProfile(draft,base);setDirty(false);},'저장했어요. 새 안내에 반영되는 내용을 확인하고 있어요.')}/>
    {runtime.profile&&dirty&&runtime.profile.data.revision!==base&&<Card><Body>다른 변경이 먼저 반영됐어요. 저장 전에 최신 내정보를 다시 불러와 주세요.</Body><Button secondary title="최신 내정보 불러오기" onPress={()=>{setDirty(false);void runtime.refresh().catch(()=>undefined);}}/></Card>}
    {!!message&&<View accessibilityLiveRegion="polite" style={s.notice}><Body>{message}</Body></View>}
    <Card title="위치와 알림">
      <Body muted small>내가 공유한 위치와 직접 확인한 상태로 안내를 갱신해요.</Body>
      <Button title="현재 위치 공유" disabled={busy} onPress={()=>void perform(async()=>{const result=await shareCurrentLocation();runtime.requireInput('location',result.data.input_revision);await runtime.refresh();},'현재 위치를 공유했어요. 위치는 5분 동안 유효해요.')}/>
      <Button secondary title="저장한 현재 위치 삭제" disabled={busy} onPress={()=>void perform(async()=>{const result=await mvpApi.deleteLocation();runtime.requireInput('location',result.data.input_revision);await runtime.refresh();},'서버에 저장한 현재 위치를 삭제했어요.')}/>
      <Button secondary title="휴대폰 알림 설정" disabled={busy} onPress={()=>void perform(async()=>{const result=await registerPush();setMessage(result.remoteReady?'휴대폰 알림 연결을 등록했어요.':'알림 권한을 저장했어요. 원격 푸시 연결은 준비 중이에요.');},'알림 설정 요청을 처리했어요. 원격 수신은 준비 상태를 확인해 주세요.')}/>
      <Body muted small>Firebase가 준비되기 전에는 화면 밖으로 원격 푸시를 보낼 수 없어요. 앱으로 돌아오면 최신 정보를 다시 확인해요.</Body>
      <Button secondary title="동의하고 대피 중 위치 공유" disabled={busy||!settings.backgroundLocation} onPress={()=>void perform(startBackgroundLocation,'대피 중 위치 공유를 요청했어요. 휴대폰 설정에 따라 중단될 수 있어요.')}/>
      {!settings.backgroundLocation&&<Body muted small>현재 빌드는 직접 선택한 현재 위치 공유를 지원해요.</Body>}
      <Button secondary title="대피 중 위치 공유 중지" disabled={busy} onPress={()=>void perform(stopBackgroundLocation,'대피 중 위치 공유를 중지했어요.')}/>
    </Card>
    {demoAvailable&&<Card title="합성 시연 위치">
      <Body small muted>산불 시나리오 지역의 합성 위치로 서버 연결을 확인해요. 휴대폰 GPS를 사용하지 않으며 위치는 5분 동안 유효해요.</Body>
      <Button secondary title="시연 위치로 안내 확인" disabled={busy} onPress={()=>void perform(async()=>{const result=await mvpApi.sendLocation({fix_id:newId(),installation_id:await installationId(),latitude:Number(settings.demoLatitude),longitude:Number(settings.demoLongitude),accuracy_m:10,captured_at:new Date().toISOString()});runtime.requireInput('location',result.data.input_revision);await runtime.refresh();},'합성 시연 위치를 보냈어요. 홈에서 시연 산불을 선택해 주세요.')}/>
    </Card>}
    <Card title="내 정보 관리">
      <Button secondary title="프로필 삭제" disabled={busy} onPress={()=>Alert.alert('프로필 삭제','서버에 저장한 내 사전 정보와 선택 의료 메모를 삭제할까요?',[{text:'취소',style:'cancel'},{text:'삭제',style:'destructive',onPress:()=>void perform(async()=>{await runtime.deleteProfile();setDirty(false);},'프로필을 삭제했어요.')}])}/>
      <Button secondary title="로그아웃" disabled={busy} onPress={()=>Alert.alert('로그아웃','연결을 종료하고 이 기기의 접속 정보를 지울까요?',[{text:'취소',style:'cancel'},{text:'로그아웃',onPress:()=>void perform(async()=>{await runtime.logout();},'로그아웃했어요.')}])}/>
    </Card>
  </Page>;
}
export default function Profile(){const runtime=useMvp();return <RequireSession><ProfileBody key={runtime.session?.tokens.user_id}/></RequireSession>;}
