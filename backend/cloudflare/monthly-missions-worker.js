/* Ma_JesTik — missions mensuelles, Worker indépendant des profils, du Tribunal et du Killathon.
   Progression = preuves serveur D1, jamais des clics locaux. Attribution Discord manuelle seulement.
   Pas de missions ouvertes automatiquement : le propriétaire configure et ouvre une saison. */
const ORIGIN='https://ma-jestik.fr';
const MAX_BONUS=50;
function reply(value,status=200,origin=null){
 const headers=new Headers({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'});
 if(origin){headers.set('Access-Control-Allow-Origin',origin);headers.set('Access-Control-Allow-Methods','GET,POST,OPTIONS');headers.set('Access-Control-Allow-Headers','Authorization,Content-Type');}
 return new Response(JSON.stringify(value),{status,headers});
}
function validMonth(value){return /^20\d{2}-(0[1-9]|1[0-2])$/.test(String(value||''));}
export function monthParis(date=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit'}).formatToParts(date);
 const year=parts.find(x=>x.type==='year')?.value,month=parts.find(x=>x.type==='month')?.value;
 return year+'-'+month;
}
function parisOffset(date){
 const label=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Paris',timeZoneName:'shortOffset'}).formatToParts(date).find(x=>x.type==='timeZoneName')?.value||'';
 const match=/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(label);
 if(!match)throw Error('Time zone Europe/Paris unavailable');
 return (match[1]==='+'?1:-1)*(Number(match[2])*3600+Number(match[3]||0)*60);
}
export function monthBounds(month){
 if(!validMonth(month))throw Error('Invalid month');
 const year=Number(month.slice(0,4)),index=Number(month.slice(5,7))-1;
 const boundary=i=>{
  const utc=Date.UTC(year,i,1);
  return Math.floor(utc/1000)-parisOffset(new Date(utc+12*3600*1000));
 };
 return {start:boundary(index),end:boundary(index+1)};
}
function missionPublic(m){
 return m?{month:m.month,title:m.title,status:m.status,prediction_target:Number(m.prediction_target),poll_target:Number(m.poll_target),bonus_coins:Number(m.bonus_coins),opened_at:m.opened_at,closed_at:m.closed_at}:null;
}
function times(m){
 const month=monthBounds(m.month),since=Math.max(month.start,Number(m.opened_at||month.start));
 const until=Math.min(month.end,Number(m.closed_at||Math.floor(Date.now()/1000)));
 return {since,until:Math.max(since,until)};
}
async function missionFor(db,month){return await db.prepare('SELECT month,title,status,prediction_target,poll_target,bonus_coins,opened_at,closed_at FROM monthly_missions WHERE month=?').bind(month).first();}
async function twitchIdentity(req,env){
 const header=req.headers.get('Authorization')||'';
 if(!/^Bearer [A-Za-z0-9_-]{12,500}$/.test(header))return null;
 const valid=await fetch('https://id.twitch.tv/oauth2/validate',{headers:{Authorization:'OAuth '+header.slice(7)},signal:AbortSignal.timeout(8000)});
 if(!valid.ok)return null;
 const data=await valid.json();
 if(String(data.client_id)!==String(env.TWITCH_CLIENT_ID)||!/^[0-9]{1,30}$/.test(String(data.user_id||''))||Number(data.expires_in)<60)return null;
 return {id:String(data.user_id),owner:String(data.user_id)===String(env.OWNER_TWITCH_ID)};
}
async function parseBody(req){
 if(!(req.headers.get('Content-Type')||'').startsWith('application/json'))return null;
 if(Number(req.headers.get('Content-Length')||0)>2500)return null;
 const raw=await req.text();if(raw.length>2500)return null;
 try{const obj=JSON.parse(raw);return obj&&!Array.isArray(obj)&&typeof obj==='object'?obj:null;}catch{return null;}
}
async function memberExists(db,id){return !!await db.prepare('SELECT twitch_id FROM members WHERE twitch_id=?').bind(id).first();}
async function progress(db,id,m){
 const {since,until}=times(m);
 const pred=await db.prepare("SELECT COUNT(*) AS n FROM vote_ballots b JOIN vote_rounds r ON r.id=b.round_id WHERE b.twitch_id=? AND r.status='resolved' AND b.created_at>=? AND b.created_at<?").bind(id,since,until).first();
 const poll=await db.prepare('SELECT COUNT(*) AS n FROM tribunal_votes v JOIN tribunal_polls p ON p.id=v.poll_id WHERE v.twitch_id=? AND v.created_at>=? AND v.created_at<?').bind(id,since,until).first();
 const predictions=Number(pred?.n||0),polls=Number(poll?.n||0);
 const complete=predictions>=Number(m.prediction_target)&&polls>=Number(m.poll_target);
 const award=await db.prepare('SELECT paid_at,coins FROM monthly_awards WHERE month=? AND twitch_id=?').bind(m.month,id).first();
 return {predictions,polls,complete,paid:!!award,paid_at:award?.paid_at||null};
}
async function adminProgress(db,m){
 if(!m.opened_at)return [];
 const {since,until}=times(m);
 const result=await db.prepare(
  "SELECT m.twitch_id,m.display_name,COALESCE(v.n,0) AS predictions,COALESCE(t.n,0) AS polls,a.paid_at "+
  "FROM members m "+
  "LEFT JOIN (SELECT b.twitch_id,COUNT(*) AS n FROM vote_ballots b JOIN vote_rounds r ON r.id=b.round_id WHERE r.status='resolved' AND b.created_at>=? AND b.created_at<? GROUP BY b.twitch_id) v ON v.twitch_id=m.twitch_id "+
  "LEFT JOIN (SELECT x.twitch_id,COUNT(*) AS n FROM tribunal_votes x JOIN tribunal_polls p ON p.id=x.poll_id WHERE x.created_at>=? AND x.created_at<? GROUP BY x.twitch_id) t ON t.twitch_id=m.twitch_id "+
  "LEFT JOIN monthly_awards a ON a.month=? AND a.twitch_id=m.twitch_id "+
  "WHERE COALESCE(v.n,0)>0 OR COALESCE(t.n,0)>0 OR a.twitch_id IS NOT NULL "+
  "ORDER BY (COALESCE(v.n,0)+COALESCE(t.n,0)) DESC,m.display_name COLLATE NOCASE LIMIT 500"
 ).bind(since,until,since,until,m.month).all();
 return (result.results||[]).map(row=>({
  twitch_id:String(row.twitch_id),display_name:String(row.display_name||'Membre').slice(0,64),
  predictions:Number(row.predictions||0),polls:Number(row.polls||0),
  complete:Number(row.predictions||0)>=Number(m.prediction_target)&&Number(row.polls||0)>=Number(m.poll_target),
  paid:row.paid_at!=null,paid_at:row.paid_at||null
 }));
}
export default {
 async fetch(req,env){
  const requestOrigin=req.headers.get('Origin');
  if(requestOrigin&&requestOrigin!==ORIGIN)return reply({error:'Origine refusée'},403);
  if(req.method==='OPTIONS')return requestOrigin===ORIGIN?
   new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}}):
   reply({error:'Origine requise'},403);
  const allowOrigin=requestOrigin===ORIGIN?ORIGIN:null;
  const respond=(d,s=200)=>reply(d,s,allowOrigin);
  if(!env.DB||!env.TWITCH_CLIENT_ID||!env.OWNER_TWITCH_ID)return respond({error:'Configuration manquante'},503);
  const url=new URL(req.url),path=url.pathname.replace(/\/+$/,'')||'/';
  try{
   if(path==='/v1/monthly/health'&&req.method==='GET'){
    const names=await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('monthly_missions','monthly_awards')").all();
    const ready=(names.results||[]).length===2;
    return respond({status:ready?'ok':'migration_missing',ready},ready?200:503);
   }
   const thisMonth=monthParis();
   if(path==='/v1/monthly/current'&&req.method==='GET'){
    const m=await missionFor(env.DB,thisMonth);
    return respond({month:thisMonth,mission:missionPublic(m&&m.status!=='draft'?m:null)});
   }
   const route=path.startsWith('/v1/monthly/admin')||path==='/v1/monthly/me';
   if(!route)return respond({error:'Route inconnue'},404);
   const identity=await twitchIdentity(req,env);
   if(!identity)return respond({error:'Connexion Twitch requise'},401);
   if(path==='/v1/monthly/me'&&req.method==='GET'){
    const registered=await memberExists(env.DB,identity.id);
    const m=await missionFor(env.DB,thisMonth);
    const published=m&&m.status!=='draft'?m:null;
    return respond({month:thisMonth,owner:identity.owner,registered,mission:missionPublic(published),
     progress:registered&&published?await progress(env.DB,identity.id,published):null});
   }
   if(!identity.owner)return respond({error:'Réservé au propriétaire du QG'},403);
   if(path==='/v1/monthly/admin'&&req.method==='GET'){
    const month=url.searchParams.get('month')||thisMonth;
    if(!validMonth(month))return respond({error:'Mois invalide'},400);
    const m=await missionFor(env.DB,month);
    const players=m?await adminProgress(env.DB,m):[];
    return respond({month,mission:missionPublic(m),players,
      totals:{participants:players.length,completed:players.filter(x=>x.complete).length,
       awaiting:players.filter(x=>x.complete&&!x.paid).length,paid:players.filter(x=>x.paid).length}});
   }
   if(req.method!=='POST')return respond({error:'Méthode refusée'},405);
   const body=await parseBody(req);if(!body)return respond({error:'JSON invalide'},400);
   if(path==='/v1/monthly/admin/configure'){
    const month=String(body.month||''),title=String(body.title||'').trim();
    const pred=body.prediction_target,polls=body.poll_target,coins=body.bonus_coins;
    const today=new Date(),maxYear=Number(thisMonth.slice(0,4))+1;
    if(!validMonth(month)||month<thisMonth||Number(month.slice(0,4))>maxYear||
      title.length<5||title.length>80||/[<>]/.test(title)||
      !Number.isInteger(pred)||pred<0||pred>20||
      !Number.isInteger(polls)||polls<0||polls>20||pred+polls<1||
      !Number.isInteger(coins)||coins<1||coins>MAX_BONUS)return respond({error:'Configuration invalide'},400);
    const result=await env.DB.prepare(
      "INSERT INTO monthly_missions(month,title,prediction_target,poll_target,bonus_coins,status) VALUES(?,?,?,?,?,'draft') "+
      "ON CONFLICT(month) DO UPDATE SET title=excluded.title,prediction_target=excluded.prediction_target,poll_target=excluded.poll_target,bonus_coins=excluded.bonus_coins WHERE monthly_missions.status='draft'"
    ).bind(month,title,pred,polls,coins).run();
    if(Number(result.meta?.changes||0)!==1)return respond({error:'Mission déjà ouverte ou clôturée : règles figées'},409);
    return respond({configured:true,mission:missionPublic(await missionFor(env.DB,month))});
   }
   if(path==='/v1/monthly/admin/open'||path==='/v1/monthly/admin/close'){
    const month=String(body.month||'');
    if(!validMonth(month))return respond({error:'Mois invalide'},400);
    if(path.endsWith('/open')&&month!==thisMonth)return respond({error:'Ouverture autorisée uniquement pendant le mois concerné (heure de Paris)'},409);
    const opening=path.endsWith('/open');
    const statement=opening?
      "UPDATE monthly_missions SET status='open',opened_at=unixepoch() WHERE month=? AND status='draft'":
      "UPDATE monthly_missions SET status='closed',closed_at=unixepoch() WHERE month=? AND status='open'";
    const result=await env.DB.prepare(statement).bind(month).run();
    if(Number(result.meta?.changes||0)!==1)return respond({error:'Mission absente ou statut incompatible'},409);
    return respond({updated:true,mission:missionPublic(await missionFor(env.DB,month))});
   }
   if(path==='/v1/monthly/admin/award'){
    const month=String(body.month||''),id=String(body.twitch_id||'');
    if(!validMonth(month)||!/^[0-9]{1,30}$/.test(id)||body.confirmed!==true)return respond({error:'Validation requise'},400);
    const m=await missionFor(env.DB,month);
    if(!m||m.status!=='closed')return respond({error:'Clôture de mission requise avant toute remise'},409);
    if(!await memberExists(env.DB,id))return respond({error:'Membre introuvable'},404);
    const status=await progress(env.DB,id,m);
    if(!status.complete)return respond({error:'Objectifs non validés par le serveur'},409);
    if(status.paid)return respond({error:'Récompense déjà déclarée remise'},409);
    const result=await env.DB.prepare(
      'INSERT INTO monthly_awards(month,twitch_id,coins,paid_at) VALUES(?,?,?,unixepoch()) ON CONFLICT(month,twitch_id) DO NOTHING'
    ).bind(month,id,m.bonus_coins).run();
    if(Number(result.meta?.changes||0)!==1)return respond({error:'Remise déjà enregistrée'},409);
    return respond({recorded:true,month,twitch_id:id,coins:Number(m.bonus_coins)});
   }
   return respond({error:'Route inconnue'},404);
  }catch(error){
   console.error('Monthly mission service',String(error?.message||error).slice(0,120));
   return respond({error:'Service temporairement indisponible'},500);
  }
 }
};
