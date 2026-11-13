-- 0011 : région/pays facultatif. Vide par défaut, aucune localisation automatique.
ALTER TABLE member_profiles ADD COLUMN region TEXT NOT NULL DEFAULT '' CHECK(region IN ('','fr','be','ch','ca','lu','mc','ma','dz','tn','sn','ci','de','es','it','gb','pt','us','other'));
