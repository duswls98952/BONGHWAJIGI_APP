import {useEffect,useState} from 'react';
import {Linking,Text,View} from 'react-native';
import type {MvpSchema} from '../api/mvp-types';
import {mvpApi} from './api';
import {RequireSession} from './Onboarding';
import {Body,Button,Card,Icon,Page,s} from './ui';
import {userMessage} from './core';
function RulesBody(){
  const [data,setData]=useState<MvpSchema<'RulesData'>|null>(null),[error,setError]=useState('');
  const reload=async()=>{setError('');try{setData((await mvpApi.rules()).data);}catch(problem){setError(userMessage(problem));}};
  useEffect(()=>{void reload();},[]);
  const source=data?.items[0]?.source;
  return <Page title="산불 행동수칙"><View style={[s.row,{gap:13}]}><View style={{width:48,height:48,borderRadius:17,backgroundColor:'#e8f2f6',alignItems:'center',justifyContent:'center'}}><Icon name="fire" size={25} color="#245c74"/></View><Text style={s.heading}>산불 대비 기본수칙</Text></View>
    <View style={{borderWidth:1,borderColor:'#e0e4e8',borderRadius:17,padding:16}}>{data?.items.map((item,index)=><View style={s.step} key={item.id}><Text style={s.stepNumber}>{index+1}</Text><View style={{flex:1}}><Body>{item.text}</Body></View></View>)}{!data?.items.length&&<Body>현재 확인할 수 있는 수칙을 불러오고 있어요.</Body>}</View>
    <Card title="이런 행동과 장소는 피하세요">{data?.avoid.map(item=><Body key={item.id}>· {item.text}</Body>)}{!data?.avoid.length&&<Body muted>별도로 확인된 회피 지침이 없어요.</Body>}</Card>
    {source&&<Button secondary title="공식 출처 확인" onPress={()=>{const url=new URL(source.url);if(url.hostname==='example.invalid')setError('현재 원문을 열 수 없어요.');else if(url.protocol==='https:')void Linking.openURL(source.url);}}/>}
    {!!error&&<Card><Body>{error}</Body><Button secondary title="다시 확인" onPress={()=>void reload()}/></Card>}
  </Page>;
}
export default function Rules(){return <RequireSession><RulesBody/></RequireSession>;}
