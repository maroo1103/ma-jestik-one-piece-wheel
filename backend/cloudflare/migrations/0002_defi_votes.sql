-- Migration additive : ne remplace ni les 118 défis ni les membres existants.
CREATE TABLE IF NOT EXISTS vote_rounds (
 id TEXT PRIMARY KEY NOT NULL,
 game TEXT NOT NULL CHECK(game='fortnite'),
 challenge_id INTEGER NOT NULL CHECK(challenge_id BETWEEN 0 AND 118),
 challenge_title TEXT NOT NULL,
 team TEXT NOT NULL CHECK(team IN ('solo','duo','trio','quatuor')),
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','locked','resolved','cancelled')),
 result TEXT CHECK(result IN ('success','failure') OR result IS NULL),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 locked_at INTEGER,
 resolved_at INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS vote_round_one_active ON vote_rounds(game) WHERE status IN ('open','locked');
CREATE INDEX IF NOT EXISTS vote_round_recent ON vote_rounds(created_at DESC);
CREATE TABLE IF NOT EXISTS vote_ballots (
 round_id TEXT NOT NULL REFERENCES vote_rounds(id) ON DELETE CASCADE,
 twitch_id TEXT NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
 prediction TEXT NOT NULL CHECK(prediction IN ('success','failure')),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 PRIMARY KEY(round_id,twitch_id)
);
CREATE INDEX IF NOT EXISTS vote_ballots_round ON vote_ballots(round_id,prediction);
CREATE TABLE IF NOT EXISTS vote_points (
 round_id TEXT NOT NULL REFERENCES vote_rounds(id) ON DELETE CASCADE,
 twitch_id TEXT NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
 points INTEGER NOT NULL CHECK(points IN (1,2)),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 PRIMARY KEY(round_id,twitch_id)
);
CREATE INDEX IF NOT EXISTS vote_points_member ON vote_points(twitch_id);
