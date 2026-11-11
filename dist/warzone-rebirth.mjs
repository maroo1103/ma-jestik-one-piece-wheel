/* Livraison Rebirth Island : GitHub Pages contrôle le pack présent sous
   dist/assets/Rebirth island.zip et n'active le modèle qu'après validation
   de ses 13 images + 2 cartes par le script d'importation. */
/* Ma_JesTik — roue en préparation, non publiée sans images/cartes contrôlées.
   Lieux de la carte 2026. Les anciens atlas de 11 POI omettent Turbine et l'Outpost non marqué. Références: annonce officielle Saison 02 et guide récent.
   Guide officiel : https://www.callofduty.com/guides/warzone/rebirth-island
   Les noms et les emplacements d'images correspondent à l'index de la roue. */
export const REBIRTH_GUIDE_URL="https://www.callofduty.com/guides/warzone/rebirth-island";
export const REBIRTH_POIS=Object.freeze([
  "Bioweapons",
  "Industries",
  "Chemical Engineering",
  "Dock",
  "Turbine",
  "Control Center",
  "Prison",
  "Harbor",
  "Headquarters",
  "Factory",
  "Living Quarters",
  "Outpost",
  "Stronghold"
]);
export const REBIRTH_MODEL=Object.freeze({
  id:"warzone-rebirth",
  name:"Warzone · Rebirth Island · Résurgence",
  choices:REBIRTH_POIS.map((name,index)=>({
    id:"rb"+String(index+1).padStart(2,'0'),
    name,
    originalImage:'assets/warzone/rebirth/poi-'+String(index+1).padStart(2,'0')+'.webp'
  })),
  selected:REBIRTH_POIS.map((_,index)=>"rb"+String(index+1).padStart(2,'0')),
  history:[],
  duration:'8'
});
