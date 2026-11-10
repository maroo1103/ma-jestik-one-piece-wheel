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
 assert.match(js,/p\.image==='roue'\?'20261110-gold2':'20261109-artworks2'/);
 for(const key of ["tribunal","defis","killathon","classement"]){
  assert.ok(js.includes("image:'"+key+"'"));
 }
 const html=src("dist/qg/index.html");
 assert.match(html,/qg\.js\?v=20261110-activity-clean3/);
 assert.match(html,/home-premium\.css\?v=20261110-activity-slim4/);
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
 assert.match(css,/width:100%;min-width:0;min-height:42px/);
 assert.match(css,/width:100%;max-width:none/);
 assert.match(css,/align-items:center;justify-content:center;width:100%;min-width:0;min-height:42px/);
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
 assert.match(css,/min-height:174px;min-width:0;box-sizing:border-box/);
 assert.match(css,/padding:clamp\(10px,\.8vw,15px\)/);
 assert.match(css,/min-height:42px/);
 assert.match(css,/max-width:49ch;min-height:0/);
 assert.match(css,/margin:0 auto 8px/);
 assert.match(css,/min-height:34px/);
 assert.match(css,/\.hq-activity-showcase \.hq-activity-card\{min-height:188px\}/);
 for(const name of ["twitch","tribunal","defis"]){
  assert.ok(js.includes('data-activity-status="'+name+'"'));
  assert.ok(js.includes('data-activity-detail="'+name+'"'));
  assert.ok(!js.includes('data-activity-title="'+name+'"'));
 }
 assert.match(statuses,/function setState/);
});
