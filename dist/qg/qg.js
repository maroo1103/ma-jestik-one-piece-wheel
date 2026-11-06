const $ = (id) => document.getElementById(id);
const root = $('page');
const names = {accueil:'Accueil',roue:'Roue Fortnite',defis:'Défis & missions',bingo:'Bingo gaming',coffre:'Coffre mystère',tribunal:'Tribunal communautaire',classement:'Classements',setup:'Mon setup interactif',partenaires:'Affiliations & partenaires',createur:'Code créateur'};
const products = [
{type:'PROCESSEUR',name:'AMD Ryzen 7 7800X3D',icon:'⚡',detail:'Le processeur de mon PC principal, optimisé pour le gaming. Plateforme AMD AM5.'},
{type:'CARTE GRAPHIQUE',name:'PNY GeForce RTX 5070 Ti Epic-X ARGB OC',icon:'🎮',detail:'Ma carte graphique pour jouer et diffuser en 1440p. Le matériel présenté correspond à mon setup personnel.'},
{type:'CARTE MÈRE',name:'MSI B650 Gaming Plus WiFi',icon:'🔧',detail:'Une carte mère au format ATX sur plateforme AMD AM5.'},
{type:'MÉMOIRE',name:'Crucial Pro DDR5 — 32 Go',icon:'▥',detail:'Deux barrettes de 16 Go. Mon réglage quotidien fonctionne à 6 000 MT/s.'},
{type:'BOÎTIER',name:'NZXT H6 Flow ARGB',icon:'🖥️',detail:'Mon boîtier noir avec vitrine et ventilation personnalisée.'},
{type:'REFROIDISSEMENT',name:'Arctic Liquid Freezer III 360',icon:'❄️',detail:'Refroidissement liquide du processeur, avec radiateur 360 mm installé sur le dessus.'},
{type:'MICRO',name:'RØDE NT-USB+',icon:'🎙️',detail:'Mon microphone pour les lives et les discussions.'},
{type:'CAMÉRA',name:'Elgato Facecam Neo',icon:'📷',detail:'Ma caméra utilisée pour le streaming.'},
{type:'CASQUE',name:'Astro A50 Gen 4',icon:'🎧',detail:'Mon casque gaming sans fil.'},
{type:'ÉCRANS',name:'Deux moniteurs gaming 27″ QHD',icon:'🖼️',detail:'Un MSI MAG 27CQ6F 180 Hz et un AOC CQ27G2S 165 Hz, tous deux en 2 560 × 1 440 pixels.'}
];
const modules = [
{path:'roue',icon:'🎡',title:'Roue Fortnite One Piece',desc:'Notre roue originale, avec ses 12 destinations, ses images et ses sons. Accessible directement ici.',ready:true},
{path:'defis',icon:'⚔️',title:'Défis & missions',desc:'Défis aléatoires ou proposés par les viewers. Nous choisirons ensemble les missions.',ready:false},
{path:'bingo',icon:'▦',title:'Bingo gaming',desc:'Des grilles de situations à compléter en direct. Chaque case sera décidée ensemble.',ready:false},
{path:'coffre',icon:'🎁',title:'Coffre mystère',desc:'Un système de surprises dont nous définirons les règles et le contenu.',ready:false},
{path:'tribunal',icon:'⚖️',title:'Tribunal communautaire',desc:'Des votes sur toutes sortes de sujets, pas uniquement les fails.',ready:false},
{path:'classement',icon:'🏆',title:'Classements',desc:'Des tableaux partagés liés aux comptes et aux activités, sans faux résultats.',ready:false}
];
const groups = {accueil:null,roue:'outils',defis:'outils',bingo:'outils',coffre:'outils',tribunal:'communaute',classement:'communaute',setup:'univers',partenaires:'univers',createur:'univers'};
const tag=(s,kind='')=>'<span class="tag '+kind+'">'+s+'</span>';
const head=(eyebrow,title,description,tags=[])=>'<div class="page-head"><div class="eyebrow">'+eyebrow+'</div><h1>'+title+'</h1><p>'+description+'</p><div class="page-tags">'+tags.join('')+'</div></div>';
const panel=(icon,title,body)=>'<article class="panel placeholder-card"><div><div class="big-symbol" aria-hidden="true">'+icon+'</div><h3>'+title+'</h3><p>'+body+'</p></div><div class="step-label">À DÉFINIR ENSEMBLE</div></article>';
function home(){
 return '<section class="hero"><div class="hero-content"><div class="eyebrow">LE QG COMMUNAUTAIRE · MA_JESTIK</div><h1>TOUTES NOS CRÉATIONS.<br><em>UN SEUL QG.</em></h1><p>Roue Fortnite, défis, mini-jeux et univers gaming. Un site ouvert à tous, conçu pour évoluer avec vous — sans changer de fenêtre.</p><div class="hero-actions"><a class="btn btn-gold" href="#/roue">🎡 UTILISER LA ROUE <span aria-hidden="true">→</span></a><a class="btn btn-ghost" href="#/setup">🖥️ DÉCOUVRIR MON SETUP</a></div></div><div class="hero-decoration" aria-hidden="true">MJ</div></section>'+
 '<section><div class="section-top"><div><h2>NOS CRÉATIONS</h2><p>Un outil opérationnel, d’autres modules à construire ensemble.</p></div><span class="capsule">● LE QG PREND FORME</span></div><div class="cards">'+modules.map(m=>'<a class="module-card '+(m.ready?'highlight':'')+'" href="#/'+m.path+'"><div class="card-line"><span class="module-icon" aria-hidden="true">'+m.icon+'</span><span class="'+(m.ready?'status-ready':'status-prep')+'">'+(m.ready?'DISPONIBLE':'EN PRÉPARATION')+'</span></div><h3>'+m.title+'</h3><p>'+m.desc+'</p><span class="card-bottom">'+(m.ready?'UTILISER MAINTENANT':'VOIR LE PROJET')+' <span aria-hidden="true">→</span></span></a>').join('')+'</div></section>'+
 '<div class="info-strip"><span class="strip-icon" aria-hidden="true">🧭</span><div><strong>À construire étape par étape, avec toi.</strong><p>Les défis, le bingo, le coffre mystère et les votes ne sont pas figés. Nous sélectionnerons leur contenu avant leur activation publique.</p></div></div>';
}
function wheel(){
 return head('CRÉATION N° 01','LA ROUE FORTNITE','Notre roue Fortnite One Piece est intégrée à ce QG. Elle garde ses tirages, ses images, son audio et ses réglages : le site d’origine reste intact.',[tag('● DÉJÀ FONCTIONNEL'),tag('12 destinations'),tag('Tirages indépendants')])+
 '<div class="wheel-area"><div class="wheel-area-header"><strong>🎡 LE HASARD DÉCIDE · ROUe FORTNITE</strong><small>Même site · aucune nouvelle fenêtre</small></div><div class="loading" id="wheelLoading">Chargement de la roue…</div><iframe class="wheel-embed" id="wheelFrame" title="Roue interactive Fortnite One Piece Ma_JesTik" src="../" loading="eager" allow="fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'+
 '<div class="note">La roue est chargée directement depuis le même hébergement, à l’intérieur du QG. Les images et les sons restent dans leur version actuelle.</div>';
}
function challenges(){
 return head('CRÉATION N° 02','DÉFIS & MISSIONS','Deux façons de jouer : tirage aléatoire ou proposition d’un viewer. Tu valides toujours ce qui s’affiche pendant ton live.',[tag('Deux modes'),tag('Fortnite / Multi-jeux'),tag('Contenu à valider','gold')])+
 '<div class="panel-grid">'+panel('🎲','MODE ALÉATOIRE','Une mission adaptée au jeu en cours, tirée dans une liste approuvée et modifiable. Difficulté, durée et conditions de réussite seront configurables.')+panel('👥','MODE VIEWER','Un spectateur propose une mission. Elle reste dans une file d’attente jusqu’à ton acceptation ou ton refus, pour éviter les abus.')+'</div>'+
 '<div class="note"><strong>Important :</strong> aucun des anciens défis de démonstration n’est publié automatiquement. Nous choisirons ensemble la vraie liste, jeu par jeu.</div>';
}
function bingo(){
 return head('CRÉATION N° 03','BINGO GAMING','Une grille personnalisée pour chaque type de live. On choisira les cases, les conditions de validation et les récompenses ensemble.',[tag('4 × 4 pour commencer'),tag('Contenu à valider','gold')])+
 '<div class="panel-grid"><section class="panel"><h3>APERÇU DE LA GRILLE</h3><p>Les cases marquées « ? » sont volontairement vides : aucune mission n’est imposée sans ton accord.</p><div class="bingo-visual">'+Array.from({length:16},()=>'<div aria-label="Case à définir">?</div>').join('')+'</div></section>'+panel('🏁','RÈGLES À CHOISIR','Qu’est-ce qui valide une case ? Comment compter une ligne ? Le bingo est-il personnel ou collectif ? Nous déciderons de ces règles avant de coder le jeu définitif.')+'</div>';
}
function chest(){
 return head('CRÉATION N° 04','COFFRE MYSTÈRE','Un coffre animé qui révélera des événements. Son contenu et les probabilités seront décidés ensemble avant qu’il devienne jouable.',[tag('Bonus / surprises / défis'),tag('Contenu à valider','gold')])+
 '<div class="panel-grid"><article class="panel"><div class="chest-visual" aria-hidden="true">🎁</div><h3>LE COFFRE RESTE FERMÉ…</h3><p>Parce qu’on ne publiera pas des surprises arbitraires. On va composer sa liste ensemble et vérifier qu’aucune surprise n’impose de dépenses aux viewers.</p></article>'+panel('✦','COMMENT IL FONCTIONNERA','Ouverture animée, révélation, historique des tirages et éventuel délai entre deux coffres. Chaque surprise pourra être activée ou désactivée par l’administrateur.')+'</div>';
}
function court(){
 return head('CRÉATION N° 05','LE TRIBUNAL','L’assemblée prend la parole. Votes sur le gameplay, les choix de jeu, les défis et les décisions de la communauté — pas uniquement les fails.',[tag('Questions libres'),tag('2 à 4 réponses possibles'),tag('Votes partagés à venir','gold')])+
 '<div class="panel-grid"><article class="panel"><h3>UNE QUESTION. UN VERDICT.</h3><p>Exemple de présentation, sans vote réel pour le moment.</p><div class="vote-visual"><strong>QUEL SERA LE PROCHAIN JEU DU LIVE ?</strong><div class="vote-options"><span>FORTNITE</span><span>WARZONE</span></div></div></article>'+panel('⚖️','UN TRIBUNAL UNIVERSEL','L’administrateur rédige une question, propose plusieurs réponses et fixe une durée. Lorsque les comptes et les votes sécurisés seront prêts, chaque participant pourra voter une seule fois selon les règles choisies.')+'</div>';
}
function ranking(){
 return head('COMMUNAUTÉ','LES CLASSEMENTS','Des records et points partagés entre visiteurs. Les scores devront être contrôlés côté serveur pour que chacun joue à armes égales.',[tag('Comptes à construire','gold'),tag('Scores protégés à venir')])+
 '<section class="panel"><h3>CLASSEMENT GÉNÉRAL</h3><p>La vraie base de données n’est pas encore connectée. Aucun faux profil ni faux score n’est affiché.</p><table class="ranking-table"><thead><tr><th>RANG</th><th>PSEUDO</th><th>POINTS</th></tr></thead><tbody><tr><td colspan="3" class="empty-rank">Pas encore de classement — lancement après validation des règles et du système de comptes.</td></tr></tbody></table></section>'+
 '<div class="note">Architecture prévue : authentification sécurisée, stockage partagé et règles de calcul côté serveur sur un service à quota gratuit. Pas d’abonnement mensuel activé.</div>';
}
function setup(){
 return head('UNIVERS MA_JESTIK','MON SETUP INTERACTIF','Explore les composants de mon PC et de mon installation streaming. Des photos personnelles et des liens d’affiliation pourront compléter les fiches plus tard.',[tag('10 fiches matériel'),tag('Sans achat obligatoire')])+
 '<section class="setup-grid">'+products.map((p,i)=>'<button type="button" class="hardware-card" data-hardware="'+i+'" aria-controls="hardwareDetail" aria-expanded="false"><span class="hardware-icon" aria-hidden="true">'+p.icon+'</span><small>'+p.type+'</small><strong>'+p.name+'</strong></button>').join('')+'</section><div id="hardwareDetail" class="hardware-detail" hidden aria-live="polite"></div>'+
 '<div class="note">Les visuels de ton vrai setup seront ajoutés quand tu les choisiras. Aucun lien commercial n’est inventé.</div>';
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
const pages={accueil:home,roue:wheel,defis:challenges,bingo:bingo,coffre:chest,tribunal:court,classement:ranking,setup:setup,partenaires:partners,createur:creator};
let wheelObserver=null;
function mountWheel(){
 const frame=$('wheelFrame');if(!frame)return;
 const loading=$('wheelLoading');
 const update=()=>{
  try{
   if(!frame.contentDocument)return;
   const doc=frame.contentDocument;
   let actual=Math.max(doc.documentElement.scrollHeight,doc.body?.scrollHeight||0,720);
   frame.style.height=Math.min(4800,actual+12)+'px';
  }catch{frame.style.height='1700px';}
 };
 frame.addEventListener('load',()=>{
  loading.hidden=true;update();
  try{
   const doc=frame.contentDocument;
   if(doc && window.ResizeObserver){
    wheelObserver?.disconnect();
    wheelObserver=new ResizeObserver(update);
    wheelObserver.observe(doc.body);
   }
   frame.contentWindow.addEventListener('resize',update);
   setTimeout(update,250);
   setTimeout(update,1100);
  }catch{}
 });
}
function mountHardware(){
 const detail=$('hardwareDetail');if(!detail)return;
 document.querySelectorAll('[data-hardware]').forEach(button=>{
  button.addEventListener('click',()=>{
   const id=Number(button.dataset.hardware),item=products[id];
   if(!item)return;
   document.querySelectorAll('[data-hardware]').forEach(btn=>{btn.classList.toggle('active',btn===button);btn.setAttribute('aria-expanded',String(btn===button));});
   detail.hidden=false;
   detail.innerHTML='<small class="step-label">'+item.type+'</small><h3>'+item.name+'</h3><p>'+item.detail+'</p>';
   if(window.matchMedia('(max-width:590px)').matches)detail.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
 });
}
function closeMobile(){
 $('sidebar').classList.remove('open');
 $('sidebarShade').hidden=true;
 $('menuMobile').setAttribute('aria-expanded','false');
}
function route(){
 const raw=decodeURIComponent(location.hash.replace(/^#\/?/,'').split('?')[0]);
 const page=Object.prototype.hasOwnProperty.call(pages,raw)?raw:'accueil';
 if(wheelObserver){wheelObserver.disconnect();wheelObserver=null;}
 root.innerHTML=pages[page]();
 $('crumbName').textContent=names[page];
 document.title=(page==='accueil'?'Le QG communautaire':names[page])+' · Ma_JesTik';
 document.querySelectorAll('[data-page]').forEach(a=>{let active=a.dataset.page===page;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const group=groups[page];
 if(group){const button=document.querySelector('[data-toggle="'+group+'"]');button?.setAttribute('aria-expanded','true');}
 if(page==='roue')mountWheel();
 if(page==='setup')mountHardware();
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
const dialog=$('infoDialog');
$('loginInfo').addEventListener('click',()=>{
 $('infoTitle').textContent='Comptes en préparation';
 $('infoText').textContent='Les comptes avec pseudos, avatars et classements partagés nécessitent une authentification sécurisée et une base de données. Aucun faux système de connexion n’est proposé. Nous construirons cette fonction sur une offre gratuite, sans abonnement mensuel.';
 dialog.showModal();
});
$('closeInfo').addEventListener('click',()=>dialog.close());
$('okInfo').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
 const rect=dialog.getBoundingClientRect();
 if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
});
window.addEventListener('hashchange',route);
route();
