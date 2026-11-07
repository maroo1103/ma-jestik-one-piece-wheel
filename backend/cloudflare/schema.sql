-- Profil Twitch confirmé côté serveur, points jamais écrits depuis le site
CREATE TABLE IF NOT EXISTS members (
  twitch_id TEXT PRIMARY KEY NOT NULL,
  login TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0 CHECK(score >= 0),
  visible_in_ranking INTEGER NOT NULL DEFAULT 0 CHECK(visible_in_ranking IN (0,1)),
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS members_ranking_idx ON members(visible_in_ranking,score DESC,joined_at ASC);