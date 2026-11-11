/* Missions du QG : affichage uniquement des données vérifiées dans Cloudflare D1. */
import {getQGTwitchSession} from './twitch-auth.js';
const API=(document.querySelector('meta[name="majestik-monthly-api"]')?.content||'').replace(/\/+$/,'');
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>new Intl.NumberFormat('fr-FR').format(Number(v)||0);
function currentMonth(){
 const p=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Paris',month:'2-digit',year:'numeric'}).formatToParts(new Date());
 return p.find(x=>x.type==='year').value+'-'+p.find(x=>x.type==='month').value;
}
function missionMonthLabel(value){
 if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(value))return String(value||'');
 const [year,month]=value.split('-').map(Number);
 return new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,1)));
}
function missionOpeningDate(value){
 if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(value))return String(value||'');
 const [year,month]=value.split('-').map(Number);
 return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,1)));
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
 function updateMissionArtwork(m){
  const art=document.getElementById('mjMonthlyMissionArt');
  if(!art||!active)return;
  const isOpen=m?.status==='open',isClosed=m?.status==='closed';
  art.classList.toggle('is-upcoming',!isOpen&&!isClosed);
  art.classList.toggle('is-closed',isClosed);
  art.classList.toggle('is-active',isOpen);
  if(isOpen){
   const value=Number(m.bonus_coins);
   art.innerHTML='<span>MISSION</span><strong>+'+(Number.isInteger(value)&&value>0?n(value):'?')+'</strong><span>PIÈCES</span>';
  }else if(isClosed){
   art.innerHTML='<span>MISSION</span><strong>TERMINÉE</strong><span>À BIENTÔT</span>';
  }else{
   art.innerHTML='<span>PROCHAINE</span><strong>MISSION</strong><span>À VENIR</span>';
  }
 }
 function view(data){
  updateMissionArtwork(data?.mission);
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
  const monthLabel=missionMonthLabel(month),today=currentMonth();
  const isCurrent=month===today,isFuture=month>today,isPast=month<today;
  const canEdit=(!m||m.status==='draft')&&!isPast;
  const state=m?.status==='draft'?{label:'Brouillon',className:'draft'}:
   m?.status==='open'?{label:'En cours',className:'open'}:
   m?.status==='closed'?{label:'Terminée',className:'closed'}:
   {label:'Non créée',className:'none'};
  const conditions=m?
   '<div class="mj-mission-owner-summary-grid">'+
   '<div><strong>'+n(m.prediction_target)+'</strong><span>Pronostics validés requis</span></div>'+
   '<div><strong>'+n(m.poll_target)+'</strong><span>Votes du Tribunal requis</span></div>'+
   '<div><strong>'+n(m.bonus_coins)+'</strong><span>Pièces Discord à gagner</span></div></div>':'';
  const description=m?.status==='draft'?
   '<p class="mj-mission-owner-explain"><strong>Cette mission est bien enregistrée.</strong> Elle est visible uniquement dans ton espace propriétaire : les membres ne la voient pas encore et aucune récompense n’est distribuée.</p>'+
   (isFuture?'<p class="mj-mission-owner-next">Ouverture possible à partir du <strong>'+escapeHtml(missionOpeningDate(month))+'</strong>. Tu devras la lancer toi-même : rien n’est automatique.</p>':
    isCurrent?'<p class="mj-mission-owner-next">Le mois a commencé. Tu peux ouvrir cette mission quand tu es prêt ; ses objectifs seront alors définitifs.</p>':
    '<p class="mj-mission-owner-next">Ce mois est passé : ce brouillon ne peut plus être ouvert.</p>'):
   m?.status==='open'?
   '<p class="mj-mission-owner-explain"><strong>Cette mission est visible par les membres.</strong> Les participations vérifiées sont suivies automatiquement. Les objectifs sont maintenant verrouillés.</p>':
   m?.status==='closed'?
   '<p class="mj-mission-owner-explain"><strong>Cette mission est clôturée.</strong> Les nouvelles participations ne comptent plus. Vérifie les récompenses et indique « Remis » seulement après le versement sur Discord.</p>':
   '<p class="mj-mission-owner-explain">Aucune mission n’est enregistrée pour '+escapeHtml(monthLabel)+'. '+(isPast?'Ce mois est déjà terminé.':'Tu peux en préparer une ici, sans la publier.')+'</p>';
  const card=m?
   '<section class="mj-mission-owner-card" aria-label="Résumé de la mission '+escapeHtml(monthLabel)+'">'+
   '<div class="mj-mission-owner-card-head"><div><span class="mj-mission-owner-kicker">MISSION DE '+escapeHtml(monthLabel.toLocaleUpperCase('fr-FR'))+'</span>'+
   '<h3>'+escapeHtml(m.title)+'</h3></div>'+
   '<span class="mj-mission-owner-badge is-'+state.className+'">'+state.label+'</span></div>'+
   conditions+description+
   (m.status==='draft'&&isCurrent?
    '<div class="mj-mission-owner-launch"><button type="button" data-mission-action="open" class="mj-mission-owner-primary">OUVRIR LA MISSION</button>'+
    '<small>Cette action la rend visible aux membres et bloque les modifications. Tu ne pourras plus revenir en brouillon.</small></div>':'')+
   (m.status==='open'?
    '<div class="mj-mission-owner-launch"><button type="button" data-mission-action="close">CLÔTURER LA MISSION</button>'+
    '<small>Arrête définitivement le comptage des nouvelles participations. Cette action ne verse aucune pièce.</small></div>':'')+
   '</section>':
   '<div class="mj-mission-owner-card is-empty"><div class="mj-mission-owner-card-head"><div><span class="mj-mission-owner-kicker">'+escapeHtml(monthLabel.toLocaleUpperCase('fr-FR'))+'</span>'+
   '<h3>Aucune mission préparée</h3></div><span class="mj-mission-owner-badge is-none">À créer</span></div>'+description+'</div>';
  const editor=canEdit?
   '<details class="mj-mission-owner-editor"'+(m?'':' open')+'>'+
   '<summary>'+(m?'MODIFIER LES OBJECTIFS':'CRÉER UNE MISSION POUR '+escapeHtml(monthLabel.toLocaleUpperCase('fr-FR')))+'</summary>'+
   '<p class="mj-mission-owner-edit-help">Renseigne les objectifs puis sauvegarde. La mission restera en <strong>brouillon</strong> tant que tu ne l’auras pas ouverte.</p>'+
   '<form id="mjMissionConfig" class="mj-mission-form mj-mission-owner-edit-form">'+
   '<label>Nom de la mission<input name="title" maxlength="80" value="'+escapeHtml(m?.title||"L’Explorateur du QG")+'" required></label>'+
   '<label>Pronostics requis<input type="number" name="prediction_target" min="0" max="20" value="'+Number(m?.prediction_target??3)+'" required></label>'+
   '<label>Votes du Tribunal requis<input type="number" name="poll_target" min="0" max="20" value="'+Number(m?.poll_target??2)+'" required></label>'+
   '<label>Récompense en pièces<input type="number" name="bonus_coins" min="1" max="50" value="'+Number(m?.bonus_coins??50)+'" required></label>'+
   '<button type="submit" class="mj-mission-owner-primary">'+(m?'SAUVEGARDER LES MODIFICATIONS':'SAUVEGARDER LA MISSION')+'</button></form></details>':'';
  const totals=m?.opened_at?
   '<div class="mj-mission-owner-results"><h3>SUIVI DES PARTICIPANTS</h3><p>Progression réelle calculée à partir des pronostics et votes enregistrés dans le QG.</p>'+
   '<div class="mj-mission-owner-metrics">'+
   '<span><strong>'+n(counts.participants)+'</strong> participants</span>'+
   '<span><strong>'+n(counts.completed)+'</strong> missions terminées</span>'+
   '<span><strong>'+n(counts.awaiting)+'</strong> récompenses à remettre</span>'+
   '<span><strong>'+n(counts.paid)+'</strong> récompenses remises</span></div>'+
   '<div class="mj-mission-owner-table"><table><thead><tr><th>Membre</th><th>Pronostics</th><th>Votes</th><th>Statut</th><th>Action</th></tr></thead><tbody>'+
   players.map(p=>{
    const status=p.paid?'Remis':p.complete?'À remettre':'En progression';
    const action=m.status==='closed'&&p.complete&&!p.paid?
     '<button type="button" data-mission-action="award" data-id="'+escapeHtml(p.twitch_id)+'" data-name="'+escapeHtml(p.display_name)+'">MARQUER REMIS</button>':'—';
    return '<tr><td>'+escapeHtml(p.display_name)+'</td><td>'+n(p.predictions)+' / '+n(m.prediction_target)+'</td>'+
     '<td>'+n(p.polls)+' / '+n(m.poll_target)+'</td><td>'+status+'</td><td>'+action+'</td></tr>';
   }).join('')+'</tbody></table></div>'+
   (!players.length?'<p class="mj-mission-owner-no-players">Pas encore de participation vérifiée pour cette mission.</p>':'')+
   '<small>Les pièces sont remises manuellement sur Discord. « Marquer remis » sert uniquement à enregistrer ce que tu as déjà versé.</small></div>':'';
  owner.innerHTML='<details class="mj-mission-owner" open><summary>MON ESPACE PROPRIÉTAIRE · GÉRER LES MISSIONS</summary>'+
   '<p class="mj-mission-owner-intro">Cet espace est réservé à ton compte Twitch. Tu peux préparer les prochaines missions ici sans les rendre publiques.</p>'+
   '<form id="mjMonthSelect" class="mj-mission-month-picker">'+
   '<label>Quel mois veux-tu gérer ?<input type="month" name="month" value="'+escapeHtml(month)+'" required></label>'+
   '<button type="submit">VOIR CE MOIS</button></form>'+
   card+editor+totals+'</details>';
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
  }catch(e){if(active){if(!me)player.innerHTML='<div class="mj-mission-empty"><strong>La prochaine mission du QG se prépare.</strong><p>Les objectifs et la progression personnelle seront affichés ici dès l’ouverture du service. Aucune participation n’est comptée pour le moment.</p></div>';message(e?.message?.startsWith('Trop de requêtes')?e.message:'Suivi automatique indisponible pour le moment : aucun résultat n’est simulé.',true);}}
  finally{loading=false;}
 }
 async function change(action,body){
  try{await request('/v1/monthly/admin/'+action,body);await refresh();
   if(action==='configure')message('Mission sauvegardée ! Elle est en brouillon, uniquement visible par toi.');
   else if(action==='open')message('Mission ouverte : elle est désormais visible par les membres.');
   else if(action==='close')message('Mission clôturée : les nouvelles participations ne comptent plus.');
   else if(action==='award')message('Remise enregistrée dans le suivi (aucun versement automatique sur Discord).');
  }
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
   if(confirm('Sauvegarder la mission pour '+missionMonthLabel(month)+' ? Elle restera en brouillon, invisible aux membres, tant que tu ne l’auras pas ouverte.'))void change('configure',body);
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
