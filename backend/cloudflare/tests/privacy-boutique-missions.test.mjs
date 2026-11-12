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
  assert.match(privacy,/12 mois après la confirmation de la remise/);
  assert.match(privacy,/Les nettoyages automatiques concernés sont programmés chaque jour/);
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
  assert.match(router,/confidentialite\.js\?v=20261112-privacy-simplifiee1/);
  assert.match(html,/qg\.js\?v=20261112-privacy-simplifiee1/);
});

test('La purge des attestations de missions respecte le seuil de douze mois et ses garde-fous',()=>{
  const worker=source('backend/cloudflare/src/worker.js');
  assert.match(worker,/async function purgeMonthlyAwards\(env\)/);
  assert.match(worker,/MONTHLY_AWARDS_RETENTION_ENABLED/);
  assert.match(worker,/MONTHLY_AWARDS_RETENTION_DRY_RUN!=="false"/);
  assert.match(worker,/DELETE FROM monthly_awards WHERE paid_at<=unixepoch\('now','-12 months'\)/);
  assert.match(worker,/await purgeMonthlyAwards\(env\)/);
  assert.match(worker,/await purgeInactiveMembers\(env\)/);
  assert.match(worker,/await purgeTribunalRetention\(env\)/);
});

test('La simplification enlève uniquement les trois encadrés redondants',()=>{
  const privacy=source('dist/qg/confidentialite.js');
  assert.equal((privacy.match(/class="mj-privacy-detail"/g)||[]).length,1);
  assert.match(privacy,/L'identité civile du responsable et ses coordonnées postales ne sont pas encore publiées/);
  assert.match(privacy,/Les pages publiques sont accessibles sans connexion/);
  assert.match(privacy,/Les champs obligatoires sont signalés/);
  assert.match(privacy,/Les bases légales présentées comme envisagées restent à confirmer/);
  assert.match(privacy,/Les nettoyages automatiques concernés sont programmés chaque jour/);
  assert.match(privacy,/Les éventuels anciens sondages sans date de fin nécessitent une clôture manuelle/);
  assert.match(privacy,/durées de conservation des données techniques, notamment des journaux et sauvegardes/);
  assert.doesNotMatch(privacy,/Les prochaines exécutions programmées devront être surveillées/);
  assert.doesNotMatch(privacy,/elles ne doivent pas être confondues avec une promesse/);
});
