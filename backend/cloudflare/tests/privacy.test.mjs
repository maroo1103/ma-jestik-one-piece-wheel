// Tests hors production : vraie base SQLite en mémoire, aucun accès Cloudflare/Discord.
// Exécution : node --experimental-sqlite --test backend/cloudflare/tests/privacy.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const source = readFileSync(new URL('../src/worker.js', import.meta.url), 'utf8');
// Le Worker est autonome : import de son module JS sans bundler Cloudflare.
const { default: worker } = await import(
  'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
);

function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec('PRAGMA foreign_keys=ON');
  for (const path of [
    '../schema.sql',
    '../migrations/0002_defi_votes.sql',
    '../migrations/0003_killathon_simple.sql',
    '../migrations/0004_tribunal_public.sql',
    '../migrations/0005_member_profiles.sql',
    '../migrations/0006_member_profile_palette.sql',
    '../migrations/0007_member_activity.sql',
    '../migrations/0009_warzone_votes.sql',
    '../migrations/0010_verdansk_votes.sql',
    '../migrations/0011_member_profile_region.sql',
  ]) sql.exec(readFileSync(new URL(path, import.meta.url), 'utf8'));

  const d1 = {
    beforeBatch: null,
    prepare(statement) {
      const compiled = sql.prepare(statement);
      const bound = {
        args: [],
        bind(...values) { this.args = values; return this; },
        async run() { const result = compiled.run(...this.args); return { meta: { changes: Number(result.changes) } }; },
        async first() { return compiled.get(...this.args) ?? null; },
        async all() { return { results: compiled.all(...this.args) }; },
      };
      return bound;
    },
    async batch(statements) {
      if (this.beforeBatch) { const f = this.beforeBatch; this.beforeBatch = null; f(); }
      sql.exec('BEGIN');
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        sql.exec('COMMIT');
        return results;
      } catch (e) {
        sql.exec('ROLLBACK');
        throw e;
      }
    },
  };

  for (const [id, name] of [['111', 'Alpha'], ['222', 'Bravo']]) {
    sql.prepare('INSERT INTO members(twitch_id,login,display_name) VALUES(?,?,?)').run(id, name.toLowerCase(), name);
    sql.prepare('INSERT INTO member_activity(twitch_id,last_active_at) VALUES(?,unixepoch())').run(id);
    sql.prepare('INSERT INTO member_profiles(twitch_id) VALUES(?)').run(id);
    sql.prepare('INSERT INTO killathon_simple(twitch_id,public_id) VALUES(?,?)').run(id, 'public-' + id);
  }
  sql.exec("INSERT INTO vote_rounds(id,game,challenge_id,challenge_title,team) VALUES('round1','fortnite',1,'Mon défi','solo')");
  for (const id of ['111', '222']) {
    sql.prepare("INSERT INTO vote_ballots(round_id,twitch_id,prediction) VALUES('round1',?,'success')").run(id);
    sql.prepare("INSERT INTO vote_points(round_id,twitch_id,points) VALUES('round1',?,1)").run(id);
  }

  for (const [id, owner, name] of [['poll1', '111', 'Alpha'], ['poll2', '222', 'Bravo']]) {
    sql.prepare("INSERT INTO tribunal_polls(id,question,answers_json,created_by_twitch_id,proposed_by_name) VALUES(?,'Quel jeu ensuite ?','[\"Oui\",\"Non\"]',?,?)").run(id, owner, name);
    sql.prepare("INSERT INTO tribunal_proposals(id,author_twitch_id,author_name,question,answers_json,status,published_poll_id) VALUES(?,?,?,'Quel jeu ensuite ?','[\"Oui\",\"Non\"]','accepted',?)")
      .run('proposal-' + owner, owner, name, id);
  }
  for (const [poll, member] of [['poll1','111'], ['poll1','222'], ['poll2','111'], ['poll2','222']]) {
    sql.prepare('INSERT INTO tribunal_votes(poll_id,twitch_id,choice_index) VALUES(?,?,0)').run(poll, member);
  }
  const env = { DB: d1, TWITCH_CLIENT_ID: 'client-123', ACTIVITY_TRACKING_ENABLED: 'true' };
  return { sql, d1, env };
}

function count(sql, table, where = '', params = []) {
  return sql.prepare('SELECT COUNT(*) AS n FROM ' + table + (where ? ' WHERE ' + where : '')).get(...params).n;
}

