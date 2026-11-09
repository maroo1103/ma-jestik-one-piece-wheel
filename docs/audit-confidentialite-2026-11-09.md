# Ma_JesTik — audit de confidentialité du 9 novembre 2026

**Rapport de vérification technique du dépôt GitHub `maroo1103/ma-jestik-site`. Document de travail, non publié comme politique juridique sur le site.**

## Vérifications faites

1. **Authentification Twitch : constatée.** `dist/qg/twitch-auth.js` stocke le jeton de session en `sessionStorage`; un état OAuth temporaire est utilisé en `sessionStorage` et `localStorage`. Le backend `backend/cloudflare/src/worker.js` vérifie l'identité via Twitch. Le retour OAuth est protégé par un état valide au maximum pendant 20 minutes. Si la connexion est abandonnée, vérifier quand les données locales de l'état temporaire sont effectivement nettoyées.
2. **Compte QG : constaté.** La table `members` contient l'identifiant Twitch, le login, le pseudo, l'avatar, le score, la visibilité du classement et les dates de création/mise à jour (`backend/cloudflare/schema.sql`).
3. **Profils personnalisés : constatés.** `migrations/0005_member_profiles.sql` contient la biographie, les jeux favoris, les préférences visuelles et les identifiants de réseaux sociaux facultatifs. Le profil public et la visibilité au classement sont des réglages distincts. `dist/qg/profil.js` conserve certains brouillons localement.
4. **Votes, points, Killathon et Tribunal : constatés.** `migrations/0002_defi_votes.sql`, `0003_killathon_simple.sql` et `0004_tribunal_public.sql` exposent les champs et relations utiles au suivi des données.
5. **Contact : non envoyé actuellement.** `dist/qg/contact.js` prépare la demande, peut mémoriser la sélection de pièces jointes dans l'onglet et propose copie ou `mailto:`. Pas d'envoi à un backend ni de téléversement confirmé. L'ajout de Cloudflare/Resend devra s'accompagner d'une mise à jour préalable de la politique.
6. **Stockage local : constaté.** Des fonctionnalités de la roue (`dist/app.js`) et des défis (`dist/qg/defis.js`) conservent des réglages / données dans `localStorage`. Aucune bannière cookies ne peut être déclarée nécessaire ou superflue sur ce seul constat.
7. **Ressources externes : constatées.** Plusieurs images de jeux dans `dist/qg/profil.js` sont hébergées par des domaines tiers, auxquels des requêtes peuvent être adressées depuis le navigateur.
8. **Infrastructure : identifiée.** Pages statiques sur GitHub Pages ; API et base D1 liées aux Workers Cloudflare ; identité Twitch via OAuth.

## Écarts vérifiés

### A. Suppression de membre ≠ effacement de toutes les activités

`backend/cloudflare/src/worker.js` traite `DELETE /v1/me` en exécutant `DELETE FROM members WHERE twitch_id=?`.

Les tables `member_profiles`, `vote_ballots`, `vote_points` et `killathon_simple` déclarent `ON DELETE CASCADE` vers `members` dans les schémas. **Attention :** il reste à vérifier l'activation effective des clés étrangères dans la base D1 utilisée en production et la cohérence des migrations déployées.

En revanche, `tribunal_proposals.author_twitch_id`, `tribunal_votes.twitch_id` et `tribunal_polls.created_by_twitch_id` ne sont pas déclarées comme clés étrangères vers `members`. Ces données ne sont donc pas supprimées automatiquement par la seule suppression du membre. Le nom d'auteur `author_name` et `proposed_by_name` peut également demeurer.

**Action recommandée :** concevoir une stratégie explicite d'effacement/anonymisation des propositions, votes et références d'auteur au moment de la suppression. Tester sur une base de développement et effectuer une sauvegarde préalable. Ne pas supprimer aveuglément les sondages publics ni les points des autres membres.

### B. Conservation des données

Aucun mécanisme général de purge périodique des anciens profils, votes du Tribunal, propositions et historiques n'a été confirmé dans les fichiers examinés.

**Action recommandée :** fixer pour chaque finalité des délais adaptés (ou des critères concrets de durée), les documenter, puis implémenter les purges correspondantes dans les services, avec journaux et sauvegardes traités selon leurs règles propres.

### C. Cookies, prestataires et conservation des logs

