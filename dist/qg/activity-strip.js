/* QG Ma_JesTik — trois statuts publics, courts et factuels pour l'accueil.
   Pas d'API secret côté navigateur. Twitch via DecAPI (cache jusqu'à ~5 min),
   Tribunal et défis via leurs Workers publics existants. */
const STATUS_API={
 twitch:'https://decapi.me/twitch/uptime/Ma_Jestikk?offline_msg=OFFLINE',
 tribunal:(document.querySelector('meta[name="majestik-tribunal-api"]')?.content||'').replace(/\/+$/,'')+'/v1/tribunal/polls',
 defis:(document.querySelector('meta[name="majestik-members-api"]')?.content||'').replace(/\/+$/,'')+'/v1/votes/current'
};
const POLL_MS=90000;
const ERROR_LABEL='Indisponible';
let interval=null,session=0,controllers=new Set(),lastRefresh=0;

function setState(name,text,state='neutral'){
 const el=document.querySelector('[data-activity-status="'+name+'"]');
 if(!el)return;
 el.textContent=text;
 el.dataset.state=state;
 const card=el.closest('.hq-activity-card');
 if(card)card.dataset.state=state;
}

function abortRequests(){
 for(const c of controllers)c.abort();
 controllers.clear();
}

async function read(url,json){
 const controller=new AbortController();
 controllers.add(controller);
 const timeout=setTimeout(()=>controller.abort(),9500);
 try{
  const response=await fetch(url,{method:'GET',mode:'cors',cache:'no-store',signal:controller.signal,headers:{Accept:json?'application/json':'text/plain'}});
  if(!response.ok)throw new Error('API HTTP '+response.status);
  const body=json?await response.json():await response.text();
  return body;
 }finally{
  clearTimeout(timeout);
  controllers.delete(controller);
 }
}

async function twitchStatus(id){
 try{
  const body=String(await read(STATUS_API.twitch,false)).trim();
  if(id!==session)return;
  if(body==='OFFLINE'){setState('twitch','Hors ligne','offline');return;}
  // Réponse attendue par DecAPI en direct : durée d'uptime (par ex. "1 hour, 2 minutes").
  if(/\b\d+\s*(?:seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?)\b/i.test(body)){
   setState('twitch','En direct','live');return;
  }
  setState('twitch',ERROR_LABEL);
 }catch{
  if(id===session)setState('twitch',ERROR_LABEL);
 }
}

async function tribunalStatus(id){
 try{
  const body=await read(STATUS_API.tribunal,true);
  if(id!==session)return;
  if(!body||!Array.isArray(body.polls))throw new Error('Réponse Tribunal invalide');
  const open=body.polls.some(p=>p&&p.closed===false);
  setState('tribunal',open?'Sondage en cours':'Aucun sondage',open?'live':'offline');
 }catch{
  if(id===session)setState('tribunal',ERROR_LABEL);
 }
}

async function challengeStatus(id){
 try{
  const body=await read(STATUS_API.defis,true);
  if(id!==session)return;
  if(!body||!Object.prototype.hasOwnProperty.call(body,'round'))throw new Error('Réponse défis invalide');
  const ongoing=body.round&&['open','locked'].includes(body.round.status);
  setState('defis',ongoing?'Défi en cours':'Aucun défi en cours',ongoing?'live':'offline');
 }catch{
  if(id===session)setState('defis',ERROR_LABEL);
 }
}

function refresh(){
 if(!document.querySelector('.hq-activity-board'))return;
 const id=session;
 lastRefresh=Date.now();
 void twitchStatus(id);
 void tribunalStatus(id);
 void challengeStatus(id);
}
function refreshOnReturn(){
 if(document.visibilityState==='hidden')return;
 if(Date.now()-lastRefresh>=25000)refresh();
}

export function unmountActivityStrip(){
 session++;
 if(interval){clearInterval(interval);interval=null;}
 abortRequests();
 document.removeEventListener('visibilitychange',refreshOnReturn);
 window.removeEventListener('focus',refreshOnReturn);
}

export function mountActivityStrip(){
 unmountActivityStrip();
 if(!document.querySelector('.hq-activity-board'))return;
 refresh();
 interval=setInterval(()=>{if(document.visibilityState!=='hidden')refresh()},POLL_MS);
 document.addEventListener('visibilitychange',refreshOnReturn);
 window.addEventListener('focus',refreshOnReturn);
}
