# Roues Warzone — Rebirth Island et Verdansk (préparation du 11/11/2026)

**État au 11/11/2026 : Rebirth Island déployée avec 13 images et 2 cartes ; Verdansk encore en préparation et non publié.** Les roues existantes (Fortnite, Hajin, Zodiac) n'ont pas été modifiées. Vérification visuelle par l'utilisateur à confirmer.

## Décision du propriétaire

1. **Rebirth Island** : finir en premier.
2. **Verdansk** : terminer **en dernier**, après Rebirth.
3. Respecter à l'identique le modèle de publication déjà réalisé pour Hajin et Zodiac : véritables vues de chaque POI, carte sans noms en miniature à gauche, carte avec noms agrandissable au clic, modèles officiels verrouillés, roues copiées personnalisables, aucun jingle spécifique Warzone pour le moment.
4. Préparer le code dès maintenant ; ne rendre les nouveaux modèles visibles que lorsque **tous** les fichiers du jeu correspondant seront contrôlés. Aucune illustration fictive ni image IA présentée comme une capture de lieu.
5. Aucune API Cloudflare, aucun Worker ni D1 supplémentaire ; les fichiers sont des ressources statiques GitHub Pages ; les réglages utilisateurs restent en localStorage/IndexedDB.

## Rebirth Island — 13 destinations du modèle préparé

