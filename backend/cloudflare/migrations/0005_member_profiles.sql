-- Profils personnalisables, complémentaires aux membres et aux votes existants.
-- Appliquer sur D1 ma-jestik-qg-members AVANT de déployer le Worker associé.
-- Aucun DROP / ALTER sur les tables existantes ; supprimer un membre supprime son profil.
CREATE TABLE IF NOT EXISTS member_profiles (
  twitch_id TEXT PRIMARY KEY NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
  display_label TEXT NOT NULL DEFAULT '' CHECK(length(display_label)<=32),
  bio TEXT NOT NULL DEFAULT '' CHECK(length(bio)<=180),
  banner_key TEXT NOT NULL DEFAULT 'champagne' CHECK(banner_key IN ('champagne','carbone','violet')),
  accent_key TEXT NOT NULL DEFAULT 'or' CHECK(accent_key IN ('or','violet','bleu')),
  favorite_games_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(favorite_games_json) AND json_type(favorite_games_json)='array' AND json_array_length(favorite_games_json)<=4),
  primary_game TEXT NOT NULL DEFAULT '',
  is_public INTEGER NOT NULL DEFAULT 0 CHECK(is_public IN (0,1)),
  instagram TEXT NOT NULL DEFAULT '' CHECK(length(instagram)<=30),
  tiktok TEXT NOT NULL DEFAULT '' CHECK(length(tiktok)<=24),
  discord TEXT NOT NULL DEFAULT '' CHECK(length(discord)<=40),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS member_profiles_public_idx ON member_profiles(is_public,updated_at);
