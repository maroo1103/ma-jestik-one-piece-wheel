/* Défis Ma_JesTik — interface publique de pronostics.
   Off tant que la migration D1 et le compte propriétaire ne sont pas prêts.
   AUCUNE modification du catalogue des 118 défis Fortnite. */
import {getQGTwitchSession,isQGOwnerSession} from './twitch-auth.js?v=20261107-ranking-optin1';
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
 let round=null,info=null,profileError='',loading=true,busy=false,error='',updateAt=0,inflight=false,retryRefresh=false;
 let memberProfile=null,memberProfileId=null,memberProfileUpdatedAt=0,lastSessionId=null;
 let notifiedKey='';
 function notify(){
  const next=JSON.stringify([round?.id||'',round?.status||'',ownerUI(),info?.registered===true,loading]);
  if(next===notifiedKey)return;
  notifiedKey=next;
  onStateChange({round,owner:ownerUI(),registered:info?.registered===true,loaded:!loading});
 }
 let timer=null;
 const slot=()=>root.querySelector('#challengeVoteSlot');
 const session=()=>getQGTwitchSession();
 const ownerUI=()=>info?.owner===true||isQGOwnerSession();
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
 function snapshot(){return JSON.stringify([round?.id,round?.status,round?.result,info?.prediction,info?.registered,ownerUI(),memberProfile?.visible_in_ranking,profileError,error]);}
 async function refresh(quiet=false,forceProfile=true){
  if(inflight){retryRefresh=true;return;}
  if(busy)return;
  const before=snapshot();
  inflight=true;
  if(!quiet){loading=true;error='';render();}
  try{
   const previousId=round?.id;
   const status=await request('/v1/votes/current');
   round=status.round||null;
   const s=session();
   if(s?.token){
    if(forceProfile||!info||previousId!==round?.id||lastSessionId!==s.id){
     profileError='';
     try {info=await request('/v1/votes/me','GET',undefined,true);}
     catch (e) {
      info=null;
      profileError=String(e?.message||'').includes('401')
        ?'Connexion Twitch expirée. Déconnecte-toi puis reconnecte-toi.'
        :'Profil Twitch non vérifiable. Réessaie avec « Actualiser ».';
     }
    }
    lastSessionId=s.id;
   }else{info=null;lastSessionId=null;profileError='';}
   if(s?.token&&info?.registered===true){
    if(memberProfileId!==s.id||Date.now()-memberProfileUpdatedAt>60000){
     try{
      const profile=await request('/v1/me','GET',undefined,true);
      memberProfile=profile.member||null;memberProfileId=s.id;memberProfileUpdatedAt=Date.now();
     }catch{
      memberProfile=null;memberProfileId=null;memberProfileUpdatedAt=0;
     }
    }
   }else{
    memberProfile=null;memberProfileId=null;memberProfileUpdatedAt=0;
   }
   updateAt=Date.now();
  }catch{error='Synchronisation indisponible. Les votes ne sont pas actualisés.';}
  finally{
   inflight=false;loading=false;
   const changed=snapshot()!==before;
   notify();
   if(!quiet||changed)render();
   if(retryRefresh){retryRefresh=false;void refresh(true,false);}
  }
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
 function rankingVisibility(node){
  if(!session()?.token||info?.registered!==true||!memberProfile)return;
  if(Number(memberProfile.visible_in_ranking)===1)return;
  const notice=el('div','qg-vote-rank-notice');
  add(notice,'p','qg-vote-hint','Ton profil est masqué du classement, même si tu gagnes des points.');
  notice.append(button('Apparaître dans le classement','ranking-opt-in'));
  node.append(notice);
 }
 function controls(node){
  const status=round?.status;
  const s=session();
  const owner=ownerUI();
  if(status==='open'){
   if(!owner&&s?.token&&info?.registered&&!info?.prediction){
    const choices=el('div','qg-vote-choice-grid');
    const yes=button('✓ RÉUSSITE','vote-success');
    yes.append(el('small','qg-vote-reward','+1 point si tu as raison'));
    const no=button('✕ ÉCHEC','vote-failure');
    no.append(el('small','qg-vote-reward','+2 points si tu as raison'));
    choices.append(yes,no);node.append(choices);
   }else if(!owner&&info?.prediction){
    add(node,'p','qg-vote-confirmed','✓ Vote enregistré : '+nameOf[info.prediction]);
    add(node,'p','qg-vote-hint','C’est bon ! Attends le résultat de Ma_JesTik.');
   }else if(!owner&&!s?.token){
    add(node,'p','qg-vote-hint','Connecte-toi avec Twitch pour voter.');
   }else if(!owner&&profileError){
    add(node,'p','qg-vote-error',profileError);
   }else if(!owner&&info?.registered===false){
    const create=el('div','qg-vote-onboarding');
    add(create,'p','qg-vote-hint','Un profil QG est nécessaire pour voter.');
    const b=button('Créer mon profil pour voter','profile-create');
    b.setAttribute('aria-label','Créer volontairement mon profil QG et accéder aux pronostics');
    create.append(b);
    add(create,'small','qg-vote-consent','Cela enregistre ton ID Twitch, pseudo et avatar. Le classement reste facultatif.');
    node.append(create);
   }else if(!owner){
    add(node,'p','qg-vote-hint','Vérification de ton profil Twitch…');
   }
  }
  if(status==='open'||status==='locked'){
   if(owner){
    add(node,'p','qg-vote-hint',status==='open'?'Ton défi terminé ? Valide le résultat : les votes se fermeront automatiquement.':'Votes clos. Choisis le résultat officiel :');
    const verdict=el('div','qg-vote-choice-grid qg-vote-verdict');
    verdict.append(button('✓ J’AI RÉUSSI','resolve-success'),button('✕ J’AI ÉCHOUÉ','resolve-failure'));
    node.append(verdict);
    const admin=el('div','qg-vote-admin qg-vote-admin-secondary');
    if(status==='open')admin.append(button('Fermer sans résultat','close'));
    admin.append(button('Annuler la manche','cancel'));
    node.append(admin);
   }else if(status==='locked')add(node,'p','qg-vote-hint','Les votes sont terminés. Résultat en attente.');
   return;
  }
  if(owner&&startCandidate()){
   const admin=el('div','qg-vote-admin');
   admin.append(button('Ouvrir les votes','start'));
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
  add(section,'h3','qg-vote-title',ownerUI()?'Le verdict de la mission':'Va-t-il réussir ce défi ?');
  if(error)add(section,'p','qg-vote-error',error);
  else if(loading&&!round)add(section,'p','qg-vote-hint','Chargement…');
  else if(round?.status==='cancelled')add(section,'p','qg-vote-hint','Dernier vote annulé · 0 point.');
  else if(round?.status==='resolved'){
   add(section,'p','qg-vote-confirmed','Résultat officiel : '+nameOf[round.result]);
   if(!ownerUI()&&info?.prediction){
    if(info.prediction===round.result)add(section,'p','qg-vote-gain','✓ Bon pronostic · +'+(round.result==='failure'?2:1)+' point'+(round.result==='failure'?'s':''));
    else add(section,'p','qg-vote-hint','Pronostic incorrect · 0 point');
   }else if(!ownerUI())add(section,'p','qg-vote-hint','Manche terminée · 0 point sans pronostic.');
  }
  else if(round?.status==='locked'){
    const yes=Number(round.counts?.success||0),no=Number(round.counts?.failure||0);
    add(section,'p','qg-vote-result',yes+' Réussite · '+no+' Échec');
  }else if(!round&&!loading)add(section,'p','qg-vote-hint','Aucun vote ouvert actuellement.');
  if(!busy&&!loading&&!error){
   controls(section);
   rankingVisibility(section);
  }
  if(busy)add(section,'p','qg-vote-hint','Enregistrement…');
  const foot=el('div','qg-vote-foot');
  foot.append(el('small','qg-vote-auto-label','● Synchronisation automatique · env. 6 s'));
  const refresh=el('button','qg-vote-refresh','↻ Forcer la mise à jour');
  refresh.type='button';refresh.dataset.voteAction='refresh';refresh.disabled=busy||inflight;
  refresh.setAttribute('aria-label','Actualiser les votes');
  foot.append(refresh);
  section.append(foot);
  host.append(section);
  host.querySelectorAll('[data-vote-action]').forEach(b=>b.addEventListener('click',()=>{void act(b.dataset.voteAction);}));
 }
 async function publishCurrent(){
  if(!ownerUI()||busy)return false;
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
  if(action==='profile-create'){
   if(round?.status!=='open'||!session()?.token||info?.registered!==false)return;
   busy=true;error='';render();
   let message='';
   try{
    const created=await request('/v1/me','POST',undefined,true);
    memberProfile=created.member||null;memberProfileId=session()?.id||null;memberProfileUpdatedAt=Date.now();
   }catch {message='Création impossible. Vérifie ta connexion Twitch et réessaie.';}
   finally{
    busy=false;
    await refresh();
    if(message){error=message;render();}
   }
   return;
  }
  if(action==='ranking-opt-in'){
   if(!session()?.token||info?.registered!==true||!memberProfile||Number(memberProfile.visible_in_ranking)===1)return;
   busy=true;error='';render();
   let message='';
   try{
    const result=await request('/v1/me/visibility','PATCH',{visible:true},true);
    memberProfile=result.member||null;memberProfileId=session()?.id||null;memberProfileUpdatedAt=Date.now();
    window.dispatchEvent(new Event('qg:member-updated'));
   }catch{message='Impossible de modifier la visibilité du profil. Réessaie depuis le menu Twitch.';}
   finally{
    busy=false;
    await refresh();
    if(message){error=message;render();}
   }
   return;
  }
  const admin=['start','close','cancel','resolve-success','resolve-failure'].includes(action);
  if(admin&&!ownerUI())return;
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
   if(!['open','locked'].includes(round?.status))return;
   const outcome=action==='resolve-success'?'success':'failure';
   const mustClose=round.status==='open';
   path='/v1/votes/resolve';body={round_id:round.id,result:outcome};
   // Un seul clic côté streamer : clôture d'abord, puis résultat officiel.
   if(mustClose)body.close_first=true;
  }else return;
  busy=true;error='';render();
  let actionError='';
  try{
   if(path==='/v1/votes/resolve'&&body?.close_first){
    await request('/v1/votes/close','POST',{round_id:body.round_id},true);
    delete body.close_first;
   }
   await request(path,'POST',body,true);
  }
  catch{actionError='Validation incomplète ou connexion indisponible. Vérifie le statut de la manche avant de réessayer.';}
  finally{
    busy=false;
    await refresh();
    if(actionError){error=actionError;render();}
  }
 }
 render();
 void refresh();
 // La page visible se synchronise sans F5. Une page masquée ne consomme pas
 // de requêtes inutiles ; au retour, on resynchronise immédiatement.
 const isHere=()=>document.contains(root)&&location.hash.startsWith('#/defis');
 const syncOnReturn=()=>{if(isHere()&&document.visibilityState!=='hidden')void refresh(true,false);};
 timer=setInterval(()=>{
  if(!isHere()){clearInterval(timer);return;}
  if(document.visibilityState==='hidden')return;
  if(Date.now()-updateAt>=5800)void refresh(true,false);
 },2500);
 document.addEventListener('visibilitychange',syncOnReturn);
 window.addEventListener('focus',syncOnReturn);
 window.addEventListener('pageshow',syncOnReturn);
 window.addEventListener('qg:twitch-session',()=>{memberProfile=null;memberProfileId=null;if(isHere())void refresh();});
 window.addEventListener('qg:member-updated',()=>{memberProfileUpdatedAt=0;if(document.contains(root))void refresh();});
 return {render,refresh,publishCurrent,isOwner:()=>ownerUI(),hasOpenRound:()=>round?.status==='open'||round?.status==='locked',currentRound:()=>round};
}
