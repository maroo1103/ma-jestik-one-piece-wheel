import {challengesMarkup,mountChallenges} from './defis.js?v=20261107-copy-clean1';
import {mountTwitchAuth} from './twitch-auth.js?v=20261107-ranking-optin1';
import {killathonMarkup,mountKillathon} from './killathon.js?v=20261106-final2';
const $ = (id) => document.getElementById(id);
const root = $('page');
const votesEnabled=document.querySelector('meta[name="majestik-votes-enabled"]')?.content==='true';
const voteApi=(document.querySelector('meta[name="majestik-members-api"]')?.content||'').replace(/\/$/,'');
const names = {accueil:'Accueil',roue:'Roue Fortnite',defis:'Défis & missions',killathon:'Killathon',tribunal:'Tribunal communautaire',classement:'Classements',setup:'Mon setup interactif',partenaires:'Affiliations & partenaires',createur:'Code créateur'};
const modules = [
{path:'roue',icon:'🎡',title:'Roue Fortnite One Piece',desc:'Notre roue originale, avec ses 12 destinations, ses images et ses sons. Accessible directement ici.',ready:true},
{path:'defis',icon:'⚔️',title:'Défis & missions',desc:'118 défis Fortnite Zero Build validés : Solo, Duo, Trio, Quatuor et filtres par difficulté.',ready:true},
{path:'killathon',icon:'🎯',title:'Killathon Ma_JesTik',desc:'Suivi du Killathon Fortnite et boosts Twitch, avec affichage public en préparation.',ready:true},
{path:'tribunal',icon:'⚖️',title:'Tribunal communautaire',desc:'Des votes sur toutes sortes de sujets, pas uniquement les fails.',ready:false},
{path:'classement',icon:'🏆',title:'Classements',desc:'Des tableaux partagés liés aux comptes et aux activités, sans faux résultats.',ready:votesEnabled}
];
const groups = {accueil:null,roue:'outils',defis:'outils',killathon:'outils',tribunal:'communaute',classement:'communaute',setup:'univers',partenaires:'univers',createur:'univers'};
const tag=(s,kind='')=>'<span class="tag '+kind+'">'+s+'</span>';
const head=(eyebrow,title,description,tags=[])=>'<div class="page-head"><div class="eyebrow">'+eyebrow+'</div><h1>'+title+'</h1>'+(description?'<p>'+description+'</p>':'')+(tags.length?'<div class="page-tags">'+tags.join('')+'</div>':'')+'</div>';
const panel=(icon,title,body)=>'<article class="panel placeholder-card"><div><div class="big-symbol" aria-hidden="true">'+icon+'</div><h3>'+title+'</h3><p>'+body+'</p></div><div class="step-label">À DÉFINIR ENSEMBLE</div></article>';
function home(){
 return '<section class="hero home-hero"><div class="hero-content"><div class="eyebrow">LE QG COMMUNAUTAIRE · MA_JESTIK</div><h1>BIENVENUE AU QG</h1><p>Quelques outils de divertissement.</p></div></section>'+
 '<section class="home-tools"><div class="section-top"><div><h2>OUTILS</h2><p>Les outils et espaces de la communauté réunis au même endroit.</p></div></div><div class="cards">'+modules.map(m=>'<a class="module-card '+(m.ready?'highlight':'')+'" href="#/'+m.path+'"><div class="card-line"><span class="module-icon" aria-hidden="true">'+m.icon+'</span><span class="'+(m.ready?'status-ready':'status-prep')+'">'+(m.ready?'DISPONIBLE':'EN PRÉPARATION')+'</span></div><h3>'+m.title+'</h3><p>'+m.desc+'</p><span class="card-bottom">'+(m.ready?'UTILISER MAINTENANT':'VOIR LE PROJET')+' <span aria-hidden="true">→</span></span></a>').join('')+'</div></section>';
}
function wheel(){
 return head('CRÉATION N° 01','LA ROUE FORTNITE','Laisse le hasard choisir ta prochaine destination sur la carte de Fortnite.')+
 '<div class="wheel-area"><div class="loading" id="wheelLoading">Chargement de la roue…</div><iframe class="wheel-embed" id="wheelFrame" title="Roue interactive Fortnite One Piece Ma_JesTik" src="../" loading="eager" allow="fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
}
function challenges(){return challengesMarkup();}
function court(){
 return head('CRÉATION N° 05','LE TRIBUNAL','L’assemblée prend la parole. Votes sur le gameplay, les choix de jeu, les défis et les décisions de la communauté — pas uniquement les fails.',[tag('Questions libres'),tag('2 à 4 réponses possibles'),tag('Votes partagés à venir','gold')])+
 '<div class="panel-grid"><article class="panel"><h3>UNE QUESTION. UN VERDICT.</h3><p>Exemple de présentation, sans vote réel pour le moment.</p><div class="vote-visual"><strong>QUEL SERA LE PROCHAIN JEU DU LIVE ?</strong><div class="vote-options"><span>FORTNITE</span><span>WARZONE</span></div></div></article>'+panel('⚖️','UN TRIBUNAL UNIVERSEL','L’administrateur rédige une question, propose plusieurs réponses et fixe une durée. Lorsque les comptes et les votes sécurisés seront prêts, chaque participant pourra voter une seule fois selon les règles choisies.')+'</div>';
}
function ranking(){
 if(votesEnabled)return head('COMMUNAUTÉ','CLASSEMENT DE L’ÉQUIPAGE','',[tag('+1 · Réussite prédite'),tag('+2 · Échec prédit'),tag('Classement volontaire','gold')])+
 '<section class="panel"><h3>CLASSEMENT GÉNÉRAL</h3><p>Les meilleurs pronostics des membres qui ont accepté d’apparaître dans le classement. Aucun point fictif.</p><table class="ranking-table"><thead><tr><th>RANG</th><th>PSEUDO TWITCH</th><th>POINTS</th></tr></thead><tbody id="rankingRows"><tr><td colspan="3" class="empty-rank">Chargement des résultats…</td></tr></tbody></table></section>';
 return head('COMMUNAUTÉ','LES CLASSEMENTS','Des records et points partagés entre visiteurs. Les scores devront être contrôlés côté serveur pour que chacun joue à armes égales.',[tag('Comptes à construire','gold'),tag('Scores protégés à venir')])+
 '<section class="panel"><h3>CLASSEMENT GÉNÉRAL</h3><p>La vraie base de données n’est pas encore connectée. Aucun faux profil ni faux score n’est affiché.</p><table class="ranking-table"><thead><tr><th>RANG</th><th>PSEUDO</th><th>POINTS</th></tr></thead><tbody><tr><td colspan="3" class="empty-rank">Pas encore de classement — lancement après validation des règles et du système de comptes.</td></tr></tbody></table></section>'+
 '<div class="note">Architecture prévue : authentification sécurisée, stockage partagé et règles de calcul côté serveur sur un service à quota gratuit. Pas d’abonnement mensuel activé.</div>';
}
let rankingTimer=null;
let rankingNode=null,rankingSignature='';
async function mountRankings(){
 const tbody=$('rankingRows');
 if(!tbody||!votesEnabled)return;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{
  const r=await fetch(voteApi+'/v1/ranking',{cache:'no-store',mode:'cors',signal:controller.signal});
  if(!r.ok)throw Error('Classement inaccessible');
  const data=await r.json();
  if(!tbody.isConnected)return;
  const entries=Array.isArray(data.entries)?data.entries:[];
  const signature=JSON.stringify(entries.map(x=>[x.display_name,x.score,x.avatar_url]));
  if(rankingNode===tbody&&rankingSignature===signature)return;
  rankingNode=tbody;rankingSignature=signature;
  tbody.replaceChildren();
  if(!entries.length){
   const tr=document.createElement('tr'),td=document.createElement('td');
   td.colSpan=3;td.className='empty-rank';td.textContent='Aucun point officiel pour le moment. Les premiers pronostics validés apparaîtront ici.';
   tr.append(td);tbody.append(tr);return;
  }
  entries.slice(0,50).forEach((entry,i)=>{
   if(!entry||typeof entry.display_name!=='string')return;
   const tr=document.createElement('tr');
   const rank=document.createElement('td');rank.textContent=String(i+1);
   const who=document.createElement('td');
   const user=document.createElement('span');user.className='ranking-person';
   try {
    const url=new URL(String(entry.avatar_url||''));
    if(url.protocol==='https:'&&url.hostname==='static-cdn.jtvnw.net'){
     const img=document.createElement('img');img.src=url.href;img.alt='';img.referrerPolicy='no-referrer';img.width=26;img.height=26;user.append(img);
    }
   }catch{}
   const name=document.createElement('span');name.textContent=entry.display_name.slice(0,64);user.append(name);who.append(user);
   const score=document.createElement('td');score.textContent=String(Math.max(0,Math.floor(Number(entry.score)||0)));
   tr.append(rank,who,score);tbody.append(tr);
  });
 }catch{
  if(tbody.isConnected)tbody.querySelector('.empty-rank').textContent='Le classement est temporairement indisponible.';
 }finally{clearTimeout(timer);}
}
function setup(){
 return head('UNIVERS MA_JESTIK','MON VRAI SETUP INTERACTIF','Explore mon installation gaming en détail. Sélectionne un équipement sur la photo pour découvrir ses caractéristiques et ma configuration PC.')+
 '<div class="wheel-area setup-area"><iframe class="setup-embed" id="setupFrame" src="setup-original/index.html" title="Setup interactif original de Ma_JesTik avec photo et composants cliquables" loading="eager" scrolling="no"></iframe></div>';
}
function partners(){
 return head('UNIVERS MA_JESTIK','AFFILIATIONS & PARTENAIRES','Un espace transparent pour retrouver les boutiques et matériels que je recommande. Les liens affiliés n’apparaîtront que lorsque leur suivi aura été vérifié.',[tag('Liens à configurer','gold'),tag('Informations commerciales claires')])+
 '<div class="partners"><article class="partner-box"><div class="partner-brand">IG</div><div><h3>INSTANT GAMING</h3><p>Emplacement réservé à ton véritable lien d’affiliation Instant Gaming. Nous le renseignerons depuis ton compte partenaire.</p></div></article><article class="partner-box"><div class="partner-brand">a</div><div><h3>AMAZON PARTENAIRES</h3><p>Emplacement réservé à un lien Amazon avec ton identifiant partenaire valide, vers l’accueil, une catégorie ou un produit.</p></div></article></div>'+
 '<div class="note">Une mention indiquera clairement que certains liens peuvent rapporter une commission. Nous vérifierons aussi les règles applicables aux contenus de fans Fortnite avant de publier des affiliations à proximité.</div>';
}
function creator(){
 return head('UNIVERS MA_JESTIK','CODE CRÉATEUR','Un emplacement pour ton éventuel futur code créateur Epic Games. Il n’est pas activé tant que tu n’as pas été admis au programme.',[tag('À venir','gold')])+
 '<section class="panel"><h3>TON CODE S’AFFICHERA ICI</h3><p>Lorsque tu auras obtenu ton code officiel, nous pourrons ajouter un grand encart avec un bouton « Copier le code », et des explications pour l’utiliser dans la boutique Fortnite.</p><span class="tag gold">NON DISPONIBLE POUR LE MOMENT</span></section>';
}
const pages={accueil:home,roue:wheel,defis:challenges,killathon:killathonMarkup,tribunal:court,classement:ranking,setup:setup,partenaires:partners,createur:creator};
let wheelObserver=null;
let setupObserver=null;
// Mesure la fin du contenu REEL (et non scrollHeight, qui peut inclure
// la hauteur déjà attribuée à l'iframe et empêcher tout rétrécissement).
function setEmbedHeight(frame,selector,minimum,maximum,extra=8){
 if(!frame?.isConnected)return;
 const doc=frame.contentDocument;
 if(!doc)return;
 const end=doc.querySelector(selector);
 if(!end)return;
 const bottom=end.getBoundingClientRect().bottom+(doc.defaultView?.scrollY||0);
 if(!Number.isFinite(bottom)||bottom<=0)return;
 const exact=Math.min(maximum,Math.max(minimum,Math.ceil(bottom+extra)));
 if(Math.abs(frame.getBoundingClientRect().height-exact)>2){
  frame.style.height=exact+'px';
 }
}
function mountWheel(){
 const frame=$('wheelFrame');if(!frame)return;
 const loading=$('wheelLoading');
 const update=()=>{try{setEmbedHeight(frame,'main',720,4800,8)}catch{}};
 frame.addEventListener('load',()=>{
  if(loading)loading.hidden=true;
  update();
  try{
   const doc=frame.contentDocument;
   if(doc&&window.ResizeObserver){
    wheelObserver?.disconnect();
    wheelObserver=new ResizeObserver(update);
    wheelObserver.observe(doc.querySelector('main')||doc.body);
   }
   frame.contentWindow.addEventListener('resize',update);
   setTimeout(update,250);
   setTimeout(update,1100);
  }catch{}
 });
}
function mountSetup(){
 const frame=$('setupFrame');if(!frame)return;
 const update=()=>{try{setEmbedHeight(frame,'body > footer',850,6000,8)}catch{}};
 frame.addEventListener('load',()=>{
  setupObserver?.disconnect();
  update();
  try{
   const doc=frame.contentDocument;
   if(doc&&window.ResizeObserver){
    setupObserver=new ResizeObserver(update);
    setupObserver.observe(doc.body);
    setupObserver.observe(doc.querySelector('main')||doc.body);
   }
   frame.contentWindow.addEventListener('resize',update);
   setTimeout(update,150);
   setTimeout(update,750);
  }catch{}
 });
}
function closeMobile(){
 $('sidebar').classList.remove('open');
 $('sidebarShade').hidden=true;
 $('menuMobile').setAttribute('aria-expanded','false');
}
function route(){
 if(rankingTimer){clearInterval(rankingTimer);rankingTimer=null;}
 const raw=decodeURIComponent(location.hash.replace(/^#\/?/,'').split('?')[0]);
 const page=Object.prototype.hasOwnProperty.call(pages,raw)?raw:'accueil';
 if(wheelObserver){wheelObserver.disconnect();wheelObserver=null;}
 if(setupObserver){setupObserver.disconnect();setupObserver=null;}
 root.innerHTML=pages[page]();
 $('crumbName').textContent=names[page];
 document.title=(page==='accueil'?'Le QG communautaire':names[page])+' · Ma_JesTik';
 document.querySelectorAll('[data-page]').forEach(a=>{let active=a.dataset.page===page;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const group=groups[page];
 if(group){const button=document.querySelector('[data-toggle="'+group+'"]');button?.setAttribute('aria-expanded','true');}
 if(page==='roue')mountWheel();
 if(page==='setup')mountSetup();
 if(page==='defis')mountChallenges();
 if(page==='killathon')mountKillathon();
 if(page==='classement'&&votesEnabled){
  void mountRankings();
  rankingTimer=setInterval(()=>{
   if(document.visibilityState!=='hidden')void mountRankings();
  },12000);
 }
 closeMobile();scrollTo({top:0,behavior:'instant'});
}
document.querySelectorAll('[data-toggle]').forEach(toggle=>toggle.addEventListener('click',()=>{
 const isOpen=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!isOpen));
}));
$('menuMobile').addEventListener('click',()=>{
 const open=!$('sidebar').classList.contains('open');
 $('sidebar').classList.toggle('open',open);$('sidebarShade').hidden=!open;$('menuMobile').setAttribute('aria-expanded',String(open));
});
$('sidebarShade').addEventListener('click',closeMobile);
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobile()});
window.addEventListener('hashchange',route);
window.addEventListener('focus',()=>{
 if(location.hash.startsWith('#/classement')&&votesEnabled)void mountRankings();
});
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='visible'&&location.hash.startsWith('#/classement')&&votesEnabled)void mountRankings();
});
mountTwitchAuth(); // Le module nettoie immédiatement une URL de retour OAuth.
route();
