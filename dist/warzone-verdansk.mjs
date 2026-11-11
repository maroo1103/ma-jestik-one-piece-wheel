/* Ma_JesTik — roue en préparation, non publiée sans images/cartes contrôlées.
   Inventaire préparatoire: les 20 POI de base et Drone Labs (2026). Les nouveaux points saisonniers (Signal Station, Grazna-7, Overlook) doivent être vérifiés avant publication.
   Guide officiel : https://www.callofduty.com/guides/tac-atlas-verdansk
   Les noms et les emplacements d'images correspondent à l'index de la roue. */
export const VERDANSK_GUIDE_URL="https://www.callofduty.com/guides/tac-atlas-verdansk";
export const VERDANSK_POIS=Object.freeze([
  "Dam",
  "Military Base",
  "Quarry",
  "Airport",
  "TV Station",
  "Storage Town",
  "Superstore",
  "Stadium",
  "Lumber",
  "Boneyard",
  "Train Station",
  "Hospital",
  "Downtown",
  "Farmland",
  "Promenade West",
  "Promenade East",
  "Hills",
  "Park",
  "Port",
  "Prison",
  "Drone Labs"
]);
export const VERDANSK_MODEL=Object.freeze({
  id:"warzone-verdansk",
  name:"Warzone · Verdansk · Battle Royale",
  choices:VERDANSK_POIS.map((name,index)=>({
    id:"vd"+String(index+1).padStart(2,'0'),
    name,
    originalImage:'assets/warzone/verdansk/poi-'+String(index+1).padStart(2,'0')+'.webp'
  })),
  selected:VERDANSK_POIS.map((_,index)=>"vd"+String(index+1).padStart(2,'0')),
  history:[],
  duration:'8'
});
