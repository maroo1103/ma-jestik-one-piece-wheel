# Ma_JesTik — Politique de confidentialité
**Brouillon de travail — ne pas publier sur le site avant validation**  
Établi le 9 novembre 2026 à partir d'un audit du code public de la branche `main` du dépôt `maroo1103/ma-jestik-site`.

Ce texte est un projet destiné à être relu et adapté aux traitements réels en production. Les mentions `[À COMPLÉTER]` ou `[À VÉRIFIER]` ne doivent pas être laissées dans une version juridique présentée comme finalisée. Le dépôt GitHub est public : ne jamais y écrire d'adresse postale privée, de donnée d'identité confidentielle ni de secret technique.

---

# POLITIQUE DE CONFIDENTIALITÉ — TEXTE PROPOSÉ

**Dernière mise à jour : [DATE DE PUBLICATION]**

## 1. À qui s'adresse cette politique ?

La présente politique explique comment les données personnelles sont utilisées sur **Ma_JesTik**, site personnel de gaming et d'activités communautaires accessible à l'adresse https://ma-jestik.fr/.

Elle s'applique notamment aux fonctionnalités de connexion au QG, de profil, de défis, de Killathon, de votes, de propositions au Tribunal et de contact.

## 2. Responsable du traitement et contact

Le responsable des traitements liés au QG est l'éditeur du site Ma_JesTik, exploité à titre personnel. Pour toute question ou demande relative à vos données : **contact@ma-jestik.fr** ; rubrique **Nous contacter** sur https://ma-jestik.fr/qg/#/contact.

**[À VALIDER JURIDIQUEMENT]** Les modalités permettant de préserver l'identité civile de l'éditeur tout en fournissant aux utilisateurs l'information prévue par le RGPD doivent être clarifiées. La démarche auprès du support GitHub concernant les mentions légales n'épuise pas à elle seule les obligations d'identification du responsable du traitement.

## 3. Données utilisées

### Navigation et fonctionnement technique
Les prestataires assurant la publication et la sécurité du site peuvent traiter des informations techniques nécessaires au fonctionnement du service, telles que les requêtes web, les adresses IP ou des informations de connexion. Les journaux et durées de conservation des prestataires sont **[À VÉRIFIER]**.

### Connexion au QG avec Twitch
Lorsqu'un visiteur choisit de se connecter avec Twitch, le site peut utiliser son identifiant Twitch, son identifiant de connexion, son pseudonyme, son avatar et un jeton d'accès nécessaire à la validation de sa session. Les informations d'identité sont vérifiées auprès de Twitch via un service Cloudflare Worker.

