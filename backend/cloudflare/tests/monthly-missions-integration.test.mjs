import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker,{monthParis,monthBounds} from '../monthly-missions-worker.js';

function mockD1(db){
 return {prepare(sql){
  const statement=db.prepare(sql);
  return {bind(...values){return {
   async first(){return statement.get(...values)||null;},
   async all(){return {results:statement.all(...values)};},
   async run(){return {meta:{changes:Number(statement.run(...values).changes)}};}
  };}};
 }};
}
function request(path,{token,body}={}){
 return new Request('https://missions.test'+path,{
  method:body?'POST':'GET',
  headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},
  ...(body?{body:JSON.stringify(body)}:{})
 });
}
async function data(env,path,options){
 const r=await worker.fetch(request(path,options),env);
 return {status:r.status,body:await r.json()};
}
test('Mission : les activités dédoublonnées et résolues sont comptées côté D1 ; seul le propriétaire marque remis',async()=>{
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async (_url,opts)=>{
  const token=String(opts?.headers?.Authorization||'').replace(/^OAuth /,'');
  return Response.json({client_id:'client-test',user_id:token==='owner-token-123456'?'213078400':'123456789',expires_in:3600});
 };
 const db=new DatabaseSync(':memory:');
 try{
  db.exec('PRAGMA foreign_keys=ON;');
  db.exec("CREATE TABLE members(twitch_id TEXT PRIMARY KEY,display_name TEXT);"+
   "CREATE TABLE vote_rounds(id TEXT PRIMARY KEY,status TEXT NOT NULL);"+
   "CREATE TABLE vote_ballots(round_id TEXT,twitch_id TEXT,created_at INTEGER,PRIMARY KEY(round_id,twitch_id));"+
   "CREATE TABLE tribunal_polls(id TEXT PRIMARY KEY);"+
   "CREATE TABLE tribunal_votes(poll_id TEXT,twitch_id TEXT,created_at INTEGER,PRIMARY KEY(poll_id,twitch_id));");
  const {readFileSync}=await import('node:fs');
  const schema=readFileSync(new URL('../migrations/0008_monthly_missions.sql',import.meta.url),'utf8');
  db.exec(schema);
  const env={DB:mockD1(db),TWITCH_CLIENT_ID:'client-test',OWNER_TWITCH_ID:'213078400'};
  const month=monthParis(),bounds=monthBounds(month),now=Math.floor(Date.now()/1000);
  const since=Math.max(bounds.start,now-3600);
  db.prepare('INSERT INTO members(twitch_id,display_name) VALUES(?,?)').run('123456789','Test Membre');
  db.prepare("INSERT INTO monthly_missions(month,title,prediction_target,poll_target,bonus_coins,status,opened_at) VALUES(?,?,?,?,?,'open',?)").run(month,'Explorateur du QG',3,2,50,since);
  for(let i=0;i<3;i++){
   db.prepare('INSERT INTO vote_rounds(id,status) VALUES(?,?)').run('round-'+i,'resolved');
   db.prepare('INSERT INTO vote_ballots(round_id,twitch_id,created_at) VALUES(?,?,?)').run('round-'+i,'123456789',since+10);
  }
  db.prepare('INSERT INTO vote_rounds(id,status) VALUES(?,?)').run('round-in-progress','open');
  db.prepare('INSERT INTO vote_ballots(round_id,twitch_id,created_at) VALUES(?,?,?)').run('round-in-progress','123456789',since+10);
  for(let i=0;i<2;i++){
   db.prepare('INSERT INTO tribunal_polls(id) VALUES(?)').run('poll-'+i);
   db.prepare('INSERT INTO tribunal_votes(poll_id,twitch_id,created_at) VALUES(?,?,?)').run('poll-'+i,'123456789',since+10);
  }
  assert.throws(()=>db.prepare('INSERT INTO tribunal_votes(poll_id,twitch_id,created_at) VALUES(?,?,?)').run('poll-0','123456789',since+10));
  const member=await data(env,'/v1/monthly/me',{token:'member-token-123456'});
  assert.equal(member.status,200);
  assert.equal(member.body.progress.predictions,3); // la manche ouverte n'est pas comptée
  assert.equal(member.body.progress.polls,2);
  assert.equal(member.body.progress.complete,true);
  assert.equal(member.body.progress.paid,false);
  const denied=await data(env,'/v1/monthly/admin',{token:'member-token-123456'});
  assert.equal(denied.status,403);
  const beforeClose=await data(env,'/v1/monthly/admin/award',{token:'owner-token-123456',body:{month,twitch_id:'123456789',confirmed:true}});
  assert.equal(beforeClose.status,409);
  const admin=await data(env,'/v1/monthly/admin?month='+month,{token:'owner-token-123456'});
  assert.equal(admin.status,200);
  assert.equal(admin.body.totals.completed,1);
  assert.equal(admin.body.totals.awaiting,1);
  const closed=await data(env,'/v1/monthly/admin/close',{token:'owner-token-123456',body:{month}});
  assert.equal(closed.status,200);
  const paid=await data(env,'/v1/monthly/admin/award',{token:'owner-token-123456',body:{month,twitch_id:'123456789',confirmed:true}});
  assert.equal(paid.status,200);
  assert.equal(paid.body.coins,50);
  const duplicated=await data(env,'/v1/monthly/admin/award',{token:'owner-token-123456',body:{month,twitch_id:'123456789',confirmed:true}});
  assert.equal(duplicated.status,409);
  const after=await data(env,'/v1/monthly/me',{token:'member-token-123456'});
  assert.equal(after.body.progress.paid,true);
  db.prepare('DELETE FROM members WHERE twitch_id=?').run('123456789');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM monthly_awards').get().n,0); // effacement RGPD
 }finally{globalThis.fetch=originalFetch;db.close();}
});
