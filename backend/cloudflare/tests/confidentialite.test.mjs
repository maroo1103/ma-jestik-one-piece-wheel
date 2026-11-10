import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = path => readFileSync(new URL("../../../dist/qg/"+path,import.meta.url),"utf8");

test("confidentialité : route et liens du pied de page sur ordinateur et mobile",()=>{
 const router=read("qg.js"),html=read("index.html");
 assert.match(router,/import \{privacyMarkup,mountPrivacy\} from '\.\/confidentialite\.js\?v=/);
 assert.match(router,/confidentialite:privacyMarkup/);
 assert.match(router,/page==='confidentialite'\)mountPrivacy/);
 assert.equal((html.match(/href="#\/confidentialite">Confidentialité<\/a>/g)||[]).length,2);
 assert.match(html,/confidentialite\.css\?v=/);
 assert.match(html,/qg\.js\?v=20261110-confidentialite1/);
});

test("confidentialité : information essentielle avant la collecte du formulaire",()=>{
 const contact=read("contact.js");
 assert.match(contact,/href="#\/confidentialite" target="_blank" rel="noopener noreferrer"/);
});

test("confidentialité : transparence sur les purges et les points légaux à finaliser",()=>{
 const page=read("confidentialite.js");
 assert.match(page,/mode simulation/);
 assert.match(page,/aucune purge réelle n'est activée/);
 assert.match(page,/L'identité civile du responsable/);
 assert.match(page,/contact@ma-jestik\.fr/);
 assert.match(page,/Cloudflare/);
 assert.match(page,/Resend/);
 assert.match(page,/OVHcloud/);
 assert.match(page,/Twitch/);
 assert.match(page,/CNIL/);
 assert.doesNotMatch(page,/\[À (COMPLÉTER|VÉRIFIER|VALIDER)\]/);
 assert.doesNotMatch(page,/Charbonneau|EM-494-AS|ZVD1FI6LRE0J/);
});

test("confidentialité : OAuth reconnaît la page",()=>{
 const auth=read("twitch-auth.js");
 assert.match(auth,/routes=new Set\(\[[^\]]*'confidentialite'/);
});
