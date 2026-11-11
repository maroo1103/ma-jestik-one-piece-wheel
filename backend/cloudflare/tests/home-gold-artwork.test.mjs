// Vérifie la nouvelle identité noire et dorée de l'accueil sans modifier la roue interactive.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";
const root=new URL("../../../",import.meta.url);
const src=p=>readFileSync(new URL(p,root),"utf8");
const bytes=p=>readFileSync(new URL(p,root));

test("La Roue : affiche premium 1200 × 630 enregistrée dans les sources du site",()=>{
 const png=bytes("dist/og/premium/roue.png");
 assert.ok(png.length>100000 && png.length<2000000);
 assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 assert.equal(png.readUInt32BE(16),1200);
 assert.equal(png.readUInt32BE(20),630);
 assert.match(src("dist/partage/roue/index.html"),/roue\.png\?v=20261110-gold2/);
 assert.doesNotMatch(src("dist/partage/roue/index.html"),/violette/);
 const svg=src("dist/og/roue.svg");
 assert.match(svg,/id="goldSlice"/);
 assert.doesNotMatch(svg,/id="violet"|#842a93|#481253/);
});

test("Setup : fond panoramique WebP noir et or, sans rectangle et avec version mobile",()=>{
 const webp=bytes("dist/qg/media/setup-banner-pc-gold.webp");
 assert.ok(webp.length>20000 && webp.length<500000);
 assert.equal(webp.toString("ascii",0,4),"RIFF");
 assert.equal(webp.toString("ascii",8,12),"WEBP");
 // Ne pas supprimer l'ancien visuel source, meme s'il n'est plus affiche.
 assert.ok(bytes("dist/qg/media/setup-tour-gold.webp").length>20000);
 const js=src("dist/qg/qg.js");
 assert.match(js,/class="hq-setup-showcase hq-setup-banner"/);
 assert.doesNotMatch(js,/media\/setup-tour-gold\.webp/);
 assert.doesNotMatch(js,/class="hq-setup-art"/);
 assert.match(js,/EXPLORER MON SETUP/);
 const css=src("dist/qg/home-premium.css");
 assert.match(css,/media\/setup-banner-pc-gold\.webp\?v=20261110-setup-banner1/);
 assert.match(css,/\.hq-setup-showcase\.hq-setup-banner/);
 assert.match(css,/background-size:cover,auto 100%/);
 assert.match(css,/background-position:center,right center/);
 assert.match(css,/font-size:clamp\(67px,6\.15vw,116px\)/);
 assert.match(css,/background-position:center,center,right var\(--setup-image-shift\) center/);
 assert.match(css,/@media\(max-width:850px\)/);
 assert.match(css, /background-size:cover,auto 405px/);
 assert.match(css, /background-size:cover,auto 320px/);
});

test("Accueil : les cinq affiches validees sont conservees et les ressources sont actualisees",()=>{
 const js=src("dist/qg/qg.js");
 assert.ok(js.includes("p.image+'-sans-url.webp?v=20261110-no-url1'"));
 for(const key of ["tribunal","defis","killathon","classement"]){
  assert.ok(js.includes("image:'"+key+"'"));
 }
 const html=src("dist/qg/index.html");
 assert.match(html,/qg\.js\?v=20261111-monthly-mission1/);
 assert.match(html,/home-premium\.css\?v=[a-zA-Z0-9-]+/);
});

test("Accueil : citation conservee et espaces verticaux reduits sur desktop et mobile",()=>{
 const js=src("dist/qg/qg.js");
 assert.match(js,/LES VICTOIRES PASSENT\. LES VALEURS RESTENT\./);
 assert.match(js,/PLUS QU’UN SIMPLE SITE GAMING/);
 const css=src("dist/qg/home-premium.css");
 assert.match(css,/Citation QG : hauteur compacte/);
 assert.match(css,/padding-top:clamp\(54px,5vw,80px\)/);
 assert.match(css,/padding-bottom:clamp\(54px,5vw,80px\)/);
 assert.match(css,/\.hq-intro\{padding:46px 22px 54px\}/);
});

test("Accueil : trois cartes d'activité panoramiques, statuts fiables et versions actuelles",()=>{
 const js=src("dist/qg/qg.js");
 const css=src("dist/qg/home-premium.css");
 const strip=src("dist/qg/activity-strip.js");
 assert.match(js,/hq-activity-board hq-activity-showcase/);
 assert.match(js,/LES INFOS UTILES/);
 assert.match(js,/EN UN COUP D’ŒIL/);
 for(const key of ["twitch","tribunal","defis"]){
  assert.ok(!js.includes('data-activity-title="'+key+'"'));
  assert.ok(js.includes('data-activity-detail="'+key+'"'));
  assert.ok(js.includes('data-activity-status="'+key+'"'));
 }
 assert.match(css,/Activité QG : cartes panoramiques/);
 assert.match(css,/hq-activity-ribbon/);
 assert.match(css,/width:100%;min-width:0;min-height:34px/);
 assert.match(css,/width:100%;max-width:none/);
 assert.match(css,/align-items:center;justify-content:center;width:100%;min-width:0;min-height:34px/);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:730px\)/);
 assert.match(strip,/const ACTIVITY_COPY/);
 assert.match(strip,/Statut indisponible/);
 assert.match(js,/Voir la chaîne/);
 assert.match(js,/Ouvrir le Tribunal/);
 assert.match(js,/Voir les défis/);
});