function mockTwitchUser(id) {
  const original = globalThis.fetch;
  globalThis.fetch = async url => {
    if (String(url).includes('/oauth2/validate')) {
      return Response.json({ client_id: 'client-123', user_id: id, expires_in: 3600 });
    }
    if (String(url).includes('/helix/users')) {
      return Response.json({ data: [{ id, login: 'alpha', display_name: 'Alpha', profile_image_url: '' }] });
    }
    throw new Error('Unexpected outbound request');
  };
  return () => { globalThis.fetch = original; };
}

test('DELETE /v1/me efface les données personnelles et conserve les votes des autres', async () => {
  const { sql, env } = fixture();
  const restore = mockTwitchUser('111');
  try {
    const res = await worker.fetch(new Request('https://example.test/v1/me', {
      method: 'DELETE', headers: { Authorization: 'Bearer aaaabbbbccccdddd' },
    }), env);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { deleted: true });

    for (const table of ['members','member_activity','member_profiles','killathon_simple','vote_ballots','vote_points']) {
      assert.equal(count(sql, table, 'twitch_id=?', ['111']), 0, table);
      assert.equal(count(sql, table, 'twitch_id=?', ['222']), 1, table + ' : autre membre');
    }
    assert.equal(count(sql, 'tribunal_votes', 'twitch_id=?', ['111']), 0);
    assert.equal(count(sql, 'tribunal_votes', 'twitch_id=?', ['222']), 2);
    assert.equal(count(sql, 'tribunal_proposals', 'author_twitch_id=?', ['111']), 0);
    assert.equal(count(sql, 'tribunal_proposals', 'author_twitch_id=?', ['222']), 1);
    assert.equal(count(sql, 'tribunal_polls'), 2);
    assert.deepEqual({...sql.prepare("SELECT created_by_twitch_id,proposed_by_name FROM tribunal_polls WHERE id='poll1'").get()},
      { created_by_twitch_id: '', proposed_by_name: null });
    assert.deepEqual({...sql.prepare("SELECT created_by_twitch_id,proposed_by_name FROM tribunal_polls WHERE id='poll2'").get()},
      { created_by_twitch_id: '222', proposed_by_name: 'Bravo' });
    assert.equal(count(sql, 'vote_rounds'), 1);
  } finally { restore(); sql.close(); }
});

test('suppression atomique : une erreur conserve toutes les données', async () => {
  const { sql, env } = fixture();
  sql.exec("CREATE TRIGGER prevent_delete BEFORE DELETE ON tribunal_proposals BEGIN SELECT RAISE(ABORT,'blocked'); END");
  const restore = mockTwitchUser('111');
  try {
    const res = await worker.fetch(new Request('https://example.test/v1/me', {
      method: 'DELETE', headers: { Authorization: 'Bearer aaaabbbbccccdddd' },
    }), env);
    assert.equal(res.status, 500);
    assert.equal(count(sql, 'members'), 2);
    assert.equal(count(sql, 'tribunal_votes', 'twitch_id=?', ['111']), 2);
    assert.equal(count(sql, 'tribunal_proposals', 'author_twitch_id=?', ['111']), 1);
    assert.equal(sql.prepare("SELECT proposed_by_name FROM tribunal_polls WHERE id='poll1'").get().proposed_by_name, 'Alpha');
  } finally { restore(); sql.close(); }
});

test('purge désactivée et simulation : aucun membre supprimé', async () => {
  const { sql, env } = fixture();
  sql.exec("UPDATE member_activity SET last_active_at=unixepoch('now','-7 months') WHERE twitch_id='111'");
  try {
    await worker.scheduled({}, env);
    assert.equal(count(sql,'members'),2);
    env.MEMBER_PURGE_ENABLED = 'true';
    env.MEMBER_PURGE_DRY_RUN = 'true';
    await worker.scheduled({}, env);
    assert.equal(count(sql,'members'),2);
  } finally { sql.close(); }
});

test('purge active : seuls les comptes inactifs depuis six mois sont effacés', async () => {
  const { sql, env } = fixture();
  sql.exec("UPDATE member_activity SET last_active_at=unixepoch('now','-7 months') WHERE twitch_id='111'");
  env.MEMBER_PURGE_ENABLED = 'true';
  env.MEMBER_PURGE_DRY_RUN = 'false';
  try {
    await worker.scheduled({}, env);
    assert.equal(count(sql, 'members','twitch_id=?',['111']), 0);
    assert.equal(count(sql, 'members','twitch_id=?',['222']), 1);
    assert.equal(count(sql, 'tribunal_votes','twitch_id=?',['111']), 0);
    assert.equal(count(sql, 'tribunal_votes','twitch_id=?',['222']), 2);
    assert.equal(count(sql, 'tribunal_proposals','author_twitch_id=?',['111']), 0);
  } finally { sql.close(); }
});

