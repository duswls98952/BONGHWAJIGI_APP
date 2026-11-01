import {settings} from '../config';
import {createMvpApi} from '../api/client';
import {ApiError, createVersionedHttpTransport, type RequestOptions, type VersionedTransport} from '../api/http';
import type {MvpSchema} from '../api/mvp-types';
import {secure} from '../platform/storage';
import {SessionManager} from './session';
import {createMvpMock} from './mock';

export const mvpMock=createMvpMock();
export const mockMode=settings.mode==='mock';
const origin=mockMode?'mock':settings.baseUrl.replace(/\/$/,'');
const network=createVersionedHttpTransport<MvpSchema<'Meta'>>(origin,async()=> (await sessions.load())?.tokens.access_token??null,'0.2.0-mvp',{allowLoopbackHttp:settings.allowLoopbackHttp});
const raw=mockMode?mvpMock.transport:network;
const anonymous=createMvpApi(raw);
export const sessions=new SessionManager(secure,origin,async refresh=>(await anonymous.refresh(refresh)).data);
const authenticated:VersionedTransport<MvpSchema<'Meta'>>=async<T,>(path:string,options:RequestOptions={})=>{
  try{return await raw<T>(path,options);}
  catch(error) {
    if(!(error instanceof ApiError)||error.status!==401||options.public)throw error;
    await sessions.refresh();
    return raw<T>(path,options);
  }
};
export const mvpApi=createMvpApi(authenticated);
