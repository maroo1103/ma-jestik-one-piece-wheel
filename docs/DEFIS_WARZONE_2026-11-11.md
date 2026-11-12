## Ajout officiel de Verdansk — 12 novembre 2026
- Le QG propose désormais **quatre catalogues Warzone de 100 défis** : Hajin (Battle Royale), Zodiac (Résurgence), Rebirth Island (Résurgence) et **Verdansk (Battle Royale)**, ce dernier placé après Rebirth dans la liste. **Fortnite : 118 défis inchangés**.
- Verdansk : 20 Solo, 20 Duo, 20 Trio, 20 Quatuor et 20 Bonus ; tous les **21 POI exactement nommés comme dans `dist/warzone-verdansk.mjs`** sont représentés. Aucun site ou image n'est ajouté pour les défis.
- `dist/qg/warzone-challenges.mjs` : quatrième entrée, paramètres BR et 12 variantes localisées supplémentaires ; les 3 catalogues précédents ne changent pas. `dist/qg/defis.js` réutilise l'interface, les filtres, l'historique, les activations et le tirage comme sur les autres cartes. Sauvegarde indépendante : `ma_jestik_qg_defis_warzone-verdansk_v1`.
- Propositions des viewers : marqueur de jeu `⊛V⊛`, sans interférer avec Fortnite, Hajin, Zodiac et Rebirth, ni créer une nouvelle API.
- Pronostics officiels : la migration **`0010_verdansk_votes.sql`**, **strictement additive** (aucun ALTER, DROP ni suppression des anciennes données), crée `vote_rounds_verdansk`, `vote_ballots_verdansk` et `vote_points_verdansk`, avec contraintes d'unicité, cascade sur suppression membre, et mêmes validations Twitch serveur.
- Le Worker `ma-jestik-qg-members` est mis à jour en production à 100 % et vérifié avec le même code que GitHub. Il tient compte des votes Verdansk lors de l'ouverture/clôture/résolution et des scores cumulés des membres, sans remplacer les anciennes tables. Les tâches de purge RGPD et le Cron quotidien ont été préservés.
- Avant migration : point D1 Time Travel + export SQL Cloudflare générés ; après migration : 8 anciennes manches Fortnite et 1 manche Warzone conservées, 0 enregistrement Verdansk (aucun vote de test injecté dans D1 production), contrôle `foreign_key_check` sans anomalie.
- Tests : 10 contrôles statiques/comportementaux ciblés réussis (défis, POI, modules, anciens jeux, confidentialités et caches). Le test d'intégration SQLite additionnel se trouve dans `backend/cloudflare/tests/privacy.test.mjs` et doit être exécuté avec Node.js 22+ et `--experimental-sqlite`. Le rendu public GitHub Pages et le vote Twitch réel doivent être vérifiés séparément si aucun accès navigateur n'est disponible.
- Limite **inchangée** : les pronostics Warzone (Verdansk compris) ne sont pas encore inclus dans les objectifs des missions mensuelles, bien que leurs points comptent pour le classement ordinaire.

# Défis & Missions — Warzone Hajin, Zodiac et Rebirth Island (11/11/2026)

## État
Trois catalogues **activés et publiés sur le QG** (sans modifier Fortnite) :
- **Fortnite Zero Build** : les 118 défis originaux, leur interface, leur catalogue, leurs filtres et leur clé de sauvegarde `ma_jestik_qg_defis_fortnite_v1` sont conservés.
- **Warzone · Hajin · Battle Royale** : 100 défis.
- **Warzone · Zodiac · Résurgence** : 100 défis.
- **Warzone · Rebirth Island · Résurgence** : 100 défis.
- **Verdansk** : non ajouté tant que la roue et ses ressources ne sont pas finalisées.

## Répartition et fonctionnalités
Pour chacune des trois cartes Warzone : **20 Solo + 20 Duo + 20 Trio + 20 Quatuor + 20 spéciaux** utilisables dans chaque composition. Chaque mission contient titre, consignes vérifiables, difficulté (Facile/Moyen/Difficile) et catégorie (Combat, Survie, Stratégie ou composition). Les noms des POI sont pris exclusivement dans les modèles officiels des trois roues.

