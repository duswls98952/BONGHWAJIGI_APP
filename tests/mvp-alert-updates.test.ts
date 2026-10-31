import assert from 'node:assert/strict';
import test from 'node:test';
import fixtures from '../docs/api/mvp-fixtures.json';
import type {MvpSchema} from '../src/api/mvp-types';
import {createAlertUpdates,currentRelevantAlert} from '../src/mvp/alertUpdates';
import {appIsForeground} from '../src/mvp/activity';

const now=Date.parse('2026-11-01T00:00:00Z');
function alert(id='alert-a',revision=1):MvpSchema<'AlertData'>{
  return {...structuredClone(fixtures.home.data.alerts[0]) as MvpSchema<'AlertData'>,id,revision,valid_until:new Date(now+60000).toISOString()};
}
test('initial backlog is silent and new official revisions notify once across refreshes',()=>{
  const updates=createAlertUpdates();
  assert.deepEqual(updates.observe('a',[alert()],now),[]);
  assert.deepEqual(updates.observe('a',[alert(),alert('new')],now).map(a=>a.id),['new']);
  assert.deepEqual(updates.observe('a',[alert(),alert('new')],now),[]);
  assert.deepEqual(updates.observe('a',[alert('new',2)],now).map(a=>a.revision),[2]);
  assert.deepEqual(updates.observe('a',[alert('new',1)],now),[]);
  assert.deepEqual(updates.observe('a',[alert('new',2)],now),[]);
});
test('accounts seed independently and returning to an existing account cannot replay its backlog',()=>{
  const updates=createAlertUpdates();
  updates.observe('a',[],now);
  assert.equal(updates.observe('a',[alert()],now).length,1);
  assert.deepEqual(updates.observe('b',[alert()],now),[]);
  assert.deepEqual(updates.observe('a',[alert()],now),[]);
});
test('cancelled and expired revisions cannot be revived by an out-of-order active record',()=>{
  for(const patch of [{status:'cancelled'},{status:'archived'},{status:'unconfirmed_or_expired'},{valid_until:new Date(now).toISOString()}]){
    const updates=createAlertUpdates();updates.observe('a',[],now);
    assert.deepEqual(updates.observe('a',[{...alert(),...patch} as MvpSchema<'AlertData'>],now),[]);
    assert.deepEqual(updates.observe('a',[alert()],now),[]);
  }
});
test('unknown or outside alerts remain eligible for their first inside transition at the same revision',()=>{
  for(const status of ['unknown','outside','uncertain']){
    const updates=createAlertUpdates();
    assert.deepEqual(updates.observe('a',[{...alert(),relevance:{status,reason_code:'PENDING'}}],now),[]);
    assert.equal(updates.observe('a',[alert()],now).length,1);
    assert.deepEqual(updates.observe('a',[{...alert(),relevance:{status,reason_code:'PENDING'}}],now),[]);
    assert.deepEqual(updates.observe('a',[alert()],now),[]);
  }
});
test('missing location cannot consume a new eligible revision, and a newer outside revision blocks old active data',()=>{
  const updates=createAlertUpdates();
  assert.deepEqual(updates.observe('a',[alert()],now,false),[]);
  assert.equal(updates.observe('a',[alert()],now,true).length,1);
  updates.observe('a',[{...alert('new',3),relevance:{status:'outside',reason_code:'OUTSIDE'}}],now);
  assert.deepEqual(updates.observe('a',[alert('new',2)],now),[]);
  assert.equal(updates.observe('a',[alert('new',3)],now).length,1);
  assert.deepEqual(updates.observe('a',[alert('other',1),{...alert('other',2),status:'cancelled'}],now),[]);
  assert.deepEqual(updates.observe('a',[alert('other',1),alert('other',2)],now),[]);
});
test('banner eligibility follows current relevance and an unexpired unsuperseded location',()=>{
  const location={...structuredClone(fixtures.home.data.location) as MvpSchema<'LocationData'>,valid_until:new Date(now+60000).toISOString()};
  assert.equal(currentRelevantAlert(alert(),location,now),true);
  assert.equal(currentRelevantAlert({...alert(),relevance:{status:'outside',reason_code:'OUTSIDE'}},location,now),false);
  assert.equal(currentRelevantAlert(alert(),{...location,valid_until:new Date(now).toISOString()},now),false);
  assert.equal(currentRelevantAlert(alert(),location,now,location.input_revision+1),false);
  assert.equal(currentRelevantAlert(alert(),{...location,fix:null},now),false);
});
test('initial AppState bridge null does not prevent a visible app from loading its first home',()=>{
  for(const state of [null,undefined,'active'])assert.equal(appIsForeground(state),true);
  for(const state of ['background','inactive'])assert.equal(appIsForeground(state),false);
});
