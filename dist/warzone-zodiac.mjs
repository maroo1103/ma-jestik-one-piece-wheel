/* Call of Duty Warzone, carte Zodiac (Résurgence).
   Les captures proviennent du lot fourni par le propriétaire et sont publiées
   comme ressources statiques via dist/assets/warzone-pack.zip lors du déploiement.
   Source des noms : https://www.callofduty.com/guides/warzone/zodiac */
export const ZODIAC_GUIDE_URL='https://www.callofduty.com/guides/warzone/zodiac';
export const ZODIAC_POIS=Object.freeze([
  'Admin','Trackline','Furnace','Solar','Old Mines',
  'Dispatch','Depot','Sentinel','Cooling','R&D'
]);
export const ZODIAC_MODEL=Object.freeze({
  id:'warzone-zodiac',name:'Warzone · Zodiac · Résurgence',
  choices:ZODIAC_POIS.map((name,index)=>({
    id:'zd'+String(index+1).padStart(2,'0'),
    name,originalImage:'assets/warzone/zodiac/poi-'+String(index+1).padStart(2,'0')+'.webp'
  })),
  selected:ZODIAC_POIS.map((_,index)=>'zd'+String(index+1).padStart(2,'0')),
  history:[],duration:'8'
});
