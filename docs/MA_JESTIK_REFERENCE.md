# Ma_JesTik — Source de référence du projet

**État au 10 novembre 2026** · Document de continuité pour les conversations du projet ChatGPT « Ma_JesTik — Site Web & GitHub ».

> **Usage :** cette source résume les décisions prises et les travaux restants. Pour connaître l'état exact du code ou des déploiements, relire le dépôt et les exécutions GitHub Actions : ce document n'est pas automatiquement synchronisé avec les déploiements Cloudflare.
>
> **Synchronisation :** ce fichier GitHub est tenu à jour lors des changements majeurs du site. Le fichier « Source » joint au projet ChatGPT reste indépendant : son remplacement est effectué manuellement par l'utilisateur à partir de la version mise à jour.

## 1. Liens et architecture

- **Site public :** https://ma-jestik.fr/ · **QG :** https://ma-jestik.fr/qg/
- **Dépôt :** https://github.com/maroo1103/ma-jestik-site · branche **`main`**.
- **Publication :** GitHub Pages à partir du dossier **`dist/`**, workflow `.github/workflows/publier-roue.yml`.
- **Interface du QG :** `dist/qg/index.html`, `dist/qg/qg.js`, fichiers CSS et modules dans `dist/qg/`.
- **Affiches et aperçus sociaux :** sources dans `dist/og/premium/` ; le workflow génère les images Open Graph (`dist/og/*.png`) et les versions WebP affichées sur les cartes du site.
- **Backend :** Cloudflare Workers indépendants et base D1 **`ma-jestik-qg-members`**. Ne pas confondre les Workers `ma-jestik-qg-members`, `ma-jestik-qg-tribunal`, `ma-jestik-qg-killathon` et le formulaire de contact.
- **Contact public :** `contact@ma-jestik.fr`, hébergé chez OVH ; formulaire utilisant un Worker Cloudflare, Resend et Turnstile.

## 2. Identité graphique et choix validés

- Style global **sobre, premium, graphite/noir et or champagne** : typographie forte, liserés dorés discrets et contrastes maîtrisés.
- **Conserver les sections validées** ; ne jamais repartir de zéro ni modifier une autre rubrique sans demande explicite.
- **Aucune petite flèche décorative** après les liens et boutons ; conserver uniquement les flèches nécessaires à la navigation réelle.
- **Pied de page :** quatre vrais logos SVG monochromes Twitch, Instagram, TikTok et Discord, sans cadres ni fonds colorés, placés **sous la présentation Ma_JesTik**. Anciennes icônes de l'en-tête et colonne de liens sociaux redondante supprimées. Conserver le bouton de connexion Twitch.
- **Page « À propos du QG » :** présentation personnelle, histoire du QG, valeurs et avenir. Version approuvée, à préserver.
- **Affiches d'accueil :** Le Tribunal, Défis & Missions, Killathon et Classements sont validés. L'affiche **« La Roue »**, assortie à cette collection, a également été **validée, ajoutée dans `dist/og/premium/roue.png` et publiée**. Ne pas la refaire sans demande.
- **La Roue :** outil générique, pas limité à Fortnite ; éviter un intitulé ou une description qui l'enfermerait dans un seul jeu.

## 3. Fonctions en place

