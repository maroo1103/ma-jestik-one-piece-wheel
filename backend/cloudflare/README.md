# Préparation des profils Twitch et du classement QG

État novembre 2026 : Worker de profils et D1 déployés, en service. Le code des votes est préparé dans GitHub mais n'a pas encore été installé dans le Worker actif. Exécuter la migration 0002_defi_votes.sql puis configurer OWNER_TWITCH_ID avant de déployer le nouveau Worker. Voir DEFIS_VOTES.md.

## Ce qui est prêt
- API Cloudflare Worker avec vérification du token Twitch via l'API Twitch, puis récupération de l'ID, du pseudo et de l'avatar.
- Profils persistants en D1, créés par POST /v1/me avec l'autorisation du visiteur.
- GET /v1/me pour lire son profil et DELETE /v1/me pour le supprimer.
- PATCH /v1/me/visibility pour accepter ou refuser une apparition au classement.
- GET /v1/ranking pour les membres volontaires possédant de vrais points positifs.
- Aucun endpoint accessible au visiteur pour ajouter des points : à définir plus tard.

## Mise en route à effectuer
1. Dans Cloudflare, créer une D1 nommée ma-jestik-qg-members. Choisir la résidence UE si proposée.
2. Copier wrangler.toml.example en wrangler.toml. Renseigner database_id donné par D1.
3. Se connecter à Wrangler, puis exécuter depuis ce dossier :
   npx wrangler login
   npx wrangler d1 execute ma-jestik-qg-members --remote --file=./schema.sql
   npx wrangler deploy
4. Tester GET /v1/health sur l'URL publique du Worker.
5. Après vérification de l'API et ajout d'une information sur l'enregistrement des profils, relier le QG à l'URL du Worker.

## Sécurité et conformité
- Ne jamais publier de client secret Twitch, jeton d'utilisateur ou secret d'administration sur GitHub.
- L'application vérifie que chaque token Twitch correspond au Client ID du QG.
- L'ID Twitch numérique est la clé des membres, pas le pseudo qui peut changer.
- L'affichage dans le classement nécessite un opt-in et des scores réellement vérifiés côté serveur.
- Ce backend n'attribue aucun point et ne crée aucun compte tant qu'il n'est pas déployé et raccordé.
- Prévoir notice de confidentialité, possibilité de suppression de compte, et règles des gains.
- Dans un second temps, une authentification serveur par Authorization Code + cookie HttpOnly sur le domaine QG sera plus robuste.
