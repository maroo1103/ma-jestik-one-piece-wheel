# Connexion Twitch — QG Ma_JesTik

Le module dist/qg/twitch-auth.js est prêt. Pour le moment, aucun Client ID n'est défini : aucun bouton factice n'est visible.

Activer : sur https://dev.twitch.tv/console/apps enregistrer une application de site web.
OAuth Redirect URL exacte : https://maroo1103.github.io/ma-jestik-one-piece-wheel/qg/
Récupérer uniquement le Client ID public et le renseigner dans la meta majestik-twitch-client-id de dist/qg/index.html.
NE JAMAIS publier le Client Secret, un mot de passe Twitch ou un access token dans GitHub.

Cette première version utilise le flux OAuth implicit recommandé par Twitch pour les sites client uniquement.
Le token de courte durée est en sessionStorage et retiré immédiatement de l'URL au retour OAuth.
Une validation via oauth2/validate puis helix/users vérifie l'ID, le pseudo et l'avatar de Twitch.
Les visites futures devront se reconnecter ; il n'existe pas encore de compte partagé, points ni classement.
À l'étape suivante, pour le classement : backend sécurisé, Authorization Code Grant côté serveur,
cookies HttpOnly/Secure et DB Cloudflare D1. Le score doit être attribué au Twitch user ID immuable.
Définir les règles de points, la protection anti-triche, la suppression de compte et la confidentialité.