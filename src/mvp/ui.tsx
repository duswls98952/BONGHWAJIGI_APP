import React from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Path} from 'react-native-svg';
import {router} from 'expo-router';
import {useMvp, mvpIsMock} from './Runtime';

export const colors={ink:'#20262d',navy:'#003764',muted:'#58636c',card:'#f3f5f7',line:'#e0e4e8',blue:'#245c74',red:'#b93836',paper:'#fff'};
export function Icon({name,size=22,color=colors.ink}:{name:string;size?:number;color?:string}) {
  const paths:Record<string,string>={
    back:'M15 4 7 12l8 8', warning:'M12 3 22 21H2ZM12 9v5m0 3v1',
    gear:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z',
    bag:'M5 8h14v13H5ZM9 8V5h6v3m-3 3v7m-3-4h6',
    book:'M12 5C8 3 5 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-6-1-10 1Zm0 0v16',
    phone:'m6 3-3 3c0 7 8 15 15 15l3-3-5-5-3 3-5-5 3-3Z',
    pin:'M12 22s7-7 7-13A7 7 0 0 0 5 9c0 6 7 13 7 13Z',
    route:'M4 5h7v5H4Zm9 9h7v5h-7ZM8 10v7h5m3-12h5m-2-2v5',
    fire:'M12 2c1 5-3 5-3 10 3 0 4-3 4-5 5 4 7 10 3 14C8 27 0 18 6 11c0 5 2 5 3 6C5 10 10 7 12 2Z',
    check:'m5 12 5 5 9-10', person:'M4 22v-4a8 8 0 0 1 16 0v4',
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Path d={paths[name]??paths.warning}/>{name==='pin'&&<Circle cx={12} cy={9} r={2}/>} {name==='gear'&&<Circle cx={12} cy={12} r={3}/>} {name==='person'&&<Circle cx={12} cy={6} r={4}/>}</Svg>;
}
export function Brand({large=false}:{large?:boolean}) {return <Text accessibilityLabel="봉화지기" style={[s.brand,large&&{fontSize:48}]}><Text style={{color:'#003764'}}>봉</Text><Text style={{color:'#ec8b32'}}>화</Text><Text style={{color:'#292d31'}}>지기</Text></Text>;}
export function Body({children,muted=false,small=false}:React.PropsWithChildren<{muted?:boolean;small?:boolean}>) {return <Text style={[s.body,muted&&{color:colors.muted},small&&{fontSize:13,lineHeight:21}]}>{children}</Text>;}
export function Button({title,onPress,disabled=false,secondary=false,danger=false}:{title:string;onPress:()=>void;disabled?:boolean;secondary?:boolean;danger?:boolean}) {return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,danger&&{backgroundColor:colors.red},(pressed||disabled)&&{opacity:.5}]}><Text style={[s.buttonText,secondary&&{color:colors.navy}]}>{title}</Text></Pressable>;}
export function Chip({label,selected,onPress}:{label:string;selected:boolean;onPress:()=>void}) {return <Pressable accessibilityRole="checkbox" accessibilityState={{checked:selected}} aria-checked={selected} onPress={onPress} style={[s.chip,selected&&s.chipSelected]}><Text style={{fontSize:14,fontWeight:'600',color:selected?colors.blue:colors.ink}}>{selected?'✓ ':''}{label}</Text></Pressable>;}
export function Card({children,title,tint}:React.PropsWithChildren<{title?:string;tint?:string}>) {return <View style={[s.card,tint&&{backgroundColor:tint}]}>{title&&<Text accessibilityRole="header" style={s.cardTitle}>{title}</Text>}{children}</View>;}
export function Field({label,value,onChangeText,placeholder,disabled=false,multiline=false,maxLength=200}:{label:string;value:string;onChangeText:(value:string)=>void;placeholder?:string;disabled?:boolean;multiline?:boolean;maxLength?:number}) {return <View style={s.field}><Text style={s.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} editable={!disabled} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#818b93" multiline={multiline} maxLength={maxLength} style={[s.input,multiline&&{minHeight:92,textAlignVertical:'top'},disabled&&{opacity:.5}]}/></View>;}
export function Group({label,children}:React.PropsWithChildren<{label:string}>) {return <View style={s.field}><Text style={s.fieldLabel}>{label}</Text><View style={s.choices}>{children}</View></View>;}
export function StatusLine() {
  const value=useMvp();
  const text={restoring:'연결 정보를 확인하고 있어요',onboarding:'시작 전 정보를 확인해 주세요',connecting:'최신 정보를 연결하고 있어요',connected:'최신 정보 연결됨',reconnecting:'연결 재확인 중 · 마지막 정보일 수 있어요',background:'앱 복귀 시 최신 정보를 확인합니다'}[value.status];
  return <View accessibilityLiveRegion="polite" style={s.status}><Text style={s.statusText}>{mvpIsMock?'모의 시연':'시연 데이터'} · {text}</Text></View>;
}
export function Page({children,title,home=false,footer,background='#fff'}:React.PropsWithChildren<{title?:string;home?:boolean;footer?:React.ReactNode;background?:string}>) {return <SafeAreaView style={[s.safe,{backgroundColor:background}]} edges={['top','bottom']}><View style={s.frame}>{home?<View style={s.homeHeader}><Brand/><Pressable accessibilityRole="button" accessibilityLabel="내정보" onPress={()=>router.push('/profile')} style={s.headerLink}><Icon name="gear" size={19}/><Text style={{fontWeight:'700'}}>내정보</Text></Pressable></View>:title?<View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="홈으로 돌아가기" style={s.back} onPress={()=>router.replace('/')}><Icon name="back"/></Pressable><Text style={s.headerTitle}>{title}</Text></View>:null}<StatusLine/><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.content,!!footer&&{paddingBottom:25}]}>{children}</ScrollView>{footer}</View></SafeAreaView>;}
export function Loading(){return <SafeAreaView style={[s.safe,{justifyContent:'center',alignItems:'center',gap:24}]}><Brand large/><ActivityIndicator color={colors.navy}/><Body muted>내게 필요한 안내를 준비하고 있어요.</Body></SafeAreaView>;}
export const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#fff'},frame:{flex:1,width:'100%',maxWidth:480,alignSelf:'center'},
  content:{padding:18,paddingBottom:32,gap:22},brand:{fontSize:31,fontWeight:'900',letterSpacing:-1.8},
  homeHeader:{paddingHorizontal:18,paddingVertical:16,backgroundColor:'#f2f4f4',flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  header:{height:58,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:10},headerTitle:{fontSize:19,fontWeight:'800',color:colors.ink},
  headerLink:{minHeight:48,minWidth:76,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5},back:{width:48,height:48,alignItems:'center',justifyContent:'center'},
  status:{paddingHorizontal:14,paddingVertical:7,backgroundColor:'#fff6dd'},statusText:{fontSize:11,color:'#6b561e',textAlign:'center'},
  body:{fontSize:16,lineHeight:25,color:colors.ink},heading:{fontSize:21,lineHeight:28,fontWeight:'800',color:colors.ink,letterSpacing:-.7},
  card:{backgroundColor:'#f3f5f7',padding:17,borderRadius:20,gap:13},cardTitle:{fontSize:17,fontWeight:'800',color:colors.ink},
  button:{minHeight:52,backgroundColor:colors.navy,borderRadius:12,padding:13,justifyContent:'center',alignItems:'center'},secondary:{backgroundColor:'#eaf1f4'},buttonText:{fontSize:16,fontWeight:'700',color:'#fff',textAlign:'center'},
  field:{gap:10},fieldLabel:{fontSize:14,fontWeight:'700',color:colors.ink},input:{minHeight:49,borderWidth:1,borderColor:'#77818b',backgroundColor:'#fff',borderRadius:10,paddingHorizontal:12,paddingVertical:11,fontSize:16,color:colors.ink},
  choices:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{minHeight:48,justifyContent:'center',borderRadius:9,borderWidth:1,borderColor:'#e0e4e8',paddingHorizontal:12,paddingVertical:11,backgroundColor:'#fff'},chipSelected:{backgroundColor:'#e9f3f7',borderColor:'#6b8798'},
  row:{flexDirection:'row',alignItems:'center',gap:10},section:{gap:14},notice:{borderRadius:12,backgroundColor:'#fff4dc',padding:14,gap:8},
  step:{flexDirection:'row',gap:12,paddingVertical:10},stepNumber:{width:28,height:28,borderRadius:14,backgroundColor:'#f0f2f4',textAlign:'center',lineHeight:28,fontSize:14,fontWeight:'800'},
  actionBar:{flexDirection:'row',gap:8,padding:12,borderTopWidth:1,borderColor:colors.line,backgroundColor:'#fff'},action:{flex:1,minHeight:66,borderWidth:1,borderColor:colors.ink,borderRadius:12,alignItems:'center',justifyContent:'center',gap:6},
});
