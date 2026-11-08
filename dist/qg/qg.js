import {challengesMarkup,mountChallenges} from './defis.js?v=20261108-head3';
import {mountTwitchAuth} from './twitch-auth.js?v=20261107-ranking-optin1';
import {killathonMarkup,mountKillathon} from './killathon.js?v=20261108-head3';
import {tribunalMarkup,mountTribunal,unmountTribunal} from './tribunal.js?v=20261108-labels3';
import {publicTribunalMarkup,mountPublicTribunal,unmountPublicTribunal,tribunalPublicEnabled} from './tribunal-public.js?v=20261108-queue1';
const $ = (id) => document.getElementById(id);
const root = $('page');
const votesEnabled=document.querySelector('meta[name="majestik-votes-enabled"]')?.content==='true';
const voteApi=(document.querySelector('meta[name="majestik-members-api"]')?.content||'').replace(/\/$/,'');
const names = {accueil:'Accueil',roue:'Roue Fortnite',defis:'Défis & missions',killathon:'Killathon',tribunal:'Tribunal communautaire',classement:'Classements',setup:'Mon setup interactif',partenaires:'Affiliations & partenaires',createur:'Code créateur'};
const modules = [
{path:'roue',icon:'🎡',title:'Roue Fortnite One Piece',desc:'Notre roue originale, avec ses 12 destinations, ses images et ses sons. Accessible directement ici.',ready:true},
{path:'defis',icon:'⚔️',title:'Défis & missions',desc:'118 défis Fortnite Zero Build validés : Solo, Duo, Trio, Quatuor et filtres par difficulté.',ready:true},
{path:'killathon',icon:'🎯',title:'Killathon Ma_JesTik',desc:'Compteur personnel, objectif et affichage OBS pour chaque streamer. Prêt à utiliser.',ready:true},
{path:'tribunal',icon:'⚖️',title:'Tribunal communautaire',desc:'Propose des questions, vote avec Twitch et découvre les résultats partagés.',ready:tribunalPublicEnabled},
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
 return head('OUTILS GAMING','LA ROUE FORTNITE','Laisse le hasard choisir ta prochaine destination sur la carte de Fortnite.')+
 '<div class="wheel-area"><div class="loading" id="wheelLoading">Chargement de la roue…</div><iframe class="wheel-embed" id="wheelFrame" title="Roue interactive Fortnite One Piece Ma_JesTik" src="../roue.html" loading="eager" allow="fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
}
function challenges(){return challengesMarkup();}
function court(){return tribunalMarkup();}
function ranking(){
 if(votesEnabled)return head('COMMUNAUTÉ','CLASSEMENT DE L’ÉQUIPAGE','',[tag('+1 · Réussite prédite'),tag('+2 · Échec prédit')])+
 '<section class="qg-rankings"><div class="qg-podium-title"><span aria-hidden="true">🏆</span><h2>TOP 3 DE L’ÉQUIPAGE</h2></div>'+
 '<div class="qg-podium" id="rankingPodium" aria-live="polite"><p class="qg-podium-empty">Chargement du podium…</p></div>'+
 '<section class="panel qg-ranking-panel" aria-labelledby="rankTableTitle"><div class="qg-rank-table-title"><h2 id="rankTableTitle">CLASSEMENT GÉNÉRAL</h2><p>À partir de la 4ᵉ place</p></div>'+
 '<div class="qg-ranking-scroll"><table class="ranking-table qg-rank-table"><thead><tr><th scope="col">RANG</th><th scope="col">PSEUDO TWITCH</th><th scope="col">POINTS</th></tr></thead><tbody id="rankingRows"><tr><td colspan="3" class="empty-rank">Chargement…</td></tr></tbody></table></div></section></section>';
 return head('COMMUNAUTÉ','LES CLASSEMENTS','Des records et points partagés entre visiteurs. Les scores devront être contrôlés côté serveur pour que chacun joue à armes égales.',[tag('Comptes à construire','gold'),tag('Scores protégés à venir')])+
 '<section class="panel"><h3>CLASSEMENT GÉNÉRAL</h3><p>La vraie base de données n’est pas encore connectée. Aucun faux profil ni faux score n’est affiché.</p><table class="ranking-table"><thead><tr><th>RANG</th><th>PSEUDO</th><th>POINTS</th></tr></thead><tbody><tr><td colspan="3" class="empty-rank">Pas encore de classement — lancement après validation des règles et du système de comptes.</td></tr></tbody></table></section>'+
 '<div class="note">Architecture prévue : authentification sécurisée, stockage partagé et règles de calcul côté serveur sur un service à quota gratuit. Pas d’abonnement mensuel activé.</div>';
}
let rankingTimer=null;
let rankingNode=null,rankingSignature='';
function rankScore(value){return Math.max(0,Math.floor(Number(value)||0));}
function rankAvatar(entry){
 const container=document.createElement('span');container.className='qg-rank-avatar';
 const initial=document.createElement('span');initial.className='qg-rank-initial';initial.textContent=String(entry.display_name||'?').trim().slice(0,1).toUpperCase()||'?';container.append(initial);
 try{
  const url=new URL(String(entry.avatar_url||''));
  if(url.protocol==='https:'&&url.hostname==='static-cdn.jtvnw.net'){
   const img=document.createElement('img');img.src=url.href;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';
   img.addEventListener('error',()=>img.remove(),{once:true});container.append(img);
  }
 }catch{}
 return container;
}
function rankWreathedAvatar(entry){
 const frame=document.createElement('span');
 frame.className='qg-rank-avatar-frame';
 frame.append(rankAvatar(entry));
 return frame;
}
function rankCard(entry,place){
 const roles=['Capitaine de l’équipage','Second de bord','Éclaireur'];
 const icons=['👑','🥈','🥉'];
 const card=document.createElement('article');card.className='qg-rank-card qg-rank-card-'+place;
 card.setAttribute('aria-label','Place '+place+' : '+entry.display_name+', '+rankScore(entry.score)+' points');
 const icon=document.createElement('span');icon.className='qg-rank-medal';icon.setAttribute('aria-hidden','true');icon.textContent=icons[place-1];
 const number=document.createElement('span');number.className='qg-rank-number';number.textContent='#'+place;
 const name=document.createElement('strong');name.className='qg-rank-name';name.textContent=entry.display_name.slice(0,64);
 const score=document.createElement('span');score.className='qg-rank-score';const points=rankScore(entry.score);
 score.textContent=String(points)+' '+(points===1?'point':'points');
 const role=document.createElement('span');role.className='qg-rank-role';role.textContent=roles[place-1];
 card.append(icon,number,rankWreathedAvatar(entry),name,score,role);
 return card;
}
function renderRankings(entries,podium,tbody){
 podium.replaceChildren();
 if(!entries.length){
  const msg=document.createElement('p');msg.className='qg-podium-empty';msg.textContent='Le podium attend ses premiers pronostiqueurs.';podium.append(msg);
 }else{
  // Ordre visuel : médaille d'argent, médaille d'or, médaille de bronze.
  [1,0,2].forEach(i=>{if(entries[i])podium.append(rankCard(entries[i],i+1));});
 }
 tbody.replaceChildren();
 if(entries.length<=3){
  const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=3;cell.className='empty-rank';
  cell.textContent=entries.length?'La suite du classement apparaîtra à partir du 4ᵉ membre.':'Aucun membre classé pour le moment.';
  row.append(cell);tbody.append(row);return;
 }
 entries.slice(3,50).forEach((entry,i)=>{
  const row=document.createElement('tr');row.className='qg-rank-row';
  const rank=document.createElement('td');const badge=document.createElement('span');badge.className='qg-rank-position';badge.textContent=String(i+4);rank.append(badge);
  const who=document.createElement('td'),person=document.createElement('span');person.className='ranking-person';
  const name=document.createElement('span');name.textContent=entry.display_name.slice(0,64);
  person.append(rankAvatar(entry),name);who.append(person);
  const score=document.createElement('td');score.className='qg-rank-points';score.textContent=String(rankScore(entry.score));
  row.append(rank,who,score);tbody.append(row);
 });
}
async function mountRankings(){
 const tbody=$('rankingRows'),podium=$('rankingPodium');if(!tbody||!podium||!votesEnabled)return;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{
  const res=await fetch(voteApi+'/v1/ranking',{cache:'no-store',mode:'cors',signal:controller.signal});
  if(!res.ok)throw Error('Classement inaccessible');
  const data=await res.json();if(!tbody.isConnected||!podium.isConnected)return;
  const entries=Array.isArray(data.entries)?data.entries.filter(e=>e&&typeof e.display_name==='string'&&e.display_name.trim()).slice(0,50):[];
  const signature=JSON.stringify(entries.map(e=>[e.display_name,rankScore(e.score),e.avatar_url]));
  if(rankingNode===tbody&&rankingSignature===signature)return;
  renderRankings(entries,podium,tbody);rankingNode=tbody;rankingSignature=signature;
 }catch{
  if(tbody.isConnected&&podium.isConnected&&rankingNode!==tbody){
   const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=3;cell.className='empty-rank';cell.textContent='Le classement est temporairement indisponible.';row.append(cell);tbody.replaceChildren(row);
   const msg=document.createElement('p');msg.className='qg-podium-empty';msg.textContent='Le podium est temporairement indisponible.';podium.replaceChildren(msg);
  }
 }finally{clearTimeout(timer);}
}
function setup(){
 return head('UNIVERS MA_JESTIK','MON VRAI SETUP INTERACTIF','Explore mon installation gaming en détail. Sélectionne un équipement sur la photo pour découvrir ses caractéristiques et ma configuration PC.')+
 '<div class="wheel-area setup-area"><iframe class="setup-embed" id="setupFrame" src="setup-original/index.html" title="Setup interactif original de Ma_JesTik avec photo et composants cliquables" loading="eager" scrolling="no"></iframe></div>';
}
function partners(){
 return head('UNIVERS MA_JESTIK','AFFILIATIONS & PARTENAIRES','Retrouve les boutiques où je déniche mes jeux et mon matériel gaming. En passant par mes liens affiliés, tu peux soutenir le QG sans frais supplémentaires pour toi.',[tag('Mes liens affiliés','gold')])+
 '<div class="partners">'+
 '<article class="partner-box partner-live partner-instant"><div class="partner-brand partner-instant-brand partner-logo-card"><img src="https://dl.memuplay.com/new_market/img/com.instantgaming.android.icon.2025-01-02-10-35-27.png" alt="Logo officiel Instant Gaming" width="112" height="112" loading="lazy" decoding="async"></div><div class="partner-content"><div class="partner-heading"><h3>INSTANT GAMING</h3><span class="partner-label partner-label-ready">LIEN AFFILIÉ</span></div><p>Jeux PC et consoles, cartes cadeaux et contenus numériques : découvre la sélection Instant Gaming.</p><a class="btn btn-gold partner-cta" href="https://www.instant-gaming.com/fr/?igr=gamer-e68168b" target="_blank" rel="sponsored noopener noreferrer" aria-label="Visiter Instant Gaming via mon lien affilié">Découvrir Instant Gaming ↗</a><p class="partner-disclosure">Lien affilié : je peux recevoir une commission sur les achats éligibles.</p></div></article>'+
 '<article class="partner-box partner-live partner-amazon-card"><div class="partner-brand partner-amazon partner-logo-card"><img src="https://upload.wikimedia.org/wikipedia/commons/0/06/Amazon_2024.svg" alt="Logo Amazon" width="112" height="38" loading="lazy" decoding="async"></div><div class="partner-content"><div class="partner-heading"><h3>AMAZON</h3><span class="partner-label partner-label-ready">LIEN AFFILIÉ</span></div><p>Retrouve du matériel gaming, des accessoires et d’autres produits sur Amazon.</p><a class="btn btn-gold partner-cta" href="https://link.amazon/B04IqWCdV" target="_blank" rel="sponsored noopener noreferrer" aria-label="Visiter Amazon via mon lien affilié">Découvrir Amazon ↗</a><p class="partner-disclosure">En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.</p></div></article>'+
 '</div>';
}
function creator(){
 return head('UNIVERS MA_JESTIK','CODE CRÉATEUR','Un emplacement pour ton éventuel futur code créateur Epic Games. Il n’est pas activé tant que tu n’as pas été admis au programme.',[tag('À venir','gold')])+
 '<section class="panel"><h3>TON CODE S’AFFICHERA ICI</h3><p>Lorsque tu auras obtenu ton code officiel, nous pourrons ajouter un grand encart avec un bouton « Copier le code », et des explications pour l’utiliser dans la boutique Fortnite.</p><span class="tag gold">NON DISPONIBLE POUR LE MOMENT</span></section>';
}
const pages={accueil:home,roue:wheel,defis:challenges,killathon:killathonMarkup,tribunal:tribunalPublicEnabled?publicTribunalMarkup:court,classement:ranking,setup:setup,partenaires:partners,createur:creator};
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
 unmountTribunal();
 unmountPublicTribunal();
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
 if(page==='tribunal'){
  if(tribunalPublicEnabled)mountPublicTribunal();
  else mountTribunal();
 }
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
