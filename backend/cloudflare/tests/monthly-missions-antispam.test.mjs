import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker,{monthParis,monthBounds} from '../monthly-missions-worker.js';

function d1Mock(db){
 let queryCount=0;
 return {
  get queryCount(){return queryCount;},
  prepare(sql){
   queryCount++;
   const statement=db.prepare(sql);
   return {bind(...params){return{
    async first(){return statement.get(...params)||null;},
    async all(){return {results:statement.all(...params)};},
    async run(){return {meta:{changes:Number(statement.run(...params).changes)}};}
   };}};
  }
 };
}
function fakeRequest(path,{token,ip='192.0.2.25'}={}){
 return new Request('https://ma-jestik-qg-missions.maroodu11.workers.dev'+path,{
  headers:{...(token?{Authorization:'Bearer '+token}:{}),'CF-Connecting-IP':ip,'Origin':'https://ma-jestik.fr'}
 });
}
async function json(env,path,options){
 const response=await worker.fetch(fakeRequest(path,options),env);
 return {status:response.status,body:await response.json(),headers:response.headers};
}
test('Anti-spam : F5 répété réutilise le résultat et isole les comptes Twitch',async()=>{
 const oldFetch=globalThis.fetch,oldCaches=globalThis.caches;
 const storage=new Map(),reads=[];
 globalThis.caches={default:{
  async match(request){reads.push(request.url);return storage.get(request.url)?.clone()||null;},
  async put(request,response){storage.set(request.url,response.clone());},
  async delete(request){return storage.delete(request.url);}
 }};
 let oauthChecks=0;
 globalThis.fetch=async (_url,options)=>{
  oauthChecks++;
  const token=String(options?.headers?.Authorization||'').replace(/^OAuth /,'');
  if(token==='token-member-one-12345')return Response.json({client_id:'client-test',user_id:'991100',expires_in:3600});
  if(token==='token-member-two-12345')return Response.json({client_id:'client-test',user_id:'991101',expires_in:3600});
  return new Response('{}',{status:401});
 };
 const db=new DatabaseSync(':memory:');
 try{
  db.exec('PRAGMA foreign_keys=ON;');
  db.exec("CREATE TABLE members(twitch_id TEXT PRIMARY KEY,display_name TEXT);"+
   "CREATE TABLE vote_rounds(id TEXT PRIMARY KEY,status TEXT);"+
   "CREATE TABLE vote_ballots(round_id TEXT,twitch_id TEXT,created_at INTEGER,PRIMARY KEY(round_id,twitch_id));"+
   "CREATE TABLE tribunal_polls(id TEXT PRIMARY KEY);"+
   "CREATE TABLE tribunal_votes(poll_id TEXT,twitch_id TEXT,created_at INTEGER,PRIMARY KEY(poll_id,twitch_id));");
  const {readFileSync}=await import('node:fs');
  db.exec(readFileSync(new URL('../migrations/0008_monthly_missions.sql',import.meta.url),'utf8'));
  const month=monthParis(),start=monthBounds(month).start;
  db.prepare('INSERT INTO members(twitch_id,display_name) VALUES(?,?)').run('991100','Membre A');
  db.prepare('INSERT INTO members(twitch_id,display_name) VALUES(?,?)').run('991101','Membre B');
  db.prepare("INSERT INTO monthly_missions(month,title,prediction_target,poll_target,bonus_coins,status,opened_at) VALUES(?,?,?,?,?,'open',?)")
   .run(month,'Explorateur de novembre',1,0,50,start);
  db.prepare("INSERT INTO vote_rounds(id,status) VALUES('first','resolved')").run();
  db.prepare('INSERT INTO vote_ballots(round_id,twitch_id,created_at) VALUES(?,?,?)').run('first','991100',start+60);
  const env={DB:d1Mock(db),TWITCH_CLIENT_ID:'client-test',OWNER_TWITCH_ID:'999888777'};
  const first=await json(env,'/v1/monthly/me',{token:'token-member-one-12345'});
  assert.equal(first.status,200);
  assert.equal(first.body.progress.predictions,1);
  assert.equal(first.headers.get('Cache-Control'),'no-store');
  const afterFirst=env.DB.queryCount;
  for(let i=0;i<8;i++){
   const again=await json(env,'/v1/monthly/me',{token:'token-member-one-12345'});
   assert.equal(again.status,200);
   assert.equal(again.body.progress.predictions,1);
  }
  assert.equal(env.DB.queryCount,afterFirst,'F5 répété ne doit pas relire D1');
  assert.equal(oauthChecks,9,'chaque restitution privée exige encore une validation OAuth');
  const other=await json(env,'/v1/monthly/me',{token:'token-member-two-12345'});
  assert.equal(other.status,200);
  assert.equal(other.body.progress.predictions,0,'pas de cache du membre A pour B');
  const noToken=await json(env,'/v1/monthly/me');
  assert.equal(noToken.status,401,'le cache privé ne contourne jamais Twitch');
  assert.ok([...storage.keys()].every(key=>!key.includes('token-member')&&!key.includes('OAuth')),'aucun token dans les clés de cache');
  assert.ok([...storage.keys()].some(key=>key.includes('991100')),'cache lié au compte');
  assert.equal(other.headers.get('Access-Control-Allow-Origin'),'https://ma-jestik.fr');
 }finally{
  db.close();globalThis.fetch=oldFetch;
  if(oldCaches===undefined)delete globalThis.caches;else globalThis.caches=oldCaches;
 }
});
test('Anti-spam : plus de 30 appels par minute depuis une IP sont refusés avant Twitch et D1',async()=>{
 const mock={queryCount:0,prepare(){this.queryCount++;throw Error('D1 ne doit pas être interrogée');}};
 const env={DB:mock,TWITCH_CLIENT_ID:'client-test',OWNER_TWITCH_ID:'999888777'};
 for(let i=0;i<30;i++){
  const r=await json(env,'/v1/monthly/no-such-route',{ip:'203.0.113.101'});
  assert.equal(r.status,404);
 }
 const rejected=await json(env,'/v1/monthly/no-such-route',{ip:'203.0.113.101'});
 assert.equal(rejected.status,429);
 assert.equal(rejected.headers.get('Retry-After'),'60');
 assert.equal(mock.queryCount,0);
 const nextIp=await json(env,'/v1/monthly/no-such-route',{ip:'203.0.113.102'});
 assert.equal(nextIp.status,404,'une autre IP n’est pas bloquée');
});
test('Le binding Cloudflare facultatif peut refuser avant toute lecture D1',async()=>{
 let called=0;
 const env={
  DB:{prepare(){throw Error('D1 ne doit pas être utilisée');}},
  TWITCH_CLIENT_ID:'client-test',OWNER_TWITCH_ID:'999888777',
  MISSION_RATE_LIMITER:{async limit({key}){called++;assert.ok(key.includes('192.0.2.66'));return{success:false};}}
 };
 const result=await json(env,'/v1/monthly/current',{ip:'192.0.2.66'});
 assert.equal(result.status,429);
 assert.equal(called,1);
});