test('purge : une activité récente entre lecture et effacement protège le compte', async () => {
  const { sql, env, d1 } = fixture();
  sql.exec("UPDATE member_activity SET last_active_at=unixepoch('now','-7 months') WHERE twitch_id='111'");
  d1.beforeBatch = () => sql.exec("UPDATE member_activity SET last_active_at=unixepoch() WHERE twitch_id='111'");
  env.MEMBER_PURGE_ENABLED = 'true';
  env.MEMBER_PURGE_DRY_RUN = 'false';
  try {
    await worker.scheduled({}, env);
    assert.equal(count(sql, 'members','twitch_id=?',['111']), 1);
    assert.equal(count(sql, 'tribunal_votes','twitch_id=?',['111']), 2);
    assert.equal(count(sql, 'tribunal_proposals','author_twitch_id=?',['111']), 1);
  } finally { sql.close(); }
});


test('le classement expose les identifiants uniquement pour les membres ayant activé ce classement', async () => {
  const { sql, env } = fixture();
  try {
    sql.exec("UPDATE members SET score=5,visible_in_ranking=1 WHERE twitch_id='111'");
    sql.exec("UPDATE members SET score=5,visible_in_ranking=0 WHERE twitch_id='222'");
    const request = new Request('https://example.test/v1/ranking',{ method:'GET' });
    const rank = await worker.fetch(request,env);
    assert.equal(rank.status,200);
    let data=await rank.json();
    assert.deepEqual(data.entries.map(x=>x.twitch_id),['111']);
    assert.ok(!('bio' in data.entries[0]));
    sql.exec("UPDATE members SET visible_in_ranking=1 WHERE twitch_id='222'");
    const changed = await worker.fetch(new Request('https://example.test/v1/ranking'),env);
    data=await changed.json();
    assert.deepEqual(data.entries.map(x=>x.twitch_id).sort(),['111','222']);
  } finally { sql.close(); }
});

test('un profil privé reste inaccessible même si le joueur accepte le classement', async () => {
  const { sql, env } = fixture();
  try {
    sql.exec("UPDATE members SET score=5,visible_in_ranking=1");
    sql.exec("UPDATE member_profiles SET is_public=1,bio='Biographie publique' WHERE twitch_id='111'");
    sql.exec("UPDATE member_profiles SET is_public=0,bio='Biographie privée' WHERE twitch_id='222'");
    const inaccessible = await worker.fetch(new Request('https://example.test/v1/profiles/222'),env);
    assert.equal(inaccessible.status,404);
    const body = JSON.stringify(await inaccessible.json());
    assert.ok(!body.includes('Biographie privée'));
    const accessible = await worker.fetch(new Request('https://example.test/v1/profiles/111'),env);
    assert.equal(accessible.status,200);
    assert.equal((await accessible.json()).profile.bio,'Biographie publique');
  } finally { sql.close(); }
});

test('Le profil compte les pronostics des cinq jeux sans exposer les statistiques privées',async()=>{
 const {sql,env}=fixture();
 sql.exec("INSERT INTO vote_rounds_warzone(id,game,challenge_id,challenge_title,team,status) VALUES('warzone-hajin-profile','warzone-hajin',1,'Défi Hajin','solo','resolved')");
 sql.exec("INSERT INTO vote_rounds_warzone(id,game,challenge_id,challenge_title,team,status) VALUES('warzone-zodiac-profile','warzone-zodiac',2,'Défi Zodiac','solo','resolved')");
 sql.exec("INSERT INTO vote_rounds_warzone(id,game,challenge_id,challenge_title,team,status) VALUES('warzone-rebirth-profile','warzone-rebirth',3,'Défi Rebirth','solo','resolved')");
 sql.exec("INSERT INTO vote_rounds_verdansk(id,game,challenge_id,challenge_title,team,status) VALUES('warzone-verdansk-profile','warzone-verdansk',1,'Défi Verdansk','solo','resolved')");
 for(const round of ['warzone-hajin-profile','warzone-zodiac-profile','warzone-rebirth-profile']){
  sql.prepare("INSERT INTO vote_ballots_warzone(round_id,twitch_id,prediction) VALUES(?,?,'success')").run(round,'111');
 }
 sql.exec("INSERT INTO vote_ballots_verdansk(round_id,twitch_id,prediction) VALUES('warzone-verdansk-profile','111','failure')");
 const restore=mockTwitchUser('111');
 try{
  const me=await worker.fetch(new Request('https://example.test/v1/profiles/me',{
   headers:{Authorization:'Bearer aaaabbbbccccdddd'}
  }),env);
  assert.equal(me.status,200);
  const own=await me.json();
  assert.equal(own.stats.votes,5,'Fortnite et 4 cartes Warzone = cinq participations');
  assert.equal(own.stats.points,0,'les points ne sont pas recalculés par le compteur');
  sql.exec("UPDATE member_profiles SET is_public=1 WHERE twitch_id='111'");
  // Le propriétaire peut partager un profil sans autoriser la publication des stats.
  const privateStats=await worker.fetch(new Request('https://example.test/v1/profiles/111'),env);
  assert.equal(privateStats.status,200);
  assert.equal((await privateStats.json()).stats.votes,null);
  sql.exec("UPDATE members SET visible_in_ranking=1 WHERE twitch_id='111'");
  const publicStats=await worker.fetch(new Request('https://example.test/v1/profiles/111'),env);
  assert.equal(publicStats.status,200);
  assert.equal((await publicStats.json()).stats.votes,5,'stats visibles uniquement avec accord classement');
  const other=await worker.fetch(new Request('https://example.test/v1/profiles/222'),env);
  assert.equal(other.status,404,'profil privé inaccessible');
 }finally{restore();sql.close();}
});

