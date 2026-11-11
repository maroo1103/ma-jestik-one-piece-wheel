# Préparation des roues Warzone — Hajin et Zodiac
**Date :** 11 novembre 2026  
**État :** lieux vérifiés ; illustrations **non encore sélectionnées** ; modèles **non encore publiés** dans La Roue.  
**Travail demandé :** intégration de Hajin et Zodiac, puis Rebirth Island ; Verdansk en dernier. Les jingles audio seront traités ultérieurement.

## Exigences immuables
- Modèles **Hajin · Battle Royale** et **Zodiac · Résurgence**, séparés de Fortnite et des créations locales des visiteurs.
- Chaque secteur doit avoir une **vraie image du lieu, identifiable et vérifiée** (capture du jeu ou visuel réel officiellement associé à ce POI). **Aucune illustration générée par IA**, aucune image générique présentée comme un vrai lieu. Ne pas confondre images de DMZ et images de Warzone sans vérifier qu'il s'agit bien du même endroit visible.
- Conserver l'identité premium noire et or, les animations, le fonctionnement multijeux, le stockage local IndexedDB, les possibilités de modifier noms et images.
- Aucun nouveau Worker Cloudflare ni lecture/écriture D1. Les modèles et images fournis par défaut sont **statiques via GitHub Pages** ; la personnalisation reste purement locale dans le navigateur. **0 € de coût supplémentaire visé** ; respecter les quotas de GitHub Pages.
- Aucun son propre aux POI Warzone pour cette phase (les sons de tick du moteur restent).
- Ne pas afficher dans la bibliothèque publique de modèles une roue contenant une photo provisoire, non vérifiée, ou correspondant à un autre lieu. Valider chaque paire **nom ↔ image** avant publication.
- Les noms ci-dessous sont ceux du guide officiel anglais. Ne pas les renommer en français arbitrairement.

## Hajin — 13 POI officiels
Guide officiel **Warzone / Hajin** : https://www.callofduty.com/guides/warzone/hajin
1. 14th Political Prison
2. Chang-san Air Base
3. Deadtown
4. Imjin Farmland
5. Cheongun Village
6. Haneul Nuclear Reactor
7. Mirae General Hospital
8. NuriGo Mall
9. Cheonwang Peak Array
10. The Grid
11. Songdo Wharf
12. Wolves Stadium
13. Hajin River Heights

**Images :** chacune des 13 captures réelles doit être récupérée, examinée, attribuée au bon lieu, et intégrée en ressources statiques locales. Un article officiel consacré à la DMZ Hajin peut servir à retrouver des visuels d'endroits situés sur la même carte, mais il ne faut pas prétendre qu'il décrit les mécaniques Battle Royale : https://www.callofduty.com/en/blog/2026/10/call-of-duty-modern-warfare-4-dmz-deep-dive-hajin

## Zodiac — 10 POI officiels
Guide officiel **Warzone / Zodiac** : https://www.callofduty.com/guides/warzone/zodiac
1. Admin
2. Trackline
3. Furnace
4. Solar
5. Old Mines
6. Dispatch
7. Depot
8. Sentinel
9. Cooling
10. R&D

**Images :** 10 captures réelles distinctes, correspondant précisément à chaque POI, à documenter et valider avant la mise en ligne. Le guide officiel confirme les noms mais cela ne démontre **pas** à lui seul que dix captures distinctes sont disponibles librement sur le web.

## Développement : consignes
- Modèle Fortnite One Piece inchangé ; ne pas supprimer les images et réglages locaux des anciens visiteurs.
- Ajouter les deux modèles à la liste initiale seulement lorsque leurs images statiques sont prêtes et documentées. Attention : `dist/wheel-library.mjs` conserve aujourd'hui le modèle Fortnite initial ; une migration **additive** doit compléter les bibliothèques préexistantes **sans réactiver les choix décochés ni écraser les roues personnalisées**.
- `dist/app.js`, `dist/roue.html`, `dist/wheel-multijeux.css`, `dist/image-storage.mjs` et les tests de non-régression doivent être inspectés avant publication.
- Éviter les mises à jour répétées : regrouper les ajouts d'images et de données en un commit cohérent, puis valider les tests et le rendu du QG.
- Pour la lisibilité de 13 secteurs, vérifier les textes et les images sur desktop, mobile et mode stream.
- Rebirth Island **après** Hajin et Zodiac, Verdansk **en dernier**, selon l'ordre souhaité par le propriétaire.

## Checklist de publication
- [x] Noms des 13 POI Hajin confirmés par le guide officiel.
- [x] Noms des 10 POI Zodiac confirmés par le guide officiel.
- [ ] 13 images réelles de Hajin appariées et vérifiées.
- [ ] 10 images réelles de Zodiac appariées et vérifiées.
- [ ] Intégration des modèles dans la bibliothèque locale avec migration des utilisateurs existants.
- [ ] Tests automatisés et contrôle visuel réel.
- [ ] Publication GitHub Pages vérifiée.
- [ ] Validation finale par le propriétaire.
