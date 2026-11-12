import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../../../'+path,import.meta.url),'utf8');
const paths=["dist/qg/index.html","dist/qg/qg.js","dist/qg/profil.js","dist/qg/contact.js","dist/qg/aide.js","dist/qg/setup-original/index.html","dist/qg/setup-original/fiche-produit.js","dist/roue.html"];
test('Site Ma_JesTik : aucun indicateur décoratif ↗ sur les liens et boutons',()=>{
  for(const path of paths)assert.doesNotMatch(read(path),/↗/,path);
});
test('Les liens importants et leur destination restent intacts',()=>{
  assert.match(read('dist/qg/index.html'),/href="https:\/\/www\.twitch\.tv\/Ma_Jestikk"/);
  assert.match(read('dist/qg/qg.js'),/href="#\/setup">EXPLORER MON SETUP/);
  assert.match(read('dist/qg/profil.js'),/https:\/\/www\.twitch\.tv\//);
  assert.match(read('dist/qg/profil.js'),/name="public_profile"/);
  assert.match(read('dist/qg/contact.js'),/href="#\/confidentialite"/);
  assert.match(read('dist/roue.html'),/id="sourcesButton"/);
  assert.match(read('dist/qg/setup-original/index.html'),/href="config-pc\.html\?v=/);
});
test('Les boutons de l’accueil restent centrés sans flèche',()=>{
  assert.match(read('dist/qg/home-premium.css'),/\.hq-hero-primary,\.hq-setup-cta\{justify-content:center\}/);
});
test('Les flèches fonctionnelles de pagination et de retour sont conservées',()=>{
  assert.match(read('dist/qg/tribunal-public.js'),/Suivantes →/);
  assert.match(read('dist/qg/contact.js'),/REVENIR AUX SUJETS/);
});
