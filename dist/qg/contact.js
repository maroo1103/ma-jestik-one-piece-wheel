// Ma_JesTik — contact guidé et envoi via Cloudflare / Resend, protégé par Turnstile.
// Aucune clé privée dans les fichiers publics.
const MAIL='contact@ma-jestik.fr';
const MAX_FILES=6;
const MAX_FILE_SIZE=5*1024*1024;
const MAX_TOTAL_SIZE=12*1024*1024;
const CONTACT_API=(document.querySelector('meta[name="majestik-contact-api"]')?.content||'').replace(/\/+$/,'');
const TURNSTILE_SITE_KEY=document.querySelector('meta[name="majestik-turnstile-sitekey"]')?.content||'';
let captchaScriptPromise=null,captchaWidgetId=null;
const CATEGORIES=[
 {id:'support',icon:'✦',title:'Support technique',desc:'Un problème sur le site ou avec un outil du QG.',topics:[
  ['site','Affichage ou navigation du site'],
  ['roue','La roue interactive'],
  ['defis','Défis et missions'],
  ['killathon','Killathon et affichage OBS'],
  ['tribunal','Tribunal, votes ou classements'],
  ['autre','Autre problème technique']
 ]},
 {id:'compte',icon:'♙',title:'Mon compte',desc:'Accès au compte Ma_JesTik, profil et paramètres du QG.',topics:[
  ['connexion','Accès à mon compte Ma_JesTik'],
  ['profil','Mon profil sur le QG'],
  ['confidentialite','Visibilité et confidentialité'],
  ['classement','Points ou classement'],
  ['autre','Autre problème de compte']
 ]},
 {id:'idees',icon:'✧',title:'Suggestions & idées',desc:'Partage une idée pour améliorer Ma_JesTik.',topics:[
  ['fonctionnalite','Une nouvelle fonctionnalité'],
  ['roue','Des idées pour la roue'],
  ['defis','De nouveaux défis ou animations'],
  ['design','Design, navigation ou accessibilité'],
  ['autre','Autre suggestion']
 ]},
 {id:'collaboration',icon:'◇',title:'Collaborations',desc:'Streams communs, projets et partenariats.',topics:[
  ['stream','Collaboration pour un live'],
  ['communaute','Projet communautaire'],
  ['partenariat','Proposition de partenariat'],
  ['autre','Autre proposition']
 ]},
 {id:'autre',icon:'☷',title:'Autre demande',desc:'Une question qui ne figure pas dans ces rubriques.',topics:[
  ['question','Question générale'],
  ['signalement','Signaler un contenu ou un comportement'],
  ['information','Demande d’information'],
  ['autre','Autre motif']
 ]}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const category=id=>CATEGORIES.find(c=>c.id===id);
const topic=(cat,id)=>cat?.topics.find(p=>p[0]===id);
const state=()=>({step:1,category:null,topic:null,pseudo:'',email:'',message:'',attachments:[],fileError:'',captchaToken:'',captchaError:'',sendError:'',sending:false,sent:false});
let draft=state();
const nav=step=>'<ol class="mj-contact-steps" aria-label="Étapes de la demande">'+
 ['Catégorie','Sujet','Ton message','Récapitulatif'].map((s,i)=>'<li class="'+(i+1===step?'is-current':i+1<step?'is-done':'')+'"'+(i+1===step?' aria-current="step"':'')+'><span>'+(i+1)+'</span><small>'+s+'</small></li>').join('')+'</ol>';
const back=(label='RETOUR')=>'<button type="button" class="mj-contact-secondary" data-contact-back>← '+label+'</button>';
function selectCategory(){
 return '<div class="mj-contact-intro"><span class="mj-contact-overline">01 / CHOISIR UNE CATÉGORIE</span>'+
  '<h2 id="mjContactStepTitle">COMMENT PEUT-ON <em>T’AIDER ?</em></h2>'+
  '<p>Choisis la catégorie qui correspond à ta demande. Nous préciserons ensuite le sujet.</p></div>'+
  '<div class="mj-contact-categories">'+CATEGORIES.map(c=>
   '<button type="button" class="mj-contact-category" data-contact-category="'+c.id+'">'+
   '<span class="mj-contact-category-icon" aria-hidden="true">'+c.icon+'</span>'+
   '<strong>'+esc(c.title)+'</strong><small>'+esc(c.desc)+'</small>'+
   '<span class="mj-contact-category-arrow" aria-hidden="true">↗</span></button>').join('')+'</div>';
}
function selectTopic(){
 const c=category(draft.category);
 if(!c)return selectCategory();
 return '<div class="mj-contact-intro"><span class="mj-contact-overline">02 / PRÉCISER TA DEMANDE</span>'+
 '<h2 id="mjContactStepTitle">'+esc(c.title).toUpperCase()+'</h2>'+
 '<p>Quel sujet correspond le mieux à ta demande ?</p></div>'+
 '<div class="mj-contact-topics">'+c.topics.map(t=>
  '<button type="button" class="mj-contact-topic" data-contact-topic="'+t[0]+'"><span class="mj-contact-radio" aria-hidden="true"></span><span>'+esc(t[1])+'</span><span class="mj-contact-topic-arrow" aria-hidden="true">→</span></button>'
 ).join('')+'</div><div class="mj-contact-navigation">'+back('CHANGER DE CATÉGORIE')+'</div>';
}
function attachInfo(){
 const items=draft.attachments.length?
  '<div class="mj-contact-filelist" aria-live="polite">'+draft.attachments.map((f,i)=>
   '<div class="mj-contact-file" role="group" aria-label="Pièce jointe '+(i+1)+'">'+
   '<span class="mj-contact-file-name" title="'+esc(f.name)+'">▣ '+esc(f.name)+'</span>'+
   '<small class="mj-contact-file-size">'+(f.size/1024/1024).toFixed(2)+' Mo</small>'+
   '<button type="button" class="mj-contact-file-remove" data-contact-remove-file="'+i+'" aria-label="Retirer '+esc(f.name)+'" title="Retirer ce fichier">×</button></div>'
  ).join('')+'</div><button type="button" class="mj-contact-files-clear" data-contact-clear-files>TOUT RETIRER</button>':'';
 return '<section class="mj-contact-fieldset mj-contact-attachments" aria-labelledby="mjContactFilesTitle">'+
  '<div class="mj-contact-fieldset-title"><h3 id="mjContactFilesTitle">Pièces jointes <span>(facultatives)</span></h3><span>6 fichiers maximum</span></div>'+
  '<p>PNG, JPG, WebP ou PDF · 5 Mo par fichier · 12 Mo au total.</p>'+
  '<label class="mj-contact-upload">＋ <span>AJOUTER DES FICHIERS</span><input type="file" id="mjContactFiles" multiple accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"></label>'+
  items+
  '<p class="mj-contact-error" id="mjContactFileError" role="alert">'+esc(draft.fileError)+'</p></section>';
}
function fillForm(){
 const c=category(draft.category),t=topic(c,draft.topic);
 if(!c||!t)return selectCategory();
 return '<div class="mj-contact-intro"><span class="mj-contact-overline">03 / COMPLÉTER TA DEMANDE</span>'+
  '<h2 id="mjContactStepTitle">À TOI DE <em>NOUS ÉCRIRE.</em></h2>'+
  '<p><strong>'+esc(c.title)+'</strong> — '+esc(t[1])+'. Décris précisément ton besoin pour faciliter la réponse.</p></div>'+
  '<form id="mjContactForm" novalidate>'+
   '<section class="mj-contact-fieldset"><h3>Ton message</h3>'+
    '<label class="mj-contact-label" for="mjContactMessage">Explique ta demande <span>*</span></label>'+
    '<textarea id="mjContactMessage" data-contact-field="message" name="message" maxlength="4000" minlength="20" required rows="8" placeholder="Décris ce qui se passe, la page concernée ou ton idée…">'+esc(draft.message)+'</textarea>'+
    '<p class="mj-contact-hint">20 caractères minimum. N’indique jamais de mot de passe, de code de sécurité ou d’informations bancaires.</p></section>'+
    attachInfo()+
   '<section class="mj-contact-fieldset"><h3>Pour te répondre</h3>'+
     '<div class="mj-contact-fields">'+
      '<div><label class="mj-contact-label" for="mjContactPseudo">Ton pseudo <span class="mj-contact-optional">(facultatif)</span></label>'+
      '<input id="mjContactPseudo" type="text" name="pseudo" data-contact-field="pseudo" maxlength="80" autocomplete="nickname" value="'+esc(draft.pseudo)+'" placeholder="Ton pseudo"></div>'+
      '<div><label class="mj-contact-label" for="mjContactEmail">Ton adresse e-mail <span>*</span></label>'+
      '<input id="mjContactEmail" type="email" name="email" data-contact-field="email" required maxlength="254" autocomplete="email" value="'+esc(draft.email)+'" placeholder="tonadresse@exemple.fr"></div>'+
     '</div>'+
     '<p class="mj-contact-hint">Tes informations et fichiers seront transmis par Cloudflare et Resend à notre boîte professionnelle OVH pour traiter ta demande. </p></section>'+
   '<div class="mj-contact-navigation">'+back('REVENIR AUX SUJETS')+'<button type="submit" class="mj-contact-primary">VÉRIFIER MA DEMANDE <span aria-hidden="true">→</span></button></div>'+
  '</form>';
}
function emailBody(){
 const c=category(draft.category),t=topic(c,draft.topic);
 return ['Bonjour,','','Catégorie : '+(c?.title||'Autre demande'),'Sujet : '+(t?.[1]||'Non précisé'),'Pseudo : '+(draft.pseudo.trim()||'Non renseigné'),'Adresse de réponse : '+draft.email.trim(),'','Message :',draft.message.trim(),'',
  ...(draft.attachments.length?['Pièces jointes sélectionnées :',...draft.attachments.map(f=>'- '+f.name),'']:[]),'Merci.'].join('\n');
}
function summary(){
 const c=category(draft.category),t=topic(c,draft.topic);
 if(draft.sent){
  return '<div class="mj-contact-intro"><span class="mj-contact-overline">04 / ENVOI CONFIRMÉ</span>'+
   '<h2 id="mjContactStepTitle">MESSAGE <em>ENVOYÉ !</em></h2>'+
   '<p>Ta demande a été transmise à Ma_JesTik. Nous pourrons te répondre à <strong>'+esc(draft.email)+'</strong>.</p></div>'+
   '<div class="mj-contact-sent" role="status"><strong>✓ Envoi confirmé</strong>'+
   '<p>Tu n’as rien d’autre à faire. Pense à vérifier ta messagerie, y compris les indésirables.</p></div>'+
   '<div class="mj-contact-navigation"><button type="button" class="mj-contact-primary" data-contact-restart>CRÉER UNE AUTRE DEMANDE ↗</button></div>';
 }
 return '<div class="mj-contact-intro"><span class="mj-contact-overline">04 / RÉCAPITULATIF</span>'+
 '<h2 id="mjContactStepTitle">TA DEMANDE EST <em>PRÊTE.</em></h2>'+
 '<p>Vérifie les informations, puis valide la protection anti-spam avant l’envoi direct.</p></div>'+
 '<section class="mj-contact-summary"><dl><div><dt>Catégorie</dt><dd>'+esc(c?.title)+'</dd></div><div><dt>Sujet</dt><dd>'+esc(t?.[1])+'</dd></div>'+
 '<div><dt>Adresse de réponse</dt><dd>'+esc(draft.email)+'</dd></div><div><dt>Destinataire</dt><dd>'+MAIL+'</dd></div></dl>'+
 '<h3>Message à envoyer</h3><pre id="mjContactPrepared">'+esc(emailBody())+'</pre>'+
 (draft.attachments.length?'<p class="mj-contact-summary-note">Pièces jointes : '+draft.attachments.length+' ('+Math.ceil(draft.attachments.reduce((sum,f)=>sum+f.size,0)/1024)+' Ko).</p>':'')+
 '</section>'+
 '<div class="mj-contact-verification"><strong>Protection anti-spam Cloudflare</strong>'+
 '<p>Une courte vérification protège notre boîte de réception des robots.</p>'+
 '<div id="mjContactTurnstile" aria-label="Vérification anti-spam"></div>'+
 '<p id="mjContactCaptchaStatus" role="status">'+esc(draft.captchaError||'Chargement de la vérification de sécurité…')+'</p></div>'+
 '<p class="mj-contact-send-error" id="mjContactSendStatus" role="alert" aria-live="polite">'+esc(draft.sendError)+'</p>'+
 '<div class="mj-contact-navigation">'+back('MODIFIER MON MESSAGE')+
 '<button type="button" class="mj-contact-primary" data-contact-send disabled>ENVOYER MA DEMANDE →</button></div>'+
 '<div class="mj-contact-finish"><button type="button" class="mj-contact-secondary" data-contact-copy>COPIER LE MESSAGE (SECOURS)</button>'+
 '<span id="mjContactCopyStatus" role="status" aria-live="polite"></span></div>';
}
function destroyCaptcha(){
 if(captchaWidgetId!==null&&window.turnstile?.remove){
  try{window.turnstile.remove(captchaWidgetId)}catch{}
 }
 captchaWidgetId=null;
 draft.captchaToken='';
}
function updateSendButton(root){
 const button=root.querySelector('[data-contact-send]');
 if(!button)return;
 button.disabled=draft.sending||!draft.captchaToken;
 button.textContent=draft.sending?'ENVOI EN COURS…':'ENVOYER MA DEMANDE →';
}
function loadCaptchaScript(){
 if(window.turnstile?.render)return Promise.resolve(window.turnstile);
 if(captchaScriptPromise)return captchaScriptPromise;
 captchaScriptPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async=true;
  script.onload=()=>window.turnstile?.render?resolve(window.turnstile):reject(new Error('Turnstile indisponible'));
  script.onerror=()=>reject(new Error('Chargement de Turnstile impossible'));
  document.head.appendChild(script);
 }).catch(error=>{captchaScriptPromise=null;throw error;});
 return captchaScriptPromise;
}
async function setupCaptcha(root){
 const slot=root.querySelector('#mjContactTurnstile');
 if(!slot)return;
 const status=root.querySelector('#mjContactCaptchaStatus');
 if(!TURNSTILE_SITE_KEY||!CONTACT_API){
  if(status)status.textContent='Service temporairement indisponible. Contacte-nous par e-mail.';
  return;
 }
 try{
  const turnstile=await loadCaptchaScript();
  if(!slot.isConnected||draft.step!==4||draft.sent)return;
  captchaWidgetId=turnstile.render(slot,{
   sitekey:TURNSTILE_SITE_KEY,action:'majestik_contact',theme:'auto',size:'flexible',
   callback:token=>{
    if(draft.step!==4||draft.sent)return;
    draft.captchaToken=token;
    if(status?.isConnected)status.textContent='Vérification réussie, tu peux envoyer ta demande.';
    updateSendButton(root);
   },
   'expired-callback':()=>{
    draft.captchaToken='';
    if(status?.isConnected)status.textContent='Vérification expirée. Effectue-la de nouveau.';
    updateSendButton(root);
   },
   'error-callback':()=>{
    draft.captchaToken='';
    if(status?.isConnected)status.textContent='Vérification indisponible. Actualise la page si nécessaire.';
    updateSendButton(root);
   }
  });
  if(status?.isConnected&&!draft.captchaToken)status.textContent='Effectue la vérification pour activer l’envoi.';
 }catch{
  if(status?.isConnected)status.textContent='Impossible de charger la sécurité anti-spam. Vérifie ta connexion ou les bloqueurs de scripts.';
 }
}
async function sendContact(root){
 if(draft.sending||draft.sent||!draft.captchaToken||!CONTACT_API)return;
 const current=draft,data=new FormData();
 for(const field of ['category','topic','pseudo','email','message'])data.append(field,current[field]||'');
 data.append('website','');
 data.append('cf-turnstile-response',current.captchaToken);
 for(const file of current.attachments)data.append('attachments',file,file.name);
 current.sending=true;
 current.sendError='';
 updateSendButton(root);
 const status=root.querySelector('#mjContactSendStatus');
 if(status)status.textContent='Transmission sécurisée en cours…';
 try{
  const response=await fetch(CONTACT_API+'/v1/contact',{
   method:'POST',mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',
   body:data,signal:AbortSignal.timeout(35000)
  });
  const result=await response.json().catch(()=>null);
  if(!response.ok||result?.sent!==true)throw new Error(result?.error||'Envoi impossible pour le moment.');
  if(draft!==current)return;
  current.sent=true;
  current.sending=false;
  render(root,true);
 }catch(error){
  if(draft!==current)return;
  current.sendError=error?.name==='TimeoutError'
   ?'Le serveur n’a pas répondu. Vérifie tes e-mails avant de réessayer pour éviter un doublon.'
   :String(error?.message||'Envoi impossible. Réessaie ou écris à contact@ma-jestik.fr.').slice(0,230);
  current.sending=false;
  render(root);
 }
}
function render(root,focus=false){
 if(!root)return;
 destroyCaptcha();
 root.innerHTML=nav(draft.step)+'<div class="mj-contact-view">'+(
  draft.step===1?selectCategory():draft.step===2?selectTopic():draft.step===3?fillForm():summary()
 )+'</div>';
 if(draft.step===4&&!draft.sent)void setupCaptcha(root);
 if(focus){
  const heading=root.querySelector('#mjContactStepTitle');
  heading?.setAttribute('tabindex','-1');
  heading?.focus({preventScroll:true});
  root.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 }
}
export function contactMarkup(){
 return '<section class="mj-contact" aria-labelledby="mjContactTitle">'+
 '<header class="mj-contact-hero">'+
 '<span class="mj-contact-kicker">MA_JESTIK / NOUS CONTACTER</span>'+
 '<h1 id="mjContactTitle">UNE QUESTION ? <em>PARLONS-EN.</em></h1>'+
 '<p>Un souci technique, une question sur ton compte Ma_JesTik, une idée ou une collaboration ? Choisis ton motif et envoie ta demande directement depuis le QG.</p>'+
 '<div class="mj-contact-highlight"><span aria-hidden="true">✧</span><span>Un parcours simple, adapté à chaque besoin, sans connexion obligatoire.</span></div>'+
 '</header>'+
 '<div class="mj-contact-wizard" id="mjContactWizard"></div>'+
 '</section>';
}
async function copyText(text,feedback){
 try{
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);}
  else{
   const temp=document.createElement('textarea');temp.value=text;temp.style.position='fixed';temp.style.opacity='0';document.body.append(temp);temp.select();
   const copied=document.execCommand('copy');temp.remove();
   if(!copied)throw new Error('Copie impossible');
  }
  feedback.textContent='Copié ! Tu peux maintenant coller le texte dans ta messagerie.';
 }catch{
  feedback.textContent='La copie automatique a échoué. Sélectionne le texte affiché et copie-le manuellement.';
 }
}
export function mountContact(){
 draft=state();
 const root=document.getElementById('mjContactWizard');
 if(!root)return;
 render(root);
 root.addEventListener('click',e=>{
  if(draft.sending)return;
  const remove=e.target.closest('[data-contact-remove-file]');
  if(remove){
   const index=Number(remove.dataset.contactRemoveFile);
   if(Number.isInteger(index)&&index>=0&&index<draft.attachments.length){
    draft.attachments.splice(index,1);
    draft.fileError='';
    render(root);
   }
   return;
  }
  if(e.target.closest('[data-contact-clear-files]')){
   draft.attachments=[];
   draft.fileError='';
   render(root);
   return;
  }
  if(e.target.closest('[data-contact-send]')){void sendContact(root);return;}
  const categoryButton=e.target.closest('[data-contact-category]');
  if(categoryButton){draft.category=categoryButton.dataset.contactCategory;draft.topic=null;draft.step=2;render(root,true);return;}
  const topicButton=e.target.closest('[data-contact-topic]');
  if(topicButton){draft.topic=topicButton.dataset.contactTopic;draft.step=3;render(root,true);return;}
  if(e.target.closest('[data-contact-back]')){draft.step=draft.step===4?3:draft.step===3?2:1;render(root,true);return;}
  if(e.target.closest('[data-contact-restart]')){draft=state();render(root,true);return;}
  if(e.target.closest('[data-contact-copy]')){
   copyText(emailBody(),document.getElementById('mjContactCopyStatus'));
  }
 });
 root.addEventListener('input',e=>{
  const name=e.target.dataset.contactField;
  if(['pseudo','email','message'].includes(name)){draft[name]=e.target.value;}
 });
 root.addEventListener('change',e=>{
  if(e.target.id!=='mjContactFiles')return;
  const selected=Array.from(e.target.files||[]);
  if(!selected.length)return;
  // Repeated selections append; duplicates do not count twice.
  const additions=selected.filter(f=>!draft.attachments.some(old=>old.name===f.name&&old.size===f.size&&old.lastModified===f.lastModified));
  const files=[...draft.attachments,...additions];
  draft.fileError='';
  if(files.length>MAX_FILES){draft.fileError='Maximum : 6 fichiers.';}
  else if(files.some(f=>f.size===0||f.size>MAX_FILE_SIZE)){draft.fileError='Chaque fichier doit peser entre 1 octet et 5 Mo.';}
  else if(files.reduce((sum,f)=>sum+f.size,0)>MAX_TOTAL_SIZE){draft.fileError='La taille totale ne doit pas dépasser 12 Mo.';}
  else if(files.some(f=>!(/\.(png|jpe?g|webp|pdf)$/i).test(f.name))){draft.fileError='Formats acceptés : PNG, JPG, WebP et PDF.';}
  if(draft.fileError){
   e.target.value='';
   document.getElementById('mjContactFileError').textContent=draft.fileError;
   return;
  }
  draft.attachments=files;
  render(root);
 });
 root.addEventListener('submit',e=>{
  if(e.target.id!=='mjContactForm')return;
  e.preventDefault();
  if(!e.target.reportValidity())return;
  const message=draft.message.trim();
  if(message.length<20){document.getElementById('mjContactMessage')?.setCustomValidity('Décris ton besoin en au moins 20 caractères.');document.getElementById('mjContactMessage')?.reportValidity();return;}
  draft.message=message;
  draft.email=draft.email.trim();
  draft.pseudo=draft.pseudo.trim();
  draft.step=4;
  render(root,true);
 });
}
