/* Tribunal Ma_JesTik — démonstration MULTI-SONDAGES locale.
 * Aucun sondage/proposition/vote n'est partagé : l'API communautaire nécessite
 * une authentification Twitch et des vérifications de droits côté Cloudflare. */
import {isQGOwnerSession} from './twitch-auth.js';
const STORAGE='mj-qg-tribunal-demo-v3';
let timer=null,sessionListener=null;
export function unmountTribunal(){
 if(timer!==null){clearInterval(timer);timer=null;}
 if(sessionListener){window.removeEventListener('qg:twitch-session',sessionListener);sessionListener=null;}
}
export function tribunalMarkup(){
 return '<div class="page-head court-page-head"><div class="eyebrow">COMMUNAUTÉ</div><h1>LE TRIBUNAL</h1><p>Donne la parole à la communauté : propose des idées, participe aux sondages et découvre les résultats des votes.</p></div>'+
 '<p class="court-demo-note" role="note">Démo locale : les sondages, votes et propositions sont visibles sur cet appareil uniquement.</p>'+
 '<div class="court-summary"><div><span>SONDAGES OUVERTS</span><strong id="courtOpenCount">0</strong></div><div><span>SONDAGES TERMINÉS</span><strong id="courtClosedCount">0</strong></div><div data-court-owner="true"><span>PROPOSITIONS À EXAMINER</span><strong id="courtProposalCount">0</strong></div></div>'+
 '<div class="court-workspace"><section class="court-primary" aria-labelledby="courtListTitle"><div class="court-list-head"><div><span class="court-overline">LES QUESTIONS DE LA COMMUNAUTÉ</span><h2 id="courtListTitle">Liste des sondages</h2></div><div class="court-tabs" aria-label="Filtrer les sondages"><button type="button" data-court-filter="open" aria-pressed="true">En cours</button><button type="button" data-court-filter="closed" aria-pressed="false">Terminés</button><button type="button" data-court-filter="all" aria-pressed="false">Tous</button></div></div><div class="court-poll-stack" id="courtPollList"></div>'+
 '<section class="panel court-moderation" data-court-owner="true" aria-labelledby="courtModerationTitle"><div class="court-list-head"><div><span class="court-overline">FILE DE PROPOSITIONS · TEST LOCAL</span><h2 id="courtModerationTitle">Questions à examiner</h2></div><span class="court-moderation-pill">VALIDATION AVANT PUBLICATION</span></div><p>Dans la version publique, seuls les administrateurs autorisés pourront accepter ou refuser une proposition. Ici, les boutons permettent de tester le parcours sur ce navigateur.</p><div id="courtProposalList" class="court-proposal-list"></div></section></section>'+
 '<aside class="court-side"><p class="court-role-note" id="courtRoleNote" role="status">Tu peux voter et proposer une question. Seul Ma_JesTik peut publier un sondage.</p><details open class="panel court-tool-card" data-court-owner="true"><summary>CRÉER UN SONDAGE <span>＋</span></summary><p>Ajoute autant de questions que nécessaire (20 maximum dans la démo). Chaque nouveau sondage a une durée de 5 minutes à 24 heures.</p><form id="courtCreateForm"><label class="court-field"><span>Ta question</span><textarea id="courtCreateQuestion" maxlength="140" rows="3" required placeholder="Quel jeu pour notre prochain live ?"></textarea></label><div class="court-field"><span>Réponses (2 à 4)</span><div id="courtCreateChoices"></div><div class="court-choice-tools"><button type="button" data-court-add="create">+ Réponse</button><button type="button" data-court-remove="create">− Réponse</button></div></div><label class="court-field"><span>Durée</span><select id="courtCreateDuration"><option value="5">5 minutes</option><option value="10" selected>10 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 heure</option><option value="1440">24 heures</option></select></label><button class="btn btn-gold court-submit" type="submit">Créer un sondage de test</button><p class="court-form-message" id="courtCreateMessage" role="status"></p></form></details>'+
 '<details open class="panel court-tool-card court-suggest-card" data-court-visitor="true"><summary>PROPOSER UNE QUESTION <span>✎</span></summary><p>Voici le formulaire que les membres utiliseront. Pour l’instant, l’envoi est enregistré seulement sur cet appareil.</p><form id="courtSuggestForm"><label class="court-field"><span>Pseudo (démo)</span><input id="courtSuggestAuthor" maxlength="36" autocomplete="off" placeholder="Ton pseudo" required></label><label class="court-field"><span>Question proposée</span><textarea id="courtSuggestQuestion" maxlength="140" rows="3" required placeholder="Et si on faisait un live spécial ?"></textarea></label><div class="court-field"><span>Réponses proposées (2 à 4)</span><div id="courtSuggestChoices"></div><div class="court-choice-tools"><button type="button" data-court-add="suggest">+ Réponse</button><button type="button" data-court-remove="suggest">− Réponse</button></div></div><button class="btn btn-gold court-submit" type="submit">Ajouter à la file locale</button><p class="court-form-message" id="courtSuggestMessage" role="status"></p></form></details></aside></div>';
}
export function mountTribunal(){
 unmountTribunal();
 const root=document.getElementById('page');
 if(!root||!root.querySelector('#courtCreateForm'))return;
 const $=sel=>root.querySelector(sel);
 const maxPolls=20,maxProposals=30;
 const initial=()=>({polls:[{id:'demo-example',question:'Quel jeu veux-tu voir au prochain live ?',answers:['Fortnite','Warzone','Un jeu narratif'],votes:[0,0,0],selected:null,created:Date.now(),ends:Date.now()+600000,closed:false,from:''}],proposals:[]});
 let data;
 try{
  const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');
  if(saved&&Array.isArray(saved.polls)&&Array.isArray(saved.proposals)){
   data={polls:saved.polls.filter(x=>x&&typeof x.question==='string'&&Array.isArray(x.answers)&&Array.isArray(x.votes)).slice(0,maxPolls),proposals:saved.proposals.filter(x=>x&&typeof x.question==='string'&&Array.isArray(x.answers)).slice(0,maxProposals)};
  }
 }catch{}
 if(!data)data=initial();
 let filter='open';
 const make=(tag,cls,text)=>{
  const item=document.createElement(tag);
  if(cls)item.className=cls;
  if(text!==undefined)item.textContent=String(text);
  return item;
 };
 const persist=()=>{
  try{localStorage.setItem(STORAGE,JSON.stringify(data));}
  catch{ /* Démo utilisable sans persistance si stockage bloqué. */ }
 };
 const id=()=>String(Date.now())+'-'+Math.random().toString(36).slice(2,10);
 const unlimited=p=>p.ends===null;
 const closed=p=>Boolean(p.closed)||(!unlimited(p)&&Date.now()>=Number(p.ends));
 const active=()=>data.polls.filter(p=>!closed(p));
 const fmt=seconds=>{
  const min=Math.floor(seconds/60);
  const hrs=Math.floor(min/60);
  return hrs?hrs+'h '+String(min%60).padStart(2,'0')+'min':String(min).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
 };
 const remaining=p=>unlimited(p)?null:Math.max(0,Math.ceil((Number(p.ends)-Date.now())/1000));
 const countLabel=n=>n+' vote'+(n>1?'s':'');
 const valid=(question,answers)=>{
  if(question.length<10||question.length>140)return 'La question doit contenir entre 10 et 140 caractères.';
  if(answers.length<2||answers.length>4||answers.some(s=>s.length<2||s.length>55))return 'Il faut entre 2 et 4 réponses de 2 à 55 caractères.';
  if(new Set(answers.map(s=>s.toLocaleLowerCase('fr'))).size!==answers.length)return 'Deux réponses ne doivent pas être identiques.';
  return '';
 };
 const choiceList=(kind,values)=>{
  const host=$('#court'+(kind==='create'?'Create':'Suggest')+'Choices');
  const redraw=()=>{
   host.replaceChildren();
   values.forEach((text,index)=>{
    const row=make('label','court-option-edit');
    row.append(make('span','',String(index+1).padStart(2,'0')));
    const input=make('input');
    input.required=true;input.maxLength=55;input.value=text;input.placeholder='Réponse '+(index+1);
    input.setAttribute('aria-label','Réponse '+(index+1));
    input.addEventListener('input',()=>{values[index]=input.value;});
    row.append(input);host.append(row);
   });
   $('[data-court-add="'+kind+'"]').disabled=values.length>=4;
   $('[data-court-remove="'+kind+'"]').disabled=values.length<=2;
  };
  $('[data-court-add="'+kind+'"]').addEventListener('click',()=>{
   if(values.length<4){values.push('');redraw();host.lastElementChild?.querySelector('input')?.focus();}
  });
  $('[data-court-remove="'+kind+'"]').addEventListener('click',()=>{if(values.length>2){values.pop();redraw();}});
  redraw();
  return ()=>values.map(v=>v.trim());
 };
 const createValues=['Fortnite','Warzone','Un jeu narratif'];
 const suggestValues=['Oui','Non'];
 const getCreate=choiceList('create',createValues);
 const getSuggest=choiceList('suggest',suggestValues);
 const resetForm=(kind)=>{
  if(kind==='create'){
   $('#courtCreateQuestion').value='';
   createValues.splice(0,createValues.length,'Oui','Non');
   $('#courtCreateChoices').querySelectorAll('input').forEach(()=>{});
   // Remet les deux champs en conservant leurs gestionnaires.
  }else{
   $('#courtSuggestQuestion').value='';
  }
 };
 const addPoll=(question,answers,duration,from='')=>{
  const poll={id:id(),question,answers:answers.slice(),votes:answers.map(()=>0),selected:null,created:Date.now(),ends:duration===0?null:Date.now()+duration*60000,closed:false,from};
  data.polls.unshift(poll);persist();filter='open';render();
 };
 function pollCard(p){
  const isClosed=closed(p);
  const article=make('article','court-poll-card'+(isClosed?' is-closed':''));
  const top=make('div','court-poll-top');
  top.append(make('span','court-poll-state'+(isClosed?' is-closed':''),isClosed?'TERMINÉ':'● EN COURS'));
  const time=make('span','court-poll-time',isClosed?'Clôturé':unlimited(p)?'♾️ Sans limite':fmt(remaining(p)));
  time.dataset.courtTime=p.id;top.append(time);article.append(top);
  article.append(make('h3','court-poll-title',p.question));
  if(p.from)article.append(make('p','court-poll-by','Proposée par '+p.from+' · démonstration locale'));
  const total=p.votes.reduce((sum,n)=>sum+(Number(n)||0),0);
  article.append(make('p','court-poll-total',countLabel(total)+' de démonstration · '+p.answers.length+' réponses'));
  p.answers.forEach((answer,index)=>{
   const n=Number(p.votes[index])||0;
   const pct=total?Math.round(100*n/total):0;
   const item=make('div','court-answer');
   const header=make('div','court-answer-head');
   header.append(make('span','court-answer-name',answer));
   header.append(make('span','court-answer-stats',n+' vote'+(n>1?'s':'')+' · '+pct+' %'));
   item.append(header);
   const track=make('div','court-result-track');
   track.setAttribute('role','progressbar');track.setAttribute('aria-label',answer);
   track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String(pct));
   const fill=make('div','court-result-fill');fill.style.width=pct+'%';track.append(fill);item.append(track);
   const buttons=make('div','court-answer-buttons');
   const vote=make('button','court-vote-action',p.selected===index?'✓ Mon vote test': 'Voter');
   vote.type='button';vote.disabled=isClosed||p.selected!==null;
   vote.addEventListener('click',()=>{
    if(closed(p)||p.selected!==null)return;
    p.selected=index;p.votes[index]+=1;persist();render();
   });
   buttons.append(vote);
   if(isQGOwnerSession()){
    const simulate=make('button','court-test-vote','+1 vote de test');
    simulate.type='button';simulate.disabled=isClosed;
    simulate.addEventListener('click',()=>{
     if(!isQGOwnerSession()||closed(p))return;
     p.votes[index]+=1;persist();render();
    });
    buttons.append(simulate);
   }
   item.append(buttons);article.append(item);
  });
  if(isQGOwnerSession()){
   const bottom=make('div','court-poll-bottom');
   const close=make('button','court-poll-manage',isClosed?'Déjà clos':'Clore le sondage test');
   close.type='button';close.disabled=isClosed;
   close.addEventListener('click',()=>{
    if(!isQGOwnerSession())return;
    p.closed=true;persist();render();
   });
   bottom.append(close);
   const del=make('button','court-poll-manage danger','Supprimer');
   del.type='button';
   del.addEventListener('click',()=>{
    if(!isQGOwnerSession()||!window.confirm('Supprimer ce sondage de démonstration ?'))return;
    data.polls=data.polls.filter(x=>x.id!==p.id);persist();render();
   });
   bottom.append(del);
   article.append(bottom);
  }
  return article;
 }
 function renderPolls(){
  const container=$('#courtPollList');
  container.replaceChildren();
  const items=data.polls.filter(p=>filter==='all'||(filter==='open'?!closed(p):closed(p)));
  if(!items.length){
   const empty=make('div','court-empty-list');
   empty.append(make('strong','',filter==='open'?'Aucun sondage ouvert':filter==='closed'?'Aucun sondage terminé':'Pas encore de sondage'));
   empty.append(make('p','',isQGOwnerSession()?'Crée un sondage avec le formulaire à droite pour démarrer une nouvelle question.':'Les prochains sondages de la communauté apparaîtront ici.'));
   container.append(empty);
  }else items.forEach(p=>container.append(pollCard(p)));
  root.querySelectorAll('[data-court-filter]').forEach(btn=>{
   const selected=btn.dataset.courtFilter===filter;
   btn.setAttribute('aria-pressed',String(selected));btn.classList.toggle('active',selected);
  });
 }
 function renderProposals(){
  const container=$('#courtProposalList');container.replaceChildren();
  if(!isQGOwnerSession())return;
  const pending=data.proposals.filter(p=>p.status==='pending');
  if(!pending.length){container.append(make('p','court-empty-proposals','Aucune proposition locale en attente.'));return;}
  pending.forEach(p=>{
   const card=make('article','court-proposal');
   const first=make('div','court-proposal-top');
   first.append(make('strong','',p.question));first.append(make('span','','PAR '+p.author));
   card.append(first);
   card.append(make('p','',p.answers.join(' · ')));
   const actions=make('div','court-proposal-actions');
   const accept=make('button','court-proposal-accept','Accepter en démo');
   accept.type='button';accept.addEventListener('click',()=>{
    if(!isQGOwnerSession())return;
    if(data.polls.length>=maxPolls){window.alert('Limite de 20 sondages de démonstration atteinte.');return;}
    p.status='accepted';addPoll(p.question,p.answers,Number(durationSelect.value),p.author);
   });
   const decline=make('button','court-proposal-decline','Refuser');
   decline.type='button';decline.addEventListener('click',()=>{if(!isQGOwnerSession())return;p.status='rejected';persist();render();});
   const durationSelect=make('select','court-proposal-duration');
   durationSelect.setAttribute('aria-label','Durée du sondage proposé par '+p.author);
   durationSelect.innerHTML='<option value="5">5 minutes</option><option value="10" selected>10 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 heure</option><option value="1440">24 heures</option>';
   actions.append(durationSelect,accept,decline);card.append(actions);container.append(card);
  });
 }
 function render(){
  $('#courtOpenCount').textContent=String(active().length);
  $('#courtClosedCount').textContent=String(data.polls.length-active().length);
  $('#courtProposalCount').textContent=String(data.proposals.filter(x=>x.status==='pending').length);
  renderPolls();renderProposals();
 }
 root.querySelectorAll('[data-court-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.courtFilter;renderPolls();}));
 $('#courtCreateForm').addEventListener('submit',e=>{
  e.preventDefault();
  if(!isQGOwnerSession())return;
  const question=$('#courtCreateQuestion').value.trim(),answers=getCreate();
  const error=valid(question,answers),msg=$('#courtCreateMessage');
  if(error){msg.textContent=error;return;}
  if(data.polls.length>=maxPolls){msg.textContent='Limite de 20 sondages de démonstration atteinte.';return;}
  const duration=Number($('#courtCreateDuration').value);
  if(![5,10,15,30,60,1440].includes(duration)){msg.textContent='Durée invalide.';return;}
  addPoll(question,answers,duration);
  msg.textContent='Sondage ajouté à ta liste locale. Aucun visiteur ne le voit.';
  $('#courtCreateQuestion').value='';
 });
 $('#courtSuggestForm').addEventListener('submit',e=>{
  e.preventDefault();
  const author=$('#courtSuggestAuthor').value.trim(),question=$('#courtSuggestQuestion').value.trim(),answers=getSuggest();
  const msg=$('#courtSuggestMessage');
  const error=valid(question,answers);
  if(author.length<2||author.length>36){msg.textContent='Pseudo de 2 à 36 caractères requis.';return;}
  if(error){msg.textContent=error;return;}
  if(data.proposals.length>=maxProposals){msg.textContent='Limite de 30 propositions locales atteinte.';return;}
  data.proposals.unshift({id:id(),author,question,answers:answers.slice(),status:'pending',created:Date.now()});
  persist();render();
  msg.textContent='Proposition enregistrée sur cet appareil uniquement, non envoyée à Ma_JesTik.';
  $('#courtSuggestQuestion').value='';
 });
 const refreshPermissions=()=>{
  const owner=isQGOwnerSession();
  root.querySelectorAll('[data-court-owner]').forEach(el=>{el.hidden=!owner;});
  root.querySelectorAll('[data-court-visitor]').forEach(el=>{el.hidden=owner;});
  const note=$('#courtRoleNote');
  if(note){note.hidden=owner;}
  render();
 };
 sessionListener=refreshPermissions;
 window.addEventListener('qg:twitch-session',sessionListener);
 refreshPermissions();
 timer=setInterval(()=>{
  const expired=data.polls.some(p=>!p.closed&&remaining(p)===0);
  if(expired){
   data.polls.forEach(p=>{if(!p.closed&&remaining(p)===0)p.closed=true;});
   persist();render();
   return;
  }
  root.querySelectorAll('[data-court-time]').forEach(node=>{
   const poll=data.polls.find(p=>p.id===node.dataset.courtTime);
   if(poll)node.textContent=closed(poll)?'Clôturé':unlimited(poll)?'♾️ Sans limite':fmt(remaining(poll));
  });
 },1000);
}
