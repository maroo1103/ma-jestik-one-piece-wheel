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
export function mountVotePanel(root,getActive,onStateChange=()=>{}){
 if(!enabled||!fixedAPI)return {render(){}};
 let round=null,info=null,loading=true,busy=false,error='',updateAt=0,inflight=false,retryRefresh=false;
 let notifiedKey='';
 function notify(){
  const next=JSON.stringify([round?.id||'',round?.status||'',info?.owner===true,info?.registered===true,loading]);
  if(next===notifiedKey)return;
  notifiedKey=next;
  onStateChange({round,owner:info?.owner===true,registered:info?.registered===true,loaded:!loading});
 }
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
  if(inflight){retryRefresh=true;return;}
  if(busy)return;
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
  finally{inflight=false;loading=false;notify();render();if(retryRefresh){retryRefresh=false;void refresh();}}
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
  const status=round?.status;
  const s=session();
  if(status==='open'){
    if(s?.token&&info?.registered&&!info?.prediction){
      const choices=el('div','qg-vote-choice-grid');
      const yes=button('✓ RÉUSSITE','vote-success');
      yes.append(el('small','qg-vote-reward','+1 point si correct'));
      const no=button('✕ ÉCHEC','vote-failure');
      no.append(el('small','qg-vote-reward','+2 points si correct'));
      choices.append(yes,no);
      node.append(choices);
    }else if(info?.prediction){
      add(node,'p','qg-vote-confirmed','✓ Ton vote : '+nameOf[info.prediction]);
    }else if(!s?.token){
      add(node,'p','qg-vote-hint','Connecte-toi avec Twitch pour voter.');
    }else if(!info?.registered){
      add(node,'p','qg-vote-hint','Crée ton profil QG pour voter.');
    }else add(node,'p','qg-vote-hint','Vérification de ton profil…');
    if(info?.owner){
      const admin=el('div','qg-vote-admin');
      admin.append(button('Fermer les votes','close'),button('Annuler','cancel'));
      node.append(admin);
    }
    return;
  }
  if(status==='locked'){
    if(info?.owner){
      const admin=el('div','qg-vote-admin');
      admin.append(button('✓ Réussite','resolve-success'),button('✕ Échec','resolve-failure'),button('Annuler','cancel'));
      node.append(admin);
    }else add(node,'p','qg-vote-hint','Résultat officiel en attente.');
    return;
  }
  if(info?.owner&&startCandidate()){
    const admin=el('div','qg-vote-admin');
    admin.append(button('Ouvrir le vote','start'));
    node.append(admin);
  }
 }
 function render(){
  const host=slot();if(!host)return;
  host.replaceChildren();
  const section=el('section','qg-vote-panel');
  section.setAttribute('aria-label','Pronostic de l’équipage');
  const top=el('div','qg-vote-top');
  top.append(el('span','qg-vote-kicker','🎯 PRONOSTIC DE L’ÉQUIPAGE'));
  const state=round?.status||'idle';
  const labels={open:'Votes ouverts',locked:'Votes clos',resolved:'Terminé',cancelled:'Annulé',idle:'En attente'};
  top.append(el('span','qg-vote-state state-'+state,labels[state]||'En attente'));
  section.append(top);
  add(section,'h3','qg-vote-title','Va-t-il réussir ce défi ?');
  if(error)add(section,'p','qg-vote-error',error);
  else if(loading&&!round)add(section,'p','qg-vote-hint','Chargement…');
  else if(round?.status==='cancelled')add(section,'p','qg-vote-hint','Dernier vote annulé · 0 point.');
  else if(round?.status==='resolved')add(section,'p','qg-vote-confirmed','Dernier résultat : '+nameOf[round.result]+' · +'+(round.result==='failure'?2:1)+' aux bons votes');
  else if(round?.status==='locked'){
    const yes=Number(round.counts?.success||0),no=Number(round.counts?.failure||0);
    add(section,'p','qg-vote-result',yes+' Réussite · '+no+' Échec');
  }else if(!round&&!loading)add(section,'p','qg-vote-hint','Aucun vote ouvert actuellement.');
  if(!busy&&!loading&&!error)controls(section);
  if(busy)add(section,'p','qg-vote-hint','Enregistrement…');
  const foot=el('div','qg-vote-foot');
  foot.append(el('small','','Un vote par membre Twitch'));
  const refresh=el('button','qg-vote-refresh','↻ Actualiser');
  refresh.type='button';refresh.dataset.voteAction='refresh';refresh.disabled=busy||inflight;
  refresh.setAttribute('aria-label','Actualiser les votes');
  foot.append(refresh);
  section.append(foot);
  host.append(section);
  host.querySelectorAll('[data-vote-action]').forEach(b=>b.addEventListener('click',()=>{void act(b.dataset.voteAction);}));
 }
 async function publishCurrent(){
  if(!info?.owner||busy)return false;
  const candidate=startCandidate();
  if(!candidate)return false;
  busy=true;error='';render();
  let ok=false,problem='';
  try{await request('/v1/votes/start','POST',candidate,true);ok=true;}
  catch{problem='Mission non publiée. Réessaie avec « Ouvrir le vote ».';}
  finally{busy=false;await refresh();if(problem){error=problem;render();}}
  return ok;
 }
 async function act(action){
  if(action==='refresh'){await refresh();return;}
  if(action==='start'){await publishCurrent();return;}
  if(busy)return;
  const admin=['start','close','cancel','resolve-success','resolve-failure'].includes(action);
  if(admin&&!info?.owner)return;
  let path='',body=null;
  if(action==='vote-success'||action==='vote-failure'){
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
 return {render,refresh,publishCurrent,isOwner:()=>info?.owner===true,hasOpenRound:()=>round?.status==='open'||round?.status==='locked',currentRound:()=>round};
}
