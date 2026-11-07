/* Killathon Ma_JesTik — tableau public en lecture seule.
   Le vrai compteur local ne doit jamais être accessible directement depuis Internet.
   Pour afficher de vraies données, configurer un flux PUBLIC HTTPS, sans token ni clé
   privée, via la balise meta majestik-killathon-public-feed. */
import {mountSimpleKillathon} from './killathon-simple.js?v=20261107-simple2';
const $ = id => document.getElementById(id);
const fmt = n => new Intl.NumberFormat('fr-FR').format(n);
const initial = {kills:0,goal:100,events:[],live:false};
let snapshot={...initial};
let ticker=null;
const ICONS={kill:'🎯',follow:'💜',prime:'⭐',tier1:'⭐',tier2:'👑',tier3:'💎'};
function int(v,min,max,fallback){const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):fallback;}
function safe(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function eventTime(value){const t=new Date(value);return Number.isNaN(t.getTime())?'':t.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});}
function applyPayload(json){
 if(!json||typeof json!=='object')throw new Error('Flux incorrect');
 if(!Number.isFinite(Number(json.kills))||!Number.isFinite(Number(json.goal)))throw new Error('Compteurs absents');
 const recent=typeof json.updatedAt==='string'?Date.parse(json.updatedAt):NaN;
 const live=json.live===true&&Number.isFinite(recent)&&Math.abs(Date.now()-recent)<120000;
 snapshot={
  kills:int(json.kills,0,999999,0),
  goal:int(json.goal,1,999999,100),
  events:Array.isArray(json.events)?json.events.slice(0,8).map(e=>({
   type:typeof e.type==='string'?e.type.toLowerCase():'',
   label:typeof e.label==='string'?e.label.slice(0,180):'',
   date:e.date||e.timestamp||''
  })).filter(e=>e.label):[],
  live
 };
}
function stats(){
 const left=Math.max(0,snapshot.goal-snapshot.kills);
 const percent=Math.min(100,Math.round(100*snapshot.kills/snapshot.goal));
 return '<div class="kt-summary" aria-label="Progression du Killathon">'+
 '<div><span>TES ÉLIMINATIONS</span><strong>'+fmt(snapshot.kills)+'</strong></div>'+
 '<div><span>OBJECTIF ACTUEL</span><strong>'+fmt(snapshot.goal)+'</strong></div>'+
 '<div><span>RESTANT À FAIRE</span><strong>'+fmt(left)+'</strong></div></div>'+
 '<div class="kt-progress" role="progressbar" aria-label="Progression des éliminations" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"><div style="width:'+percent+'%"></div></div>'+
 '<div class="kt-progress-caption"><span>'+percent+' % accompli</span><span>'+(left?'Cap sur les '+fmt(snapshot.goal)+' éliminations':'🏆 Objectif atteint !')+'</span></div>';
}
function boosts(){
 return '<section class="kt-block kt-boosts" aria-labelledby="kt-boost-title"><h3 id="kt-boost-title">💜 Boosts communautaires Twitch</h3>'+
 '<div class="kt-boost-list"><span>💜 <b>Follow +1</b></span><span>⭐ <b>Prime / T1 +5</b></span><span>👑 <b>T2 +10</b></span><span>💎 <b>T3 +20</b></span></div>'+
 '<p>Les boosts augmentent l’objectif global, pas le compteur de kills réalisés.</p></section>';
}
function history(){
 const html=snapshot.events.length?snapshot.events.map(e=>'<li><span class="kt-event-icon" aria-hidden="true">'+(ICONS[e.type]||'✦')+'</span><span class="kt-event-label">'+safe(e.label)+'</span><time>'+safe(eventTime(e.date))+'</time></li>').join(''):
 '<li class="kt-event-empty">Les événements du live apparaîtront ici une fois la synchronisation publique activée.</li>';
 return '<section class="kt-block kt-history" aria-labelledby="kt-history-title"><h3 id="kt-history-title">🗓️ Derniers événements</h3><ul class="kt-event-list">'+html+'</ul></section>';
}
function display(){
 const host=$('kt-app');if(!host)return;
 const badge=snapshot.live?'🟢 EN DIRECT':'◌ APERÇU';
 host.innerHTML='<section class="kt-shell"><div class="kt-top"><div><span class="kt-kicker">FORTNITE ZERO BUILD · MA_JESTIK</span>'+
 '<div class="kt-headline"><span class="kt-target" aria-hidden="true">🎯</span><div><h2>KILLATHON</h2><p>Un défi communautaire synchronisé avec Fortnite et Twitch lorsque le direct est connecté.</p></div></div></div>'+
 '<span class="kt-chip '+(snapshot.live?'is-live':'')+'">'+badge+'</span></div>'+
 stats()+boosts()+history()+'</section>';
 const nav=document.querySelector('a[data-page="killathon"] .mini-state');
 if(nav){nav.textContent=snapshot.live?'EN DIRECT':'APERÇU';nav.classList.toggle('kt-nav-live',snapshot.live);}
}
export function killathonMarkup(){
 return '<section class="kt-page-head"><h1>LE KILLATHON</h1><p>Lance ton Killathon, fixe ton objectif et affiche la progression sur ton live.</p></section>'+
 '<div id="kt-simple-app" aria-live="polite"></div>'+
 '<details class="kt-advanced-details"><summary>Découvrir le Killathon avancé Ma_JesTik</summary><div id="kt-app"></div></details>';
}
export function mountKillathon(){
 if(ticker){clearInterval(ticker);ticker=null;}
 snapshot={...initial};display();mountSimpleKillathon();
 const raw=document.querySelector('meta[name="majestik-killathon-public-feed"]')?.getAttribute('content')?.trim()||'';
 if(!raw)return;
 let url;
 try{url=new URL(raw);if(url.protocol!=='https:')return;}catch{return;}
 async function reload(){
  if(!$('kt-app')){clearInterval(ticker);ticker=null;return;}
  try{
   const response=await fetch(url.href,{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(6500)});
   if(!response.ok)throw new Error('Indisponible');
   const json=await response.json();
   applyPayload(json);
  }catch{
   snapshot={...snapshot,live:false};
  }
  display();
 }
 reload();
 ticker=setInterval(reload,20000);
}
