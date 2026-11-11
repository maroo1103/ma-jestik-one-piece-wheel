/* Missions du QG : affichage uniquement des données vérifiées dans Cloudflare D1. */
import {getQGTwitchSession} from './twitch-auth.js';
const API=(document.querySelector('meta[name="majestik-monthly-api"]')?.content||'').replace(/\/+$/,'');
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>new Intl.NumberFormat('fr-FR').format(Number(v)||0);
function currentMonth(){
 const p=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Paris',month:'2-digit',year:'numeric'}).formatToParts(new Date());
 return p.find(x=>x.type==='year').value+'-'+p.find(x=>x.type==='month').value;
}
let dispose=null;
export function unmountMonthlyMissions(){if(dispose){dispose();dispose=null;}}
export function mountMonthlyMissions(){
 unmountMonthlyMissions();
 const root=document.getElementById('mjMonthlyMission');if(!root)return;
 let active=true,loading=false,month=currentMonth(),me=null,admin=null,timer=null,lastRefresh=0;
 const REFRESH_INTERVAL_MS=60*60*1000;
 root.innerHTML='<section class="mj-mission-live" aria-label="Mission mensuelle">'+
  '<div id="mjMissionPlayer" aria-live="polite">Vérification de la mission…</div>'+
  '<p class="mj-mission-cadence">Mise à jour automatique toutes les heures</p>'+
  '<p id="mjMissionFeedback" role="status"></p><div id="mjMissionAdmin"></div></section>';
 const player=root.querySelector('#mjMissionPlayer'),owner=root.querySelector('#mjMissionAdmin'),feedback=root.querySelector('#mjMissionFeedback');
 const message=(s,error=false)=>{feedback.textContent=s;feedback.classList.toggle('error',error);};
 async function request(path,body){
  if(!/^https:\/\/[a-z0-9.-]+$/i.test(API))throw Error('Service des missions non disponible.');
  const token=getQGTwitchSession()?.token;
  const r=await fetch(API+path,{method:body?'POST':'GET',mode:'cors',cache:'no-store',
   headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},
   ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(data.error||'Service des missions momentanément indisponible.');
  return data;
 }
 const item=(title,value,target,href)=>{
  const done=Math.min(Number(value)||0,Number(target)||0),pct=target?Math.round(done*100/target):100;
  return '<div class="mj-mission-task"><div><strong>'+title+'</strong><a href="'+href+'">PARTICIPER</a></div>'+
   '<span>'+n(done)+' / '+n(target)+'</span><div class="mj-mission-track" role="progressbar" aria-valuemin="0" aria-valuemax="'+target+'" aria-valuenow="'+done+'"><i style="width:'+pct+'%"></i></div></div>';
 };
 function view(data){
  if(!data?.mission){
   player.innerHTML='<div class="mj-mission-empty"><strong>Aucune mission ouverte pour ce mois.</strong>'+
    '<p>Les objectifs seront annoncés avant le lancement. Les participations passées ne sont pas converties automatiquement en récompenses.</p></div>';
   return;
  }
  const m=data.mission;
  const top='<header class="mj-mission-heading"><div><span>'+escapeHtml(m.month)+' · '+(m.status==='closed'?'TERMINÉE':'EN COURS')+'</span>'+
   '<h3>'+escapeHtml(m.title)+'</h3><p>Termine les objectifs du mois et débloque <strong>'+n(m.bonus_coins)+' pièces Discord</strong>.</p></div></header>';
  if(!data.registered){
   player.innerHTML=top+'<div class="mj-mission-empty"><strong>Un profil QG est nécessaire.</strong><p>Connecte-toi avec Twitch et crée ton profil pour suivre tes participations.</p><a href="#/profil">MON PROFIL</a></div>';return;
  }
  const p=data.progress||{predictions:0,polls:0,complete:false,paid:false};
  const objectives=[
   Number(m.prediction_target)?item('Pronostics résolus',p.predictions,m.prediction_target,'#/defis'):'',
   Number(m.poll_target)?item('Votes dans le Tribunal',p.polls,m.poll_target,'#/tribunal'):''
  ].join('');
  const state=p.paid?'✓ Récompense enregistrée comme remise.':
   p.complete?'✓ Mission accomplie ! '+n(m.bonus_coins)+' pièces à recevoir après vérification sur Discord.':
   'Continue à participer pour obtenir ton bonus.';
  player.innerHTML=top+'<div class="mj-mission-tasks">'+objectives+'</div>'+
   '<p class="mj-mission-result'+(p.complete?' done':'')+'">'+escapeHtml(state)+'</p>'+
   '<small>Les pronostics comptent après résolution officielle ; chaque sondage ou manche ne compte qu’une fois.</small>';
 }
 function adminView(data){
  const m=data.mission,players=Array.isArray(data.players)?data.players:[],counts=data.totals||{};
  const config=!m||m.status==='draft';
  owner.innerHTML='<details class="mj-mission-owner" open><summary>ESPACE PROPRIÉTAIRE · SUIVI DES MISSIONS</summary>'+
  '<p>Les pièces sont attribuées manuellement sur Discord. Ici, tu enregistres uniquement leur remise.</p>'+
  '<form id="mjMonthSelect" class="mj-mission-form"><label>Mois à consulter<input type="month" name="month" value="'+escapeHtml(month)+'" required></label><button>AFFICHER</button></form>'+
  '<p class="mj-mission-owner-status">'+escapeHtml(month)+' · '+(m?escapeHtml(m.status.toUpperCase()):'AUCUNE MISSION')+'</p>'+
  (config?'<form id="mjMissionConfig" class="mj-mission-form">'+
   '<label>Mission<input name="title" maxlength="80" value="'+escapeHtml(m?.title||"L’Explorateur du QG")+'" required></label>'+
   '<label>Pronostics requis<input type="number" name="prediction_target" min="0" max="20" value="'+(m?.prediction_target??3)+'" required></label>'+
   '<label>Votes requis<input type="number" name="poll_target" min="0" max="20" value="'+(m?.poll_target??2)+'" required></label>'+
   '<label>Bonus (max. 50)<input type="number" name="bonus_coins" min="1" max="50" value="'+(m?.bonus_coins??50)+'" required></label>'+
   '<button>ENREGISTRER LE BROUILLON</button></form>':
   '<p>Les conditions sont verrouillées dès l’ouverture pour garantir l’équité.</p>')+
  (m?.status==='draft'&&month===currentMonth()?'<button type="button" data-mission-action="open">OUVRIR LA MISSION</button>':'')+
  (m?.status==='open'?'<button type="button" data-mission-action="close">CLÔTURER LA MISSION</button>':'')+
  (m?.opened_at?'<div class="mj-mission-owner-metrics">'+
   '<span>'+n(counts.participants)+' participants</span><span>'+n(counts.completed)+' terminées</span>'+
   '<span>'+n(counts.awaiting)+' à remettre</span><span>'+n(counts.paid)+' remises</span></div>'+
   '<div class="mj-mission-owner-table"><table><thead><tr><th>Membre</th><th>Pronostics</th><th>Votes</th><th>Statut</th><th>Action</th></tr></thead><tbody>'+
   players.map(p=>{
    const status=p.paid?'Remis':p.complete?'À remettre':'En progression';
    const action=m.status==='closed'&&p.complete&&!p.paid?
     '<button type="button" data-mission-action="award" data-id="'+escapeHtml(p.twitch_id)+'" data-name="'+escapeHtml(p.display_name)+'">MARQUER REMIS</button>':'—';
    return '<tr><td>'+escapeHtml(p.display_name)+'</td><td>'+n(p.predictions)+' / '+n(m.prediction_target)+'</td>'+
     '<td>'+n(p.polls)+' / '+n(m.poll_target)+'</td><td>'+status+'</td><td>'+action+'</td></tr>';
   }).join('')+'</tbody></table></div>':'')+
   '<small>Une mission ne s’ouvre que durant son mois (heure de Paris). Tu dois la clôturer avant de marquer les récompenses remises.</small>'+
   '</details>';
 }
 async function refresh(){
  if(!active||loading)return;
  loading=true;
  lastRefresh=Date.now();
  try{
   const session=getQGTwitchSession();
   if(!session){
    const data=await request('/v1/monthly/current');if(!active)return;
    view(data);owner.innerHTML='';
    message('Connecte-toi avec Twitch pour voir ta progression personnelle.');
   }else{
    const data=await request('/v1/monthly/me');if(!active)return;
    me=data;view(data);
    if(data.owner){admin=await request('/v1/monthly/admin?month='+encodeURIComponent(month));if(!active)return;adminView(admin);}
    else owner.innerHTML='';
    message('');
   }
  }catch(e){if(active){if(!me)player.innerHTML='<div class="mj-mission-empty"><strong>La prochaine mission du QG se prépare.</strong><p>Les objectifs et la progression personnelle seront affichés ici dès l’ouverture du service. Aucune participation n’est comptée pour le moment.</p></div>';message('Suivi automatique indisponible pour le moment : aucun résultat n’est simulé.',true);}}
  finally{loading=false;}
 }
 async function change(action,body){
  try{await request('/v1/monthly/admin/'+action,body);await refresh();}
  catch(e){message(e.message||'Action non effectuée.',true);}
 }
 const click=e=>{
  const el=e.target.closest('[data-mission-action]');if(!el||!root.contains(el))return;
  const a=el.dataset.missionAction;
  if(!me?.owner)return;
  if(a==='open'&&confirm('Ouvrir la mission de '+month+' ? Les règles seront figées.'))void change('open',{month});
  if(a==='close'&&confirm('Clôturer la mission de '+month+' ?'))void change('close',{month});
  if(a==='award'&&/^\d{1,30}$/.test(el.dataset.id||'')&&
   confirm('As-tu DÉJÀ versé '+n(admin?.mission?.bonus_coins)+' pièces à '+el.dataset.name+' sur Discord ?'))
   void change('award',{month,twitch_id:el.dataset.id,confirmed:true});
 };
 const submit=e=>{
  if(!root.contains(e.target))return;
  const form=e.target;
  if(form.id==='mjMonthSelect'){e.preventDefault();month=String(new FormData(form).get('month')||currentMonth());void refresh();}
  if(form.id==='mjMissionConfig'){
   e.preventDefault();if(!me?.owner)return;
   const v=new FormData(form);
   const body={month,title:String(v.get('title')||'').trim(),prediction_target:Number(v.get('prediction_target')),
    poll_target:Number(v.get('poll_target')),bonus_coins:Number(v.get('bonus_coins'))};
   if(confirm('Enregistrer la mission '+month+' comme brouillon ? Aucun joueur ne sera récompensé pour le moment.'))void change('configure',body);
  }
 };
 root.addEventListener('click',click);root.addEventListener('submit',submit);
 const wake=()=>{if(document.visibilityState!=='hidden'&&Date.now()-lastRefresh>=REFRESH_INTERVAL_MS)void refresh();};
 const sessionChanged=()=>{me=null;void refresh();};
 document.addEventListener('visibilitychange',wake);window.addEventListener('qg:twitch-session',sessionChanged);
 timer=setInterval(wake,REFRESH_INTERVAL_MS);
 dispose=()=>{active=false;clearInterval(timer);root.removeEventListener('click',click);root.removeEventListener('submit',submit);
  document.removeEventListener('visibilitychange',wake);window.removeEventListener('qg:twitch-session',sessionChanged);};
 void refresh();
}
