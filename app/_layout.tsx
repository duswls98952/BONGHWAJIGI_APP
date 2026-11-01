import '../src/platform/location';
import {useEffect, useRef} from 'react';
import {Platform} from 'react-native';
import {Stack, router} from 'expo-router';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {MvpProvider, mvpIsMock, useMvp} from '../src/mvp/Runtime';
import {Notifications} from '../src/platform/notifications';
import {parseMvpPush} from '../src/mvp/push';
import {mvpApi} from '../src/mvp/api';

function Shell(){
  const runtime=useMvp();
  const handled=useRef(new Set<string>());
  useEffect(()=>{
    if(Platform.OS==='web'||mvpIsMock||!runtime.session?.onboarded)return;
    let alive=true;
    const handle=async(notification:Notifications.Notification,opened:boolean)=>{
      const payload=parseMvpPush(notification.request.content.data);
      if(!payload)return;
      await runtime.refresh();
      const key=`${payload.resource_type}:${payload.resource_id}:${payload.revision}`;
      if(!alive||!opened||handled.current.has(key))return;
      // 푸시의 ID는 조회 힌트다. 인증된 API에서 소유권과 최신 상태를 다시 확인한다.
      const home=await mvpApi.home();
      if(!alive)return;
      const alert=payload.resource_type==='alert'?home.data.alerts.find(item=>item.id===payload.resource_id):undefined;
      const incident=home.data.nearby_disasters.find(item=>item.id===payload.resource_id);
      const responseId=alert?.response_id??incident?.response_id;
      if(!alert&&!responseId)return;
      handled.current.add(key);
      if(handled.current.size>200)handled.current.delete(handled.current.values().next().value!);
      router.push({pathname:'/emergency',params:{...(alert?{alertId:alert.id,incidentId:alert.incident_id}:incident?{incidentId:incident.id}:{}),...(responseId?{responseId}:{})}});
    };
    const received=Notifications.addNotificationReceivedListener(n=>void handle(n,false).catch(()=>undefined));
    const opened=Notifications.addNotificationResponseReceivedListener(r=>void handle(r.notification,true).catch(()=>undefined));
    void Notifications.getLastNotificationResponseAsync().then(r=>r&&handle(r.notification,true)).catch(()=>undefined);
    return()=>{alive=false;received.remove();opened.remove();};
  },[runtime.session?.tokens.user_id,runtime.session?.onboarded,runtime.refresh]);
  return <><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:'#fff'}}}/></>;
}
export default function RootLayout(){return <SafeAreaProvider><MvpProvider><Shell/></MvpProvider></SafeAreaProvider>;}
