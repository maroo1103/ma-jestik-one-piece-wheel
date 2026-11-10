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
