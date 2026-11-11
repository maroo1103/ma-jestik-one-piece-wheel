/* Boutique Ma_JesTik : affichage public uniquement, achats effectués sur Discord via DraftBot.
   Liens des salons non fournis : lien d'invitation général utilisé temporairement. */
const discordInvite='https://discord.gg/nyuC5YE467';
const catalogUrl=discordInvite;
const orderUrl=discordInvite;
const icons={"bank":"<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m5 16 19-10 19 10H5Zm3 5h32M8 39h32M6 43h36M13 21v18m11-18v18m11-18v18\"/></svg>","coins":"<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse cx=\"25\" cy=\"14\" rx=\"13\" ry=\"5\"/><path d=\"M12 14v8c0 3 6 5 13 5s13-2 13-5v-8M12 19c-7 1-10 3-10 6v9c0 3 6 5 13 5 6 0 11-2 12-4M2 25c0 3 6 5 13 5 4 0 8-.7 10-2M38 22v8c0 2-3 4-8 5\"/></svg>","cart":"<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 9h6l5 25h24l5-19H13\"/><circle cx=\"19\" cy=\"40\" r=\"2\"/><circle cx=\"36\" cy=\"40\" r=\"2\"/></svg>","xp":"<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M32 4 56 17v30L32 60 8 47V17L32 4Z\"/><text x=\"32\" y=\"40\" text-anchor=\"middle\" font-family=\"system-ui,sans-serif\" font-weight=\"900\" font-size=\"23\" fill=\"currentColor\" stroke=\"none\">XP</text></svg>","crown":"<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m7 21 13 12 12-21 12 21 13-12-4 28H11L7 21Zm5 33h40\"/></svg>","gamepad":"<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M19 20h26c7 0 10 7 13 19 2 8-2 13-8 13-5 0-9-8-14-8h-8c-5 0-9 8-14 8-6 0-10-5-8-13 3-12 6-19 13-19Z\"/><path d=\"M21 29v12M15 35h12\"/><circle cx=\"45\" cy=\"31\" r=\"2\"/><circle cx=\"50\" cy=\"38\" r=\"2\"/></svg>","vbucks":"<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" aria-hidden=\"true\"><circle cx=\"32\" cy=\"32\" r=\"27\"/><circle cx=\"32\" cy=\"32\" r=\"21\"/><path d=\"m20 18 12 32 12-32h-8l-4 15-4-15Z\" stroke-linejoin=\"round\"/></svg>","medal":"<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M17 7h12l7 18-11 7L17 7Zm18 0h12L39 32l-9-7L35 7Z\"/><circle cx=\"32\" cy=\"43\" r=\"16\"/><path d=\"m32 33 3.1 6.2 7 .9-5.1 5 .9 7-5.9-3.3-6 3.3 1.1-7-5.1-5 7-.9Z\"/></svg>"};
const rewards=[
 {id:'xp',icon:'xp',title:'1 000 XP',tag:'BOOST D’EXPÉRIENCE',price:'3 000',description:'Échange tes pièces contre 1 000 XP supplémentaires pour progresser dans les niveaux du serveur Ma_JesTik.'},
 {id:'vip',icon:'crown',title:'VIP Twitch & Discord',price:'8 000',description:'Profite du statut VIP sur Twitch et du rôle VIP sur Discord pendant 30 jours.',condition:'Attribution manuelle après vérification du pseudo Twitch.'},
 {id:'jeu',icon:'gamepad',title:'Choisis mon prochain jeu',badge:'EXCLUSIF',price:'20 000',description:'Choisis une aventure que je découvrirai en stream, parmi les jeux disponibles sur Instant Gaming.',condition:'Budget maximal de 10 € ; choix soumis à validation.'},
 {id:'vbucks',icon:'vbucks',title:'1 000 V-Bucks Fortnite',badge:'STOCK LIMITÉ',price:'30 000',description:'Obtiens l’équivalent de 1 000 V-Bucks Fortnite avec une carte cadeau compatible avec ta plateforme et ta région.',condition:'Remise manuelle selon disponibilité et budget de la boutique.'},
 {id:'pass',icon:'medal',title:'Passe de combat Fortnite',badge:'RÉCOMPENSE SPÉCIALE',price:'32 200',description:'Reçois le Passe de combat de la saison Fortnite en cours selon les conditions de cadeau d’Epic Games.',condition:'Compte éligible, A2F activée, amitié Epic depuis 48 h minimum, niveau 2 minimum et passe non possédé.'}
];
function rewardCard(reward){
 return '<article class="mj-shop-card mj-shop-card-'+reward.id+'" aria-label="'+reward.title+'">'+
 (reward.badge?'<div class="mj-shop-card-badge">'+reward.badge+'</div>':'')+
 '<div class="mj-shop-card-icon" aria-hidden="true">'+icons[reward.icon]+'</div>'+
 '<h3>'+reward.title+'</h3>'+
 (reward.tag?'<span class="mj-shop-card-tag">'+reward.tag+'</span>':'')+
 '<p class="mj-shop-card-description">'+reward.description+'</p>'+
 (reward.condition?'<p class="mj-shop-card-condition">'+reward.condition+'</p>':'')+
 '<div class="mj-shop-card-price"><span class="mj-shop-price-symbol" aria-hidden="true">◉</span>'+reward.price+' <span>pièces</span></div></article>';
}
export function boutiqueMarkup(){
 return '<div class="mj-shop">'+
 '<section class="mj-shop-hero" aria-labelledby="mjShopTitle"><div class="mj-shop-hero-inner">'+
 '<span class="mj-shop-eyebrow">LE QG · RÉCOMPENSES COMMUNAUTAIRES</span>'+
 '<h1 id="mjShopTitle">BOUTIQUE &amp;<br><span>RÉCOMPENSES</span></h1>'+
 '<p class="mj-shop-subtitle">Échange tes pièces Discord contre des récompenses exclusives sur Ma_JesTik.</p>'+
 '<div class="mj-shop-actions">'+
 '<a class="mj-shop-button mj-shop-button-outline" href="'+catalogUrl+'" target="_blank" rel="noopener noreferrer"><span class="mj-shop-btn-icon" aria-hidden="true">'+icons.bank+'</span>VOIR LE CATALOGUE DISCORD</a>'+
 '<a class="mj-shop-button mj-shop-button-gold" href="'+orderUrl+'" target="_blank" rel="noopener noreferrer"><span class="mj-shop-btn-icon" aria-hidden="true">'+icons.cart+'</span>COMMANDER SUR DISCORD</a>'+
 '</div></div></section>'+
 '<section class="mj-shop-steps" aria-label="Comment utiliser la boutique">'+
 '<div class="mj-shop-step"><span class="mj-shop-step-icon" aria-hidden="true">'+icons.bank+'</span><div><h2>1. Gagne des pièces sur Discord</h2><p>Participe, sois actif et accumule des pièces dans la communauté.</p></div></div>'+
 '<span class="mj-shop-step-arrow" aria-hidden="true">›</span>'+
 '<div class="mj-shop-step"><span class="mj-shop-step-icon" aria-hidden="true">'+icons.coins+'</span><div><h2>2. Consulte ton solde avec <code class="mj-shop-command">/argent</code></h2><p>Vérifie le nombre de pièces disponibles sur ton compte.</p></div></div>'+
 '<span class="mj-shop-step-arrow" aria-hidden="true">›</span>'+
 '<div class="mj-shop-step"><span class="mj-shop-step-icon" aria-hidden="true">'+icons.cart+'</span><div><h2>3. Achète avec <code class="mj-shop-command">/boutique</code></h2><p>Utilise la commande dans <strong>#commande-boutique</strong> sur Discord.</p></div></div>'+
 '</section>'+
 '<section class="mj-shop-catalog" aria-labelledby="mjShopCatalogTitle">'+
 '<header class="mj-shop-catalog-header"><span class="mj-shop-rule" aria-hidden="true"></span><h2 id="mjShopCatalogTitle">LE CATALOGUE DES RÉCOMPENSES</h2><span class="mj-shop-rule" aria-hidden="true"></span></header>'+
 '<div class="mj-shop-cards">'+rewards.map(rewardCard).join('')+'</div></section>'+
 '<aside class="mj-shop-notice" aria-label="Information sur les achats"><span class="mj-shop-notice-icon" aria-hidden="true">ⓘ</span><strong>À NOTER :</strong><p>Les achats et la gestion des stocks sont effectués sur Discord. Certaines récompenses sont soumises à disponibilité et à validation selon les conditions applicables.</p></aside>'+
 '</div>';
}
