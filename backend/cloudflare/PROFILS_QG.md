# Profils Ma_JesTik — mise en service Cloudflare D1

## Livraison visuelle sur GitHub Pages
- Route personnelle : https://ma-jestik.fr/qg/#/profil
- Accès depuis le menu du compte Twitch connecté : « Mon profil personnalisable ».
- Visuel : bannière graphite/or, avatar Twitch, bio, liens facultatifs, jusqu'à 4 jeux illustrés et jeu principal.
- Le formulaire fonctionne d'abord en **aperçu local** : sauvegarde dans le navigateur (localStorage, clé par identifiant Twitch). Elle n'est pas visible des autres et ne se synchronise pas entre appareils.
- Le bandeau du profil indique explicitement le mode. N'affiche aucun score fictif.
- Les miniatures des jeux utilisent une illustration Fortnite existante et des images publiques des fiches Steam pour les autres jeux ; elles peuvent être indisponibles hors ligne.

## Activation de la sauvegarde en ligne (nécessite l'accès Cloudflare)
**Ne pas remplacer le Worker avant la migration.** Le code GitHub ne déploie pas automatiquement Cloudflare.

1. Sauvegarder les fichiers actuels du Worker \`ma-jestik-qg-members\` et la base D1 \`ma-jestik-qg-members\`.
2. Dans **Cloudflare > D1 > ma-jestik-qg-members > Console**, exécuter le fichier :
   \`backend/cloudflare/migrations/0005_member_profiles.sql\`.
   Cette migration ajoute uniquement la table \`member_profiles\`, sans supprimer ni modifier les membres, votes, Tribunal ou Killathons.
3. Dans **Workers & Pages > ma-jestik-qg-members**, remplacer le code par \`backend/cloudflare/src/worker.js\` du dépôt après vérification qu'il contient bien les personnalisations actuelles du Worker actif. **Attention :** ce fichier peut différer de la version déployée. Comparer avant de remplacer.
4. Confirmer la liaison \`DB\`, \`TWITCH_CLIENT_ID\`, \`OWNER_TWITCH_ID\` et \`ALLOWED_ORIGIN=https://ma-jestik.fr\` (ou la valeur effectivement utilisée en production). Ne jamais coller de secrets dans GitHub.
5. Tester \`GET /v1/health\`, puis les votes, les profils existants, le classement et le nouveau profil.
6. Connecter un compte Twitch avec profil QG enregistré, visiter \`#/profil\`, personnaliser, enregistrer puis actualiser : les modifications doivent rester en place, y compris sur un second appareil.
7. Vérifier la protection : impossible d'éditer le profil d'un autre compte ; profils privés non accessibles par \`GET /v1/profiles/<id>\`.

## Contrat API
- \`GET /v1/profiles/me\` : Twitch connecté ; profil personnalisé, statistiques exactes et identité.
- \`PATCH /v1/profiles/me\` : Twitch connecté et membre enregistré ; modification de bio, étiquette, bannière, accent, jeux, réseaux et visibilité du profil (validation stricte).
- \`GET /v1/profiles/<twitch_id>\` : profil public uniquement si \`is_public=1\`.
- Les points et rangs restent calculés en D1 et ne sont jamais modifiables depuis le formulaire.
- Visibilité du profil **indépendante** de \`visible_in_ranking\`.
- La suppression d'un membre supprime son profil personnalisé via la clé étrangère \`ON DELETE CASCADE\`.

## Précautions
- Pas d'upload d'images personnelles ni de mot de passe supplémentaire.
- Aucun badge, victoire ou nombre de membres fictif.
- Les données du brouillon local ne sont pas publiées automatiquement lorsque le Worker est activé : l'utilisateur doit cliquer sur Enregistrer.
- N'effectuer aucun déploiement Cloudflare à l'aveugle ; garder les anciennes automatisations intactes.
