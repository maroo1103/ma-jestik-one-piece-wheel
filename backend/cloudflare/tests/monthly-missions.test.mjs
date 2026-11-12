import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import monthlyWorker,{monthParis,monthBounds} from '../monthly-missions-worker.js';
import {DatabaseSync} from 'node:sqlite';

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
 const source=readFileSync(new URL('../monthly-missions-worker.js',import.meta.url),'utf8');
 for(const phrase of [
  "if(!identity.owner)return respond({error:'Réservé au propriétaire du QG'},403)",
  "RESOLVED_PREDICTION_EVENTS_SQL",
  "FROM vote_ballots b JOIN vote_rounds r",
  "FROM vote_ballots_warzone b JOIN vote_rounds_warzone r",
  "FROM vote_ballots_verdansk b JOIN vote_rounds_verdansk r",
  "r.status='resolved'",
  ".join(' UNION ALL ')",
  "FROM tribunal_votes v JOIN tribunal_polls",
  "status='closed'",
  "ON CONFLICT(month,twitch_id) DO NOTHING",
  "if(status.paid)return",
  "const MAX_BONUS=50",
  "if(path==='/v1/monthly/current'&&req.method==='GET')"
 ]) assert.ok(source.includes(phrase),phrase);
 assert.ok(!source.includes('discord.com/api'));
});


/* Intégration SQLite et vraies routes Worker, uniquement en mémoire :
   5 jeux, participation gagnante ou perdante, fenêtres temporelles et liste
   des membres éligibles. Aucune requête D1 ou Discord de production. */
test('missions mensuelles : Fortnite + quatre Warzone, progression membre et validation propriétaire identiques',async()=>{
 const sql=new DatabaseSync(':memory:');
 const originalFetch=globalThis.fetch;
 try {
  sql.exec('PRAGMA foreign_keys=ON');
  for(const name of ['schema.sql','migrations/0002_defi_votes.sql','migrations/0004_tribunal_public.sql','migrations/0008_monthly_missions.sql','migrations/0009_warzone_votes.sql','migrations/0010_verdansk_votes.sql']){
   sql.exec(readFileSync(new URL('../'+name,import.meta.url),'utf8'));
  }
  const month=monthParis(),{start,end}=monthBounds(month);
  const open=start+3600,close=end-3600;
  const ids=['111','222','333'];
  for(const id of ids)sql.prepare('INSERT INTO members(twitch_id,login,display_name) VALUES(?,?,?)').run(id,'viewer'+id,'Viewer '+id);
  sql.prepare("INSERT INTO monthly_missions(month,title,prediction_target,poll_target,bonus_coins,status,opened_at,closed_at) VALUES(?,?,?,?,?,'closed',?,?)").run(month,'Défis communautaires',3,2,50,open,close);
  const predictions=[
   ['vote_rounds','vote_ballots','fortnite','fn-1','111','success','failure',open+100,'resolved'],
   ['vote_rounds_warzone','vote_ballots_warzone','warzone-hajin','hj-1','111','failure','success',open+200,'resolved'],
   ['vote_rounds_warzone','vote_ballots_warzone','warzone-zodiac','zc-1','111','success','failure',open+300,'resolved'],
   ['vote_rounds_warzone','vote_ballots_warzone','warzone-rebirth','rb-1','111','failure','success',open+400,'resolved'],
   ['vote_rounds_verdansk','vote_ballots_verdansk','warzone-verdansk','vd-1','111','success','failure',open+500,'resolved'],
   ['vote_rounds_warzone','vote_ballots_warzone','warzone-hajin','hj-2','222','success','failure',open+600,'resolved'],
   ['vote_rounds_warzone','vote_ballots_warzone','warzone-zodiac','zc-2','222','failure','success',open+700,'resolved'],
   ['vote_rounds_verdansk','vote_ballots_verdansk','warzone-verdansk','vd-2','222','success','failure',open+800,'resolved'],
   // Ces trois participations ne doivent PAS compter.
   ['vote_rounds_verdansk','vote_ballots_verdansk','warzone-verdansk','vd-open','222','success',null,open+900,'open'],
   ['vote_rounds','vote_ballots','fortnite','fn-before','222','success','failure',open-5,'resolved'],
   ['vote_rounds_warzone','vote_ballots_warzone','warzone-rebirth','rb-after','222','success','failure',close+5,'resolved']
  ];
  for(const [rounds,ballots,game,round,id,prediction,result,when,status] of predictions){
   sql.prepare('INSERT INTO '+rounds+'(id,game,challenge_id,challenge_title,team,status,result,created_at) VALUES(?,?,1,?,?,?, ?,?)')
     .run(round,game,'Défi '+round,'solo',status,result,when-60);
   sql.prepare('INSERT INTO '+ballots+'(round_id,twitch_id,prediction,created_at) VALUES(?,?,?,?)').run(round,id,prediction,when);
  }
  // Tous deux ont effectivement participé à deux sondages pendant la saison.
  for(const poll of ['poll-a','poll-b']){
   sql.prepare('INSERT INTO tribunal_polls(id,question,answers_json,created_by_twitch_id,created_at) VALUES(?,?,?,?,?)')
     .run(poll,'Choix communautaire ?','["Oui","Non"]','111',open+30);
   for(const id of ['111','222'])sql.prepare('INSERT INTO tribunal_votes(poll_id,twitch_id,choice_index,created_at) VALUES(?,?,0,?)').run(poll,id,open+150);
  }
  const db={
   prepare(query){
    const prepared=sql.prepare(query);
    return {
     bind(...args){return{
      async first(){return prepared.get(...args)??null;},
      async all(){return {results:prepared.all(...args)};},
      async run(){const result=prepared.run(...args);return {meta:{changes:Number(result.changes)}};}
     };},
     async first(){return prepared.get()??null;},
     async all(){return {results:prepared.all()};}
    };
   }
  };
  let identity='222';
  globalThis.fetch=async url=>{
   assert.match(String(url),/id\.twitch\.tv\/oauth2\/validate/);
   return Response.json({client_id:'test-client',user_id:identity,expires_in:3600});
  };
  const env={DB:db,TWITCH_CLIENT_ID:'test-client',OWNER_TWITCH_ID:'111'};
  const get=async path=>{
   const res=await monthlyWorker.fetch(new Request('https://example.test'+path,{
    method:'GET',headers:{Authorization:'Bearer testaccesstoken123456'}
   }),env);
   assert.equal(res.status,200,await res.clone().text());
   return res.json();
  };
  const player=await get('/v1/monthly/me');
  assert.equal(player.progress.predictions,3,'Warzone sans Fortnite atteint 3 pronostics');
  assert.equal(player.progress.polls,2);
  assert.equal(player.progress.complete,true);
  identity='111';
  const all=await get('/v1/monthly/admin?month='+month);
  const map=Object.fromEntries(all.players.map(p=>[p.twitch_id,p]));
  assert.equal(map['111'].predictions,5,'cinq jeux reconnus, même en se trompant');
  assert.equal(map['222'].predictions,3,'Warzone seul reconnu dans l’administration');
  assert.equal(map['222'].complete,true);
  assert.equal(all.totals.completed,2);
  assert.equal(all.totals.awaiting,2);
  assert.ok(!map['333'],'aucune activité ne crée pas de fausse récompense');
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM monthly_awards').get().n,0,'aucune récompense distribuée');
 }finally{
  globalThis.fetch=originalFetch;
  sql.close();
 }
});
