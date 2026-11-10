# Ma_JesTik — Proposition de durées de conservation (10 novembre 2026)

**Brouillon de décision technique et RGPD — ne pas publier comme politique définitive.**
Les durées ci-dessous sont des **propositions**, pas des règles automatiques déjà appliquées. Elles sont à valider par l'éditeur avant l'implémentation de tout effacement.

## Constats confirmés

- La base Cloudflare D1 `ma-jestik-qg-members` contient les comptes, profils, activités, votes/points des défis, Killathon et Tribunal.
- Le contact est acheminé par le Worker `contact-worker.js` à Resend, puis vers `contact@ma-jestik.fr` chez OVHcloud. Le code n'insère pas ces messages dans D1.
- Les votes et les points des défis sont liés aux comptes membres. Les supprimer indépendamment modifierait l'historique de statistiques, sans recalcul automatique des scores conservés dans `members.score`.
- Le Tribunal accepte des participants authentifiés par Twitch qui n'ont pas nécessairement créé de profil dans `members`. Un nettoyage fondé uniquement sur l'inactivité des comptes membres ne couvre pas ces données.
- Le Tribunal accepte des sondages sans date de fin ; leur cycle de vie doit être défini pour éviter une conservation indéfinie par défaut.
- Le mécanisme de suppression volontaire du compte et la purge à six mois ont été corrigés/testés sur GitHub et déployés manuellement sur le Worker des membres le 10/11/2026. Vérification de santé et consultation du profil confirmées par l'éditeur, sans test destructif sur un vrai membre.
- Au 10/11/2026, `ACTIVITY_TRACKING_ENABLED=true`, `MEMBER_PURGE_ENABLED=true`, `MEMBER_PURGE_DRY_RUN=true`. Cron configuré : `0 3 * * *` (03:00 UTC quotidien) ; le premier passage est programmé pour le 11/11/2026. **Aucun effacement automatique réel n'est activé et les résultats du premier passage sont encore à vérifier.**

## Proposition de politique de conservation

| Catégorie | Durée proposée | Motif / intervention nécessaire |
|---|---|---|
| Compte membre, profil, Killathon, points et votes des défis | Jusqu'à suppression volontaire ou après 6 mois consécutifs d'inactivité authentifiée | Préserver les classements et statistiques ; purge réelle encore désactivée |
| Proposition Tribunal `pending` | 3 mois depuis création, sauf si traitée entre-temps | Éviter une file d'attente permanente |
| Proposition Tribunal `rejected` | 30 jours après décision | Laisser une brève période de contrôle |
| Proposition Tribunal `accepted` | 6 mois après décision | Traçabilité raisonnable de la modération ; vérifier l'impact sur l'attribution publique du sondage |
| Sondage Tribunal clôturé et ses votes | 12 mois après clôture | Résultats consultables temporairement ; les votes disparaissent en cascade avec le sondage |
| Sondage « sans limite » | Tant qu'il est utile et ouvert, avec réexamen au moins tous les 6 mois | Prévoir une règle de clôture ou d'archivage en cas d'inactivité prolongée ; ne pas traiter « sans limite » comme conservation perpétuelle |
| Messages de contact dans la boîte OVH | 6 mois à compter du dernier échange, sauf nécessité justifiée | Répondre aux demandes et conserver brièvement leur contexte ; suppression manuelle ou procédure à mettre en place |
| Pièces jointes du contact | À supprimer dès qu'elles ne sont plus utiles, idéalement avant le reste de la conversation | Elles peuvent contenir davantage de données personnelles ; modalités réelles à tester dans OVH |
| Copies d'acheminement chez Resend | Selon les conditions du prestataire, à vérifier pour le compte actif | Resend indique une conservation de 30 jours des courriels et logs sur les plans Free/Pro/Scale ; cela ne supprime pas la copie OVH |
| Sauvegardes D1 exportées sur le PC | Limitées au besoin de restauration ; stocker en lieu privé protégé | Ne pas conserver sans limite les copies de données personnelles |

**Aucune durée ci-dessus n'est présentée comme légalement imposée ou automatiquement configurée.** Ces arbitrages doivent être validés et techniquement appliqués, puis vérifiés avant publication dans la politique de confidentialité.

## Points de vigilance avant un nettoyage automatique

1. Ne jamais purger les `vote_points` et `vote_ballots` indépendamment sans réviser les scores et les statistiques.
2. Prévoir une suppression sur demande `tribunal_votes` / `tribunal_proposals` pour les utilisateurs Twitch n'ayant aucun profil `members`. Ne jamais exiger la création d'un profil juste pour demander l'effacement.
3. Le texte libre des propositions et questions pourrait contenir spontanément des informations identifiantes : modération et suppression au cas par cas.
4. Vérifier l'état des propositions existantes avant tout effacement ; ne jamais nettoyer la base de production dans le cadre d'un test.
5. Évaluer la conservation des mails, pièces jointes, journaux et sauvegardes chez OVH, Resend, Cloudflare et GitHub.
6. Ne pas publier de date de purge en tant que mécanisme réel tant que la simulation n'a pas été observée et le passage en mode effectif autorisé.

## Références utiles

- CNIL, *Les durées de conservation des données* : https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees
- CNIL, *Guide pratique : Les durées de conservation* : https://www.cnil.fr/sites/default/files/atoms/files/guide_durees_de_conservation.pdf
- Resend, *GDPR* : https://resend.com/security/gdpr/

**À valider :** délais des propositions et sondages, traitement des sondages sans limite, délai OVH/PIJ et conservation des statistiques.