test('Les pronostics Warzone sont séparés des votes Fortnite, attribuent les points et se suppriment en cascade',async()=>{
 const {sql,env}=fixture();
 env.OWNER_TWITCH_ID='111';
 sql.exec("UPDATE vote_rounds SET status='cancelled' WHERE id='round1'");
 const payload=(path,body,token='aaaabbbbccccdddd')=>new Request('https://example.test'+path,{
  method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},
  ...(body?{body:JSON.stringify(body)}:{})
 });
 const call=async (path,body)=>{const res=await worker.fetch(payload(path,body),env);return {status:res.status,data:await res.json()};};
 let restore=mockTwitchUser('111');
 let round;
 try{
  const start=await call('/v1/votes/start',{game:'warzone-rebirth',challenge_id:12,title:'Survie à Bioweapons',team:'solo'});
  assert.equal(start.status,201,JSON.stringify(start.data));
  round=start.data.round;
  assert.equal(round.game,'warzone-rebirth');
  assert.equal(count(sql,'vote_rounds'),1,'Fortnite reste dans sa propre table');
  assert.equal(count(sql,'vote_rounds_warzone'),1);
  const forbidden=await call('/v1/votes/start',{game:'warzone-hajin',challenge_id:1,title:'Défi concurrent',team:'solo'});
  assert.equal(forbidden.status,409,'une seule manche peut être ouverte');
 }finally{restore();}
 restore=mockTwitchUser('222');
 try{
  const cast=await call('/v1/votes/cast',{round_id:round.id,prediction:'success'});
  assert.equal(cast.status,200,JSON.stringify(cast.data));
  const second=await call('/v1/votes/cast',{round_id:round.id,prediction:'success'});
  assert.equal(second.status,409,'vote unique');
 }finally{restore();}
 restore=mockTwitchUser('111');
 try{
  const close=await call('/v1/votes/close',{round_id:round.id});
  assert.equal(close.status,200);
  const resolve=await call('/v1/votes/resolve',{round_id:round.id,result:'success'});
  assert.equal(resolve.status,200,JSON.stringify(resolve.data));
  assert.equal(resolve.data.awarded,1);
  assert.equal(count(sql,'vote_ballots_warzone'),1);
  assert.equal(count(sql,'vote_points_warzone'),1);
  assert.equal(count(sql,'vote_points'),2,'points Fortnite non modifiés');
  assert.equal(sql.prepare("SELECT score FROM members WHERE twitch_id='222'").get().score,2);
  const again=await call('/v1/votes/resolve',{round_id:round.id,result:'success'});
  assert.equal(again.status,409,'pas de points en double');
 }finally{restore();}
 sql.prepare("DELETE FROM members WHERE twitch_id='222'").run();
 assert.equal(count(sql,'vote_ballots_warzone'),0,'suppression des pronostics Warzone');
 assert.equal(count(sql,'vote_points_warzone'),0,'suppression des points Warzone');
 sql.close();
});


