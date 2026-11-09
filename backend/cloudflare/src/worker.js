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


/* Profils QG personnalisables (migration D1 0005).
   Les identités viennent exclusivement du token Twitch validé côté Worker.
   Le client ne peut écrire ni les scores, ni le rang, ni les badges. */
const profileGames=new Set(["fortnite","warzone","rocket-league","apex-legends","cyberpunk-2077","elden-ring","god-of-war","horizon-zero-dawn","the-witcher-3","the-last-of-us","gta-v","resident-evil-4","counter-strike-2","dota-2","pubg","helldivers-2","baldurs-gate-3","red-dead-redemption-2","hogwarts-legacy","spider-man","jedi-survivor","days-gone","plague-tale-requiem","god-of-war-ragnarok","sea-of-thieves","monster-hunter-wilds","palworld","overwatch-2","rainbow-six-siege","warframe","destiny-2","diablo-iv","path-of-exile","stardew-valley","terraria","gta-vi","league-of-legends","world-of-warcraft","minecraft","valorant"]);
const profileBanners=new Set(["champagne","carbone","violet","bleu-nuit","rubis","emeraude"]);
const profileAccents=new Set(["or","violet","bleu","rouge","vert","rose"]);
const profileFields="display_label,bio,banner_key,accent_key,favorite_games_json,primary_game,is_public,instagram,tiktok,discord,updated_at,banner_choice,accent_choice";
const defaultProfile=()=>({display_label:"",bio:"",banner_key:"champagne",accent_key:"or",favorite_games_json:"[]",primary_game:"",is_public:0,instagram:"",tiktok:"",discord:""});
function normalizeProfile(row){
  const p=row||defaultProfile();
  let games=[];
  try{const parsed=JSON.parse(p.favorite_games_json||"[]");games=Array.isArray(parsed)?parsed.filter(x=>profileGames.has(x)).slice(0,4):[];}catch{}
  return {display_name:p.display_label||"",bio:p.bio||"",banner:p.banner_choice||p.banner_key||"champagne",accent:p.accent_choice||p.accent_key||"or",games,primary_game:games.includes(p.primary_game)?p.primary_game:"",public_profile:p.is_public===1,instagram:p.instagram||"",tiktok:p.tiktok||"",discord:p.discord||""};
}
function validateProfile(data){
  if(!data||typeof data!=="object"||Array.isArray(data))return null;
  const keys=["display_name","bio","banner","accent","games","primary_game","public_profile","instagram","tiktok","discord"];
  if(Object.keys(data).some(k=>!keys.includes(k))||!keys.every(k=>Object.prototype.hasOwnProperty.call(data,k)))return null;
  for(const k of ["display_name","bio","banner","accent","primary_game","instagram","tiktok","discord"])if(typeof data[k]!=="string")return null;
  const clean=t=>t.trim().replace(/\s+/g," ");
  const display=clean(data.display_name),bio=data.bio.trim(),instagram=clean(data.instagram).replace(/^@/,""),tiktok=clean(data.tiktok).replace(/^@/,""),discord=clean(data.discord);
  if(display.length>32||/[\u0000-\u001f\u007f<>]/.test(display)||bio.length>180||/[\u0000-\u0008\u000b-\u001f\u007f<>]/.test(bio))return null;
  if(!profileBanners.has(data.banner)||!profileAccents.has(data.accent)||typeof data.public_profile!=="boolean")return null;
  if(!Array.isArray(data.games)||data.games.length>4||new Set(data.games).size!==data.games.length||data.games.some(g=>typeof g!=="string"||!profileGames.has(g)))return null;
  if(data.primary_game!==""&&!data.games.includes(data.primary_game))return null;
  if((instagram&&!/^[A-Za-z0-9._]{1,30}$/.test(instagram))||(tiktok&&!/^[A-Za-z0-9._]{1,24}$/.test(tiktok))||discord.length>40||/[\u0000-\u001f\u007f<>]/.test(discord))return null;
  return {display,bio,banner:data.banner,accent:data.accent,games:data.games,primary:data.primary_game,isPublic:data.public_profile?1:0,instagram,tiktok,discord};
}
async function profileStats(db,member){
  if(!member)return null;
  let rank=null;
  if(member.visible_in_ranking===1&&member.score>0){
    const r=await db.prepare("SELECT COUNT(*)+1 AS rank FROM members WHERE visible_in_ranking=1 AND score>0 AND (score>? OR (score=? AND joined_at<?))").bind(member.score,member.score,member.joined_at).first();
    rank=Number(r?.rank)||null;
  }
  const v=await db.prepare("SELECT COUNT(*) AS total FROM vote_ballots WHERE twitch_id=?").bind(member.twitch_id).first();
  return {points:Number(member.score)||0,rank,votes:Number(v?.total)||0,joined_at:member.joined_at};
}
async function memberProfileRoute(req,env,origin,path){
  const result=(data,status=200)=>output(data,status,origin);
  if(path==="/v1/profiles/me"&&["GET","PATCH"].includes(req.method)){
    const user=await twitchUser(req,env);
    if(!user)return result({error:"Connexion Twitch invalide"},401);
    const member=await env.DB.prepare("SELECT twitch_id,display_name,avatar_url,score,visible_in_ranking,joined_at FROM members WHERE twitch_id=?").bind(user.id).first();
    if(!member)return result({catalog_version:2,registered:false,profile:null,stats:null,identity:{name:user.name,avatar:user.avatar}},req.method==="GET"?200:404);
    if(req.method==="PATCH"){
      if(!(req.headers.get("Content-Type")||"").startsWith("application/json"))return result({error:"JSON requis"},415);
      const text=await req.text();
      if(text.length>2500)return result({error:"Profil trop volumineux"},413);
      let body;try{body=JSON.parse(text)}catch{return result({error:"JSON invalide"},400)}
      const p=validateProfile(body);
      if(!p)return result({error:"Champs du profil invalides"},400);
      await env.DB.prepare("INSERT INTO member_profiles(twitch_id,display_label,bio,banner_key,accent_key,favorite_games_json,primary_game,is_public,instagram,tiktok,discord,banner_choice,accent_choice) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(twitch_id) DO UPDATE SET display_label=excluded.display_label,bio=excluded.bio,banner_key=excluded.banner_key,accent_key=excluded.accent_key,favorite_games_json=excluded.favorite_games_json,primary_game=excluded.primary_game,is_public=excluded.is_public,instagram=excluded.instagram,tiktok=excluded.tiktok,discord=excluded.discord,banner_choice=excluded.banner_choice,accent_choice=excluded.accent_choice,updated_at=CURRENT_TIMESTAMP")
        .bind(user.id,p.display,p.bio,["champagne","carbone","violet"].includes(p.banner)?p.banner:"champagne",["or","violet","bleu"].includes(p.accent)?p.accent:"or",JSON.stringify(p.games),p.primary,p.isPublic,p.instagram,p.tiktok,p.discord,p.banner,p.accent).run();
    }
    const saved=await env.DB.prepare("SELECT "+profileFields+" FROM member_profiles WHERE twitch_id=?").bind(user.id).first();
    return result({catalog_version:2,registered:true,profile:normalizeProfile(saved),stats:await profileStats(env.DB,{...member,twitch_id:user.id}),identity:{name:user.name,avatar:user.avatar}});
  }
  if(path.startsWith("/v1/profiles/")&&req.method==="GET"){
    const id=path.slice("/v1/profiles/".length);
    if(!/^[0-9]{1,30}$/.test(id))return result({error:"Profil introuvable"},404);
    const data=await env.DB.prepare("SELECT m.twitch_id,m.display_name,m.avatar_url,m.score,m.visible_in_ranking,m.joined_at,p."+profileFields.split(",").join(",p.")+" FROM members m JOIN member_profiles p ON p.twitch_id=m.twitch_id WHERE m.twitch_id=? AND p.is_public=1").bind(id).first();
    if(!data)return result({error:"Profil privé ou inexistant"},404);
    const profile=normalizeProfile(data);
    // Le score et le rang ne sont publics que si la personne a accepté le classement.
    const stats=data.visible_in_ranking===1?await profileStats(env.DB,data):{points:null,rank:null,votes:null,joined_at:data.joined_at};
    return result({profile,stats,identity:{name:data.display_name,avatar:data.avatar_url}});
  }
  return result({error:"Route inconnue ou méthode interdite"},404);
}

