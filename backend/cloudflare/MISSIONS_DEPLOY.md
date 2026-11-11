# Ma_JesTik — publication du Worker des missions mensuelles

**État au 11/11/2026 :** le code et l'interface QG sont versionnés et les tests de simulation passent. La migration additive `0008_monthly_missions.sql` a déjà été appliquée à la D1 `ma-jestik-qg-members` : les tables `monthly_missions` et `monthly_awards` existent et sont **vides**. Aucune récompense n'a été distribuée.

## Protection anti-spam du suivi mensuel

La future API possède désormais **deux barrières côté Worker** :

- Un coupe-circuit avant Twitch et D1, limité à environ **30 requêtes par minute par adresse IP**, avec code **HTTP 429** et en-tête `Retry-After: 60`. La limite de secours est tenue en mémoire volatile par instance Cloudflare, pas globalement ; aucune adresse IP n'est stockée en D1 ni inscrite dans les logs applicatifs.
- Un cache interne de résultats déjà vérifiés : **5 minutes par membre Twitch connecté** (`/v1/monthly/me`), **1 minute pour la mission publique** et **1 minute pour le tableau propriétaire**. Le token Twitch est revalidé **avant** toute restitution privée et n'est jamais inclus dans la clé du cache. Le cache Cloudflare est local au centre de données, avec un cache mémoire de repli ; il ne garantit pas un plafond mondial. Les mises à jour administrateur invalident les entrées concernées. Les réponses envoyées au navigateur conservent `Cache-Control: no-store`.

**Option facultative pour renforcer la protection sans abonnement :** si Cloudflare permet gratuitement l'ajout d'un binding natif de limitation, le nommer `MISSION_RATE_LIMITER`, avec un namespace numérique dédié (p. ex. `112026`) et une limite de **30 appels / 60 secondes**. Le code fonctionne également sans ce binding grâce au coupe-circuit local. La limite native est elle-même approximative et propre à chaque centre de données. **Ne souscrire aucune option payante** pour ce projet ; vérifier les modalités du compte avant toute activation supplémentaire.

**Limite technique :** chaque F5 qui arrive au Worker reste une invocation Cloudflare, même si elle est refusée avec 429 ou servie depuis le cache. Cette protection économise les lectures D1 et bloque les vérifications Twitch uniquement au-delà du seuil anti-rafale. Les accès privés qui ne dépassent pas le seuil continuent à être validés auprès de Twitch à chaque requête, même si les résultats D1 sont en cache. Elle amortit les rafales, mais ne peut pas garantir « zéro requête » ni bloquer une attaque distribuée. Le site rafraîchit déjà sa progression automatiquement **une fois par heure**, sans bouton manuel.

## Ce qui manque pour rendre les compteurs actifs

Le nouveau Worker `ma-jestik-qg-missions` **n'est pas encore publié**. La tentative d'envoi via le connecteur Cloudflare a été bloquée par les contrôles de sécurité de l'outil. Les autres Workers (profils, Tribunal, Killathon, contact, annonces) ont été laissés intacts.

Le code exact à publier est `backend/cloudflare/monthly-missions-worker.js`.

### Publication manuelle dans Cloudflare Dashboard

1. Ouvrir Cloudflare > Workers & Pages > Create > Worker. Donner le nom **`ma-jestik-qg-missions`**, puis créer le Worker.
2. Cliquer sur **Edit code**, remplacer le code de départ par l'intégralité de `backend/cloudflare/monthly-missions-worker.js` depuis GitHub, puis **Deploy**.
3. Settings > Bindings > Add > D1 database : variable **`DB`**, base existante **`ma-jestik-qg-members`**. Ne pas créer une seconde base.
4. Settings > Variables and Secrets : ajouter deux variables **Plain text** (identifiants publics du QG, pas de secrets Twitch) :
   - `TWITCH_CLIENT_ID` : `p5tdg5jfacomtqxmu6tzsubxpjxa3i`
   - `OWNER_TWITCH_ID` : `213078400`
5. Vérifier que le sous-domaine Workers.dev est activé pour ce Worker et que l'URL est `https://ma-jestik-qg-missions.maroodu11.workers.dev`.
6. Effectuer un test **lecture seule** dans le navigateur : `https://ma-jestik-qg-missions.maroodu11.workers.dev/v1/monthly/health` doit retourner `{"status":"ok","ready":true}`. L'URL `/v1/monthly/current` doit renvoyer `mission:null` avant l'ouverture d'un programme.
7. Dans `https://ma-jestik.fr/qg/#/recompenses-mensuelles`, se connecter avec Twitch (identité propriétaire), vérifier que « ESPACE PROPRIÉTAIRE » s'affiche. Vérifier que le compte d'un visiteur ordinaire **ne peut pas** l'ouvrir. Vérifier sur mobile également.

### Lancement sans rétroactivité

- Préparer comme **brouillon** la première mission du prochain mois complet, avec par exemple **3 pronostics officiels résolus + 2 votes de sondages du Tribunal**. Récompense de 50 pièces, ouverte à tous les membres éligibles.
- Ne cliquer sur « Ouvrir la mission » qu'au début du mois choisi, une fois les règles annoncées à la communauté et assez de sondages et de manches programmés pour que chacun ait une chance raisonnable de compléter la mission.
- La progression est recomputée depuis les votes vérifiés en base D1. Les votes supprimés ne peuvent plus être comptés ; une manche non résolue n'est pas créditée. Les résultats ne peuvent être modifiés depuis le navigateur.
- Après clôture, remettre manuellement les pièces dans Discord, puis cliquer sur « Marquer remis » pour chaque membre concerné. La contrainte SQL sur `(month,twitch_id)` empêche deux écritures pour un même membre et un même mois. Le marquage n'envoie pas les pièces.
- La suppression d'un profil supprime également ses traces de remise grâce à la clé étrangère `ON DELETE CASCADE`. La suppression des votes au Tribunal peut modifier le nombre de participations validées.

### Points à valider avant toute annonce officielle

- **Égalités, exclusion d'activités abusives et vérification Twitch ↔ Discord** avant remise.
- Budget mensuel des récompenses : **885 pièces** pour le Top 10 + **50 pièces par membre** qui termine la mission (nombre de bénéficiaires non plafonné), à mettre en regard du stock de cadeaux réels.
- Le calendrier et les objectifs des missions doivent être réalisables : si deux sondages ne sont pas publiés pendant le mois, l'objectif proposé ne pourra pas être accompli.
- Le classement mensuel Top 10 est encore une **vitrine de barème** et n'est pas encore un classement dynamique calculé côté serveur. Ne pas annoncer de gagnants Top 10 sur la seule base du classement général cumulatif.

**Ne pas réappliquer de migration D1 destructive. Ne pas déployer les autres Workers pour ce chantier.**
