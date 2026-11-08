-- 0006 : étendre le choix de couleurs sans reconstruire la table membre.
-- Prérequis : sauvegarde D1 indépendante vérifiée et 0005 déjà exécutée.
-- Aucune suppression de table / données / points / votes.
-- Valeurs NULL autorisées pour préserver les profils créés avant l'extension.
ALTER TABLE member_profiles ADD COLUMN banner_choice TEXT CHECK (banner_choice IS NULL OR banner_choice IN ('champagne','carbone','violet','bleu-nuit','rubis','emeraude'));
ALTER TABLE member_profiles ADD COLUMN accent_choice TEXT CHECK (accent_choice IS NULL OR accent_choice IN ('or','violet','bleu','rouge','vert','rose'));
