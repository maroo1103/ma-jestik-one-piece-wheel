/* Présentation du programme de récompenses mensuelles Ma_JesTik.
   Ne crée aucun classement, gagnant, solde, achat ou versement côté navigateur.
   Les résultats mensuels nécessiteront une API serveur et une validation manuelle. */
const rewards=[
 {place:'1er',medal:'🥇',label:'PREMIÈRE PLACE',coins:'500',tone:'gold'},
 {place:'2e',medal:'🥈',label:'DEUXIÈME PLACE',coins:'300',tone:'silver'},
 {place:'3e',medal:'🥉',label:'TROISIÈME PLACE',coins:'200',tone:'bronze'}
];
export function monthlyRewardsMarkup(){
 return '<section class="mj-monthly-rewards" aria-labelledby="mjMonthlyRewardsTitle">'+
 '<div class="mj-monthly-rewards-top"><span class="mj-monthly-rewards-kicker">✦ LE QG RÉCOMPENSE SES MEMBRES</span><span class="mj-monthly-rewards-status">EN PRÉPARATION</span></div>'+
 '<header class="mj-monthly-rewards-header"><h1 id="mjMonthlyRewardsTitle">RÉCOMPENSES <span>MENSUELLES</span></h1>'+
 '<p>À terme, les trois premières places d’un classement <strong>mensuel distinct</strong> du classement général donneront accès à des bonus de pièces DraftBot.</p></header>'+
 '<div class="mj-monthly-rewards-grid">'+rewards.map(item=>
  '<article class="mj-monthly-rewards-card mj-monthly-rewards-'+item.tone+'">'+
  '<span class="mj-monthly-rewards-medal" aria-hidden="true">'+item.medal+'</span>'+
  '<span class="mj-monthly-rewards-place">'+item.place+' · '+item.label+'</span>'+
  '<strong class="mj-monthly-rewards-coins">'+item.coins+'</strong>'+
  '<span class="mj-monthly-rewards-unit">pièces Discord</span>'+
  '</article>').join('')+'</div>'+
 '<div class="mj-monthly-rewards-bottom"><div>'+
 '<strong>1 000 pièces distribuées au maximum par mois</strong>'+
 '<p>Bonus prévus, versés manuellement par le propriétaire avec DraftBot après vérification des résultats et du compte Discord. Aucune conversion libre des points QG en pièces.</p>'+
 '<p>Ce programme n’est pas encore actif : aucun gagnant ni versement automatique n’est annoncé. Date de lancement, égalités et critères d’éligibilité restent à définir.</p>'+
 '</div><a class="mj-monthly-rewards-link" href="#/boutique">DÉCOUVRIR LA BOUTIQUE</a></div>'+
 '</section>';
}
