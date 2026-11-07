/* Défis Ma_JesTik — interface publique de pronostics.
   Off tant que la migration D1 et le compte propriétaire ne sont pas prêts.
   AUCUNE modification du catalogue des 118 défis Fortnite. */
import {getQGTwitchSession} from './twitch-auth.js?v=20261107-votes1';
const enabled=document.querySelector('meta[name="majestik-votes-enabled"]')?.content==='true';
const base=(document.querySelector('meta[name="majestik-members-api"]')?.content||'').replace(/\/$/,'');
const fixedAPI=base==='https://ma-jestik-qg-members.maroodu11.workers.dev';
const nameOf={success:'Réussite',failure:'Échec',open:'Votes ouverts',locked:'Votes clôturés',resolved:'Résultat validé',cancelled:'Annulé'};
function el(tag,cls,txt){
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(txt!==undefined)n.textContent=txt;
 return n;
}
function button(label,action,disabled=false){
 const b=el('button','qg-vote-button '+action,label);
 b.type='button';b.disabled=disabled;b.dataset.voteAction=action;
 return b;
}
export function mountVotePanel(root,getActive){
 if(!enabled||!fixedAPI)return {render(){}};
 let round=null,info=null,loading=true,busy=false,error='',updateAt=0,inflight=false;
 let timer=null;
 const slot=()=>root.querySelector('#challengeVoteSlot');
 const session=()=>getQGTwitchSession();
 async function request(path,method='GET',payload,authenticated=false){
  const headers={};
  const s=session();
  if(authenticated){
   if(!s?.token)throw Error('Connexion Twitch requise');
   headers.Authorization='Bearer '+s.token;
  }
  if(payload!==undefined)headers['Content-Type']='application/json';
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  try{
   const response=await fetch(base+path,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload),
    signal:controller.signal,mode:'cors',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
   if(!response.ok)throw Error('API '+response.status);
   return await response.json();
  }finally{clearTimeout(timeout);}
 }
 async function refresh(){
  if(inflight||busy)return;
  inflight=true;loading=true;error='';render();
  try{
   const status=await request('/v1/votes/current');
   round=status.round||null;
   const s=session();
   if(s?.token){
    try {info=await request('/v1/votes/me','GET',undefined,true);}
    catch {info=null;}
   } else info=null;
   updateAt=Date.now();
  }catch{error='Le service de vote est momentanément indisponible.';}
  finally{inflight=false;loading=false;render();}
 }
 function add(parent,tag,cls,txt){const n=el(tag,cls,txt);parent.append(n);return n;}
 function startCandidate(){
  const d=getActive();
  if(!d||typeof d!=='object')return null;
  const id=Number(d.id);
  if(d.source!=='viewer'&&(!Number.isInteger(id)||id<1||id>118))return null;
  const title=String(d.title||'').trim();
  if(title.length<3||title.length>100)return null;
  const team=['solo','duo','trio','quatuor'].includes(d.team)?d.team:'solo';
  if(round && ['open','locked'].includes(round.status))return null;
  if(round && Number(d.started||0)<=Number(round.created_at||0)*1000)return null;
  return {game:'fortnite',challenge_id:d.source==='viewer'?0:id,title,team};
 }
 function controls(node){
  const panel=el('div','qg-vote-actions');
  const status=round?.status;
  const s=session();
  if(!round||status==='resolved'||status==='cancelled'){
   const candidate=info?.owner?startCandidate():null;
   if(candidate)panel.append(button('Ouvrir le vote pour ma mission','start'));
   else if(info?.owner){
    add(panel,'p','qg-vote-hint','Tire une nouvelle mission sur cet appareil pour ouvrir le prochain vote.');
   }
  }
  if(status==='open'){
   if(s?.token && info?.registered && !info?.prediction){
    panel.append(button('Je vote : Réussite','vote-success'),button('Je vote : Échec','vote-failure'));
   }else if(info?.prediction){
    add(panel,'p','qg-vote-confirmed','✓ Pronostic enregistré : '+nameOf[info.prediction]);
   }else if(!s?.token){
    add(panel,'p','qg-vote-hint','Connecte-toi avec Twitch en haut à droite pour voter.');
   }else if(!info?.registered){
    add(panel,'p','qg-vote-hint','Crée ton profil QG dans le menu de ton pseudo Twitch avant de voter.');
   }else{
    add(panel,'p','qg-vote-hint','Récupération de ton profil en cours…');
   }
   if(info?.owner)panel.append(button('Fermer les votes','close'),button('Annuler le vote','cancel'));
  }
  if(status==='locked'&&info?.owner){
   add(panel,'p','qg-vote-hint','Le scrutin est clos. Valide maintenant ton vrai résultat.');
   panel.append(button('J’ai réussi · +1 aux bons votes','resolve-success'),button('J’ai échoué · +2 aux bons votes','resolve-failure'),button('Annuler sans points','cancel'));
  }
  if(panel.childNodes.length)node.append(panel);
 }
 function render(){
  const host=slot();if(!host)return;
  host.replaceChildren();
  const section=el('section','qg-vote-panel');
  add(section,'span','qg-vote-kicker','VOTE DE L’ÉQUIPAGE · FORTNITE');
  add(section,'h3','qg-vote-title','Réussite ou échec ? À toi de prédire !');
  add(section,'p','qg-vote-description','Prédis le résultat officiel : +1 point si tu annonces une réussite, +2 si tu annonces un échec.');
  if(loading && !round)add(section,'p','qg-vote-hint','Chargement du vote…');
  if(error)add(section,'p','qg-vote-error',error);
  if(round){
   const badge=add(section,'div','qg-vote-state',nameOf[round.status]||round.status);
   if(round.status==='cancelled')badge.classList.add('cancelled');
   add(section,'h4','qg-vote-challenge',round.challenge_title);
   add(section,'p','qg-vote-hint','Les votes sont uniques par compte Twitch. Les points sont attribués uniquement après validation par Ma_JesTik.');
   if(round.status==='locked'||round.status==='resolved'||round.status==='cancelled'){
    const n=Number(round.counts?.success||0),m=Number(round.counts?.failure||0);
    add(section,'p','qg-vote-result','Votes : '+n+' Réussite · '+m+' Échec');
    if(round.status==='resolved')add(section,'p','qg-vote-confirmed','Résultat officiel : '+nameOf[round.result]);
    if(round.status==='cancelled')add(section,'p','qg-vote-hint','Manche annulée : aucun point attribué.');
   }
  }else if(!loading) add(section,'p','qg-vote-hint','Aucun vote officiel en cours pour le moment.');
  if(!busy&&!loading&&!error)controls(section);
  if(busy)add(section,'p','qg-vote-hint','Enregistrement en cours…');
  const updated=el('button','qg-vote-refresh','Actualiser le vote');updated.type='button';updated.dataset.voteAction='refresh';updated.disabled=busy||inflight;
  section.append(updated);
  host.append(section);
  host.querySelectorAll('[data-vote-action]').forEach(b=>b.addEventListener('click',()=>{void act(b.dataset.voteAction);}));
 }
 async function act(action){
  if(action==='refresh'){await refresh();return;}
  if(busy)return;
  const admin=['start','close','cancel','resolve-success','resolve-failure'].includes(action);
  if(admin&&!info?.owner)return;
  let path='',body=null;
  if(action==='start'){
   body=startCandidate();if(!body)return;
   path='/v1/votes/start';
  }else if(action==='vote-success'||action==='vote-failure'){
   if(round?.status!=='open'||info?.prediction||!info?.registered)return;
   path='/v1/votes/cast';body={round_id:round.id,prediction:action==='vote-success'?'success':'failure'};
  }else if(action==='close'){
   if(round?.status!=='open')return;
   path='/v1/votes/close';body={round_id:round.id};
  }else if(action==='cancel'){
   if(!round||!['open','locked'].includes(round.status)||!window.confirm('Annuler ce vote sans attribuer de points ?'))return;
   path='/v1/votes/cancel';body={round_id:round.id};
  }else if(action==='resolve-success'||action==='resolve-failure'){
   if(round?.status!=='locked')return;
   const outcome=action==='resolve-success'?'success':'failure';
   if(!window.confirm('Confirmer '+nameOf[outcome]+' comme résultat OFFICIEL ? Les points seront définitivement attribués.'))return;
   path='/v1/votes/resolve';body={round_id:round.id,result:outcome};
  }else return;
  busy=true;error='';render();
  let actionError='';
  try{await request(path,'POST',body,true);}
  catch{actionError='Action refusée ou connexion indisponible. Actualise le vote puis réessaie.';}
  finally{
    busy=false;
    await refresh();
    if(actionError){error=actionError;render();}
  }
 }
 render();
 void refresh();
 timer=setInterval(()=>{
  if(!document.contains(root)||!location.hash.startsWith('#/defis')){
   clearInterval(timer);return;
  }
  if(Date.now()-updateAt>=14000)void refresh();
 },15000);
 window.addEventListener('qg:twitch-session',()=>{if(document.contains(root))void refresh();});
 return {render,refresh};
}
