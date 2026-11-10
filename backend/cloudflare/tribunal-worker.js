// Tribunal Ma_JesTik : Worker autonome (ne remplace PAS le Worker profils/votes ou Killathon).
// Configuration obligatoire : DB (D1), TWITCH_CLIENT_ID, OWNER_TWITCH_ID, ALLOWED_ORIGIN.
const ORIGIN='https://ma-jestik.fr';
const DURATIONS=new Set([5,10,15,30,60,1440]);
const OPEN="closed_at IS NULL AND (ends_at IS NULL OR ends_at>unixepoch())";
function respond(data,status,origin){
 const h=new Headers({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'});
 if(origin){
  h.set('Access-Control-Allow-Origin',origin);
  h.set('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');
  h.set('Access-Control-Allow-Headers','Authorization,Content-Type');
 }
 return new Response(JSON.stringify(data),{status:status||200,headers:h});
}
const updated=r=>Number(r?.meta?.changes||0)===1;
async function userFromTwitch(req,env){
 const header=req.headers.get('Authorization')||'';
 if(!/^Bearer [A-Za-z0-9_-]{12,500}$/.test(header))return null;
 const token=header.slice(7);
 const check=await fetch('https://id.twitch.tv/oauth2/validate',{headers:{Authorization:'OAuth '+token},signal:AbortSignal.timeout(8000)});
 if(!check.ok)return null;
 const v=await check.json();
 if(v.client_id!==env.TWITCH_CLIENT_ID||!/^[0-9]{1,30}$/.test(String(v.user_id||''))||Number(v.expires_in)<60)return null;
 const res=await fetch('https://api.twitch.tv/helix/users',{
  headers:{Authorization:'Bearer '+token,'Client-Id':env.TWITCH_CLIENT_ID},signal:AbortSignal.timeout(8000)
 });
 if(!res.ok)return null;
 const u=(await res.json())?.data?.[0];
 if(!u||String(u.id)!==String(v.user_id))return null;
 return {id:String(u.id),name:String(u.display_name||u.login||'Twitch').slice(0,64)};
}
const isOwner=(u,env)=>!!u&&/^[0-9]{1,30}$/.test(String(env.OWNER_TWITCH_ID||''))&&u.id===String(env.OWNER_TWITCH_ID);
async function jsonBody(req){
 if(!(req.headers.get('Content-Type')||'').startsWith('application/json'))return null;
 if(Number(req.headers.get('Content-Length')||0)>4096)return null;
 const raw=await req.text();
 if(raw.length>4096)return null;
 try{const x=JSON.parse(raw);return x&&!Array.isArray(x)&&typeof x==='object'?x:null}catch{return null}
}
function pollInput(b){
 if(!b||typeof b.question!=='string'||!Array.isArray(b.answers))return null;
 const question=b.question.trim(),answers=b.answers;
 if(question.length<10||question.length>140||answers.length<2||answers.length>4)return null;
 if(answers.some(x=>typeof x!=='string'))return null;
 const clean=answers.map(x=>x.trim());
 if(clean.some(x=>x.length<2||x.length>55))return null;
 if(new Set(clean.map(x=>x.toLocaleLowerCase('fr'))).size!==clean.length)return null;
 return {question,answers:clean};
}
function duration(b){return Number.isInteger(b?.duration_minutes)&&DURATIONS.has(b.duration_minutes)?b.duration_minutes:null}
function rowPoll(r){
 const answers=JSON.parse(r.answers_json);
 const counts=[r.c0,r.c1,r.c2,r.c3].slice(0,answers.length).map(x=>Number(x||0));
 return {id:r.id,question:r.question,answers,counts,total:counts.reduce((a,b)=>a+b,0),
  created_at:Number(r.created_at),ends_at:r.ends_at==null?null:Number(r.ends_at),
  closed:r.closed_at!=null||(r.ends_at!=null&&Number(r.ends_at)<=Math.floor(Date.now()/1000)),
  proposed_by:r.proposed_by_name||null};
}
async function polls(db){
 const q=await db.prepare(
  "SELECT p.id,p.question,p.answers_json,p.proposed_by_name,p.created_at,p.ends_at,p.closed_at,"+
  "SUM(CASE WHEN v.choice_index=0 THEN 1 ELSE 0 END) c0,"+
  "SUM(CASE WHEN v.choice_index=1 THEN 1 ELSE 0 END) c1,"+
  "SUM(CASE WHEN v.choice_index=2 THEN 1 ELSE 0 END) c2,"+
  "SUM(CASE WHEN v.choice_index=3 THEN 1 ELSE 0 END) c3 "+
  "FROM (SELECT * FROM tribunal_polls ORDER BY created_at DESC LIMIT 100) p "+
  "LEFT JOIN tribunal_votes v ON v.poll_id=p.id "+
  "GROUP BY p.id ORDER BY p.created_at DESC"
 ).all();
 return (q.results||[]).map(rowPoll);
}
async function proposals(db){
 const q=await db.prepare(
  "SELECT id,author_name,question,answers_json,created_at FROM tribunal_proposals "+
  "WHERE status='pending' ORDER BY created_at DESC LIMIT 200"
 ).all();
 return (q.results||[]).map(r=>({id:r.id,author_name:r.author_name,question:r.question,answers:JSON.parse(r.answers_json),created_at:Number(r.created_at)}));
}
export default {
 async fetch(req,env){
  const supplied=req.headers.get('Origin'),allowed=env.ALLOWED_ORIGIN||ORIGIN;
  const origin=supplied===allowed?allowed:null;
  const out=(data,status)=>respond(data,status,origin);
  if(supplied&&!origin)return respond({error:'Origine interdite'},403,null);
  if(req.method==='OPTIONS'){
   if(!origin)return out({error:'Origine requise'},403);
   const h=new Headers({'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Authorization,Content-Type',
    'Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS','Access-Control-Max-Age':'600','Vary':'Origin'});
   return new Response(null,{status:204,headers:h});
  }
  const ready=!!env.DB&&/^[a-z0-9]{10,80}$/.test(String(env.TWITCH_CLIENT_ID||''))&&/^[0-9]{1,30}$/.test(String(env.OWNER_TWITCH_ID||''));
  const path=new URL(req.url).pathname.replace(/\/+$/,'')||'/';
  if(path==='/v1/health'&&req.method==='GET'){
   if(!ready)return out({status:'not_configured',service:'tribunal',ready:false},503);
   try{
    const rows=await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('tribunal_polls','tribunal_proposals','tribunal_votes')").all();
    const tables=new Set((rows.results||[]).map(x=>x.name));
    const schemaReady=['tribunal_polls','tribunal_proposals','tribunal_votes'].every(name=>tables.has(name));
    return out({status:schemaReady?'ok':'missing_migration',service:'tribunal',ready:schemaReady},schemaReady?200:503);
   }catch{return out({status:'db_unavailable',service:'tribunal',ready:false},503);}
  }
  if(!ready)return out({error:'Tribunal non configuré'},503);
  try{
   if(path==='/v1/tribunal/polls'&&req.method==='GET')return out({polls:await polls(env.DB)});
   if(path==='/v1/tribunal/me'&&req.method==='GET'){
    const u=await userFromTwitch(req,env);
    if(!u)return out({error:'Connexion Twitch requise'},401);
    const v=await env.DB.prepare('SELECT poll_id,choice_index FROM tribunal_votes WHERE twitch_id=? ORDER BY created_at DESC LIMIT 100').bind(u.id).all();
    return out({owner:isOwner(u,env),name:u.name,votes:v.results||[]});
   }
   // Droit d'accès / effacement des participations Tribunal, y compris sans profil QG.
   // L'identité est déterminée uniquement à partir du jeton Twitch vérifié.
   // Un effacement ne supprime ni les sondages publiés, ni les votes d'autrui.
   if(path==='/v1/tribunal/me/data'&&(req.method==='GET'||req.method==='DELETE')){
    const u=await userFromTwitch(req,env);
    if(!u)return out({error:'Connexion Twitch requise'},401);
    if(req.method==='GET'){
     const counts=await Promise.all([
      env.DB.prepare('SELECT COUNT(*) AS n FROM tribunal_votes WHERE twitch_id=?').bind(u.id).first(),
      env.DB.prepare('SELECT COUNT(*) AS n FROM tribunal_proposals WHERE author_twitch_id=?').bind(u.id).first(),
      env.DB.prepare('SELECT COUNT(*) AS n FROM tribunal_polls WHERE created_by_twitch_id=?').bind(u.id).first(),
      env.DB.prepare('SELECT COUNT(*) AS n FROM tribunal_polls WHERE id IN (SELECT published_poll_id FROM tribunal_proposals WHERE author_twitch_id=? AND published_poll_id IS NOT NULL)').bind(u.id).first()
     ]);
     return out({participations:{votes:Number(counts[0]?.n||0),proposals:Number(counts[1]?.n||0),
      polls_created:Number(counts[2]?.n||0),polls_proposed:Number(counts[3]?.n||0)}});
    }
    // Transaction atomique : effacer les votes et propositions, anonymiser
    // l'attribution des sondages existants sans casser les résultats collectifs.
    const results=await env.DB.batch([
     env.DB.prepare('DELETE FROM tribunal_votes WHERE twitch_id=?').bind(u.id),
     env.DB.prepare('UPDATE tribunal_polls SET proposed_by_name=NULL WHERE id IN (SELECT published_poll_id FROM tribunal_proposals WHERE author_twitch_id=? AND published_poll_id IS NOT NULL)').bind(u.id),
     env.DB.prepare("UPDATE tribunal_polls SET created_by_twitch_id='' WHERE created_by_twitch_id=?").bind(u.id),
     env.DB.prepare('DELETE FROM tribunal_proposals WHERE author_twitch_id=?').bind(u.id)
    ]);
    return out({deleted:true,votes:Number(results[0]?.meta?.changes||0),
     polls_attribution_removed:Number(results[1]?.meta?.changes||0)+Number(results[2]?.meta?.changes||0),
     proposals:Number(results[3]?.meta?.changes||0)});
   }
   if(path==='/v1/tribunal/proposals'&&req.method==='GET'){
    const u=await userFromTwitch(req,env);
    if(!isOwner(u,env))return out({error:'Accès administrateur requis'},403);
    return out({proposals:await proposals(env.DB)});
   }
   if(path==='/v1/tribunal/proposals'&&req.method==='POST'){
    const u=await userFromTwitch(req,env);
    if(!u)return out({error:'Connexion Twitch requise'},401);
    if(isOwner(u,env))return out({error:'Le propriétaire publie directement ses sondages'},403);
    const body=await jsonBody(req),p=pollInput(body);
    if(!p)return out({error:'Question ou réponses invalides'},400);
    // Les limites de 3 propositions par 24 h et 200 en attente sont imposées en SQL.
    const result=await env.DB.prepare(
     "INSERT INTO tribunal_proposals(id,author_twitch_id,author_name,question,answers_json) "+
     "SELECT ?,?,?,?,? WHERE "+
     "(SELECT COUNT(*) FROM tribunal_proposals WHERE author_twitch_id=? AND created_at>unixepoch()-86400)<3 "+
     "AND (SELECT COUNT(*) FROM tribunal_proposals WHERE status='pending')<200"
    ).bind(crypto.randomUUID(),u.id,u.name,p.question,JSON.stringify(p.answers),u.id).run();
    return updated(result)?out({accepted:true},201):out({error:'Limite atteinte : 3 propositions par 24 h, ou file pleine'},429);
   }
   if(path==='/v1/tribunal/polls'&&req.method==='POST'){
    const u=await userFromTwitch(req,env);
    if(!isOwner(u,env))return out({error:'Accès administrateur requis'},403);
    const b=await jsonBody(req),p=pollInput(b),d=duration(b);
    if(!p||d===null)return out({error:'Question, réponses ou durée invalides'},400);
    const id=crypto.randomUUID();
    const result=await env.DB.prepare(
     "INSERT INTO tribunal_polls(id,question,answers_json,created_by_twitch_id,ends_at) "+
     "SELECT ?,?,?,?,unixepoch()+(?*60) "+
     "WHERE (SELECT COUNT(*) FROM tribunal_polls WHERE "+OPEN+")<20"
    ).bind(id,p.question,JSON.stringify(p.answers),u.id,d).run();
    return updated(result)?out({created:true,id},201):out({error:'Maximum de 20 sondages ouverts atteint'},409);
   }
   const pv=path.match(/^\/v1\/tribunal\/polls\/([a-f0-9-]{36})\/(vote|close)$/i);
   if(pv&&req.method==='POST'){
    const id=pv[1],action=pv[2],u=await userFromTwitch(req,env);
    if(!u)return out({error:'Connexion Twitch requise'},401);
    if(action==='vote'){
     const b=await jsonBody(req),choice=b?.choice_index;
     if(!Number.isInteger(choice)||choice<0||choice>3)return out({error:'Choix invalide'},400);
     const result=await env.DB.prepare(
      "INSERT INTO tribunal_votes(poll_id,twitch_id,choice_index) "+
      "SELECT id,?,? FROM tribunal_polls WHERE id=? AND "+OPEN+
      " AND json_array_length(answers_json)>? ON CONFLICT(poll_id,twitch_id) DO NOTHING"
     ).bind(u.id,choice,id,choice).run();
     return updated(result)?out({voted:true,choice_index:choice},201):out({error:'Sondage clos, choix invalide ou compte ayant déjà voté'},409);
    }
    if(!isOwner(u,env))return out({error:'Accès administrateur requis'},403);
    const result=await env.DB.prepare('UPDATE tribunal_polls SET closed_at=unixepoch() WHERE id=? AND '+OPEN).bind(id).run();
    return updated(result)?out({closed:true}):out({error:'Sondage introuvable ou déjà clos'},409);
   }
   const pd=path.match(/^\/v1\/tribunal\/polls\/([a-f0-9-]{36})$/i);
   if(pd&&req.method==='DELETE'){
    const u=await userFromTwitch(req,env);
    if(!isOwner(u,env))return out({error:'Accès administrateur requis'},403);
    const result=await env.DB.prepare('DELETE FROM tribunal_polls WHERE id=?').bind(pd[1]).run();
    return updated(result)?out({deleted:true}):out({error:'Sondage introuvable'},404);
   }
   const pm=path.match(/^\/v1\/tribunal\/proposals\/([a-f0-9-]{36})\/(approve|reject)$/i);
   if(pm&&req.method==='POST'){
    const id=pm[1],action=pm[2],u=await userFromTwitch(req,env);
    if(!isOwner(u,env))return out({error:'Accès administrateur requis'},403);
    if(action==='reject'){
     const result=await env.DB.prepare(
      "UPDATE tribunal_proposals SET status='rejected',resolved_at=unixepoch() WHERE id=? AND status='pending'"
     ).bind(id).run();
     return updated(result)?out({rejected:true}):out({error:'Proposition déjà traitée ou introuvable'},409);
    }
    const b=await jsonBody(req),p=pollInput(b),d=duration(b);
    if(!p||d===null)return out({error:'Question, réponses ou durée invalides'},400);
    const pollId=crypto.randomUUID();
    // Les deux opérations d'un batch D1 s'exécutent dans une transaction.
    const results=await env.DB.batch([
     env.DB.prepare(
      "UPDATE tribunal_proposals SET status='accepted',question=?,answers_json=?,resolved_at=unixepoch(),published_poll_id=? "+
      "WHERE id=? AND status='pending' "+
      "AND (SELECT COUNT(*) FROM tribunal_polls WHERE "+OPEN+")<20"
     ).bind(p.question,JSON.stringify(p.answers),pollId,id),
     env.DB.prepare(
      "INSERT INTO tribunal_polls(id,question,answers_json,created_by_twitch_id,proposed_by_name,ends_at) "+
      "SELECT ?,question,answers_json,?,author_name,unixepoch()+(?*60) "+
      "FROM tribunal_proposals WHERE id=? AND status='accepted' AND published_poll_id=?"
     ).bind(pollId,u.id,d,id,pollId)
    ]);
    return updated(results[0])&&updated(results[1])
     ?out({published:true,poll_id:pollId},201):out({error:'Proposition déjà traitée ou limite de sondages atteinte'},409);
   }
   return out({error:'Route inconnue'},404);
  }catch(e){
   console.error('Tribunal API',String(e?.message||e).slice(0,130));
   return out({error:'Tribunal momentanément indisponible'},500);
  }
 }
};
