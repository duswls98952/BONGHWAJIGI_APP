import {useState} from 'react';
import {Alert,Linking,Modal,Platform,ScrollView,Text,TextInput,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as SMS from 'expo-sms';
import {router} from 'expo-router';
import {useMvp,mvpIsMock} from './Runtime';
import {freshUntil} from './core';
import {Body,Button,Icon,s} from './ui';

export function EmergencyActions({responseId,alertId}:{responseId?:string;alertId?:string}){
  const value=useMvp();
  const [open,setOpen]=useState(false),[text,setText]=useState(''),[message,setMessage]=useState('');
  function prepare(){
    const location=value.home?.data.location;
    const fix=location?.status==='available'&&freshUntil(location.valid_until,value.now)?location.fix:null;
    const snapshot=responseId?value.snapshots[responseId]?.data:null;
    const state=snapshot?.user_context.status==='available'?snapshot.user_context.data:null;
    setText([
      '산불 상황으로 도움을 요청합니다.',
      fix?`공유한 현재 위치: 위도 ${fix.latitude.toFixed(5)}, 경도 ${fix.longitude.toFixed(5)}`:'현재 위치: 직접 확인해 입력해 주세요.',
      state?.can_move===false?'현재 스스로 이동하기 어렵습니다.':'이동 가능 여부: 직접 확인해 입력해 주세요.',
      state?.helper_present===false?'현재 함께 도와줄 사람이 없습니다.':'',
      '주변 상황과 정확한 위치를 확인해 주세요.',
    ].filter(Boolean).join('\n'));
    setMessage('');setOpen(true);
  }
  async function dial(){
    if(mvpIsMock||Platform.OS==='web'){setMessage('모의 시연에서는 실제 전화·문자를 연결하지 않아요.');return;}
    try{await Linking.openURL('tel:119');}catch{setMessage('전화 앱을 열지 못했어요. 휴대폰에서 직접 119를 눌러 주세요.');}
  }
  async function sms(){
    if(mvpIsMock||Platform.OS==='web'){setMessage('모의 시연에서는 실제 전화·문자를 연결하지 않아요.');return;}
    if(!await SMS.isAvailableAsync()){setMessage('이 기기에서 문자 작성 화면을 열 수 없어요.');return;}
    await SMS.sendSMSAsync(['119'],text);
    setMessage('문자 작성 화면을 열었어요. 실제 전송·접수 여부는 문자 앱과 구조기관에서 확인해 주세요.');
  }
  return <>
    <View style={s.actionBar}>
      <View style={{flex:1}}><Button secondary title="기본 수칙" onPress={()=>router.push('/rules')}/></View>
      <View style={{flex:1}}><Button secondary title="대피로" onPress={()=>router.push({pathname:'/route',params:{...(responseId?{responseId}:{}),...(alertId?{alertId}:{})}})}/></View>
      <View style={{flex:1}}><Button danger title="119 신고" onPress={prepare}/></View>
    </View>
    <Modal visible={open} onRequestClose={()=>setOpen(false)} animationType="slide"><SafeAreaView style={[s.safe,{padding:22,gap:18}]}><ScrollView contentContainerStyle={{gap:18,paddingBottom:20}}><View style={s.row}><Icon name="phone" color="#b93836"/><Text style={s.heading}>119 연결 준비</Text></View><Body>현재 내용은 내가 확인하는 초안이에요. 자동으로 전송하거나 신고하지 않아요.</Body><TextInput accessibilityLabel="119 문자 초안" multiline value={text} onChangeText={setText} style={[s.input,{minHeight:210,textAlignVertical:'top'}]}/><Button danger title="전화 앱에서 119 열기" onPress={()=>Alert.alert('119 전화 화면','실제 긴급 연락이 필요한 상황인가요? 전화 앱에서 번호를 확인하고 직접 통화해 주세요.',[{text:'취소',style:'cancel'},{text:'전화 앱 열기',onPress:()=>void dial()}])}/><Button secondary title="문자 작성 화면 열기" onPress={()=>void sms().catch(()=>setMessage('문자 작성 화면을 열지 못했어요.'))}/>{!!message&&<Body>{message}</Body>}<Button secondary title="닫기" onPress={()=>setOpen(false)}/></ScrollView></SafeAreaView></Modal>
  </>;
}
