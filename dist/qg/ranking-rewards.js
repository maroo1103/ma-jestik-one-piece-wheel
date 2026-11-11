/* Récompenses mensuelles Ma_JesTik : présentation publique uniquement.
   Pas de résultats fictifs, de paiement ni de points modifiables depuis le navigateur.
   Le classement par mois et les versements devront être validés côté serveur avant ouverture. */
const rewards=[
 {rank:1,place:'1er',medal:'🥇',label:'PREMIÈRE PLACE',coins:300,tone:'gold'},
 {rank:2,place:'2e',medal:'🥈',label:'DEUXIÈME PLACE',coins:200,tone:'silver'},
 {rank:3,place:'3e',medal:'🥉',label:'TROISIÈME PLACE',coins:100,tone:'bronze'},
 {rank:4,place:'4e',coins:75},
 {rank:5,place:'5e',coins:60},
 {rank:6,place:'6e',coins:50},
 {rank:7,place:'7e',coins:40},
 {rank:8,place:'8e',coins:30},
 {rank:9,place:'9e',coins:20},
 {rank:10,place:'10e',coins:10}
];
const formatCoins=value=>new Intl.NumberFormat('fr-FR').format(value);
const totalCoins=rewards.reduce((total,reward)=>total+reward.coins,0);
function podiumCard(item){
 return '<article class="mj-monthly-rewards-card mj-monthly-rewards-'+item.tone+'">'+
 '<span class="mj-monthly-rewards-medal" aria-hidden="true">'+item.medal+'</span>'+
 '<span class="mj-monthly-rewards-place">'+item.place+' · '+item.label+'</span>'+
 '<strong class="mj-monthly-rewards-coins">'+formatCoins(item.coins)+'</strong>'+
 '<span class="mj-monthly-rewards-unit">pièces Discord</span>'+
 '</article>';
}
function rewardRow(item){
 return '<li class="mj-monthly-rewards-rank-row">'+
 '<span class="mj-monthly-rewards-rank-number">'+item.place+'</span>'+
 '<span class="mj-monthly-rewards-rank-copy">BONUS DU CLASSEMENT</span>'+
 '<span class="mj-monthly-rewards-rank-prize"><strong>'+formatCoins(item.coins)+'</strong> <span>pièces</span></span>'+
 '</li>';
}
function participationStep(number,title,description,href,linkLabel){
 return '<article class="mj-monthly-rewards-step">'+
 '<span class="mj-monthly-rewards-step-number">'+number+'</span>'+
 '<h3>'+title+'</h3><p>'+description+'</p>'+
 (href?'<a href="'+href+'">'+linkLabel+'</a>':'')+
 '</article>';
}
function ruleItem(title,description){
 return '<li><span class="mj-monthly-rewards-rule-symbol" aria-hidden="true">✓</span><span><strong>'+title+'</strong><span>'+description+'</span></span></li>';
}
export function monthlyRewardsMarkup(){
 return '<div class="mj-monthly-rewards">'+
 '<header class="mj-monthly-rewards-hero" aria-labelledby="mjMonthlyRewardsTitle">'+
 '<p class="mj-monthly-rewards-kicker">✦ LE QG RÉCOMPENSE SES MEMBRES</p>'+
 '<h1 id="mjMonthlyRewardsTitle">RÉCOMPENSES <span>MENSUELLES</span></h1>'+
 '<p class="mj-monthly-rewards-lead">Chaque mois de compétition, les <strong>10 meilleurs membres du QG</strong> pourront remporter des pièces Discord. Participe aux pronostics, grimpe au classement et vise le podium !</p>'+
 '<div class="mj-monthly-rewards-metrics" aria-label="Les chiffres des récompenses">'+
 '<div><strong>10</strong><span>PLACES RÉCOMPENSÉES</span></div>'+
 '<div><strong>'+formatCoins(totalCoins)+'</strong><span>PIÈCES À GAGNER PAR MOIS</span></div>'+
 '<div><strong>3</strong><span>PLACES SUR LE PODIUM</span></div>'+
 '</div></header>'+
 '<section class="mj-monthly-rewards-prizes" aria-labelledby="mjMonthlyPrizesTitle">'+
 '<div class="mj-monthly-rewards-section-title"><div><span class="mj-monthly-rewards-overline">LES PLACES À DÉCROCHER</span><h2 id="mjMonthlyPrizesTitle">LE PODIUM <span>DU MOIS</span></h2></div><p>Les trois premières places à l’honneur.</p></div>'+
 '<div class="mj-monthly-rewards-grid">'+rewards.slice(0,3).map(podiumCard).join('')+'</div>'+
 '<div class="mj-monthly-rewards-rankings">'+
 '<div class="mj-monthly-rewards-rankings-head"><h3>DU 4e AU 10e</h3><p>Le top 10 ne repart pas les mains vides.</p></div>'+
 '<ol class="mj-monthly-rewards-rank-list" start="4">'+rewards.slice(3).map(rewardRow).join('')+'</ol>'+
 '</div></section>'+
 '<section class="mj-monthly-rewards-how" aria-labelledby="mjMonthlyHowTitle">'+
 '<div class="mj-monthly-rewards-section-title"><div><span class="mj-monthly-rewards-overline">À TOI DE JOUER</span><h2 id="mjMonthlyHowTitle">COMMENT <span>PARTICIPER ?</span></h2></div></div>'+
 '<div class="mj-monthly-rewards-steps">'+
 participationStep('01','REJOINS LE QG','Connecte-toi avec Twitch, crée ton profil et choisis d’apparaître dans le classement.','#/profil','VOIR MON PROFIL')+
 participationStep('02','FAIS TES PRONOSTICS','Prédis la réussite ou l’échec des défis : les bons pronostics rapportent des points QG.','#/defis','DÉCOUVRIR LES DÉFIS')+
 participationStep('03','VISE LE TOP 10','Quand la saison mensuelle sera ouverte, seuls les points obtenus pendant ce mois compteront pour ses récompenses.','#/classement','VOIR LE CLASSEMENT GÉNÉRAL')+
 '</div></section>'+
 '<section class="mj-monthly-rewards-challenge" aria-labelledby="mjMonthlyChallengeTitle">'+
 '<div class="mj-monthly-rewards-challenge-art" aria-hidden="true"><span>TOP</span><strong>10</strong><span>DU QG</span></div>'+
 '<div class="mj-monthly-rewards-challenge-copy"><span class="mj-monthly-rewards-overline">UN NOUVEAU DÉPART CHAQUE MOIS</span>'+
 '<h2 id="mjMonthlyChallengeTitle">LE DÉFI <span>DU MOIS</span></h2>'+
 '<p>Un objectif simple : gagner ta place parmi les dix meilleurs pronostiqueurs du mois. Ton classement général continuera d’exister à côté, sans remise à zéro.</p>'+
 '<p class="mj-monthly-rewards-challenge-note"><span aria-hidden="true">✦</span> Le premier mois de compétition sera annoncé avant son ouverture. Le classement mensuel et les résultats apparaîtront ici une fois le système activé.</p>'+
 '</div></section>'+
 '<section class="mj-monthly-rewards-rules" aria-labelledby="mjMonthlyRulesTitle">'+
 '<div class="mj-monthly-rewards-section-title"><div><span class="mj-monthly-rewards-overline">L’ESSENTIEL À SAVOIR</span><h2 id="mjMonthlyRulesTitle">RÈGLES <span>&amp; CONDITIONS</span></h2></div></div>'+
 '<ul class="mj-monthly-rewards-rules-list">'+
 ruleItem('Un classement, un mois','Seuls les points gagnés pendant la période mensuelle compteront pour le top 10 récompensé.')+
 ruleItem('Des résultats vérifiés','Les points doivent provenir des pronostics validés par le QG. Toute activité abusive peut entraîner une vérification.')+
 ruleItem('Un compte identifiable','La remise des pièces Discord nécessitera de confirmer le compte du gagnant. Une seule récompense par personne et par mois.')+
 ruleItem('Une attribution contrôlée','Les récompenses seront remises après vérification du classement. Les règles de départage et la date de lancement seront annoncées avant la première saison.')+
 '</ul></section>'+
 '<footer class="mj-monthly-rewards-footer">'+
 '<div><span class="mj-monthly-rewards-footer-star" aria-hidden="true">✦</span><strong>PRÊT À VISER LE TOP 10 ?</strong><p>Les points font monter au classement, les pièces Discord donnent accès aux récompenses de la boutique.</p></div>'+
 '<div class="mj-monthly-rewards-footer-actions"><a class="mj-monthly-rewards-link mj-monthly-rewards-link-outline" href="#/classement">VOIR LES CLASSEMENTS</a><a class="mj-monthly-rewards-link" href="#/boutique">DÉCOUVRIR LA BOUTIQUE</a></div>'+
 '</footer></div>';
}
