-- Ma_JesTik missions mensuelles (additif, sans nettoyage de données existantes).
-- Ne crée aucune mission active ni aucun versement. Horodatage Unix UTC ; bornes mensuelles Europe/Paris côté Worker.
-- Les récompenses remises sont suivies manuellement. Aucune connexion à DraftBot.
CREATE TABLE IF NOT EXISTS monthly_missions (
 month TEXT PRIMARY KEY NOT NULL CHECK(month GLOB '20[0-9][0-9]-[0-1][0-9]'),
 title TEXT NOT NULL CHECK(length(title) BETWEEN 5 AND 80),
 prediction_target INTEGER NOT NULL CHECK(prediction_target BETWEEN 0 AND 20),
 poll_target INTEGER NOT NULL CHECK(poll_target BETWEEN 0 AND 20),
 bonus_coins INTEGER NOT NULL CHECK(bonus_coins BETWEEN 1 AND 50),
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','open','closed')),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 opened_at INTEGER,
 closed_at INTEGER,
 CHECK(prediction_target+poll_target>0)
);
CREATE TABLE IF NOT EXISTS monthly_awards (
 month TEXT NOT NULL REFERENCES monthly_missions(month),
 twitch_id TEXT NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
 coins INTEGER NOT NULL CHECK(coins BETWEEN 1 AND 50),
 paid_at INTEGER NOT NULL DEFAULT (unixepoch()),
 PRIMARY KEY(month,twitch_id)
);
CREATE INDEX IF NOT EXISTS monthly_awards_member_idx ON monthly_awards(twitch_id,month);
