-- Tribunal communautaire : tables distinctes, sans modification des membres, défis ou Killathon.
-- Exécuter une seule fois sur D1 ma-jestik-qg-members (production).
CREATE TABLE IF NOT EXISTS tribunal_polls (
  id TEXT PRIMARY KEY NOT NULL,
  question TEXT NOT NULL CHECK(length(question) BETWEEN 10 AND 140),
  answers_json TEXT NOT NULL CHECK(json_valid(answers_json) AND json_array_length(answers_json) BETWEEN 2 AND 4),
  created_by_twitch_id TEXT NOT NULL,
  proposed_by_name TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  ends_at INTEGER,
  closed_at INTEGER,
  CHECK(ends_at IS NULL OR ends_at > created_at)
);
CREATE INDEX IF NOT EXISTS tribunal_polls_created_idx ON tribunal_polls(created_at DESC);
CREATE INDEX IF NOT EXISTS tribunal_polls_open_idx ON tribunal_polls(closed_at, ends_at);

CREATE TABLE IF NOT EXISTS tribunal_proposals (
  id TEXT PRIMARY KEY NOT NULL,
  author_twitch_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  question TEXT NOT NULL CHECK(length(question) BETWEEN 10 AND 140),
  answers_json TEXT NOT NULL CHECK(json_valid(answers_json) AND json_array_length(answers_json) BETWEEN 2 AND 4),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  resolved_at INTEGER,
  published_poll_id TEXT
);
CREATE INDEX IF NOT EXISTS tribunal_proposals_pending_idx ON tribunal_proposals(status,created_at DESC);
CREATE INDEX IF NOT EXISTS tribunal_proposals_rate_idx ON tribunal_proposals(author_twitch_id,created_at DESC);

CREATE TABLE IF NOT EXISTS tribunal_votes (
  poll_id TEXT NOT NULL REFERENCES tribunal_polls(id) ON DELETE CASCADE,
  twitch_id TEXT NOT NULL,
  choice_index INTEGER NOT NULL CHECK(choice_index BETWEEN 0 AND 3),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY(poll_id,twitch_id)
);
CREATE INDEX IF NOT EXISTS tribunal_votes_user_idx ON tribunal_votes(twitch_id,created_at DESC);
