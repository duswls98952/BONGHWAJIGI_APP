import type {MvpSchema} from '../api/mvp-types';
import {freshUntil} from './core';
import {currentMapLocation} from './mapGeometry';

export function currentRelevantAlert(alert:MvpSchema<'AlertData'>|null|undefined,location:MvpSchema<'LocationData'>|null|undefined,now:number,requiredLocation=0){
  return !!(alert&&alert.status==='active'&&alert.relevance.status==='inside'&&freshUntil(alert.valid_until,now)&&currentMapLocation(location,now,requiredLocation));
}
type AlertHistory={maxObserved:number;announced:number;closed:number};

/** Seed each account's first sync silently; policy refreshes never replay alerts. */
export function createAlertUpdates(){
  const accounts=new Map<string,Map<string,AlertHistory>>();
  return {
    observe(account:string,alerts:MvpSchema<'AlertData'>[],now:number,locationReady=true){
      let seen=accounts.get(account);
      const initial=!seen;
      if(!seen){seen=new Map();accounts.set(account,seen);}
      const pending:MvpSchema<'AlertData'>[]=[];
      // Learn the highest revision and terminal states before considering delivery.
      // An out-of-order active record cannot revive a newer cancelled alert.
      for(const alert of alerts){
        if(!Number.isSafeInteger(alert.revision)||alert.revision<0)continue;
        const history=seen.get(alert.id)??{maxObserved:-1,announced:-1,closed:-1};
        history.maxObserved=Math.max(history.maxObserved,alert.revision);
        if(alert.status!=='active'||!freshUntil(alert.valid_until,now))history.closed=Math.max(history.closed,alert.revision);
        seen.set(alert.id,history);
      }
      for(const alert of alerts){
        const history=seen.get(alert.id);
        if(!history||alert.revision!==history.maxObserved||alert.revision<=history.announced||alert.revision<=history.closed||!locationReady||alert.status!=='active'||alert.relevance.status!=='inside'||!freshUntil(alert.valid_until,now))continue;
        history.announced=alert.revision;
        if(!initial)pending.push(alert);
      }
      return pending;
    },
  };
}
