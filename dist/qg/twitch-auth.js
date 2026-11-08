/* Ma_JesTik · OAuth Twitch : session d'onglet revalidée après F5.
   Le jeton reste dans sessionStorage (jamais localStorage).
   Les écritures sont vérifiées côté Cloudflare Worker. */
const clientId=(document.querySelector('meta[name="majestik-twitch-client-id"]')?.content||'').trim();
const KEY='mj-twitch-session-v1', PENDING='mj-twitch-state-v1';
const routes=new Set(['accueil','roue','defis','killathon','tribunal','classement','setup','partenaires','createur','profil','membre']);
const goodRoute=s=>typeof s==='string'&&s.startsWith('#/')&&routes.has(s.slice(2))?s:'#/accueil';
const get=k=>{try{return sessionStorage.getItem(k)}catch{return null}};
const put=(k,v)=>{try{sessionStorage.setItem(k,v);return true}catch{return false}};
const del=k=>{try{sessionStorage.removeItem(k)}catch{}};
// Un retour OAuth peut arriver dans un autre onglet (particulièrement sur mobile).
// On conserve SEULEMENT le state CSRF temporaire également entre les onglets
// du même navigateur ; jamais le jeton Twitch dans localStorage.
const getPendingLocal=()=>{try{return localStorage.getItem(PENDING)}catch{return null}};
const putPendingLocal=v=>{try{localStorage.setItem(PENDING,v);return true}catch{return false}};
const delPending=()=>{del(PENDING);try{localStorage.removeItem(PENDING)}catch{}};
const parsePending=raw=>{try{return JSON.parse(raw||"null")}catch{return null}};
const PENDING_TTL=20*60*1000;
let root=null,me=null;
let initPromise=Promise.resolve(); // Pendant le retour OAuth ou la revalidation F5.
function make(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function msg(text,retry=false){
 if(!root)return;
 root.replaceChildren();
 const e=make('span','qg-auth-note',text);e.setAttribute('role','status');root.append(e);
 if(retry){
  const b=make('button','qg-login','Réessayer avec Twitch');
  b.type='button';b.addEventListener('click',login);root.append(b);
 }
}
function clear(){me=null;del(KEY);window.dispatchEvent(new Event('qg:twitch-session'));}
function render(){
 if(!root)return;
 root.replaceChildren();
 if(!me){
   const b=make('button','qg-login','Se connecter');
   b.setAttribute('aria-label','Se connecter avec Twitch');
   b.type='button';b.addEventListener('click',login);root.append(b);return;
 }
 const wrapper=make('div','qg-account-dropdown');
 const trigger=make('button','qg-profile');trigger.type='button';
 trigger.setAttribute('aria-expanded','false');
 trigger.setAttribute('aria-haspopup','true');
 trigger.setAttribute('aria-controls','qgAccountMenu');
 trigger.setAttribute('aria-label','Compte Twitch de '+me.name+' : ouvrir les options');
 try{
  const url=new URL(me.avatar);
  if(url.protocol==='https:'&&url.hostname==='static-cdn.jtvnw.net'){
    const img=make('img');img.src=url.href;img.alt='';img.width=27;img.height=27;img.referrerPolicy='no-referrer';trigger.append(img);
  }
 }catch{}
 trigger.append(make('span','qg-profile-name',me.name));
 trigger.append(make('span','qg-profile-chevron','⌄'));
 const menu=make('div','qg-account-menu');
 menu.id='qgAccountMenu';menu.setAttribute('role','group');menu.setAttribute('aria-label','Options du compte Twitch');menu.hidden=true;
 const logout=make('button','qg-account-menu-logout','Se déconnecter');
 logout.type='button';
 logout.addEventListener('click',()=>{clear();render();});
 menu.append(logout);
 trigger.addEventListener('click',()=>{
  const opening=menu.hidden;
  menu.hidden=!opening;
  trigger.setAttribute('aria-expanded',String(opening));
  if(opening)logout.focus();
 });
 wrapper.append(trigger,menu);
 root.append(wrapper);
}
function temporarySessionError(){
 if(!root)return;
 msg('Twitch ne répond pas. Ta session est conservée dans cet onglet.');
 const retry=make('button','qg-login','Réessayer');
 retry.type='button';
 retry.addEventListener('click',()=>{void retryQGTwitchSession();});
 root.append(retry);
}
async function getJson(url,headers){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(url,{headers,signal:controller.signal,cache:'no-store'});
    if(!response.ok){const error=new Error('Twitch a répondu '+response.status);error.httpStatus=response.status;throw error;}
    return await response.json();
  }finally{clearTimeout(timer);}
}
async function check(token){
  const check=await getJson('https://id.twitch.tv/oauth2/validate',{Authorization:'OAuth '+token});
  if(check.client_id!==clientId||!/^[0-9]+$/.test(String(check.user_id||''))||Number(check.expires_in)<60){const e=new Error('Session Twitch expirée ou invalide');e.invalidSession=true;throw e;}
  const reply=await getJson('https://api.twitch.tv/helix/users',{Authorization:'Bearer '+token,'Client-Id':clientId});
  const user=reply?.data?.[0];
  if(!user||String(user.id)!==String(check.user_id)){const e=new Error('Identité non vérifiée');e.invalidSession=true;throw e;}
  const next={token,id:String(user.id),name:String(user.display_name||user.login||'Twitch').slice(0,64),avatar:String(user.profile_image_url||'')};
  if(!put(KEY,JSON.stringify(next)))throw Error('Stockage de session indisponible');
  const sessionChanged=me?.id!==next.id||me?.token!==next.token;
  me=next;render();
  // Ne pas recharger le profil à chaque vérification horaire : cela ferait perdre
  // les champs en cours d'édition. L'événement sert aux changements de compte.
  if(sessionChanged)window.dispatchEvent(new Event('qg:twitch-session'));
}
function login(){
  const bytes=crypto.getRandomValues(new Uint8Array(24));
  const state=Array.from(bytes,v=>v.toString(16).padStart(2,'0')).join('');
  const pending=JSON.stringify({state,route:goodRoute(location.hash),time:Date.now()});
  // sessionStorage pour l'onglet courant ; localStorage seulement pour
  // rapprocher un éventuel retour dans un nouvel onglet du même navigateur.
  // Si aucun des deux n'est disponible, on ne démarre pas OAuth.
  if(!put(PENDING,pending)&&!putPendingLocal(pending)){
    msg('Connexion impossible : stockage navigateur bloqué.');return;
  }
  // En présence de sessionStorage, tenter aussi le repli inter-onglets.
  putPendingLocal(pending);
  const u=new URL('https://id.twitch.tv/oauth2/authorize');
  u.search=new URLSearchParams({response_type:'token',client_id:clientId,redirect_uri:new URL('./',location.href).href,scope:'',state}).toString();
  location.assign(u.href);
}
async function finish(token){
  try{await check(token)}catch{clear();msg('Échec de connexion Twitch. Réessaie.',true);}
}
function callback(){
  const hash=location.hash.substring(1),query=new URLSearchParams(location.search);
  const hasToken=hash.startsWith('access_token='),hasHashError=hash.startsWith('error='),hasQueryError=query.has('error')&&query.has('state');
  if(!hasToken&&!hasHashError&&!hasQueryError)return false;
  const values=new URLSearchParams(hasQueryError?location.search.substring(1):hash);
  const returnedState=values.get('state');
  const inTab=parsePending(get(PENDING));
  const acrossTabs=parsePending(getPendingLocal());
  const acceptable=p=>p&&typeof p.state==='string'&&p.state.length===48&&
   p.state===returnedState&&Number.isFinite(p.time)&&
   p.time<=Date.now()&&Date.now()-p.time<=PENDING_TTL;
  const previous=acceptable(inTab)?inTab:(acceptable(acrossTabs)?acrossTabs:null);
  // Usage unique : jamais accepter un retour sans state correspondant.
  delPending();
  history.replaceState(null,'',location.pathname+(hasQueryError?'':location.search)+goodRoute(previous?.route));
  if(!previous){
    msg('Retour Twitch non reconnu. Réessaie dans le même navigateur (évite l’ouverture dans l’application Twitch).',true);
    return true;
  }
  if(hasHashError||hasQueryError){msg('Connexion Twitch annulée.',true);return true;}
  const token=values.get('access_token');
  if(!token||!/^[\w-]{12,500}$/.test(token)){msg('Jeton Twitch incorrect.',true);return true;}
  initPromise=finish(token);
  return true;
}
async function restore(){
 let old;try{old=JSON.parse(get(KEY)||'null')}catch{}
 if(!old?.token||typeof old.token!=='string'){render();return;}
 try{await check(old.token);}catch(error){
  // Le rejet Twitch ou un jeton expiré impose la déconnexion.
  // Une erreur réseau/5xx ne doit pas effacer une session encore valide.
  if(error?.invalidSession||error?.httpStatus===401||error?.httpStatus===403){
   clear();render();
  }else if(me?.token){
   // Réseau momentanément indisponible : le Worker vérifie toujours les actions.
   render();
  }else temporarySessionError();
 }
}
export async function waitForQGTwitchSession(){await initPromise;}
export function hasStoredQGTwitchSession(){return !!get(KEY);}
export function retryQGTwitchSession(){
 if(me?.token)return Promise.resolve();
 if(!get(KEY)){render();return Promise.resolve();}
 msg('Vérification de la session Twitch…');
 initPromise=restore();
 return initPromise;
}
export function getQGTwitchSession(){return me?.token?{id:me.id,name:me.name,avatar:me.avatar,token:me.token}:null;}
// Vérification d'affichage uniquement ; les actions restent protégées côté Cloudflare.
export function isQGOwnerSession(){
 const id=(document.querySelector('meta[name="majestik-owner-twitch-id"]')?.content||'').trim();
 return !!me?.token&&/^[0-9]+$/.test(id)&&String(me.id)===id;
}
export function mountTwitchAuth(){
  root=document.getElementById('qgTwitchAccount');
  if(!root||!/^[a-z0-9]{10,80}$/.test(clientId)){
    if(location.hash.startsWith('#access_token=')||location.hash.startsWith('#error=')){
      history.replaceState(null,'',location.pathname+location.search+'#/accueil');
    }
    return; // ID absent => aucun faux bouton visible
  }
  root.hidden=false;
  if(get(KEY))msg('Vérification de la session Twitch…');else render();
  // Fermer le menu au clic à l'extérieur, via Échap ou après navigation.
  document.addEventListener('pointerdown',e=>{
    const menu=root.querySelector('.qg-account-menu');
    const trigger=root.querySelector('.qg-profile');
    if(menu&&!menu.hidden&&!root.contains(e.target)){menu.hidden=true;trigger?.setAttribute('aria-expanded','false');}
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    const menu=root.querySelector('.qg-account-menu');
    const trigger=root.querySelector('.qg-profile');
    if(menu&&!menu.hidden){menu.hidden=true;trigger?.setAttribute('aria-expanded','false');trigger?.focus();}
  });
  window.addEventListener('hashchange',()=>{
    const menu=root.querySelector('.qg-account-menu');
    const trigger=root.querySelector('.qg-profile');
    if(menu&&!menu.hidden){menu.hidden=true;trigger?.setAttribute('aria-expanded','false');}
  });
  if(!callback())initPromise=restore();
  // Twitch exige la vérification des sessions au lancement et toutes les heures.
  setInterval(()=>{if(get(KEY))initPromise=restore();},3600000);
}
