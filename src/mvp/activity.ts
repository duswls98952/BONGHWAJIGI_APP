/** Native AppState may be null until its first bridge event. Only known inactive states pause. */
export function appIsForeground(state:string|null|undefined){
  return state!=='background'&&state!=='inactive';
}
