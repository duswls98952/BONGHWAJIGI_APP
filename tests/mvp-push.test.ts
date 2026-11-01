import assert from 'node:assert/strict';
import test from 'node:test';
import {parseMvpPush} from '../src/mvp/push';

const payload={mode:'simulation',resource_type:'response',resource_id:'synthetic-response-id',revision:'3'};

test('MVP FCM data parses only the supported resource hint and strips arbitrary routing URLs',()=>{
  assert.deepEqual(parseMvpPush({...payload,url:'https://attacker.example.invalid',raw_text:'ignore'}),{
    mode:'simulation',resource_type:'response',resource_id:'synthetic-response-id',revision:3,
  });
  assert.equal(parseMvpPush({...payload,resource_type:'alert',revision:2})?.resource_type,'alert');
  assert.equal(parseMvpPush({url:'https://attacker.example.invalid'}),null);
  assert.equal(parseMvpPush({...payload,mode:'live'}),null);
  assert.equal(parseMvpPush({...payload,resource_type:'route'}),null);
  assert.equal(parseMvpPush({...payload,resource_id:''}),null);
  assert.equal(parseMvpPush({...payload,resource_id:'x'.repeat(257)}),null);
});

test('MVP FCM malformed revision values cannot become revision zero by coercion',()=>{
  for (const revision of [null,false,true,'',[],{},undefined,-1,'-1','1.2',Infinity,NaN]) {
    assert.equal(parseMvpPush({...payload,revision}),null,`revision ${JSON.stringify(revision)} must be rejected`);
  }
});