Des stockages techniques locaux ont été constatés. Aucune preuve concluante de traceurs publicitaires n'a été établie dans le périmètre inspecté, mais **la vérification des cookies et appels réseau sur le site en production n'a pas été réalisée**. Les réglages réels Cloudflare, les journaux, sauvegardes et garanties internationales des prestataires ne peuvent pas être déduits du seul dépôt.

**Action recommandée :** tester le navigateur avec stockage et réseau ouverts, à l'état déconnecté et connecté ; examiner les paramètres des services en production et leurs contrats de sous-traitance.

### D. Bases juridiques et identité du responsable

Les finalités sont identifiées, mais il faut attribuer une base juridique appropriée à chacune ; les informations relatives aux transferts internationaux et à l'identité du responsable du traitement nécessitent validation. La demande à GitHub concernant l'identité de l'éditeur est en attente. Ne pas affirmer que l'exemption de publication de l'identité de l'éditeur au titre de la LCEN vaut automatiquement dispense des obligations d'information du RGPD.

## Décision validée par l'éditeur le 9 novembre 2026 : comptes inactifs

- **Règle décidée :** suppression du compte QG après **6 mois consécutifs d'inactivité**, avec son profil, ses points et ses informations personnelles associées dans les limites prévues par la politique d'effacement. Le compte Twitch lui-même n'est jamais supprimé par Ma_JesTik.
- **Définition technique proposée :** activité authentifiée sur le QG (connexion effective ou action sur le compte, un vote, le Tribunal, un défi communautaire ou le Killathon). L'ouverture du site sans connexion ne permet pas de rattacher l'activité à un membre.
- **Constat :** la base `members` contient `joined_at` et `updated_at`, mais **pas de champ dédié `last_active_at`**. Le champ `updated_at` est modifié par certains changements de profil/points ; il **ne constitue pas un indicateur fiable de dernière utilisation**.
- **Préconditions avant automatisation :** ajouter un champ de dernière activité, le mettre à jour côté serveur lorsqu'un utilisateur authentifié interagit (en limitant les écritures excessives), prévoir une migration non destructive, effectuer une sauvegarde de D1, tester la purge sur une base de développement et résoudre la question des références du Tribunal.
- **Mesure de protection lors du lancement :** pour les comptes existants, **ne jamais calculer immédiatement les six mois à partir de `joined_at` ou `updated_at`** ; initialiser un point de départ prudent pour éviter toute suppression rétroactive injustifiée. Informer les membres clairement avant la première purge et envisager un avertissement préalable.
- **Code préparé et commité sur GitHub :** `backend/cloudflare/migrations/0007_member_activity.sql` (nouvelle table `member_activity`, initialisation des comptes existants à la date de migration), `POST /v1/me/activity` authentifié côté Worker et émission contrôlée depuis `dist/qg/twitch-auth.js`. Détail et ordre de déploiement dans `backend/cloudflare/SUIVI_INACTIVITE_6_MOIS.md`.
- **Commutateurs de sécurité :** `majestik-activity-enabled=false` dans le HTML et `ACTIVITY_TRACKING_ENABLED` requis à `true` dans le Worker. Aucun appel n'est effectué par le navigateur avant activation.
- **Statut :** règle choisie, **non encore activée en production**. Aucun compte, point ni vote n'a été supprimé lors de cet audit.

## Décisions à prendre avec l'éditeur avant modifications de la base

- Définir précisément la liste des interactions authentifiées qui réinitialisent le délai de six mois et les modalités de notification ;
- Le délai de conservation/anonymisation des propositions et résultats du Tribunal ;
- Les règles de conservation des futurs courriels et pièces jointes du formulaire ;
- L'étendue de l'effacement lors de la suppression du profil QG, tout en conservant éventuellement des statistiques anonymes.

## Références officielles

- CNIL, information et transparence : https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence
- CNIL, durées de conservation : https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees
- CNIL, cookies et traceurs : https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi
- CNIL, répondre aux demandes de droits : https://www.cnil.fr/fr/repondre-une-demande-de-droit-dacces
- Cloudflare D1, Time Travel : https://developers.cloudflare.com/d1/reference/time-travel/

**État :** audit statique terminé sur les points ci-dessus ; vérifications en production et arbitrages non terminés. Aucune modification de données personnelles ni des fonctions de production n'a été effectuée.
