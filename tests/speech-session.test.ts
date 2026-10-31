import assert from 'node:assert/strict';
import test from 'node:test';
import {SpeechSession,speechErrorMessage} from '../src/platform/speechSession';

test('partials never submit, and duplicate finals cannot submit the same speech twice',()=>{
  const session = new SpeechSession();
  const id = session.begin('response-a')!;
  assert.deepEqual(session.result(id,' 계단을 ',false,true),{text:'계단을',final:null});
  assert.deepEqual(session.result(id,' 계단을 이용하기 어려워요 ',true,true),{
    text:'계단을 이용하기 어려워요',final:{id,sessionKey:'response-a',text:'계단을 이용하기 어려워요',onDevice:true},
  });
  assert.equal(session.result(id,'계단을 이용하기 어려워요',true,true),null);
  assert.equal(session.result(id,'계단',false,true),null);
  assert.equal(session.begin('response-a'),null);
  assert.equal(session.finish(id),true);
  assert.notEqual(session.begin('response-a'),id);
});

test('cancellation invalidates pending permission work and late results before another disaster starts',()=>{
  const session = new SpeechSession();
  const old = session.begin('old-disaster')!;
  session.cancel();
  assert.equal(session.isCurrent(old,'old-disaster'),false);
  const current = session.begin('new-disaster')!;
  assert.equal(session.result(old,'빠져나갈 수 있어요',true,false),null);
  assert.equal(session.finish(old),false);
  assert.equal(session.isCurrent(current,'new-disaster'),true);
  assert.equal(session.isCurrent(current,'old-disaster'),false);
  assert.equal(session.result(current,'아직 빠져나가기 어려워요',true,false)?.final?.sessionKey,'new-disaster');
});

test('empty speech is not a final response and complete negative wording is preserved',()=>{
  const session = new SpeechSession();
  const id = session.begin('response')!;
  assert.equal(session.result(id,' \n ',true,false),null);
  const text = '숨이 차요? 아니요. 숨이 차지 않고, 계단은 이용할 수 없어요.';
  assert.equal(session.result(id,text,true,false)?.final?.text,text);
  session.finish(id);
  assert.equal(session.result(id,'늦은 결과',true,false),null);
});

test('recognition failures provide recovery without interpreting health or emergency state',()=>{
  for (const code of ['not-allowed','no-speech','speech-timeout','network','language-not-supported','service-not-allowed','busy','too-many-requests','audio-capture','interrupted','unknown']) {
    const message = speechErrorMessage(code);
    assert.ok(message.length > 10);
    assert.doesNotMatch(message,/안전합니다|상태를 저장|신고했/);
  }
});
