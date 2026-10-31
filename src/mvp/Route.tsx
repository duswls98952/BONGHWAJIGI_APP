import {useLocalSearchParams} from 'expo-router';
import {Text,View} from 'react-native';
import {useMvp} from './Runtime';
import {Body,Card,Page,s} from './ui';
import {RequireSession} from './Onboarding';
import {EmergencyActions} from './Support';
import {freshUntil} from './core';
import MvpMap from './Map';

function RouteBody(){
  const params=useLocalSearchParams<{responseId?:string;alertId?:string}>();
  const value=useMvp();
  const data=value.home?.data.location;
  const location=data?.status==='available'&&freshUntil(data.valid_until,value.now)?data.fix:null;
  return <Page title="2D 대피로" footer={<EmergencyActions responseId={params.responseId} alertId={params.alertId}/>}><MvpMap location={location}/><Card title="확인된 경로를 준비하고 있어요"><Body>현재 실제 도로를 검증한 대피 경로를 제공하지 않아요.</Body><Body muted>임의의 선을 따라 이동하지 마세요. 관할 기관의 대피 안내와 현재 통제 상황을 확인해 주세요.</Body></Card><Body small muted>이 화면은 지도와 경로가 준비되는 상태를 보여줘요.</Body></Page>;
}
export default function Route(){return <RequireSession><RouteBody/></RequireSession>;}
