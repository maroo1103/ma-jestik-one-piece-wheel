/* Killathon Ma_JesTik — simulation publique indépendante, aucune donnée partagée. */
const KEY='majestik.killathon.demo.v1';
const DEFAULT={kills:0,goal:100,base:100,active:false,events:[],revision:0};
let data=load();
function load(){try{const a=JSON.parse(localStorage.getItem(KEY));if(!a||typeof a!=='object')return {...DEFAULT};return {...DEFAULT,kills:clamp(a.kills,0,999999),goal:clamp(a.goal,1,999999),base:clamp(a.base,1,999999),active:!!a.active,events:Array.isArray(a.events)?a.events.slice(0,12):[],revision:clamp(a.revision,0,999999)};}catch{return {...DEFAULT};}}
function clamp(v,min,max){v=Number(v);return Number.isFinite(v)?Math.max(min,Math.min(max,Math.trunc(v))):min;}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function update(label,fn){const before=JSON.stringify(data);fn();if(JSON.stringify(data)===before)return;data.events.unshift({date:new Date().toISOString(),label});data.events=data.events.slice(0,12);data.revision++;try{localStorage.setItem(KEY,JSON.stringify(data));}catch{alert("Impossible de sauvegarder ce compteur dans ce navigateur.");}draw();}
function progress(){return Math.min(100,Math.round(data.kills/Math.max(data.goal,1)*100));}
function stats(){return '<div class="kt-summary"><div><span>TES ÉLIMINATIONS</span><strong>'+data.kills+'</strong></div><div><span>OBJECTIF ACTUEL</span><strong>'+data.goal+'</strong></div><div><span>RESTANT À FAIRE</span><strong>'+Math.max(0,data.goal-data.kills)+'</strong></div></div><div class="kt-progress"><div style="width:'+progress()+'%"></div></div><div class="kt-progress-caption"><span>'+progress()+' % accompli</span><span>'+((data.kills>=data.goal)?'🏆 Objectif atteint !':'Cap sur les '+data.goal+' éliminations')+'</span></div>';}
function buttons(){return '<section class="kt-block"><div class="kt-subheading"><h3>🎮 Tes éliminations</h3><span>Mode manuel pour la démo</span></div><div class="kt-actions"><button type="button" data-kt="kill">🎯 +1 kill</button><button type="button" data-kt="minus">−1 correction</button><button type="button" data-kt="kills5">+5 kills (test)</button></div><p>Seuls TES kills comptent. Ceux de tes coéquipiers ne sont jamais ajoutés automatiquement dans ce module.</p></section><section class="kt-block"><div class="kt-subheading"><h3>👥 Événements du live</h3><span>Augmentent l’objectif, pas les kills réalisés</span></div><div class="kt-actions"><button type="button" data-kt="follow">👤 Follow +1</button><button type="button" data-kt="prime">⭐ Prime / T1 +5</button><button type="button" data-kt="tier2">🥈 T2 +10</button><button type="button" data-kt="tier3">🥇 T3 +20</button></div><p>Ces boutons simulent les événements. La réception automatique Twitch/Rumble n’est pas encore raccordée.</p></section>';}
function options(){return '<section class="kt-block"><h3>⚙️ Réglages</h3><div class="kt-settings"><label>Objectif initial <input id="kt-goal" type="number" min="1" max="999999" step="1" value="'+data.base+'"></label><button type="button" data-kt="setgoal">Appliquer un nouvel objectif</button><button type="button" data-kt="reset">Remettre le compteur à zéro</button></div><p>Les valeurs sont enregistrées uniquement dans ce navigateur, pas dans les comptes des viewers ni dans OBS.</p></section>';}
function history(){return '<section class="kt-block"><h3>📜 Historique local</h3>'+(data.events.length?'<ul class="kt-log">'+data.events.map(item=>'<li><span>'+esc(item.label)+'</span><time>'+new Date(item.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+'</time></li>').join('')+'</ul>':'<p>Aucune action pour le moment. Lance un test ci-dessus.</p>')+'</section>';}
function markup(){return '<div class="kt-shell"><div class="kt-top"><div><span class="kt-kicker">FORTNITE ZERO BUILD · MA_JESTIK</span><h2>🎯 KILLATHON</h2><p>Un objectif de kills qui peut augmenter avec ta communauté.</p></div><span class="kt-chip">VERSION TEST · LOCALE</span></div>'+stats()+'<div class="kt-columns"><div>'+buttons()+'</div><div>'+options()+history()+'</div></div><div class="kt-disclaimer"><strong>Ce qui marche :</strong> calculs, paliers, corrections, historique et sauvegarde locale. <strong>Ce qui reste à connecter :</strong> détection Fortnite via un composant PC autorisé, événements Twitch/Rumble et overlay OBS synchronisé. Ce démonstrateur ne contrôle pas ton stream.</div></div>';}
let host=null;
function draw(){if(host?.isConnected)host.innerHTML=markup();}
export function killathonMarkup(){return '<section class="page-head"><div class="eyebrow">CRÉATION N° 03 · SYSTÈME COMMUNAUTAIRE</div><h1>LE KILLATHON</h1><p>Chaque élimination te rapproche de ton objectif. Les follows et abonnements peuvent augmenter la barre à atteindre. Cette première version est un simulateur personnel, pas encore un outil automatique.</p><div class="page-tags"><span class="tag">100 kills au départ</span><span class="tag">Tes kills uniquement</span><span class="tag gold">Automatisation en préparation</span></div></section><div id="kt-app"></div>';}
export function mountKillathon(){
 host=document.getElementById('kt-app');if(!host)return;data=load();
 host.addEventListener('click',e=>{
 const b=e.target.closest('button[data-kt]');if(!b||!host.contains(b))return;
 const x=b.dataset.kt;
 if(x==='kill')update('+1 élimination personnelle',()=>data.kills++);
 if(x==='minus')update('Correction : −1 kill',()=>data.kills=Math.max(0,data.kills-1));
 if(x==='kills5')update('Simulation : +5 éliminations',()=>data.kills+=5);
 if(x==='follow')update('Follow : objectif +1',()=>data.goal+=1);
 if(x==='prime')update('Prime / T1 : objectif +5',()=>data.goal+=5);
 if(x==='tier2')update('T2 : objectif +10',()=>data.goal+=10);
 if(x==='tier3')update('T3 : objectif +20',()=>data.goal+=20);
 if(x==='setgoal'){const n=clamp(host.querySelector('#kt-goal').value,1,999999);update('Nouvel objectif initial : '+n,()=>{data.base=n;data.goal=n;});}
 if(x==='reset'&&window.confirm('Réinitialiser les kills, l’objectif et l’historique de cette démo locale ?')){data={...DEFAULT};try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}draw();}
 });
 draw();
}
