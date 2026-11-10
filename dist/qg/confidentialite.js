/* Page publique d'information — traitements connus au 10/11/2026.
   Ne remplace pas les mentions légales : l'identification du responsable reste à finaliser.
   Aucun secret, identifiant personnel ou adresse privée n'est inclus. */
export function privacyMarkup(){
 return `
 <div class="mj-privacy">
  <header class="mj-privacy-hero" aria-labelledby="mjPrivacyTitle">
   <div class="mj-privacy-eyebrow">AIDE &amp; INFORMATIONS <span aria-hidden="true">✦</span> DONNÉES PERSONNELLES</div>
   <h1 id="mjPrivacyTitle">TES DONNÉES.<br><em>EN TOUTE CLARTÉ.</em></h1>
   <p>Voici comment le QG Ma_JesTik utilise les informations nécessaires à la connexion Twitch, aux activités communautaires et aux messages envoyés depuis le site.</p>
   <div class="mj-privacy-hero-meta"><span>POLITIQUE DE CONFIDENTIALITÉ</span><span>Mise à jour : <time datetime="2026-11-10">10 novembre 2026</time></span></div>
  </header>

  <div class="mj-privacy-intro" role="note">
   <span class="mj-privacy-intro-symbol" aria-hidden="true">◈</span>
   <div><strong>Une information transparente, qui continue de s'améliorer</strong>
   <p>Les traitements décrits ci-dessous correspondent aux fonctionnalités connues du QG. L'identification complète du responsable du traitement, certaines durées techniques des prestataires et les garanties de transfert sont encore en cours de vérification. Cette page ne constitue pas une certification de conformité RGPD et ne remplace pas les mentions légales du site.</p></div>
  </div>

  <div class="mj-privacy-layout">
   <nav class="mj-privacy-nav" aria-label="Sommaire de la confidentialité">
    <strong>AU PROGRAMME</strong>
    <button type="button" data-privacy-jump="responsable">01 · Responsable &amp; contact</button>
    <button type="button" data-privacy-jump="donnees">02 · Données utilisées</button>
    <button type="button" data-privacy-jump="finalites">03 · Utilisation &amp; bases légales</button>
    <button type="button" data-privacy-jump="destinataires">04 · Prestataires</button>
    <button type="button" data-privacy-jump="durees">05 · Conservation</button>
    <button type="button" data-privacy-jump="droits">06 · Tes droits</button>
    <button type="button" data-privacy-jump="stockage">07 · Stockage &amp; sécurité</button>
   </nav>

   <div class="mj-privacy-sections">
    <section class="mj-privacy-section" id="mj-privacy-responsable" aria-labelledby="mj-privacy-responsable-title">
     <span class="mj-privacy-n">01 / QUI GÈRE CES INFORMATIONS ?</span>
     <h2 id="mj-privacy-responsable-title">RESPONSABLE &amp; CONTACT</h2>
     <p>Le QG est proposé par l'éditeur du site personnel <strong>Ma_JesTik</strong>, accessible à l'adresse <a href="https://ma-jestik.fr/">ma-jestik.fr</a>. L'éditeur définit les fonctionnalités communautaires et les usages de données décrits sur cette page.</p>
     <p>Tu peux poser une question, demander l'accès ou la suppression de tes données, ou signaler un problème à <a href="mailto:contact@ma-jestik.fr">contact@ma-jestik.fr</a>, ou utiliser le <a href="#/contact">formulaire de contact</a>.</p>
     <p class="mj-privacy-detail">L'identité civile du responsable et ses coordonnées postales ne sont pas encore publiées. Les modalités de leur communication dans le respect des obligations légales et de la vie privée de l'éditeur restent à clarifier. Ces informations sont donc actuellement incomplètes.</p>
    </section>

    <section class="mj-privacy-section" id="mj-privacy-donnees" aria-labelledby="mj-privacy-donnees-title">
     <span class="mj-privacy-n">02 / QU'EST-CE QUI EST UTILISÉ ?</span>
     <h2 id="mj-privacy-donnees-title">LES DONNÉES DU QG</h2>
     <div class="mj-privacy-data-grid">
      <div><h3>Connexion Twitch</h3><p>Identifiant Twitch, pseudo, nom de connexion, avatar et jeton d'accès nécessaire à la vérification d'identité. Le jeton reste dans le stockage de session du navigateur, et l'identité est contrôlée auprès de Twitch.</p></div>
      <div><h3>Profil communautaire</h3><p>Présentation, nom affiché, préférences visuelles, jeux favoris et identifiants Instagram, TikTok ou Discord si tu les renseignes. Tu choisis la visibilité de ton profil et du classement. Si tu actives ta présence au classement, ton identifiant Twitch technique peut accompagner ton pseudo et tes points pour ouvrir ta fiche membre ; son contenu détaillé reste inaccessible si ton profil est privé.</p></div>
      <div><h3>Défis &amp; Killathon</h3><p>Participation aux défis, pronostics, points, classement, objectifs et compteur Killathon. Les informations associées au compte sont conservées dans la base du QG.</p></div>
      <div><h3>Tribunal</h3><p>Questions, choix de réponses, propositions, résultats, dates, pseudos et identifiants Twitch des auteurs ou votants. Tu peux y participer avec Twitch sans nécessairement créer un profil communautaire.</p></div>
      <div><h3>Nous contacter</h3><p>Catégorie, sujet, e-mail de réponse, pseudo facultatif, message et éventuelles pièces jointes. Le formulaire utilise une vérification Cloudflare Turnstile contre les envois automatisés.</p></div>
      <div><h3>Données techniques</h3><p>Les services d'hébergement et de protection peuvent traiter des données de connexion, telles que l'adresse IP et des journaux techniques, nécessaires au fonctionnement et à la sécurité.</p></div>
     </div>
     <p class="mj-privacy-detail">La connexion Twitch est facultative pour consulter les pages publiques, mais nécessaire pour certaines fonctions participatives. Les champs obligatoires du formulaire sont indiqués lors de la saisie ; le pseudo et les pièces jointes y sont facultatifs.</p>
    </section>

    <section class="mj-privacy-section" id="mj-privacy-finalites" aria-labelledby="mj-privacy-finalites-title">
     <span class="mj-privacy-n">03 / POURQUOI CES DONNÉES ?</span>
     <h2 id="mj-privacy-finalites-title">UTILISATION &amp; BASES LÉGALES</h2>
     <ul class="mj-privacy-points">
      <li><strong>Connexion et fonctionnement des outils demandés :</strong> vérifier l'identité Twitch, faire fonctionner les profils, votes, classements et compteurs. Base envisagée : l'intérêt légitime à assurer le fonctionnement du service communautaire choisi par l'utilisateur (article 6, §1, f du RGPD).</li>
      <li><strong>Visibilité publique choisie :</strong> afficher un profil ou un classement lorsque tu actives volontairement cette option. Le choix est réversible dans les paramètres du profil ; la qualification de la base légale de cette publication reste à confirmer.</li>
      <li><strong>Réponse aux messages :</strong> recevoir et traiter les demandes envoyées volontairement, au titre de l'intérêt légitime à répondre aux sollicitations (article 6, §1, f).</li>
      <li><strong>Protection technique :</strong> prévention des abus, vérification de session et anti-spam, au titre de l'intérêt légitime à sécuriser le service (article 6, §1, f).</li>
     </ul>
     <p class="mj-privacy-detail">La qualification juridique définitive de chaque traitement reste en cours de validation. Le QG n'utilise pas ta connexion Twitch pour publier automatiquement ton profil.</p>
    </section>

    <section class="mj-privacy-section" id="mj-privacy-destinataires" aria-labelledby="mj-privacy-destinataires-title">
     <span class="mj-privacy-n">04 / AVEC QUI ?</span>
     <h2 id="mj-privacy-destinataires-title">PRESTATAIRES &amp; DESTINATAIRES</h2>
     <p>Selon la fonctionnalité utilisée : <strong>Twitch</strong> vérifie la connexion ; <strong>Cloudflare</strong> fournit les Workers, la base D1 et la vérification anti-spam Turnstile ; <strong>GitHub Pages</strong> publie les pages statiques ; <strong>Resend</strong> achemine les messages de contact ; <strong>OVHcloud</strong> héberge leur boîte de réception.</p>
     <p>L'éditeur peut accéder aux données nécessaires à la gestion du site. Les autres visiteurs ne voient que les contenus destinés à être publics : notamment certains sondages, résultats, classements ou profils rendus visibles.</p>
     <p><strong>Autres appels externes :</strong> l'accueil interroge <strong>DecAPI</strong> pour afficher si la chaîne Twitch est en direct. Des illustrations de jeux affichées dans les profils peuvent être chargées depuis les serveurs d'éditeurs et de plateformes de jeux (notamment Steam et les sites des jeux concernés). La page du setup interactif charge aussi deux ressources depuis un autre site hébergé sur <strong>GitHub Pages</strong>. Ces requêtes peuvent communiquer l'adresse IP et des données techniques du navigateur aux serveurs concernés. L'utilisation éventuelle de cookies par ces tiers doit encore être vérifiée.</p>
     <p>Des prestataires peuvent traiter des informations hors de l'Espace économique européen. Les localisations exactes, garanties applicables et durées conservées par chaque service sont encore en cours de vérification. Pour obtenir davantage d'informations, contacte l'éditeur.</p>
    </section>

    <section class="mj-privacy-section" id="mj-privacy-durees" aria-labelledby="mj-privacy-durees-title">
     <span class="mj-privacy-n">05 / COMBIEN DE TEMPS ?</span>
     <h2 id="mj-privacy-durees-title">DURÉES DE CONSERVATION</h2>
     <p>Voici les durées <strong>retenues par l'éditeur</strong> pour les données de la communauté. Elles ne doivent pas être confondues avec une promesse que toutes les suppressions sont déjà automatisées.</p>
     <div class="mj-privacy-table-wrap">
      <table class="mj-privacy-table">
       <thead><tr><th scope="col">Données</th><th scope="col">Durée retenue</th></tr></thead>
       <tbody>
        <tr><td>Compte, profil, Killathon, points et votes liés au membre</td><td>Jusqu'à la suppression demandée, ou 6 mois consécutifs sans activité Twitch authentifiée.</td></tr>
        <tr><td>Propositions Tribunal en attente</td><td>3 mois après leur création.</td></tr>
        <tr><td>Propositions Tribunal refusées</td><td>30 jours après la décision.</td></tr>
        <tr><td>Propositions Tribunal acceptées</td><td>6 mois après la décision.</td></tr>
        <tr><td>Sondages terminés du Tribunal et leurs votes</td><td>12 mois après clôture ou expiration.</td></tr>
        <tr><td>Messages reçus chez OVH</td><td>6 mois après le dernier échange, sauf nécessité justifiée. Pièces jointes : dès qu'elles ne sont plus utiles.</td></tr>
       </tbody>
      </table>
     </div>
     <p class="mj-privacy-detail"><strong>État actuel :</strong> les nettoyages automatiques des comptes inactifs et des historiques du Tribunal fonctionnent en <strong>mode simulation</strong> ; aucune purge réelle n'est activée. Les demandes de suppression sont traitées via la fonctionnalité de profil lorsqu'elle s'applique, ou par contact direct. Les anciens sondages sans limite, s'il en existe, doivent être clos manuellement. Les durées des journaux techniques, des sauvegardes et des copies conservées par les prestataires restent à préciser.</p>
    </section>

    <section class="mj-privacy-section" id="mj-privacy-droits" aria-labelledby="mj-privacy-droits-title">
     <span class="mj-privacy-n">06 / C'EST TON CHOIX</span>
     <h2 id="mj-privacy-droits-title">TES DROITS SUR TES DONNÉES</h2>
     <p>Selon ta situation et les conditions prévues par le RGPD, tu peux demander l'accès à tes données, leur correction, leur effacement ou leur limitation, t'opposer à certains traitements, et demander la portabilité lorsqu'elle est applicable.</p>
     <p>Tu peux modifier les informations et réglages publics de ton profil dans <a href="#/profil">Mon profil</a>. La rubrique permet aussi de demander la suppression du compte QG. Cette suppression ne touche pas ton compte Twitch.</p>
     <p>Si tu as voté ou proposé une question au Tribunal sans créer de profil QG, écris-nous directement : il n'est pas nécessaire de créer un compte pour exercer tes droits. Les textes libres, historiques techniques et sauvegardes peuvent nécessiter un traitement distinct.</p>
     <div class="mj-privacy-contact">
      <div><strong>UNE QUESTION OU UNE DEMANDE RGPD ?</strong><span>Contact direct, même sans profil Ma_JesTik.</span></div>
      <a href="mailto:contact@ma-jestik.fr" class="mj-privacy-contact-btn">✉ contact@ma-jestik.fr</a>
     </div>
     <p>Une vérification d'identité proportionnée peut être demandée pour protéger tes données. Tu peux aussi déposer une réclamation auprès de la <a href="https://www.cnil.fr/" target="_blank" rel="noopener noreferrer">CNIL</a>.</p>
    </section>

    <section class="mj-privacy-section" id="mj-privacy-stockage" aria-labelledby="mj-privacy-stockage-title">
     <span class="mj-privacy-n">07 / SUR TON NAVIGATEUR</span>
     <h2 id="mj-privacy-stockage-title">STOCKAGE LOCAL &amp; SÉCURITÉ</h2>
     <p>Le QG utilise <strong>sessionStorage</strong> pour le jeton Twitch de l'onglet. Un état de sécurité temporaire lié à la connexion peut être conservé dans <strong>sessionStorage</strong> et <strong>localStorage</strong>, puis retiré au retour de Twitch. Des brouillons de profil, préférences ou données de certains outils peuvent aussi rester dans le stockage local du navigateur.</p>
     <p>Le site emploie HTTPS et vérifie côté serveur les demandes authentifiées. Cloudflare Turnstile protège le formulaire de contact contre les robots. Ces mesures réduisent certains risques sans offrir de garantie absolue de sécurité.</p>
     <p>La présence éventuelle de cookies ou traitements supplémentaires liés à des ressources tierces fait encore l'objet d'une vérification. Aucune affirmation générale d'absence de traceurs publicitaires n'est faite ici.</p>
     <p>Cette politique sera actualisée si les fonctionnalités ou les traitements changent. Tu peux demander des précisions à <a href="mailto:contact@ma-jestik.fr">contact@ma-jestik.fr</a>.</p>
    </section>
   </div>
  </div>
  <div class="mj-privacy-bottom"><span aria-hidden="true">✦</span> MA_JESTIK · UN QG QUI ÉVOLUE, UNE INFORMATION QUI RESTE ACCESSIBLE.</div>
 </div>`;
}

export function mountPrivacy(){
 const root=document.querySelector('.mj-privacy');
 if(!root)return;
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-privacy-jump]');
  if(!button||!root.contains(button))return;
  const target=root.querySelector('#mj-privacy-'+button.dataset.privacyJump);
  if(!target)return;
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  target.querySelector('h2')?.setAttribute('tabindex','-1');
  target.querySelector('h2')?.focus({preventScroll:true});
 });
}
