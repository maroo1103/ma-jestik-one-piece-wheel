-- Migration additive : ne modifie ni le classement ni les 118 défis.
-- Un seul Killathon par streamer Twitch, partageable en lecture seule dans OBS.
CREATE TABLE IF NOT EXISTS killathon_simple (
 twitch_id TEXT PRIMARY KEY NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
 public_id TEXT NOT NULL UNIQUE,
 game TEXT NOT NULL DEFAULT 'Fortnite Zero Build',
 kills INTEGER NOT NULL DEFAULT 0 CHECK (kills BETWEEN 0 AND 999999),
 goal INTEGER NOT NULL DEFAULT 30 CHECK (goal BETWEEN 1 AND 9999),
 active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0,1)),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS killathon_simple_public ON killathon_simple(public_id);