test('Les pronostics Verdansk fonctionnent sans écraser les manches Fortnite ni les trois autres cartes',async()=>{
 const {sql,env}=fixture();
 env.OWNER_TWITCH_ID='111';
 sql.exec("UPDATE vote_rounds SET status='cancelled' WHERE id='round1'");
 sql.exec("INSERT INTO vote_rounds_warzone(id,game,challenge_id,challenge_title,team,status) VALUES('legacy-zodiac','warzone-zodiac',2,'Ancienne manche conservée','solo','cancelled')");
 const call=async(path,body,token='aaaabbbbccccdddd')=>{
  const req=new Request('https://example.test'+path,{
   method:body?'POST':'GET',
   headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},
   ...(body?{body:JSON.stringify(body)}:{})
  });
  const result=await worker.fetch(req,env);
  return {status:result.status,data:await result.json()};
 };
 let restore=mockTwitchUser('111'),round;
 try{
  const start=await call('/v1/votes/start',{game:'warzone-verdansk',challenge_id:81,title:'Verdansk, touriste du gaz',team:'solo'});
  assert.equal(start.status,201,JSON.stringify(start.data));
  round=start.data.round;
  assert.equal(round.game,'warzone-verdansk');
  assert.equal(count(sql,'vote_rounds_verdansk'),1);
  assert.equal(count(sql,'vote_rounds_warzone'),1,'ancienne manche Zodiac conservée');
  assert.equal(count(sql,'vote_rounds'),1,'manche Fortnite conservée');
  assert.equal((await call('/v1/votes/start',{game:'warzone-hajin',challenge_id:1,title:'Manche concurrente',team:'solo'})).status,409);
 }finally{restore();}
 restore=mockTwitchUser('222');
 try{
  assert.equal((await call('/v1/votes/cast',{round_id:round.id,prediction:'failure'})).status,200);
  assert.equal((await call('/v1/votes/cast',{round_id:round.id,prediction:'failure'})).status,409,'un seul pronostic');
 }finally{restore();}
 restore=mockTwitchUser('111');
 try{
  assert.equal((await call('/v1/votes/close',{round_id:round.id})).status,200);
  const result=await call('/v1/votes/resolve',{round_id:round.id,result:'failure'});
  assert.equal(result.status,200,JSON.stringify(result.data));
  assert.equal(result.data.awarded,1);
  assert.equal(count(sql,'vote_ballots_verdansk'),1);
  assert.equal(count(sql,'vote_points_verdansk'),1);
  assert.equal(sql.prepare("SELECT score FROM members WHERE twitch_id='222'").get().score,3,'Fortnite 1 + Verdansk 2');
  assert.equal((await call('/v1/votes/resolve',{round_id:round.id,result:'failure'})).status,409);
  assert.equal(count(sql,'vote_rounds_warzone'),1,'Zodiac inchangé');
 }finally{restore();}
 sql.prepare("DELETE FROM members WHERE twitch_id='222'").run();
 assert.equal(count(sql,'vote_ballots_verdansk'),0,'pronostic supprimé en cascade');
 assert.equal(count(sql,'vote_points_verdansk'),0,'points Verdansk supprimés en cascade');
 assert.equal(count(sql,'vote_rounds_verdansk'),1,'historique collectif de la manche conservé');
 sql.close();
});

test('La région manuelle reste facultative, privée, validée et compatible avec les anciens profils',async()=>{
 const {sql,env}=fixture(),restore=mockTwitchUser('111');
 const auth='Bearer aaaabbbbccccdddd',url='https://example.test/v1/profiles/';
 const patch=async profile=>worker.fetch(new Request(url+'me',{method:'PATCH',headers:{Authorization:auth,'Content-Type':'application/json'},body:JSON.stringify(profile)}),env);
 try{
  const own=await worker.fetch(new Request(url+'me',{headers:{Authorization:auth}}),env);
  const initial=(await own.json()).profile;
  assert.equal(initial.region,'');
  const set=await patch({...initial,region:'fr'});
  assert.equal(set.status,200);
  assert.equal((await set.json()).profile.region,'fr');
  assert.equal(sql.prepare("SELECT region FROM member_profiles WHERE twitch_id='111'").get().region,'fr');
  const bad=await patch({...initial,region:'<script>'});assert.equal(bad.status,400);
  const legacy={...initial};delete legacy.region;
  const oldClient=await patch(legacy);assert.equal(oldClient.status,200);
  assert.equal((await oldClient.json()).profile.region,'fr');
  const privateView=await worker.fetch(new Request(url+'111'),env);assert.equal(privateView.status,404);
  sql.exec("UPDATE member_profiles SET is_public=1 WHERE twitch_id='111'");
  const publicView=await worker.fetch(new Request(url+'111'),env);
  assert.equal((await publicView.json()).profile.region,'fr');
  const clear=await patch({...initial,region:''});
  assert.equal(clear.status,200);
  assert.equal((await clear.json()).profile.region,'');
 }finally{restore();sql.close();}
});
