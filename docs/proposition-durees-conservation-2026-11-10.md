# Ma_JesTik — Durées de conservation validées par l'éditeur (10 novembre 2026)

**Document technique interne : décisions validées par l'éditeur le 10 novembre 2026.** Ne pas publier comme politique définitive tant que les mécanismes d'effacement ne sont pas effectivement déployés et vérifiés. Les règles validées ne sont **pas encore toutes actives**.

## Constats confirmés

- La base Cloudflare D1 `ma-jestik-qg-members` contient les comptes, profils, activités, votes/points des défis, Killathon et Tribunal.
- Le contact est acheminé par le Worker `contact-worker.js` à Resend, puis vers `contact@ma-jestik.fr` chez OVHcloud. Le code n'insère pas ces messages dans D1.
- Les votes et les points des défis sont liés aux comptes membres. Les supprimer indépendamment modifierait l'historique de statistiques, sans recalcul automatique des scores conservés dans `members.score`.
- Le Tribunal accepte des participants authentifiés par Twitch qui n'ont pas nécessairement créé de profil dans `members`. Un nettoyage fondé uniquement sur l'inactivité des comptes membres ne couvre pas ces données.
- Les formulaires GitHub du Tribunal et le Worker source ont été modifiés pour ne plus proposer ni accepter de **nouveaux sondages sans limite**. Les anciens sondages à durée illimitée restent lisibles et pourront être clos manuellement, puis conservés 12 mois après leur clôture. Le nouveau code du Worker Tribunal n'est **pas encore déployé sur Cloudflare**.
- Le mécanisme de suppression volontaire du compte et la purge à six mois ont été corrigés/testés sur GitHub et déployés manuellement sur le Worker des membres le 10/11/2026. Vérification de santé et consultation du profil confirmées par l'éditeur, sans test destructif sur un vrai membre.
- Au 10/11/2026, `ACTIVITY_TRACKING_ENABLED=true`, `MEMBER_PURGE_ENABLED=true`, `MEMBER_PURGE_DRY_RUN=true`. Cron configuré : `0 3 * * *` (03:00 UTC quotidien) ; le premier passage est programmé pour le 11/11/2026. **Aucun effacement automatique réel n'est activé et les résultats du premier passage sont encore à vérifier.**

## Règles de conservation approuvées (application technique progressive)

| Catégorie | Durée validée | Motif / intervention nécessaire |
|---|---|---|
| Compte membre, profil, Killathon, points et votes des défis | Jusqu'à suppression volontaire ou après 6 mois consécutifs d'inactivité authentifiée | Préserver les classements et statistiques ; purge réelle encore désactivée |
| Proposition Tribunal `pending` | 3 mois depuis création, sauf si traitée entre-temps | Éviter une file d'attente permanente |
| Proposition Tribunal `rejected` | 30 jours après décision | Laisser une brève période de contrôle |
| Proposition Tribunal `accepted` | 6 mois après décision | Traçabilité raisonnable de la modération ; vérifier l'impact sur l'attribution publique du sondage |
| Sondage Tribunal clôturé et ses votes | 12 mois après clôture | Résultats consultables temporairement ; les votes disparaissent en cascade avec le sondage |
| Anciens sondages « sans limite » | Clôture manuelle, puis 12 mois après clôture | Plus aucun nouveau sondage illimité ; surveiller et clore les anciens s'il en existe |
| Messages de contact dans la boîte OVH | 6 mois à compter du dernier échange, sauf nécessité justifiée | Répondre aux demandes et conserver brièvement leur contexte ; suppression manuelle ou procédure à mettre en place |
| Pièces jointes du contact | À supprimer dès qu'elles ne sont plus utiles, idéalement avant le reste de la conversation | Elles peuvent contenir davantage de données personnelles ; modalités réelles à tester dans OVH |
| Copies d'acheminement chez Resend | Selon les conditions du prestataire, à vérifier pour le compte actif | Resend indique une conservation de 30 jours des courriels et logs sur les plans Free/Pro/Scale ; cela ne supprime pas la copie OVH |
| Sauvegardes D1 exportées sur le PC | Limitées au besoin de restauration ; stocker en lieu privé protégé | Ne pas conserver sans limite les copies de données personnelles |

**Ces délais sont des choix de gestion approuvés, pas des durées universellement imposées par la loi.** Les règles Tribunal sont désormais préparées dans `backend/cloudflare/src/worker.js` et protégées par `TRIBUNAL_RETENTION_ENABLED` et `TRIBUNAL_RETENTION_DRY_RUN`. Elles ne seront exécutables en production qu'après déploiement du nouveau Worker et activation explicite du mode observation. La purge réelle est interdite tant que la simulation n'a pas été confirmée. La suppression des messages OVH et de leurs pièces jointes reste une procédure de traitement manuel à définir.

## Points de vigilance avant un nettoyage automatique

1. Ne jamais purger les `vote_points` et `vote_ballots` indépendamment sans réviser les scores et les statistiques.
2. Prévoir une suppression sur demande `tribunal_votes` / `tribunal_proposals` pour les utilisateurs Twitch n'ayant aucun profil `members`. Ne jamais exiger la création d'un profil juste pour demander l'effacement.
3. Le texte libre des propositions et questions pourrait contenir spontanément des informations identifiantes : modération et suppression au cas par cas.
4. Vérifier l'état des propositions existantes avant tout effacement ; ne jamais nettoyer la base de production dans le cadre d'un test.
5. Évaluer la conservation des mails, pièces jointes, journaux et sauvegardes chez OVH, Resend, Cloudflare et GitHub.
6. Ne pas annoncer le nettoyage automatique comme actif tant que le Worker n'est pas déployé et la simulation n'est pas observée.
7. **Variables Tribunal :** `TRIBUNAL_RETENTION_ENABLED=true` pour lancer des contrôles ; `TRIBUNAL_RETENTION_DRY_RUN=true` pour les simulations. Le nettoyage réel nécessiterait `TRIBUNAL_RETENTION_DRY_RUN=false` après validation expresse, séparément de la purge des membres.
8. Le Cron existant du Worker membres à 03:00 UTC est réutilisé par le code futur ; aucun déclencheur supplémentaire n'est requis.

## Références utiles

- CNIL, *Les durées de conservation des données* : https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees
- CNIL, *Guide pratique : Les durées de conservation* : https://www.cnil.fr/sites/default/files/atoms/files/guide_durees_de_conservation.pdf
- Resend, *GDPR* : https://resend.com/security/gdpr/

**Validé par l'éditeur :** délais de conservation du tableau et suppression de la possibilité de créer de nouveaux sondages illimités. **À vérifier avant mise en production :** déploiements des deux Workers Cloudflare, simulation Cron du 11 novembre, effectivité des durées OVH/Resend et gestion des anciennes données.
