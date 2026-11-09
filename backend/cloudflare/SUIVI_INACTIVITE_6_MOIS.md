# Ma_JesTik — suivi d'inactivité de six mois

## État de déploiement
Le code source et la migration sont prêts dans GitHub. **La base D1 et les Workers en production ne sont PAS modifiés par un commit GitHub**. Aucune purge automatique, aucun retrait de points et aucune suppression de membre ne sont activés.

## Fonctionnement prévu
Un membre ayant créé son profil QG est identifié par son jeton Twitch validé par le Worker. Le site notifie son activité sur un onglet visible lors de l'ouverture d'une session valide et lors de nouvelles interactions. Une limite de 30 minutes empêche les enregistrements excessifs. Les visiteurs non connectés et les utilisateurs sans profil QG ne sont pas enregistrés dans cette table. Le jeton Twitch n'est jamais écrit dans D1.

La table indépendante `member_activity` conserve uniquement `twitch_id` et `last_active_at` (heure UNIX en secondes). Les membres déjà existants sont initialisés à la date de la migration ; **ne jamais prendre `joined_at` ou `updated_at` pour date de dernière visite**.

## Mise en service — respecter l'ordre
1. Dans Cloudflare, sauvegarder la base D1 de production et le code actuel de `ma-jestik-qg-members`. Vérifier les identifiants et l'environnement de production.
2. Tester la migration sur une copie de développement. Dans la console de la bonne base D1, exécuter ensuite `backend/cloudflare/migrations/0007_member_activity.sql`.
3. Contrôler : `SELECT COUNT(*) AS membres FROM members;` et `SELECT COUNT(*) AS comptes_suivis FROM member_activity;` doivent correspondre en l'absence de changements simultanés. Vérifier également `PRAGMA table_info(member_activity);`.
4. Comparer le Worker `ma-jestik-qg-members` réellement déployé avec `backend/cloudflare/src/worker.js` sur GitHub. Ne pas écraser des modifications seulement présentes dans Cloudflare. Déployer la nouvelle version seulement après avoir confirmé que les autres fonctionnalités sont conservées.
5. Dans les variables du Worker, activer la variable non secrète `ACTIVITY_TRACKING_ENABLED` avec la valeur `true` après confirmation du schéma D1.
6. Tester `GET /v1/health` (inchangé), puis `GET /v1/me/activity` avec un jeton Twitch de compte QG de test (réponse `200`, champ `last_active_at`). Sans jeton : `401` ; Twitch valide mais sans profil QG : `404`. Ne jamais publier de jeton dans une capture d'écran.
7. Sur GitHub, **ensuite seulement**, changer la balise `majestik-activity-enabled` dans `dist/qg/index.html` de `false` à `true`.
8. Avec un compte de test : vérifier le retour OAuth, F5, les visites authentifiées, l'absence d'envoi lorsque l'onglet est masqué, la limitation du nombre de requêtes, et les écritures dans D1. Une requête `POST /v1/me/activity` authentifiée doit répondre `200`.
9. Tester les profils et classements, votes, Tribunal, Killathon et connexion Twitch. Ne jamais essayer une suppression sur un compte réel.

## Protections
- Le Worker vérifie à chaque appel `Authorization: Bearer` avec Twitch, puis contrôle l'existence du membre dans `members`.
- Les requêtes d'activité ne peuvent pas créer de profil et n'acceptent aucun identifiant Twitch fourni par le navigateur.
- La date est produite par D1, non par l'horloge du visiteur.
- Le frontend ne lance **aucune requête** tant que `majestik-activity-enabled=false`; le Worker refuse la route si `ACTIVITY_TRACKING_ENABLED` n'est pas `true`.
- L'activité ne doit jamais bloquer les fonctionnalités du QG en cas de panne Cloudflare.
- Une période de six **mois calendaires** sans visite authentifiée sera le critère de la future purge, mais **la purge n'est PAS incluse** dans cette livraison.
- Avant de programmer cette purge, corriger les références d'identifiants Twitch dans les tables du Tribunal et assurer une sauvegarde, un test isolé, une règle de notification préalable et une période de grâce en cas de panne du suivi.

## Vérification SQL ultérieure
`SELECT COUNT(*) FROM member_activity;`

`SELECT datetime(last_active_at,'unixepoch') FROM member_activity ORDER BY last_active_at DESC LIMIT 10;`

Ne pas partager les identifiants Twitch ni données de membres dans les captures.

## Mise en ligne du frontend (9 novembre 2026)
La table D1 `member_activity` a été créée et initialisée pour les **3 comptes** existants (3 suivis, 0 manquant), d'après les tests de la console Cloudflare transmis par l'éditeur. Le Worker `ma-jestik-qg-members` a été déployé, sa route `/v1/health` a répondu `{"status":"ok"}` et sa route `/v1/me/activity` sans jeton a renvoyé `Connexion Twitch invalide`. La variable de production `ACTIVITY_TRACKING_ENABLED=true` a été confirmée dans l'interface.

La balise `majestik-activity-enabled` est désormais **true** côté GitHub Pages ; le module Twitch est chargé avec une version de cache différente pour prendre en compte le changement. Une revalidation Twitch automatique toutes les heures sans interaction ne compte pas à elle seule comme une nouvelle activité.

**Reste à confirmer en production :** navigation connectée au QG après déploiement GitHub Pages, réponse `200` de `POST /v1/me/activity` et nouvelle date dans D1. Aucune purge automatique n'est ajoutée par cette mise en ligne.
