/* Killathon simple — chaque streamer gère son compteur vérifié Twitch.
   Stockage et autorisations sont gérés par Cloudflare ; OBS utilise un lien public lecture seule. */
import {getQGTwitchSession} from './twitch-auth.js?v=20261107-ranking-optin1';
const KTS_API=(document.querySelector('meta[name="majestik-killathon-api"]')?.content||'').replace(/\/$/,'');
const KTS_GAMES=['Fortnite Zero Build','Fortnite Battle Royale','Warzone','Autre jeu'];
const byId=id=>document.getElementById(id);
let ktsBoard=null,ktsBusy=false,ktsError='',ktsInfo='',ktsTimer=null,ktsAccountId='',ktsRequest=0;
const ktsEsc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ktsInt=(n,min,max)=>Math.max(min,Math.min(max,Math.floor(Number(n)||0)));
function ktsOverlayLink(){
 if(!ktsBoard?.public_id)return '';
 const u=new URL('killathon-overlay.html',location.href);
 u.searchParams.set('id',ktsBoard.public_id);
 u.hash='';
 return u.href;
}
function ktsStats(board){
 const kills=ktsInt(board.kills,0,999999),goal=ktsInt(board.goal,1,9999),left=Math.max(0,goal-kills);
 const progress=Math.min(100,Math.round(kills/goal*100));
 return '<div class="kts-stats">'+
 '<div><small>ÉLIMINATIONS</small><strong>'+kills+'</strong></div>'+
 '<div><small>OBJECTIF</small><strong>'+goal+'</strong></div>'+
 '<div><small>RESTANT</small><strong>'+left+'</strong></div></div>'+
 '<div class="kts-bar" role="progressbar" aria-label="Progression" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+progress+'"><span style="width:'+progress+'%"></span></div>'+
 '<p class="kts-progress-label">'+progress+' % · '+(left?'Encore '+left+' élimination'+(left>1?'s':''):'🏆 Objectif atteint !')+'</p>';
}
function ktsButton(action,label,variant=''){
 return '<button type="button" class="kts-button '+variant+'" data-kts-action="'+action+'" '+(ktsBusy?'disabled':'')+'>'+label+'</button>';
}
function ktsView(){
 const host=byId('kt-simple-app');if(!host)return;
 const session=getQGTwitchSession();
 if(!session){
  host.innerHTML='<div class="kts-panel kts-login"><h3>Ton Killathon personnel</h3><p>Connecte-toi avec Twitch pour enregistrer ton compteur et obtenir ton lien OBS. Chaque compte dispose de son propre Killathon.</p><button type="button" class="kts-button kts-primary" data-kts-action="login">Se connecter avec Twitch</button></div>';
  return;
 }
 if(session.id!==ktsAccountId){
  host.innerHTML='<div class="kts-panel"><p class="kts-feedback">Chargement de ton espace Killathon…</p></div>';return;
 }
 let out='<div class="kts-panel"><div class="kts-header"><div><span class="kts-eyebrow">MODE SIMPLE · COMPTE TWITCH</span><h3>Mon Killathon</h3><p>Compteur manuel, sauvegardé en ligne et indépendant pour chaque streamer.</p></div>';
 if(ktsBoard)out+='<span class="kts-state '+(ktsBoard.active?'kts-on':'')+'">'+(ktsBoard.active?'● EN COURS':'● EN PAUSE')+'</span>';
 out+='</div>';
 if(ktsError)out+='<p class="kts-message kts-error" role="alert">'+ktsEsc(ktsError)+'</p>';
 if(ktsInfo)out+='<p class="kts-message" role="status">'+ktsEsc(ktsInfo)+'</p>';
 if(!ktsBoard){
  out+='<div class="kts-start"><h4>Créer mon Killathon</h4><p>Choisis ton jeu et le nombre d’éliminations à atteindre.</p><div class="kts-form">'+
  '<label>Jeu<select id="ktsGame">'+KTS_GAMES.map(x=>'<option>'+ktsEsc(x)+'</option>').join('')+'</select></label>'+
  '<label>Objectif<input id="ktsGoal" type="number" min="1" max="9999" step="1" value="30" inputmode="numeric"></label></div>'+
  ktsButton('create','🎯 Créer mon Killathon','kts-primary')+'</div>';
 }else{
  out+='<p class="kts-gamename">'+ktsEsc(ktsBoard.game||'Fortnite Zero Build')+'</p>'+ktsStats(ktsBoard)+
  '<div class="kts-actions">'+ktsButton('subtract','− 1 élimination')+ktsButton('add','+ 1 élimination','kts-primary')+'</div>'+
  '<div class="kts-options"><label>Modifier l’objectif<input type="number" id="ktsGoalEdit" min="1" max="9999" step="1" value="'+ktsInt(ktsBoard.goal,1,9999)+'"></label>'+
  ktsButton('goal','Enregistrer l’objectif')+'</div>'+
  '<div class="kts-actions">'+ktsButton('active',ktsBoard.active?'⏸ Mettre en pause':'▶ Démarrer le Killathon',ktsBoard.active?'':'kts-primary')+ktsButton('reset','Remettre à zéro','kts-danger')+'</div>'+
  '<section class="kts-obs"><div><h4>📺 Affichage pour OBS</h4><p>Ajoute ce lien comme source <strong>Navigateur</strong> dans OBS (960 × 220). Il se met à jour automatiquement, sans jeton Twitch.</p></div>'+
  '<div class="kts-obs-link"><input id="ktsObsUrl" readonly aria-label="Lien OBS" value="'+ktsEsc(ktsOverlayLink())+'">'+ktsButton('copy','Copier le lien OBS','kts-primary')+'</div></section>';
 }
 out+='</div>';
 host.innerHTML=out;
}
async function ktsFetch(method,path,token,payload){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
 const headers={Authorization:'Bearer '+token};
 if(payload!==undefined)headers['Content-Type']='application/json';
 try{
  const reply=await fetch(KTS_API+path,{method,headers,mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal,body:payload===undefined?undefined:JSON.stringify(payload)});
  const data=await reply.json().catch(()=>({}));
  if(!reply.ok){
   if(reply.status===404&&path==='/v1/killathon/me')throw Error("Le mode simple attend l’activation de Cloudflare. Tes autres outils restent disponibles.");
   throw Error(data.error||'Service Killathon indisponible ('+reply.status+').');
  }
  return data;
 }catch(e){
  if(e.name==='AbortError')throw Error('Le serveur met trop de temps à répondre.');
  if(e instanceof TypeError)throw Error('Connexion au Killathon indisponible. Vérifie le service Cloudflare.');
  throw e;
 }finally{clearTimeout(timeout);}
}
async function ktsLoad(silent=false){
 const session=getQGTwitchSession();if(!session)return;
 const attempt=++ktsRequest;if(!silent){ktsBusy=true;ktsError='';ktsInfo='';ktsView();}
 try{
  const data=await ktsFetch('GET','/v1/killathon/me',session.token);
  if(attempt!==ktsRequest||getQGTwitchSession()?.id!==session.id)return;
  ktsBoard=data.killathon||null;
 }catch(e){if(attempt===ktsRequest)ktsError=e.message;}
 finally{if(attempt===ktsRequest){ktsBusy=false;ktsView();}}
}
async function ktsAction(action,host){
 if(ktsBusy)return;
 if(action==='login'){
  document.querySelector('#qgTwitchAccount .qg-login')?.click();return;
 }
 if(action==='copy'){
  const input=host.querySelector('#ktsObsUrl');
  if(!input)return;
  try{await navigator.clipboard.writeText(input.value);ktsInfo='Lien OBS copié !';}catch{
   input.focus();input.select();ktsInfo='Sélectionne le lien et utilise Ctrl+C pour le copier.';
  }
  ktsView();return;
 }
 const session=getQGTwitchSession();if(!session)return;
 let path='/v1/killathon/command',body={action};
 if(action==='create'){
  const game=host.querySelector('#ktsGame')?.value,goal=Number(host.querySelector('#ktsGoal')?.value);
  if(!KTS_GAMES.includes(game)||!Number.isInteger(goal)||goal<1||goal>9999){ktsError='Choisis un jeu et un objectif entre 1 et 9 999.';ktsView();return;}
  path='/v1/killathon/create';body={game,goal};
 }else if(action==='goal'){
  const goal=Number(host.querySelector('#ktsGoalEdit')?.value);
  if(!Number.isInteger(goal)||goal<1||goal>9999){ktsError='Indique un objectif entre 1 et 9 999.';ktsView();return;}
  body={action:'goal',goal};
 }else if(action==='active')body={action:'active',active:!ktsBoard?.active};
 else if(action==='reset'){
  if(!window.confirm('Réinitialiser ton compteur à zéro et arrêter le Killathon ?'))return;
 }else if(!['add','subtract'].includes(action))return;
 const attempt=++ktsRequest;ktsBusy=true;ktsError='';ktsInfo='';ktsView();
 try{
  const data=await ktsFetch('POST',path,session.token,body);
  if(attempt!==ktsRequest||getQGTwitchSession()?.id!==session.id)return;
  ktsBoard=data.killathon||null;
  if(action==='create')ktsInfo='Killathon créé ! Tu peux maintenant copier ton lien OBS.';
 }catch(e){if(attempt===ktsRequest)ktsError=e.message;}
 finally{if(attempt===ktsRequest){ktsBusy=false;ktsView();}}
}
function ktsHandleSession(){
 const session=getQGTwitchSession();
 const nextId=session?.id||'';
 if(nextId===ktsAccountId)return;
 ktsAccountId=nextId;ktsBoard=null;ktsError='';ktsInfo='';ktsRequest++;
 ktsView();
 if(nextId)void ktsLoad();
}
window.addEventListener('qg:twitch-session',ktsHandleSession);
export function mountSimpleKillathon(){
 const host=byId('kt-simple-app');if(!host)return;
 if(ktsTimer)clearInterval(ktsTimer);
 ktsAccountId=null;ktsBoard=null;ktsBusy=false;ktsError='';ktsInfo='';ktsRequest++;
 host.addEventListener('click',event=>{
  const button=event.target.closest('button[data-kts-action]');
  if(button&&host.contains(button))void ktsAction(button.dataset.ktsAction,host);
 });
 ktsHandleSession();
 ktsTimer=setInterval(()=>{
  if(!byId('kt-simple-app')){clearInterval(ktsTimer);ktsTimer=null;return;}
  if(document.visibilityState==='visible'&&!ktsBusy&&getQGTwitchSession()?.id===ktsAccountId&&ktsAccountId)void ktsLoad(true);
 },15000);
}
