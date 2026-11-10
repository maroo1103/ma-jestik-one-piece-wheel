// Tests du cycle de vie Tribunal sur données fictives : jamais de production.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

async function loadWorker(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  return (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).default;
}
const membersWorker = await loadWorker('../src/worker.js');
const tribunalWorker = await loadWorker('../tribunal-worker.js');

function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec('PRAGMA foreign_keys=ON');
  sql.exec(readFileSync(new URL('../schema.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../migrations/0004_tribunal_public.sql', import.meta.url), 'utf8'));
  sql.prepare("INSERT INTO members(twitch_id,login,display_name) VALUES('111','alpha','Alpha')").run();
  sql.prepare("INSERT INTO members(twitch_id,login,display_name) VALUES('222','bravo','Bravo')").run();
  const db = {
    prepare(query) {
      const stmt = sql.prepare(query);
      return {
        args: [],
        bind(...args) {this.args=args;return this;},
        async run() { const d=stmt.run(...this.args); return {meta:{changes:Number(d.changes)}}; },
        async first() { return stmt.get(...this.args) ?? null; },
        async all() { return { results: stmt.all(...this.args) }; }
      };
    },
    async batch(stmts) {
      sql.exec('BEGIN');
      try {
        const result=[];
        for(const stmt of stmts)result.push(await stmt.run());
        sql.exec('COMMIT');
        return result;
      }catch(err){sql.exec('ROLLBACK');throw err;}
    }
  };
  return { sql, db };
}
const count=(sql,table,where='',args=[])=>sql.prepare('SELECT COUNT(*) AS n FROM '+table+(where?' WHERE '+where:'')).get(...args).n;
const insertProposal=(sql,id,status,age,resolved,linked=null)=>{
  sql.prepare(
    'INSERT INTO tribunal_proposals(id,author_twitch_id,author_name,question,answers_json,status,created_at,resolved_at,published_poll_id) '+
    "VALUES(?, '111', 'Alpha', 'Quel jeu ensuite ?', '[\"Oui\",\"Non\"]', ?, unixepoch('now',?), "+
    (resolved ? 'unixepoch(\'now\',?)' : 'NULL') + ', ?)'
  ).run(...(resolved?[id,status,age,resolved,linked]:[id,status,age,linked]));
};
const poll=(sql,id,created,ends=null,closed=null,proposed=null)=>{
  sql.prepare(
    'INSERT INTO tribunal_polls(id,question,answers_json,created_by_twitch_id,proposed_by_name,created_at,ends_at,closed_at) '+
    "VALUES(?, 'Un match de plus ?', '[\"Oui\",\"Non\"]', '222', ?, unixepoch('now',?), "+
    (ends ? "unixepoch('now',?)" : 'NULL') + ', ' +
    (closed ? "unixepoch('now',?)" : 'NULL') + ')'
  ).run(...[id,proposed,created,...(ends?[ends]:[]),...(closed?[closed]:[])]);
};

test('simulation Tribunal : compte sans suppression, même si des données ont expiré',async()=>{
  const {sql,db}=fixture();
  try{
    insertProposal(sql,'pending-old','pending','-4 months',null);
    poll(sql,'closed-old','-16 months','-14 months',null);
    sql.prepare("INSERT INTO tribunal_votes(poll_id,twitch_id,choice_index) VALUES('closed-old','111',0)").run();
    const env={DB:db,TRIBUNAL_RETENTION_ENABLED:'true',TRIBUNAL_RETENTION_DRY_RUN:'true'};
    await membersWorker.scheduled({},env);
    assert.equal(count(sql,'tribunal_proposals'),1);
    assert.equal(count(sql,'tribunal_polls'),1);
    assert.equal(count(sql,'tribunal_votes'),1);
    assert.equal(count(sql,'members'),2);
  }finally{sql.close();}
});

test('mode non activé : pas de suppression même avec dry-run false',async()=>{
  const {sql,db}=fixture();
  try{
    insertProposal(sql,'pending-old','pending','-4 months',null);
    await membersWorker.scheduled({}, {DB:db,TRIBUNAL_RETENTION_DRY_RUN:'false'});
    assert.equal(count(sql,'tribunal_proposals'),1);
  }finally{sql.close();}
});

