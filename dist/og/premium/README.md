# Affiches premium Ma_JesTik — Open Graph

## État

Les cinq affiches validées sont prêtes à être importées depuis le pack `affiches-ma-jestik-premium-OG.zip`.

### Fichiers à mettre dans ce dossier (`dist/og/premium/`)

- `qg.png` — Le QG communautaire
- `tribunal.png` — Le Tribunal
- `defis.png` — Défis & missions
- `killathon.png` — Killathon
- `classement.png` — Classements

Ces cinq fichiers font **1200 × 630 px**, optimisés à partir des images validées. Ne pas mettre le fichier ZIP directement ici : **extraire les cinq PNG**, puis les envoyer dans ce dossier.

## Étapes GitHub

1. Ouvrir `dist/og/premium/` dans le dépôt `maroo1103/ma-jestik-site`, branche `main`.
2. Cliquer **Add file → Upload files**.
3. Glisser les **cinq PNG**, valider **Commit changes**.

Un nouveau déploiement GitHub Pages démarre automatiquement. Le workflow `.github/workflows/publier-roue.yml` prend les PNG premium comme source de référence pour produire `dist/og/*.png` (partage Discord) et `dist/og/*.webp` (cartes du QG).

La roue possède désormais un PNG premium noir et or (`roue.png`) validé le 10 novembre 2026 ; son SVG noir/or constitue le visuel de secours. Les rubriques Setup, À propos, et Code créateur disposent de SVG harmonisés noir et or. Les images OG de ces rubriques sont générées au déploiement à partir des SVG.

**Important :** tant que les cinq PNG ne sont pas envoyés ici, GitHub génère encore les SVG de secours pour les cinq rubriques.
