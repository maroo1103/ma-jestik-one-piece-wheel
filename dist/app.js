import { TAU, normalise, indexAtPointer, targetAngle, randomIndex } from './engine.mjs';
import { readImages, saveImage, deleteImage, prepareImage } from './image-storage.mjs';
const POIS = [
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
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const active = () => POIS.filter(p => selected.has(p.id));
function persist() { try { localStorage.setItem(STORAGE, JSON.stringify({ selected: [...selected], history, duration: $('duration').value })); } catch {} }
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
    const clip=svgElement('clipPath',{id:`thumb-${i}`});clip.append(svgElement('circle',{cx:0,cy:-21,r:35}));$('wheelDefs').append(clip);
    group.append(svgElement('circle',{cx:0,cy:-21,r:37,fill:'#f6d99a'}));
    group.append(svgElement('image',{href:items[i].image,'data-poi-id':items[i].id,x:-35,y:-56,width:70,height:70,preserveAspectRatio:'xMidYMid slice','clip-path':`url(#thumb-${i})`}));
    const text=svgElement('text',{'text-anchor':'middle',fill:'#f6f0d9','font-family':'Barlow Condensed, Arial Narrow, Arial, sans-serif','font-weight':700,'font-size':count>9?18:22, 'paint-order':'stroke',stroke:'#102832','stroke-width':1});
    items[i].lines.forEach((line,n)=>text.append(svgElement('tspan',{x:0,y:37+n*21},line)));
    group.append(text);$('rotor').append(group);
  }
  for(let i=0;i<48;i++){const a=i/48*TAU;const major=i%4===0; $('rim').append(svgElement('circle',{cx:360+Math.sin(a)*350,cy:360-Math.cos(a)*350,r:major?2.8:1.2,fill:major?'#efc978':'#718e91'}));}
  angle=0; applyRotation();
  $('wheel').setAttribute('aria-label',`Roue de ${count} lieux sélectionnés : ${items.map(p=>p.name).join(', ')}`);
  $('selectedCount').textContent=`${count} / 12`;
  $('odds').textContent=`${count} lieu${count>1?'x':''} · chances égales`;
  $('selectAll').disabled=spinning || count===12;
  $('resultNumber').textContent=`? / ${count}`;
  $('spin').disabled=spinning;
}
function applyRotation() { $('rotor').setAttribute('transform',`rotate(${angle*180/Math.PI} 360 360)`); }
function renderCards(){
  $('poiGrid').replaceChildren();
  for(const poi of POIS){
    const card=document.createElement('article');card.className='poi-card';card.dataset.poiId=poi.id;
    const label=document.createElement('label');label.className='poi-choice';
    const input=document.createElement('input');input.type='checkbox';input.checked=selected.has(poi.id);input.dataset.id=poi.id;input.setAttribute('aria-label',`Inclure ${poi.name}`);
    const thumb=document.createElement('span');thumb.className='thumb';const img=document.createElement('img');img.src=poi.image;img.dataset.poiId=poi.id;img.alt=`Image de ${poi.name}`;img.width=512;img.height=512;img.loading='lazy';thumb.append(img);
    const name=document.createElement('span');name.className='name';name.textContent=poi.name;
    const index=document.createElement('span');index.className='poi-index';index.textContent=`ESCALE ${poi.id}`;
    const edit=document.createElement('button');edit.type='button';edit.className='edit-image';edit.textContent="Changer l'image";edit.setAttribute('aria-label',`Changer l'image de ${poi.name}`);edit.disabled=spinning||!imageStoreReady;edit.addEventListener('click',()=>openImageEditor(poi));
    const badge=document.createElement('span');badge.className='custom-image-badge';badge.textContent='IMAGE PERSO';badge.hidden=!customImages.has(poi.id);
    label.append(input,thumb,name,index);card.append(label,badge,edit);$('poiGrid').append(card);
    input.addEventListener('change',()=>{ if(spinning){input.checked=selected.has(poi.id);return;} if(!input.checked&&selected.size===1){input.checked=true;$('selectionMessage').textContent='Garde au moins une destination dans le tirage.';return;} $('selectionMessage').textContent='';if(input.checked)selected.add(poi.id);else selected.delete(poi.id);drawWheel();resetResult();persist(); });
  }
}
function renderHistory(){
  $('history').replaceChildren();
  if(!history.length){const span=document.createElement('span');span.className='empty-history';span.textContent='Les dernières escales apparaîtront ici.';$('history').append(span);return;}
  history.forEach((id,i)=>{const p=POIS.find(p=>p.id===id);const el=document.createElement('span');el.className='history-item';el.title=i===0?'Dernier tirage':`Tirage précédent ${i}`;const img=document.createElement('img');img.src=p.image;img.dataset.poiId=p.id;img.alt='';const name=document.createElement('span');name.textContent=p.name;el.append(img,name);$('history').append(el);});
}
function setImage(poi) { $('resultImage').src=poi.image; $('resultImage').dataset.poiId=poi.id; $('resultImage').alt=`Image de ${poi.name}`; }
function resetResult(){
  $('wheelStatus').textContent="L'équipage attend ton signal.";$('spin').querySelector('span').textContent='LANCER LA ROUE';$('announcement').textContent='';$('resultCard').classList.remove('winner','reveal');$('resultLabel').textContent='PROCHAINE ESCALE';$('resultOverline').textContent='PRÊT À PRENDRE LE LARGE ?';$('resultName').textContent="Le prochain cap t'attend.";$('resultDetail').textContent='Lance la roue et découvre ton point de chute.';$('artBadge').textContent='LE GRAND DÉPART';setImage(active()[0]);
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
  if (!audio) return null;
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
  document.querySelectorAll('.edit-image').forEach(e=>e.disabled=true);
  $('resultLabel').textContent='CAP EN COURS';$('artBadge').textContent='EN APPROCHE';$('resultOverline').textContent='GARDE LE CAP…';$('resultDetail').textContent='La roue ralentit. Le point de chute arrive.';$('wheelStatus').textContent='Tous les regards sur la roue.';$('announcement').textContent='Tirage en cours.';
  if(soundOn){try{audio ??= new (window.AudioContext||window.webkitAudioContext)();await audio.resume();void getDestinationSound(winner.id);}catch{soundOn=false;$('sound').setAttribute('aria-pressed','false');$('sound').querySelector('span').textContent='Son indisponible';}}
  const started=performance.now();
  function frame(now){
    const progress=Math.min(1,(now-started)/duration),ease=1-Math.pow(1-progress,4);
    angle=reducedMotion.matches?(progress===1?endAngle:startAngle):startAngle+(endAngle-startAngle)*ease;applyRotation();
    if(!reducedMotion.matches)showPassing(indexAtPointer(angle,items.length),items);
    if(progress<1){requestAnimationFrame(frame);return;}
    angle=normalise(endAngle);applyRotation();spinning=false;document.body.classList.remove('spinning');setImage(winner);$('resultName').textContent=winner.name;$('resultLabel').textContent='DESTINATION CHOISIE';$('resultOverline').textContent="L'ÉQUIPAGE A SON CAP !";$('artBadge').textContent='TERRE EN VUE';$('resultNumber').textContent=`${String(index+1).padStart(2,'0')} / ${items.length}`;$('resultDetail').textContent='Prochain arrêt : '+winner.name+'. Bon drop !';$('resultCard').classList.add('winner','reveal');$('wheelStatus').textContent='Cap sur '+winner.name+' !';$('announcement').textContent='Destination choisie : '+winner.name;tick(true);void playDestinationSound(winner.id, session);
    history.unshift(winner.id);history=history.slice(0,6);renderHistory();persist();$('spin').disabled=false;$('spin').querySelector('span').textContent='RELANCER LA ROUE';$('duration').disabled=false;$('selectAll').disabled=selected.size===12;document.querySelectorAll('.poi-card input').forEach(e=>e.disabled=false);
    document.querySelectorAll('.edit-image').forEach(e=>e.disabled=!imageStoreReady);
  }
  requestAnimationFrame(frame);
}
$('spin').addEventListener('click',spin);
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&!['INPUT','SELECT','BUTTON','TEXTAREA','A'].includes(document.activeElement.tagName)&&!$('sourcesDialog').open&&!$('imageDialog').open){e.preventDefault();spin();}});
$('duration').addEventListener('change',persist);
$('selectAll').addEventListener('click',()=>{if(spinning)return;selected=new Set(POIS.map(p=>p.id));renderCards();drawWheel();resetResult();persist();$('selectionMessage').textContent='Les 12 destinations sont dans le tirage.';});
$('sound').addEventListener('click',()=>{soundOn=!soundOn;$('sound').setAttribute('aria-pressed',String(soundOn));$('sound').querySelector('span').textContent=soundOn?'Son activé':'Son désactivé';if(!soundOn)stopDestinationSound();if(soundOn){try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();tick();}catch{soundOn=false;$('sound').setAttribute('aria-pressed','false');$('sound').querySelector('span').textContent='Son indisponible';}}});
$('streamMode').addEventListener('click',()=>{const enabled=document.body.classList.toggle('stream');$('streamMode').setAttribute('aria-pressed',String(enabled));$('streamMode').querySelector('span').textContent=enabled?'Quitter le mode stream':'Mode stream';});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('wheelStatus').textContent='Plein écran indisponible ici. Utilise F11 dans ton navigateur.';}});
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Quitter le plein écran':'Passer en plein écran');});
$('sourcesButton').addEventListener('click',()=>$('sourcesDialog').showModal());$('closeDialog').addEventListener('click',()=>$('sourcesDialog').close());$('sourcesDialog').addEventListener('click',e=>{if(e.target===$('sourcesDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
renderCards();drawWheel();renderHistory();
setImage(POIS.find(p=>p.id==='06'));
initialiseImages();
for(const p of POIS){const image=new Image();image.src=p.image;}

async function initialiseImages() {
  try {
    const images = await readImages();
    for(const {id,blob} of images) {
      const poi=POIS.find(p=>p.id===id);
      if(poi && blob instanceof Blob && blob.type.startsWith('image/')) updatePoiImage(poi,blob);
    }
    imageStoreReady=true;
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
  $('imagePreviewBadge').textContent=customImages.has(poi.id)?'IMAGE PERSONNALISÉE':'ILLUSTRATION D’ORIGINE';
  $('imageError').textContent='';$('imageFile').value='';setEditorBusy(false);
  $('imageDialog').showModal();
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
    await saveImage(poi.id,blob);updatePoiImage(poi,blob);
    $('imageNotice').textContent=`Image de ${poi.name} enregistrée dans ce navigateur.`;
    setEditorBusy(false);$('imageDialog').close();
  } catch(error) {$('imageError').textContent=storageError(error);setEditorBusy(false);}
});
$('restoreImage').addEventListener('click',async()=>{
  if(editorBusy||!editorPoi||!customImages.has(editorPoi.id))return;
  const poi=editorPoi;setEditorBusy(true);$('imageError').textContent="Restauration de l'illustration…";
  try {
    await deleteImage(poi.id);updatePoiImage(poi,null);
    $('imageNotice').textContent=`Illustration d'origine rétablie pour ${poi.name}.`;
    setEditorBusy(false);$('imageDialog').close();
  } catch(error) {$('imageError').textContent=storageError(error);setEditorBusy(false);}
});
