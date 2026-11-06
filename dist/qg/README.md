# Ma_JesTik · QG communautaire — première fondation

## Objectif

Une seule adresse et une navigation interne pour toutes les créations Ma_JesTik, accessible publiquement. Aucun abonnement mensuel. Le projet doit pouvoir passer plus tard sous un nom de domaine `.fr` acheté par son propriétaire.

## Livraison actuelle (V1, démonstrateur public)

- Accueil et menu responsive à sous-menus, sans création de nouvelles fenêtres.
- Roue Fortnite **existante** intégrée dans le site grâce à une iframe de même origine (`../`). Son code, ses sons, ses images et sa page d’origine restent inchangés.
- **Défis Fortnite Zero Build jouables : 28 missions validées par Ma_JesTik** (24 compatibles Solo/Duo/Trio/Quatuor et 4 réservées au Duo), choix du mode d'équipe, filtrage et tri par difficulté croissante/décroissante, choix des missions actives, tirage sans répétition immédiate, journal local des réussites/échecs et propositions de viewers à valider localement. Le moteur est dans `defis.js`, le style dans `defis.css`. Les données sont sauvegardées uniquement dans le navigateur du visiteur, sans compte ni classement partagé.
- Pages Bingo, Coffre et Tribunal : les contenus sont volontairement **à définir avec Ma_JesTik avant activation publique**.
- Page Classements : présentation uniquement, sans faux scores et sans prétendre qu’une base de données est déjà en service.
- Mon setup interactif : **la vraie création Ma_JesTik d'origine**, avec photo interactive (13 zones), zoom, infobulles et sous-page de configuration PC. Le HTML/CSS/JS a été réintégré sous `setup-original/`. La photo et l'emoji sont actuellement servis depuis le dépôt original `setup-ma-jestik` pour préserver leurs fichiers binaires ; aucun nouvel onglet n'est ouvert pour ces pages internes.
- Affiliations Instant Gaming et Amazon : emplacements, **aucun lien affilié fictif**.
- Code créateur : emplacement inactif tant qu'il n'est pas obtenu.
- Comptes : bouton d'information, **aucune inscription fictive**.

## À construire avant de considérer le site complet

1. Validations éditoriales : les 28 défis Fortnite sont validés. Restent les cases du bingo, les surprises du coffre, les questions du tribunal et les défis des autres jeux.
2. Finaliser les moteurs de bingo, coffre et tribunal ; le module Défis Fortnite est déjà utilisable localement.
3. Authentification et autorisations réelles, session sécurisée, anti-abus, procédure de suppression de compte.
4. Classements partagés et système de calcul des points contrôlé côté serveur (pas via localStorage).
5. Stockage et API sur offres gratuites (ex. Cloudflare Workers + D1) en restant dans les quotas, sans activer un plan facturé.
6. Administration privée et sécurisée, sans accès aux contrôles OBS du streamer pour le public.
7. Visuels du setup et liens d'affiliation officiels fournis par le propriétaire.
8. Revue des conditions des ayants droit pour le contenu Fortnite / One Piece en présence de liens commerciaux.
9. Migration du portail vers la racine du domaine personnel quand le site sera prêt.

## Hébergement actuel

Le QG est à `/qg/` dans le dossier `dist` du dépôt qui héberge déjà la roue sur GitHub Pages. Cela évite d'altérer la roue. Ce dépôt reste la zone de test : l'achat du nom de domaine viendra ensuite.

## Modèle financier

Le budget visé est le prix annuel du domaine, sans abonnement mensuel. Les fournisseurs gratuits appliquent des quotas, aucune garantie de fonctionnement illimité n'est donnée. Toute fonction nécessitant un forfait payant doit être remplacée par une variante plus légère, différée ou désactivée après discussion.

## Développement responsable

Pas de classement « partagé » avec de faux chiffres; pas de formulaire qui fait croire qu'un compte a été créé; aucune clé API sensible dans le JavaScript public; validation manuelle des défis avant affichage sur un live.

## Origine du setup interactif

Projet original : `https://github.com/maroo1103/setup-ma-jestik`. Les liens Amazon sont conservés tels qu'ils figurent sur ce projet et n'ont pas été revérifiés individuellement. Lorsque le site sera regroupé définitivement, les médias devront idéalement être copiés en local pour supprimer la dépendance au dépôt d'origine. Les sorties vers Amazon restent des liens externes intentionnels.

## Défis Fortnite : compatibilité des modes

- Solo : 24 défis génériques.
- Duo : les 28 défis, dont 4 spécifiques au Duo.
- Trio et Quatuor : les 24 défis génériques ; aucune règle Duo n'est réinterprétée sans validation de Ma_JesTik.
- La liste est triable par numéro, du plus facile au plus difficile, ou dans l'ordre inverse. Le tirage aléatoire peut être filtré par difficulté.
- Les anciens historiques enregistrés dans le navigateur restent disponibles.
- Le catalogue ne comprend pas encore de missions d'autres jeux ; elles seront ajoutées ultérieurement après validation.
