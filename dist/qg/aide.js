/* Ma_JesTik — Centre d'aide public et FAQ. Aucun stockage ni appel API. */
const faq=[
 {id:"compte",title:"COMPTE & PROFIL",intro:"Connexion Twitch, personnalisation et confidentialité.",items:[
  {q:"Comment me connecter au QG ?",a:'Clique sur <strong>« Se connecter »</strong> en haut à droite, puis autorise la connexion Twitch. Le site utilise ton identité Twitch pour les fonctionnalités communautaires. Aucun mot de passe Twitch ne doit être saisi directement sur Ma_JesTik.'},
  {q:"Pourquoi ma connexion peut-elle disparaître ?",a:'Le QG essaie de restaurer ta session quand tu actualises la page dans le même onglet. Elle reste limitée par la validité de ton accès Twitch et peut prendre fin si tu fermes ton onglet ou si Twitch expire ton autorisation. Reconnecte-toi si nécessaire.'},
  {q:"Comment personnaliser mon profil ?",a:'Ouvre <a href="#/profil">Mon profil</a>, puis <strong>« Modifier mon profil »</strong>. Tu peux choisir une présentation, une bannière, une couleur, un jeu principal, des favoris et tes réseaux. Enregistre ensuite tes modifications.'},
  {q:"Combien de jeux favoris puis-je sélectionner ?",a:'Tu peux choisir <strong>jusqu’à quatre jeux favoris</strong> dans le catalogue du QG et désigner l’un d’eux comme jeu principal. Le catalogue est commun à tous les membres.'},
  {q:"Mon profil est-il visible par tout le monde ?",a:'Non, <strong>la visibilité publique est désactivée par défaut</strong>. Tu peux l’activer ou la désactiver dans <a href="#/profil">Mon profil → Modifier mon profil</a>. Un profil privé n’est pas consultable publiquement.'},
  {q:"Profil public et classement : quelle différence ?",a:'Ce sont <strong>deux paramètres indépendants</strong>. Le profil public permet de consulter ta présentation et tes jeux. L’option <strong>« Afficher mon profil dans le classement »</strong> contrôle l’apparition de ton pseudo et de tes points dans les classements.'},
  {q:"Comment supprimer mon profil QG ?",a:'Depuis <a href="#/profil">Mon profil → Modifier mon profil</a>, utilise la zone de suppression tout en bas. Deux confirmations sont demandées. <strong>Attention :</strong> des données communautaires liées à ton compte, dont des points et des votes, peuvent être supprimées définitivement. Cela ne supprime pas ton compte Twitch.'}
 ]},
 {id:"gaming",title:"OUTILS GAMING",intro:"Roue, défis et Killathon communautaire.",items:[
  {q:"À quoi sert la roue Fortnite ?",a:'La <a href="#/roue">roue Fortnite</a> choisit aléatoirement une destination parmi les lieux proposés dans l’outil. C’est une manière de varier les parties et de laisser le hasard décider.'},
  {q:"Comment fonctionnent les défis et missions ?",a:'Dans <a href="#/defis">Défis & missions</a>, sélectionne les critères disponibles pour tirer une mission, puis consulte le défi en cours. Les pronostics de la communauté dépendent de l’ouverture d’une manche officielle.'},
  {q:"Qu’est-ce que le Killathon du site ?",a:'Le <a href="#/killathon">Killathon communautaire</a> est un compteur <strong>manuel</strong> lié à chaque compte Twitch. Un streamer peut fixer un objectif, mettre à jour son compteur et utiliser un lien d’affichage OBS. Il ne s’agit pas du Killathon personnel automatisé de Ma_JesTik sur son PC.'},
  {q:"Puis-je afficher mon Killathon sur OBS ?",a:'Oui. Lorsque ton Killathon du site est créé, un <strong>lien d’affichage OBS</strong> est proposé. Ajoute-le dans OBS comme source Navigateur pour afficher ton compteur. Aucun mot de passe Twitch ne doit être ajouté dans l’URL.'}
 ]},
 {id:"communaute",title:"COMMUNAUTÉ",intro:"Votes, Tribunal et classements.",items:[
  {q:"Comment participer aux votes des défis ?",a:'Connecte-toi avec Twitch, puis ouvre <a href="#/defis">Défis & missions</a>. Quand une manche officielle est active, tu peux pronostiquer la réussite ou l’échec. Le résultat est ensuite validé côté serveur.'},
  {q:"Comment gagner des points dans le QG ?",a:'Les points du classement viennent notamment des <strong>pronostics correctement résolus</strong> sur les défis : +1 point pour une réussite prédite correctement et +2 points pour un échec prédit correctement. Ils ne peuvent pas être modifiés depuis les réglages du profil.'},
  {q:"À quoi sert le Tribunal communautaire ?",a:'Le <a href="#/tribunal">Tribunal</a> permet de proposer des questions, participer à des sondages et voir leurs résultats. Une connexion Twitch est nécessaire pour voter ou proposer une question ; les propositions peuvent être soumises à validation.'},
  {q:"Pourquoi mon pseudo n’apparaît-il pas au classement ?",a:'Vérifie l’option <strong>« Afficher mon profil dans le classement »</strong> dans <a href="#/profil">Mon profil</a>. Ton compte doit aussi disposer de points pris en compte par le classement. La visibilité de ton profil public est un autre réglage.'},
  {q:"Comment rejoindre le Discord Ma_JesTik ?",a:'Tu peux rejoindre la communauté via <a href="https://discord.gg/nyuC5YE467" target="_blank" rel="noopener noreferrer">le serveur Discord Ma_JesTik</a>. Tu y retrouveras les espaces de discussion et de recherche de joueurs.'}
 ]},
 {id:"technique",title:"SITE & ASSISTANCE",intro:"Affichage, données et fonctionnement du QG.",items:[
  {q:"Le site est-il utilisable sur téléphone ?",a:'Oui. L’interface du QG est adaptée aux ordinateurs et aux mobiles. Si un affichage semble ancien, actualise le navigateur ; sur ordinateur, tu peux également utiliser <strong>Ctrl + F5</strong>.'},
  {q:"Que faire si une fonctionnalité semble bloquée ?",a:'Commence par actualiser la page et vérifier ta connexion Twitch. Si une action nécessite Twitch, assure-toi d’être connecté. Certaines fonctionnalités communautaires sont encore en développement et peuvent être momentanément indisponibles.'},
  {q:"Quelles informations sont enregistrées dans mon profil ?",a:'Le QG utilise ton identifiant et ton avatar Twitch ainsi que les préférences que tu renseignes volontairement, comme ta présentation, tes jeux et tes liens. Les profils et points sont gérés par les services du site ; tu contrôles la visibilité publique et celle du classement.'},
  {q:"Le site est-il affilié à Epic Games ou Twitch ?",a:'Ma_JesTik est un <strong>site communautaire indépendant</strong>. Les noms des jeux, plateformes et marques cités appartiennent à leurs titulaires. Le QG ne propose actuellement ni boutique ni liens d’affiliation. Découvre le projet dans <a href="#/apropos">À propos du QG</a>.'}
 ]}
];
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const norm=s=>String(s).toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
export function helpMarkup(){
 const tabs=faq.map(cat=>'<a href="#mj-help-'+esc(cat.id)+'" data-faq-anchor="'+esc(cat.id)+'">'+esc(cat.title.toLowerCase())+'</a>').join("");
 const sections=faq.map(cat=>
  '<section class="mj-help-section" id="mj-help-'+esc(cat.id)+'" data-help-category="'+esc(cat.id)+'">'+
   '<div class="mj-help-section-head"><div><span class="mj-help-kicker">CENTRE D\u2019AIDE</span><h2>'+esc(cat.title)+'</h2></div><p>'+esc(cat.intro)+'</p></div>'+
   '<div class="mj-help-questions">'+cat.items.map(({q,a})=>
    '<details class="mj-help-item" data-help-question><summary>'+esc(q)+'<span class="mj-help-chevron" aria-hidden="true"></span></summary>'+
    '<div class="mj-help-answer"><p>'+a+'</p></div></details>').join("")+'</div>'+
  '</section>'
 ).join("");
 return '<div class="mj-help-page">'+
  '<div class="page-head mj-help-hero"><div class="eyebrow">AIDE & INFORMATIONS</div><h1>CENTRE D\u2019AIDE</h1>'+
    '<p>Des réponses simples pour profiter du QG Ma_JesTik, gérer ton profil et participer à la communauté.</p>'+
    '<div class="mj-help-search"><label for="mjHelpSearch">UNE QUESTION ?</label><input id="mjHelpSearch" type="search" placeholder="Rechercher dans la FAQ…" autocomplete="off" aria-describedby="mjHelpSearchHint">'+
    '<small id="mjHelpSearchHint">Recherche instantanée, sans envoyer de données à un serveur.</small></div>'+
    '<nav class="mj-help-shortcuts" aria-label="Rubriques de la FAQ">'+tabs+'</nav>'+
  '</div>'+
  '<div class="mj-help-categories">'+sections+'</div>'+
  '<p class="mj-help-noresult" id="mjHelpNoResult" role="status" hidden>Aucune réponse trouvée. Essaie avec un autre mot-clé.</p>'+
  '<aside class="mj-help-discord"><div><span class="mj-help-kicker">RESTONS CONNECTÉS</span><h2>REJOINS LA COMMUNAUTÉ</h2>'+
  '<p>Retrouve le Discord Ma_JesTik pour discuter avec les membres. Une page de contact dédiée sera ajoutée ultérieurement.</p></div>'+
  '<a href="https://discord.gg/nyuC5YE467" target="_blank" rel="noopener noreferrer">Rejoindre le Discord </a></aside>'+
 '</div>';
}
export function mountHelp(){
 const input=document.getElementById('mjHelpSearch'),root=document.querySelector('.mj-help-page');
 if(!input||!root)return;
 const sections=[...root.querySelectorAll('[data-help-category]')];
 const noResult=root.querySelector('#mjHelpNoResult');
 const filter=()=>{
  const word=norm(input.value.trim());
  let count=0;
  for(const cat of sections){
   let inside=0;
   for(const item of cat.querySelectorAll('[data-help-question]')){
    const q=item.querySelector('summary')?.textContent||"";
    const a=item.querySelector('.mj-help-answer')?.textContent||"";
    const matched=!word||norm(q+' '+a).includes(word);
    item.hidden=!matched;
    if(matched){count++;inside++;}
    if(word)item.open=matched&&!norm(q).includes(word);
    else item.open=false;
   }
   cat.hidden=inside===0;
  }
  noResult.hidden=count>0;
 };
 input.addEventListener('input',filter);
 // Les raccourcis des rubriques utilisent des ancres internes et ne changent pas la route.
 root.querySelectorAll('[data-faq-anchor]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  const id=link.dataset.faqAnchor,section=document.getElementById('mj-help-'+id);
  section?.scrollIntoView({behavior:'smooth',block:'start'});
 }));
}
