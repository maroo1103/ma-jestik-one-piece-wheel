/* Boutique Ma_JesTik : affichage public uniquement, achats effectués sur Discord via DraftBot.
   Liens directs des deux salons fournis par l'organisateur ; nécessite l'accès Discord du visiteur. */
const catalogUrl='https://discord.com/channels/1296502783423414382/1566446945189367818';
const orderUrl='https://discord.com/channels/1296502783423414382/1566447195673198703';
const icons={"bank":"<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m5 16 19-10 19 10H5Zm3 5h32M8 39h32M6 43h36M13 21v18m11-18v18m11-18v18\"/></svg>","coins":"<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse cx=\"25\" cy=\"14\" rx=\"13\" ry=\"5\"/><path d=\"M12 14v8c0 3 6 5 13 5s13-2 13-5v-8M12 19c-7 1-10 3-10 6v9c0 3 6 5 13 5 6 0 11-2 12-4M2 25c0 3 6 5 13 5 4 0 8-.7 10-2M38 22v8c0 2-3 4-8 5\"/></svg>","cart":"<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 9h6l5 25h24l5-19H13\"/><circle cx=\"19\" cy=\"40\" r=\"2\"/><circle cx=\"36\" cy=\"40\" r=\"2\"/></svg>","xp":"<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M32 4 56 17v30L32 60 8 47V17L32 4Z\"/><text x=\"32\" y=\"40\" text-anchor=\"middle\" font-family=\"system-ui,sans-serif\" font-weight=\"900\" font-size=\"23\" fill=\"currentColor\" stroke=\"none\">XP</text></svg>","crown":"<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m7 21 13 12 12-21 12 21 13-12-4 28H11L7 21Zm5 33h40\"/></svg>","gamepad":"<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M19 20h26c7 0 10 7 13 19 2 8-2 13-8 13-5 0-9-8-14-8h-8c-5 0-9 8-14 8-6 0-10-5-8-13 3-12 6-19 13-19Z\"/><path d=\"M21 29v12M15 35h12\"/><circle cx=\"45\" cy=\"31\" r=\"2\"/><circle cx=\"50\" cy=\"38\" r=\"2\"/></svg>","vbucks":"<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" aria-hidden=\"true\"><circle cx=\"32\" cy=\"32\" r=\"27\"/><circle cx=\"32\" cy=\"32\" r=\"21\"/><path d=\"m20 18 12 32 12-32h-8l-4 15-4-15Z\" stroke-linejoin=\"round\"/></svg>","medal":"<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M17 7h12l7 18-11 7L17 7Zm18 0h12L39 32l-9-7L35 7Z\"/><circle cx=\"32\" cy=\"43\" r=\"16\"/><path d=\"m32 33 3.1 6.2 7 .9-5.1 5 .9 7-5.9-3.3-6 3.3 1.1-7-5.1-5 7-.9Z\"/></svg>"};
const rewards=[
 {id:'xp',icon:'xp',title:'1 000 XP',tag:'BOOST D’EXPÉRIENCE',price:'3 000',description:'Échange tes pièces contre 1 000 XP supplémentaires pour progresser dans les niveaux du serveur Ma_JesTik.'},
 {id:'vip',icon:'crown',title:'VIP Twitch & Discord',price:'8 000',description:'Profite du statut VIP sur Twitch et du rôle VIP sur Discord pendant 30 jours.',condition:'Attribution manuelle après vérification du pseudo Twitch.'},
 {id:'jeu',icon:'gamepad',title:'Choisis mon prochain jeu',badge:'EXCLUSIF',price:'20 000',description:'Choisis une aventure que je découvrirai en stream, parmi les jeux disponibles sur Instant Gaming.',condition:'Budget maximal de 10 € ; choix soumis à validation.'},
 {id:'vbucks',icon:'vbucks',title:'1 000 V-Bucks Fortnite',badge:'STOCK LIMITÉ',price:'30 000',description:'Obtiens l’équivalent de 1 000 V-Bucks Fortnite avec une carte cadeau compatible avec ta plateforme et ta région.',condition:'Remise manuelle selon disponibilité et budget de la boutique.'},
 {id:'pass',icon:'medal',title:'Passe de combat Fortnite',badge:'RÉCOMPENSE SPÉCIALE',price:'32 200',description:'Reçois le Passe de combat de la saison Fortnite en cours selon les conditions de cadeau d’Epic Games.',condition:'Compte éligible, A2F activée, amitié Epic depuis 48 h minimum, niveau 2 minimum et passe non possédé.'}
];
function rewardCard(reward){
 return '<article class="mj-shop-card mj-shop-card-'+reward.id+'" data-shop-reward="'+reward.id+'" aria-label="'+reward.title+'">'+
 (reward.badge?'<div class="mj-shop-card-badge">'+reward.badge+'</div>':'')+
 '<div class="mj-shop-card-icon" aria-hidden="true">'+icons[reward.icon]+'</div>'+
 '<h3>'+reward.title+'</h3>'+
 (reward.tag?'<span class="mj-shop-card-tag">'+reward.tag+'</span>':'')+
 '<p class="mj-shop-card-description">'+reward.description+'</p>'+
 (reward.condition?'<p class="mj-shop-card-condition">'+reward.condition+'</p>':'')+
 '<div class="mj-shop-card-price"><span class="mj-shop-price-symbol" aria-hidden="true">◉</span>'+reward.price+' <span>pièces</span></div>'+
 '<button class="mj-shop-card-open" type="button" aria-haspopup="dialog" aria-label="Voir les détails de '+reward.title+'">VOIR LA RÉCOMPENSE</button></article>';
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
 '<dialog id="mjShopDialog" class="mj-shop-dialog" aria-labelledby="mjShopDialogTitle" aria-describedby="mjShopDialogDesc"></dialog>'+
 '</div>';
}


