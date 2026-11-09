-- 0007 : suivi de derniere activite du QG, sans modification des comptes ou des scores.
-- IMPORTANT : sauvegarder D1 et verifier la base cible avant execution.
-- Les membres existants repartent de la date d'installation de la migration.
-- AUCUNE suppression automatique n'est creee par ce script.
CREATE TABLE IF NOT EXISTS member_activity (
  twitch_id TEXT PRIMARY KEY NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
  last_active_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS member_activity_last_active_idx ON member_activity(last_active_at);
INSERT OR IGNORE INTO member_activity(twitch_id,last_active_at)
  SELECT twitch_id,unixepoch() FROM members;
