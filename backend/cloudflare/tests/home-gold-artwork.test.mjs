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

test("Setup : vraie tour PC WebP noir et or, alternative descriptive et intégration responsive",()=>{
 const webp=bytes("dist/qg/media/setup-tour-gold.webp");
 assert.ok(webp.length>20000 && webp.length<500000);
 assert.equal(webp.toString("ascii",0,4),"RIFF");
 assert.equal(webp.toString("ascii",8,12),"WEBP");
 const js=src("dist/qg/qg.js");
 assert.match(js,/media\/setup-tour-gold\.webp\?v=20261110-gold1/);
 assert.doesNotMatch(js,/media\/setup-icon-premium\.svg/);
 assert.match(js,/width="980" height="838"/);
 const css=src("dist/qg/home-premium.css");
 assert.match(css,/Accueil noir et or/);
 assert.match(css,/mask-image:radial-gradient/);
 assert.match(css,/@media\(max-width:680px\)/);
});

test("Accueil : la roue premium seulement, sans altérer les 4 autres affiches",()=>{
 const js=src("dist/qg/qg.js");
 assert.match(js,/p\.image==='roue'\?'20261110-gold2':'20261109-artworks2'/);
 assert.match(js,/image:'tribunal'/);
 assert.match(js,/image:'defis'/);
 assert.match(js,/image:'killathon'/);
 assert.match(js,/image:'classement'/);
 const html=src("dist/qg/index.html");
 assert.match(html,/qg\.js\?v=20261110-gold-home2/);
 assert.match(html,/home-premium\.css\?v=20261110-gold-setup1/);
});
