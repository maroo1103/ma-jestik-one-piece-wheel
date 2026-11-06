# Ma_JesTik · QG communautaire — première fondation

## Objectif

Une seule adresse et une navigation interne pour toutes les créations Ma_JesTik, accessible publiquement. Aucun abonnement mensuel. Le projet doit pouvoir passer plus tard sous un nom de domaine `.fr` acheté par son propriétaire.

## Livraison actuelle (V1, démonstrateur public)

- Accueil et menu responsive à sous-menus, sans création de nouvelles fenêtres.
- Roue Fortnite **existante** intégrée dans le site grâce à une iframe de même origine (`../`). Son code, ses sons, ses images et sa page d’origine restent inchangés.
- Pages dédiées aux défis, bingo, coffre et tribunal. Les contenus sont volontairement **à définir avec Ma_JesTik avant de les rendre publics**.
- Page Classements : présentation uniquement, sans faux scores et sans prétendre qu’une base de données est déjà en service.
- Mon setup interactif : fiches matérielles sélectionnables, avant ajout des photos.
- Affiliations Instant Gaming et Amazon : emplacements, **aucun lien affilié fictif**.
- Code créateur : emplacement inactif tant qu'il n'est pas obtenu.
- Comptes : bouton d'information, **aucune inscription fictive**.

## À construire avant de considérer le site complet

1. Validations éditoriales : listes précises des défis, cases du bingo, surprises et questions du tribunal.
2. UX et moteur de jeux + paramètres indépendants par visiteur.
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
