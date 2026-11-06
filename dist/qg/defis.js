/* Catalogue validé par Ma_JesTik : 8 premiers défis + 20 défis supplémentaires. */
export const FORTNITE_CHALLENGES = [[1,"Le survivant","Terminer dans le TOP 10 sans utiliser de véhicule.","Facile","Survie","both"],[2,"Le chasseur","Réaliser au moins 5 éliminations dans une partie.","Moyen","Combat","both"],[3,"Le pistolero","Réaliser 2 éliminations avec un pistolet dans une seule partie.","Moyen","Combat","both"],[4,"Le discret","Terminer dans le TOP 5 avec un maximum de 2 éliminations.","Moyen","Survie","both"],[5,"Le sans-coffre","Atteindre le TOP 10 sans ouvrir de coffre.","Moyen","Stratégie","both"],[6,"Le téméraire","Terminer dans le TOP 10 sans utiliser de consommable de bouclier.","Difficile","Survie","both"],[7,"L'as du combat","Gagner une partie avec au moins 8 éliminations.","Difficile","Combat","both"],[8,"La dernière chance","Réaliser une élimination avec une arme de rareté commune (grise).","Facile","Combat","both"],[9,"Premier sang","Réaliser une élimination dans les 3 premières minutes après l'atterrissage.","Moyen","Combat","both"],[10,"L'arme du destin","Réaliser une élimination avec la toute première arme ramassée.","Moyen","Combat","both"],[11,"Double menace","Réaliser une élimination avec chacun de deux types d'armes différents.","Moyen","Combat","both"],[12,"La gâchette facile","Réaliser 3 éliminations avec la même arme.","Moyen","Combat","both"],[13,"L'arsenal","Réaliser 3 éliminations avec 3 types d'armes différents.","Difficile","Combat","both"],[14,"Récupération","Éliminer un adversaire avec une arme récupérée sur un autre joueur éliminé.","Difficile","Combat","both"],[15,"Le minimaliste","Atteindre le TOP 10 en conservant une seule arme à la fois dans l'inventaire.","Moyen","Survie","both"],[16,"Sans médicament","Atteindre le TOP 10 sans utiliser d'objet restaurant les points de vie.","Moyen","Survie","both"],[17,"Le fantôme","Atteindre le TOP 3 sans réaliser d'élimination.","Difficile","Survie","both"],[18,"Sur le fil","Atteindre le TOP 5 sans avoir utilisé d'objet de soin ou de bouclier.","Difficile","Survie","both"],[19,"Le marcheur","Atteindre le TOP 10 sans utiliser le sprint tactique.","Moyen","Survie","both"],[20,"Le butin du sol","Atteindre le TOP 10 en utilisant uniquement des armes ramassées au sol.","Moyen","Stratégie","both"],[21,"L'économe","Terminer dans le TOP 5 en ayant utilisé au maximum deux objets de soin ou de bouclier.","Moyen","Stratégie","both"],[22,"Le collectionneur","Atteindre le TOP 10 avec au moins 3 armes de raretés différentes dans l'inventaire.","Facile","Stratégie","both"],[23,"L'échange obligatoire","Après chaque élimination, remplacer l'arme utilisée par une arme de l'adversaire. Réaliser 3 éliminations.","Difficile","Stratégie","both"],[24,"Le grand nettoyage","Ouvrir 10 coffres dans une même partie.","Facile","Stratégie","both"],[25,"Le garde du corps","Réanimer un coéquipier au moins une fois et terminer dans le TOP 10.","Moyen","Duo","duo"],[26,"Les inséparables","Atteindre le TOP 5 avec les deux membres du duo encore en vie.","Moyen","Duo","duo"],[27,"Sauvetage héroïque","Réinitialiser un coéquipier éliminé grâce à son reboot, puis atteindre le TOP 10.","Difficile","Duo","duo"],[28,"Le duo infernal","Réaliser au moins 8 éliminations cumulées avec ton coéquipier dans une partie.","Difficile","Duo","duo"]];

/* Tous les comptes et scores partagés viendront ensuite.
 * Dans cette V1, les données restent strictement dans le navigateur actuel.
 */
