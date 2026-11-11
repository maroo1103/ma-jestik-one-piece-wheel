import { TAU, normalise, indexAtPointer, targetAngle, randomIndex } from './engine.mjs';
import { readImages, saveImage, deleteImage, prepareImage } from './image-storage.mjs';
import { MAX_CHOICES, MAX_WHEELS, FALLBACK_IMAGE, makeId, makeChoice, loadWheelLibrary, saveWheelLibrary, wheelToPois, imageKey, cleanNames, parseWheelImport } from './wheel-library.mjs';
import { HAJIN_GUIDE_URL } from './warzone-hajin.mjs';
let POIS = [
  ['01', 'Littoral de la liberté', ['Littoral de', 'la liberté']],
  ['02', 'Le coffre', ['Le coffre']],
  ['03', 'Bivouac des boucaniers', ['Bivouac des', 'boucaniers']],
  ['04', "Fort de Fortune's", ['Fort de', "Fortune's"]],
  ['05', 'Lueur des lanternes', ['Lueur des', 'lanternes']],
  ['06', 'Arlong Park', ['Arlong Park']],
  ['07', 'Mont maudit', ['Mont maudit']],
  ['08', 'Le $.$. Rocky', ['Le $.$. Rocky']],
  ['09', 'Village de Fuschia', ['Village de', 'Fuschia']],
  ['10', 'Loguetown', ['Loguetown']],
  ['11', 'Port prolifique', ['Port prolifique']],
  ['12', 'Havre des veinards', ['Havre des', 'veinards']]
].map(([id, name, lines]) => ({ id, name, lines, image: `assets/${id}.webp`, originalImage: `assets/${id}.webp` }));
const FORTNITE_ORIGINAL = POIS.map(p => ({...p, lines:[...p.lines]}));
const $ = id => document.getElementById(id);
const STORAGE = 'ma-jestik-wheel-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORAGE) || '{}') || {}; } catch {}
let selected = new Set(Array.isArray(saved.selected) ? saved.selected.filter(id => POIS.some(p => p.id === id)) : POIS.map(p => p.id));
if (!selected.size) selected = new Set(POIS.map(p => p.id));
let history = Array.isArray(saved.history) ? saved.history.filter(id => POIS.some(p => p.id === id)).slice(0, 6) : [];
let angle = 0, spinning = false, soundOn = false, audio, lastTick = -1;
let spinSession = 0, destinationSource = null;
const destinationBuffers = new Map();
const customImages = new Map();
let editorPoi, pendingImage, pendingUrl, editorSession = 0, editorBusy = false;
let imageStoreReady = false;
let imageBlobs = new Map(), library = null, currentWheelId = 'fortnite', namingAction = null;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const active = () => POIS.filter(p => selected.has(p.id));
function persist() {
  const state={selected:[...selected],history:[...history],duration:$('duration').value};
  if(currentWheelId==='fortnite') try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}
  if(!library)return;
  const current=library.wheels.find(w=>w.id===currentWheelId);
  if(current){
    current.choices=POIS.map(p=>({id:p.id,name:p.name,originalImage:p.originalImage}));
    current.selected=state.selected;current.history=state.history;current.duration=state.duration;
  }
  library.active=currentWheelId;
  if(!saveWheelLibrary(library))statusMessage('Stockage local plein ou désactivé : exporte ta roue pour ne pas perdre les modifications.');
}
if (['5', '8', '12'].includes(saved.duration)) $('duration').value = saved.duration;
function svgElement(tag, attrs = {}, text = '') { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k, v)); if(text) e.textContent = text; return e; }
function drawWheel() {
  const items = active(), count = items.length, step = TAU / count;
  $('rotor').replaceChildren(); $('wheelDefs').replaceChildren(); $('rim').replaceChildren();
  const shades = ['#233e48', '#19313d', '#324740', '#213a44'];
  for (let i = 0; i < count; i++) {
    const start = -Math.PI/2 + i*step, end = start + step, mid = start+step/2;
    const point = a => `${360 + Math.cos(a)*332},${360+Math.sin(a)*332}`;
    const wedge = count === 1 ? svgElement('circle',{cx:360,cy:360,r:332,fill:shades[0]}) : svgElement('path', { d:`M360,360 L${point(start)} A332,332 0 ${step>Math.PI?1:0},1 ${point(end)} Z`,fill:shades[i%shades.length],stroke:'#acbb9c', 'stroke-opacity':'.25','stroke-width':1.3 });
    $('rotor').append(wedge);
    const group = svgElement('g', { transform:`translate(${360+Math.cos(mid)*235},${360+Math.sin(mid)*235}) rotate(${mid*180/Math.PI+90})` });
    if(count>20){
      const number=svgElement('text',{'text-anchor':'middle',fill:'#f7dcaa',
        'font-family':'Arial,sans-serif','font-weight':'700','font-size':count>40?13:16,
        'paint-order':'stroke',stroke:'#111d24','stroke-width':1},String(i+1));
      group.append(number);$('rotor').append(group);continue;
    }
    const clip=svgElement('clipPath',{id:`thumb-${i}`});clip.append(svgElement('circle',{cx:0,cy:-21,r:35}));$('wheelDefs').append(clip);
    group.append(svgElement('circle',{cx:0,cy:-21,r:37,fill:'#f6d99a'}));
    group.append(svgElement('image',{href:items[i].image,'data-poi-id':items[i].id,x:-35,y:-56,width:70,height:70,preserveAspectRatio:'xMidYMid slice','clip-path':`url(#thumb-${i})`}));
    const text=svgElement('text',{'text-anchor':'middle',fill:'#f6f0d9','font-family':'Barlow Condensed, Arial Narrow, Arial, sans-serif','font-weight':700,'font-size':count>14?12:count>9?18:22, 'paint-order':'stroke',stroke:'#102832','stroke-width':1});
    items[i].lines.forEach((line,n)=>text.append(svgElement('tspan',{x:0,y:37+n*21},line)));
    group.append(text);$('rotor').append(group);
  }
  for(let i=0;i<48;i++){const a=i/48*TAU;const major=i%4===0; $('rim').append(svgElement('circle',{cx:360+Math.sin(a)*350,cy:360-Math.cos(a)*350,r:major?2.8:1.2,fill:major?'#efc978':'#718e91'}));}
  angle=0; applyRotation();
  $('wheel').setAttribute('aria-label',`Roue de ${count} choix sélectionnés : ${items.map(p=>p.name).join(', ')}`);
  $('selectedCount').textContent=`${count} / ${POIS.length}`;
  $('odds').textContent=`${count} choix · chances égales`;
  $('selectAll').disabled=spinning;
  $('resultNumber').textContent=`? / ${count}`;
  $('spin').disabled=spinning;
}
function applyRotation() { $('rotor').setAttribute('transform',`rotate(${angle*180/Math.PI} 360 360)`); }
function renderCards(){
  $('poiGrid').replaceChildren();
  for(const [position,poi] of POIS.entries()){
    const card=document.createElement('article');card.className='poi-card';card.dataset.poiId=poi.id;
    const label=document.createElement('label');label.className='poi-choice';
    const input=document.createElement('input');input.type='checkbox';input.checked=selected.has(poi.id);input.dataset.id=poi.id;input.setAttribute('aria-label',`Inclure ${poi.name}`);
    const thumb=document.createElement('span');thumb.className='thumb';const img=document.createElement('img');img.src=poi.image;img.dataset.poiId=poi.id;img.alt=`Image de ${poi.name}`;img.width=512;img.height=512;img.loading='lazy';thumb.append(img);
    const name=document.createElement('span');name.className='name';name.textContent=poi.name;
    const index=document.createElement('span');index.className='poi-index';index.textContent=`CHOIX ${String(position+1).padStart(2,'0')}`;
    const edit=document.createElement('button');edit.type='button';edit.className='edit-image';edit.textContent="Changer l'image";edit.setAttribute('aria-label',`Changer l'image de ${poi.name}`);edit.disabled=spinning||!imageStoreReady;edit.addEventListener('click',()=>openImageEditor(poi));
    const badge=document.createElement('span');badge.className='custom-image-badge';badge.textContent='IMAGE PERSO';badge.hidden=!customImages.has(poi.id);
    const actions=document.createElement('div');actions.className='wheel-edit-actions';
    const rename=document.createElement('button');rename.type='button';rename.textContent='Renommer';rename.setAttribute('aria-label','Renommer '+poi.name);
    rename.disabled=spinning;rename.addEventListener('click',()=>openNaming('choice',poi));
    const remove=document.createElement('button');remove.type='button';remove.textContent='Supprimer';remove.setAttribute('aria-label','Supprimer '+poi.name);
    remove.disabled=spinning;remove.addEventListener('click',()=>removeWheelChoice(poi));
    actions.append(rename,remove);
    label.append(input,thumb,name,index);card.append(label,badge,edit,actions);$('poiGrid').append(card);
    input.addEventListener('change',()=>{ if(spinning){input.checked=selected.has(poi.id);return;} if(!input.checked&&selected.size===1){input.checked=true;$('selectionMessage').textContent='Garde au moins un choix dans le tirage.';return;} $('selectionMessage').textContent='';if(input.checked)selected.add(poi.id);else selected.delete(poi.id);drawWheel();resetResult();persist(); });
  }
}
function renderHistory(){
  $('history').replaceChildren();
  if(!history.length){const span=document.createElement('span');span.className='empty-history';span.textContent='Les derniers tirages apparaîtront ici.';$('history').append(span);return;}
  history.forEach((id,i)=>{const p=POIS.find(p=>p.id===id);if(!p)return;const el=document.createElement('span');el.className='history-item';el.title=i===0?'Dernier tirage':`Tirage précédent ${i}`;const img=document.createElement('img');img.src=p.image;img.dataset.poiId=p.id;img.alt='';const name=document.createElement('span');name.textContent=p.name;el.append(img,name);$('history').append(el);});
}
function setImage(poi) { if(!poi)return; $('resultImage').src=poi.image; $('resultImage').dataset.poiId=poi.id; $('resultImage').alt=`Image de ${poi.name}`; }
function resetResult(){
  $('wheelStatus').textContent="La roue attend ton signal.";$('spin').querySelector('span').textContent='LANCER LA ROUE';$('announcement').textContent='';$('resultCard').classList.remove('winner','reveal');$('resultLabel').textContent='PROCHAIN RÉSULTAT';$('resultOverline').textContent='LAISSE LE HASARD DÉCIDER';$('resultName').textContent="Le prochain choix t'attend.";$('resultDetail').textContent='Lance la roue et découvre le résultat.';$('artBadge').textContent='PRÊT AU TIRAGE';setImage(active()[0]);
}
function tick(final=false){
  if(!soundOn||!audio)return;
  try{const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=final?740:480;o.type='sine';g.gain.setValueAtTime(final?.13:.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+(final?.4:.045));o.start();o.stop(audio.currentTime+(final?.4:.05));}catch{}
}
// Jingle musical propre au POI tiré, lancé lorsque le résultat s'affiche.
// Les fichiers 02.mp3 et 04.mp3 contiennent volontairement le même son.
function stopDestinationSound() {
  if (!destinationSource) return;
  try { destinationSource.stop(); } catch {}
  try { destinationSource.disconnect(); } catch {}
  destinationSource = null;
}
async function getDestinationSound(id) {
  // Les jingles locaux n'existent que pour les 12 destinations historiques Fortnite.
  if (!audio || currentWheelId!=='fortnite' || !/^(0[1-9]|1[0-2])$/.test(id) || !FORTNITE_ORIGINAL.some(p=>p.id===id&&POIS.some(x=>x.id===id&&x.name===p.name))) return null;
  if (!destinationBuffers.has(id)) {
    const pending = fetch(`audio/${id}.mp3`)
      .then(response => { if (!response.ok) throw new Error(`Son ${id} indisponible (${response.status})`); return response.arrayBuffer(); })
      .then(data => audio.decodeAudioData(data))
      .catch(error => { destinationBuffers.delete(id); console.warn(error); return null; });
    destinationBuffers.set(id, pending);
  }
  return destinationBuffers.get(id);
}
async function playDestinationSound(id, session) {
  if (!soundOn || !audio) return;
  const buffer = await getDestinationSound(id);
  if (!buffer || !soundOn || spinning || session !== spinSession) return;
  stopDestinationSound();
  try {
    const source = audio.createBufferSource();
    const volume = audio.createGain(); volume.gain.value = 0.8;
    source.buffer = buffer;
    source.connect(volume); volume.connect(audio.destination);
    destinationSource = source;
    source.onended = () => { if (destinationSource === source) destinationSource = null; source.disconnect(); volume.disconnect(); };
    source.start();
  } catch (error) { console.warn('Lecture du son du lieu impossible', error); }
}
function showPassing(index,items){if(index===lastTick)return;lastTick=index;const p=items[index];setImage(p);$('resultName').textContent=p.name;$('resultNumber').textContent=`${String(index+1).padStart(2,'0')} / ${items.length}`;tick();}
async function spin(){
  if(spinning || $('imageDialog').open)return;
  stopDestinationSound();
  const session = ++spinSession;
  spinning=true;
  const items=active(),index=randomIndex(items.length),winner=items[index],startAngle=normalise(angle),endAngle=targetAngle(startAngle,index,items.length),duration=reducedMotion.matches?700:Number($('duration').value)*1000;
  angle=startAngle;lastTick=-1;document.body.classList.add('spinning');$('resultCard').classList.remove('winner','reveal');$('spin').disabled=true;$('spin').querySelector('span').textContent='LE DESTIN EST EN MARCHE…';$('duration').disabled=true;$('selectAll').disabled=true;document.querySelectorAll('.poi-card input').forEach(e=>e.disabled=true);
  document.querySelectorAll('.edit-image,.wheel-edit-actions button,.wheel-library-panel button').forEach(e=>e.disabled=true);
  $('resultLabel').textContent='TIRAGE EN COURS';$('artBadge').textContent='EN COURS';$('resultOverline').textContent='LE HASARD DÉCIDE…';$('resultDetail').textContent='La roue ralentit. Le résultat arrive.';$('wheelStatus').textContent='Tous les regards sur la roue.';$('announcement').textContent='Tirage en cours.';
  if(soundOn){try{audio ??= new (window.AudioContext||window.webkitAudioContext)();await audio.resume();void getDestinationSound(winner.id);}catch{soundOn=false;$('sound').setAttribute('aria-pressed','false');$('sound').querySelector('span').textContent='Son indisponible';}}
  const started=performance.now();
  function frame(now){
    const progress=Math.min(1,(now-started)/duration),ease=1-Math.pow(1-progress,4);
    angle=reducedMotion.matches?(progress===1?endAngle:startAngle):startAngle+(endAngle-startAngle)*ease;applyRotation();
    if(!reducedMotion.matches)showPassing(indexAtPointer(angle,items.length),items);
    if(progress<1){requestAnimationFrame(frame);return;}
    angle=normalise(endAngle);applyRotation();spinning=false;document.body.classList.remove('spinning');setImage(winner);$('resultName').textContent=winner.name;$('resultLabel').textContent='RÉSULTAT DU TIRAGE';$('resultOverline').textContent="LE HASARD A CHOISI !";$('artBadge').textContent='CHOIX TIRÉ AU SORT';$('resultNumber').textContent=`${String(index+1).padStart(2,'0')} / ${items.length}`;$('resultDetail').textContent='Choix sélectionné : '+winner.name+'. Bonne partie !';$('resultCard').classList.add('winner','reveal');$('wheelStatus').textContent='Résultat : '+winner.name+' !';$('announcement').textContent='Choix tiré : '+winner.name;tick(true);void playDestinationSound(winner.id, session);
    history.unshift(winner.id);history=history.slice(0,6);renderHistory();persist();$('spin').disabled=false;$('spin').querySelector('span').textContent='RELANCER LA ROUE';$('duration').disabled=false;$('selectAll').disabled=false;document.querySelectorAll('.poi-card input').forEach(e=>e.disabled=false);
    document.querySelectorAll('.edit-image').forEach(e=>e.disabled=!imageStoreReady);
    document.querySelectorAll('.wheel-edit-actions button,.wheel-library-panel button').forEach(e=>e.disabled=false);
    syncWheelButtons();
  }
  requestAnimationFrame(frame);
}
$('spin').addEventListener('click',spin);
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&!['INPUT','SELECT','BUTTON','TEXTAREA','A'].includes(document.activeElement.tagName)&&!$('sourcesDialog').open&&!$('imageDialog').open&&!$('wheelNameDialog').open){e.preventDefault();spin();}});
$('duration').addEventListener('change',persist);
$('selectAll').addEventListener('click',()=>{
  if(spinning)return;
  if(selected.size===POIS.length){
    $('selectionMessage').textContent='Tous les choix de cette roue sont déjà sélectionnés.';
    return;
  }
  selected=new Set(POIS.map(p=>p.id));
  renderCards();drawWheel();resetResult();persist();
  $('selectionMessage').textContent=`${POIS.length} choix sont dans le tirage.`;
});
$('sound').addEventListener('click',()=>{soundOn=!soundOn;$('sound').setAttribute('aria-pressed',String(soundOn));$('sound').querySelector('span').textContent=soundOn?'Son activé':'Son désactivé';if(!soundOn)stopDestinationSound();if(soundOn){try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();tick();}catch{soundOn=false;$('sound').setAttribute('aria-pressed','false');$('sound').querySelector('span').textContent='Son indisponible';}}});
$('streamMode').addEventListener('click',()=>{const enabled=document.body.classList.toggle('stream');$('streamMode').setAttribute('aria-pressed',String(enabled));$('streamMode').querySelector('span').textContent=enabled?'Quitter le mode stream':'Mode stream';});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('wheelStatus').textContent='Plein écran indisponible ici. Utilise F11 dans ton navigateur.';}});
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Quitter le plein écran':'Passer en plein écran');});
/* Le QG affiche la roue dans une iframe de hauteur dynamique.
   Les boites de dialogue doivent se centrer dans la portion visible de cette
   iframe, et non au milieu de ses milliers de pixels de hauteur. */
