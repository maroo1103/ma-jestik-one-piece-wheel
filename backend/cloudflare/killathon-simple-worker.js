// Ma_JesTik QG : profils Twitch actifs. Routes votes préparées, migration D1 requise avant déploiement de cette version.
// Aucun endpoint public ne permet de modifier son score.
const output=(data,status=200,origin=null)=>{
  const h=new Headers({"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
  if(origin){h.set("Access-Control-Allow-Origin",origin);h.set("Vary","Origin");h.set("Access-Control-Allow-Headers","Authorization,Content-Type");h.set("Access-Control-Allow-Methods","GET,POST,PATCH,DELETE,OPTIONS");}
  return new Response(JSON.stringify(data),{status,headers:h});
};
async function twitchUser(req,env){
  const header=req.headers.get("Authorization")||"";
  if(!/^Bearer [A-Za-z0-9_-]{12,500}$/.test(header))return null;
  const token=header.substring(7);
  const v=await fetch("https://id.twitch.tv/oauth2/validate",{headers:{"Authorization":"OAuth "+token},signal:AbortSignal.timeout(8000)});
  if(!v.ok)return null;
  const val=await v.json();
  if(val.client_id!==env.TWITCH_CLIENT_ID||!/^[0-9]{1,30}$/.test(String(val.user_id||""))||Number(val.expires_in)<60)return null;
  const u=await fetch("https://api.twitch.tv/helix/users",{headers:{"Authorization":"Bearer "+token,"Client-Id":env.TWITCH_CLIENT_ID},signal:AbortSignal.timeout(8000)});
  if(!u.ok)return null;
  const row=(await u.json())?.data?.[0];
  if(!row||String(row.id)!==String(val.user_id))return null;
  return {id:String(row.id),login:String(row.login||"").slice(0,64),name:String(row.display_name||row.login||"").slice(0,64),avatar:/^https:\/\/static-cdn\.jtvnw\.net\//.test(row.profile_image_url||"")?row.profile_image_url.slice(0,500):""};
}

async function voteBody(req){
 if(!(req.headers.get("Content-Type")||"").startsWith("application/json"))return null;
 const raw=await req.text();if(raw.length>1600)return null;
 try{return JSON.parse(raw)}catch{return null}
}
/* Killathon simple multi-streamers : suivi manuel, compte Twitch vérifié.
   Les liens OBS sont en lecture seule et ne contiennent jamais de jeton Twitch. */
const GAME_OPTIONS=["Fortnite Zero Build","Fortnite Battle Royale","Warzone","Autre jeu"];
function killathonPublicId(id){return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);}
async function killathonForOwner(db,twitchId){
 return db.prepare("SELECT k.public_id,k.game,k.kills,k.goal,k.active,k.updated_at,m.display_name FROM killathon_simple k JOIN members m ON m.twitch_id=k.twitch_id WHERE k.twitch_id=?").bind(twitchId).first();
}
async function killathonRoute(req,env,origin,path){
 const respond=(data,status=200)=>output(data,status,origin);
 const publicMatch=/^\/v1\/killathon\/public\/([0-9a-f-]{36})$/i.exec(path);
 if(publicMatch){
  if(req.method!=="GET")return respond({error:"Méthode interdite"},405);
  const id=publicMatch[1];
  if(!killathonPublicId(id))return respond({error:"Lien invalide"},400);
  const data=await env.DB.prepare("SELECT k.game,k.kills,k.goal,k.active,k.updated_at,m.display_name FROM killathon_simple k JOIN members m ON m.twitch_id=k.twitch_id WHERE k.public_id=?").bind(id).first();
  return data?respond({killathon:data}):respond({error:"Killathon introuvable"},404);
 }
 if(!["/v1/killathon/me","/v1/killathon/create","/v1/killathon/command"].includes(path))return respond({error:"Route inconnue"},404);
 const expected=path==="/v1/killathon/me"?"GET":"POST";
 if(req.method!==expected)return respond({error:"Méthode interdite"},405);
 const user=await twitchUser(req,env);
 if(!user)return respond({error:"Connexion Twitch invalide. Reconnecte-toi."},401);
 if(path==="/v1/killathon/me")return respond({killathon:await killathonForOwner(env.DB,user.id)});
 const body=await voteBody(req);
 if(!body||typeof body!=="object"||Array.isArray(body))return respond({error:"Données invalides"},400);
 if(path==="/v1/killathon/create"){
  const game=String(body.game||"Fortnite Zero Build");
  const goal=Number(body.goal??30);
  if(!GAME_OPTIONS.includes(game)||!Number.isInteger(goal)||goal<1||goal>9999)return respond({error:"Jeu ou objectif invalide"},400);
  // La création du Killathon inscrit le minimum de profil nécessaire.
  await env.DB.batch([
   env.DB.prepare("INSERT INTO members(twitch_id,login,display_name,avatar_url) VALUES(?,?,?,?) ON CONFLICT(twitch_id) DO UPDATE SET login=excluded.login,display_name=excluded.display_name,avatar_url=excluded.avatar_url,updated_at=CURRENT_TIMESTAMP").bind(user.id,user.login,user.name,user.avatar),
   env.DB.prepare("INSERT OR IGNORE INTO killathon_simple(twitch_id,public_id,game,goal) VALUES(?,?,?,?)").bind(user.id,crypto.randomUUID(),game,goal)
  ]);
  return respond({killathon:await killathonForOwner(env.DB,user.id)},201);
 }
 const action=String(body.action||"");
 let stmt;
 if(action==="add"){
  stmt=env.DB.prepare("UPDATE killathon_simple SET kills=MIN(999999,kills+1),updated_at=unixepoch() WHERE twitch_id=?").bind(user.id);
 }else if(action==="subtract"){
  stmt=env.DB.prepare("UPDATE killathon_simple SET kills=MAX(0,kills-1),updated_at=unixepoch() WHERE twitch_id=?").bind(user.id);
 }else if(action==="goal"){
  const goal=Number(body.goal);
  if(!Number.isInteger(goal)||goal<1||goal>9999)return respond({error:"Objectif entre 1 et 9 999"},400);
  stmt=env.DB.prepare("UPDATE killathon_simple SET goal=?,updated_at=unixepoch() WHERE twitch_id=?").bind(goal,user.id);
 }else if(action==="game"){
  const game=String(body.game||"");
  if(!GAME_OPTIONS.includes(game))return respond({error:"Jeu non disponible"},400);
  stmt=env.DB.prepare("UPDATE killathon_simple SET game=?,updated_at=unixepoch() WHERE twitch_id=?").bind(game,user.id);
 }else if(action==="active"){
  if(typeof body.active!=="boolean")return respond({error:"État invalide"},400);
  stmt=env.DB.prepare("UPDATE killathon_simple SET active=?,updated_at=unixepoch() WHERE twitch_id=?").bind(body.active?1:0,user.id);
 }else if(action==="reset"){
  stmt=env.DB.prepare("UPDATE killathon_simple SET kills=0,active=0,updated_at=unixepoch() WHERE twitch_id=?").bind(user.id);
 }else return respond({error:"Action inconnue"},400);
 const result=await stmt.run();
 if(result.meta?.changes!==1)return respond({error:"Crée d’abord ton Killathon"},404);
 return respond({killathon:await killathonForOwner(env.DB,user.id)});
}


export default {
 async fetch(req,env){
  const supplied=req.headers.get("Origin");
  const expected=env.ALLOWED_ORIGIN||"https://maroo1103.github.io";
  const origin=supplied===expected?expected:null;
  if(supplied&&!origin)return output({error:"Origine interdite"},403);
  if(req.method==="OPTIONS"){
   if(!origin)return output({error:"Origine requise"},403);
   return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Authorization,Content-Type","Access-Control-Max-Age":"600","Vary":"Origin"}});
  }
  if(!env.DB||!env.TWITCH_CLIENT_ID)return output({error:"Killathon non configuré"},503,origin);
  const path=new URL(req.url).pathname.replace(/\/+$/,"")||"/";
  try{
   if(path==="/v1/health"&&req.method==="GET")return output({status:"ok",service:"killathon-simple"},200,origin);
   if(path.startsWith("/v1/killathon/"))return await killathonRoute(req,env,origin,path);
   return output({error:"Route inconnue"},404,origin);
  }catch(error){
   console.error("Killathon QG",String(error?.message||error).slice(0,100));
   return output({error:"Service Killathon momentanément indisponible"},500,origin);
  }
 }
};
