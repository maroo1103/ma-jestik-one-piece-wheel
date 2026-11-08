# Ma_JesTik — pied de page et Centre d'aide / FAQ

Date : 8 novembre 2026. Déploiement sans frais supplémentaires ni modification des Workers, de D1, de l'authentification, des points ou des comptes.

## Réalisation
- Remplacement du pied de page minimal par une navigation en quatre colonnes sur PC (présentation et réseaux, Le QG, Communauté, Aide & Infos), en trois puis deux colonnes sur formats intermédiaires/mobile.
- Réutilisation des quatre liens déjà présents dans l'en-tête : Twitch, Instagram, TikTok et Discord ; pas de nouvelles destinations inventées.
- Ajout de la page `#/aide` (fichier `dist/qg/aide.js`) avec 20 réponses dans 4 rubriques : compte et profil, outils gaming, communauté, technique/assistance.
- Recherche locale côté navigateur, sans API, télémétrie ni stockage ; réponses en `<details>` accessibles au clavier.
- Ajout de la route d'aide dans l'allowlist Twitch pour préserver la navigation lors d'une authentification lancée depuis cette page.
- Feuille `dist/qg/footer-help.css` autonome, chargée après les CSS existants. Rendu responsive et prise en compte des animations réduites.
- Les réponses décrivent le fonctionnement actuellement vérifié des profils Twitch, des préférences de classement, des pronostics, du Killathon communautaire manuel, des défis et du Tribunal.

## Hors périmètre — à définir avec le propriétaire
- Ne pas créer de formulaire de contact, d'adresse email de support ni de nouveau Worker sans choix explicite.
- Ne pas inventer une identité d'éditeur, une adresse postale, un hébergeur légal déclaré ou un DPO.
- **Mentions légales et politique de confidentialité** : encore à rédiger et à valider avant l'ouverture officielle. Les mentions « à compléter » du footer ne sont pas des liens et ne doivent pas être présentées comme des pages légales finalisées.
- Avant publication officielle, vérifier les informations et mentions réglementaires réelles ainsi que les formulations sur les droits des jeux et logos.
- Aucun script externe, service de tracking, abonnement payant ou nouvelle base n'a été créé.

## Vérifications manuelles conseillées
1. Accueil / Roue / Défis / Killathon / Tribunal / Classements / Setup / Profil : le pied de page est visible et les liens ne renvoient pas de page inconnue.
2. Ouvrir `https://ma-jestik.fr/qg/#/aide` ; vérifier les 20 réponses et la recherche avec « Twitch », « classement », « killathon », « confidentialité ».
3. Sur mobile, vérifier le passage en deux colonnes et l'absence de défilement horizontal.
4. Ouvrir les liens sociaux et Discord ; vérifier la destination sans modifier les paramètres des comptes.
5. Vérifier que les boutons de menu, le retour OAuth Twitch, les profils et les votes fonctionnent comme avant.
