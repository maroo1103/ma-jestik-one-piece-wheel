// Ma_JesTik QG : profils Twitch persistants, API non déployée pour le moment.
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