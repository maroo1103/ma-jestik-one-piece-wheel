/* Information confidentialité : contrôle de la boutique externe et des missions, sans appel réseau ni D1. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const source=path=>readFileSync(resolve(root,path),'utf8');

test('La politique détaille les missions, les remises et la boutique Discord',()=>{
  const privacy=source('dist/qg/confidentialite.js');
  assert.match(privacy,/datetime="2026-11-12"/);
  assert.match(privacy,/Missions &amp; récompenses mensuelles/);
  assert.match(privacy,/Boutique &amp; récompenses Discord/);
  assert.match(privacy,/DraftBot/);
  assert.match(privacy,/pronostics résolus et aux votes du Tribunal/);
  assert.match(privacy,/le mois, ton identifiant Twitch, le nombre de pièces et la date/);
  assert.match(privacy,/Aucun versement de pièces Discord n'est automatisé/);
  assert.match(privacy,/Aucune durée autonome de conservation ni purge dédiée n'est encore fixée/);
  assert.match(privacy,/La suppression du compte QG ne supprime pas ton compte Discord/);
});

test('Les sept sections et leur navigation restent inchangées',()=>{
  const privacy=source('dist/qg/confidentialite.js');
  for(const id of ['responsable','donnees','finalites','destinataires','durees','droits','stockage']){
    assert.match(privacy,new RegExp('id="mj-privacy-'+id+'"'));
    assert.match(privacy,new RegExp('data-privacy-jump="'+id+'"'));
  }
  assert.match(privacy,/contact@ma-jestik\.fr/);
});

test('La vitrine Discord reste indépendante des paiements du QG',()=>{
  const shop=source('dist/qg/boutique.js');
  const worker=source('backend/cloudflare/monthly-missions-worker.js');
  assert.match(shop,/discord\.com\/channels\//);
  assert.doesNotMatch(shop,/\bfetch\s*\(/);
  assert.match(worker,/INSERT INTO monthly_awards/);
  assert.match(worker,/paid_at/);
});

test('Le QG référence la nouvelle politique malgré le cache navigateur',()=>{
  const router=source('dist/qg/qg.js');
  const html=source('dist/qg/index.html');
  assert.match(router,/confidentialite\.js\?v=20261112-privacy-rewards1/);
  assert.match(html,/qg\.js\?v=20261112-privacy-rewards1/);
});
