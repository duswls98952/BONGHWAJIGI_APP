import React from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Path} from 'react-native-svg';
import {router} from 'expo-router';
import {useMvp} from './Runtime';
import Brand from './Brand';
export {default as Brand} from './Brand';

export const colors={ink:'#20262d',navy:'#003764',muted:'#20262d',card:'#f3f5f7',line:'#dfe3e7',blue:'#245c74',red:'#b93836',paper:'#fff'};
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
    sun:'M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M19.8 4.2l-2.1 2.1M6.3 17.7l-2.1 2.1',
    checklist:'M4 4h16v16H4zM8 12l3 3 5-6',
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d={paths[name]??paths.warning}/>{name==='pin'&&<Circle cx={12} cy={9} r={2}/>} {name==='gear'&&<Circle cx={12} cy={12} r={3}/>} {name==='person'&&<Circle cx={12} cy={6} r={4}/>} {name==='sun'&&<Circle cx={12} cy={12} r={4}/>}</Svg>;
}
export function Body({children,muted=false,small=false}:React.PropsWithChildren<{muted?:boolean;small?:boolean}>) {return <Text style={[s.body,muted&&{color:colors.muted},small&&{fontSize:13,lineHeight:21}]}>{children}</Text>;}
export function Button({title,onPress,disabled=false,secondary=false,danger=false}:{title:string;onPress:()=>void;disabled?:boolean;secondary?:boolean;danger?:boolean}) {return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,danger&&{backgroundColor:colors.red,borderColor:colors.red},pressed&&{opacity:.7},disabled&&{backgroundColor:'#e1e5e9',borderColor:'#a2abb2'}]}><Text style={[s.buttonText,secondary&&!danger&&{color:colors.navy},disabled&&{color:'#58636c'}]}>{title}</Text></Pressable>;}
export function Chip({label,selected,onPress}:{label:string;selected:boolean;onPress:()=>void}) {return <Pressable accessibilityRole="checkbox" accessibilityState={{checked:selected}} aria-checked={selected} onPress={onPress} style={[s.chip,selected&&s.chipSelected]}><Text style={{fontSize:14,fontWeight:'600',color:selected?colors.blue:colors.ink}}>{selected?'✓ ':''}{label}</Text></Pressable>;}
export function Card({children,title,tint}:React.PropsWithChildren<{title?:string;tint?:string}>) {return <View style={[s.card,tint&&{backgroundColor:tint}]}>{title&&<Text accessibilityRole="header" style={s.cardTitle}>{title}</Text>}{children}</View>;}
export function Field({label,value,onChangeText,placeholder,disabled=false,multiline=false,maxLength=200}:{label:string;value:string;onChangeText:(value:string)=>void;placeholder?:string;disabled?:boolean;multiline?:boolean;maxLength?:number}) {return <View style={s.field}><Text style={s.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} editable={!disabled} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#818b93" multiline={multiline} maxLength={maxLength} style={[s.input,multiline&&{minHeight:92,textAlignVertical:'top'},disabled&&{opacity:.5}]}/></View>;}
export function Group({label,children}:React.PropsWithChildren<{label:string}>) {return <View style={s.field}><Text style={s.fieldLabel}>{label}</Text><View style={s.choices}>{children}</View></View>;}
export function StatusLine() {
  const value=useMvp();
  if(value.status!=='reconnecting')return null;
  return <View accessibilityLiveRegion="polite" style={s.status}><Text style={s.statusText}>연결을 다시 확인하고 있어요.</Text></View>;
}
export function Page({children,title,home=false,footer,background='#fff',scrollRef,onContentSizeChange}:React.PropsWithChildren<{title?:string;home?:boolean;footer?:React.ReactNode;background?:string;scrollRef?:React.RefObject<React.ComponentRef<typeof ScrollView>|null>;onContentSizeChange?:(width:number,height:number)=>void}>) {return <SafeAreaView style={[s.safe,{backgroundColor:home?'#f2f4f4':background}]} edges={['top','bottom']}><View style={[s.frame,{backgroundColor:background}]}>{home?<View style={s.homeHeader}><Brand/><Pressable accessibilityRole="button" accessibilityLabel="내정보" onPress={()=>router.push('/profile')} style={s.headerLink}><Icon name="gear" size={18}/><Text style={{fontSize:15,fontWeight:'700',color:'#292d31'}}>내정보</Text></Pressable></View>:title?<View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="이전 화면으로 돌아가기" style={s.back} onPress={()=>router.canGoBack()?router.back():router.replace('/')}><Icon name="back"/></Pressable><Text style={s.headerTitle}>{title}</Text></View>:null}<StatusLine/><ScrollView ref={scrollRef} onContentSizeChange={onContentSizeChange} keyboardShouldPersistTaps="handled" contentContainerStyle={[s.content,home&&{paddingTop:14},!!footer&&{paddingBottom:25}]}>{children}</ScrollView>{footer}</View></SafeAreaView>;}
export function Loading(){return <SafeAreaView style={[s.safe,{justifyContent:'center',alignItems:'center',gap:24}]}><Brand large/><ActivityIndicator color={colors.navy}/></SafeAreaView>;}
export const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#fff'},frame:{flex:1,width:'100%',maxWidth:390,alignSelf:'center'},
  content:{paddingHorizontal:16,paddingTop:6,paddingBottom:30,gap:26},brand:{fontSize:31,fontWeight:'700'},
  homeHeader:{paddingHorizontal:16,height:59,backgroundColor:'#f2f4f4',flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  header:{height:50,flexDirection:'row',alignItems:'center',gap:0,paddingHorizontal:8},headerTitle:{fontSize:18,fontWeight:'700',color:colors.ink,letterSpacing:-.5},
  headerLink:{minHeight:48,minWidth:76,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,transform:[{translateY:3}]},back:{width:48,height:48,alignItems:'center',justifyContent:'center'},
  status:{paddingHorizontal:14,paddingVertical:7,backgroundColor:'#fff6dd'},statusText:{fontSize:11,color:'#6b561e',textAlign:'center'},
  body:{fontSize:15,lineHeight:23,color:colors.ink},heading:{fontSize:20,lineHeight:27,fontWeight:'700',color:colors.ink,letterSpacing:-.7},
  card:{backgroundColor:'#f3f5f7',padding:16,borderRadius:17,gap:16},cardTitle:{fontSize:17,fontWeight:'700',color:colors.ink,letterSpacing:-.4},
  button:{minHeight:52,backgroundColor:colors.navy,borderWidth:1,borderColor:colors.navy,borderRadius:12,padding:13,justifyContent:'center',alignItems:'center'},secondary:{backgroundColor:'#fff',borderColor:colors.blue},buttonText:{fontSize:16,fontWeight:'700',color:'#fff',textAlign:'center'},
  field:{gap:9},fieldLabel:{fontSize:13,fontWeight:'700',color:colors.ink},input:{minHeight:48,borderWidth:1,borderColor:colors.ink,backgroundColor:'#fff',borderRadius:8,paddingHorizontal:11,paddingVertical:11,fontSize:15,color:colors.ink},
  choices:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{minHeight:48,justifyContent:'center',borderRadius:8,borderWidth:1,borderColor:'#87949d',paddingHorizontal:11,paddingVertical:10,backgroundColor:'#fff'},chipSelected:{backgroundColor:'#dcecf4',borderColor:colors.blue},
  row:{flexDirection:'row',alignItems:'center',gap:10},section:{gap:14},notice:{borderRadius:12,backgroundColor:'#fff4dc',padding:14,gap:8},
  step:{flexDirection:'row',gap:12,paddingVertical:10},stepNumber:{width:28,height:28,borderRadius:14,backgroundColor:'#f0f2f4',textAlign:'center',lineHeight:28,fontSize:14,fontWeight:'800'},
  actionBar:{flexDirection:'row',gap:8,paddingHorizontal:16,paddingVertical:8,backgroundColor:'#fff'},action:{flex:1,minHeight:56,borderWidth:1,borderColor:colors.ink,borderRadius:8,backgroundColor:colors.card,alignItems:'center',justifyContent:'center',gap:3},
});
