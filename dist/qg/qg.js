import {challengesMarkup,mountChallenges} from './defis.js?v=20261108-copyrefresh1';
import {mountActivityStrip,unmountActivityStrip} from './activity-strip.js?v=20261108-activity2';
import {mountTwitchAuth} from './twitch-auth.js';
import {helpMarkup,mountHelp} from './aide.js?v=20261109-about1';
import {contactMarkup,mountContact} from './contact.js?v=20261110-privacy1';
import {privacyMarkup,mountPrivacy} from './confidentialite.js?v=20261110-privacy1';
import {profileMarkup,mountProfile,publicProfileMarkup,mountPublicProfile} from './profil.js?v=20261108-profilsettings1';
import {killathonMarkup,mountKillathon} from './killathon.js?v=20261108-auth-sync1';
import {tribunalMarkup,mountTribunal,unmountTribunal} from './tribunal.js?v=20261108-copyrefresh1';
import {publicTribunalMarkup,mountPublicTribunal,unmountPublicTribunal,tribunalPublicEnabled} from './tribunal-public.js?v=20261108-copyrefresh1';
const $ = (id) => document.getElementById(id);
const root = $('page');
const votesEnabled=document.querySelector('meta[name="majestik-votes-enabled"]')?.content==='true';
const voteApi=(document.querySelector('meta[name="majestik-members-api"]')?.content||'').replace(/\/$/,'');
const names = {accueil:'Accueil',roue:'La roue',defis:'Défis & missions',killathon:'Killathon',tribunal:'Tribunal communautaire',classement:'Classements',setup:'Mon setup interactif',partenaires:'À propos du QG',apropos:'À propos du QG',createur:'Code créateur',profil:'Mon profil',membre:'Profil membre',aide:'Centre d’aide',contact:'Nous contacter',confidentialite:'Politique de confidentialité'};
const modules = [
{path:'roue',icon:'🎡',title:'La roue',desc:'Un outil interactif pour laisser le hasard choisir. De nouvelles utilisations pourront être ajoutées progressivement.',ready:true},
{path:'defis',icon:'⚔️',title:'Défis & missions',desc:'118 défis Fortnite Zero Build validés : Solo, Duo, Trio, Quatuor et filtres par difficulté.',ready:true},
{path:'killathon',icon:'🎯',title:'Killathon Ma_JesTik',desc:'Compteur personnel, objectif et affichage OBS pour chaque streamer. Prêt à utiliser.',ready:true},
{path:'tribunal',icon:'⚖️',title:'Tribunal communautaire',desc:'Propose des questions, vote avec Twitch et découvre les résultats partagés.',ready:tribunalPublicEnabled},
{path:'classement',icon:'🏆',title:'Classements',desc:'Des tableaux partagés liés aux comptes et aux activités, sans faux résultats.',ready:votesEnabled}
];
const groups = {accueil:null,roue:'outils',defis:'outils',killathon:'outils',tribunal:'communaute',classement:'communaute',setup:'univers',partenaires:'univers',apropos:'univers',createur:'univers',profil:null,membre:null,aide:null,contact:null,confidentialite:null};
const tag=(s,kind='')=>'<span class="tag '+kind+'">'+s+'</span>';
const head=(eyebrow,title,description,tags=[])=>'<div class="page-head"><div class="eyebrow">'+eyebrow+'</div><h1>'+title+'</h1>'+(description?'<p>'+description+'</p>':'')+(tags.length?'<div class="page-tags">'+tags.join('')+'</div>':'')+'</div>';
const panel=(icon,title,body)=>'<article class="panel placeholder-card"><div><div class="big-symbol" aria-hidden="true">'+icon+'</div><h3>'+title+'</h3><p>'+body+'</p></div><div class="step-label">À DÉFINIR ENSEMBLE</div></article>';
function home(){
 const paths=[
  {path:'roue',overline:'01 / LE HASARD',title:'LA ROUE',summary:'Un tirage, une décision : laisse le hasard choisir.',image:'roue',name:'Explorer la roue',featured:true},
  {path:'tribunal',overline:'02 / LA COMMUNAUTÉ',title:'LE TRIBUNAL',summary:'Des questions, des propositions et des votes qui comptent vraiment.',image:'tribunal',name:'Entrer au Tribunal',featured:true},
  {path:'defis',overline:'03 / RELEVER LE DÉFI',title:'DÉFIS & MISSIONS',summary:'118 défis Zero Build à tenter en solo ou avec ton équipe.',image:'defis',name:'Découvrir les défis'},
  {path:'killathon',overline:'04 / LE COMPTEUR',title:'KILLATHON',summary:'Fixe ton objectif et compte tes éliminations en direct.',image:'killathon',name:'Lancer le Killathon'},
  {path:'classement',overline:'05 / LES SCORES',title:'CLASSEMENTS',summary:'Retrouve les points et les performances de la communauté.',image:'classement',name:'Voir les classements'}
 ];
 const cards=paths.map(p=>'<a class="hq-portal '+(p.featured?'hq-portal-featured ':'')+'hq-portal-'+p.path+'" href="#/'+p.path+'">'+
  '<span class="hq-portal-art"><img src="/og/'+p.image+'.webp?v=20261109-artworks2'+'" alt="" loading="lazy" decoding="async"></span>'+
  '<span class="hq-portal-content"><span class="hq-portal-overline">'+p.overline+'</span>'+
  '<span class="hq-portal-title">'+p.title+'</span>'+
  '<span class="hq-portal-summary">'+p.summary+'</span>'+
  '<span class="hq-portal-cta">'+p.name+' <span aria-hidden="true">↗</span></span></span></a>').join('');
 return '<div class="hq-home">'+
  '<section class="hq-hero" aria-labelledby="hqHeroTitle">'+
   '<div class="hq-hero-scene" aria-hidden="true"></div>'+
   '<div class="hq-hero-glow" aria-hidden="true"></div>'+
   '<div class="hq-hero-content">'+

    '<h1 id="hqHeroTitle">BIENVENUE<br><span>DANS LE QG</span><br><span>DE MA_JESTIK.</span></h1>'+
    '<p class="hq-hero-lead">Fais tourner la roue, relève 118 défis Zero Build et participe aux votes du Tribunal.</p>'+
    '<div class="hq-hero-buttons">'+
     '<button class="hq-hero-primary" type="button" data-scroll="hq-explorer">DÉCOUVRIR LE QG <span aria-hidden="true">↗</span></button>'+

    '</div>'+
   '</div>'+

   '<div class="hq-hero-bottom hq-activity-board" aria-label="Activité actuelle du QG">'+
    '<div class="hq-activity-heading"><span aria-hidden="true">✦</span> EN CE MOMENT AU QG</div>'+
    '<div class="hq-activity-cards">'+
     '<a class="hq-activity-card hq-activity-twitch" data-state="neutral" href="https://www.twitch.tv/Ma_Jestikk" target="_blank" rel="noopener noreferrer" aria-label="Voir le statut du direct Twitch de Ma_JesTik">'+
      '<span class="hq-activity-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M2.149 0 .537 4.345v17.391h5.91V24H9.67l3.223-3.218h4.835L24 14.524V0H2.149Zm19.702 13.441-3.762 3.762H12.18l-3.224 3.216v-3.216H4.127V2.149H21.85v11.292Zm-5.91-6.991h2.149v6.443h-2.149V6.45Zm-5.912 0h2.149v6.443h-2.149V6.45Z"/></svg></span>'+
      '<span class="hq-activity-copy"><strong>TWITCH</strong><span class="hq-activity-status" data-activity-status="twitch" data-state="neutral" role="status" aria-live="polite">Vérification…</span></span>'+
      '<span class="hq-activity-arrow" aria-hidden="true">↗</span>'+
     '</a>'+
     '<a class="hq-activity-card hq-activity-tribunal" data-state="neutral" href="#/tribunal" aria-label="Ouvrir le Tribunal et consulter les sondages">'+
      '<span class="hq-activity-symbol" aria-hidden="true">⚖</span>'+
      '<span class="hq-activity-copy"><strong>TRIBUNAL</strong><span class="hq-activity-status" data-activity-status="tribunal" data-state="neutral" role="status" aria-live="polite">Vérification…</span></span>'+
      '<span class="hq-activity-arrow" aria-hidden="true">↗</span>'+
     '</a>'+
     '<a class="hq-activity-card hq-activity-defis" data-state="neutral" href="#/defis" aria-label="Ouvrir les défis et missions de Ma_JesTik">'+
      '<span class="hq-activity-symbol" aria-hidden="true">⚔</span>'+
      '<span class="hq-activity-copy"><strong>DÉFIS</strong><span class="hq-activity-status" data-activity-status="defis" data-state="neutral" role="status" aria-live="polite">Vérification…</span></span>'+
      '<span class="hq-activity-arrow" aria-hidden="true">↗</span>'+
     '</a>'+
    '</div>'+
   '</div>'+
  '</section>'+
  '<section class="hq-intro" aria-label="La philosophie du QG">'+
   '<p class="hq-section-overline"><span aria-hidden="true">✦</span> PLUS QU’UN SIMPLE SITE GAMING</p>'+
   '<h2><span class="hq-quote-mark">“</span> LES VICTOIRES PASSENT. LES VALEURS RESTENT. <span class="hq-quote-mark">”</span></h2>'+
   '<p>Entre deux lives, le QG reste ouvert : retrouve nos expériences, propose tes idées et participe à la vie de la communauté.</p>'+

  '</section>'+
  '<section class="hq-explorer" id="hq-explorer" aria-labelledby="hqExploreTitle">'+
   '<div class="hq-section-head"><div><p class="hq-section-overline"><span aria-hidden="true">✦</span> LES EXPÉRIENCES DU QG</p><h2 id="hqExploreTitle">CHOISIS TON AVENTURE<span>.</span></h2></div>'+
   '</div>'+
   '<div class="hq-portal-grid">'+cards+'</div>'+
  '</section>'+
  '<section class="hq-setup-showcase" aria-labelledby="hqSetupTitle">'+
   '<div class="hq-setup-copy">'+
    '<p class="hq-section-overline"><span aria-hidden="true">✦</span> DANS LES COULISSES</p>'+
    '<h2 id="hqSetupTitle">DÉCOUVRE MON <em>SETUP GAMING.</em></h2>'+
    '<p>Une configuration pensée pour jouer, streamer et profiter des plus beaux univers. Entre dans les coulisses et explore mon matériel.</p>'+
    ''+
    '<a class="hq-setup-cta" href="#/setup">EXPLORER MON SETUP <span aria-hidden="true">↗</span></a>'+
   '</div>'+
   '<div class="hq-setup-art">'+
    '<img class="hq-setup-illustration" src="media/setup-icon-premium.svg?v=20261108-icon1" alt="Illustration de la tour PC Ma_JesTik en bleu nuit, cyan, violet et or" loading="lazy" decoding="async" width="900" height="900">'+
   '</div>'+
  '</section>'+
  '<section class="hq-endnote"><span class="hq-endnote-line"></span><span>MA_JESTIK</span><strong>À TRÈS VITE DANS LE QG.</strong><span class="hq-endnote-line"></span></section>'+
 '</div>';
}
function wheel(){
 return head('OUTILS GAMING','LA ROUE','Un tirage, une décision ! Lance la roue et laisse le hasard choisir.')+
 '<div class="wheel-area"><div class="loading" id="wheelLoading">Chargement de la roue…</div><iframe class="wheel-embed" id="wheelFrame" title="La roue interactive Ma_JesTik" src="../roue.html?v=20261109-roue2" loading="eager" allow="fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
}
function challenges(){return challengesMarkup();}
function court(){return tribunalMarkup();}
function ranking(){
 if(votesEnabled)return head('COMMUNAUTÉ','CLASSEMENT DE LA COMMUNAUTÉ','',[tag('+1 · Réussite prédite'),tag('+2 · Échec prédit')])+
 '<section class="qg-rankings"><div class="qg-podium-title"><span aria-hidden="true">🏆</span><h2>TOP 3 DE LA COMMUNAUTÉ</h2></div>'+
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
 const roles=['En tête du classement','Deuxième place','Troisième place'];
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
 '<div class="wheel-area setup-area"><iframe class="setup-embed" id="setupFrame" src="setup-original/index.html?v=20261109-ergosolid1" title="Setup interactif original de Ma_JesTik avec photo et composants cliquables" loading="eager" scrolling="no"></iframe></div>';
}

