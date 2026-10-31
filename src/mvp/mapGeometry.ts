import type {MvpSchema} from '../api/mvp-types';
import {freshUntil} from './core';

export type MapBounds={west:number;east:number;south:number;north:number};
export type MapLocation=MvpSchema<'LocationWrite'>;
export type MvpMapProps={location?:MapLocation|null;bounds?:MapBounds|null;simulation?:boolean};

export function validCoordinate(latitude:number,longitude:number){
  return Number.isFinite(latitude)&&Number.isFinite(longitude)&&Math.abs(latitude)<=90&&Math.abs(longitude)<=180;
}
export function validBounds(value:unknown):MapBounds|null{
  if(!value||typeof value!=='object')return null;
  const b=value as MapBounds;
  if(!validCoordinate(b.south,b.west)||!validCoordinate(b.north,b.east)||b.south>=b.north||b.west>=b.east)return null;
  return {west:b.west,east:b.east,south:b.south,north:b.north};
}
export function currentMapLocation(value:MvpSchema<'HomeData'>['location']|null|undefined,now:number,minimumRevision=0):MapLocation|null{
  if(value?.status!=='available'||!freshUntil(value.valid_until,now)||value.input_revision<minimumRevision)return null;
  const fix=value.fix;
  return fix&&validCoordinate(fix.latitude,fix.longitude)&&Number.isFinite(fix.accuracy_m)&&fix.accuracy_m>=0?fix:null;
}
export function mapGeometry(inputLocation:MvpMapProps['location'],inputBounds:MvpMapProps['bounds']){
  const location=inputLocation&&validCoordinate(inputLocation.latitude,inputLocation.longitude)?inputLocation:null;
  const bounds=validBounds(inputBounds);
  // Naver uses clockwise, closed rings. This box is the supplied related area, not a fire perimeter.
  const polygon=bounds?[
    {latitude:bounds.south,longitude:bounds.west},
    {latitude:bounds.north,longitude:bounds.west},
    {latitude:bounds.north,longitude:bounds.east},
    {latitude:bounds.south,longitude:bounds.east},
    {latitude:bounds.south,longitude:bounds.west},
  ]:[];
  if(!location&&!bounds){
    // A labelled national overview, never a substitute for the user's location.
    return {location,bounds,polygon,region:{latitude:33,longitude:124,latitudeDelta:6,longitudeDelta:8}};
  }
  let south=bounds?.south??location!.latitude,north=bounds?.north??location!.latitude;
  let west=bounds?.west??location!.longitude,east=bounds?.east??location!.longitude;
  if(location){south=Math.min(south,location.latitude);north=Math.max(north,location.latitude);west=Math.min(west,location.longitude);east=Math.max(east,location.longitude);}
  const yPadding=Math.max((north-south)*.15,.003),xPadding=Math.max((east-west)*.15,.003);
  south=Math.max(-90,south-yPadding);north=Math.min(90,north+yPadding);
  west=Math.max(-180,west-xPadding);east=Math.min(180,east+xPadding);
  // Region starts at the south-west corner, not the centre.
  return {location,bounds,polygon,region:{latitude:south,longitude:west,latitudeDelta:north-south,longitudeDelta:east-west}};
}