// Suivi QG : date serveur, sans création de compte ni effacement automatique.
async function touchMemberActivity(db,twitchId){
  await db.prepare("INSERT INTO member_activity(twitch_id,last_active_at) SELECT twitch_id,unixepoch() FROM members WHERE twitch_id=? ON CONFLICT(twitch_id) DO UPDATE SET last_active_at=excluded.last_active_at WHERE member_activity.last_active_at<=excluded.last_active_at-1800").bind(twitchId).run();
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
      // Nécessite la migration 0007 et ACTIVITY_TRACKING_ENABLED=true.
      if(path==="/v1/me/activity"){
        if(!["GET","POST"].includes(req.method))return output({error:"Méthode refusée"},405,origin);
        if(env.ACTIVITY_TRACKING_ENABLED!=="true")return output({error:"Suivi d'activité non activé"},503,origin);
        const user=await twitchUser(req,env);
        if(!user)return output({error:"Connexion Twitch invalide"},401,origin);
        const registered=await env.DB.prepare("SELECT twitch_id FROM members WHERE twitch_id=?").bind(user.id).first();
        if(!registered)return output({error:"Profil QG non créé"},404,origin);
        if(req.method==="POST")await touchMemberActivity(env.DB,user.id);
        const activity=await env.DB.prepare("SELECT last_active_at FROM member_activity WHERE twitch_id=?").bind(user.id).first();
        return output({last_active_at:activity?.last_active_at??null},200,origin);
      }
      if(path.startsWith("/v1/votes/"))return await voteRoute(req,env,origin,path);
      if(path.startsWith("/v1/profiles/"))return await memberProfileRoute(req,env,origin,path);
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
        if(env.ACTIVITY_TRACKING_ENABLED==="true")await touchMemberActivity(env.DB,user.id);
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