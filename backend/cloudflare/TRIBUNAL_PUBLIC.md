# Tribunal communautaire public — activation séparée et sécurisée

## État au 10 novembre 2026
- Le Tribunal public est déjà en service : le Worker `ma-jestik-qg-tribunal` et les tables `tribunal_*` existent en production (vérifications réalisées avec le propriétaire).
- Le 10 novembre, le **code GitHub** du Worker Tribunal a été modifié pour refuser la durée 0. **Il faut encore le déployer séparément sur Cloudflare.**
- Les formulaires publics GitHub Pages ne proposent plus de durée illimitée ; un ancien sondage créé sans limite reste lisible et clôturable.
- Le Worker membre `ma-jestik-qg-members` héberge désormais un code de conservation Tribunal avec deux drapeaux distincts (`TRIBUNAL_RETENTION_ENABLED`, `TRIBUNAL_RETENTION_DRY_RUN`). **Ce code additionnel n'est pas encore déployé en production et les purges réelles sont interdites.**
- Ne jamais remplacer le Worker Killathon ni confondre le Worker Tribunal avec celui des membres.

## Architecture et droits
- Site : `https://ma-jestik.fr/qg/` (GitHub Pages).
- API indépendante : nouveau Worker `ma-jestik-qg-tribunal`, fichier `backend/cloudflare/tribunal-worker.js`.
- Base D1 EXISTANTE : `ma-jestik-qg-members`; nouvelles tables isolées `tribunal_polls`, `tribunal_proposals`, `tribunal_votes`.
- Compte propriétaire Twitch : identifié uniquement par `OWNER_TWITCH_ID`, et revérifié par les API Twitch à chaque action privée.
- Membres : consultation publique, vote et proposition après authentification Twitch.
- Propriétaire : crée, valide, clôture, supprime. Un vote par compte / sondage via contrainte D1.
- Limite : 3 propositions par compte et par 24 heures, 200 en attente, 20 sondages ouverts.
- Durée des **nouveaux sondages** : 5, 10, 15, 30, 60 minutes ou 24 heures (la durée 0 est refusée dans le nouveau Worker).
- Toutes les durées expirent **sur le serveur** ; un visiteur ne choisit ni sa note ni son identité.

## Référence historique — migration D1 (déjà effectuée, NE PAS REJOUER)
Dans Cloudflare → Stockage et bases de données → D1 → `ma-jestik-qg-members` → Console :
- Exécuter le contenu du fichier `backend/cloudflare/migrations/0004_tribunal_public.sql`.
- Ne modifier aucune table `members`, `vote_*`, `killathon_simple`.
- Vérifier que les trois tables `tribunal_*` existent.
- Ne pas exécuter de `DROP`, et ne pas recommencer les schémas historiques.

Alternative avec Wrangler depuis `backend/cloudflare` :
```bash
npx wrangler d1 execute ma-jestik-qg-members --remote --file=./migrations/0004_tribunal_public.sql
```

## Référence historique — configuration du Worker Tribunal déjà présent
Dans Workers & Pages, créer un Worker indépendant :
- Nom : `ma-jestik-qg-tribunal`.
- Copier **l'intégralité** de `backend/cloudflare/tribunal-worker.js` dans le code du nouveau Worker.
- Ajouter la liaison **D1**, nom de variable **DB**, base existante `ma-jestik-qg-members`.
- Variables d'exécution de production (type « Texte », pas de client secret) :
  - `TWITCH_CLIENT_ID` : même Client ID public que l'application Twitch QG (déjà utilisé par le site).
  - `OWNER_TWITCH_ID` : ID numérique réel du propriétaire du QG, identique à celui configuré sur le site.
  - `ALLOWED_ORIGIN` : `https://ma-jestik.fr` (sans slash final).
- Ne pas modifier les variables des autres Workers.

## Référence historique — vérifications API
1. Ouvrir la route `/v1/health` du **nouveau** Worker depuis un navigateur.
2. Réponse attendue : `{"status":"ok","service":"tribunal","ready":true}`.
3. Ouvrir `/v1/tribunal/polls` : réponse attendue `{"polls":[]}` avant le premier sondage.
4. Vérifier qu'un utilisateur non connecté ne peut ni publier ni voter.
5. Vérifier que le propriétaire peut créer ; qu'un membre connecté peut voter une seule fois ; qu'un autre appareil voit les résultats ; qu'une proposition apparaît dans la file du propriétaire.
6. Après ces tests, activer le composant Tribunal public sur le site ; **ne pas retirer le prototype avant cette validation**.

## Mise à jour à réaliser après la validation GitHub

1. Sur Cloudflare, ouvrir **Workers et Pages → ma-jestik-qg-tribunal → Modifier le code**.
2. Copier l'intégralité du fichier GitHub `backend/cloudflare/tribunal-worker.js` dans **ce Worker Tribunal uniquement**.
3. Vérifier `const DURATIONS=new Set([5,10,15,30,60,1440]);` (plus de durée 0).
4. Déployer, tester `/v1/health`, consulter le Tribunal sur le QG et vérifier qu'un sondage à durée déterminée fonctionne. Aucun sondage réel ne doit être créé pour ce test sans l'accord du propriétaire.
5. Le nettoyage RGPD des historiques est **un changement distinct** à déployer plus tard dans `ma-jestik-qg-members` ; avant activation, conserver `TRIBUNAL_RETENTION_ENABLED` absent ou à `false`, et `TRIBUNAL_RETENTION_DRY_RUN=true` lors de la simulation.
6. Les délais validés sont décrits dans `docs/proposition-durees-conservation-2026-11-10.md`. Les messages reçus chez OVH ne sont pas nettoyés par Cloudflare.

## Sécurité et confidentialité
- Ne jamais publier de jeton OAuth, Client Secret ou clé Cloudflare dans GitHub.
- L'ID Twitch provient de la validation de son jeton auprès de Twitch, jamais du formulaire utilisateur.
- Les ID Twitch des votants ne sont pas retournés par les réponses publiques.
- Une suppression de sondage entraîne la suppression de ses bulletins (`ON DELETE CASCADE`).
- Prévoir les mentions d'information (finalité des données, durée de conservation) avant ouverture au public.
- Pour limiter les abus : conserver une limite de propositions, fournir des messages d'erreur lisibles et permettre au propriétaire de supprimer les sondages.

## API
- `GET /v1/health` ; `GET /v1/tribunal/polls` — publiques
- `GET /v1/tribunal/me` — session Twitch
- `POST /v1/tribunal/proposals` — membre Twitch
- `GET /v1/tribunal/proposals` — propriétaire
- `POST /v1/tribunal/polls` — propriétaire
- `POST /v1/tribunal/polls/{id}/vote` — membre Twitch
- `POST /v1/tribunal/polls/{id}/close` ; `DELETE /v1/tribunal/polls/{id}` — propriétaire
- `POST /v1/tribunal/proposals/{id}/approve` ; `POST /v1/tribunal/proposals/{id}/reject` — propriétaire

### Format des formulaires
- Sondage : `{"question":"...","answers":["Oui","Non"],"duration_minutes":10}`
- Proposition : `{"question":"...","answers":["Oui","Non"]}`
- Vote : `{"choice_index":0}` (index de 0 à 3)
- Validation d'une proposition : même format qu'un sondage, avec éventuelles corrections du texte / des réponses avant publication.
