import test from 'node:test';
import assert from 'node:assert/strict';
import {monthParis,monthBounds} from '../monthly-missions-worker.js';

test('Mois mensuels Europe/Paris : novembre 2026 inclut la transition UTC+1',()=>{
 const november=monthBounds('2026-11');
 assert.equal(november.start,Date.parse('2026-10-31T23:00:00Z')/1000);
 assert.equal(november.end,Date.parse('2026-11-30T23:00:00Z')/1000);
 assert.equal(monthParis(new Date('2026-10-31T23:30:00Z')),'2026-11');
});
test('Mois mensuels Europe/Paris : avril 2027 utilise UTC+2',()=>{
 const april=monthBounds('2027-04');
 assert.equal(april.start,Date.parse('2027-03-31T22:00:00Z')/1000);
 assert.equal(april.end,Date.parse('2027-04-30T22:00:00Z')/1000);
 assert.throws(()=>monthBounds('2026-13'));
});
test('Contrats de protection API : consultation publique limitée et validation côté serveur',()=>{
 // Statiques complémentaires à compléter par des tests avec D1 émulé avant lancement réel.
 const source=await import('node:fs').then(x=>x.readFileSync(new URL('../monthly-missions-worker.js',import.meta.url),'utf8'));
 for(const phrase of [
  "if(!identity.owner)return respond({error:'Réservé au propriétaire du QG'},403)",
  "SELECT COUNT(*) AS n FROM vote_ballots",
  "r.status='resolved'",
  "FROM tribunal_votes v JOIN tribunal_polls",
  "status='closed'",
  "ON CONFLICT(month,twitch_id) DO NOTHING",
  "if(status.paid)return",
  "const MAX_BONUS=50",
  "if(path==='/v1/monthly/current'&&req.method==='GET')"
 ]) assert.ok(source.includes(phrase),phrase);
 assert.ok(!source.includes('discord.com/api'));
});
