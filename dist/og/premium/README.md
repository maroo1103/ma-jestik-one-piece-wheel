# Affiches premium Ma_JesTik Gaming — Open Graph

Ce dossier est réservé aux **6 visuels validés** et fournis au format **PNG 1200 × 630** :

- `qg.png` : Le QG communautaire
- `roue.png` : **LA ROUE** (aucune mention Fortnite ni nombre fixe de destinations)
- `tribunal.png` : Le Tribunal
- `defis.png` : Défis & missions
- `killathon.png` : Killathon
- `classement.png` : Classements

## Ajout des fichiers sur GitHub

1. Extraire les six PNG depuis `visuels-premium-ma-jestik-OG.zip`.
2. Depuis ce dossier `dist/og/premium/`, utiliser **Add file → Upload files** puis sélectionner les six **fichiers PNG**, pas le ZIP.
3. Valider le commit sur `main`. Le workflow `publier-roue.yml` prend le relais automatiquement.

À chaque déploiement, GitHub Actions génère `dist/og/{nom}.png` en reprenant les pixels du PNG premium, ainsi que `dist/og/{nom}.webp` optimisé pour les cartes de l'accueil. Les deux rendus utilisent donc le même visuel.

Si un PNG premium manque, le SVG préexistant reste un secours afin de ne jamais casser les miniatures. Les trois miniatures `setup`, `partenaires` et `createur` restent en attente d'une refonte validée.

Les images d'origine du setup, les zones cliquables, les profils Twitch et les Workers ne sont pas concernés.
