-- Ajout 100 % additif : le système Fortnite existant (vote_rounds,
-- vote_ballots, vote_points, et ses contraintes) reste intact.
-- Même politique d'identité Twitch et de suppression en cascade.
CREATE TABLE IF NOT EXISTS vote_rounds_warzone (
 id TEXT PRIMARY KEY NOT NULL,
 game TEXT NOT NULL CHECK(game IN ('warzone-hajin','warzone-zodiac','warzone-rebirth')),
 challenge_id INTEGER NOT NULL CHECK(challenge_id BETWEEN 0 AND 100),
 challenge_title TEXT NOT NULL,
 team TEXT NOT NULL CHECK(team IN ('solo','duo','trio','quatuor')),
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','locked','resolved','cancelled')),
 result TEXT CHECK(result IN ('success','failure') OR result IS NULL),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 locked_at INTEGER,
 resolved_at INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS vote_warzone_one_active
 ON vote_rounds_warzone((1)) WHERE status IN ('open','locked');
CREATE INDEX IF NOT EXISTS vote_warzone_recent ON vote_rounds_warzone(created_at DESC);
CREATE TABLE IF NOT EXISTS vote_ballots_warzone (
 round_id TEXT NOT NULL REFERENCES vote_rounds_warzone(id) ON DELETE CASCADE,
 twitch_id TEXT NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
 prediction TEXT NOT NULL CHECK(prediction IN ('success','failure')),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 PRIMARY KEY(round_id,twitch_id)
);
CREATE INDEX IF NOT EXISTS vote_ballots_warzone_round ON vote_ballots_warzone(round_id,prediction);
CREATE TABLE IF NOT EXISTS vote_points_warzone (
 round_id TEXT NOT NULL REFERENCES vote_rounds_warzone(id) ON DELETE CASCADE,
 twitch_id TEXT NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
 points INTEGER NOT NULL CHECK(points IN (1,2)),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 PRIMARY KEY(round_id,twitch_id)
);
CREATE INDEX IF NOT EXISTS vote_points_warzone_member ON vote_points_warzone(twitch_id);
