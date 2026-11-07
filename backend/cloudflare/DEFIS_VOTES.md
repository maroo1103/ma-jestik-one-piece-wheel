# Votes officiels des défis Ma_JesTik

Barème : +1 bonne prédiction Réussite, +2 bonne prédiction Échec. Mauvaise prédiction ou annulé : 0.
Un vote par compte Twitch enregistré, un seul vote actif à la fois pour Fortnite.
Le vote doit être clôturé par le propriétaire avant toute attribution des points.

## Mise en service (NE PAS oublier l'ordre)
1. Dans Cloudflare D1 ma-jestik-qg-members exécuter migrations/0002_defi_votes.sql.
2. Dans les variables du Worker ajouter OWNER_TWITCH_ID (ID Twitch numérique du propriétaire).
   Récupérer via SELECT twitch_id, display_name FROM members; dans la console D1.
3. Dans le Worker Cloudflare ma-jestik-qg-members remplacer le code par backend/cloudflare/src/worker.js, déployer.
4. Tester GET /v1/health puis GET /v1/votes/current (réponse round:null au début).
5. Activer le composant votes sur le site via la configuration après avoir testé l'API.

## API
GET /v1/votes/current : état et barème public
GET /v1/votes/me : rôle propriétaire, profil enregistré, vote actuel (token Twitch)
POST /v1/votes/start : propriétaire, défi courant du catalogue
POST /v1/votes/cast : membre, vote unique pendant ouverture
POST /v1/votes/close : propriétaire, arrête de recevoir les votes
POST /v1/votes/resolve : propriétaire, attribue les points après clôture (batch transactionnel)
POST /v1/votes/cancel : propriétaire, annule sans point
GET /v1/ranking : scores des membres qui ont accepté de figurer au classement

Aucun token ni clé secrète n'est conservé dans D1. Le navigateur ne choisit pas les scores.
Les boutons de résultats locaux existants restent indépendants du vote officiel.
Cette version ne doit pas être déployée avant création des tables et configuration OWNER_TWITCH_ID.
