/* Ma_JesTik · OAuth Twitch sans mot de passe ni secret public.
 Profil vérifié seulement dans ce navigateur. Aucun classement/point persistant.
 Pour une vraie session serveur, passer plus tard à Authorization Code + Workers/D1. */
const clientId=(document.querySelector('meta[name="majestik-twitch-client-id"]')?.content||'').trim();
const KEY='mj-twitch-session-v1', PENDING='mj-twitch-state-v1';
const routes=new Set(['accueil','roue','defis','killathon','tribunal','classement','setup','partenaires','createur']);
const goodRoute=s=>typeof s==='string'&&s.startsWith('#/')&&routes.has(s.slice(2))?s:'#/accueil';
const get=k=>{try{return sessionStorage.getItem(k)}catch{return null}};
const put=(k,v)=>{try{sessionStorage.setItem(k,v);return true}catch{return false}};
const del=k=>{try{sessionStorage.removeItem(k)}catch{}};
let root=null,me=null;
function make(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function msg(text){if(!root)return;root.replaceChildren();const e=make('span','qg-auth-note',text);e.setAttribute('role','status');root.append(e);}
function clear(){me=null;del(KEY);}
function render(){
  if(!root)return;
  root.replaceChildren();
  if(!me){const b=make('button','qg-login','Connexion Twitch');b.type='button';b.addEventListener('click',login);root.append(b);return;}
  const wrapper=make('div','qg-account-dropdown');
  const trigger=make('button','qg-profile');trigger.type='button';
  trigger.setAttribute('aria-expanded','false');
  trigger.setAttribute('aria-haspopup','menu');
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
  menu.id='qgAccountMenu';menu.setAttribute('role','menu');menu.hidden=true;
  const heading=make('span','qg-account-menu-heading','Compte Twitch');
  heading.setAttribute('role','presentation');
  const logout=make('button','qg-account-menu-logout','Se déconnecter');
  logout.type='button';logout.setAttribute('role','menuitem');
  logout.addEventListener('click',()=>{clear();render();});
  menu.append(heading,logout);
  trigger.addEventListener('click',()=>{
    const opening=menu.hidden;
    menu.hidden=!opening;
    trigger.setAttribute('aria-expanded',String(opening));
    if(opening)logout.focus();
  });
  wrapper.append(trigger,menu);
  root.append(wrapper);
}
async function getJson(url,headers){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(url,{headers,signal:controller.signal,cache:'no-store'});
    if(!response.ok)throw Error('Twitch a répondu '+response.status);
    return await response.json();
  }finally{clearTimeout(timer);}
}
async function check(token){
  const check=await getJson('https://id.twitch.tv/oauth2/validate',{Authorization:'OAuth '+token});
  if(check.client_id!==clientId||!/^[0-9]+$/.test(String(check.user_id||''))||Number(check.expires_in)<60)throw Error('Validation Twitch invalide');
  const reply=await getJson('https://api.twitch.tv/helix/users',{Authorization:'Bearer '+token,'Client-Id':clientId});
  const user=reply?.data?.[0];
  if(!user||String(user.id)!==String(check.user_id))throw Error('Identité non vérifiée');
  const next={token,id:String(user.id),name:String(user.display_name||user.login||'Twitch').slice(0,64),avatar:String(user.profile_image_url||'')};
  if(!put(KEY,JSON.stringify(next)))throw Error('Stockage de session indisponible');
  me=next;render();
}
function login(){
  const bytes=crypto.getRandomValues(new Uint8Array(24));
  const state=Array.from(bytes,v=>v.toString(16).padStart(2,'0')).join('');
  if(!put(PENDING,JSON.stringify({state,route:goodRoute(location.hash),time:Date.now()}))){
    msg('Connexion impossible : stockage temporaire bloqué.');return;
  }
  const u=new URL('https://id.twitch.tv/oauth2/authorize');
  u.search=new URLSearchParams({response_type:'token',client_id:clientId,redirect_uri:new URL('./',location.href).href,scope:'',state}).toString();
  location.assign(u.href);
}
async function finish(token){
  try{await check(token)}catch{clear();msg('Échec de connexion Twitch. Réessaie.');}
}
function callback(){
  const hash=location.hash.substring(1),query=new URLSearchParams(location.search);
  const hasToken=hash.startsWith('access_token='),hasHashError=hash.startsWith('error='),hasQueryError=query.has('error')&&query.has('state');
  if(!hasToken&&!hasHashError&&!hasQueryError)return false;
  const values=new URLSearchParams(hasQueryError?location.search.substring(1):hash);
  let previous;
  try{previous=JSON.parse(get(PENDING)||'null')}catch{}
  del(PENDING);
  history.replaceState(null,'',location.pathname+(hasQueryError?'':location.search)+goodRoute(previous?.route));
  if(!previous||!Number.isFinite(previous.time)||Date.now()-previous.time>600000||values.get('state')!==previous.state){
    msg('Retour Twitch non reconnu : reconnecte-toi.');return true;
  }
  if(hasHashError||hasQueryError){msg('Connexion Twitch annulée.');return true;}
  const token=values.get('access_token');
  if(!token||!/^[\w-]{12,500}$/.test(token)){msg('Jeton Twitch incorrect.');return true;}
  void finish(token);
  return true;
}
async function restore(){
  let old;try{old=JSON.parse(get(KEY)||'null')}catch{}
  if(!old?.token||typeof old.token!=='string')return;
  try{await check(old.token)}catch{clear();render();}
}
export function mountTwitchAuth(){
  root=document.getElementById('qgTwitchAccount');
  if(!root||!/^[a-z0-9]{10,80}$/.test(clientId)){
    if(location.hash.startsWith('#access_token=')||location.hash.startsWith('#error=')){
      history.replaceState(null,'',location.pathname+location.search+'#/accueil');
    }
    return; // ID absent => aucun faux bouton visible
  }
  root.hidden=false;render();
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
  if(!callback())void restore();
  // Twitch exige la vérification des sessions au lancement et toutes les heures.
  setInterval(()=>{if(get(KEY))void restore()},3600000);
}
