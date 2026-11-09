# Setup interactif Ma_JesTik — fiches internes, sans affiliation

Date : 9 novembre 2026 · Périmètre : `dist/qg/setup-original/` et URL de l'iframe du QG.

## Modifications réalisées
- **13 zones interactives exactement préservées** : mêmes SVG, mêmes coordonnées et mêmes chemins, sans déplacement ni création de hotspots.
- Au clic, les 13 liens commerciaux précédents sont remplacés par un `<dialog>` natif avec fiche produit, caractéristiques, usage, photographie personnelle disponible ou emplacement de photo, bouton de fermeture, Échap, restauration du focus, et mise en page responsive.
- Le clic sur la tour affiche **une fiche** (comme chaque autre objet). Le lien interne « Configuration PC » reste présent dans l'en-tête, au-dessous de la photo et dans la fiche de la tour.
- La page `config-pc.html` présente **11 composants** à partir du même catalogue `materiel.js`. Aucun bouton Amazon.
- `script.js` conserve les contrôles et règles d'origine pour le zoom (100 à 200 %, pas de 25 %, défilement mobile), les survols et le tooltip.
- `fiche-produit.js` est un module local sans bibliothèque et sans serveur : construit les fiches et gère les boîtes de dialogue.
- `config-pc.js` génère les 11 cartes du PC (une source de vérité pour toutes les caractéristiques).
- CSS premium graphite/champagne, PC à deux colonnes photo / informations ; téléphone en une colonne, hauteur maximale et scrolling de la modale.
- Les scripts, photos et fiches sont hébergés sur des pages GitHub. **Aucun Worker, D1, R2 ni stockage payant**.

## Provenance des images utilisées
1. `https://maroo1103.github.io/setup-ma-jestik/assets/setup-ma-jestikk.png` — photographie réelle du setup déjà exploitée par le site actuel, dans un **autre dépôt GitHub appartenant au même créateur**. Les 12 fiches des objets visibles utilisent des cadrages de cette photo et ne créent pas de nouvelles images artificielles.
2. `../media/pc-ma-jestik-cadre.webp` — photographie réelle de la tour Ma_JesTik, au format WebP, produite par le workflow GitHub Pages à partir du fichier personnel `dist/pc-ma-jestik-nouveau.webp`. Elle est affichée dans la fiche « Tour PC » et la fiche « NZXT H6 Flow ARGB ».
3. Pour les autres composants internes : emplacements sobres **PHOTO À AJOUTER**, sans images marchandes récupérées de façon non autorisée.

**Limites photographiques :** les recadrages de la photo du setup sont authentiques, mais peuvent être moins nets sur de petits objets (webcam, support et souris). Des photographies dédiées amélioreraient la qualité. Aucune photographie officielle constructeur n'a été réutilisée sans permission explicite.

## Les 13 zones conservées
| Zone | Identifiant fiche | Modèle |
|---|---|---|
| Console | `ps5` | PlayStation 5 |
| Manette blanche console | `ps5-pad` | Manette PS5 blanche — révision à confirmer |
| Manette PC | `scuf` | SCUF Envision Pro |
| Webcam | `webcam` | Elgato Facecam Neo |
| Écran principal | `screen-main` | MSI MAG 27CQ6F |
| Écran secondaire | `screen-second` | AOC CQ27G2S |
| Support moniteurs | `monitor-arm` | Support double écran — marque à confirmer |
| Micro | `micro` | RØDE NT-USB+ |
| Casque | `headphones` | Astro A50 Gen4 |
| Clavier | `keyboard` | Logitech G213 |
| Souris | `mouse` | Logitech G502 — variante à confirmer |
| Tour | `pc-tower` | PC gaming Ma_JesTik |
| Fauteuil | `chair` | Chaise gaming — marque à confirmer |

## Les 11 composants internes
1. Boîtier NZXT H6 Flow ARGB — noir (**photo réelle de la tour disponible**).
2. Processeur AMD Ryzen 7 7800X3D (**photo dédiée manquante**).
3. Carte mère MSI B650 Gaming Plus WiFi (**photo dédiée manquante**).
4. Carte graphique PNY RTX 5070 Ti EPIC-X ARGB OC (**photo dédiée manquante**).
5. Mémoire Crucial Pro 32 Go DDR5 6400 CL36, utilisée à 6000 MHz (**photo dédiée manquante**).
6. SSD Kingston NV3 1 To (**photo dédiée manquante**).
7. Alimentation MSI A750GLS PCIe5 750 W (**photo dédiée manquante**).
8. Watercooling ARCTIC Liquid Freezer III 360 **non-RGB** (**photo dédiée manquante**).
9. 3 × ARCTIC P12 Pro Reverse ARGB avant (**photo dédiée manquante**).
10. ARCTIC P12 ARGB arrière (**photo dédiée manquante**).
11. 2 × ARCTIC P14 Pro Reverse ARGB en bas (**photo dédiée manquante**).

