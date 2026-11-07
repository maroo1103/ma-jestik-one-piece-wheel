/* Killathon OBS compact : même lien public de lecture seule, sans jeton Twitch. */
const api=(document.querySelector('meta[name="majestik-killathon-api"]')?.content||'').replace(/\/$/,'');
const id=new URLSearchParams(location.search).get('id')||'';
const isUUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
const get=n=>document.getElementById(n);
let lastOk=false,inflight=false;
async function refresh(){
 if(!isUUID){get('error').textContent='Lien OBS invalide.';get('error').hidden=false;return;}
 if(inflight)return;
 inflight=true;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);
 try{
  const r=await fetch(api+'/v1/killathon/public/'+encodeURIComponent(id),{mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal});
  if(r.status===404){
   get('kills').textContent='—';get('goal').textContent='—';
   get('progress').style.width='0%';
   get('progressTrack').setAttribute('aria-valuenow','0');
   get('error').textContent='Ce Killathon est terminé. Utilise le nouveau lien OBS.';
   get('error').hidden=false;lastOk=false;return;
  }
  if(!r.ok)throw Error('Indisponible');
  const data=(await r.json())?.killathon;
  if(!data||!Number.isFinite(Number(data.kills))||!Number.isFinite(Number(data.goal)))throw Error('Données invalides');
  const kills=Math.max(0,Math.min(999999,Math.floor(Number(data.kills))));
  const goal=Math.max(1,Math.min(9999,Math.floor(Number(data.goal))));
  const percent=Math.min(100,Math.round(kills/goal*100));
  get('kills').textContent=String(kills);
  get('goal').textContent=String(goal);
  get('progress').style.width=percent+'%';
  get('progressTrack').setAttribute('aria-valuenow',String(percent));
  get('error').hidden=true;lastOk=true;
 }catch{
  if(!lastOk){get('error').textContent='Compteur temporairement indisponible.';get('error').hidden=false;}
 }finally{clearTimeout(timer);inflight=false;}
}
void refresh();
if(isUUID)setInterval(()=>{void refresh();},9000);