/* Fenêtres natives dans le même esprit que le setup interactif.
   Pas de paiement ou de solde simulé : la commande reste sur Discord. */
const rewardDetails={
 xp:{category:'PROGRESSION DISCORD',type:'Boost d’expérience',delivery:'Crédit de 1 000 XP sur Discord',availability:'Selon les règles de la boutique',note:'Les XP augmentent la progression sur le serveur, pas le niveau dans Fortnite.'},
 vip:{category:'AVANTAGES COMMUNAUTAIRES',type:'Statut VIP',delivery:'Attribution manuelle après vérification',availability:'30 jours',note:'Le rôle VIP Discord et le badge VIP Twitch sont attribués après vérification du pseudo et de la disponibilité.'},
 jeu:{category:'RÉCOMPENSE EXCLUSIVE',type:'Choix d’un jeu en stream',delivery:'Validation puis contact sur Discord',availability:'Quantité limitée selon la boutique',note:'Jeu disponible sur Instant Gaming, dans la limite de 10 €. Le choix doit être accepté avant achat.'},
 vbucks:{category:'RÉCOMPENSE FORTNITE',type:'Carte cadeau Fortnite compatible',delivery:'Remise manuelle via Discord',availability:'Sous réserve de disponibilité',note:'Vérification de la plateforme, de la région et du budget avant remise. Aucun V-Buck n’est envoyé directement par le site.'},
 pass:{category:'RÉCOMPENSE FORTNITE',type:'Cadeau en jeu selon les règles Epic',delivery:'Remise organisée sur Discord',availability:'Selon les conditions et périodes de cadeau',note:'Conditions indiquées dans la boutique : A2F activée, amitié Epic depuis au moins 48 h, compte niveau 2 minimum, passe non déjà possédé, solde V-Bucks non négatif et période de cadeau autorisée.'}
};
function fallbackVisualMarkup(reward){
 if(reward.id==='vbucks')return '<svg class="mj-shop-vbucks-art" viewBox="0 0 460 460" role="img" aria-label="Illustration stylisée de jetons V-Bucks Fortnite" xmlns="http://www.w3.org/2000/svg">'+
 '<defs><radialGradient id="mjCoinBg"><stop stop-color="#27516b" stop-opacity=".78"/><stop offset="1" stop-color="#10141a" stop-opacity="0"/></radialGradient><linearGradient id="mjCoinMetal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a8e7fb"/><stop offset=".43" stop-color="#4e9cbd"/><stop offset="1" stop-color="#1e3e60"/></linearGradient><linearGradient id="mjCoinEdge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e1f4f8"/><stop offset=".48" stop-color="#6aafcb"/><stop offset="1" stop-color="#254668"/></linearGradient></defs>'+
 '<ellipse cx="230" cy="225" rx="192" ry="177" fill="url(#mjCoinBg)"/>'+
 '<g opacity=".9"><ellipse cx="120" cy="334" rx="79" ry="19" fill="#163a52" stroke="#6599b5" stroke-width="6"/><path d="M41 305v27c0 25 158 25 158 0v-27" fill="#214f6c" stroke="#7fb9d1" stroke-width="5"/><ellipse cx="120" cy="304" rx="79" ry="21" fill="url(#mjCoinMetal)" stroke="#bde8f8" stroke-width="6"/><ellipse cx="341" cy="339" rx="76" ry="18" fill="#183e58" stroke="#6fa6c2" stroke-width="6"/><path d="M265 305v34c0 25 152 25 152 0v-34" fill="#1e4e6c" stroke="#74aac4" stroke-width="5"/><ellipse cx="341" cy="304" rx="76" ry="22" fill="url(#mjCoinMetal)" stroke="#b4dff0" stroke-width="6"/></g>'+
 '<g transform="translate(234 206) rotate(-14)"><circle r="126" fill="#244f70" stroke="#88c3db" stroke-width="12"/><circle r="107" fill="url(#mjCoinMetal)" stroke="url(#mjCoinEdge)" stroke-width="12"/><circle r="83" fill="#173f5c" stroke="#a0daf1" stroke-width="5"/><path d="M-60-45-15 67H15L60-45H26L0 24-27-45Z" fill="#cceaf4" stroke="#f4fdff" stroke-width="3" stroke-linejoin="round"/><path d="M-12-70H14" stroke="#bbdbe8" stroke-width="5" stroke-linecap="round"/></g>'+
 '</svg>';
 return '<div class="mj-shop-modal-emblem mj-shop-modal-emblem-'+reward.id+'" aria-hidden="true">'+icons[reward.icon]+'</div>'+
 '<span class="mj-shop-modal-visual-caption">'+reward.title+'</span>';
}
/* Photos et logos fournis par l'organisateur le 11/11/2026.
   Les PNG sont à déposer dans dist/qg/media/ ; une illustration existante sert de repli tant qu'ils sont absents. */
