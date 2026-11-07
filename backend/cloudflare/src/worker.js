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

/* Votes Défis : +1 réussite prédite, +2 échec prédit.
   Tous les résultats et points sont validés côté serveur. */
const ownerCheck=(u,env)=>/^[0-9]{1,30}$/.test(String(env.OWNER_TWITCH_ID||"")) && String(env.OWNER_TWITCH_ID)===u.id;
async function voteBody(req){
  if(!(req.headers.get("Content-Type")||"").startsWith("application/json"))return null;
  const raw=await req.text();
  if(raw.length>1600)return null;
  try{return JSON.parse(raw)}catch{return null}
}
async function voteLatest(db){
  const round=await db.prepare("SELECT id,game,challenge_id,challenge_title,team,status,result,created_at,locked_at,resolved_at FROM vote_rounds ORDER BY created_at DESC LIMIT 1").first();
  if(!round)return null;
  let counts=null;
  if(round.status!=="open"){
    const r=await db.prepare("SELECT prediction,COUNT(*) AS total FROM vote_ballots WHERE round_id=? GROUP BY prediction").bind(round.id).all();
    counts=Object.fromEntries((r.results||[]).map(x=>[x.prediction,x.total]));
  }
  return {...round,counts};
}
async function voteRoute(req,env,origin,path){
  const result=(data,code=200)=>output(data,code,origin);
  if(path==="/v1/votes/current"&&req.method==="GET"){
    return result({round:await voteLatest(env.DB),rules:{success:1,failure:2}});
  }
  const expected={
    "/v1/votes/me":"GET",
    "/v1/votes/start":"POST",
    "/v1/votes/cast":"POST",
    "/v1/votes/close":"POST",
    "/v1/votes/resolve":"POST",
    "/v1/votes/cancel":"POST"
  };
  if(!(path in expected))return result({error:"Route inconnue"},404);
  if(req.method!==expected[path])return result({error:"Méthode interdite"},405);
  const user=await twitchUser(req,env);
  if(!user)return result({error:"Connexion Twitch invalide"},401);
  const owner=ownerCheck(user,env);
  if(path==="/v1/votes/me"){
    const round=await env.DB.prepare("SELECT id FROM vote_rounds ORDER BY created_at DESC LIMIT 1").first();
    const ballot=round?await env.DB.prepare("SELECT prediction FROM vote_ballots WHERE round_id=? AND twitch_id=?").bind(round.id,user.id).first():null;
    const member=await env.DB.prepare("SELECT twitch_id FROM members WHERE twitch_id=?").bind(user.id).first();
    return result({owner,registered:!!member,prediction:ballot?.prediction||null});
  }
  const body=await voteBody(req);
  if(!body || typeof body!=="object" || Array.isArray(body))return result({error:"JSON invalide"},400);
  if(path==="/v1/votes/cast"){
    const id=String(body.round_id||"");
    if(!/^[0-9a-f-]{36}$/.test(id) || !["success","failure"].includes(body.prediction))return result({error:"Pronostic invalide"},400);
    try{
      const x=await env.DB.prepare(
        "INSERT INTO vote_ballots(round_id,twitch_id,prediction) SELECT id,?,? FROM vote_rounds WHERE id=? AND status='open' AND EXISTS(SELECT 1 FROM members WHERE twitch_id=?)"
      ).bind(user.id,body.prediction,id,user.id).run();
      if(x.meta?.changes!==1)return result({error:"Vote fermé ou profil absent"},409);
      return result({accepted:true,prediction:body.prediction});
    }catch(e){
      if(String(e?.message||"").includes("UNIQUE"))return result({error:"Déjà voté pour cette manche"},409);
      throw e;
    }
  }
  if(!owner)return result({error:"Réservé au propriétaire du QG"},403);
  if(path==="/v1/votes/start"){
    const id=Number(body.challenge_id),title=String(body.title||"").trim(),team=String(body.team||"");
    if(body.game!=="fortnite" || !Number.isInteger(id) || id<0 || id>118 || title.length<3 || title.length>100 || !["solo","duo","trio","quatuor"].includes(team)){
      return result({error:"Défi Fortnite invalide"},400);
    }
    try{
      await env.DB.prepare("INSERT INTO vote_rounds(id,game,challenge_id,challenge_title,team,status) VALUES(?,?,?,?,?,'open')")
        .bind(crypto.randomUUID(),"fortnite",id,title,team).run();
    }catch(e){
      if(String(e?.message||"").includes("UNIQUE"))return result({error:"Une manche est déjà active"},409);
      throw e;
    }
    return result({round:await voteLatest(env.DB)},201);
  }
  const id=String(body.round_id||"");
  if(!/^[0-9a-f-]{36}$/.test(id))return result({error:"Identifiant invalide"},400);
  if(path==="/v1/votes/close"){
    const x=await env.DB.prepare("UPDATE vote_rounds SET status='locked',locked_at=unixepoch() WHERE id=? AND status='open'").bind(id).run();
    return x.meta?.changes===1?result({round:await voteLatest(env.DB)}):result({error:"Scrutin non ouvert"},409);
  }
  if(path==="/v1/votes/cancel"){
    const x=await env.DB.prepare("UPDATE vote_rounds SET status='cancelled',locked_at=COALESCE(locked_at,unixepoch()) WHERE id=? AND status IN ('open','locked')").bind(id).run();
    return x.meta?.changes===1?result({round:await voteLatest(env.DB)}):result({error:"Manche non annulable"},409);
  }
  if(path==="/v1/votes/resolve"){
    if(!["success","failure"].includes(body.result))return result({error:"Résultat invalide"},400);
    const choice=body.result;
    // Les trois écritures sont une transaction D1. La clé (round_id,twitch_id)
    // empêche le versement multiple, même si la requête est répétée.
    const steps=[
      env.DB.prepare("UPDATE vote_rounds SET status='resolved',result=?,resolved_at=unixepoch() WHERE id=? AND status='locked'").bind(choice,id),
      env.DB.prepare(
        "INSERT OR IGNORE INTO vote_points(round_id,twitch_id,points) SELECT b.round_id,b.twitch_id,? FROM vote_ballots b JOIN vote_rounds r ON r.id=b.round_id JOIN members m ON m.twitch_id=b.twitch_id WHERE r.id=? AND r.status='resolved' AND r.result=? AND b.prediction=?"
      ).bind(choice==="failure"?2:1,id,choice,choice),
      env.DB.prepare(
        "UPDATE members SET score=COALESCE((SELECT SUM(points) FROM vote_points WHERE twitch_id=members.twitch_id),0),updated_at=CURRENT_TIMESTAMP WHERE twitch_id IN (SELECT twitch_id FROM vote_points WHERE round_id=?)"
      ).bind(id)
    ];
    const results=await env.DB.batch(steps);
    if(results[0]?.meta?.changes!==1)return result({error:"Manche déjà résolue ou non clôturée"},409);
    return result({round:await voteLatest(env.DB),awarded:results[1]?.meta?.changes||0});
  }
  return result({error:"Route inconnue"},404);
}

