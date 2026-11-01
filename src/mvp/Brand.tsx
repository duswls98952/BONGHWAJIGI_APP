import {Text,View} from 'react-native';
import {useFonts} from 'expo-font';
import Svg,{ClipPath,Defs,G,Path,Rect} from 'react-native-svg';

// The unmodified ROKG font and the exact stroke paths used by public/prototype.
// Attribution and usage conditions: public/prototype/ROKG-SOURCE.txt.
export default function Brand({large=false}:{large?:boolean}){
  const [loaded]=useFonts({ROKG:require('../../public/prototype/ROKG_R.ttf')});
  const size=large?64:31;
  const hwaRight='M782 -95H674V776H782V410H894V308H782Z';
  return <View accessible accessibilityLabel="봉화지기" style={{flexDirection:'row',alignItems:'center',gap:size*.04,height:size*1.3}}>
    <Svg width={size*1.92} height={size} viewBox="0 0 1824 950" aria-hidden>
      <Defs>
        <ClipPath id="hwaTop"><Rect x={670} y={410} width={230} height={366}/></ClipPath>
        <ClipPath id="hwaMid"><Rect x={670} y={308} width={230} height={102}/></ClipPath>
        <ClipPath id="hwaBottom"><Rect x={670} y={-95} width={230} height={403}/></ClipPath>
      </Defs>
      <G transform="translate(0 800) scale(1 -1)" fillRule="evenodd">
        <Path fill="#003764" d="M685 700V772H792V449H510V378H856V285H56V378H401V449H120V772H227V700ZM685 541V609H227V541Z"/>
        <Path fill="#e4032e" d="M668 62Q668 22 651.5 -13.5Q635 -49 606 -76Q577 -103 538.5 -118.5Q500 -134 456 -134Q412 -134 373.5 -118.5Q335 -103 306 -76Q277 -49 260.5 -13.5Q244 22 244 62Q244 102 260.5 137.5Q277 173 306 200Q335 227 373.5 242.5Q412 258 456 258Q500 258 538.5 242.5Q577 227 606 200Q635 173 651.5 137.5Q668 102 668 62ZM561 62Q561 105 530.0 135.5Q499 166 456 166Q413 166 382.0 135.5Q351 105 351 62Q351 19 382.0 -11.5Q413 -42 456 -42Q499 -42 530.0 -11.5Q561 19 561 62Z"/>
        <G transform="translate(912 0)">
          <Path fill="#ec8b32" d="M266 689V782H383V689H588V596H60V689Z"/>
          <Path fill="#003764" d="M538 385Q538 345 521.5 309.0Q505 273 476 246Q436 209 379 195V85H607V-10H42V85H271V195Q212 210 174 246Q145 273 128.5 309.0Q112 345 112 385Q112 425 128.5 461.0Q145 497 174 524Q203 551 242.0 566.0Q281 581 325 581Q369 581 408.0 566.0Q447 551 476 524Q505 497 521.5 461.0Q538 425 538 385ZM433 385Q433 428 401.5 459.0Q370 490 325 490Q280 490 249.0 459.0Q218 428 218 385Q218 342 249.0 311.0Q280 280 325 280Q370 280 401.5 311.0Q433 342 433 385Z"/>
          <Path fill="#ec8b32" d={hwaRight} clipPath="url(#hwaTop)"/>
          <Path fill="#e4032e" d={hwaRight} clipPath="url(#hwaMid)"/>
          <Path fill="#3c9dce" d={hwaRight} clipPath="url(#hwaBottom)"/>
        </G>
      </G>
    </Svg>
    <Text accessible={false} style={{fontFamily:loaded?'ROKG':undefined,fontSize:size,fontWeight:'700',color:'#292d31',includeFontPadding:false}}>지기</Text>
  </View>;
}