test('retention 3/1/6/12 mois : purge ciblée, cascade, auteurs anonymisés, votes récents conservés',async()=>{
  const {sql,db}=fixture();
  try{
    insertProposal(sql,'pending-old','pending','-4 months',null);
    insertProposal(sql,'pending-new','pending','-1 month',null);
    insertProposal(sql,'rejected-old','rejected','-2 months','-45 days');
    insertProposal(sql,'rejected-new','rejected','-2 months','-15 days');
    insertProposal(sql,'accepted-old','accepted','-8 months','-7 months','accepted-poll');
    insertProposal(sql,'accepted-new','accepted','-3 months','-2 months','recent-poll');
    poll(sql,'accepted-poll','-8 months',null,null,'Alpha');
    poll(sql,'recent-poll','-3 months','+20 days',null,'Alpha');
    poll(sql,'closed-old','-18 months','+15 days','-13 months');
    poll(sql,'expired-old','-16 months','-13 months',null);
    poll(sql,'closed-new','-2 months','+1 month','-20 days');
    poll(sql,'legacy-unlimited','-20 months',null,null);
    for(const p of ['closed-old','expired-old','closed-new','legacy-unlimited']){
      sql.prepare('INSERT INTO tribunal_votes(poll_id,twitch_id,choice_index) VALUES(?,?,0)').run(p,'111');
      sql.prepare('INSERT INTO tribunal_votes(poll_id,twitch_id,choice_index) VALUES(?,?,1)').run(p,'222');
    }
    await membersWorker.scheduled({},{
      DB:db,TRIBUNAL_RETENTION_ENABLED:'true',TRIBUNAL_RETENTION_DRY_RUN:'false'
    });
    for(const id of ['pending-old','rejected-old','accepted-old']){
      assert.equal(count(sql,'tribunal_proposals','id=?',[id]),0,id);
    }
    for(const id of ['pending-new','rejected-new','accepted-new']){
      assert.equal(count(sql,'tribunal_proposals','id=?',[id]),1,id);
    }
    for(const id of ['closed-old','expired-old']){
      assert.equal(count(sql,'tribunal_polls','id=?',[id]),0,id);
      assert.equal(count(sql,'tribunal_votes','poll_id=?',[id]),0,id+' votes en cascade');
    }
    for(const id of ['closed-new','legacy-unlimited','accepted-poll','recent-poll']){
      assert.equal(count(sql,'tribunal_polls','id=?',[id]),1,id);
    }
    assert.equal(sql.prepare("SELECT proposed_by_name FROM tribunal_polls WHERE id='accepted-poll'").get().proposed_by_name,null);
    assert.equal(sql.prepare("SELECT proposed_by_name FROM tribunal_polls WHERE id='recent-poll'").get().proposed_by_name,'Alpha');
    assert.equal(count(sql,'tribunal_votes'),4);
    assert.equal(count(sql,'members'),2);
  }finally{sql.close();}
});

function mockAuth(id='111') {
  const previous = globalThis.fetch;
  globalThis.fetch=async url=>{
    if(String(url).includes('/oauth2/validate'))return Response.json({client_id:'abcdefghij1234',user_id:id,expires_in:3600});
    if(String(url).includes('/helix/users'))return Response.json({data:[{id,login:'Alpha',display_name:'Alpha'}]});
    throw new Error('Appel réseau inattendu');
  };
  return ()=>{globalThis.fetch=previous;};
}

test('API Tribunal : la durée 0 est refusée, une durée valide crée un sondage borné',async()=>{
  const {sql,db}=fixture();
  const restore=mockAuth();
  try{
    const env={DB:db,TWITCH_CLIENT_ID:'abcdefghij1234',OWNER_TWITCH_ID:'111'};
    const call=async duration=> tribunalWorker.fetch(new Request('https://example.test/v1/tribunal/polls',{
      method:'POST',
      headers:{Authorization:'Bearer aaaaabbbbbcccccdddd','Content-Type':'application/json'},
      body:JSON.stringify({question:'Quel sera notre prochain jeu ?',answers:['Oui','Non'],duration_minutes:duration})
    }),env);
    const blocked=await call(0);
    assert.equal(blocked.status,400);
    assert.equal(count(sql,'tribunal_polls'),0);
    const created=await call(10);
    assert.equal(created.status,201);
    assert.equal(count(sql,'tribunal_polls'),1);
    assert.equal(count(sql,'tribunal_polls','ends_at IS NULL'),0);
  }finally{restore();sql.close();}
});

test('interface Tribunal : aucune nouvelle option de durée illimitée exposée',()=>{
  const live=readFileSync(new URL('../../../dist/qg/tribunal-public.js',import.meta.url),'utf8');
  const demo=readFileSync(new URL('../../../dist/qg/tribunal.js',import.meta.url),'utf8');
  assert.equal(live.includes("['0','♾️ Sans limite']"),false);
  assert.equal(demo.includes('<option value="0">'),false);
  assert.equal(live.includes("Durée définie ou sans limite"),false);
});
