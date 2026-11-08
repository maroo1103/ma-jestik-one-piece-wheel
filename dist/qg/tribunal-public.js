// Tribunal PUBLIC : interface indépendante de la démonstration locale.
// Le composant n'est activé que lorsque le Worker Cloudflare est opérationnel.
import {getQGTwitchSession} from './twitch-auth.js?v=20261107-ranking-optin1';
const API=(document.querySelector('meta[name="majestik-tribunal-api"]')?.content||'').replace(/\/+$/,'');
export const tribunalPublicEnabled=document.querySelector('meta[name="majestik-tribunal-public-enabled"]')?.content==='true'&&/^https:\/\/[a-z0-9.-]+$/i.test(API);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active=false,interval=null,sessionHandler=null,requestId=0,root=null,busy=false;
let polls=[],proposals=[],identity=null,selectedFilter='open',notice='';
const dur=[['5','5 minutes'],['10','10 minutes'],['15','15 minutes'],['30','30 minutes'],['60','1 heure'],['1440','24 heures'],['0','♾️ Sans limite']];
const durationOptions=()=>dur.map(([v,l])=>'<option value="'+v+'" '+(v==='10'?'selected':'')+'>'+l+'</option>').join('');
function inputs(answers){
 return answers.map((value,i)=>'<label class="court-option-edit"><span>'+String(i+1).padStart(2,'0')+'</span>'+
  '<input data-answer aria-label="Réponse '+(i+1)+'" maxlength="55" required value="'+esc(value)+'"></label>').join('');
}
function editorForm(kind,id,question,answers){
 const proposed=kind==='propose',approved=kind==='approve',polling=kind==='create';
 const text=proposed?'Envoyer ma proposition':approved?'Valider et publier':'Publier le sondage';
 const choice=answers?.length?answers:['Oui','Non'];
 return '<form class="court-public-form" data-form="'+kind+'" '+(id?'data-id="'+esc(id)+'"':'')+'>'+
  '<label class="court-field"><span>Question</span><textarea data-question minlength="10" maxlength="140" required rows="3" placeholder="Quelle est votre question ?">'+esc(question||'')+'</textarea></label>'+
  '<div class="court-field"><span>Réponses (2 à 4)</span><div data-answer-list>'+inputs(choice)+'</div>'+
  '<div class="court-choice-tools"><button type="button" data-action="add-answer">+ Réponse</button><button type="button" data-action="remove-answer">− Réponse</button></div></div>'+
  (proposed?'':'<label class="court-field"><span>Durée</span><select data-duration>'+durationOptions()+'</select></label>')+
  '<button class="btn btn-gold court-submit" type="submit">'+text+'</button></form>';
}
export function publicTribunalMarkup(){
 return '<div class="page-head court-page-head"><div class="eyebrow">COMMUNAUTÉ</div><h1>LE TRIBUNAL</h1>'+
  '<p>Donne la parole à la communauté : propose des idées, participe aux sondages et découvre les résultats des votes.</p></div>'+
  '<p class="court-public-message" id="courtPublicMessage" role="status" aria-live="polite"></p>'+
  '<div class="court-summary"><div><span>SONDAGES OUVERTS</span><strong id="courtOpenCount">0</strong></div>'+
  '<div><span>SONDAGES TERMINÉS</span><strong id="courtClosedCount">0</strong></div>'+
  '<div id="courtPublicOwnerCount" hidden><span>PROPOSITIONS À EXAMINER</span><strong id="courtProposalCount">0</strong></div></div>'+
  '<div class="court-workspace"><section class="court-primary" aria-labelledby="courtListTitle">'+
  '<div class="court-list-head"><div><span class="court-overline">LES QUESTIONS DE L’ÉQUIPAGE</span><h2 id="courtListTitle">Liste des sondages</h2></div>'+
  '<div class="court-tabs" aria-label="Filtrer les sondages">'+
  '<button type="button" data-filter="open" aria-pressed="true">En cours</button>'+
  '<button type="button" data-filter="closed" aria-pressed="false">Terminés</button>'+
  '<button type="button" data-filter="all" aria-pressed="false">Tous</button></div></div>'+
  '<div class="court-poll-stack" id="courtPollList"><p>Chargement des sondages…</p></div>'+
  '<section class="panel court-moderation" id="courtPublicModeration" hidden><div class="court-list-head"><div><span class="court-overline">PROPOSITIONS DE LA COMMUNAUTÉ</span>'+
  '<h2>Questions à examiner</h2></div><span class="court-moderation-pill">VALIDATION AVANT PUBLICATION</span></div>'+
  '<div id="courtProposalList" class="court-proposal-list"></div></section></section>'+
  '<aside class="court-side" id="courtPublicSidebar"></aside></div>';
}
function status(text,bad=false){
 notice=text||'';const el=root?.querySelector('#courtPublicMessage');
 if(el){el.textContent=notice;el.classList.toggle('is-error',bad);}
}
function clock(p){
 if(p.closed)return 'Clôturé';
 if(p.ends_at===null)return '♾️ Sans limite';
 const secs=Math.max(0,Math.ceil((p.ends_at*1000-Date.now())/1000));
 const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=secs%60;
 return h? h+'h '+String(m).padStart(2,'0')+'min':String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function renderPolls(){
 if(!root)return;
 const list=root.querySelector('#courtPollList');if(!list)return;
 const visible=polls.filter(p=>selectedFilter==='all'||(selectedFilter==='open'?!p.closed:p.closed));
 root.querySelector('#courtOpenCount').textContent=String(polls.filter(p=>!p.closed).length);
 root.querySelector('#courtClosedCount').textContent=String(polls.filter(p=>p.closed).length);
 root.querySelectorAll('[data-filter]').forEach(b=>{const chosen=b.dataset.filter===selectedFilter;b.classList.toggle('active',chosen);b.setAttribute('aria-pressed',String(chosen));});
 if(!visible.length){
  list.innerHTML='<div class="court-empty-list"><strong>'+(selectedFilter==='open'?'Aucun sondage ouvert':selectedFilter==='closed'?'Aucun sondage terminé':'Aucun sondage publié')+'</strong>'+
   '<p>Les prochaines questions de la communauté apparaîtront ici.</p></div>';
  return;
 }
 const votes=new Map((identity?.votes||[]).map(v=>[v.poll_id,Number(v.choice_index)]));
 list.innerHTML=visible.map(p=>{
  const chosen=votes.get(p.id),canVote=!!getQGTwitchSession()&&!p.closed&&chosen===undefined;
  const total=Number(p.total||0);
  const answers=p.answers.map((a,i)=>{
   const count=Number(p.counts[i]||0),pct=total?Math.round(count*100/total):0;
   return '<div class="court-answer"><div class="court-answer-head"><span class="court-answer-name">'+esc(a)+'</span>'+
    '<span class="court-answer-stats">'+count+' vote'+(count>1?'s':'')+' · '+pct+' %</span></div>'+
    '<div class="court-result-track" role="progressbar" aria-label="'+esc(a)+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'">'+
    '<div class="court-result-fill" style="width:'+pct+'%"></div></div>'+
    '<div class="court-answer-buttons"><button type="button" class="court-vote-action" data-action="vote" data-id="'+esc(p.id)+'" data-choice="'+i+'" '+(canVote?'':'disabled')+'>'+
    (chosen===i?'✓ Mon vote':chosen!==undefined?'Déjà voté':p.closed?'Sondage terminé':getQGTwitchSession()?'Voter':'Connexion Twitch requise')+
    '</button></div></div>';
  }).join('');
  const admin=identity?.owner?'<div class="court-poll-bottom">'+
   '<button type="button" class="court-poll-manage" data-action="close" data-id="'+esc(p.id)+'" '+(p.closed?'disabled':'')+'>Clore</button>'+
   '<button type="button" class="court-poll-manage danger" data-action="delete" data-id="'+esc(p.id)+'">Supprimer</button></div>':'';
  return '<article class="court-poll-card'+(p.closed?' is-closed':'')+'"><div class="court-poll-top">'+
   '<span class="court-poll-state'+(p.closed?' is-closed':'')+'">'+(p.closed?'TERMINÉ':'● EN COURS')+'</span>'+
   '<span class="court-poll-time" data-end="'+esc(p.id)+'">'+esc(clock(p))+'</span></div>'+
   '<h3 class="court-poll-title">'+esc(p.question)+'</h3>'+
   (p.proposed_by?'<p class="court-poll-by">Proposée par '+esc(p.proposed_by)+'</p>':'')+
   '<p class="court-poll-total">'+total+' vote'+(total>1?'s':'')+' · '+p.answers.length+' réponses</p>'+answers+admin+'</article>';
 }).join('');
}
function renderSidebar(){
 if(!root)return;
 const sidebar=root.querySelector('#courtPublicSidebar');
 if(!sidebar)return;
 if(!getQGTwitchSession()){
  sidebar.innerHTML='<div class="panel court-public-info"><h3>Participe au Tribunal</h3><p>Connecte-toi avec Twitch en haut à droite pour voter et proposer tes questions.</p></div>';
  return;
 }
 if(!identity){
  sidebar.innerHTML='<div class="panel court-public-info"><p>Vérification de ton compte Twitch…</p></div>';
  return;
 }
 if(identity.owner){
  sidebar.innerHTML='<details open class="panel court-tool-card"><summary>CRÉER UN SONDAGE <span>＋</span></summary>'+
   '<p>Publie une question avec 2 à 4 réponses. Durée définie ou sans limite.</p>'+editorForm('create',null,'',['Oui','Non'])+'</details>';
 }else{
  sidebar.innerHTML='<details open class="panel court-tool-card court-suggest-card"><summary>PROPOSER UNE QUESTION <span>✎</span></summary>'+
   '<p>Connecté avec Twitch : '+esc(identity.name)+'. Ta question sera envoyée à Ma_JesTik pour validation (3 par 24 h).</p>'+
   editorForm('propose',null,'',['Oui','Non'])+'</details>';
 }
}
function renderModeration(){
 if(!root)return;
 const section=root.querySelector('#courtPublicModeration');
 const owner=!!identity?.owner;
 section.hidden=!owner;
 root.querySelector('#courtPublicOwnerCount').hidden=!owner;
 if(!owner)return;
 root.querySelector('#courtProposalCount').textContent=String(proposals.length);
 const target=root.querySelector('#courtProposalList');
 if(!proposals.length){target.innerHTML='<p class="court-empty-proposals">Aucune proposition en attente.</p>';return;}
 target.innerHTML=proposals.map(p=>'<article class="court-proposal">'+
  '<div class="court-proposal-top"><strong>'+esc(p.question)+'</strong><span>PAR '+esc(p.author_name)+'</span></div>'+
  editorForm('approve',p.id,p.question,p.answers)+
  '<div class="court-proposal-actions"><button type="button" class="court-proposal-decline" data-action="reject" data-id="'+esc(p.id)+'">Refuser la proposition</button></div></article>').join('');
}
async function call(path,method='GET',body,needAuth=false){
 const h={};
 if(needAuth){
  const token=getQGTwitchSession()?.token;
  if(!token)throw new Error('Connecte-toi avec Twitch.');
  h.Authorization='Bearer '+token;
 }
 if(body!==undefined)h['Content-Type']='application/json';
 const control=new AbortController(),timeout=setTimeout(()=>control.abort(),12000);
 try{
  const res=await fetch(API+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),
   mode:'cors',credentials:'omit',cache:'no-store',signal:control.signal});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||'Erreur du service Tribunal ('+res.status+')');
  return data;
 }catch(e){
  if(e.name==='AbortError')throw new Error('Le service Tribunal ne répond pas.');
  if(e instanceof TypeError)throw new Error('Impossible de contacter le service Tribunal.');
  throw e;
 }finally{clearTimeout(timeout)}
}
async function refresh(){
 if(!active)return;
 const id=++requestId;
 try{
  const session=getQGTwitchSession(),newPolls=await call('/v1/tribunal/polls');
  let newIdentity=null,newProposals=[];
  if(session){
   newIdentity=await call('/v1/tribunal/me','GET',undefined,true);
   if(newIdentity.owner)newProposals=(await call('/v1/tribunal/proposals','GET',undefined,true)).proposals||[];
  }
  if(!active||id!==requestId)return;
  const roleBefore=identity?.owner===true?'owner':identity?'member':'unknown';
  const roleAfter=newIdentity?.owner===true?'owner':newIdentity?'member':'unknown';
  polls=Array.isArray(newPolls.polls)?newPolls.polls:[];
  identity=newIdentity;
  proposals=Array.isArray(newProposals)?newProposals:[];
  renderPolls();renderModeration();
  if(roleBefore!==roleAfter||!root.querySelector('#courtPublicSidebar')?.children.length)renderSidebar();
  status('');
 }catch(e){
  if(active&&id===requestId){status(e.message,true);if(!identity)renderSidebar();}
 }
}
function readForm(form){
 const question=form.querySelector('[data-question]')?.value.trim();
 const answers=[...form.querySelectorAll('[data-answer]')].map(x=>x.value.trim());
 return {question,answers,...(form.querySelector('[data-duration]')?{duration_minutes:Number(form.querySelector('[data-duration]').value)}:{})};
}
async function submit(e){
 const form=e.target.closest('[data-form]');if(!form)return;
 e.preventDefault();if(busy)return;
 busy=true;
 try{
  const type=form.dataset.form,data=readForm(form);
  if(type==='create')await call('/v1/tribunal/polls','POST',data,true);
  else if(type==='propose')await call('/v1/tribunal/proposals','POST',data,true);
  else if(type==='approve')await call('/v1/tribunal/proposals/'+form.dataset.id+'/approve','POST',data,true);
  else return;
  if(type==='create'||type==='propose')renderSidebar();
  await refresh();
  status(type==='propose'?'Question envoyée à Ma_JesTik pour validation.':type==='approve'?'Proposition publiée.':'Sondage publié.');
 }catch(error){status(error.message,true)}
 finally{busy=false;}
}
async function click(e){
 const button=e.target.closest('[data-action]');if(!button||!root?.contains(button)||busy)return;
 const action=button.dataset.action;
 if(action==='add-answer'||action==='remove-answer'){
  const holder=button.closest('form')?.querySelector('[data-answer-list]');
  if(!holder)return;
  const fields=[...holder.querySelectorAll('[data-answer]')].map(x=>x.value);
  if(action==='add-answer'&&fields.length<4)fields.push('');
  if(action==='remove-answer'&&fields.length>2)fields.pop();
  holder.innerHTML=inputs(fields);
  return;
 }
 if(action==='delete'&&!confirm('Supprimer ce sondage et tous ses votes ?'))return;
 if(action==='close'&&!confirm('Clore définitivement ce sondage ?'))return;
 if(action==='reject'&&!confirm('Refuser cette proposition ?'))return;
 busy=true;
 try{
  const id=button.dataset.id;
  if(action==='vote')await call('/v1/tribunal/polls/'+id+'/vote','POST',{choice_index:Number(button.dataset.choice)},true);
  else if(action==='close')await call('/v1/tribunal/polls/'+id+'/close','POST',{},true);
  else if(action==='delete')await call('/v1/tribunal/polls/'+id,'DELETE',undefined,true);
  else if(action==='reject')await call('/v1/tribunal/proposals/'+id+'/reject','POST',{},true);
  else return;
  await refresh();
  status(action==='vote'?'Ton vote a bien été enregistré.':action==='reject'?'Proposition refusée.':'Modification enregistrée.');
 }catch(error){status(error.message,true)}
 finally{busy=false;}
}
function tick(){
 if(!active||!root)return;
 for(const n of root.querySelectorAll('[data-end]')){
  const p=polls.find(p=>p.id===n.dataset.end);
  if(p)n.textContent=clock(p);
 }
}
export function unmountPublicTribunal(){
 active=false;requestId++;
 if(interval!==null){clearInterval(interval);interval=null;}
 if(sessionHandler){window.removeEventListener('qg:twitch-session',sessionHandler);sessionHandler=null;}
 if(root){root.removeEventListener('click',click);root.removeEventListener('submit',submit);}
 root=null;
}
export function mountPublicTribunal(){
 unmountPublicTribunal();
 root=document.getElementById('page');
 if(!root||!root.querySelector('#courtPublicSidebar')||!tribunalPublicEnabled)return;
 active=true;identity=null;polls=[];proposals=[];selectedFilter='open';busy=false;
 root.addEventListener('click',click);root.addEventListener('submit',submit);
 root.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
  selectedFilter=b.dataset.filter;renderPolls();
 }));
 sessionHandler=()=>{identity=null;renderSidebar();void refresh()};
 window.addEventListener('qg:twitch-session',sessionHandler);
 renderSidebar();void refresh();
 let seconds=0;
 interval=setInterval(()=>{
  if(!active)return;
  tick();
  seconds++;
  if(document.visibilityState==='visible'&&seconds%12===0)void refresh();
 },1000);
}
