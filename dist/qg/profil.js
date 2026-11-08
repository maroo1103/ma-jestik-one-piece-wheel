/* Ma_JesTik · Profil communautaire premium (Twitch + D1, repli local explicite).
   Aucun score, badge ou avantage n'est attribué depuis le navigateur. */
import {getQGTwitchSession} from "./twitch-auth.js";

const API=(document.querySelector('meta[name="majestik-members-api"]')?.content||"").replace(/\/$/,"");
const games=[
 {id:"fortnite",name:"Fortnite",image:"../qg/media/fortnite-runners.jpg",subtitle:"Battle Royale"},
 {id:"warzone",name:"Call of Duty: Warzone",appid:1962663,subtitle:"FPS"},
 {id:"rocket-league",name:"Rocket League",appid:252950,subtitle:"Sport automobile"},
 {id:"apex-legends",name:"Apex Legends",appid:1172470,subtitle:"Battle Royale"},
 {id:"cyberpunk-2077",name:"Cyberpunk 2077",appid:1091500,subtitle:"RPG"},
 {id:"elden-ring",name:"Elden Ring",appid:1245620,subtitle:"Action RPG"},
 {id:"god-of-war",name:"God of War",appid:1593500,subtitle:"Aventure"},
 {id:"horizon-zero-dawn",name:"Horizon Zero Dawn",appid:1151640,subtitle:"Aventure"},
 {id:"the-witcher-3",name:"The Witcher 3",appid:292030,subtitle:"RPG"},
 {id:"the-last-of-us",name:"The Last of Us Part I",appid:1888930,subtitle:"Narratif"},
 {id:"gta-v",name:"Grand Theft Auto V",appid:271590,subtitle:"Monde ouvert"},
 {id:"resident-evil-4",name:"Resident Evil 4",appid:2050650,subtitle:"Survival horror"}
];
const lookup=new Map(games.map(g=>[g.id,g]));
const defaults=()=>({display_name:"",bio:"",banner:"champagne",accent:"or",games:[],primary_game:"",public_profile:false,instagram:"",tiktok:"",discord:""});
const $=id=>document.getElementById(id);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>n===null||n===undefined?"—":new Intl.NumberFormat("fr-FR").format(n);
const date=x=>{const d=new Date(x);return !x||Number.isNaN(d.getTime())?"—":d.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});};
const avatar=x=>{try{const u=new URL(x);return u.protocol==="https:"&&u.hostname==="static-cdn.jtvnw.net"?u.href:"";}catch{return "";}};
const localKey=id=>"mj-qg-profile-draft-v1-"+id;
function readDraft(id){try{const d=JSON.parse(localStorage.getItem(localKey(id))||"null");return d&&typeof d==="object"?d:null;}catch{return null;}}
function saveDraft(id,profile){try{localStorage.setItem(localKey(id),JSON.stringify(profile));return true;}catch{return false;}}
function removeDraft(id){try{localStorage.removeItem(localKey(id));}catch{}}
function sanitize(data){
 const p={...defaults(),...(data||{})};
 return {
  display_name:String(p.display_name||"").slice(0,32),
  bio:String(p.bio||"").slice(0,180),
  banner:["champagne","carbone","violet"].includes(p.banner)?p.banner:"champagne",
  accent:["or","violet","bleu"].includes(p.accent)?p.accent:"or",
  games:Array.isArray(p.games)?[...new Set(p.games.filter(g=>lookup.has(g)))].slice(0,4):[],
  primary_game:String(p.primary_game||""),
  public_profile:p.public_profile===true,
  instagram:String(p.instagram||"").slice(0,30),
  tiktok:String(p.tiktok||"").slice(0,24),
  discord:String(p.discord||"").slice(0,40)
 };
}
async function request(method,path,token,payload){
 if(!API)throw Error("API absente");
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),10000);
 try{
  const r=await fetch(API+path,{method,mode:"cors",credentials:"omit",cache:"no-store",
   referrerPolicy:"no-referrer",headers:{"Authorization":token?"Bearer "+token:"",...(payload?{"Content-Type":"application/json"}:{})},
   body:payload?JSON.stringify(payload):undefined,signal:ctrl.signal});
  const data=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(data.error||"API indisponible");e.status=r.status;throw e;}
  return data;
 }finally{clearTimeout(timer);}
}
function cover(id){const g=lookup.get(id);return g?(g.image||("https://cdn.cloudflare.steamstatic.com/steam/apps/"+g.appid+"/header.jpg")):"";}
function gameCard(id,primary,preview=false){
 const g=lookup.get(id);
 if(!g)return "";
 return '<article class="mp-game-card'+(id===primary?' mp-game-primary':'')+'">'+
  '<div class="mp-game-image"><img src="'+esc(cover(id))+'" alt="Visuel de '+esc(g.name)+'" loading="lazy" referrerpolicy="no-referrer">'+
  (id===primary&&!preview?'<span class="mp-game-label">★ PRINCIPAL</span>':'')+'</div>'+
  '<div class="mp-game-copy"><strong>'+esc(g.name)+'</strong><small>'+esc(g.subtitle)+'</small></div>'+
 '</article>';
}
function statCard(icon,label,value){return '<div class="mp-stat"><span aria-hidden="true">'+icon+'</span><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong></div>';}
function socials(profile,name){
 let entries=[["Twitch","https://www.twitch.tv/"+encodeURIComponent(name),"Twitch"]];
 if(profile.instagram)entries.push(["Instagram","https://www.instagram.com/"+encodeURIComponent(profile.instagram)+"/","Instagram"]);
 if(profile.tiktok)entries.push(["TikTok","https://www.tiktok.com/@"+encodeURIComponent(profile.tiktok),"TikTok"]);
 const items=entries.map(([label,url])=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+' <span aria-hidden="true">↗</span></a>');
 if(profile.discord)items.push('<span>Discord : '+esc(profile.discord)+'</span>');
 return items.join("");
}
function view(state){
 const root=$("mjProfileRoot");if(!root)return;
 const p=state.profile,ident=state.identity,stats=state.stats,server=state.online;
 const display=p.display_name||ident.name||"Membre Twitch";
 const pic=avatar(ident.avatar),ava=pic?'<img src="'+esc(pic)+'" alt="Avatar Twitch de '+esc(ident.name)+'" referrerpolicy="no-referrer">':'<span aria-hidden="true">MJ</span>';
 const picked=p.games;
 const cards=picked.length?picked.map(g=>gameCard(g,p.primary_game)).join(""):[gameCard("fortnite","",true),gameCard("warzone","",true),gameCard("rocket-league","",true)].join("");
 root.innerHTML=
 '<section class="mp-banner mp-banner-'+esc(p.banner)+' mp-accent-'+esc(p.accent)+'">'+
  '<div class="mp-banner-crown" aria-hidden="true">✦</div>'+
  '<div class="mp-banner-identity"><div class="mp-avatar">'+ava+'<span class="mp-twitch-mark" aria-hidden="true">T</span></div>'+
   '<div><span class="mp-kicker">MON ESPACE COMMUNAUTAIRE</span><h2>'+esc(display)+'</h2>'+
    '<span class="mp-member-badge">✦ MEMBRE DU QG</span><small>Compte lié à Twitch : '+esc(ident.name)+'</small></div></div>'+
  '<div class="mp-banner-actions"><button type="button" id="mpEditBtn" class="mp-gold-button">✎ Modifier mon profil</button></div>'+
 '</section>'+
 '<div class="mp-status'+(server?' mp-online':'')+'" role="status">'+
 (server?'✓ Profil synchronisé avec Cloudflare : tes changements seront disponibles sur tes appareils.':'◌ Mode aperçu local : les modifications ne sont pas encore partagées. Activation Cloudflare nécessaire.')+
 '</div>'+
 '<div class="mp-grid">'+
  '<div class="mp-column">'+
   '<section class="mp-panel"><h3>♙ PRÉSENTATION</h3><p class="mp-bio">'+(p.bio?esc(p.bio):'<span class="mp-muted">Aucune présentation pour le moment. Ajoute quelques mots sur toi !</span>')+'</p></section>'+
   '<section class="mp-panel"><h3>♧ MES LIENS</h3><div class="mp-links">'+socials(p,ident.name||"")+'</div></section>'+
   '<section class="mp-panel mp-privacy"><h3>◉ VISIBILITÉ</h3><p>'+((server&&p.public_profile)?'Ton profil peut être consulté par les autres membres.':'Ton profil n’est pas publié pour les autres visiteurs.')+'</p>'+
    (server&&p.public_profile?'<button class="mp-outline-button" id="mpShareBtn" type="button">Copier le lien public ↗</button>':'<small>Le classement Twitch dispose de son propre réglage de visibilité.</small>')+
   '</section>'+
  '</div>'+
  '<div class="mp-column">'+
   '<section class="mp-panel mp-stats"><h3>◈ STATISTIQUES DU QG</h3><div class="mp-stat-grid">'+
    statCard("★","POINTS QG",fmt(stats?.points))+
    statCard("♛","CLASSEMENT",stats?.rank?"#"+fmt(stats.rank):"—")+
    statCard("✓","VOTES",fmt(stats?.votes))+
    statCard("▣","MEMBRE DEPUIS",date(stats?.joined_at))+
   '</div><small>Seules les données réellement enregistrées dans le QG sont affichées.</small></section>'+
   '<section class="mp-panel mp-games"><div class="mp-panel-heading"><h3>♧ MES JEUX</h3><button type="button" id="mpGamesEdit" class="mp-outline-button">+ Personnaliser</button></div>'+
    (!picked.length?'<p class="mp-games-notice">Exemples du catalogue : sélectionne tes jeux favoris pour personnaliser cette section.</p>':'')+
    '<div class="mp-game-grid">'+cards+'</div></section>'+
  '</div>'+
 '</div>'+
 '<section class="mp-panel mp-editor" id="mpEditor" hidden><div class="mp-panel-heading"><h3>✎ PERSONNALISER MON PROFIL</h3><button type="button" class="mp-outline-button" id="mpCancelEdit">Fermer</button></div>'+
  '<form id="mpForm">'+
   '<div class="mp-form-grid">'+
    '<label>Pseudo affiché dans le QG <input name="display_name" maxlength="32" value="'+esc(p.display_name)+'" placeholder="'+esc(ident.name)+'"></label>'+
    '<label class="mp-form-full">Ma présentation <textarea name="bio" maxlength="180" rows="3" placeholder="Parle de ton univers gaming, de tes jeux, de tes passions…">'+esc(p.bio)+'</textarea><small>180 caractères maximum</small></label>'+
   '</div>'+
   '<fieldset><legend>Bannière de profil</legend><div class="mp-choice-row">'+
    ["champagne","carbone","violet"].map(k=>'<label class="mp-banner-option mp-banner-'+k+'"><input type="radio" name="banner" value="'+k+'"'+(p.banner===k?' checked':'')+'><span>'+({champagne:"Champagne",carbone:"Carbone",violet:"Violet"}[k])+'</span></label>').join("")+
   '</div></fieldset>'+
   '<fieldset><legend>Couleur d’accent</legend><div class="mp-choice-row mp-colors">'+
    ["or","violet","bleu"].map(k=>'<label><input type="radio" name="accent" value="'+k+'"'+(p.accent===k?' checked':'')+'><span class="mp-color-'+k+'">'+({or:"Or",violet:"Violet",bleu:"Bleu"}[k])+'</span></label>').join("")+
   '</div></fieldset>'+
   '<fieldset><legend>Mes jeux préférés <small>(4 maximum)</small></legend><div class="mp-game-picker">'+
    games.map(g=>'<button type="button" class="mp-picker-tile'+(picked.includes(g.id)?' is-selected':'')+'" data-mp-game="'+g.id+'" aria-pressed="'+picked.includes(g.id)+'">'+
      '<img src="'+esc(cover(g.id))+'" alt="" loading="lazy" referrerpolicy="no-referrer"><span>'+esc(g.name)+'</span></button>').join("")+
   '</div><label class="mp-primary-select">Jeu principal <select name="primary_game" id="mpPrimaryGame"></select></label></fieldset>'+
   '<div class="mp-form-grid"><label>Instagram (pseudo facultatif) <input name="instagram" maxlength="30" value="'+esc(p.instagram)+'" placeholder="mon_pseudo"></label>'+
   '<label>TikTok (pseudo facultatif) <input name="tiktok" maxlength="24" value="'+esc(p.tiktok)+'" placeholder="mon_pseudo"></label>'+
   '<label class="mp-form-full">Discord (pseudo facultatif) <input name="discord" maxlength="40" value="'+esc(p.discord)+'" placeholder="mon_pseudo"></label></div>'+
   '<label class="mp-public-toggle"><input name="public_profile" type="checkbox"'+(p.public_profile?' checked':'')+'><span><strong>Rendre mon profil public</strong><small>Les autres visiteurs pourront voir ta bio, tes jeux et tes liens. Ce réglage ne modifie pas la visibilité dans le classement.</small></span></label>'+
   '<div class="mp-save-row"><button class="mp-gold-button" type="submit">✓ '+(server?"Enregistrer mon profil":"Enregistrer l’aperçu sur cet appareil")+'</button>'+
    '<span id="mpSaveStatus" role="status"></span></div>'+
  '</form>'+
 '</section>';
 root.querySelectorAll(".mp-game-image img,.mp-picker-tile img").forEach(img=>img.addEventListener("error",()=>{img.style.opacity="0";}));
 const open=()=>{const editor=$("mpEditor");editor.hidden=false;editor.scrollIntoView({behavior:"smooth",block:"start"});};
 $("mpEditBtn").addEventListener("click",open);
 $("mpGamesEdit").addEventListener("click",open);
 $("mpCancelEdit").addEventListener("click",()=>{$("mpEditor").hidden=true;});
 if($("mpShareBtn"))$("mpShareBtn").addEventListener("click",async()=>{
  const link=location.origin+location.pathname+"#/membre?id="+encodeURIComponent(ident.id);
  try{await navigator.clipboard.writeText(link);$("mpShareBtn").textContent="✓ Lien copié";}catch{$("mpShareBtn").textContent=link;}
 });
 let chosen=new Set(p.games);
 const primary=$("mpPrimaryGame");
 function refreshPicker(){
  root.querySelectorAll("[data-mp-game]").forEach(b=>{const on=chosen.has(b.dataset.mpGame);b.classList.toggle("is-selected",on);b.setAttribute("aria-pressed",String(on));});
  const previous=primary.value||p.primary_game;
  primary.replaceChildren(new Option("Aucun jeu principal",""));
  chosen.forEach(k=>primary.add(new Option(lookup.get(k)?.name||k,k)));
  primary.value=chosen.has(previous)?previous:"";
 }
 refreshPicker();
 root.querySelectorAll("[data-mp-game]").forEach(b=>b.addEventListener("click",()=>{
  const id=b.dataset.mpGame;
  if(chosen.has(id))chosen.delete(id);
  else if(chosen.size<4)chosen.add(id);
  else{$("mpSaveStatus").textContent="Tu peux choisir jusqu’à quatre jeux.";return;}
  $("mpSaveStatus").textContent="";
  refreshPicker();
 }));
 $("mpForm").addEventListener("submit",async event=>{
  event.preventDefault();
  const f=event.currentTarget,e=f.elements;
  const payload={display_name:e.namedItem("display_name").value.trim(),bio:e.namedItem("bio").value.trim(),
   banner:e.namedItem("banner").value,accent:e.namedItem("accent").value,
   games:[...chosen],primary_game:e.namedItem("primary_game").value,public_profile:e.namedItem("public_profile").checked,
   instagram:e.namedItem("instagram").value.trim().replace(/^@/,""),tiktok:e.namedItem("tiktok").value.trim().replace(/^@/,""),discord:e.namedItem("discord").value.trim()};
  if(payload.display_name.length>32||payload.bio.length>180||!/^[A-Za-z0-9._]{0,30}$/.test(payload.instagram)||!/^[A-Za-z0-9._]{0,24}$/.test(payload.tiktok)){
   $("mpSaveStatus").textContent="Vérifie les pseudos des réseaux sociaux.";return;
  }
  const button=f.querySelector('button[type="submit"]');button.disabled=true;$("mpSaveStatus").textContent="Enregistrement…";
  try{
   if(state.online){
    const saved=await request("PATCH","/v1/profiles/me",state.token,payload);
    state.profile=sanitize(saved.profile);state.stats=saved.stats||state.stats;removeDraft(ident.id);
   }else{
    if(!saveDraft(ident.id,payload))throw Error("Stockage local indisponible.");
    state.profile=sanitize(payload);
   }
   if(root.isConnected){view(state);const status=root.querySelector(".mp-status");status.textContent=state.online?"✓ Profil enregistré sur Cloudflare.":"✓ Aperçu enregistré sur cet appareil uniquement. Pas encore visible par les autres.";}
  }catch(error){$("mpSaveStatus").textContent="Impossible d’enregistrer : "+(error.status?"erreur "+error.status:"vérifie ta connexion et réessaie.");button.disabled=false;}
 });
}
export function profileMarkup(){return '<div class="mp-page"><div class="page-head"><div class="eyebrow">UNIVERS MA_JESTIK</div><h1>MON PROFIL</h1><p>Personnalise ton espace gaming et retrouve tes véritables statistiques communautaires.</p></div><div id="mjProfileRoot" aria-live="polite"><p class="mp-loading">Chargement du profil…</p></div></div>';}
export async function mountProfile(){
 const root=$("mjProfileRoot");if(!root)return;
 const me=getQGTwitchSession();
 if(!me){root.innerHTML='<div class="mp-panel mp-empty"><h2>Bienvenue dans ton espace membre</h2><p>Connecte-toi avec Twitch pour retrouver ton identité et personnaliser ton profil.</p><button type="button" class="mp-gold-button" id="mpConnect">Se connecter avec Twitch</button></div>';
  $("mpConnect").addEventListener("click",()=>document.querySelector("#qgTwitchAccount .qg-login")?.click());return;}
 const id=me.id,token=me.token;
 let info=null,online=false,registered=false,profile=null,stats=null;
 const identity={id,name:me.name||"Membre Twitch",avatar:me.avatar||""};
 const r=await Promise.allSettled([request("GET","/v1/me",token),request("GET","/v1/profiles/me",token)]);
 if(!root.isConnected||getQGTwitchSession()?.id!==id)return;
 if(r[0].status==="fulfilled"){info=r[0].value.member||null;registered=!!info;}
 if(r[1].status==="fulfilled"){
  online=true;registered=r[1].value.registered===true;
  profile=sanitize(r[1].value.profile);stats=r[1].value.stats||null;
  identity.name=r[1].value.identity?.name||identity.name;identity.avatar=r[1].value.identity?.avatar||identity.avatar;
 }else{
  profile=sanitize(readDraft(id));stats=info?{points:null,rank:null,votes:null,joined_at:info.joined_at}:null;
 }
 const state={token,identity,profile,stats,online,registered};
 if(!registered){
  root.innerHTML='<div class="mp-panel mp-empty"><h2>Active ton profil communautaire</h2><p>Pour participer aux statistiques du QG et enregistrer un profil en ligne, crée d’abord ton profil Twitch dans notre base.</p>'+
   '<button type="button" class="mp-gold-button" id="mpActivate">Créer mon profil QG</button>'+
   '<p class="mp-muted">Aucun mot de passe supplémentaire : ton identité reste vérifiée par Twitch.</p><span id="mpActivationStatus" role="status"></span></div>';
  $("mpActivate").addEventListener("click",async()=>{const btn=$("mpActivate");btn.disabled=true;$("mpActivationStatus").textContent="Création…";
   try{await request("POST","/v1/me",token);if(root.isConnected)void mountProfile();}
   catch{btn.disabled=false;$("mpActivationStatus").textContent="Impossible de créer le profil pour le moment.";}}
  );return;
 }
 view(state);
}
export function publicProfileMarkup(){return '<div class="mp-page"><div class="page-head"><div class="eyebrow">COMMUNAUTÉ MA_JESTIK</div><h1>PROFIL MEMBRE</h1><p>Présentation et jeux favoris d’un membre de la communauté.</p></div><div id="mjPublicProfileRoot"><p class="mp-loading">Chargement…</p></div></div>';}
export async function mountPublicProfile(){
 const root=$("mjPublicProfileRoot");if(!root)return;
 const id=new URLSearchParams(location.hash.split("?")[1]||"").get("id")||"";
 if(!/^[0-9]{1,30}$/.test(id)){root.innerHTML='<div class="mp-panel">Lien de profil invalide.</div>';return;}
 try{
  const data=await request("GET","/v1/profiles/"+id,"");
  if(!root.isConnected)return;
  const p=sanitize(data.profile),identity=data.identity||{},pic=avatar(identity.avatar);
  root.innerHTML='<section class="mp-banner mp-banner-'+esc(p.banner)+' mp-accent-'+esc(p.accent)+'"><div class="mp-banner-identity"><div class="mp-avatar">'+(pic?'<img src="'+esc(pic)+'" alt="Avatar Twitch">':'MJ')+'</div><div><span class="mp-kicker">PROFIL PUBLIC DU QG</span><h2>'+esc(p.display_name||identity.name||"Membre Twitch")+'</h2><span class="mp-member-badge">✦ MEMBRE DU QG</span></div></div></section>'+
   '<div class="mp-grid"><section class="mp-panel"><h3>PRÉSENTATION</h3><p class="mp-bio">'+esc(p.bio||"Ce membre n’a pas encore renseigné sa biographie.")+'</p><div class="mp-links">'+socials(p,identity.name||"")+'</div></section>'+
   '<section class="mp-panel"><h3>MES JEUX</h3><div class="mp-game-grid">'+(p.games.length?p.games.map(g=>gameCard(g,p.primary_game)).join(""):'<p>Aucun jeu favori renseigné.</p>')+'</div></section></div>';
  root.querySelectorAll(".mp-game-image img").forEach(img=>img.addEventListener("error",()=>{img.style.opacity="0";}));
 }catch{root.innerHTML='<div class="mp-panel mp-empty"><h2>Profil indisponible</h2><p>Ce profil est privé, inexistant ou la fonctionnalité n’est pas encore activée sur Cloudflare.</p><a href="#/accueil" class="mp-gold-button">Retour au QG</a></div>';}
}
window.addEventListener("qg:twitch-session",()=>{if($("mjProfileRoot"))void mountProfile();});
window.addEventListener("qg:member-updated",()=>{if($("mjProfileRoot"))void mountProfile();});