Le jeton de session Twitch est conservé dans le `sessionStorage` du navigateur (session d'onglet). Un état de sécurité temporaire lié à la connexion OAuth est conservé dans le `sessionStorage` et, selon le parcours, dans le `localStorage`, puis supprimé à l'issue du retour OAuth. La durée prévue par le code pour cet état temporaire est de 20 minutes.

### Profil communautaire
Lorsqu'un membre crée ou personnalise un profil, le QG peut enregistrer son pseudonyme public personnalisé, une biographie, des préférences visuelles, des jeux favoris, un jeu principal et, s'il le choisit, des identifiants de réseaux sociaux (Instagram, TikTok et Discord). Le membre choisit séparément s'il souhaite publier son profil et apparaître dans le classement.

Les brouillons de personnalisation de profil peuvent être enregistrés localement sur l'appareil du membre, dans le `localStorage`.

### Défis, pronostics et classements
Pour faire fonctionner les défis et les pronostics, le service peut conserver des identifiants de membres, des votes, des dates, des résultats et des points virtuels. Les scores et informations du classement ne sont publiés que dans les conditions prévues par les réglages du membre et la fonctionnalité concernée. Certaines données de défis sans compte sont également conservées localement dans le navigateur.

### Killathon
Le compteur Killathon peut enregistrer l'identifiant du membre, un identifiant public de partage, le jeu sélectionné, un objectif, un nombre d'éliminations et un état actif/inactif. Un lien de lecture du compteur peut être partagé dans OBS.

### Tribunal communautaire
Les propositions et sondages peuvent enregistrer le texte des questions, les réponses possibles, les dates et, selon la fonctionnalité, le pseudonyme ou l'identifiant Twitch des auteurs et votants. La présentation des résultats publics ne doit pas être confondue avec l'ensemble des données conservées dans la base.

### Formulaire de contact
**À ce jour**, le formulaire guide le visiteur pour préparer sa demande, mais ne transmet pas les champs, les messages ni les pièces jointes à un serveur de contact. Les informations saisies restent dans l'interface de l'onglet tant que la page est ouverte ; les fichiers éventuellement sélectionnés ne sont pas téléversés.

**[CHANGEMENT FUTUR NON ENCORE EN PRODUCTION]** Dès qu'un système sécurisé d'envoi via Cloudflare et Resend sera activé, cette section devra être mise à jour **avant** la mise en service pour décrire les informations effectivement transmises, les éventuelles pièces jointes, leurs destinataires et leurs durées de conservation.

## 4. Pourquoi ces données sont-elles utilisées ?

Les finalités visées sont : authentifier les membres qui choisissent de se connecter ; enregistrer et personnaliser leur profil ; faire fonctionner leurs votes, propositions, points et Killathon ; permettre l'affichage public qu'ils ont choisi d'activer ; assurer le fonctionnement technique et la sécurité du service ; répondre à leurs demandes lorsqu'un système de contact sera opérationnel.

**[À ARBITRER AVANT PUBLICATION]** Associer à chaque finalité une base légale appropriée (par exemple exécution d'un service expressément demandé, intérêt légitime pour certaines mesures de sécurité, ou consentement lorsque requis). Il ne faut pas déduire automatiquement une base légale unique du seul fait que la connexion Twitch est facultative.

## 5. Qui peut accéder aux données ?

Selon les fonctions utilisées :
- l'éditeur du QG, pour l'administration nécessaire du site et de ses outils ;
- **Twitch**, lors de l'authentification et de la vérification d'identité ;
- **Cloudflare** (Workers / base D1), pour les fonctions communautaires et la base de données ;
- **GitHub Pages**, pour l'hébergement des pages et ressources statiques ;
- les autres visiteurs, uniquement pour les informations effectivement rendues publiques par le service (ex. profil public, classement et résultats publiés) ;
- **[FUTUR] Resend**, lorsque l'envoi de formulaires sera activé ;
- les plateformes sociales ou services externes que le membre décide de consulter.

Le rôle précis de chaque prestataire, la localisation effective des traitements et les garanties contractuelles correspondantes restent **[À VÉRIFIER]**.

## 6. Combien de temps sont conservées les données ?

Les éléments de connexion temporaires et les informations stockées dans le navigateur dépendent de leur type et des actions du visiteur (fin de session, effacement local, modification des réglages). Les données communautaires de la base D1 sont conservées selon le fonctionnement actuel du service ; **aucune politique d'effacement automatique périodique globale n'a été confirmée dans le code examiné**.

**[À DÉFINIR ET METTRE EN ŒUVRE AVANT PUBLICATION]**
- **Règle décidée le 9 novembre 2026 :** les comptes QG doivent être supprimés après **six mois consécutifs sans activité authentifiée**, avec leurs profils et points associés. **Cette suppression automatique n'est pas encore implémentée** : la migration et le suivi de dernière activité sont préparés dans le dépôt GitHub, mais ne sont pas activés dans la base Cloudflare en production. Aucune durée effective ne doit être promise aux visiteurs avant la vérification du suivi, la programmation de la purge et ses tests. Pour les comptes déjà créés, prévoir un démarrage non rétroactif de la période afin d'éviter toute suppression injustifiée ;
- des durées spécifiques pour les votes, propositions, résultats et historiques ;
- les durées applicables aux journaux techniques et sauvegardes, si disponibles ;
- les règles de conservation et d'effacement du formulaire de contact une fois activé ;
- les cas où une conservation limitée est nécessaire au traitement d'une contestation ou au respect d'une obligation légale.

Ne pas afficher une durée arbitraire ou une promesse d'effacement automatique tant qu'elle n'est pas effectivement appliquée.

## 7. Visibilité et suppression des informations

Un membre peut modifier ses informations de profil et ses réglages de visibilité depuis le QG. La fonctionnalité de suppression du profil appelle une demande d'effacement du compte membre dans Cloudflare D1. Certains enregistrements de la base, liés par des contraintes de suppression en cascade, sont alors supprimés automatiquement.

**Limite connue :** les schémas actuels des tables du Tribunal contiennent des identifiants Twitch sans tous les liens de suppression en cascade vers la table des membres. Il ne faut donc pas promettre que la suppression du profil efface automatiquement l'intégralité des anciennes propositions, sondages, votes, journaux, archives ou sauvegardes. Pour une demande plus étendue ou en cas de doute : **contact@ma-jestik.fr**.

## 8. Vos droits

Sous réserve des conditions légales applicables, les utilisateurs peuvent demander l'accès à leurs données, leur rectification, leur effacement, la limitation du traitement, s'y opposer, obtenir la portabilité lorsque ce droit s'applique et retirer un consentement lorsqu'il fonde le traitement.

Les demandes peuvent être adressées à **contact@ma-jestik.fr**. Une vérification d'identité proportionnée peut être nécessaire afin d'éviter la communication de données à un tiers non autorisé. Les utilisateurs peuvent également introduire une réclamation auprès de la **CNIL** : https://www.cnil.fr/.

## 9. Cookies, stockage local et services tiers

Les technologies de stockage observées dans le code comprennent :
- `sessionStorage` pour la connexion Twitch de l'onglet ;
- `localStorage` pour l'état OAuth temporaire, des brouillons de profil et certaines préférences ou données locales d'outils gaming.

Ces opérations de stockage doivent être décrites en toute transparence, même si certains éléments sont strictement nécessaires au service demandé et peuvent bénéficier d'une exemption de consentement préalable.

**[À AUDITER AVANT PUBLICATION]** Vérifier le site en conditions réelles, notamment les ressources tierces, polices, vidéos, outils d'analyse et traceurs susceptibles d'exiger un consentement. Aucune conclusion définitive sur l'absence de cookies publicitaires n'est donnée par le présent audit de code.

## 10. Transferts hors de l'Union européenne

Certains prestataires du site sont établis aux États-Unis ou disposent de services internationaux. **[À VÉRIFIER]** Les lieux effectifs de traitement et les garanties appropriées pour les éventuels transferts hors de l'Espace économique européen doivent être vérifiés auprès des prestataires, conformément au chapitre V du RGPD.

## 11. Mise à jour de cette politique

La politique pourra être mise à jour lors de l'ajout de nouvelles fonctionnalités ou de modifications des traitements. La date de la dernière version publiée sera indiquée en haut de page.

---

# AUDIT TECHNIQUE PRÉALABLE — NOTES INTERNES SANS DONNÉES PERSONNELLES

| Sujet | Observé dans le code | À finaliser |
|---|---|---|
| OAuth Twitch | `dist/qg/twitch-auth.js` stocke le jeton en `sessionStorage` ; état OAuth temporaire en `sessionStorage` et `localStorage` | Examiner les informations données lors de la première connexion |
| Identité de compte et visibilité | `backend/cloudflare/schema.sql`, `backend/cloudflare/src/worker.js` | Bases légales et délais |
| Profil public et réseaux sociaux | `migrations/0005_member_profiles.sql`, `dist/qg/profil.js` | Durées / données publiques après changement de visibilité |
| Votes des défis | `migrations/0002_defi_votes.sql` | Conservation des historiques et points |
| Killathon | `migrations/0003_killathon_simple.sql` | Durée de conservation |
| Tribunal | `migrations/0004_tribunal_public.sql` | Vérifier l'effacement complet après suppression d'un membre |
| Formulaire de contact | `dist/qg/contact.js` | Actuellement aucune transmission serveur ; révision obligatoire avant activation Cloudflare/Resend |
| Services | GitHub Pages + Cloudflare Workers / D1 + Twitch | Informations contractuelles et transferts internationaux |
| Traceurs | stockage local constaté | Test navigateur réel, scripts externes, cookies et statistiques éventuels |
| Responsable du traitement | Éditeur Ma_JesTik, contact professionnel | Obligations d'identification, mentions légales en attente de réponse GitHub |
| Conditions d'affichage | profils publics et classement opt-in | Vérifier l'effectivité des contrôles et la suppression des données déjà indexées |

## Travaux recommandés avant publication

1. **Fixer et implémenter** des durées de conservation pour chaque type de données ; ne pas inventer de délais.
2. **Auditer les tables Tribunal** et la suppression des données par identifiant Twitch ; assurer la cohérence suppression / archivage.
3. **Valider les bases légales** pour chacun des traitements et la manière de porter ces informations à la connaissance des utilisateurs avant de collecter leurs données.
4. **Vérifier les cookies et ressources tierces** en environnement réel, sur ordinateur et mobile.
5. **Examiner les conditions des prestataires** GitHub, Cloudflare, Twitch, puis Resend au moment de son activation (traitements hors EEE, DPA et garanties).
6. **Valider l'identification du responsable** de traitement et les modalités de contact, sans mettre d'adresse privée dans un dépôt public.
7. **Réviser préalablement la rubrique Contact** avant activation de l'envoi direct et des pièces jointes.
8. Préparer l'affichage accessible sous le pied de page, mais **ne pas présenter ce brouillon comme une politique finalisée**.

## Références réglementaires

- CNIL — Transparence : https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence
- CNIL — Cookies et traceurs : https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi
- CNIL — Bases légales : https://www.cnil.fr/fr/les-bases-legales/liceite-essentiel-sur-les-bases-legales
- CNIL — Transferts : https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre5

*Le présent document est un brouillon descriptif et non une certification de conformité RGPD.*