function about(){
 return head('UNIVERS MA_JESTIK','À PROPOS DU QG',
  'Un lieu pour partager ma passion du gaming, retrouver les outils du QG et vivre les animations de la communauté.',
  [tag('Projet personnel','gold'),tag('Accès gratuit')])+
 '<section class="mj-about-intro" aria-label="Présentation du QG">'+
  '<div><span class="mj-about-n">L’ESPRIT DU PROJET</span><h2>LE GAMING, <em>À NOTRE FAÇON.</em></h2></div>'+
  '<div class="mj-about-intro-text"><p>Le QG réunit au même endroit les outils, les défis et les petites animations qui rendent les parties plus vivantes.</p>'+
  '<p>Le projet évolue au fil des idées et des retours. Tu peux explorer les espaces librement, puis participer à ton rythme.</p></div>'+
 '</section>'+
 '<section class="mj-about-grid" aria-label="Les fondations du QG">'+
  '<article class="mj-about-card"><span class="mj-about-n">01 / LE PROJET</span><h2>UN PROJET PERSONNEL</h2><p>Un site indépendant créé par passion pour les jeux vidéo, le streaming et les échanges entre joueurs.</p></article>'+
  '<article class="mj-about-card"><span class="mj-about-n">02 / LES OUTILS</span><h2>JOUER AUTREMENT</h2><p>Une roue interactive, des défis, des votes et des animations qui donnent de nouvelles idées de parties.</p></article>'+
  '<article class="mj-about-card"><span class="mj-about-n">03 / LA COMMUNAUTÉ</span><h2>CHACUN SA PLACE</h2><p>Explore le site sans compte. La connexion Twitch donne accès aux fonctions communautaires et aux réglages du profil.</p></article>'+
 '</section>'+
 "\n<section class=\"mj-about-person\" aria-labelledby=\"mjAboutPersonTitle\">\n  <div class=\"mj-about-person-copy\">\n    <span class=\"mj-about-n\">04 / DERRIÈRE LE PSEUDO</span>\n    <h2 id=\"mjAboutPersonTitle\">MOI, C’EST <em>MA_JESTIK.</em></h2>\n    <p>Je suis avant tout un passionné de jeux vidéo. J’aime autant les FPS et les Battle Royale que les parties en coopération, le multijoueur et les grandes aventures narratives qui te plongent dans une histoire.</p>\n    <p>Je joue sur PC et sur console, je partage aussi mes sessions en live, et j’adore tout ce qui touche au hardware. Comprendre comment les choses fonctionnent, essayer, ajuster, recommencer : c’est aussi ce qui me plaît dans la création du QG.</p>\n    <p>Je ne cherche pas à faire quelque chose de parfait du premier coup. Ce qui m’intéresse, c’est de construire un endroit qui me ressemble et de l’améliorer au fil des idées.</p>\n  </div>\n  <aside class=\"mj-about-signature\" aria-label=\"Ce qui me définit\">\n    <div class=\"mj-about-signature-mark\" aria-hidden=\"true\">MJ<span>✦</span></div>\n    <span class=\"mj-about-n\">EN QUELQUES MOTS</span>\n    <p>Un joueur curieux qui a du mal à laisser une idée dormir : <strong>je préfère l’essayer, l’améliorer et lui donner vie.</strong></p>\n    <div class=\"mj-about-signature-tags\" aria-label=\"Mes univers\"><span>GAMING</span><span>STREAMING</span><span>HARDWARE</span><span>CRÉATIVITÉ</span></div>\n  </aside>\n</section>\n\n<section class=\"mj-about-origin\" aria-labelledby=\"mjAboutOriginTitle\">\n  <header class=\"mj-about-story-head\">\n    <span class=\"mj-about-n\">05 / COMMENT TOUT A COMMENCÉ</span>\n    <h2 id=\"mjAboutOriginTitle\">UNE ROUE. <em>PUIS UN QG.</em></h2>\n    <p>À la base, je voulais simplement créer une roue pour mes parties. Un petit outil pratique, juste pour ajouter une touche de hasard et de fun. Puis une idée en a entraîné une autre : pourquoi ne pas construire un site entier autour de cet univers ?</p>\n    <p>Le QG a pris forme petit à petit, à mesure que de nouveaux outils et de nouvelles envies venaient s’ajouter au projet. Pas de formule magique : de la curiosité, des essais, quelques ajustements… et l’envie de continuer.</p>\n  </header>\n  <ol class=\"mj-about-story-steps\" aria-label=\"Les grandes étapes du projet\">\n    <li><span class=\"mj-about-story-num\">01</span><div><strong>L’IDÉE</strong><p>Une roue interactive pour changer le cours de mes parties.</p></div></li>\n    <li><span class=\"mj-about-story-num\">02</span><div><strong>L’ENVIE D’ALLER PLUS LOIN</strong><p>Regrouper davantage d’outils et d’animations au même endroit.</p></div></li>\n    <li><span class=\"mj-about-story-num\">03</span><div><strong>LE QG</strong><p>Un site personnel qui grandit avec la communauté et les idées.</p></div></li>\n  </ol>\n</section>\n\n<section class=\"mj-about-values\" aria-labelledby=\"mjAboutValuesTitle\">\n  <div class=\"mj-about-values-intro\">\n    <span class=\"mj-about-n\">06 / L’ESPRIT MA_JESTIK</span>\n    <h2 id=\"mjAboutValuesTitle\">DU FUN, DU PARTAGE. <em>ET DU RESPECT.</em></h2>\n    <p>J’aime la compétition et les défis, mais pas au détriment de l’ambiance. Le QG doit rester un endroit où l’on peut plaisanter, se dépasser et passer un bon moment sans se prendre la tête.</p>\n    <div class=\"mj-about-values-line\" aria-hidden=\"true\">✦ &nbsp; NOOB &amp; LEGENDS &nbsp; ✦</div>\n  </div>\n  <div class=\"mj-about-values-list\">\n    <div><span>01</span><div><strong>LE RESPECT D’ABORD</strong><p>On peut être en désaccord, perdre une partie ou tryhard : la bienveillance reste la base.</p></div></div>\n    <div><span>02</span><div><strong>L’HUMOUR SANS PRESSION</strong><p>De la bonne humeur, du second degré et la liberté de participer à son rythme.</p></div></div>\n    <div><span>03</span><div><strong>L’ESPRIT D’ÉQUIPE</strong><p>S’entraider, partager ses idées et laisser une place aux joueurs de tous niveaux.</p></div></div>\n    <div><span>04</span><div><strong>LA CRÉATIVITÉ</strong><p>Tester des idées originales, faire évoluer les outils et ne pas avoir peur de recommencer.</p></div></div>\n  </div>\n</section>\n\n<section class=\"mj-about-future\" aria-labelledby=\"mjAboutFutureTitle\">\n  <header class=\"mj-about-future-head\">\n    <div>\n      <span class=\"mj-about-n\">07 / ET MAINTENANT ?</span>\n      <h2 id=\"mjAboutFutureTitle\">LE QG N’A PAS <em>FINI D’ÉVOLUER.</em></h2>\n    </div>\n    <p>Je garde toujours de nouvelles pistes en tête. Rien n’est annoncé tant que ce n’est pas prêt : je préfère une nouveauté qui fonctionne à dix promesses qui prennent la poussière.</p>\n  </header>\n  <div class=\"mj-about-future-areas\" aria-label=\"Les directions envisagées\">\n    <div><span class=\"mj-about-future-index\">01 / JOUER</span><h3>PLUS DE JEUX, PLUS D’IDÉES</h3><p>Faire évoluer la roue vers d’autres jeux, imaginer de nouveaux défis et créer des outils gaming.</p></div>\n    <div><span class=\"mj-about-future-index\">02 / PARTAGER</span><h3>UNE COMMUNAUTÉ PLUS VIVANTE</h3><p>Développer les interactions, les profils et les classements, en lien avec les lives Twitch et Rumble.</p></div>\n    <div><span class=\"mj-about-future-index\">03 / AMÉLIORER</span><h3>UN QG PLUS AGRÉABLE</h3><p>Peaufiner le design, la navigation et le confort d’utilisation, notamment sur mobile.</p></div>\n  </div>\n  <p class=\"mj-about-future-promise\"><span aria-hidden=\"true\">✦</span> Les prochaines nouveautés seront présentées quand elles seront réellement prêtes.</p>\n</section>\n"+
 '<section class="mj-about-bottom" aria-labelledby="mjAboutQuestionTitle"><div>'+
  '<span class="mj-about-n">LE QG ÉVOLUE AVEC VOUS</span><h2 id="mjAboutQuestionTitle">UNE QUESTION, UNE IDÉE ?</h2>'+
  '<p>Un problème technique, une suggestion ou un projet à proposer ? Retrouve-nous sur la page de contact.</p>'+
  '</div><div class="mj-about-actions"><a class="btn btn-gold" href="#/aide">Consulter la FAQ</a>'+
  '<a class="btn btn-ghost mj-about-email" href="#/contact" aria-label="Ouvrir le formulaire de contact : contact@ma-jestik.fr">✉ contact@ma-jestik.fr</a></div></section>';
}
function creator(){
 return head('UNIVERS MA_JESTIK','CODE CRÉATEUR','')+
 '<section class="creator-showcase" aria-labelledby="creatorCardTitle">'+
  '<div class="creator-card">'+
   '<div class="creator-card-top"><span>BOUTIQUE FORTNITE</span><span class="creator-card-star" aria-hidden="true">✦</span></div>'+
   '<p class="creator-card-lead">Soutiens Ma_JesTik directement dans la boutique Fortnite.</p>'+
   '<div class="creator-card-main">'+
    '<span class="creator-emblem" aria-hidden="true">★</span>'+
    '<span class="creator-status">À VENIR</span>'+
    '<h2 id="creatorCardTitle">LE CODE MA_JESTIK</h2>'+
    '<p>Je ne dispose pas encore d’un code créateur Epic Games. S’il m’est attribué, tu pourras le retrouver ici et le copier en un clic.</p>'+
   '</div>'+
   '<div class="creator-card-foot"><span aria-hidden="true">✧</span><span>Aucun code disponible pour le moment</span></div>'+
  '</div>'+
 '</section>';
}
const pages={accueil:home,roue:wheel,defis:challenges,killathon:killathonMarkup,tribunal:tribunalPublicEnabled?publicTribunalMarkup:court,classement:ranking,setup:setup,partenaires:about,apropos:about,createur:creator,profil:profileMarkup,membre:publicProfileMarkup,aide:helpMarkup,contact:contactMarkup,confidentialite:privacyMarkup};
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
 unmountActivityStrip();
 unmountTribunal();
 unmountPublicTribunal();
 if(rankingTimer){clearInterval(rankingTimer);rankingTimer=null;}
 const raw=decodeURIComponent(location.hash.replace(/^#\/?/,'').split('?')[0]);
 const page=Object.prototype.hasOwnProperty.call(pages,raw)?raw:'accueil';
 if(wheelObserver){wheelObserver.disconnect();wheelObserver=null;}
 if(setupObserver){setupObserver.disconnect();setupObserver=null;}
 root.innerHTML=pages[page]();
 document.body.classList.toggle('qg-home-active',page==='accueil');
 document.title=(page==='accueil'?'Le QG communautaire':names[page])+' · Ma_JesTik';
 document.querySelectorAll('[data-page]').forEach(a=>{let active=a.dataset.page===page;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const group=groups[page];
 document.querySelectorAll('[data-toggle]').forEach(button=>{
  button.classList.toggle('has-active',button.dataset.toggle===group);
  button.setAttribute('aria-expanded','false');
 });
 if(page==='accueil')mountActivityStrip();
 if(page==='roue')mountWheel();
 if(page==='setup')mountSetup();
  if(page==='profil')void mountProfile();
   if(page==='aide')mountHelp();
  if(page==='contact')mountContact();
  if(page==='confidentialite')mountPrivacy();
  if(page==='membre')void mountPublicProfile();
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
// Les liens de partage possèdent des métadonnées propres, sans fragment #.
document.addEventListener('click',e=>{
 const jump=e.target.closest('[data-scroll]');
 if(jump){const id=jump.dataset.scroll;document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
 if(!e.target.closest('.site-navigation'))document.querySelectorAll('[data-toggle]').forEach(b=>b.setAttribute('aria-expanded','false'));
});
// Un seul menu déroulant ouvert à la fois sur ordinateur et sur mobile.
document.querySelectorAll('[data-toggle]').forEach(toggle=>toggle.addEventListener('click',()=>{
 const isOpen=toggle.getAttribute('aria-expanded')==='true';
 document.querySelectorAll('[data-toggle]').forEach(other=>other.setAttribute('aria-expanded','false'));
 toggle.setAttribute('aria-expanded',String(!isOpen));
}));
$('menuMobile').addEventListener('click',()=>{
 const open=!$('sidebar').classList.contains('open');
 $('sidebar').classList.toggle('open',open);$('sidebarShade').hidden=!open;$('menuMobile').setAttribute('aria-expanded',String(open));
});
$('sidebarShade').addEventListener('click',closeMobile);
window.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('[data-toggle]').forEach(b=>b.setAttribute('aria-expanded','false'));closeMobile();}});
window.addEventListener('hashchange',route);
// La déconnexion Twitch doit aussi retirer immédiatement le profil privé affiché.
window.addEventListener('qg:twitch-session',()=>{
 const view=document.getElementById('mjProfileRoot');
 // Si F5 est encore en cours, mountProfile attend déjà la restauration Twitch.
 if(view&&!view.querySelector('.mp-loading'))void mountProfile();
});
window.addEventListener('focus',()=>{
 if(location.hash.startsWith('#/classement')&&votesEnabled)void mountRankings();
});
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='visible'&&location.hash.startsWith('#/classement')&&votesEnabled)void mountRankings();
});
mountTwitchAuth(); // Le module nettoie immédiatement une URL de retour OAuth.
route();
