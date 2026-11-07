# Killathon simple — activation Cloudflare (une seule fois)

## État
- Interface QG et widget OBS : publiés sur GitHub Pages.
- Backend du Killathon : code prêt, mais **non déployé automatiquement sur Cloudflare**.
- Aucun changement à effectuer sur le Worker de votes ma-jestik-qg-members.
- La base D1 ma-jestik-qg-members reste la même : migration additive, qui ne touche pas aux votes, profils ni points.

## 1. Ajouter la table D1
Dans Cloudflare → Stockage et bases de données → D1 → ma-jestik-qg-members → Console, exécuter séparément les deux commandes. Ne pas copier les commentaires SQL avant.

~~~sql
CREATE TABLE IF NOT EXISTS killathon_simple (
 twitch_id TEXT PRIMARY KEY NOT NULL REFERENCES members(twitch_id) ON DELETE CASCADE,
 public_id TEXT NOT NULL UNIQUE,
 game TEXT NOT NULL DEFAULT 'Fortnite Zero Build',
 kills INTEGER NOT NULL DEFAULT 0 CHECK (kills BETWEEN 0 AND 999999),
 goal INTEGER NOT NULL DEFAULT 30 CHECK (goal BETWEEN 1 AND 9999),
 active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0,1)),
 created_at INTEGER NOT NULL DEFAULT (unixepoch()),
 updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
~~~

~~~sql
CREATE UNIQUE INDEX IF NOT EXISTS killathon_simple_public ON killathon_simple(public_id);
~~~

Le fichier des migrations est migrations/0003_killathon_simple.sql.
Option Wrangler : npx wrangler d1 execute ma-jestik-qg-members --remote --file=./migrations/0003_killathon_simple.sql

Ne pas supprimer les tables existantes. Ne pas relancer schema.sql pour cette activation.

## 2. Créer un Worker indépendant
1. Cloudflare → Workers & Pages → Créer → Worker (Hello World).
2. Nom du Worker : **ma-jestik-qg-killathon**. Cloudflare Access doit rester désactivé : le widget OBS doit lire l'état public.
3. Modifier le code de **ce nouveau Worker seulement**, en y collant la totalité du fichier [killathon-simple-worker.js](./killathon-simple-worker.js), puis publier.
4. Paramètres → Liaisons → Ajouter une liaison → Base D1, variable **DB**, base **ma-jestik-qg-members**.
5. Variables de production :
   - TWITCH_CLIENT_ID : le Client ID public de l'application Twitch QG existante.
   - ALLOWED_ORIGIN : https://maroo1103.github.io
   Aucun Client Secret ni jeton utilisateur.
6. Vérifier l'URL effective, attendue si le nom et le sous-domaine sont conservés : https://ma-jestik-qg-killathon.maroodu11.workers.dev.
   Si l'adresse change, actualiser la méta majestik-killathon-api dans dist/qg/index.html et dist/qg/killathon-overlay.html.

### Vérification
Ouvrir dans le navigateur :
https://ma-jestik-qg-killathon.maroodu11.workers.dev/v1/health

Réponse attendue : {"status":"ok","service":"killathon-simple"}.

Tant que le Worker n'est pas actif, le QG indique que la connexion ou l'activation manque : il ne prétend pas enregistrer un compteur.

## 3. Tester avec deux comptes Twitch
1. Dans le QG, ouvrir Outils gaming → Killathon et se connecter au premier compte Twitch.
2. Choisir le jeu et un objectif, créer le Killathon puis cliquer sur +1.
3. Mettre en pause et copier le lien OBS.
4. Se déconnecter du QG, connecter un deuxième compte Twitch : il doit pouvoir créer son propre Killathon sans voir ni modifier celui du premier.
5. Revenir au premier compte : son objectif et son compteur sont retrouvés.
6. Créer une source Navigateur dans OBS avec l'URL personnelle (largeur 960, hauteur 220). L'affichage se met à jour environ toutes les 9 secondes.

## Confidentialité / limites
- La mise à jour exige un jeton Twitch vérifié côté Worker. Chaque compte modifie uniquement son compteur, identifié par son ID Twitch.
- Le lien OBS est en lecture seule et contient un identifiant UUID difficile à deviner. Ne pas partager l'URL si le compteur doit rester privé.
- Le widget affiche le pseudo Twitch, le nom du jeu, l'objectif et les éliminations.
- Le comptage est manuel : aucune détection automatique des kills ou des abonnements Twitch n'est promise.
- Supprimer le profil QG entraîne normalement la suppression des données Killathon liées grâce à ON DELETE CASCADE.
- Lors du passage à un domaine .fr, modifier ALLOWED_ORIGIN et les URLs si nécessaire. Il n'est pas nécessaire de recréer la base.
- Le Worker de votes / classement reste indépendant et ne doit pas être remplacé par celui du Killathon.