const rewardImages={
 xp:{src:'/qg/media/6178-xp-blue-large.png',alt:'Icône bleue du boost de 1 000 XP'},
 vip:{src:'/qg/media/75527-twitch-vip.png',alt:'Logo violet du statut VIP Twitch'},
 jeu:{src:'/qg/media/Instant-gaming.pnj.png',alt:'Logo orange Instant Gaming'},
 vbucks:{src:'/qg/media/372757-vbucksstack.png',alt:'Pile de jetons V-Bucks Fortnite'},
 pass:{src:'/qg/media/2673-battlepass.png',alt:'Écusson doré du Passe de combat Fortnite'}
};
function visualMarkup(reward){
 const image=rewardImages[reward.id];
 return '<img class="mj-shop-modal-owned-image" src="'+image.src+'" alt="'+image.alt+'" width="320" height="320" decoding="async">'+
  '<div class="mj-shop-modal-fallback" hidden>'+fallbackVisualMarkup(reward)+'</div>';
}
function modalMarkup(reward){
 const details=rewardDetails[reward.id];
 return '<div class="mj-shop-modal-window">'+
 '<button type="button" class="mj-shop-modal-close" aria-label="Fermer la fiche de récompense">×</button>'+
 '<div class="mj-shop-modal-grid">'+
 '<div class="mj-shop-modal-figure"><div class="mj-shop-modal-art mj-shop-modal-art-'+reward.id+'">'+visualMarkup(reward)+'</div><p class="mj-shop-modal-art-note">Visuel illustratif · Récompense à commander sur Discord</p></div>'+
 '<div class="mj-shop-modal-content">'+
 '<span class="mj-shop-modal-eyebrow">'+details.category+'</span>'+
 '<h2 id="mjShopDialogTitle">'+reward.title+'</h2>'+
 '<p id="mjShopDialogDesc">'+reward.description+'</p>'+
 '<dl class="mj-shop-modal-facts">'+
 '<div><dt>Prix</dt><dd>'+reward.price+' pièces</dd></div>'+
 '<div><dt>Type</dt><dd>'+details.type+'</dd></div>'+
 '<div><dt>Remise</dt><dd>'+details.delivery+'</dd></div>'+
 '<div><dt>Disponibilité</dt><dd>'+details.availability+'</dd></div>'+
 '</dl>'+
 (reward.condition?'<p class="mj-shop-modal-condition">'+reward.condition+'</p>':'')+
 '<p class="mj-shop-modal-notice">'+details.note+'</p>'+
 '<a class="mj-shop-modal-order" href="'+orderUrl+'" target="_blank" rel="noopener noreferrer">COMMANDER SUR DISCORD</a>'+
 '<p class="mj-shop-modal-disclaimer">Achats, pièces et stocks gérés exclusivement par DraftBot dans le salon #commande-boutique. Ce bouton n’effectue aucun achat automatique.</p>'+
 '</div></div></div>';
}
let boutiqueCleanup=null;
export function unmountBoutique(){
 if(boutiqueCleanup){boutiqueCleanup();boutiqueCleanup=null;}
}
export function mountBoutique(){
 unmountBoutique();
 const root=document.querySelector('.mj-shop');
 const dialog=document.getElementById('mjShopDialog');
 if(!root||!dialog||typeof dialog.showModal!=='function')return;
 let trigger=null;
 const close=()=>{if(dialog.open)dialog.close();};
 const onClick=e=>{
  const card=e.target.closest('.mj-shop-card[data-shop-reward]');
  if(!card||!root.contains(card)||dialog.open)return;
  const reward=rewards.find(r=>r.id===card.dataset.shopReward);
  if(!reward)return;
  trigger=card.querySelector('.mj-shop-card-open');
  dialog.innerHTML=modalMarkup(reward);
  const ownedImage=dialog.querySelector('.mj-shop-modal-owned-image');
  const visualFallback=dialog.querySelector('.mj-shop-modal-fallback');
  if(ownedImage&&visualFallback){
   const showFallback=()=>{ownedImage.hidden=true;visualFallback.hidden=false;};
   ownedImage.addEventListener('error',showFallback,{once:true});
   if(ownedImage.complete&&!ownedImage.naturalWidth)showFallback();
  }
  dialog.querySelector('.mj-shop-modal-close')?.addEventListener('click',close);
  dialog.showModal();
  dialog.querySelector('.mj-shop-modal-close')?.focus();
 };
 const onBackdrop=e=>{if(e.target===dialog)close();};
 const onClose=()=>{if(trigger?.isConnected)trigger.focus();};
 root.addEventListener('click',onClick);
 dialog.addEventListener('click',onBackdrop);
 dialog.addEventListener('close',onClose);
 boutiqueCleanup=()=>{
  close();
  root.removeEventListener('click',onClick);
  dialog.removeEventListener('click',onBackdrop);
  dialog.removeEventListener('close',onClose);
  dialog.replaceChildren();
 };
}
