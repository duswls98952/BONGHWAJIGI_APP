import type {MvpTokens} from '../api/mvp-types';
import {ApiError} from '../api/http';

type Storage = {get:(key:string)=>Promise<string|null>;set:(key:string,value:string)=>Promise<void>;remove:(key:string)=>Promise<void>};
export type SavedSession={origin:string;tokens:MvpTokens;onboarded:boolean};
export class SessionManager {
  private epoch=0;
  private refreshing:Promise<SavedSession>|null=null;
  private writes:Promise<unknown>=Promise.resolve();
  private readonly key='bonghwa_mvp_session_v1';
  constructor(private storage:Storage, private origin:string, private renew:(refresh:string)=>Promise<MvpTokens>) {}
  async load():Promise<SavedSession|null> {
    const stamp=this.epoch;
    await this.writes;
    const raw=await this.storage.get(this.key);
    if (!raw || stamp!==this.epoch) return null;
    try {
      const value=JSON.parse(raw) as SavedSession;
      if (value.origin!==this.origin || typeof value.tokens?.access_token!=='string' || typeof value.tokens.refresh_token!=='string' || typeof value.tokens.user_id!=='string') return null;
      return value;
    } catch {return null;}
  }
  private write<R>(operation:()=>Promise<R>):Promise<R> {
    const next=this.writes.then(operation);
    this.writes=next.catch(()=>undefined);
    return next;
  }
  private persist(tokens:MvpTokens,onboarded:boolean,stamp:number) {
    const value:SavedSession={origin:this.origin,tokens,onboarded};
    return this.write(async()=>{
      if(stamp!==this.epoch)throw new ApiError(401,'SESSION_CHANGED');
      await this.storage.set(this.key,JSON.stringify(value));
      if(stamp!==this.epoch)throw new ApiError(401,'SESSION_CHANGED');
      return value;
    });
  }
  async save(tokens:MvpTokens, onboarded=false) {
    return this.persist(tokens,onboarded,++this.epoch);
  }
  async complete() {
    const stamp=this.epoch;
    const value=await this.load();if (!value) throw new ApiError(401,'SESSION_REQUIRED');
    return this.persist(value.tokens,true,stamp);
  }
  async clear() {this.epoch++;await this.write(()=>this.storage.remove(this.key));}
  async refresh():Promise<SavedSession> {
    if (this.refreshing) return this.refreshing;
    const stamp=this.epoch;
    this.refreshing=(async()=>{
      const old=await this.load();if (!old) throw new ApiError(401,'SESSION_REQUIRED');
      const tokens=await this.renew(old.tokens.refresh_token);
      if (stamp!==this.epoch) throw new ApiError(401,'SESSION_CHANGED');
      const current=await this.load();
      if (current?.tokens.refresh_token!==old.tokens.refresh_token) throw new ApiError(401,'SESSION_CHANGED');
      return this.persist(tokens,old.onboarded,stamp);
    })();
    try {return await this.refreshing;} finally {this.refreshing=null;}
  }
}