test("Accueil : enlever les grands titres mais conserver pastilles et états dynamiques",()=>{
 const js=src("dist/qg/qg.js");
 const css=src("dist/qg/home-premium.css");
 const strip=src("dist/qg/activity-strip.js");
 for(const name of ["twitch","tribunal","defis"]){
  assert.ok(js.includes('data-activity-status="'+name+'"'));
  assert.ok(js.includes('data-activity-detail="'+name+'"'));
  assert.ok(!js.includes('data-activity-title="'+name+'"'));
 }
 assert.match(js,/aria-live="polite"/);
 assert.match(strip,/function setState\(name,text,state='neutral'\)/);
 assert.match(strip,/const ACTIVITY_COPY/);
 assert.match(strip,/if\(copy&&detail\)detail.textContent=copy\[1\]/);
 assert.match(css,/display:flex;flex:0 1 auto;align-items:center;justify-content:center/);
 assert.match(css,/align-self:stretch;text-align:center/);
 assert.match(css,/font:600 clamp\(14px,1vw,17px\)/);
 assert.match(css,/display:inline-flex;align-self:center;align-items:center;justify-content:center/);
 assert.match(js,/Voir la chaîne/);
 assert.match(js,/Ouvrir le Tribunal/);
 assert.match(js,/Voir les défis/);
});

test("Accueil : cartes d'activité fines comme le cadrage validé, avec contenu conservé",()=>{
 const js=src("dist/qg/qg.js");
 const css=src("dist/qg/home-premium.css");
 const statuses=src("dist/qg/activity-strip.js");
 assert.match(css,/gap:0;min-height:132px;min-width:0;box-sizing:border-box/);
 assert.match(css,/padding:8px clamp\(10px,\.8vw,15px\)/);
 assert.match(css,/min-height:34px/);
 assert.match(css,/max-width:55ch;min-height:0/);
 assert.match(css,/margin:0 auto 4px/);
 assert.match(css,/min-height:32px/);
 assert.match(css,/\.hq-activity-showcase \.hq-activity-card\{min-height:0;padding:10px 12px\}/);
 for(const name of ["twitch","tribunal","defis"]){
  assert.ok(js.includes('data-activity-status="'+name+'"'));
  assert.ok(js.includes('data-activity-detail="'+name+'"'));
  assert.ok(!js.includes('data-activity-title="'+name+'"'));
 }
 assert.match(statuses,/function setState/);
});

