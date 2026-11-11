/* Call of Duty Warzone, carte Hajin (Battle Royale).
   Les images réelles sont publiées depuis le lot fourni par le propriétaire
   par le workflow GitHub Pages (dist/assets/warzone-pack.zip).
   Source des noms : https://www.callofduty.com/guides/warzone/hajin */
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
  name:'Warzone · Hajin · Battle Royale',
  choices:HAJIN_POIS.map((name,index)=>({id:'hj'+String(index+1).padStart(2,'0'),name,originalImage:'assets/warzone/hajin/poi-'+String(index+1).padStart(2,'0')+'.webp'})),
  selected:HAJIN_POIS.map((_,index)=>'hj'+String(index+1).padStart(2,'0')),
  history:[],
  duration:'8'
});