const STORE_KEY = "ma_jestik_qg_defis_fortnite_v1";
const MAX_HISTORY = 40;
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const classes = {Facile:"easy",Moyen:"medium",Difficile:"hard"};
const teams = {solo:"Solo",duo:"Duo",trio:"Trio",quatuor:"Quatuor"};
const levels = {Facile:0,Moyen:1,Difficile:2};
const initial = () => ({mode:"random",team:"solo",level:"all",category:"all",sort:"default",enabled:FORTNITE_CHALLENGES.map(x=>x[0]),active:null,queue:[],history:[],lastPreset:null,catalogOpen:false});
let data = initial();
function load(){
 try{
  const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  if(!parsed || !Array.isArray(parsed.enabled) || !Array.isArray(parsed.history) || !Array.isArray(parsed.queue)) return initial();
  const clean = initial();
  clean.mode = parsed.mode==="viewer"?"viewer":"random";
  clean.team = Object.hasOwn(teams,parsed.team)?parsed.team:"solo";
  clean.level = ["all","Facile","Moyen","Difficile"].includes(parsed.level)?parsed.level:"all";
  clean.category = ["all","Combat","Survie","Stratégie","Duo"].includes(parsed.category)?parsed.category:"all";
  clean.sort = ["default","easy","hard"].includes(parsed.sort)?parsed.sort:"default";
  clean.enabled = [...new Set(parsed.enabled.filter(n=>Number.isInteger(n)&&n>=1&&n<=28))];
  clean.history = parsed.history.slice(0,MAX_HISTORY).filter(x=>x&&typeof x.title==="string");
  clean.queue = parsed.queue.slice(0,20).filter(x=>x&&typeof x.description==="string");
  clean.active = parsed.active && typeof parsed.active.description==="string"?parsed.active:null;
  clean.lastPreset = Number.isInteger(parsed.lastPreset)?parsed.lastPreset:null;
  clean.catalogOpen = !!parsed.catalogOpen;
  return clean;
 }catch{return initial();}
}
function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify(data))}catch{}}
const eligible = x => data.enabled.includes(x[0])&&(x[5]!=="duo"||data.team==="duo")&&(data.level==="all"||x[3]===data.level);
const getSorted = items => [...items].sort((a,b)=>data.sort==="default"?a[0]-b[0]:((levels[a[3]]-levels[b[3]])*(data.sort==="easy"?1:-1))||a[0]-b[0]);
const teamSelect = () => '<label>Composition <select id="challengeTeam">'+Object.entries(teams).map(([id,label])=>'<option value="'+id+'" '+(data.team===id?"selected":"")+'>'+label+'</option>').join("")+'</select></label>';
const score=()=>({success:data.history.filter(x=>x.result==="success").length,fail:data.history.filter(x=>x.result==="failure").length,skipped:data.history.filter(x=>x.result==="skipped").length});
const badge=level=>'<span class="challenge-level '+(classes[level]||"medium")+'">'+escapeHtml(level)+'</span>';
function current(){
 if(!data.active)return '<div class="challenge-empty"><div class="challenge-symbol" aria-hidden="true">⚔️</div><h3>Aucune mission en cours</h3><p>Choisis tes filtres puis lance un défi aléatoire, ou accepte une proposition locale.</p></div>';
 const a=data.active;
 return '<div class="challenge-active"><div class="challenge-overline"><span>● MISSION EN COURS</span><span>'+escapeHtml(a.source==="viewer"?"PROPOSÉ PAR "+a.by:"TIRAGE ALÉATOIRE")+'</span></div><h3>'+escapeHtml(a.title)+'</h3><p>'+escapeHtml(a.description)+'</p><div class="challenge-meta">'+badge(a.level)+ '<span>'+escapeHtml((teams[a.team] || (a.team==="both"?"Solo / Duo":"Solo")).toUpperCase())+'</span></div><div class="challenge-result-actions"><button type="button" data-action="success" class="btn success">✓ Réussie</button><button type="button" data-action="failure" class="btn failure">✕ Ratée</button><button type="button" data-action="skipped" class="btn btn-ghost">Passer</button></div></div>';
}
function catalogue(){
 const matches=getSorted(FORTNITE_CHALLENGES.filter(x=>data.category==="all"||x[4]===data.category));
 return '<details id="challengeCatalogue" class="challenge-catalog" '+(data.catalogOpen?"open":"")+'><summary>📋 CONSULTER LES 28 DÉFIS <span>'+data.enabled.length+' activés / 28</span></summary><div class="challenge-cat-tools"><label for="challengeCategory">Catégorie</label><select id="challengeCategory"><option value="all">Toutes</option>'+["Combat","Survie","Stratégie","Duo"].map(x=>'<option value="'+x+'" '+(data.category===x?"selected":"")+'>'+x+'</option>').join("")+'</select><label for="challengeSort">Trier par</label><select id="challengeSort"><option value="default" '+(data.sort==="default"?"selected":"")+'>Numéro</option><option value="easy" '+(data.sort==="easy"?"selected":"")+'>Facile → Difficile</option><option value="hard" '+(data.sort==="hard"?"selected":"")+'>Difficile → Facile</option></select><button type="button" class="btn btn-small" data-action="enable-all">Tout activer</button><button type="button" class="btn btn-small" data-action="disable-all">Tout désactiver</button></div><div class="challenge-catalog-list">'+matches.map(x=>'<label class="challenge-catalog-row"><input type="checkbox" data-enable="'+x[0]+'" '+(data.enabled.includes(x[0])?"checked":"")+'><span class="challenge-catalog-desc"><strong>'+x[0]+'. '+escapeHtml(x[1])+'</strong><small>'+escapeHtml(x[2])+'</small></span><span class="challenge-catalog-meta">'+badge(x[3])+'<small>'+escapeHtml(x[5]==="duo"?"Duo uniquement":x[4])+'</small></span></label>').join("")+'</div></details>';
}
function queue(){
 if(!data.queue.length)return '<p class="challenge-muted">Aucune proposition en attente sur cet appareil.</p>';
 return data.queue.map(x=>'<div class="challenge-queue-item"><div><small>DE '+escapeHtml(x.by)+' · '+escapeHtml(teams[x.team]||"Mode libre")+'</small><h4>'+escapeHtml(x.title)+'</h4><p>'+escapeHtml(x.description)+'</p></div><div class="challenge-queue-actions"><button type="button" class="btn btn-gold btn-small" data-action="accept" data-id="'+x.id+'" '+(data.active?"disabled title=\"Termine la mission en cours\"":"")+'>Accepter</button><button type="button" class="btn btn-small" data-action="reject" data-id="'+x.id+'">Refuser</button></div></div>').join("");
}
function history(){
 if(!data.history.length)return '<p class="challenge-muted">Aucune mission terminée pour le moment.</p>';
 return data.history.slice(0,12).map(x=>'<div class="challenge-history-row"><span class="challenge-history-state '+escapeHtml(x.result)+'">'+(x.result==="success"?"✓":x.result==="failure"?"✕":"—")+'</span><span><strong>'+escapeHtml(x.title)+'</strong><small>'+escapeHtml(x.source==="viewer"?"Défi viewer":"Aléatoire")+' · '+escapeHtml(new Date(x.when).toLocaleDateString("fr-FR"))+'</small></span><em>'+escapeHtml(x.result==="success"?"Réussie":x.result==="failure"?"Ratée":"Passée")+'</em></div>').join("");
}
function view(message=""){
 const s=score();
 const count=FORTNITE_CHALLENGES.filter(eligible).length;
 return '<section class="challenge-ui" id="challengeUi">'+
 '<div class="challenge-stats"><div><span>DÉFIS DISPONIBLES</span><strong>'+count+'</strong></div><div><span>RÉUSSITES</span><strong>'+s.success+'</strong></div><div><span>ÉCHECS</span><strong>'+s.fail+'</strong></div><div><span>PASSÉES</span><strong>'+s.skipped+'</strong></div></div>'+
 '<div class="challenge-columns"><section class="panel challenge-main"><div class="challenge-panel-title"><h2>LE DÉFI DE L’ÉQUIPAGE</h2><span class="tag">FORTNITE ZERO BUILD</span></div>'+
 '<div class="challenge-tabs" role="group" aria-label="Mode de création du défi"><button type="button" class="'+(data.mode==="random"?"selected":"")+'" data-action="mode" data-value="random" aria-pressed="'+(data.mode==="random")+'">🎲 Aléatoire</button><button type="button" class="'+(data.mode==="viewer"?"selected":"")+'" data-action="mode" data-value="viewer" aria-pressed="'+(data.mode==="viewer")+'">👥 Proposition viewer</button></div>'+
 (data.mode==="random"?'<div class="challenge-filters">'+teamSelect()+'<label>Filtrer par difficulté <select id="challengeLevel"><option value="all">Toutes</option>'+["Facile","Moyen","Difficile"].map(x=>'<option value="'+x+'" '+(data.level===x?"selected":"")+'>'+x+'</option>').join("")+'</select></label></div><p class="challenge-muted">'+count+' défi(s) compatible(s) avec ce mode et cette difficulté.</p><button type="button" class="btn btn-gold challenge-draw" data-action="draw" '+(data.active?"disabled":"")+'>🎲 TIRER UNE MISSION</button>':
 '<form id="challengeViewerForm" class="challenge-viewer-form">'+teamSelect()+'<label>Pseudo du viewer <input name="viewer" type="text" maxlength="36" placeholder="Ex. ViewerAlpha" required></label><label>Titre du défi <input name="title" type="text" maxlength="80" placeholder="Ex. Le défi du pirate" required></label><label>Règles de la mission <textarea name="description" rows="3" maxlength="350" placeholder="Explique précisément comment réussir le défi…" required></textarea></label><button type="submit" class="btn btn-gold">Ajouter à la file de validation</button><p class="challenge-muted">Cette proposition reste sur cet appareil : elle n’est pas envoyée à Ma_JesTik ni à Twitch/Rumble.</p></form>')+
 '<div id="challengeCurrent" aria-live="polite">'+current()+'</div><div class="challenge-status" id="challengeStatus" role="status">'+escapeHtml(message)+'</div></section>'+
 '<aside class="challenge-sidebar"><section class="panel"><h3>PROPOSITIONS À VALIDER</h3><div class="challenge-queue">'+queue()+'</div></section><section class="panel"><div class="challenge-history-heading"><h3>JOURNAL DES MISSIONS</h3><button type="button" class="challenge-reset" data-action="clear-history" '+(!data.history.length?"disabled":"")+'>Effacer</button></div><div>'+history()+'</div></section></aside></div>'+
 catalogue()+'<div class="note">Version publique gratuite : résultats et propositions enregistrés <strong>uniquement dans ce navigateur</strong>. Pas encore de classement général ni de transmission automatique au streamer. Certains défis dépendent des armes et mécaniques disponibles dans la saison Fortnite.</div></section>';
}
export function challengesMarkup(){
 return '<div class="page-head"><div class="eyebrow">CRÉATION N° 02 · FORTNITE ZERO BUILD</div><h1>DÉFIS & MISSIONS</h1><p>Choisis Solo, Duo, Trio ou Quatuor, filtre par difficulté et découvre les défis disponibles. Consulte le catalogue pour les trier, ou propose ta propre mission.</p><div class="page-tags"><span class="tag">28 défis Fortnite</span><span class="tag">Solo · Duo · Trio · Quatuor</span><span class="tag gold">Enregistrement local</span></div></div><div id="challengeRoot"></div>';
}
export function mountChallenges(){
 const root=document.getElementById("challengeRoot");
 if(!root)return;
 data=load();
 let status="";
 const render=(message="")=>{root.innerHTML=view(message);const details=root.querySelector("#challengeCatalogue");details?.addEventListener("toggle",()=>{data.catalogOpen=details.open;save()})};
 render();
 root.addEventListener("click", event=>{
  const btn=event.target.closest("[data-action]");
  if(!btn||btn.disabled)return;
  const action=btn.dataset.action;
  if(action==="mode"){data.mode=btn.dataset.value==="viewer"?"viewer":"random";save();render();return;}
  if(action==="draw"){
   if(data.active){render("Termine ou passe le défi actuel avant d'en tirer un autre.");return;}
   const available=FORTNITE_CHALLENGES.filter(eligible);
   if(!available.length){render("Aucun défi ne correspond aux filtres. Active des défis ou change de difficulté.");return;}
   const alternatives=available.filter(x=>x[0]!==data.lastPreset);
   const pool=alternatives.length?alternatives:available;
   const x=pool[Math.floor(Math.random()*pool.length)];
   data.active={id:x[0],source:"random",title:x[1],description:x[2],level:x[3],team:data.team,by:"Tirage aléatoire",started:Date.now()};
   data.lastPreset=x[0];save();render();return;
  }
  if(["success","failure","skipped"].includes(action)){
   if(!data.active)return;
   const a=data.active;
   data.history.unshift({...a,result:action,when:Date.now()});
   data.history=data.history.slice(0,MAX_HISTORY);
   data.active=null;save();render(action==="success"?"Mission réussie !":action==="failure"?"Mission ratée.":"Mission passée sans modifier le score.");return;
  }
  if(action==="accept"||action==="reject"){
   const idx=data.queue.findIndex(q=>q.id===btn.dataset.id);if(idx<0)return;
   if(action==="accept"&&data.active){render("Termine le défi en cours avant d'en accepter un autre.");return;}
   const [item]=data.queue.splice(idx,1);
   if(action==="accept")data.active={...item,source:"viewer",level:"Personnalisé",started:Date.now()};
   save();render(action==="accept"?"Défi accepté : bonne chance !":"Proposition refusée.");return;
  }
  if(action==="enable-all"||action==="disable-all"){
   data.enabled=action==="enable-all"?FORTNITE_CHALLENGES.map(x=>x[0]):[];
   data.catalogOpen=true;save();render();return;
  }
  if(action==="clear-history"){
   if(!window.confirm("Effacer ton historique local des missions et remettre tes scores à zéro ?"))return;
   data.history=[];save();render("Historique effacé sur ce navigateur.");return;
  }
 });
 root.addEventListener("change",event=>{
  const el=event.target;
  if(el.id==="challengeTeam"){data.team=Object.hasOwn(teams,el.value)?el.value:"solo";save();render();}
  else if(el.id==="challengeLevel"){data.level=["Facile","Moyen","Difficile"].includes(el.value)?el.value:"all";save();render();}
  else if(el.id==="challengeSort"){data.sort=["default","easy","hard"].includes(el.value)?el.value:"default";data.catalogOpen=true;save();render();}
  else if(el.id==="challengeCategory"){data.category=["Combat","Survie","Stratégie","Duo"].includes(el.value)?el.value:"all";data.catalogOpen=true;save();render();}
  else if(el.matches("[data-enable]")){const id=Number(el.dataset.enable);data.enabled=el.checked?[...new Set([...data.enabled,id])]:data.enabled.filter(x=>x!==id);data.catalogOpen=true;save();render();}
 });
 root.addEventListener("submit",event=>{
  if(event.target.id!=="challengeViewerForm")return;
  event.preventDefault();
  const form=new FormData(event.target);
  const by=String(form.get("viewer")||"").trim().slice(0,36);
  const title=String(form.get("title")||"").trim().slice(0,80);
  const description=String(form.get("description")||"").trim().slice(0,350);
  if(!by||!title||!description){render("Renseigne le pseudo, le titre et les règles du défi.");return;}
  if(data.queue.length>=20){render("File pleine : accepte ou refuse une proposition avant d'en ajouter.");return;}
  data.queue.push({id:"q"+Date.now()+"-"+Math.floor(Math.random()*100000),title,description,by,team:data.team,level:"Personnalisé",source:"viewer"});
  save();render("Proposition ajoutée à la file locale : elle attend ta validation.");
 });
}