- **La Roue** interactive, **118 défis Zero Build**, **Killathon**, **Tribunal** (propositions, sondages, votes), **classements**, profils Twitch et pages communautaires.
- **Profils publics et privés :** dans le classement, **seul le pseudo du joueur est cliquable** (pas toute la carte, l'avatar ou la médaille). Le clic ouvre une petite fenêtre modale graphite/or, avec fermeture par croix, Échap ou clic extérieur.
- **Profil public :** avatar, pseudo, éventuel badge, présentation, réseaux et jeux favoris ; **profil privé :** message « Profil indisponible » sans afficher d'information confidentielle. La confidentialité est aussi contrôlée côté serveur. Ce rendu a été testé visuellement avec des captures et **validé**.
- **Formulaire de contact :** fonctionnement de bout en bout vérifié.
- **Politique de confidentialité :** page publiée, mais elle peut nécessiter des ajustements lorsque les traitements et procédures évoluent.

## 4. Dernier travail confirmé sur GitHub

- **10/11/2026 — Refonte visuelle de « EN CE MOMENT AU QG ».** Après validation d'un visuel avec **trois cartes larges et des étiquettes occupant toute leur largeur**, l'ancien petit bandeau directement intégré au héros a été remplacé par une section autonome située juste sous la couverture. Titre « LES INFOS UTILES EN UN COUP D’ŒIL. », phrase explicative, trois cartes Twitch/Tribunal/Défis, rubans pleine largeur, statuts lisibles et liens d'action « Voir la chaîne », « Ouvrir le Tribunal », « Voir les défis ». Les couleurs d'accent sont **violet et bleu volontairement atténués** ; le graphite, le noir et l'or champagne restent dominants. Responsive 3 colonnes ordinateur, 2 tablette, 1 mobile. **Aucun chiffre ni résultat inventé :** `dist/qg/activity-strip.js` conserve les appels publics existants et met à jour statut, grand titre et description selon la réponse de l'API ; en cas d'erreur, mention « Statut indisponible ». Fichiers modifiés `dist/qg/qg.js`, `dist/qg/home-premium.css`, `dist/qg/activity-strip.js`, `dist/qg/index.html`, `backend/cloudflare/tests/home-gold-artwork.test.mjs`. Commits repères : `71455802c899b0b778cea0070fdada849a9de71d` (structure), `a6cc7793d00a41310bb66c880bfa777ac275756d` (style), `0afae12aa28d6b16a993515ee379fb0d7f20b63e` (états), `bc0af81c392d088d601a446ff145d91af6cce5df` (cache), `c5c189597cc5d943e5d77ffe227d837f19e2fbc6` (tests). CI `42869994361` : **SUCCESS**. Publication GitHub Pages `42869940366` : à vérifier avant d'affirmer publiée. **Rendu final PC/mobile à valider par capture utilisateur.** Aucun Worker/D1 modifié.

- **10/11/2026 — Citation de l'accueil raccourcie (rythme de lecture).** Après audit des captures, l'utilisateur a validé une réduction de la hauteur de la section « Les victoires passent. Les valeurs restent. ». Retouche ciblée des marges internes de `.hq-intro` : padding haut/bas desktop `clamp(54px,5vw,80px)`, tablette `54px/60px` et mobile `46px/54px` (très petit écran `40px/48px`). **Texte, titre, taille de typographie et couleurs conservés**, aucun changement des cinq affiches, du setup ou de la navigation. Fichiers : `dist/qg/home-premium.css`, cache CSS `dist/qg/index.html`, test de régression dans `backend/cloudflare/tests/home-gold-artwork.test.mjs`. Commit `b66b571fc635075b06aa901f720ef5b4eff0d0bf`. Tests automatisés `42862960936` : SUCCESS ; GitHub Pages `42862961022` : publication en cours au dernier contrôle. **Contrôle visuel final sur PC/mobile souhaitable.**

- **10/11/2026 — Composition du setup renforcée après validation de la tour entière.** Retour utilisateur : trop de vide noir entre le titre à gauche et la tour à droite. La taille du titre « DÉCOUVRE MON SETUP GAMING » reprend l'échelle du grand titre de bienvenue sur ordinateur (`font-size: clamp(67px,6.15vw,116px)`, avec adaptation pour 851–1170 px). Le fond panoramique est légèrement rapproché vers la gauche (`--setup-image-shift:clamp(35px,3.6vw,74px)`), avec un fondu discret à droite pour éviter une cassure ; le mobile (≤ 850 px) conserve la composition actuelle. Aucune nouvelle image ni aucun changement des cinq affiches, du texte ou des fonctions. Fichiers : `dist/qg/home-premium.css`, `dist/qg/index.html`, test `backend/cloudflare/tests/home-gold-artwork.test.mjs`. Commits `ba531708cd0eff6bbb1a7ca15709a7e88036a2ff`, `e4572f36d0b3a86011e348c7385c3a2a83ee0f9f`, `b8e5d70dec761206f8fc74ca556ba442ca9d4a71`. CI `42860939549` : SUCCESS ; déploiement Pages `42860939627` : encore à confirmer. **Contrôle visuel par capture à demander.**

- **10/11/2026 — Cadrage du fond PC corrigé après retour utilisateur.** Sur capture réelle, le haut et les pieds de la tour étaient coupés : la couche image était affichée en `background-size: cover`. Nouveau CSS ciblé `.hq-setup-showcase.hq-setup-banner` : `background-size: cover, auto 100%` et `background-position: center, right center`, conservant l'image **entière en hauteur** sur desktop, placée à droite. Les réglages responsive (tour en bas sous le texte) sont conservés. Un cache-buster de feuille CSS `20261110-setup-banner-fit2` a été appliqué dans `dist/qg/index.html`. Test de régression mis à jour dans `backend/cloudflare/tests/home-gold-artwork.test.mjs`. **Commit `1659280971d5c7edef70988d34effe583e1e9d59`. CI `42856911384` : SUCCESS. Publication GitHub Pages lancée : exécution `42856911406` (à vérifier avant de considérer le rendu publié).** Une capture finale sur PC et mobile est demandée pour validation esthétique.

- **10/11/2026 — NOUVEAU : fond panoramique du setup validé par l'utilisateur et publié.** Visuel 2048 × 768 (tour PC seule, noir et or, grand espace sombre à gauche), optimisé en WebP à 86 Ko : `dist/qg/media/setup-banner-pc-gold.webp`. Il remplace l'image encadrée **uniquement en affichage** dans la section « Découvre mon setup gaming » (`dist/qg/qg.js`, `dist/qg/home-premium.css`). La tour est intégrée comme fond pleine largeur, texte et CTA conservés à gauche ; adaptation prévue sur mobile avec tour sous le texte. L'ancien `setup-tour-gold.webp` reste dans le dépôt comme archive, non utilisé sur l'accueil. **Commit `c0f70ac66966c497e992a55d01b7aa42a5bf5e95`, publication GitHub Pages `42854999474` : SUCCESS.** Tests du setup réactualisés dans `backend/cloudflare/tests/home-gold-artwork.test.mjs`, dernier correctif `4a2794dd5e89e91beeb5ee0ac95a64ca617a8a88`, vérifications automatisées `42855319891` : SUCCESS. **Le contrôle esthétique final PC/mobile par l'utilisateur reste à effectuer.** Aucun Worker Cloudflare ni donnée D1 modifié.

- **Modification la plus récente (10/11/2026) :** allègement des cinq cartes d'accueil du QG. Les grands titres répétés sous les affiches ont été masqués visuellement mais restent accessibles aux lecteurs d'écran ; les cinq descriptions ont été simplifiées et les liens d'action agrandis. La marge noire inférieure de l'affiche « La Roue » a été compensée **dans la carte uniquement** par une règle CSS ciblée (`height:108%; object-fit:fill; object-position:center top`), sans modifier les cinq fichiers graphiques sources ni leurs aperçus Open Graph. **Contrôle visuel PC/mobile encore à effectuer** pour confirmer que cette compensation est satisfaisante.
- **Fichiers édités :** `dist/qg/qg.js` et `dist/qg/home-premium.css`.
- **Commits repères :** `38e6106c76033f6dbec4caec129990355e9d4a82` (cartes) et `1e702b4f84f589a34d2b9eeacd59772ea5337bbd` (CSS).
- **Déploiement GitHub Pages confirmé réussi :** exécution `42849284701` (génération Open Graph, préparation du site et publication réussies).
- **Modification précédente :** intégration de l'affiche finale « La Roue » dans `dist/og/premium/roue.png`, commit `d5119ec72e4ca3735f5169a307a5e5783b95b572`, exécution réussie `42839633393`.
- **Important :** la réussite technique ne remplace pas un contrôle visuel.
- Le **fond actif** du setup est `dist/qg/media/setup-banner-pc-gold.webp` (chargé depuis `home-premium.css`). L'ancien visuel `dist/qg/media/setup-tour-gold.webp` est conservé dans GitHub mais n'est plus affiché sur l'accueil.

## 5. Priorité actuelle : validation du nouveau fond PC

**La nouvelle image a été approuvée et intégrée le 10/11/2026.** L'ancienne bande d'image rectangulaire a disparu : l'image 8:3 devient le fond continu de la section « Découvre mon setup gaming ». La mise en page préserve le texte et le bouton à gauche sur ordinateur ; en format étroit, la tour descend sous le texte.

**Retour utilisateur du 10/11 :** premier cadrage trop zoomé (tour coupée en haut et en bas). CSS corrigé pour adapter le visuel à la hauteur de section avec alignement à droite, sans changer le fichier image. **Point restant :** vérifier la fin de publication GitHub Pages, puis demander une nouvelle capture PC et un contrôle mobile. L'absence d'erreur dans GitHub Actions ne suffit pas à valider le rendu visuel. Ne pas modifier les cinq affiches validées, la navigation ou les fonctionnalités non demandées.

**Nouvel ajustement demandé :** titre setup à l'échelle du titre de bienvenue et image rapprochée légèrement du texte sur écran PC, sans recentrer la tour ni changer la version mobile. Modifications enregistrées et tests de régression réussis ; validation finale à effectuer sur capture du site après publication.

**Ensuite :** revenir aux droits RGPD du Tribunal sans profil, à la vérification des Workers/CRON en mode `DRY_RUN` et aux mentions légales, selon les priorités validées.

## 6. RGPD, données et mentions légales

- Les données des membres et les données communautaires sont stockées dans **Cloudflare D1**. Un **export SQL de sauvegarde privée** a été réalisé sur le PC de l'éditeur : ne jamais l'ajouter à un dépôt public.
- Suppression volontaire de compte développée ; protections et règles de conservation préparées. **Aucune purge réelle ne doit être activée sans vérification et accord explicite.** Les réglages `DRY_RUN` doivent être vérifiés sur Cloudflare avant toute action.
- Durées décidées : compte après **6 mois d'inactivité authentifiée** ; proposition Tribunal en attente **3 mois** ; rejetée **30 jours** après décision ; acceptée **6 mois** après décision ; sondage terminé et ses votes **12 mois** après fermeture ou expiration ; échanges de contact **6 mois** après le dernier échange, sous réserve d'obligations particulières.
- L'option de sondage **« Sans limite »** a été supprimée. Les sondages historiques sans limite, s'il en reste, doivent être traités prudemment.
- **Participation au Tribunal sans profil QG :** endpoints d'accès/effacement Twitch `GET` et `DELETE /v1/tribunal/me/data` développés et testés dans `backend/cloudflare/tribunal-worker.js`. **La documentation GitHub signale que cette version n'était pas encore déployée : vérifier son statut réel avant de la considérer opérationnelle.**
- **Mentions légales :** encore à finaliser, notamment sur l'identification de l'éditeur non professionnel qui souhaite préserver ses coordonnées privées. **Ne pas publier de nom personnel, d'adresse privée ou de téléphone sans clarification.**
- **Ticket GitHub support :** **#4982347**, créé le 10 novembre 2026, sur la communication confidentielle des informations de l'éditeur d'un site GitHub Pages au regard de la LCEN française. Attendre la réponse officielle ; elle ne constitue pas à elle seule un avis juridique.
- Les services tiers et éventuels traceurs doivent rester documentés et vérifiés. Ne pas exposer de jetons OAuth, clés API, secrets Cloudflare ou données des utilisateurs.

## 7. Manière de travailler pour les prochaines conversations

1. **Examiner les fichiers existants avec le connecteur GitHub** avant toute modification ; préserver structure, design et fonctionnalités hors périmètre.
2. Pour une proposition visuelle, **montrer le résultat avant de le mettre en ligne**, sauf demande explicite d'intégration directe.
3. Une fois approuvé, **modifier directement le dépôt**, vérifier les tests GitHub Actions et contrôler que le déploiement Pages a réellement réussi. En cas d'échec, consulter les journaux et corriger le problème, sans prétendre que le site est publié.
4. **Ne pas déployer ou éditer le mauvais Worker Cloudflare**. GitHub Pages ne déploie pas automatiquement ces Workers ; expliquer uniquement l'étape manuelle indispensable.
5. **Ne jamais effacer des données réelles** ni désactiver un `DRY_RUN` pour faire un simple test.
6. Réponses **directes, conviviales et exigeantes** ; une étape à la fois si des captures Cloudflare sont nécessaires. Éviter les longues procédures inutiles.
7. **Mettre à jour `docs/MA_JESTIK_REFERENCE.md` sur GitHub** après chaque évolution majeure du site ; préparer aussi une version téléchargeable de la source pour remplacement manuel dans le projet ChatGPT. Ce document est un suivi, pas une source de vérité temps réel.

## 8. Prochaines étapes après la section activités

- Finaliser le déploiement et l'interface d'effacement des participations Tribunal sans profil, en vérifiant les règles RGPD et la sécurité.
- Vérifier les paramètres effectifs des purges automatiques en simulation et les services externes.
- Terminer les mentions légales en fonction des informations juridiques fiables et de la réponse de GitHub.
- Poursuivre les fonctionnalités gaming et la finition du QG à la demande, **sans retoucher ce qui est déjà approuvé**.