// Cartes de La Roue : Fortnite historique et Warzone (Hajin, Zodiac).
// Images statiques du site : aucune requête Worker ni D1.
const $=id=>document.getElementById(id);
const mapOpen=$('mapOpen');
const warzoneOpen=$('warzoneMapOpen');
const dialog=$('mapDialog');
const close=$('mapClose');
const panel=dialog.querySelector('.map-dialog-panel');
const original={
  src:'assets/carte-lieux.webp',title:"Carte de l'île · 12 lieux",
  eyebrow:'FORTNITE × ONE PIECE',
  alt:'Carte complète de Fortnite One Piece avec les douze lieux nommés en français'
};
const maps={
  'warzone-hajin':{
    src:'assets/warzone/hajin/map-full.png',
    title:'Hajin · 13 lieux',eyebrow:'WARZONE · BATTLE ROYALE',
    alt:'Carte officielle Hajin avec les treize lieux nommés'
  },
  'warzone-zodiac':{
    src:'assets/warzone/zodiac/map-full.png',
    title:'Zodiac · 10 lieux',eyebrow:'WARZONE · RÉSURGENCE',
    alt:'Carte officielle Zodiac avec les dix lieux nommés'
  }
};
function openMap(model='fortnite'){
  if(dialog.open)return;
  const selected=maps[model]||original;
  if(model!=='fortnite'&&!window.warzoneAssetsReady)return;
  dialog.dataset.warzone=model==='fortnite'?'false':'true';
  $('mapDialogImage').src=selected.src;
  $('mapDialogImage').alt=selected.alt;
  $('mapDialogFrame').setAttribute('aria-label',selected.alt);
  $('mapDialogGame').textContent=selected.eyebrow;
  $('mapDialogTitle').textContent=selected.title;
  $('mapImageFullLink').href=selected.src;
  if(typeof window.showWheelDialog==='function')window.showWheelDialog(dialog);
  else dialog.showModal();
}
mapOpen.addEventListener('click',()=>openMap('fortnite'));
warzoneOpen.addEventListener('click',()=>openMap(warzoneOpen.dataset.mapGame));
close.addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=panel.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||
     event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
});
// Ne pas lancer le tirage lorsque la carte ou un autre dialogue est ouvert.
document.addEventListener('keydown',event=>{
  if(dialog.open&&event.code==='Space')event.stopImmediatePropagation();
},true);