Base de travail : annonce officielle Call of Duty (nouvelle Turbine et Outpost, non marqué sur la carte) : https://news.blizzard.com/en-us/article/24250352/new-modes-ranked-play-and-a-refreshed-rebirth-island-await-in-warzone
Guide interactif récent : https://www.callofduty.com/guides/warzone/rebirth-island
Attention : le précédent Tac Atlas (https://www.callofduty.com/guides/tac-atlas-wz-rebirth-island) décrit **11 POI d'une version antérieure**. Les photos récupérées doivent correspondre à la **même version de carte** que la miniature et le zoom. Recontrôler les noms de la carte lorsque les images seront fournies.

| Index | Identifiant | Destination officielle | Nom du fichier final |
|---|---|---|---|
| 01 | rb01 | Bioweapons | rebirth/poi-01.webp |
| 02 | rb02 | Industries | rebirth/poi-02.webp |
| 03 | rb03 | Chemical Engineering | rebirth/poi-03.webp |
| 04 | rb04 | Dock | rebirth/poi-04.webp |
| 05 | rb05 | Turbine | rebirth/poi-05.webp |
| 06 | rb06 | Control Center | rebirth/poi-06.webp |
| 07 | rb07 | Prison | rebirth/poi-07.webp |
| 08 | rb08 | Harbor | rebirth/poi-08.webp |
| 09 | rb09 | Headquarters | rebirth/poi-09.webp |
| 10 | rb10 | Factory | rebirth/poi-10.webp |
| 11 | rb11 | Living Quarters | rebirth/poi-11.webp |
| 12 | rb12 | Outpost *(lieu non marqué dans certaines versions)* | rebirth/poi-12.webp |
| 13 | rb13 | Stronghold | rebirth/poi-13.webp |

Le fichier statique final doit être **`dist/assets/warzone/rebirth/map-preview.webp`** (sans POI) et **`dist/assets/warzone/rebirth/map-full.png`** (avec noms des POI, version agrandie).

## Verdansk — inventaire provisoire de 21 POI

Base : les 20 lieux majeurs repris dans le guide officiel https://www.callofduty.com/guides/mobile/verdansk et **Drone Labs** ajouté dans les informations officielles Warzone 2026 (https://www.callofduty.com/patchnotes/2026/07/call-of-duty-bo7-warzone-season-05-patch-notes). Le Tac Atlas https://www.callofduty.com/guides/tac-atlas-verdansk mentionne 21 points majeurs.

**Validation indispensable avant publication :** le communiqué officiel Saison 1 du 2 novembre 2026 mentionne aussi **Signal Station, Grazna-7 Launch Complex et Overlook** comme nouveaux repères de Verdansk : https://www.callofduty.com/blog/2026/11/call-of-duty-modern-warfare-4-warzone-season-1 . Il n'est pas établi ici s'il faut les compter comme POI supplémentaires ou comme quartiers/sous-zones. Vérifier la carte et les 21/24 vrais noms lors de la fourniture des images ; adapter le modèle si la version saisonnière le nécessite. Ne pas inventer de captures.

| Index | Identifiant | Destination préparatoire |
|---|---|---|
| 01 | vd01 | Dam |
| 02 | vd02 | Military Base |
| 03 | vd03 | Quarry |
| 04 | vd04 | Airport |
| 05 | vd05 | TV Station |
| 06 | vd06 | Storage Town |
| 07 | vd07 | Superstore |
| 08 | vd08 | Stadium |
| 09 | vd09 | Lumber |
| 10 | vd10 | Boneyard |
| 11 | vd11 | Train Station |
| 12 | vd12 | Hospital |
| 13 | vd13 | Downtown |
| 14 | vd14 | Farmland |
| 15 | vd15 | Promenade West |
| 16 | vd16 | Promenade East |
| 17 | vd17 | Hills |
| 18 | vd18 | Park |
| 19 | vd19 | Port |
| 20 | vd20 | Prison |
| 21 | vd21 | Drone Labs |

Fichiers prévus : `verdansk/poi-01.webp` à `verdansk/poi-21.webp`, `verdansk/map-preview.webp` (sans POI) et `verdansk/map-full.png` (avec POI).

## Implémentation déjà codée

- `dist/warzone-rebirth.mjs`, `dist/warzone-verdansk.mjs` : modèles, noms, identifiants, chemins et état verrouillé.
- `dist/wheel-library.mjs` : modèles ajoutés **uniquement** lorsque le manifeste validé indique la disponibilité de leurs 13/21 images et deux cartes ; **Verdansk reste masqué tant que Rebirth ne l'est pas**. Migration additive pour les anciens navigateurs, sans supprimer ni modifier les roues personnalisées.
- `dist/app.js` : garde par carte des fichiers disponibles, miniature sans POI, statistiques, sélections, images et jeu de roue conservés, lien « Dupliquer » toujours utilisable.
- `dist/map.js` : fenêtre agrandie native pour les cartes Rebirth et Verdansk, mêmes commandes que les autres roues.
- `scripts/deploy-future-warzone-assets.py` : contrôle complet des archives, WebP/PNG, tailles/empreintes SHA256, puis fusion du manifeste existant `dist/assets/warzone/manifest.json`. **Ne touche à rien en l'absence d'un ZIP complet pour chaque jeu.** Rebirth et Verdansk peuvent être livrées séparément.
- `.github/workflows/publier-roue.yml` et `.github/workflows/qg-privacy-tests.yml` : script d'import et contrôles syntaxiques intégrés ; aucun coût d'hébergement supplémentaire promis, les quotas GitHub Pages continuent de s'appliquer.

## Incident résolu lors de la publication Rebirth (11/11/2026)
- Le pack ZIP authentique de l'utilisateur avait le **nom `Rebirth island.zip`** dans `dist/assets/`, alors que le script de publication n'acceptait que `rebirth-pack.zip`. Le contenu a été identifié comme **identique octet pour octet** au ZIP de livraison préparé : SHA du blob Git `e11df16944cbf3e6674ac86b22cfdf4f69a55711`.
- Le workflow initial `43085245207` avait été déclaré « succès », mais ses journaux indiquaient **`Rebirth et Verdansk non fournis : modèles masqués et QG inchangé`**. Le ZIP était correctement commité, seul le nom empêchait le traitement.
- Correction dans `scripts/deploy-future-warzone-assets.py` : fonction `archive_path(game)` acceptant les deux noms pour Rebirth et conservant le contrôle strict des **15 fichiers**. Un commit sous `dist/warzone-rebirth.mjs` a déclenché un nouveau déploiement.
- Workflow de publication `43086293175` **terminé avec succès** : ligne `Pack rebirth vérifié : 13 photos authentiques + 2 cartes.`, présence dans l'artefact des `poi-01.webp` à `poi-13.webp`, `map-preview.webp`, `map-full.png` et manifeste mis à jour. Tests Node `43086259558` (avec nouveau test de nom) **réussis**.
- Site cible : `https://ma-jestik.fr/qg/#/roue`. Les tests n'ont pas ouvert un vrai navigateur en production ; le propriétaire confirmera l'apparition sur écran après actualisation Ctrl+F5. Verdansk reste non publié.

## Comment finaliser avec les images authentiques

Pour éviter toute erreur POI/image, l'utilisateur peut envoyer son ZIP original avec les images aux noms des lieux, plus les quatre cartes sans/avec POI, comme pour Hajin/Zodiac. L'assistant vérifie la correspondance et prépare alors les paquets normalisés :
- `dist/assets/rebirth-pack.zip` (ou **`dist/assets/Rebirth island.zip`**, nom réellement fourni et pris en charge depuis le correctif) contient **exactement** `rebirth/poi-01.webp` ... `rebirth/poi-13.webp`, `rebirth/map-preview.webp`, `rebirth/map-full.png`, sans fichiers supplémentaires.
- `dist/assets/verdansk-pack.zip` contient **exactement** `verdansk/poi-01.webp` ... `verdansk/poi-21.webp`, `verdansk/map-preview.webp`, `verdansk/map-full.png`, sans fichiers supplémentaires ; ajuster les 21 noms avant envoi si la nouvelle carte a changé.
- Une fois **le pack Rebirth** enregistré sur `main`, GitHub Pages exécute l'import, le manifeste contient les 13 lieux et le modèle apparaît automatiquement chez les utilisateurs existants, sans casser leur sélection.
- **Verdansk après Rebirth** selon l'ordre demandé.
- Aucun son spécifique POI pour l'instant.

## Contrôles de réception avant publication

- [x] Modules et identifiants des 13+21 lieux préparés.
- [x] Activation conditionnée à la disponibilité des véritables captures et cartes.
- [x] Garde d'ordre : Rebirth avant Verdansk.
- [x] Pipeline statique prêt pour les deux ZIP.
- [x] 13 vraies photos de Rebirth et deux cartes reçues (12 captures de l'atlas + capture Outpost), validées et ajoutées au manifeste.
- [x] Déploiement Rebirth réussi : GitHub Actions `43086293175`, **13 captures et 2 cartes** présents dans l'artefact GitHub Pages.
- [ ] Contrôle visuel réel Rebirth par l'utilisateur (PC et mobile) à confirmer.
- [ ] Nouveaux lieux saisonniers Verdansk recoupés avec la bonne carte.
- [ ] Vraies images de tous les lieux Verdansk approuvées, deux cartes correspondantes.
- [ ] Déploiement et contrôle visuel réel Verdansk (PC et mobile).
