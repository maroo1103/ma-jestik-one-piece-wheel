/* Sources officielles : https://www.callofduty.com/guides/warzone/hajin
   Roue Hajin, version intermédiaire : 13 noms confirmés, photos non intégrées.
   NE PAS prétendre que les logos MJ de secours sont des captures du jeu. */
export const HAJIN_GUIDE_URL = 'https://www.callofduty.com/guides/warzone/hajin';
export const HAJIN_POIS = Object.freeze([
  '14th Political Prison',
  'Chang-san Air Base',
  'Deadtown',
  'Imjin Farmland',
  'Cheongun Village',
  'Haneul Nuclear Reactor',
  'Mirae General Hospital',
  'NuriGo Mall',
  'Cheonwang Peak Array',
  'The Grid',
  'Songdo Wharf',
  'Wolves Stadium',
  'Hajin River Heights'
]);
export const HAJIN_MODEL = Object.freeze({
  id:'warzone-hajin',
  name:'Warzone · Hajin (images à compléter)',
  choices:HAJIN_POIS.map((name,index)=>({id:'hj'+String(index+1).padStart(2,'0'),name,originalImage:'/icons/mj-source.webp'})),
  selected:HAJIN_POIS.map((_,index)=>'hj'+String(index+1).padStart(2,'0')),
  history:[],
  duration:'8'
});
export function hajinImageCount(wheel) {
  return (wheel?.choices || []).filter(choice=>choice.originalImage!=='/icons/mj-source.webp').length;
}