const sqlProfile="SELECT twitch_id, login, display_name, avatar_url, joined_at, updated_at, visible_in_ranking FROM members WHERE twitch_id=?";
export default {
  async fetch(req,env){
    const suppliedOrigin=req.headers.get("Origin");
    const allow=env.ALLOWED_ORIGIN||"https://maroo1103.github.io";
    const origin=suppliedOrigin===allow?allow:null;
    if(suppliedOrigin&&!origin)return output({error:"Origine interdite"},403);
    if(req.method==="OPTIONS"){
      if(!origin)return output({error:"Origine requise"},403);
      return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS","Access-Control-Allow-Headers":"Authorization,Content-Type","Access-Control-Max-Age":"600","Vary":"Origin"}});
    }
    if(!env.DB||!env.TWITCH_CLIENT_ID)return output({error:"Service non configuré"},503,origin);
    const path=new URL(req.url).pathname.replace(/\/+$/,"")||"/";
    try {
      if(path==="/v1/health"&&req.method==="GET")return output({status:"ok"},200,origin);
      if(path.startsWith("/v1/votes/"))return await voteRoute(req,env,origin,path);
      if(path==="/v1/ranking"&&req.method==="GET"){
        const res=await env.DB.prepare("SELECT display_name,avatar_url,score FROM members WHERE visible_in_ranking=1 AND score>0 ORDER BY score DESC,joined_at ASC LIMIT 50").all();
        return output({entries:res.results||[]},200,origin);
      }
      if(path!=="/v1/me"&&path!=="/v1/me/visibility")return output({error:"Route inconnue"},404,origin);
      const allowed=path==="/v1/me"?["GET","POST","DELETE"]:["PATCH"];
      if(!allowed.includes(req.method))return output({error:"Méthode refusée"},405,origin);
      const user=await twitchUser(req,env);
      if(!user)return output({error:"Identité Twitch non vérifiée"},401,origin);
      if(req.method==="GET"){
        const me=await env.DB.prepare(sqlProfile).bind(user.id).first();
        return output({member:me||null},200,origin);
      }
      if(req.method==="POST"){
        await env.DB.prepare("INSERT INTO members(twitch_id,login,display_name,avatar_url) VALUES(?,?,?,?) ON CONFLICT(twitch_id) DO UPDATE SET login=excluded.login,display_name=excluded.display_name,avatar_url=excluded.avatar_url,updated_at=CURRENT_TIMESTAMP").bind(user.id,user.login,user.name,user.avatar).run();
        const me=await env.DB.prepare(sqlProfile).bind(user.id).first();
        return output({member:me},200,origin);
      }
      if(req.method==="DELETE"){
        await env.DB.prepare("DELETE FROM members WHERE twitch_id=?").bind(user.id).run();
        return output({deleted:true},200,origin);
      }
      if(req.method==="PATCH"){
        const type=req.headers.get("Content-Type")||"";
        if(!type.startsWith("application/json"))return output({error:"JSON requis"},415,origin);
        const body=await req.json().catch(()=>null);
        if(typeof body?.visible!=="boolean")return output({error:"Paramètre visible invalide"},400,origin);
        const upd=await env.DB.prepare("UPDATE members SET visible_in_ranking=?,updated_at=CURRENT_TIMESTAMP WHERE twitch_id=?").bind(body.visible?1:0,user.id).run();
        if(!upd.meta?.changes)return output({error:"Compte introuvable"},404,origin);
        const me=await env.DB.prepare(sqlProfile).bind(user.id).first();
        return output({member:me},200,origin);
      }
      return output({error:"Méthode refusée"},405,origin);
    }catch(error){
      console.error("QG backend",String(error?.message||error).slice(0,100));
      return output({error:"Service momentanément indisponible"},500,origin);
    }
  }
};