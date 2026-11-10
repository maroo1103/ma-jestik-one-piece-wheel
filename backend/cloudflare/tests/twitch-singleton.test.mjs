// Prévenir une régression du bug F5 : un seul module d'état OAuth Twitch.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

function source(path) {
  return readFileSync(new URL('../../../dist/qg/' + path,import.meta.url),'utf8');
}
const modules=['qg.js','profil.js','defis.js','votes.js','tribunal-public.js','killathon-simple.js','challenge-proposals.js'];

test('un seul URL de module Twitch pour en-tête, profil et communauté',()=>{
  const occurrences=[];
  for(const moduleName of modules){
    const c=source(moduleName);
    for(const m of c.matchAll(/from\s*['"](\.\/twitch-auth\.js[^'"]*)['"]/g)) {
      occurrences.push({moduleName,url:m[1]});
    }
  }
  assert.ok(occurrences.some(x=>x.moduleName==='qg.js'),'module en-tête');
  assert.ok(occurrences.some(x=>x.moduleName==='profil.js'),'module Profil');
  assert.ok(occurrences.some(x=>x.moduleName==='tribunal-public.js'),'module Tribunal');
  assert.ok(occurrences.some(x=>x.moduleName==='votes.js'),'module Votes');
  assert.ok(occurrences.some(x=>x.moduleName==='killathon-simple.js'),'module Killathon');
  for(const {moduleName,url} of occurrences){
    assert.equal(url,'./twitch-auth.js',moduleName+' : ne pas ajouter de ?v= dans cet import');
  }
  const resolved=new Set(occurrences.map(x=>new URL(x.url,'https://ma-jestik.fr/qg/'+x.moduleName).href));
  assert.equal(resolved.size,1,'toutes les rubriques doivent partager une instance de module OAuth');
});

test('le HTML d’accueil charge la nouvelle version du routeur QG',()=>{
  const html=source('index.html');
  assert.match(html,/<script type="module" src="qg\.js\?v=20261110-twitch-singleton1"><\/script>/);
});

test('le jeton reste uniquement dans la session de l’onglet, sans localStorage',()=>{
  const auth=source('twitch-auth.js');
  assert.match(auth,/sessionStorage\.getItem\(k\)/);
  assert.match(auth,/sessionStorage\.setItem\(k,v\)/);
  assert.doesNotMatch(auth,/localStorage\.setItem\(KEY,/);
  assert.doesNotMatch(auth,/localStorage\.getItem\(KEY\)/);
});
