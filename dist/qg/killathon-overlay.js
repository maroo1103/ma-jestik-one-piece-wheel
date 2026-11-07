/* Source navigateur OBS : accès uniquement à une URL publique aléatoire, aucun jeton Twitch. */
const api=(document.querySelector('meta[name="majestik-members-api"]')?.content||'').replace(/\/$/,'');
const params=new URLSearchParams(location.search);
const id=params.get('id')||'';
const isUUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
const get=id=>document.getElementById(id);
let lastOk=false;
async function refresh(){
 if(!isUUID){get('error').textContent='Lien OBS invalide : ouvre le lien depuis ton Killathon personnel.';get('error').hidden=false;return;}
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
 try{
  const r=await fetch(api+'/v1/killathon/public/'+encodeURIComponent(id),{mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal});
  if(!r.ok)throw new Error('Données indisponibles');
  const data=(await r.json())?.killathon;
  if(!data)throw new Error('Compte introuvable');
  const kills=Math.max(0,Math.floor(Number(data.kills)||0));
  const goal=Math.max(1,Math.floor(Number(data.goal)||30));
  const pct=Math.min(100,Math.round(kills/goal*100));
  get('kills').textContent=String(kills);get('goal').textContent=String(goal);
  get('percent').textContent=pct+' %';
  get('progress').style.width=pct+'%';
  get('streamer').textContent=String(data.display_name||'Streamer').slice(0,64)+' · '+String(data.game||'').slice(0,42);
  const status=get('liveState');status.textContent=data.active?'EN COURS':'EN PAUSE';status.classList.toggle('active',data.active===1||data.active===true);
  get('error').hidden=true;lastOk=true;
 }catch{
  if(!lastOk){get('error').textContent='Compteur temporairement indisponible.';get('error').hidden=false;}
  const status=get('liveState');status.textContent='HORS LIGNE';status.classList.remove('active');
 }finally{clearTimeout(timeout);}
}
refresh();
if(isUUID)setInterval(refresh,9000);
