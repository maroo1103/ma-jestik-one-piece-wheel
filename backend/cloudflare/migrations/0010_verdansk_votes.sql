-- Ma_JesTik : votes officiels Verdansk, ajout strictement non destructif.
-- Ne touche ni aux tables Fortnite, ni aux autres cartes Warzone.
-- Même règles de validation serveur, attribution unique et effacement cascade.
CREATE TABLE IF NOT EXISTS vote_rounds_verdansk (
 id TEXT PRIMARY KEY NOT NULL,
 game TEXT NOT NULL CHECK(game='warzone-verdansk'),
 challenge_id INTEGER NOT NULL CHECK(challenge_id BETWEEN 0 AND 100),
 challenge_title TEXT NOT NULL,
 team TEXT NOT NULL CHECK(team IN ('solo','duo','trio','quatuor')),
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','locked','resolved','cancelled')),
 result TEXT CHECK(result IN ('success','failure') OR result IS NULL),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 locked_at INTEGER,
 resolved_at INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS vote_verdansk_one_active
 ON vote_rounds_verdansk((1)) WHERE status IN ('open','locked');
CREATE INDEX IF NOT EXISTS vote_verdansk_recent ON vote_rounds_verdansk(created_at DESC);
CREATE TABLE IF NOT EXISTS vote_ballots_verdansk (
 round_id TEXT NOT NULL REFERENCES vote_rounds_verdansk(id) ON DELETE CASCADE,
 twitch_id TEXT NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
 prediction TEXT NOT NULL CHECK(prediction IN ('success','failure')),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 PRIMARY KEY(round_id,twitch_id)
);
CREATE INDEX IF NOT EXISTS vote_ballots_verdansk_round ON vote_ballots_verdansk(round_id,prediction);
CREATE TABLE IF NOT EXISTS vote_points_verdansk (
 round_id TEXT NOT NULL REFERENCES vote_rounds_verdansk(id) ON DELETE CASCADE,
 twitch_id TEXT NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
 points INTEGER NOT NULL CHECK(points IN (1,2)),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 PRIMARY KEY(round_id,twitch_id)
);
CREATE INDEX IF NOT EXISTS vote_points_verdansk_member ON vote_points_verdansk(twitch_id);
