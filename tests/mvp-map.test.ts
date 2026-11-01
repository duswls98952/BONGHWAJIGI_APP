import assert from 'node:assert/strict';
import test from 'node:test';
import type {MvpSchema} from '../src/api/mvp-types';
import {currentMapLocation,mapGeometry,validBounds} from '../src/mvp/mapGeometry';

const now=Date.parse('2026-11-01T03:00:00Z');
const fix:MvpSchema<'LocationWrite'>={fix_id:'synthetic-map-fix',installation_id:'synthetic-installation',latitude:36.4,longitude:129.35,accuracy_m:10,captured_at:new Date(now).toISOString()};
const bounds={west:129.3,east:129.4,south:36.35,north:36.45};

test('map excludes missing, expired, superseded, and invalid coordinates',()=>{
  const state:MvpSchema<'HomeData'>['location']={revision:1,reason_codes:[],status:'available',fix,input_revision:2,valid_until:new Date(now+300000).toISOString()};
  assert.equal(currentMapLocation(state,now,2),fix);
  assert.equal(currentMapLocation(state,now,3),null);
  assert.equal(currentMapLocation(state,now+300000,2),null);
  assert.equal(currentMapLocation(null,now),null);
  for(const bad of [NaN,Infinity,91])assert.equal(currentMapLocation({...state,fix:{...fix,latitude:bad}},now),null);
  assert.equal(currentMapLocation({...state,fix:{...fix,accuracy_m:-1}},now),null);
});

test('related area rejects malformed or reversed boxes rather than drawing a false region',()=>{
  for(const input of [null,{}, {...bounds,west:130}, {...bounds,north:bounds.south}, {...bounds,east:181}, {...bounds,south:NaN}, {...bounds,west:'129.3'}])assert.equal(validBounds(input),null);
  assert.deepEqual(validBounds(bounds),bounds);
});

test('Naver box is clockwise and closed, using longitude as x and latitude as y',()=>{
  const {polygon}=mapGeometry(fix,bounds);
  assert.equal(polygon.length,5);
  assert.deepEqual(polygon[0],polygon.at(-1));
  const signedArea=polygon.slice(0,-1).reduce((total,p,i)=>{const q=polygon[i+1]!;return total+p.longitude*q.latitude-q.longitude*p.latitude;},0);
  assert.ok(signedArea<0);
});

test('camera region starts south-west and includes both outlying location and incident box',()=>{
  const outside={...fix,latitude:37,longitude:130};
  const {region}=mapGeometry(outside,bounds);
  assert.ok(region.latitude<bounds.south&&region.longitude<bounds.west);
  assert.ok(region.latitude+region.latitudeDelta>outside.latitude);
  assert.ok(region.longitude+region.longitudeDelta>outside.longitude);
  const {region:point}=mapGeometry(fix,null);
  assert.ok(point.latitude<fix.latitude&&point.latitude+point.latitudeDelta>fix.latitude);
  assert.ok(point.longitude<fix.longitude&&point.longitude+point.longitudeDelta>fix.longitude);
});

test('national overview contains no invented user marker or incident; removed inputs clear overlays',()=>{
  const known=mapGeometry(fix,bounds);assert.equal(known.location,fix);
  const removed=mapGeometry(null,null);
  assert.equal(removed.location,null);assert.equal(removed.bounds,null);assert.deepEqual(removed.polygon,[]);
  assert.ok(removed.region.latitudeDelta>1&&removed.region.longitudeDelta>1);
});
