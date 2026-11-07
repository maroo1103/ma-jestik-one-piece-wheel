/* Tribunal Ma_JesTik — prévisualisation locale, aucun scrutin public enregistré.
   Les vrais votes nécessiteront une API Cloudflare avec vérification Twitch côté serveur. */
let ticker=null;
export function unmountTribunal(){if(ticker){clearInterval(ticker);ticker=null;}}
export function tribunalMarkup(){
 return '<div class="page-head"><div class="eyebrow">COMMUNAUTÉ · CRÉATION N° 05</div><h1>LE TRIBUNAL</h1><p>Une question. Plusieurs réponses. La communauté aura son mot à dire sur les jeux, les défis et les prochaines décisions du QG.</p><div class="page-tags"><span class="tag gold">EN CONSTRUCTION</span><span class="tag">2 À 4 CHOIX</span><span class="tag">VOTES TWITCH PRÉVUS</span></div></div>'+
 '<div class="court-warning" role="note"><span aria-hidden="true">⚖️</span><div><strong>MODE DÉMONSTRATION</strong><p>Tu peux créer et tester un sondage ci-dessous. Les choix restent uniquement dans cet onglet du navigateur : aucun vote public, score ou résultat partagé n’est enregistré.</p></div></div>'+
 '<div class="court-layout"><section class="panel court-preview" aria-labelledby="courtPreviewTitle"><div class="court-panel-head"><div><span class="court-overline">APERÇU DU SCRUTIN</span><h2 id="courtPreviewTitle">La parole à l’équipage</h2></div><span class="court-live-state" id="courtState">DÉMO LOCALE</span></div><div id="courtPoll" aria-live="polite"></div><div class="court-actions"><button class="btn btn-ghost" type="button" id="courtClose">Clore la démo</button><button class="btn btn-ghost" type="button" id="courtReset">Réinitialiser le vote</button></div></section>'+
 '<section class="panel court-editor" aria-labelledby="courtEditorTitle"><span class="court-overline">ATELIER DE CRÉATION</span><h2 id="courtEditorTitle">Préparer une question</h2><p class="court-editor-copy">Teste ici le format d’un futur scrutin. En version définitive, seul Ma_JesTik pourra le publier pour tout le monde.</p><form id="courtForm"><label class="court-field" for="courtQuestion"><span>Question</span><textarea id="courtQuestion" maxlength="140" rows="3" required>Quel jeu veux-tu voir lors du prochain live ?</textarea></label><div class="court-field"><span>Réponses proposées</span><div id="courtChoices"></div><div class="court-choice-tools"><button type="button" id="courtAdd">+ Ajouter une réponse</button><button type="button" id="courtRemove">− Retirer la dernière</button></div></div><label class="court-field" for="courtDuration"><span>Durée du sondage (démo)</span><select id="courtDuration"><option value="5">5 minutes</option><option value="10" selected>10 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 heure</option></select></label><button class="btn btn-gold court-create" type="submit">Lancer la prévisualisation <span aria-hidden="true">↗</span></button><p id="courtFormMessage" class="court-form-message" role="status"></p></form></section></div>'+
 '<section class="court-rules" aria-label="Règles du tribunal"><div><span aria-hidden="true">01</span><strong>Une question libre</strong><p>Gameplay, jeux, prochaines activités ou propositions de la communauté.</p></div><div><span aria-hidden="true">02</span><strong>Un vote Twitch par personne</strong><p>Contrôle côté serveur prévu pour le lancement réel, et non simple cookie du navigateur.</p></div><div><span aria-hidden="true">03</span><strong>Un verdict transparent</strong><p>Les résultats ne seront affichés qu’à partir des votes réellement comptabilisés.</p></div></section>';
}
export function mountTribunal(){
 unmountTribunal();
 const root=document.getElementById('page');
 const form=root?.querySelector('#courtForm');
 if(!form)return;
 const choices=root.querySelector('#courtChoices');
 const preview=root.querySelector('#courtPoll');
 const status=root.querySelector('#courtState');
 const msg=root.querySelector('#courtFormMessage');
 const add=root.querySelector('#courtAdd');
 const remove=root.querySelector('#courtRemove');
 const close=root.querySelector('#courtClose');
 const reset=root.querySelector('#courtReset');
 let poll=null;
 const defaults=['Fortnite','Warzone','Un jeu narratif'];
 function make(tag,cls,content){
  const x=document.createElement(tag);if(cls)x.className=cls;
  if(content!==undefined)x.textContent=content;
  return x;
 }
 function addOption(value=''){
  if(choices.children.length>=4)return;
  const count=choices.children.length+1;
  const label=make('label','court-option-edit');
  label.append(make('span','',String(count).padStart(2,'0')));
  const field=make('input');
  field.type='text';field.required=true;field.maxLength=55;
  field.placeholder='Réponse '+count;
  field.value=value;
  field.setAttribute('aria-label','Réponse '+count);
  label.append(field);choices.append(label);
  updateButtons();
 }
 function updateButtons(){
  add.disabled=choices.children.length>=4;
  remove.disabled=choices.children.length<=2;
 }
 function begin(question,answers,minutes){
  poll={question,answers,minutes,deadline:Date.now()+minutes*60000,choice:null,closed:false};
  render();
 }
 function timeLeft(){
  if(!poll)return 0;
  return Math.max(0,Math.ceil((poll.deadline-Date.now())/1000));
 }
 function updateTime(){
  if(!poll)return;
  const seconds=timeLeft();
  if(seconds===0&&!poll.closed){poll.closed=true;render();return;}
  const clock=root.querySelector('#courtTime');
  if(clock)clock.textContent=seconds?String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'):'00:00';
 }
 function render(){
  preview.replaceChildren();
  if(!poll){preview.append(make('p','court-empty','Aucune question en prévisualisation.'));return;}
  status.textContent=poll.closed?'DÉMO TERMINÉE':'DÉMO LOCALE';
  status.classList.toggle('is-closed',poll.closed);
  const heading=make('div','court-question');
  heading.append(make('span','court-overline','QUESTION DE LA COMMUNAUTÉ'));
  heading.append(make('h3','',poll.question));
  preview.append(heading);
  const meta=make('div','court-poll-meta');
  meta.append(make('span','','⚖️ '+poll.answers.length+' réponses possibles'));
  const time=make('span');time.id='courtTime';meta.append(time);
  preview.append(meta);
  const voteList=make('div','court-vote-list');
  poll.answers.forEach((answer,index)=>{
   const btn=make('button','court-vote'+(poll.choice===index?' selected':''),answer);
   btn.type='button';
   btn.disabled=poll.closed||poll.choice!==null;
   btn.setAttribute('aria-pressed',String(poll.choice===index));
   btn.prepend(make('span','court-vote-number',String(index+1).padStart(2,'0')));
   btn.append(make('span','court-vote-arrow',poll.choice===index?'✓':'↗'));
   btn.addEventListener('click',()=>{
    if(!poll||poll.closed||poll.choice!==null)return;
    poll.choice=index;render();
   });
   voteList.append(btn);
  });
  preview.append(voteList);
  const note=make('p','court-vote-note');
  if(poll.closed)note.textContent='Démo clôturée : aucun résultat public n’a été publié.';
  else if(poll.choice!==null)note.textContent='✓ Choix sélectionné dans cette démo. Aucun vote envoyé ni sauvegardé.';
  else note.textContent='Clique sur une réponse pour tester le vote local (un seul choix par aperçu).';
  preview.append(note);
  close.disabled=poll.closed;
  reset.disabled=false;
  updateTime();
 }
 defaults.forEach(v=>addOption(v));
 function submit(){
  const question=root.querySelector('#courtQuestion').value.trim();
  const answers=[...choices.querySelectorAll('input')].map(x=>x.value.trim());
  const duration=Number(root.querySelector('#courtDuration').value);
  if(question.length<10){msg.textContent='Écris une question de 10 caractères minimum.';return;}
  if(answers.length<2||answers.length>4||answers.some(x=>x.length<2)){
   msg.textContent='Il faut entre 2 et 4 réponses non vides (2 caractères minimum).';return;
  }
  if(new Set(answers.map(x=>x.toLocaleLowerCase('fr'))).size!==answers.length){
   msg.textContent='Deux réponses ne peuvent pas être identiques.';return;
  }
  if(![5,10,15,30,60].includes(duration)){msg.textContent='Durée invalide.';return;}
  msg.textContent='Prévisualisation lancée : aucune donnée n’est envoyée.';
  begin(question,answers,duration);
 }
 form.addEventListener('submit',e=>{e.preventDefault();submit();});
 add.addEventListener('click',()=>addOption(''));
 remove.addEventListener('click',()=>{if(choices.children.length>2){choices.lastElementChild.remove();updateButtons();}});
 close.addEventListener('click',()=>{if(poll){poll.closed=true;render();}});
 reset.addEventListener('click',()=>{if(poll)begin(poll.question,poll.answers,poll.minutes);});
 submit();
 ticker=setInterval(updateTime,1000);
}
