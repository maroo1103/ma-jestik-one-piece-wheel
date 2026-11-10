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
 assert.match(html,/qg\.js\?v=20261110-setup-banner1/);
 assert.match(html,/home-premium\.css\?v=20261110-setup-balance1/);
});