test("Accueil : supprimer définitivement l'espacement historique entre les éléments des cartes",()=>{
 const css=src("dist/qg/home-premium.css");
 const js=src("dist/qg/qg.js");
 assert.match(css,/Neutralise l'ancien gap vertical de 14px/);
 assert.match(css,/gap:0;min-height:132px/);
 assert.match(css,/min-height:19px;max-width:100%/);
 assert.match(css,/margin:0 auto 4px/);
 assert.match(css,/margin-top:0;padding:6px 15px/);
 for(const name of ["twitch","tribunal","defis"]){
  assert.ok(js.includes('data-activity-status="'+name+'"'));
  assert.ok(js.includes('data-activity-detail="'+name+'"'));
 }
});

test("Accueil : Choisis ton aventure élargi sans toucher aux cinq affiches",()=>{
 const css=src("dist/qg/home-premium.css");
 const js=src("dist/qg/qg.js");
 assert.match(css,/max-width:1920px/);
 assert.match(css,/clamp\(20px,3\.9vw,76px\)/);
 assert.match(css,/\.hq-portal-featured\{grid-column:span 6\}/);
 assert.match(css,/\.hq-portal\{grid-column:span 4/);
 assert.match(css,/@media\(max-width:680px\)/);
 assert.match(css,/\.hq-portal-grid\{grid-template-columns:1fr/);
 assert.match(css,/\.hq-portal-summary\{font-size:clamp\(14px,\.94vw,16px\)/);
 assert.doesNotMatch(css,/\.hq-portal-cta::after/);
 assert.match(css,/text-decoration:underline/);
 assert.match(css,/margin-top:auto;padding-top:13px/);
 assert.ok(js.includes("p.image+'-sans-url.webp?v=20261110-no-url1'"));
 for(const name of ["roue","tribunal","defis","killathon","classement"]){
  assert.ok(js.includes("image:'"+name+"'"));
 }
 assert.equal((js.match(/featured:true/g)||[]).length,2);
});

test("Accueil : les cinq fichiers WebP sans URL existent et sont réellement utilisés",()=>{
 const js=src("dist/qg/qg.js");
 const css=src("dist/qg/home-premium.css");
 for(const name of ["roue","tribunal","defis","killathon","classement"]){
  const data=bytes("dist/og/"+name+"-sans-url.webp");
  assert.ok(data.length>10000,name+" : WebP absent ou vide");
  assert.equal(data.toString("ascii",0,4),"RIFF",name+" : conteneur RIFF invalide");
  assert.equal(data.toString("ascii",8,12),"WEBP",name+" : format WebP invalide");
  assert.ok(js.includes("image:'"+name+"'"),name+" absent de la page");
 }
 assert.ok(js.includes("p.image+'-sans-url.webp?v=20261110-no-url1'"));
 assert.match(css,/\.hq-portal-roue \.hq-portal-art img\{height:100%;object-fit:cover;object-position:center\}/);
 assert.equal((js.match(/featured:true/g)||[]).length,2);
 assert.match(src("dist/qg/index.html"),/og:image/);
});

test("Footer : maquette fidèlement reprise avec arcs dorés et bandeau intégré",()=>{
 const html=src("dist/qg/index.html");
 const js=src("dist/qg/qg.js");
 const css=src("dist/qg/footer-help.css");
 assert.match(html,/mj-footer-arc-top/);
 assert.match(html,/mj-footer-arc-bottom/);
 assert.match(html,/mj-footer-signoff/);
 assert.match(html,/À TRÈS VITE DANS LE QG\./);
 assert.doesNotMatch(js,/class="hq-endnote"/);
 assert.match(html,/mj-footer-column-heading/);
 for(const part of ["LE QG","COMMUNAUTÉ","AIDE &amp; INFOS"]){
  assert.ok(html.includes(part));
 }
 for(const path of ["#/accueil","#/roue","#/profil","#/setup","#/createur","#/defis","#/killathon","#/tribunal","#/classement","#/aide","#/apropos","#/contact","#/confidentialite"]){
  assert.ok(html.includes('href="'+path+'"'),"Lien de footer perdu : "+path);
 }
 assert.match(html,/Mentions légales · à compléter/);
 assert.match(html,/mj-footer-disclosure/);
 assert.match(css,/\.mj-footer-arc-bottom\{bottom:70px;right:-8px;transform:rotate\(180deg\)\}/);
 assert.match(css,/\.mj-footer-column-heading/);
 assert.match(html,/footer-help\.css\?v=[a-zA-Z0-9-]+/);
 assert.match(html,/qg\.js\?v=20261111-monthly-mission1/);
});


test("Identité MJ : logo animé léger avec repli fixe accessible",()=>{
 const html=src("dist/qg/index.html");
 const home=src("dist/qg/home-premium.css");
 const footer=src("dist/qg/footer-help.css");
 assert.equal((html.match(/<picture class="mj-brand-logo">/g)||[]).length,2);
 assert.equal((html.match(/mj-anime\.webp\?v=20261110-logo-anime1/g)||[]).length,2);
 assert.equal((html.match(/mj-source\.webp\?v=20261110-logo-anime1/g)||[]).length,2);
 assert.equal((html.match(/media="\(prefers-reduced-motion: no-preference\)"/g)||[]).length,2);
 for(const path of ["dist/icons/mj-anime.webp","dist/icons/mj-source.webp"]){
  const webp=bytes(path);
  assert.equal(webp.toString("ascii",0,4),"RIFF");
  assert.equal(webp.toString("ascii",8,12),"WEBP");
  assert.ok(webp.length<50000,"Logo non optimise : "+path);
 }
 assert.match(home,/\.site-header \.mj-brand-logo/);
 assert.match(footer,/\.mj-footer-brand-link \.mj-brand-logo/);
});


test("Boutique QG : catalogue Discord, route et interdictions visuelles",()=>{
 const html=src("dist/qg/index.html");
 const js=src("dist/qg/qg.js");
 const auth=src("dist/qg/twitch-auth.js");
 const shop=src("dist/qg/boutique.js");
 const css=src("dist/qg/boutique.css");
 assert.match(html,/boutique\.css\?v=20261111-reward-images1/);
 assert.match(html,/qg\.js\?v=20261111-monthly-mission1/);
 assert.match(html,/href="#\/boutique" data-page="boutique"/);
 assert.equal((html.match(/href="#\/boutique">Boutique &amp; récompenses/g)||[]).length,2);
 assert.match(js,/import \{boutiqueMarkup,mountBoutique,unmountBoutique\} from '.\/boutique\.js/);
 assert.match(js,/boutique:boutiqueMarkup/);
 assert.match(js,/boutique:'communaute'/);
 assert.match(js,/tribunal:'outils'/);
 assert.match(js,/qg-shop-active/);
 assert.match(auth,/'boutique'/);
 assert.match(shop,/const catalogUrl='https:\/\/discord\.com\/channels\/1296502783423414382\/1566446945189367818'/);
 assert.match(shop,/const orderUrl='https:\/\/discord\.com\/channels\/1296502783423414382\/1566447195673198703'/);
 assert.doesNotMatch(shop,/discordInvite/);
 for(const label of ["1 000 XP","VIP Twitch & Discord","Choisis mon prochain jeu","1 000 V-Bucks Fortnite","Passe de combat Fortnite","3 000","8 000","20 000","30 000","32 200"]){
  assert.ok(shop.includes(label),"Catalogue incomplet : "+label);
 }
 assert.match(shop,/\/argent/);
 assert.match(shop,/\/boutique/);
 assert.match(shop,/EXCLUSIF/);
 assert.match(shop,/STOCK LIMITÉ/);
 assert.match(shop,/RÉCOMPENSE SPÉCIALE/);
 assert.doesNotMatch(shop,/↗|external-link|<em|<i>|etc\./i);
 assert.match(css,/\.mj-shop \*\{font-style:normal\}/);
 assert.match(css,/\.mj-shop \.mj-shop-command\{font-style:italic\}/);
 assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:600px\)/);
});

test("Navigation : Tribunal dans Outils gaming et mise en évidence du salon discrète",()=>{
 const html=src("dist/qg/index.html");
 const css=src("dist/qg/boutique.css");
 const js=src("dist/qg/qg.js");
 const outils=html.match(/<div class="submenu" id="nav-outils">([\s\S]*?)<\/div>/)?.[1]||"";
 const communaute=html.match(/<div class="submenu" id="nav-communaute">([\s\S]*?)<\/div>/)?.[1]||"";
 assert.match(outils,/href="#\/tribunal" data-page="tribunal"/);
 assert.doesNotMatch(communaute,/href="#\/tribunal" data-page="tribunal"/);
 assert.match(communaute,/href="#\/boutique" data-page="boutique"/);
 assert.match(js,/tribunal:'outils'/);
 assert.match(css,/\.mj-shop-step p strong\{color:#dbc6a9;background:#24211d/);
 assert.doesNotMatch(css,/background:#3a3048/);
});

test("Boutique QG : cinq récompenses ouvrent des fiches natives accessibles",()=>{
 const shop=src("dist/qg/boutique.js");
 const css=src("dist/qg/boutique.css");
 const qg=src("dist/qg/qg.js");
 const html=src("dist/qg/index.html");
 assert.match(shop,/data-shop-reward/);
 assert.match(shop,/mj-shop-card-open/);
 assert.match(shop,/aria-haspopup="dialog"/);
 assert.match(shop,/<dialog id="mjShopDialog"/);
 assert.match(shop,/export function mountBoutique\(\)/);
 assert.match(shop,/export function unmountBoutique\(\)/);
 assert.match(shop,/dialog\.showModal\(\)/);
 assert.match(shop,/dialog\.close\(\)/);
 assert.match(shop,/aria-labelledby="mjShopDialogTitle"/);
 assert.match(shop,/aria-describedby="mjShopDialogDesc"/);
 assert.match(shop,/mj-shop-modal-close/);
 assert.match(shop,/if\(e\.target===dialog\)close\(\)/);
 assert.match(shop,/if\(trigger\?\.isConnected\)trigger\.focus\(\)/);
 assert.match(shop,/mj-shop-vbucks-art/);
 assert.match(shop,/Illustration stylisée de jetons V-Bucks Fortnite/);
 assert.match(shop,/const rewardDetails=\{/);
 assert.match(shop,/const orderUrl='https:\/\/discord\.com\/channels\/1296502783423414382\/1566447195673198703'/);
 assert.match(shop,/Achats, pièces et stocks gérés exclusivement par DraftBot/);
 assert.match(qg,/unmountBoutique\(\)/);
 assert.match(qg,/if\(page==='boutique'\)mountBoutique\(\)/);
 assert.match(qg,/boutique\.js\?v=20261111-clean-rewards1/);
 assert.match(html,/boutique\.css\?v=20261111-reward-images1/);
 assert.match(css,/\.mj-shop-dialog::backdrop/);
 assert.match(css,/@media\(max-width:740px\)/);
});


test("Boutique QG : images utilisateur des cinq récompenses, avec repli sûr",()=>{
 const shop=src("dist/qg/boutique.js");
 const css=src("dist/qg/boutique.css");
 const html=src("dist/qg/index.html");
 const qg=src("dist/qg/qg.js");
 const assets={
  xp:"6178-xp-blue-large.png",
  vip:"75527-twitch-vip.png",
  jeu:"Instant-gaming.pnj.png",
  vbucks:"372757-vbucksstack.png",
  pass:"2673-battlepass.png"
 };
 for(const [key,name] of Object.entries(assets)){
  assert.match(shop,new RegExp(key+":\\{src:'/qg/media/"+name.replaceAll(".","\\.")+"'"));
 }
 assert.match(shop,/function fallbackVisualMarkup\(reward\)/);
 assert.match(shop,/function visualMarkup\(reward\)/);
 assert.match(shop,/mj-shop-modal-owned-image/);
 assert.match(shop,/mj-shop-modal-fallback/);
 assert.match(shop,/ownedImage\.addEventListener\('error',showFallback/);
 assert.match(shop,/if\(ownedImage\.complete&&!ownedImage\.naturalWidth\)showFallback\(\)/);
 assert.match(css,/\.mj-shop-modal-owned-image\{/);
 assert.match(css,/\.mj-shop-modal-fallback\[hidden\]\{display:none\}/);
 assert.match(html,/boutique\.css\?v=20261111-reward-images1/);
 assert.match(qg,/boutique\.js\?v=20261111-clean-rewards1/);
});


test("Classement QG : primes mensuelles visibles uniquement comme projet, sans faux gagnants",()=>{
 const html=src("dist/qg/index.html");
 const main=src("dist/qg/qg.js");
 const rewards=src("dist/qg/ranking-rewards.js");
 const style=src("dist/qg/ranking-rewards.css");
 assert.match(main,/import \{monthlyRewardsMarkup\} from '\.\/ranking-rewards\.js\?v=20261111-monthly-mission1'/);
 assert.match(main,/'recompenses-mensuelles':monthlyRewardsMarkup/);
 assert.doesNotMatch(main,/<\/section><\/section>'\+monthlyRewardsMarkup\(\)/);
 assert.match(main,/fetch\(voteApi\+'\/v1\/ranking'/); // classement général inchangé
 assert.match(rewards,/export function monthlyRewardsMarkup\(\)/);
 assert.doesNotMatch(rewards,/EN PRÉPARATION|DraftBot/);
 for(const value of ["300","200","100","75","60","50","40","30","20","10"]){
  assert.ok(rewards.includes(value),"Prime manquante : "+value);
 }
 assert.match(rewards,/chaque membre qui termine la mission/);
 assert.match(rewards,/remises après vérification du classement/);
 assert.match(rewards,/pièces Discord/);
 assert.match(rewards,/href="#\/boutique"/);
 assert.doesNotMatch(rewards,/fetch\(|localStorage|sessionStorage|data-member-id/);
 assert.ok(!rewards.includes('/adminargent'));
 assert.match(html,/ranking-rewards\.css\?v=20261111-monthly-mission1/);
 assert.match(html,/qg\.js\?v=20261111-monthly-mission1/);
 assert.match(style,/\.mj-monthly-rewards-grid\{display:grid/);
 assert.match(style,/@media\(max-width:600px\)/);
});


test("Récompenses mensuelles : page indépendante dans Communauté, classement préservé",()=>{
 const html=src("dist/qg/index.html");
 const main=src("dist/qg/qg.js");
 const auth=src("dist/qg/twitch-auth.js");
 const rewards=src("dist/qg/ranking-rewards.js");
 const css=src("dist/qg/ranking-rewards.css");
 const community=html.match(/<div class="submenu" id="nav-communaute">([\s\S]*?)<\/div>/)?.[1]||"";
 assert.match(community,/href="#\/recompenses-mensuelles" data-page="recompenses-mensuelles"/);
 assert.equal((html.match(/href="#\/recompenses-mensuelles">Récompenses mensuelles/g)||[]).length,2);
 assert.match(main,/recompenses-mensuelles':'Récompenses mensuelles'/);
 assert.match(main,/'recompenses-mensuelles':'communaute'/);
 assert.match(main,/classement:ranking,'recompenses-mensuelles':monthlyRewardsMarkup/);
 assert.doesNotMatch(main,/<\/section><\/section>'\+monthlyRewardsMarkup\(\)/);
 assert.match(main,/fetch\(voteApi\+'\/v1\/ranking'/);
 assert.match(auth,/'recompenses-mensuelles'/);
 assert.match(rewards,/<h1 id="mjMonthlyRewardsTitle">/);
 assert.match(css,/\.mj-monthly-rewards-hero h1\{/);
 assert.match(html,/ranking-rewards\.css\?v=20261111-monthly-mission1/);
 assert.match(html,/qg\.js\?v=20261111-monthly-mission1/);
});


test("Récompenses mensuelles : top 10 motivant, budget plafonné et sections sans faux résultats",()=>{
 const main=src("dist/qg/qg.js");
 const page=src("dist/qg/ranking-rewards.js");
 const style=src("dist/qg/ranking-rewards.css");
 const html=src("dist/qg/index.html");
 const payouts=[300,200,100,75,60,50,40,30,20,10];
 assert.equal(payouts.reduce((a,b)=>a+b,0),885);
 assert.equal((page.match(/rank:\d+,place:/g)||[]).length,10);
 for(let rank=1;rank<=10;rank++)assert.match(page,new RegExp("rank:"+rank+",place:"));
 for(let i=0;i<payouts.length;i++)assert.match(page,new RegExp("coins:"+payouts[i]+"(?:,|\\})"));
 assert.match(page,/totalCoins=rewards\.reduce/);
 assert.match(page,/rewards\.slice\(0,3\)\.map\(podiumCard\)/);
 assert.match(page,/rewards\.slice\(3\)\.map\(rewardRow\)/);
 for(const section of ['COMMENT','PARTICIPER','LA MISSION','DU MOIS','RÈGLES','CONDITIONS','LES PLACES À DÉCROCHER']){
  assert.ok(page.includes(section),"Section manquante : "+section);
 }
 assert.match(page,/Les pronostics et les votes sont vérifiés automatiquement/);
 assert.doesNotMatch(page,/DraftBot|EN PRÉPARATION|Ce programme n’est pas encore actif|Aucune conversion libre des points QG/);
 assert.doesNotMatch(page,/fetch\(|localStorage|sessionStorage|\/adminargent/);
 assert.match(main,/'recompenses-mensuelles':monthlyRewardsMarkup/);
 assert.doesNotMatch(main,/<\/section><\/section>'\+monthlyRewardsMarkup\(\)/);
 assert.match(style,/\.mj-monthly-rewards-rank-row\{/);
 assert.match(style,/\.mj-monthly-rewards-challenge\{/);
 assert.match(style,/\.mj-monthly-rewards-rules-list\{/);
 assert.match(style,/@media\(max-width:600px\)/);
 assert.match(html,/ranking-rewards\.css\?v=20261111-monthly-mission1/);
 assert.match(html,/qg\.js\?v=20261111-monthly-mission1/);
});

test("Nettoyage demandé : aucun doublon dans les cinq fiches et accroche défis multijeux",()=>{
 const shop=src("dist/qg/boutique.js");
 const qg=src("dist/qg/qg.js");
 const monthly=src("dist/qg/ranking-rewards.js");
 assert.doesNotMatch(shop,/mj-shop-modal-art-note/);
 assert.doesNotMatch(shop,/\(reward\.condition\?'<p class="mj-shop-modal-condition"/);
 assert.match(shop,/mj-shop-modal-notice/);
 assert.match(qg,/summary:'Des défis à relever en solo ou en équipe, sur différents jeux !'/);
 assert.doesNotMatch(qg,/118 défis Zero Build/);
 assert.match(monthly,/PIÈCES À GAGNER PAR MOIS/);
 const tiers=[300,200,100,75,60,50,40,30,20,10];
 assert.equal(tiers.reduce((a,b)=>a+b,0),885);
});

test("Mission du mois : données serveur et gestion manuelle depuis le QG",()=>{
 const html=src("dist/qg/index.html"),main=src("dist/qg/qg.js"),page=src("dist/qg/ranking-rewards.js");
 const client=src("dist/qg/monthly-missions.js");
 assert.match(html,/name="majestik-monthly-api"/);
 assert.match(page,/id="mjMonthlyMission"/);
 assert.match(main,/unmountMonthlyMissions\(\)/);
 assert.match(main,/if\(page==='recompenses-mensuelles'\)mountMonthlyMissions\(\)/);
 for(const x of ['/v1/monthly/me','/v1/monthly/admin','/v1/monthly/current','data-mission-action="award"','DÉJÀ versé']){
  assert.ok(client.includes(x),x);
 }
 assert.doesNotMatch(client,/localStorage|sessionStorage/);
});