## Contrôles et limites
- Les boutons « Voir sur Amazon », les URL `link.amazon`, `amazon.fr/dp` et les mentions de partenariat Amazon ont été retirés des deux anciennes pages du setup.
- Les 13 ancres SVG ouvrent une fiche sans redirection commerciale ; un bouton de fermeture, Échap et le clic sur l'arrière-plan referment la fenêtre.
- Après fermeture, le focus revient à l'élément qui avait ouvert la fiche (s'il existe toujours).
- La page Configuration PC utilise le même fichier de données ; les images sont injectées seulement lors de l'ouverture d'une fiche, excepté la photo WebP du boîtier chargée en `loading="lazy"` dans sa carte.
- Le chargement initial de la **photo originale du setup** conserve son URL, sa taille 1448 × 1086, ses contours SVG et le zoom existants.
- Les écrans et les autres fonctionnalités du QG, Twitch, profils, votes, Tribunal, Killathon, roue, backend Cloudflare n'ont pas été modifiés.
- **À valider visuellement dans un navigateur** : position/cadrage des recadrages, ergonomie iOS/Android, compatibilité dialog dans iframe, restitution du focus et chargement des photos. Les tests automatisés statiques ne remplacent pas un essai sur mobile.

## Mise à jour des visuels — novembre 2026
- ZIP fourni par le propriétaire : `photos-ma-jestik.zip`, 24 fichiers (11 composants PC et 13 périphériques).
- Noms normalisés : `manette-scuf.jpg` → `scuf.webp` ; `ps5.jpg.jpg` → `ps5.webp`.
- Les 24 fichiers ont été convertis en WebP **1200 × 1200** avec fond graphite et détourage non génératif autant que possible. Le fichier ZIP de livraison `photos-ma-jestik-optimisees.zip` contient les 24 WebP et un aperçu.
- Le catalogue `materiel.js` pointe vers `./images/products/{id}.webp` pour **chacune des 24 fiches**. Les anciennes images recadrées du setup ne sont plus utilisées dans les fiches.
- **Attention : le connecteur GitHub ne permet pas dans cette session d'envoyer directement les fichiers WebP binaires issus d'une archive locale.** Les images ne seront pas présentes dans le dépôt tant qu'elles n'ont pas été téléversées dans `dist/qg/setup-original/images/products/`. Le code prévoit un affichage de secours « PHOTO À AJOUTER » pour les fichiers manquants.
- Vérifier le droit de republication des images reçues avant leur mise en ligne publique : elles peuvent provenir de fabricants ou boutiques. Le ZIP ne fournit pas de preuve de licence.
- `pc-tower.webp` et `case.webp` ont chacun un visuel distinct, tel que fourni.
- Les sources initiales basse résolution (300–500 pixels) sont interpolées pour l'uniformité, mais ne gagnent pas de détail réel.
- La photo du setup servant aux **13 zones SVG** reste totalement inchangée, ainsi que le zoom et les autres pages du QG.

## Version finale approuvée — 9 novembre 2026
Le ZIP `photos-ma-jestik-final.zip` fourni par le créateur comporte 24 PNG carrés de 1254 × 1254 pixels. Ils ont été convertis en **WebP sans perte (VP8L)**, sans recadrage ni réduction, avec vérification d'égalité parfaite des pixels pour les 24. Le paquet prêt à importer est `photos-ma-jestik-premium-sans-perte.zip` et comprend `products/*.webp`, les instructions et le bilan de contrôle. Leurs noms sont les 24 identifiants de `materiel.js`; `Webcam.png` a été normalisé en `webcam.webp`. **Ces images sont des rendus graphiques premium validés, non des photographies documentaires réelles du matériel.** Le code GitHub a été préparé, mais les WebP binaires ne sont pas encore téléversés : un import manuel de `products/*.webp` dans `dist/qg/setup-original/images/products/` reste nécessaire, le connecteur ne disposant pas d'un mécanisme d'import binaire depuis le conteneur. La photographie du setup, les 13 zones SVG et les autres fonctions du site sont inchangées.
