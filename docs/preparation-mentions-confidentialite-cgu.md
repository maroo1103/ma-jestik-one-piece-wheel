# Préparation juridique — Ma_JesTik (projet personnel)
**Document de travail non publié sur le site.** Mise à jour : 9 novembre 2026. Les informations personnelles de l'éditeur ne doivent jamais être inventées ou divulguées sans son accord.

## Situation confirmée par l'éditeur
- Ma_JesTik (https://ma-jestik.fr/) est un projet gaming et communautaire personnel.
- Pas d'entreprise/microentreprise liée au site.
- Aucune commission encaissée à ce jour.
- Décision du 9 novembre 2026 : retirer du site les liens d'affiliation Amazon et Instant Gaming pour rester sans boutique/affiliation active pour le moment. Aucune donnée de base Cloudflare ou profil Twitch ne doit être effacée.
- Les liens simples vers Twitch, Instagram, TikTok et Discord sont conservés.

## Bases juridiques et organismes officiels consultés
- LCEN, art. 1-1 (rédaction en vigueur en 2026) : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049568614/
- CNIL — information sur les données et leurs finalités, bases juridiques, destinataires, durées, droits : https://www.cnil.fr/fr/passer-laction/rgpd-les-premieres-etapes
- CNIL — cookies et autres traceurs : https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi
- CNIL — droit des personnes : https://www.cnil.fr/fr/respecter-les-droits-des-personnes
- GitHub Pages — limites et cas d'usage personnels : https://docs.github.com/fr/pages/getting-started-with-github-pages/github-pages-limits

## Mentions légales — informations vérifiables et points à finaliser
- Nom du site : **Ma_JesTik**.
- Adresse publique : **https://ma-jestik.fr/** (QG : /qg/).
- Nature éditoriale déclarée : projet personnel de gaming et communauté, sans entreprise déclarée.
- Hébergement de la partie statique : GitHub Pages, GitHub, Inc. Siège/adresse indiquée par GitHub pour courrier : **88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis**. Vérifier cette information à la publication.
- Hébergement des services/API et de D1 : Cloudflare (Workers/D1), Cloudflare, Inc., **101 Townsend St., San Francisco, CA 94107, États-Unis**, selon les conditions de Cloudflare. Distinguer l'hébergement du site de celui des données.
- **À VÉRIFIER :** l'éditeur non professionnel peut ne publier que le nom et l'adresse de l'hébergeur **uniquement s'il lui a transmis les éléments d'identification personnelle exigés** (LCEN art. 1-1 II). Ne jamais affirmer que la condition est satisfaite sans vérification. Les liens affiliés retirés ne déterminent pas automatiquement le statut légal.
- **À DÉFINIR :** un canal de contact public fiable pour les demandes relatives au site et pour les droits RGPD, sans divulguer une adresse privée si une alternative adaptée existe.
- **À DÉFINIR :** politique de propriété intellectuelle conforme aux droits réels sur les images, musiques, marques et contenus de jeux.
- Le site ne doit pas afficher de numéro SIRET/SIREN fictif, de société fictive, de directeur de publication fictif ou d'adresse inventée.
- **État : mentions légales non encore finalisées ; ne pas publier en prétendant être conforme.**

## Politique de confidentialité — inventaire technique réel à valider
- Compte Twitch via OAuth : identifiant Twitch, pseudo et avatar ; le navigateur conserve un jeton Twitch **dans sessionStorage** ; le Worker valide le jeton auprès de Twitch.
- Cloudflare D1 : table `members` (ID Twitch, pseudo, avatar, points et réglage classement), `member_profiles` (bio, liens, jeux, paramètres, visibilité), tables liées aux pronostics, votes, Killathon communautaire, Tribunal et propositions.
- Les données des profils publics sont affichées si l'utilisateur active le réglage correspondant. L'affichage dans les classements possède son propre réglage. Les identifiants Twitch des votants ne sont pas renvoyés par la réponse publique du Tribunal, selon sa documentation.
- Le formulaire de suppression du profil QG appelle `DELETE /v1/me` et supprime la ligne `members`; les tables avec clés étrangères ON DELETE CASCADE peuvent suivre. **Cela ne garantit pas automatiquement la suppression de tous les historiques du Tribunal/archives/logs/sauvegardes** ; audit requis.
- Des données peuvent être conservées temporairement par le navigateur (préférences de certains outils gaming), les services d'hébergement et les journaux techniques.
- **À CONTRÔLER AVANT RÉDACTION FINALE :** finalités détaillées ; base juridique de chaque traitement ; destinataires et sous-traitants ; pays de transfert et garanties ; durées précises de conservation et stratégie d'effacement des sauvegardes ; gestion des demandes d'accès/effacement ; existence de cookies/traceurs soumis au consentement ; contact électronique approprié.
- Ne pas inventer de délais (« 30 jours », « 12 mois », etc.) non implémentés dans le code ou la configuration.
- **État : document de cadrage ; aucune politique de confidentialité finalisée n'est publiée par ce commit.**

## Conditions d'utilisation — proposition de règles
- Accès général gratuit ; aucun achat requis pour les outils du site.
- Respect d'autrui ; interdiction d'insultes, harcèlement, usurpation d'identité, contenu illégal et atteinte aux droits d'auteur.
- Votes et points communautaires virtuels : ne pas promettre de valeur monétaire ou de gains.
- Les propositions au Tribunal peuvent être modérées ou rejetées ; expliquer la modération réelle.
- L'utilisateur garde la maîtrise des paramètres publics de son profil et peut supprimer son profil QG, avec des effets sur certaines données associées.
- Les services tiers Twitch/Discord sont soumis à leurs propres conditions.
- **À FINALISER :** procédure de signalement, modération et contact ; cas particuliers d'utilisation par des mineurs si pertinent.
- **État : brouillon, non publié.**

## Tests obligatoires après retrait des affiliations
1. Menu Univers Ma_JesTik : « À propos du QG », sans l'ancien lien affilié.
2. Bas du site PC et téléphone : « À propos du QG », aucun lien Amazon/Instant Gaming.
3. Ancienne adresse `#/partenaires` redirige fonctionnellement vers le contenu À propos (route de compatibilité conservée).
4. FAQ : le lien À propos fonctionne, pas de promesse de commission.
5. Profil, connexion Twitch, votes, Tribunal, Classements, Killathon et Workers inchangés.
6. Aucun fichier supprimé, aucun coût supplémentaire.

## Pour le futur
Si le propriétaire réintroduit liens d'affiliation, code créateur actif, boutique, rémunération ou récompenses monétaires, réexaminer d'abord : obligations déclaratives et fiscales, identification commerciale, information des internautes, traceurs et règles propres à GitHub Pages.
