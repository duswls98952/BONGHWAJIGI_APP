import assert from 'node:assert/strict';
import test from 'node:test';
import {ApiError} from '../src/api/http';
import type {MvpTokens} from '../src/api/mvp-types';
import {SessionManager} from '../src/mvp/session';

function deferred<T>() {
  let resolve!: (value:T)=>void;
  let reject!: (reason:unknown)=>void;
  const promise=new Promise<T>((yes,no)=>{resolve=yes;reject=no;});
  return {promise,resolve,reject};
}
function memoryStorage() {
  const values=new Map<string,string>();
  return {values,get:async(key:string)=>values.get(key)??null,set:async(key:string,value:string)=>{values.set(key,value);},remove:async(key:string)=>{values.delete(key);}};
}
function tokens(tag:string):MvpTokens {
  return {user_id:`user-${tag}`,scenario_id:'test-simulation',session_id:`session-${tag}`,access_token:`synthetic-access-${tag}`,refresh_token:`synthetic-refresh-${tag}`,token_type:'Bearer',expires_in:900,refresh_expires_at:'2030-01-01T00:00:00Z'};
}
const changed=(error:unknown)=>error instanceof ApiError && error.status===401 && error.code==='SESSION_CHANGED';

test('MVP refresh uses a single rotation for concurrent callers and preserves onboarding',async()=>{
  const entered=deferred<void>(), response=deferred<MvpTokens>();
  const seen:string[]=[];
  const manager=new SessionManager(memoryStorage(),'https://first.example.invalid',async refresh=>{
    seen.push(refresh);entered.resolve();return response.promise;
  });
  await manager.save(tokens('first'),true);
  const first=manager.refresh();await entered.promise;
  const second=manager.refresh(),third=manager.refresh();
  response.resolve(tokens('rotated'));
  const sessions=await Promise.all([first,second,third]);
  assert.deepEqual(seen,['synthetic-refresh-first']);
  for (const session of sessions) {
    assert.equal(session.tokens.refresh_token,'synthetic-refresh-rotated');
    assert.equal(session.onboarded,true);
  }
  assert.equal((await manager.load())?.tokens.access_token,'synthetic-access-rotated');
});

test('MVP logout during refresh rejects the late response and cannot restore credentials',async()=>{
  const entered=deferred<void>(),response=deferred<MvpTokens>();
  const storage=memoryStorage();
  const manager=new SessionManager(storage,'https://first.example.invalid',async()=>{entered.resolve();return response.promise;});
  await manager.save(tokens('first'));
  const pending=manager.refresh();const rejected=assert.rejects(pending,changed);
  await entered.promise;await manager.clear();response.resolve(tokens('late'));
  await rejected;
  assert.equal(await manager.load(),null);assert.equal(storage.values.size,0);
});

test('MVP logout also clears an in-flight secure-storage write',async()=>{
  const writing=deferred<void>(),release=deferred<void>();
  const storage=memoryStorage();let writes=0;
  const manager=new SessionManager({...storage,set:async(key,value)=>{
    if (++writes===2) {writing.resolve();await release.promise;}
    await storage.set(key,value);
  }},'https://first.example.invalid',async()=>tokens('rotated'));
  await manager.save(tokens('first'));
  const pending=manager.refresh(),rejected=assert.rejects(pending,changed);
  await writing.promise;const cleared=manager.clear();release.resolve();
  await Promise.all([cleared,rejected]);
  assert.equal(await manager.load(),null);assert.equal(storage.values.size,0);
});

test('MVP a new login cannot be overwritten by a previous account refresh',async()=>{
  const entered=deferred<void>(),response=deferred<MvpTokens>();
  const manager=new SessionManager(memoryStorage(),'https://first.example.invalid',async()=>{entered.resolve();return response.promise;});
  await manager.save(tokens('first'),true);
  const pending=manager.refresh(),rejected=assert.rejects(pending,changed);
  await entered.promise;await manager.save(tokens('new-account'));
  response.resolve(tokens('old-account-late'));await rejected;
  const current=await manager.load();
  assert.equal(current?.tokens.user_id,'user-new-account');assert.equal(current?.onboarded,false);
});

test('MVP persisted credentials are bound to the configured API origin',async()=>{
  const storage=memoryStorage();let attempts=0;
  const first=new SessionManager(storage,'https://first.example.invalid',async()=>tokens('rotated'));
  await first.save(tokens('first'),true);
  const second=new SessionManager(storage,'https://second.example.invalid',async()=>{attempts++;return tokens('wrong-origin');});
  assert.equal(await second.load(),null);
  await assert.rejects(second.refresh(),error=>error instanceof ApiError && error.code==='SESSION_REQUIRED');
  assert.equal(attempts,0);
  assert.equal((await first.load())?.tokens.user_id,'user-first');
});

test('MVP a failed refresh releases the single-flight lock for a later retry',async()=>{
  let calls=0;
  const manager=new SessionManager(memoryStorage(),'https://first.example.invalid',async()=>{
    if (++calls===1) throw new ApiError(503,'TEMPORARILY_UNAVAILABLE');
    return tokens('retry');
  });
  await manager.save(tokens('first'));
  await assert.rejects(manager.refresh(),error=>error instanceof ApiError && error.status===503);
  assert.equal((await manager.refresh()).tokens.access_token,'synthetic-access-retry');
  assert.equal(calls,2);
});

test('MVP onboarding completion retains the same session and malformed storage is ignored',async()=>{
  const storage=memoryStorage();
  const manager=new SessionManager(storage,'https://first.example.invalid',async()=>tokens('rotated'));
  await manager.save(tokens('first'));const completed=await manager.complete();
  assert.equal(completed.onboarded,true);assert.equal(completed.tokens.session_id,'session-first');
  const key=[...storage.values.keys()][0]!;
  storage.values.set(key,'{not valid JSON');assert.equal(await manager.load(),null);
  storage.values.set(key,JSON.stringify({origin:'https://first.example.invalid',tokens:{access_token:4}}));
  assert.equal(await manager.load(),null);
});
