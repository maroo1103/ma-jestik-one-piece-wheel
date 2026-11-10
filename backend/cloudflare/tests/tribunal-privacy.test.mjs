// API droit d'accès/effacement Tribunal : uniquement des données fictives SQLite.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';

const source=readFileSync(new URL('../tribunal-worker.js',import.meta.url),'utf8');
const worker=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).default;

function fixture(){
 const sql=new DatabaseSync(':memory:');
 sql.exec('PRAGMA foreign_keys=ON');
 sql.exec(readFileSync(new URL('../schema.sql',import.meta.url),'utf8'));
 sql.exec(readFileSync(new URL('../migrations/0004_tribunal_public.sql',import.meta.url),'utf8'));
 for(const [id,name] of [['111','Alpha'],['222','Bravo']]){
  sql.prepare('INSERT INTO members(twitch_id,login,display_name) VALUES(?,?,?)').run(id,name,name);
 }
 for(const [id,creator,proposer] of [
  ['direct333','333',null],['proposed333','222','Charlie'],['other222','222',null]
 ]){
  sql.prepare("INSERT INTO tribunal_polls(id,question,answers_json,created_by_twitch_id,proposed_by_name) VALUES(?, 'Quel jeu pour le prochain live ?', '[\"Oui\",\"Non\"]', ?, ?)").run(id,creator,proposer);
 }
 for(const [id,author,status,linked] of [
  ['prop333','333','accepted','proposed333'],
  ['pending333','333','pending',null],
  ['prop111','111','pending',null]
 ]){
  sql.prepare("INSERT INTO tribunal_proposals(id,author_twitch_id,author_name,question,answers_json,status,published_poll_id) VALUES(?, ?, 'Charlie', 'Quel jeu pour le prochain live ?', '[\"Oui\",\"Non\"]', ?, ?)").run(id,author,status,linked);
 }
 for(const [pollId,id] of [
  ['direct333','333'],['direct333','111'],
  ['proposed333','333'],['proposed333','111'],
  ['other222','111'],['other222','222']
 ]){
  sql.prepare('INSERT INTO tribunal_votes(poll_id,twitch_id,choice_index) VALUES(?,?,0)').run(pollId,id);
 }
 const db={
  prepare(query){
   const stmt=sql.prepare(query);
   return {
    args:[],bind(...args){this.args=args;return this;},
    async first(){return stmt.get(...this.args)||null;},
    async all(){return {results:stmt.all(...this.args)};},
    async run(){const r=stmt.run(...this.args);return {meta:{changes:Number(r.changes)}};}
   };
  },
  async batch(statements){
   sql.exec('BEGIN');
   try{
    const result=[];
    for(const s of statements)result.push(await s.run());
    sql.exec('COMMIT');return result;
   }catch(e){sql.exec('ROLLBACK');throw e;}
  }
 };
 return {sql,db};
}
function mockTwitch(){
 const previous=globalThis.fetch;
 globalThis.fetch=async url=>{
  if(String(url).includes('/oauth2/validate'))return Response.json({client_id:'abcdefghij1234',user_id:'333',expires_in:3600});
  if(String(url).includes('/helix/users'))return Response.json({data:[{id:'333',login:'Charlie',display_name:'Charlie'}]});
  throw new Error('Appel inattendu');
 };
 return ()=>{globalThis.fetch=previous;};
}
const env=db=>({DB:db,TWITCH_CLIENT_ID:'abcdefghij1234',OWNER_TWITCH_ID:'111',ALLOWED_ORIGIN:'https://ma-jestik.fr'});
const req=(method,authenticated=true,origin='https://ma-jestik.fr')=>new Request('https://worker.example/v1/tribunal/me/data',{
 method,headers:{...(authenticated?{Authorization:'Bearer aaaaabbbbbcccccdddd'}:{}),'Origin':origin}
});
const n=(sql,table,where='',args=[])=>sql.prepare('SELECT COUNT(*) AS n FROM '+table+(where?' WHERE '+where:'')).get(...args).n;

test('Tribunal : personne sans profil, consultation limitée à ses comptes',async()=>{
 const {sql,db}=fixture(),restore=mockTwitch();
 try{
  assert.equal(n(sql,'members','twitch_id=?',['333']),0,'Charlie n’a pas de profil QG');
  const response=await worker.fetch(req('GET'),env(db));
  assert.equal(response.status,200);
  const data=await response.json();
  assert.deepEqual(data.participations,{votes:2,proposals:2,polls_created:1,polls_proposed:1});
  assert.equal('twitch_id' in data,false,'ne pas renvoyer l’identifiant interne');
  assert.equal(n(sql,'tribunal_votes'),6,'aucune modification lors de la consultation');
 }finally{restore();sql.close();}
});

test('Tribunal : effacement de ses seules participations, sans perte des sondages ni votes tiers',async()=>{
 const {sql,db}=fixture(),restore=mockTwitch();
 try{
  const response=await worker.fetch(req('DELETE'),env(db));
  assert.equal(response.status,200);
  const data=await response.json();
  assert.equal(data.deleted,true);
  assert.equal(data.votes,2);
  assert.equal(data.proposals,2);
  assert.equal(n(sql,'tribunal_votes','twitch_id=?',['333']),0);
  assert.equal(n(sql,'tribunal_proposals','author_twitch_id=?',['333']),0);
  assert.equal(n(sql,'tribunal_votes'),4,'les votes des autres restent');
  assert.equal(n(sql,'tribunal_proposals','author_twitch_id=?',['111']),1,'la proposition d’un autre reste');
  assert.equal(n(sql,'tribunal_polls'),3,'les sondages publics restent');
  assert.equal(sql.prepare("SELECT created_by_twitch_id FROM tribunal_polls WHERE id='direct333'").get().created_by_twitch_id,'');
  assert.equal(sql.prepare("SELECT proposed_by_name FROM tribunal_polls WHERE id='proposed333'").get().proposed_by_name,null);
  assert.equal(sql.prepare("SELECT created_by_twitch_id FROM tribunal_polls WHERE id='other222'").get().created_by_twitch_id,'222');
  assert.equal(n(sql,'members'),2,'aucun compte QG supprimé');
  const next=await worker.fetch(req('DELETE'),env(db));
  assert.equal(next.status,200,'effacement idempotent');
  assert.equal((await next.json()).votes,0);
 }finally{restore();sql.close();}
});

test('Tribunal : refus de l’accès ou effacement sans session Twitch validée',async()=>{
 const {sql,db}=fixture();
 try{
  const before=n(sql,'tribunal_votes');
  for(const method of ['GET','DELETE']){
   const response=await worker.fetch(req(method,false),env(db));
   assert.equal(response.status,401);
  }
  assert.equal(n(sql,'tribunal_votes'),before);
  assert.equal(n(sql,'tribunal_proposals'),3);
 }finally{sql.close();}
});

test('Tribunal : origine non autorisée rejetée même avec jeton valide',async()=>{
 const {sql,db}=fixture();
 try{
  const response=await worker.fetch(req('DELETE',true,'https://evil.example'),env(db));
  assert.equal(response.status,403);
  assert.equal(n(sql,'tribunal_votes'),6);
 }finally{sql.close();}
});
