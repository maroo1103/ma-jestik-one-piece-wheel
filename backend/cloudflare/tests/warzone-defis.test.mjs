/* Vérification de 400 défis Warzone, préservation de Fortnite et des favoris locaux. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {WARZONE_CHALLENGES,WARZONE_CHALLENGE_GAMES} from '../../../dist/qg/warzone-challenges.mjs';
import {VERDANSK_POIS} from '../../../dist/warzone-verdansk.mjs';
const here=dirname(fileURLToPath(import.meta.url));
const source=path=>readFileSync(resolve(here,'../../..',path),'utf8');

test('quatre catalogues Warzone complets, 100 défis chacun, 20 par composition',()=>{
 assert.deepEqual(Object.keys(WARZONE_CHALLENGES).sort(),['warzone-hajin','warzone-rebirth','warzone-verdansk','warzone-zodiac']);
 for(const [game,rows] of Object.entries(WARZONE_CHALLENGES)){
  assert.equal(rows.length,100,game);
  assert.deepEqual(rows.map(x=>x[0]),Array.from({length:100},(_,i)=>i+1));
  assert.equal(new Set(rows.map(x=>x[1].toLocaleLowerCase('fr-FR'))).size,100,'Titres dupliqués '+game);
  assert.equal(new Set(rows.map(x=>x[2].toLocaleLowerCase('fr-FR'))).size,100,'Règles dupliquées '+game);
  for(const t of ['solo','duo','trio','quatuor','all'])
   assert.equal(rows.filter(x=>x[5]===t).length,20,game+' / '+t);
  for(const row of rows){
   assert.equal(row.length,6);
   assert.ok(row[1].length>3&&row[2].length>20);
   assert.ok(['Facile','Moyen','Difficile'].includes(row[3]));
   assert.ok(['Combat','Survie','Stratégie','Duo','Trio','Quatuor'].includes(row[4]));
   assert.doesNotMatch(row[1]+row[2],/\{[a-zA-Z]+\}/,'Variable POI non renseignée');
  }
  assert.ok(rows.some(row=>row[2].includes(WARZONE_CHALLENGE_GAMES[game].a)),'POI manquant');
 }
});

test('les défis sont spécifiques à chaque carte et gardent les POI officiels',()=>{
 assert.match(WARZONE_CHALLENGE_GAMES['warzone-hajin'].a,/Chang-san Air Base/);
 assert.equal(WARZONE_CHALLENGE_GAMES['warzone-zodiac'].a,'Admin');
 assert.equal(WARZONE_CHALLENGE_GAMES['warzone-rebirth'].a,'Bioweapons');
 assert.equal(WARZONE_CHALLENGE_GAMES['warzone-verdansk'].a,'Dam');
 assert.equal(VERDANSK_POIS.length,21);
 const verdansk=WARZONE_CHALLENGES['warzone-verdansk'];
 for(const poi of VERDANSK_POIS){
  assert.ok(verdansk.some(row=>(row[1]+' '+row[2]).includes(poi)),'Lieu Verdansk absent : '+poi);
 }
 assert.ok(verdansk.some(x=>x[1].includes('Drone Labs')));

 const sets=Object.values(WARZONE_CHALLENGES);
 for(let i=0;i<sets.length;i++)for(let j=i+1;j<sets.length;j++){
  assert.ok(sets[i].filter((row,k)=>row[2]!==sets[j][k][2]).length>=20,'Les règles doivent être adaptées selon la carte');
 }
});

test('écran Défis préserve les 118 Fortnite et copie les mêmes composants pour Warzone',()=>{
 const ui=source('dist/qg/defis.js');
 const match=/export const FORTNITE_CHALLENGES = (\[\[.*\]\]);/.exec(ui);
 assert.ok(match,'Catalogue Fortnite conservé');
 const fortnite=JSON.parse(match[1]);
 assert.equal(fortnite.length,118);
 assert.equal(fortnite[0][1],'Le survivant');
 assert.equal(fortnite[117][1],"L'équipage invincible");
 assert.match(ui,/const STORE_KEY = "ma_jestik_qg_defis_fortnite_v1"/);
 assert.match(ui,/gameStoreKey=game=>game==='fortnite'\?STORE_KEY/);
 assert.match(ui,/WARZONE_CHALLENGES\[selectedGame\]/);
 assert.match(ui,/Object\.entries\(WARZONE_CHALLENGE_GAMES\)/);
 assert.match(ui,/gameCatalogue\(\)\.filter\(eligible\)/);
 assert.match(ui,/data\.enabled=action==="enable-all"\?gameCatalogue\(\)/);
 for(const text of ['challenge-stats','challenge-columns','challenge-filters','challengeCurrent','challengeCatalogue','challengeVoteSlot'])
  assert.ok(ui.includes(text),'L\u0027interface manque '+text);
 assert.doesNotMatch(ui,/challengeViewerForm|Proposition viewer|data-action="mode"/);
 assert.match(ui,/mountChallengeProposals/);
 const qg=source('dist/qg/qg.js'),html=source('dist/qg/index.html');
 assert.match(qg,/defis\.js\?v=20261112-verdansk-challenges1/);
 assert.match(html,/qg\.js\?v=20261113-profil-v4-ownerhero/);
});

test('votes Warzone et Fortnite correctement séparés avec la même interface',()=>{
 const ui=source('dist/qg/defis.js'),votes=source('dist/qg/votes.js');
 const worker=source('backend/cloudflare/src/worker.js');
 const proposals=source('dist/qg/challenge-proposals.js');
 assert.match(votes,/return \{game,challenge_id:/);
 assert.match(ui,/await votePanel\?\.publishCurrent\(\)/);
 assert.match(worker,/vote_rounds_warzone/);
 assert.match(worker,/WARZONE_VOTE_GAMES/);
 assert.match(worker,/vote_rounds_verdansk/);
 assert.match(worker,/vote_points_verdansk/);
 assert.match(votes,/warzone-verdansk/);
 assert.match(proposals,/⊛V⊛/);
 assert.match(ui,/warzone-challenges\.mjs\?v=20261112-verdansk-challenges1/);
 const migration=source('backend/cloudflare/migrations/0010_verdansk_votes.sql');
 assert.match(migration,/CHECK\(game='warzone-verdansk'\)/);
 assert.match(migration,/REFERENCES members\(twitch_id\) ON DELETE CASCADE/);
 assert.doesNotMatch(migration,/DROP TABLE|ALTER TABLE/i);
 assert.match(proposals,/getGame/);
 assert.match(proposals,/GAME_MARKERS/);
});
