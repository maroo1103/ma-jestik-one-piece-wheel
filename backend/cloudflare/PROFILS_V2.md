# Profils QG v2 — ajout sans frais
Ce commit ajoute six bannières, six accents et 40 choix de jeux (dont GTA VI, League of Legends et World of Warcraft), avec cartes CSS originales lorsque les miniatures officielles ne sont pas autorisées.
Pour préserver D1 et la connexion Twitch : **avant tout remplacement du Worker**, créer et tester une nouvelle sauvegarde D1 indépendante, télécharger puis exécuter la migration `backend/cloudflare/migrations/0006_member_profile_palette.sql` sur la base distante, vérifier les deux colonnes, puis déployer le Worker `backend/cloudflare/src/worker.js` après comparaison avec le code actif.
Aucun autre Worker ne doit être remplacé. Ne rien réinitialiser. Les deux nouvelles colonnes facultatives sont rétrocompatibles.
Le frontend ne propose les 6 couleurs et les 40 jeux que si `GET /v1/profiles/me` renvoie `catalog_version:2`. Avant cela il affiche les trois palettes et les 12 jeux de l'ancienne version pour empêcher les erreurs d'enregistrement.
Images : miniatures de Steam quand elles existent, cartes graphiques originales en CSS pour les titres sans miniature Steam. Vérifier les droits des images tierces avant l'ouverture officielle.
