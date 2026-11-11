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
