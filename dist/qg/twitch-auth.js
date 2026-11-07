/* Ma_JesTik · OAuth Twitch sans mot de passe ni secret public.
 Profil vérifié seulement dans ce navigateur. Aucun classement/point persistant.
 Pour une vraie session serveur, passer plus tard à Authorization Code + Workers/D1. */
const clientId=(document.querySelector('meta[name="majestik-twitch-client-id"]')?.content||'').trim();
const KEY='mj-twitch-session-v1', PENDING='mj-twitch-state-v1';
const API=(document.querySelector('meta[name="majestik-members-api"]')?.content||'').replace(/\/$/,'');
const apiReady=API==='https://ma-jestik-qg-members.maroodu11.workers.dev';
let member=null,memberBusy=false,memberMessage='';
const routes=new Set(['accueil','roue','defis','killathon','tribunal','classement','setup','partenaires','createur']);
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
function clear(){me=null;member=null;memberBusy=false;memberMessage='';del(KEY);window.dispatchEvent(new Event('qg:twitch-session'));}
function render(open=false){
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
  menu.id='qgAccountMenu';menu.setAttribute('role','group');menu.setAttribute('aria-label','Options Twitch et profil QG');menu.hidden=true;
  const heading=make('span','qg-account-menu-heading','Compte Twitch');
  heading.setAttribute('role','presentation');
  if(apiReady) {
    const area=make('section','qg-member-area');
    area.append(make('strong','qg-member-heading','PROFIL COMMUNAUTAIRE'));
    if(memberBusy)area.append(make('p','qg-member-note','Mise à jour du profil…'));
    else if(member){
      area.append(make('p','qg-member-active','✓ Profil QG enregistré'));
      area.append(make('p','qg-member-note','Ce profil contient ton identifiant Twitch, ton pseudo, ton avatar et sa date de création.'));
      const label=make('label','qg-member-option');
      const choice=make('input');choice.type='checkbox';choice.checked=member.visible_in_ranking===1;
      label.append(choice,make('span','','Participer au futur classement'));
      choice.addEventListener('change',()=>{void profileAction('visibility',{visible:choice.checked});});
      area.append(label);
      area.append(make('p','qg-member-note','Aucun point n’est encore attribué. Le classement sera volontaire.'));
      const erase=make('button','qg-member-erase','Supprimer mon profil QG');erase.type='button';
      erase.addEventListener('click',()=>{void profileAction('delete');});
      area.append(erase);
    }else if(memberMessage!=='offline'){
      area.append(make('p','qg-member-note','Enregistre ton identifiant Twitch, ton pseudo, ton avatar et ta date d’inscription pour les futurs classements. Tu pourras supprimer ton profil ici.'));
      const create=make('button','qg-member-create','Créer mon profil QG');create.type='button';
      create.addEventListener('click',()=>{void profileAction('create');});
      area.append(create);
    }
    if(memberMessage)area.append(make('p','qg-member-error',memberMessage==='offline'?'Profils indisponibles pour le moment.':'Action impossible. Réessaie.'));
    menu.append(area);
  }
  const logout=make('button','qg-account-menu-logout','Se déconnecter');
  logout.type='button';
  logout.addEventListener('click',()=>{clear();render();});
  menu.append(heading,logout);
  trigger.addEventListener('click',()=>{
    const opening=menu.hidden;
    menu.hidden=!opening;
    trigger.setAttribute('aria-expanded',String(opening));
    if(opening)menu.querySelector('button')?.focus();
  });
  wrapper.append(trigger,menu);
  root.append(wrapper);
  if(open){menu.hidden=false;trigger.setAttribute('aria-expanded','true');}
}
async function membersFetch(method,path,token,body) {
  if(!apiReady)throw new Error('API absente');
  const c=new AbortController(),timeout=setTimeout(()=>c.abort(),10000);
  const headers={Authorization:'Bearer '+token};
  if(body!==undefined)headers['Content-Type']='application/json';
  try {
    const res=await fetch(API+path,{
      method,headers,body:body===undefined?undefined:JSON.stringify(body),
      mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:c.signal
    });
    if(!res.ok)throw new Error('API '+res.status);
    return await res.json();
  }finally{clearTimeout(timeout);}
}
async function loadMember(id,token){
  if(!apiReady)return;
  memberBusy=true;memberMessage='';render();
  try{
    const data=await membersFetch('GET','/v1/me',token);
    if(me?.id!==id)return;
    member=data.member||null;
  }catch{
    if(me?.id===id){member=null;memberMessage='offline';}
  }finally{
    if(me?.id===id){memberBusy=false;render();}
  }
}
async function profileAction(action,payload){
  if(!me||memberBusy||!apiReady)return;
  if(action==='delete'&&!window.confirm('Supprimer définitivement ton profil du QG Ma_JesTik ?'))return;
  const id=me.id,token=me.token;
  memberBusy=true;memberMessage='';render(true);
  try{
    const spec={
      create:['POST','/v1/me',undefined],
      visibility:['PATCH','/v1/me/visibility',payload],
      delete:['DELETE','/v1/me',undefined]
    }[action];
    if(!spec)throw new Error('Action non autorisée');
    const data=await membersFetch(spec[0],spec[1],token,spec[2]);
    if(me?.id!==id)return;
    member=action==='delete'?null:data.member;
    if(action!=='delete'&&!member)throw new Error('Réponse sans profil');
  }catch{
    if(me?.id===id)memberMessage='write';
  }finally{
    if(me?.id===id){memberBusy=false;render(true);}
  }
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
  me=next;member=null;memberMessage='';render();window.dispatchEvent(new Event('qg:twitch-session'));
  if(apiReady)void loadMember(next.id,token);
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
  void finish(token);
  return true;
}
async function restore(){
  let old;try{old=JSON.parse(get(KEY)||'null')}catch{}
  if(!old?.token||typeof old.token!=='string')return;
  try{await check(old.token)}catch{clear();render();}
}
export function getQGTwitchSession(){return me?.token?{id:me.id,name:me.name,token:me.token}:null;}
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