**Interface inchangée** : mêmes panneaux, mêmes compteurs de réussites/échecs/passées, filtres par composition et difficulté, tirage aléatoire, case active, historique, mode propositions viewers, catalogue déroulant avec catégories/tri/tout activer/tout désactiver et pronostic des viewers. Même CSS, aucune carte ou roue modifiée.

## Implémentation et isolation
- `dist/qg/warzone-challenges.mjs` : catalogues générés localement à partir de 100 scénarios, contextualisés avec les vrais lieux et objectifs par carte.
- `dist/qg/defis.js` : réutilise le même système pour les quatre jeux et commute seulement les catalogues et les données locales.
- Clés de sauvegarde Warzone : `ma_jestik_qg_defis_warzone-hajin_v1`, `ma_jestik_qg_defis_warzone-zodiac_v1`, `ma_jestik_qg_defis_warzone-rebirth_v1`; la clé Fortnite reste **strictement inchangée**.
- `dist/qg/challenge-proposals.js` : propositions de viewers isolées par jeu avec marqueurs discrets dans la description, sans nouvelle API Tribunal ; les propositions Fortnite historiques restent affectées à Fortnite.
- `dist/qg/votes.js` : identifiant de jeu exact envoyé au Worker, mêmes affichage, procédures, règles de points et gestion propriétaire que Fortnite.

## Votes officiels (extension D1 sans remplacer les données Fortnite)
- Schéma d'origine `vote_rounds`, `vote_ballots`, `vote_points` **inchangé**.
- Migration additive `backend/cloudflare/migrations/0009_warzone_votes.sql` appliquée le 11/11/2026 : `vote_rounds_warzone`, `vote_ballots_warzone`, `vote_points_warzone`.
- `backend/cloudflare/src/worker.js` : route les votes selon le jeu, refuse une nouvelle manche si une autre est ouverte, limite chaque utilisateur à un vote par manche, crédite les points uniquement après résultat officiel et cumule les points Fortnite + Warzone. La suppression du profil Twitch efface également les votes Warzone via les clés étrangères.
- Worker Cloudflare **`ma-jestik-qg-members` déployé le 11/11/2026 à 20:10 UTC** ; la version et les bindings existants ont été revérifiés.
- **Pas de nouvelle donnée personnelle** : mêmes Twitch ID, votes et points que le système Fortnite existant ; pas de nouvelle finalité ni de nouvelle connexion externe.
- **Limite connue** : les *missions mensuelles* récupèrent pour l'instant les pronostics Fortnite seulement. Ne pas prétendre que les pronostics Warzone sont comptabilisés dans leur objectif mensuel sans adapter et vérifier séparément `monthly-missions-worker.js`. Les points ordinaires du classement, eux, sont cumulés entre les jeux.

## Contrôles et sécurité
- Tests hors production `backend/cloudflare/tests/warzone-defis.test.mjs` : exactement 100 défis par carte, 20 par groupe, vrais POI, titres et descriptions sans doublons internes, 118 Fortnite préservés, modules chargés.
- Tests SQLite isolés `backend/cloudflare/tests/privacy.test.mjs` : démarrage d'un vote Rebirth, refus d'une seconde manche, vote unique, clôture, résolution, attribution unique de points, conservation des votes Fortnite, suppression des votes Warzone avec le membre.
- Tests CI et publication GitHub Pages vérifiés le 11/11/2026 ; tester le rendu en navigateur propriétaire avec **Ctrl+F5** sur `https://ma-jestik.fr/qg/#/defis`, puis vérifier l'ensemble des modes et les pronostics avec des comptes Twitch autorisés.
- Les scripts Cloudflare et migrations de ce chantier doivent rester versionnés, sans secret ni identifiant de personne dans GitHub.
