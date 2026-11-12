/* Propositions de défis communautaires : Twitch vérifié, file partagée.
   Utilise les propositions de l'API Tribunal (déjà déployée), isolées via
   un préfixe ; aucun sondage Tribunal n'est créé par cet outil. */
import {getQGTwitchSession} from './twitch-auth.js';
const PREFIX='🎯 DÉFI · ';
const GAME_MARKERS=Object.freeze({'warzone-hajin':'⊛H⊛','warzone-zodiac':'⊛Z⊛','warzone-rebirth':'⊛R⊛','warzone-verdansk':'⊛V⊛'});
const GAME_LABELS=Object.freeze({fortnite:'Fortnite','warzone-hajin':'Hajin','warzone-zodiac':'Zodiac','warzone-rebirth':'Rebirth Island','warzone-verdansk':'Verdansk'});
const API=(document.querySelector('meta[name="majestik-tribunal-api"]')?.content||'').replace(/\/+$/,'');
const TEAMS={solo:'Solo',duo:'Duo',trio:'Trio',quatuor:'Quatuor'};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const encodeAnswers=description=>[0,1,2,3].map(i=>(i+1)+':'+description.slice(i*45,(i+1)*45)+'#');
function decode(p){
 if(!p||typeof p.question!=='string'||!p.question.startsWith(PREFIX))return null;
 const m=/^🎯 DÉFI · (solo|duo|trio|quatuor) · (.{3,80})$/u.exec(p.question);
 if(!m||!Array.isArray(p.answers)||p.answers.length!==4)return null;
 const chunks=p.answers.map((v,i)=>typeof v==='string'&&v.startsWith((i+1)+':')&&v.endsWith('#')?v.slice(2,-1):null);
 if(chunks.some(c=>c===null))return null;
 let description=chunks.join(''),game='fortnite';
 for(const [id,mark] of Object.entries(GAME_MARKERS)){
  if(description.startsWith(mark)){game=id;description=description.slice(mark.length);break;}
 }
 if(description.length<10||description.length>180)return null;
 return {id:String(p.id),game,title:m[2],description,team:m[1],by:String(p.author_name||'Viewer').slice(0,64),source:'viewer'};
}
async function request(path,method='GET',body){
 const token=getQGTwitchSession()?.token;
 if(!token)throw Error('Connexion Twitch requise.');
 if(!/^https:\/\/[a-z0-9.-]+$/i.test(API))throw Error('Service des propositions indisponible.');
 const ctl=new AbortController(),time=setTimeout(()=>ctl.abort(),10000);
 try{
  const res=await fetch(API+path,{method,mode:'cors',cache:'no-store',credentials:'omit',signal:ctl.signal,
   headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},
   body:body?JSON.stringify(body):undefined});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(res.status===429?'Limite atteinte : 3 propositions sur 24 h, ou file pleine.':
   res.status===401?'Session Twitch expirée. Reconnecte-toi.':
   String(data.error||'Erreur HTTP '+res.status));
  return data;
 }finally{clearTimeout(time)}
}
function memberHtml(game='fortnite'){
 const logged=!!getQGTwitchSession()?.token;
 const fields=Object.entries(TEAMS).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('');
 return '<section class="panel challenge-community-panel" data-challenge-proposals-slot="member">'+
 '<div class="challenge-game-kicker">LA PAROLE AUX VIEWERS</div><h3>PROPOSER UN DÉFI</h3>'+
 (logged
 ? '<p>Une idée de mission '+esc(GAME_LABELS[game]||'Fortnite')+' ? Envoie-la directement à Ma_JesTik pour validation.</p>'+
   '<form id="challengeCommunityProposalForm" class="challenge-community-form">'+
   '<label>Composition<select name="team" required>'+fields+'</select></label>'+
   '<label>Nom du défi<input name="title" type="text" required minlength="3" maxlength="80" placeholder="Ex. Une partie sans bouclier"></label>'+
   '<label>Règles du défi<textarea name="description" required minlength="10" maxlength="'+(game==='fortnite'?180:177)+'" rows="3" placeholder="Décris précisément comment réussir ce défi"></textarea></label>'+
   '<button class="btn btn-gold" type="submit">ENVOYER MA PROPOSITION</button>'+
   '<small>3 propositions maximum par 24 h, quota partagé avec le Tribunal.</small></form>'
 : '<p>Connecte-toi avec Twitch en haut à droite pour proposer un défi.</p>')+
 '<p class="challenge-proposal-feedback" id="challengeProposalFeedback" role="status" aria-live="polite"></p></section>';
}
function ownerHtml(queue,notice,busy){
 // Complète la rubrique « PROPOSITIONS À VALIDER » déjà présente dans Défis.
 // Aucune nouvelle carte, aucun nouveau titre ou encadré propriétaire.
 if(!queue.length&&!notice)return '';
 return '<div class="challenge-shared-proposals" data-challenge-proposals-slot="owner">'+
 queue.map(p=>
  '<article class="challenge-queue-item"><div><small>DE '+esc(p.by)+' · '+esc(TEAMS[p.team])+' · TWITCH</small>'+
  '<h4>'+esc(p.title)+'</h4><p>'+esc(p.description)+'</p></div>'+
  '<div class="challenge-queue-actions">'+
  '<button type="button" class="btn btn-gold btn-small" data-shared-proposal="accept" data-proposal-id="'+esc(p.id)+'" '+(busy?'disabled':'')+'>Accepter</button>'+
  '<button type="button" class="btn btn-small" data-shared-proposal="reject" data-proposal-id="'+esc(p.id)+'" '+(busy?'disabled':'')+'>Refuser</button>'+
  '</div></article>').join('')+
 (notice?'<p class="challenge-proposal-feedback" role="status">'+esc(notice)+'</p>':'')+
 '</div>';
}
export function mountChallengeProposals({root,isOwner,canAccept,onAccept,getGame=()=> 'fortnite'}){
 let queue=[],message='',busy=false,fetching=false;
 const active=()=>root.isConnected&&root.querySelector('.challenge-ui');
 function render(){
  if(!active())return;
  root.querySelectorAll('[data-challenge-proposals-slot]').forEach(node=>node.remove());
  const owner=!!isOwner();
  // Propriétaire : conserver la file de validation existante.
  // Membres : placer le formulaire entre Journal des missions et Pronostic.
  if(owner){
   const host=root.querySelector('.challenge-queue');
   if(!host)return;
   const visible=queue.filter(item=>item.game===getGame());
   if(visible.length)host.querySelector('[data-challenge-queue-empty]')?.remove();
   const markup=ownerHtml(visible,message,busy);
   if(markup)host.insertAdjacentHTML('beforeend',markup);
  }else{
   const voteSlot=root.querySelector('#challengeVoteSlot');
   if(voteSlot){
    voteSlot.insertAdjacentHTML('beforebegin',memberHtml(getGame()));
   }else{
    root.querySelector('.challenge-ui')?.insertAdjacentHTML('beforeend',memberHtml(getGame()));
   }
  }
 }
 async function refresh(){
  if(!active()||!isOwner()||fetching||busy)return;
  fetching=true;
  try{
   const data=await request('/v1/tribunal/proposals');
   if(!active()||!isOwner())return;
   const next=(Array.isArray(data.proposals)?data.proposals:[]).map(decode).filter(Boolean);
   if(JSON.stringify(next)!==JSON.stringify(queue)||message){queue=next;message='';render();}
  }catch(e){if(active()){const error=String(e.message||e);if(message!==error){message=error;render();}}}
  finally{fetching=false}
 }
 root.addEventListener('submit',e=>{
  if(e.target.id!=='challengeCommunityProposalForm')return;
  e.preventDefault();
  if(isOwner())return;
  const form=e.target,feedback=root.querySelector('#challengeProposalFeedback'),button=form.querySelector('button[type="submit"]');
  if(button?.disabled)return;
  const data=new FormData(form);
  const team=String(data.get('team')||''),title=String(data.get('title')||'').trim();
  const description=String(data.get('description')||'').trim();
  const marker=GAME_MARKERS[getGame()]||'';
  if(!Object.hasOwn(TEAMS,team)||title.length<3||title.length>80||description.length<10||description.length>180-marker.length){
   if(feedback)feedback.textContent='Vérifie la composition, le titre et les règles (180 caractères maximum).';
   return;
  }
  if(button)button.disabled=true;
  if(feedback)feedback.textContent='Envoi en cours…';
  void (async()=>{
   try{
    const result=await request('/v1/tribunal/proposals','POST',{
     question:PREFIX+team+' · '+title,answers:encodeAnswers(marker+description)
    });
    if(!result.accepted)throw Error('La proposition n’a pas été confirmée.');
    if(feedback)feedback.textContent='✓ Proposition transmise à Ma_JesTik pour validation !';
    form.reset();
   }catch(err){if(feedback)feedback.textContent='Envoi impossible : '+String(err.message||err);}
   finally{if(button?.isConnected)button.disabled=false}
  })();
 });
 root.addEventListener('click',e=>{
  const btn=e.target.closest('[data-shared-proposal]');
  if(!btn||!root.contains(btn)||!isOwner()||busy)return;
  const item=queue.find(x=>x.id===btn.dataset.proposalId),action=btn.dataset.sharedProposal;
  if(!item||item.game!==getGame()||!['accept','reject'].includes(action))return;
  if(action==='accept'){
   const problem=canAccept();
   if(problem){message=problem;render();return;}
  }
  busy=true;message='';render();
  void (async()=>{
   try{
    // Le service partagé propose une opération d'archivage (reject),
    // jamais une création de sondage pour une mission Fortnite.
    await request('/v1/tribunal/proposals/'+encodeURIComponent(item.id)+'/reject','POST');
    queue=queue.filter(x=>x.id!==item.id);
    if(action==='accept')await onAccept(item);
    message=action==='accept'?'Proposition acceptée.':'Proposition refusée.';
   }catch(err){message='Action impossible : '+String(err.message||err);}
   finally{busy=false;render();}
  })();
 });
 const sessionHandler=()=>{if(active()){render();void refresh();}};
 window.addEventListener('qg:twitch-session',sessionHandler);
 const timer=setInterval(()=>{
  if(!active()){clearInterval(timer);window.removeEventListener('qg:twitch-session',sessionHandler);return;}
  if(document.visibilityState==='visible')void refresh();
 },30000);
 render();void refresh();
 return {render,refresh};
}