function showWheelDialog(dialog){
  if(!dialog||dialog.open)return;
  try{
    const host=window.frameElement;
    if(window.parent!==window&&host){
      const parent=window.parent;
      const place=()=>{
        const rect=host.getBoundingClientRect();
        const visibleTop=Math.max(0,rect.top);
        const visibleBottom=Math.min(parent.innerHeight,rect.bottom);
        const centerOnParent=visibleBottom>visibleTop
          ?(visibleTop+visibleBottom)/2
          :Math.max(0,Math.min(parent.innerHeight,rect.top+parent.innerHeight/2));
        dialog.style.setProperty('--wheel-modal-center',Math.round(centerOnParent-rect.top)+'px');
        dialog.style.setProperty('--wheel-modal-maxheight',Math.max(180,parent.innerHeight-32)+'px');
      };
      dialog.classList.add('wheel-iframe-dialog');
      place();
      parent.addEventListener('scroll',place,{passive:true});
      parent.addEventListener('resize',place);
      dialog.addEventListener('close',()=>{
        parent.removeEventListener('scroll',place);
        parent.removeEventListener('resize',place);
        dialog.classList.remove('wheel-iframe-dialog');
        dialog.style.removeProperty('--wheel-modal-center');
        dialog.style.removeProperty('--wheel-modal-maxheight');
      },{once:true});
    }
  }catch{
    // Ouverture standard si le navigateur refuse l'acces a la fenetre parente.
  }
  dialog.showModal();
}
$('sourcesButton').addEventListener('click',()=>showWheelDialog($('sourcesDialog')));$('closeDialog').addEventListener('click',()=>$('sourcesDialog').close());$('sourcesDialog').addEventListener('click',e=>{if(e.target===$('sourcesDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
renderCards();drawWheel();renderHistory();
setImage(POIS.find(p=>p.id==='06'));
void initialiseLibrary();

async function initialiseImages() {
  try {
    const images = await readImages();
    imageBlobs=new Map(images.filter(x=>x.blob instanceof Blob&&x.blob.type.startsWith('image/')).map(x=>[String(x.id),x.blob]));
    imageStoreReady=true;
    applyWheelImages();
    if(currentWheelId==='warzone-hajin')updateHajinNotice();
    document.querySelectorAll('.edit-image').forEach(e=>e.disabled=spinning);
  } catch {
    $('imageNotice').textContent="La personnalisation est indisponible : ce navigateur bloque l'enregistrement des images. Autorise les données du site puis recharge la page.";
  }
}
function updatePoiImage(poi,blob) {
  const previous=customImages.get(poi.id);
  if(blob){const url=URL.createObjectURL(blob);customImages.set(poi.id,url);poi.image=url;}
  else {customImages.delete(poi.id);poi.image=poi.originalImage;}
  for(const image of document.querySelectorAll('img[data-poi-id], image[data-poi-id]')) {
    if(image.dataset.poiId===poi.id) image.setAttribute(image.tagName.toLowerCase()==='image'?'href':'src',poi.image);
  }
  const badge=document.querySelector(`.poi-card[data-poi-id="${poi.id}"] .custom-image-badge`);
  if(badge)badge.hidden=!blob;
  if(previous)URL.revokeObjectURL(previous);
}
function clearPendingImage() {
  if(pendingUrl)URL.revokeObjectURL(pendingUrl);
  pendingUrl=undefined;pendingImage=undefined;
}
function setEditorBusy(busy) {
  editorBusy=busy;
  $('imageDialog').setAttribute('aria-busy',String(busy));
  $('imageFile').disabled=busy;
  $('applyImage').disabled=busy||!pendingImage;
  $('restoreImage').disabled=busy||!customImages.has(editorPoi?.id);
  $('cancelImage').disabled=busy;$('closeImageDialog').disabled=busy;
}
function openImageEditor(poi) {
  if(spinning||!imageStoreReady)return;
  clearPendingImage();editorPoi=poi;editorSession++;
  $('imagePoiName').textContent=poi.name;
  $('imagePreview').src=poi.image;$('imagePreview').alt=`Aperçu de l'image de ${poi.name}`;
  $('imagePreviewBadge').textContent=customImages.has(poi.id)?'IMAGE PERSONNALISÉE':
    currentWheelId==='warzone-hajin'&&poi.originalImage===FALLBACK_IMAGE?'PHOTO NON AJOUTÉE':'ILLUSTRATION D’ORIGINE';
  $('imageError').textContent='';$('imageFile').value='';setEditorBusy(false);
  showWheelDialog($('imageDialog'));
}
function closeImageEditor() {if(!editorBusy)$('imageDialog').close();}
$('closeImageDialog').addEventListener('click',closeImageEditor);
$('cancelImage').addEventListener('click',closeImageEditor);
$('imageDialog').addEventListener('cancel',event=>{if(editorBusy)event.preventDefault();});
$('imageDialog').addEventListener('close',()=>{editorSession++;clearPendingImage();editorPoi=undefined;});
$('imageFile').addEventListener('change',async()=>{
  const file=$('imageFile').files[0];
  if(!file||!editorPoi)return;
  const session=editorSession;
  clearPendingImage();setEditorBusy(true);$('imageError').textContent="Préparation de l'image…";
  try {
    const blob=await prepareImage(file);
    if(session!==editorSession)return;
    pendingImage=blob;pendingUrl=URL.createObjectURL(blob);
    $('imagePreview').src=pendingUrl;$('imagePreviewBadge').textContent='APERÇU · À ENREGISTRER';
    $('imageError').textContent='';
  } catch(error) {
    if(session!==editorSession)return;
    $('imagePreview').src=editorPoi.image;$('imagePreviewBadge').textContent='IMAGE ACTUELLE';
    $('imageError').textContent=error.message;
  } finally {
    if(session===editorSession){setEditorBusy(false);$('imageFile').value='';}
  }
});
function storageError(error) {
  return error?.name==='QuotaExceededError'
    ? "L'espace disponible dans ce navigateur est insuffisant. Essaie une image plus légère ou rétablis une autre image d'origine."
    : "L'image n'a pas pu être enregistrée. Vérifie que ce navigateur autorise les données du site, puis réessaie.";
}
$('applyImage').addEventListener('click',async()=>{
  if(!pendingImage||editorBusy||!editorPoi)return;
  const poi=editorPoi,blob=pendingImage;setEditorBusy(true);$('imageError').textContent='Enregistrement…';
  try {
    await saveImage(imageKey(currentWheelId,poi.id),blob);imageBlobs.set(imageKey(currentWheelId,poi.id),blob);updatePoiImage(poi,blob);
    if(currentWheelId==='warzone-hajin')updateHajinNotice();
    $('imageNotice').textContent=`Image de ${poi.name} enregistrée dans ce navigateur.`;
    setEditorBusy(false);$('imageDialog').close();
  } catch(error) {$('imageError').textContent=storageError(error);setEditorBusy(false);}
});
$('restoreImage').addEventListener('click',async()=>{
  if(editorBusy||!editorPoi||!customImages.has(editorPoi.id))return;
  const poi=editorPoi;setEditorBusy(true);$('imageError').textContent="Restauration de l'illustration…";
  try {
    await deleteImage(imageKey(currentWheelId,poi.id));imageBlobs.delete(imageKey(currentWheelId,poi.id));updatePoiImage(poi,null);
    if(currentWheelId==='warzone-hajin')updateHajinNotice();
    $('imageNotice').textContent=`Illustration d'origine rétablie pour ${poi.name}.`;
    setEditorBusy(false);$('imageDialog').close();
  } catch(error) {$('imageError').textContent=storageError(error);setEditorBusy(false);}
});

/* ===== Roues personnalisables et multijeux : entièrement côté navigateur ===== */
function statusMessage(text) {
  const node=$('wheelLibraryStatus');
  if(node)node.textContent=String(text||'');
}
function updateHajinNotice(){
  if(currentWheelId!=='warzone-hajin')return;
  const total=POIS.length;
  const missing=POIS.filter(p=>p.originalImage===FALLBACK_IMAGE&&!imageBlobs.has(imageKey(currentWheelId,p.id))).length;
  statusMessage(missing
    ?`Hajin : ${total} lieux officiels prêts. ${missing} photos restent à intégrer. Les logos MJ sont provisoires, pas des captures du jeu. Carte officielle accessible en haut à gauche.`
    :`Hajin : ${total} lieux et leurs images sont disponibles sur cet appareil.`);
}
function applyWheelImages(){
  for(const poi of POIS){
    const blob=imageBlobs.get(imageKey(currentWheelId,poi.id));
    if(blob instanceof Blob)updatePoiImage(poi,blob);
  }
}
function syncWheelButtons(){
  const selector=$('wheelPreset');
  if(!selector||!library)return;
  selector.replaceChildren();
  for(const wheel of library.wheels){
    const option=document.createElement('option');
    option.value=wheel.id;option.textContent=wheel.name;
    option.selected=wheel.id===currentWheelId;
    selector.append(option);
  }
  $('wheelDelete').disabled=spinning||library.wheels.length===1;
  $('wheelNew').disabled=spinning||library.wheels.length>=MAX_WHEELS;
  $('wheelClone').disabled=spinning||library.wheels.length>=MAX_WHEELS;
  $('wheelAdd').disabled=spinning||POIS.length>=MAX_CHOICES;
  $('wheelBulkReplace').disabled=spinning;
  const heading=$('wheelGameLabel'),chapter=$('wheelChapterTitle');
  const current=library.wheels.find(w=>w.id===currentWheelId);
  if(heading)heading.textContent=current?.name.toLocaleUpperCase('fr-FR')||'PERSONNALISÉE';
  if(chapter)chapter.textContent=(current?.name||'LA ROUE').toLocaleUpperCase('fr-FR');
  if($('wheelChapterCount'))$('wheelChapterCount').textContent=String(POIS.length);
  const classic=currentWheelId==='fortnite'&&POIS.length===FORTNITE_ORIGINAL.length&&
    POIS.every((p,i)=>p.name===FORTNITE_ORIGINAL[i].name);
  if($('wheelChapterFoot'))$('wheelChapterFoot').textContent=classic?'MODÈLE FORTNITE · 05.11.2026':'MODIFIABLE PAR TOUS · STOCKAGE LOCAL';
  const map=document.querySelector('.map-launch');
  if(map)map.hidden=!classic;
  const hajinMap=$('hajinMapLaunch');
  if(hajinMap){
    const link=hajinMap.querySelector('a');
    if(link)link.href=HAJIN_GUIDE_URL;
    hajinMap.hidden=currentWheelId!=='warzone-hajin';
  }
  if($('sourcesButton'))$('sourcesButton').hidden=!classic;
}
function activateWheel(id,savePrevious=true){
  if(spinning||$('imageDialog').open||$('wheelNameDialog')?.open)return;
  if(savePrevious)persist();
  const cfg=library?.wheels.find(w=>w.id===id);
  if(!cfg)return;
  stopDestinationSound();
  for(const url of customImages.values())URL.revokeObjectURL(url);
  customImages.clear();
  currentWheelId=cfg.id;library.active=id;
  POIS=wheelToPois(cfg);
  if(cfg.id==='fortnite')for(const choice of POIS){
    const original=FORTNITE_ORIGINAL.find(p=>p.id===choice.id&&p.name===choice.name);
    if(original)choice.lines=[...original.lines];
  }
  const valid=new Set(POIS.map(p=>p.id));
  selected=new Set(cfg.selected.filter(k=>valid.has(k)));
  if(!selected.size)selected=new Set(valid);
  history=cfg.history.filter(k=>valid.has(k)).slice(0,6);
  $('duration').value=cfg.duration||'8';
  renderCards();drawWheel();renderHistory();resetResult();
  if(imageStoreReady)applyWheelImages();
  syncWheelButtons();
  if(currentWheelId==='warzone-hajin')updateHajinNotice();
  else statusMessage('');
  saveWheelLibrary(library);
}
async function initialiseLibrary(){
  library=loadWheelLibrary(FORTNITE_ORIGINAL,saved);
  activateWheel(library.active,false);
  await initialiseImages();
}
function openNaming(action,poi){
  if(spinning||$('imageDialog').open)return;
  namingAction={action,id:poi?.id||null};
  const current=library.wheels.find(w=>w.id===currentWheelId);
  $('wheelNameTitle').textContent=action==='new'?'Créer une nouvelle roue':action==='wheel'?'Renommer la roue':'Renommer le choix';
  $('wheelNameInput').value=action==='wheel'?(current?.name||''):action==='choice'?(poi?.name||''):'';
  showWheelDialog($('wheelNameDialog'));$('wheelNameInput').focus();
}
$('wheelNameForm')?.addEventListener('submit',event=>{
  event.preventDefault();
  const name=$('wheelNameInput').value.trim().replace(/\s+/g,' ').slice(0,70);
  if(!name){statusMessage('Indique un nom pour continuer.');return;}
  const action=namingAction;
  if(!action)return;
  if(action.action==='new'){
    if(library.wheels.length>=MAX_WHEELS){statusMessage('Limite de '+MAX_WHEELS+' roues atteinte.');return;}
    persist();
    const entry=makeChoice('Premier choix');
    const cfg={id:makeId('w'),name,choices:[entry],selected:[entry.id],history:[],duration:'8'};
    library.wheels.push(cfg);$('wheelNameDialog').close();activateWheel(cfg.id,false);
    statusMessage('Roue créée. Ajoute des choix ou colle une liste complète.');
    return;
  }
  if(action.action==='wheel'){
    const cfg=library.wheels.find(w=>w.id===currentWheelId);
    if(cfg)cfg.name=name;
  }else if(action.action==='choice'){
    const choice=POIS.find(p=>p.id===action.id);
    if(choice){choice.name=name;choice.lines=wheelToPois({choices:[{id:choice.id,name,originalImage:choice.originalImage}]})[0].lines;}
  }
  $('wheelNameDialog').close();
  persist();renderCards();drawWheel();renderHistory();resetResult();syncWheelButtons();
  statusMessage('Modification enregistrée dans ce navigateur.');
});
$('wheelNameCancel')?.addEventListener('click',()=>$('wheelNameDialog').close());
function removeWheelChoice(poi){
  if(spinning||$('imageDialog').open)return;
  if(POIS.length<=1){statusMessage('La roue doit conserver au moins un choix.');return;}
  if(!confirm('Supprimer « '+poi.name+' » de cette roue ?'))return;
  const idx=POIS.findIndex(x=>x.id===poi.id);
  if(idx<0)return;
  const oldUrl=customImages.get(poi.id);if(oldUrl)URL.revokeObjectURL(oldUrl);
  customImages.delete(poi.id);POIS.splice(idx,1);selected.delete(poi.id);
  if(!selected.size)selected.add(POIS[0].id);
  history=history.filter(id=>id!==poi.id);
  persist();renderCards();drawWheel();renderHistory();resetResult();applyWheelImages();syncWheelButtons();
  statusMessage('Choix supprimé. Pense à exporter ta roue pour la sauvegarder.');
}
$('wheelAdd')?.addEventListener('click',()=>{
  if(spinning||POIS.length>=MAX_CHOICES)return;
  const name=$('wheelNewChoice').value.trim().replace(/\s+/g,' ').slice(0,70);
  if(!name){statusMessage('Écris le nom du nouveau choix.');return;}
  if(POIS.some(x=>x.name.toLocaleLowerCase('fr')===name.toLocaleLowerCase('fr'))){statusMessage('Ce nom existe déjà.');return;}
  const choice=makeChoice(name);
  POIS.push({...choice,lines:[name.slice(0,30)],image:FALLBACK_IMAGE});
  selected.add(choice.id);$('wheelNewChoice').value='';
  persist();renderCards();drawWheel();renderHistory();resetResult();applyWheelImages();syncWheelButtons();
  statusMessage('« '+name+' » ajouté. Tu peux maintenant changer son image.');
});
$('wheelNewChoice')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('wheelAdd').click();}});
$('wheelBulkReplace')?.addEventListener('click',()=>{
  if(spinning)return;
  let names;try{names=cleanNames($('wheelBulkNames').value);}catch(error){statusMessage(error.message);return;}
  if(!confirm('Remplacer la liste actuelle par '+names.length+' choix ? Les noms identiques conserveront leurs images. Exporte ta roue avant si nécessaire.'))return;
  const old=new Map(POIS.map(p=>[p.name.toLocaleLowerCase('fr'),p]));
  const next=names.map(name=>{
    const previous=old.get(name.toLocaleLowerCase('fr'));
    if(previous)return {...previous,name};
    const c=makeChoice(name);
    return {...c,lines:[name.slice(0,30)],image:FALLBACK_IMAGE};
  });
  POIS=next;selected=new Set(POIS.map(p=>p.id));history=history.filter(id=>selected.has(id));
  persist();renderCards();drawWheel();renderHistory();resetResult();applyWheelImages();syncWheelButtons();
  $('wheelBulkNames').value='';
  statusMessage(names.length+' choix enregistrés : les images des choix conservés sont préservées.');
});
$('wheelPreset')?.addEventListener('change',e=>activateWheel(e.target.value));
$('wheelNew')?.addEventListener('click',()=>openNaming('new'));
$('wheelRename')?.addEventListener('click',()=>openNaming('wheel'));
$('wheelClone')?.addEventListener('click',async()=>{
  if(spinning||library.wheels.length>=MAX_WHEELS)return;
  persist();
  const src=library.wheels.find(w=>w.id===currentWheelId),id=makeId('w');
  const choices=src.choices.map(c=>({...c,id:makeId('c')}));
  const copy={id,name:src.name+' · Copie',choices,selected:choices.map(c=>c.id),history:[],duration:src.duration};
  if(imageStoreReady){
    for(let i=0;i<choices.length;i++){
      const blob=imageBlobs.get(imageKey(src.id,src.choices[i].id));
      if(!blob)continue;
      try{await saveImage(imageKey(id,choices[i].id),blob);imageBlobs.set(imageKey(id,choices[i].id),blob);}
      catch{statusMessage('Certaines images n’ont pas pu être copiées.');}
    }
  }
  library.wheels.push(copy);activateWheel(id,false);
  statusMessage('Roue dupliquée. Tu peux la modifier sans toucher à l’originale.');
});
$('wheelDelete')?.addEventListener('click',async()=>{
  if(spinning||library.wheels.length<=1)return;
  const old=library.wheels.find(w=>w.id===currentWheelId);
  if(!old||!confirm('Supprimer définitivement la roue « '+old.name+' » de ce navigateur ?'))return;
  if(old.id==='warzone-hajin'){
    library.dismissedPresets=Array.isArray(library.dismissedPresets)?library.dismissedPresets:[];
    if(!library.dismissedPresets.includes(old.id))library.dismissedPresets.push(old.id);
  }
  library.wheels=library.wheels.filter(w=>w.id!==old.id);
  const next=library.wheels[0].id;
  // Si l'utilisateur efface l'ancien modèle, les images historiques sont conservées par prudence.
  if(old.id!=='fortnite'&&imageStoreReady){
    for(const choice of old.choices){
      const key=imageKey(old.id,choice.id);
      if(imageBlobs.has(key)){try{await deleteImage(key);imageBlobs.delete(key);}catch{}}
    }
  }
  activateWheel(next,false);
  statusMessage('Roue supprimée localement.');
});
async function imageData(blob){
  if(!blob)return undefined;
  // Réduit le poids des sauvegardes exportées, sans modifier les images stockées.
  const bitmap=await createImageBitmap(blob);
  try{
    const scale=Math.min(1,768/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
    const light=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.75));
    if(!light)throw Error('Impossible de préparer une illustration pour l’export.');
    return await new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(light);
    });
  }finally{bitmap.close();}
}
$('wheelExport')?.addEventListener('click',async()=>{
  if(spinning)return;
  const cfg=library.wheels.find(w=>w.id===currentWheelId);
  if(!cfg)return;
  persist();
  $('wheelExport').disabled=true;statusMessage('Préparation du fichier de sauvegarde…');
  try{
    const choices=[];
    for(const c of cfg.choices){
      const blob=imageBlobs.get(imageKey(cfg.id,c.id));
      choices.push({name:c.name,originalImage:c.originalImage,...(blob?{image:await imageData(blob)}:{})});
    }
    const blob=new Blob([JSON.stringify({format:'ma-jestik-wheel',version:2,name:cfg.name,duration:cfg.duration,
      selectedNames:cfg.choices.filter(c=>cfg.selected.includes(c.id)).map(c=>c.name),choices},null,2)],{type:'application/json'});
    if(blob.size>36_000_000)throw Error('Fichier trop volumineux. Réduis le nombre d’images.');
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');anchor.href=url;anchor.download='ma-jestik-roue-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
    statusMessage('Roue exportée avec ses images. Garde le fichier en lieu sûr.');
  }catch(error){statusMessage(error.message||'Export impossible.');}
  finally{$('wheelExport').disabled=false;}
});
$('wheelImport')?.addEventListener('click',()=>$('wheelImportFile')?.click());
$('wheelImportFile')?.addEventListener('change',async event=>{
  const file=event.target.files?.[0];event.target.value='';
  if(!file||spinning)return;
  if(library.wheels.length>=MAX_WHEELS){statusMessage('Limite de '+MAX_WHEELS+' roues atteinte.');return;}
  $('wheelImport').disabled=true;statusMessage('Vérification du fichier…');
  try{
    if(file.size>36_000_000)throw Error('Fichier trop volumineux (36 Mo maximum).');
    const imported=parseWheelImport(await file.text());
    const id=makeId('w');
    const choices=imported.choices.map(c=>({...makeChoice(c.name,c.originalImage),image:c.image}));
    const selectedNames=new Set(imported.selectedNames);
    const config={id,name:imported.name,choices:choices.map(({image,...c})=>c),
      selected:choices.filter(c=>selectedNames.has(c.name)).map(c=>c.id),history:[],duration:imported.duration};
    if(choices.some(c=>c.image)&&!imageStoreReady)throw Error('Ce navigateur ne permet pas de sauvegarder les images.');
    const blobs=[];
    for(const choice of choices){
      if(!choice.image)continue;
      const match=/^data:(image\/(?:png|jpeg|webp|avif));base64,(.+)$/.exec(choice.image);
      const binary=atob(match[2]),bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const blob=await prepareImage(new File([bytes],'image',{type:match[1]}));
      blobs.push([imageKey(id,choice.id),blob]);
    }
    for(const [key,blob] of blobs){await saveImage(key,blob);imageBlobs.set(key,blob);}
    persist();library.wheels.push(config);activateWheel(id,false);
    statusMessage('Roue importée avec '+config.choices.length+' choix. Aucun envoi au serveur.');
  }catch(error){statusMessage(error.message||'Import impossible.');}
  finally{$('wheelImport').disabled=false;}
});
