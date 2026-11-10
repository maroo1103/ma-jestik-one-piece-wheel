# Ma_JesTik — Audit D1 et procédure de mise en service RGPD (10 novembre 2026)

**Document interne de travail. Ne constitue pas une certification de conformité RGPD.**
**Aucune donnée de production n'a été supprimée ni modifiée lors de cet audit.**

## 1. Éléments vérifiés dans Cloudflare D1

Base : `ma-jestik-qg-members`. Capture des résultats transmise par l'éditeur le 10/11/2026.

- 10 tables applicatives et une table technique Cloudflare `_cf_KV`.
- 3 comptes `members` ; 3 enregistrements `member_activity` ; aucun membre sans suivi.
- Dernier horodatage d'activité aperçu : `2026-11-09 20:00:38 UTC` (pas une preuve, à lui seul, de l'actualisation lors de chaque connexion).
- Tribunal à cette date : 0 vote, 1 proposition, 0 sondage.
- Clés étrangères `ON DELETE CASCADE` des `member_activity`, `member_profiles`, `vote_ballots`, `vote_points` et `killathon_simple` vers `members`.
- `tribunal_votes` ne référence que `tribunal_polls`. `tribunal_proposals` contient `author_twitch_id` et `author_name`. `tribunal_polls` contient `created_by_twitch_id` et éventuellement `proposed_by_name`. Ces données nécessitent un traitement séparé.

## 2. Changements apportés au code source

Fichier : `backend/cloudflare/src/worker.js`.

### Suppression volontaire de compte (`DELETE /v1/me`)

La suppression passe par une transaction D1 `batch()`, qui :

1. supprime les votes du Tribunal portant l'identifiant Twitch du compte ;
2. retire le pseudonyme d'auteur des sondages publiés issus des propositions du compte ;
3. remplace l'identifiant Twitch du créateur de sondage par une chaîne vide lorsque ce compte en était le créateur (colonne non nullable du schéma existant) ;
4. supprime les propositions de cet auteur, y compris celles encore en attente ;
5. supprime le compte principal ; les tables `members` liées sont alors supprimées en cascade si les contraintes sont activées.

Les **sondages publiés et les votes des autres membres sont conservés**. Les nombres de votes peuvent diminuer après suppression, ce qui reflète le retrait d'un vote.

**Limites :** des identifiants ou noms personnels volontairement saisis dans le texte libre des questions/réponses ne peuvent pas être nettoyés de façon fiable par ce mécanisme. Les copies des données, les caches, les journaux des prestataires et les sauvegardes ne sont pas effacés par cette opération. Les demandes étendues doivent être traitées au cas par cas.

### Suppression après six mois d'inactivité

- Critère : `member_activity.last_active_at <= unixepoch('now','-6 months')`.
- Ne concerne que les comptes disposant d'un enregistrement de suivi ; aucune suppression sur la seule base de `members.updated_at`.
- Traitement plafonné à 25 comptes par exécution.
- Critère revérifié dans chaque instruction atomique de suppression pour protéger un compte redevenu actif pendant le contrôle.
- Journaux de maintenance limités aux **nombres** de comptes admissibles ou effacés ; aucun identifiant de membre n'est consigné.
- Le système **n'est pas actif en production** simplement parce que le code est dans GitHub : le Worker Cloudflare doit être déployé et un déclencheur Cron doit être configuré.

## 3. Sécurités d'activation (ne rien activer sans test réel)

Variables du Worker `ma-jestik-qg-members` :

| Variable | Valeur pour l'observation | Condition avant suppression |
|---|---|---|
| `ACTIVITY_TRACKING_ENABLED` | `true` après confirmation du bon suivi | Doit être `true` |
| `MEMBER_PURGE_ENABLED` | `false` au départ ; puis `true` en phase d'observation | Doit être `true` |
| `MEMBER_PURGE_DRY_RUN` | `true` (ou absente) | Doit être explicitement `false` |

La suppression automatique requiert **à la fois** `ACTIVITY_TRACKING_ENABLED=true`, `MEMBER_PURGE_ENABLED=true` et `MEMBER_PURGE_DRY_RUN=false`.

Le code expose un handler `scheduled()`, mais **aucune exécution périodique n'est créée par la modification du dépôt**. Un Cron Trigger tel que `0 3 * * *` (03 h UTC) pourra être configuré dans Cloudflare, après tests, sauvegarde D1 et validation des paramètres. Ce déclencheur sera sans suppression lorsque les options ci-dessus restent désactivées.

### Ordre recommandé avant mise en production

1. Sauvegarder/exporter la base D1 et vérifier que la sauvegarde est exploitable.
2. Vérifier que le Worker Cloudflare en production utilise bien la même base et que le suivi des connexions est effectivement actif.
3. Déployer `backend/cloudflare/src/worker.js` dans **le Worker des membres uniquement** (ne pas remplacer le Worker Tribunal ni Killathon).
4. Vérifier les routes de santé et de connexion ainsi que la création/consultation des profils.
5. Sur une base de test indépendante, créer des comptes fictifs avec votes, propositions, profil et Killathon ; vérifier que la suppression n'affecte pas un autre utilisateur.
6. Activer uniquement l'observation de purge sur un Cron Trigger de test : `MEMBER_PURGE_ENABLED=true` et `MEMBER_PURGE_DRY_RUN=true`. Confirmer que seuls des compteurs sont consignés et qu'aucune ligne ne disparaît.
7. **Après validation explicite** de la politique de conservation, de la sauvegarde et du suivi : basculer `MEMBER_PURGE_DRY_RUN=false`. Jamais en même temps que le premier déploiement.

Les tests automatiques GitHub sont définis dans `.github/workflows/qg-privacy-tests.yml` et se lancent sur une base **SQLite en mémoire**, sans secrets ni accès à D1 de production.

## 4. Décisions RGPD toujours à prendre

- Durées de conservation des **votes, manches, sondages et propositions** des visiteurs, y compris les utilisateurs du Tribunal qui se connectent avec Twitch sans créer de profil membre ; **la purge des comptes membres ne les couvre pas tous**.
- Durées de traitement et d'effacement du **formulaire de contact** et des pièces jointes, ainsi que les responsabilités respectives de Cloudflare, Resend et OVH.
- Base légale de chaque traitement, politiques des prestataires, éventuels transferts et vérification des traceurs/cookies.
- Question juridique de l'identification du responsable de traitement sans exposer l'identité civile ou l'adresse privée.
- Gestion des sauvegardes, des demandes de suppression étendue, des textes libres de Tribunal contenant éventuellement des informations personnelles.

**Ne pas annoncer publiquement la purge automatique après six mois avant son déploiement et ses essais.**
