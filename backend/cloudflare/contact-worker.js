// Ma_JesTik — Worker de contact indépendant. Le secret Resend reste dans Cloudflare.
// Installer TURNSTILE_SECRET dans les secrets Cloudflare avant toute mise en service.
const ORIGIN='https://ma-jestik.fr', TO='contact@ma-jestik.fr';
const FROM='Ma_JesTik — Contact <contact@ma-jestik.fr>';
const MAX_FILES=6, MAX_FILE=5*1024*1024, MAX_TOTAL=12*1024*1024, MAX_REQUEST=14*1024*1024;
const CATEGORIES={
  support:['site','roue','defis','killathon','tribunal','autre'],
  compte:['connexion','profil','confidentialite','classement','autre'],
  idees:['fonctionnalite','roue','defis','design','autre'],
  collaboration:['stream','communaute','partenariat','autre'],
  autre:['question','signalement','information','autre']
};
const LABELS={
  support:'Support technique',compte:'Mon compte',idees:'Suggestions & idées',
  collaboration:'Collaborations',autre:'Autre demande'
};
const TYPES={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',pdf:'application/pdf'};
function answer(body,status=200,cors=false){
  const headers=new Headers({'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'no-referrer','Vary':'Origin'});
  if(cors){
    headers.set('Access-Control-Allow-Origin',ORIGIN);
    headers.set('Access-Control-Allow-Methods','POST,OPTIONS');
    headers.set('Access-Control-Allow-Headers','Content-Type');
  }
  return new Response(JSON.stringify(body),{status,headers});
}
function input(form,key,max){
  const value=form.get(key);
  return typeof value==='string'&&value.length<=max?value.trim():null;
}
function validEmail(s){
  return typeof s==='string'&&s.length<=254&&/^[^\s@<>\r\n]{1,64}@[a-z0-9.-]+\.[a-z]{2,63}$/i.test(s);
}
function safeName(s){return String(s||'').replace(/[\\/\x00-\x1f\x7f<>:"|?*]/g,'_').slice(0,110);}
function magic(ext,b){
  if(ext==='png')return b.length>=8&&b.slice(0,8).every((v,i)=>v===[137,80,78,71,13,10,26,10][i]);
  if(ext==='jpg'||ext==='jpeg')return b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255;
  if(ext==='pdf')return b.length>=5&&String.fromCharCode(...b.slice(0,5))==='%PDF-';
  if(ext==='webp')return b.length>=12&&String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';
  return false;
}
function base64(bytes){
  let raw='';
  for(let i=0;i<bytes.length;i+=32768)raw+=String.fromCharCode(...bytes.subarray(i,i+32768));
  return btoa(raw);
}
async function checkTurnstile(req,env,token){
  if(!env.TURNSTILE_SECRET||!token||token.length>2048)return false;
  const params=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token});
  const ip=req.headers.get('CF-Connecting-IP');
  if(ip)params.set('remoteip',ip);
  const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
    method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:params,signal:AbortSignal.timeout(9000)
  });
  if(!verify.ok)return false;
  const result=await verify.json();
  return result?.success===true&&result.hostname==='ma-jestik.fr'&&result.action==='majestik_contact';
}
export default {
  async fetch(req,env){
    const path=new URL(req.url).pathname,origin=req.headers.get('Origin');
    const cors=origin===ORIGIN;
    if(path==='/v1/health'&&req.method==='GET')return answer({status:'ok',service:'ma-jestik-contact'});
    if(path!=='/v1/contact')return answer({error:'Route inconnue'},404,cors);
    if(!cors)return answer({error:'Origine interdite'},403);
    if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{
      'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'POST,OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'
    }});
    if(req.method!=='POST')return answer({error:'Méthode interdite'},405,true);
    // Aucun envoi possible sans la clé Resend ET le secret anti-spam.
    if(!env.RESEND_API_KEY||!env.TURNSTILE_SECRET)return answer({error:'Service non configuré'},503,true);
    if(!(req.headers.get('Content-Type')||'').toLowerCase().startsWith('multipart/form-data;'))
      return answer({error:'Format de formulaire invalide'},415,true);
    const requestLength=Number(req.headers.get('Content-Length')||0);
    if(Number.isFinite(requestLength)&&requestLength>MAX_REQUEST)
      return answer({error:'Pièces jointes trop volumineuses'},413,true);
    try {
      const form=await req.formData();
      const category=input(form,'category',35),topic=input(form,'topic',40);
      const pseudo=input(form,'pseudo',80),email=input(form,'email',254);
      const message=input(form,'message',4000),trap=input(form,'website',200);
      const token=input(form,'cf-turnstile-response',2048);
      if(!category||!Object.hasOwn(CATEGORIES,category)||!topic||!CATEGORIES[category].includes(topic)
        ||pseudo===null||!validEmail(email)||!message||message.length<20||trap===null)
        return answer({error:'Formulaire invalide, vérifie les champs'},400,true);
      // Un champ invisible rempli par un bot n'envoie pas d'e-mail.
      if(trap!=='')return answer({sent:true},200,true);
      if(!(await checkTurnstile(req,env,token)))
        return answer({error:'Vérification anti-spam échouée. Recommence la vérification.'},403,true);
      const files=form.getAll('attachments');
      if(files.length>MAX_FILES)return answer({error:'Maximum : 6 fichiers'},413,true);
      let total=0;
      const attachments=[];
      for(const file of files){
        if(!(file instanceof File)||file.size===0||file.size>MAX_FILE)
          return answer({error:'Chaque fichier doit peser 5 Mo maximum'},413,true);
        total+=file.size;
        if(total>MAX_TOTAL)return answer({error:'Total des pièces jointes supérieur à 12 Mo'},413,true);
        const filename=safeName(file.name),ext=filename.split('.').pop()?.toLowerCase();
        if(!Object.hasOwn(TYPES,ext)||file.type!==TYPES[ext])
          return answer({error:'Format de fichier interdit'},415,true);
        const bytes=new Uint8Array(await file.arrayBuffer());
        if(!magic(ext,bytes))return answer({error:'Contenu du fichier invalide'},415,true);
        attachments.push({filename,content:base64(bytes),content_type:TYPES[ext]});
      }
      const subject='[Ma_JesTik] '+LABELS[category]+' — '+topic;
      const text=[
        'Nouvelle demande depuis le QG Ma_JesTik','',
        'Catégorie : '+LABELS[category],'Sujet : '+topic,
        'Pseudo : '+(pseudo||'Non renseigné'),'Adresse de réponse : '+email,
        '','Message :',message,'','Pièces jointes : '+attachments.length
      ].join('\n');
      const payload={from:FROM,to:[TO],reply_to:email,subject,text,
        ...(attachments.length?{attachments}:{})};
      const sent=await fetch('https://api.resend.com/emails',{
        method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},
        body:JSON.stringify(payload),signal:AbortSignal.timeout(18000)
      });
      if(!sent.ok){
        console.error('Resend contact HTTP status',sent.status);
        return answer({error:'Envoi momentanément indisponible. Réessaie ou écris à contact@ma-jestik.fr.'},502,true);
      }
      const result=await sent.json();
      if(!result?.id)return answer({error:'Confirmation d’envoi indisponible'},502,true);
      return answer({sent:true,reference:String(result.id).slice(0,80)},200,true);
    } catch(error){
      console.error('Contact Worker error',String(error?.name||'error').slice(0,50));
      return answer({error:'Service momentanément indisponible'},503,true);
    }
  }
};
