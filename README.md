# Ma_JesTik · Roue Fortnite One Piece

Site interactif reprenant le projet original créé dans ChatGPT Work, sans modification graphique.

## Publication sur GitHub Pages

1. Depuis l'archive originale `ma-jestik-one-piece-projet-exact(1).zip`, extraire le dossier `ma-jestik-one-piece/dist/`.
2. Dans ce dépôt GitHub, choisir **Add file → Upload files**.
3. Déposer **le dossier `dist` entier**, avec ses fichiers et son sous-dossier `assets`, pour obtenir `dist/index.html` dans le dépôt.
4. Confirmer avec **Commit changes**.
5. Dans **Settings → Pages → Build and deployment → Source**, choisir **GitHub Actions**.
6. Vérifier l'exécution de `Publier la roue Ma_JesTik` dans l'onglet **Actions**.

Une fois activé, le site public sera accessible à :
https://maroo1103.github.io/ma-jestik-one-piece-wheel/

Le workflow `.github/workflows/publier-roue.yml` publie directement `dist/` lors de chaque modification. Aucun build Node.js n'est nécessaire.

## Comportement

Chaque visiteur fait tourner sa roue indépendamment ; ses choix, son historique et ses images personnalisées sont locaux à son navigateur. Les images communes à tous les visiteurs sont les fichiers `dist/assets/01.webp` à `12.webp`. Pour les remplacer pour tout le monde, il faudra modifier ces fichiers dans GitHub, lors d'une prochaine étape.

## Visibilité

GitHub Pages avec ce dépôt public ne protège pas le site par mot de passe. Le badge « Espace privé » vient de la version originale ; l'accès GitHub Pages est public. Si un accès privé est nécessaire, prévoir un autre hébergement ou une protection d'accès adaptée.
