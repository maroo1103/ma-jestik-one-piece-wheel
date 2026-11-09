// Ma_JesTik — contact direct par e-mail, sans collecte de message sur le site.
const ADDRESS='contact@ma-jestik.fr';
const SUBJECT=encodeURIComponent('Contact depuis ma-jestik.fr');
export function contactMarkup(){
 return '<section class="mj-contact" aria-labelledby="mjContactTitle">'+
  '<div class="mj-contact-hero">'+
   '<span class="mj-contact-kicker">MA_JESTIK / CONTACT</span>'+
   '<h1 id="mjContactTitle">ON GARDE <em>LE CONTACT.</em></h1>'+
   '<p class="mj-contact-lead">Une question sur le QG, une suggestion, un problème technique ou une proposition de collaboration ? Tu peux me joindre directement à mon adresse officielle.</p>'+
   '<div class="mj-contact-feature">'+
    '<span class="mj-contact-label">ADRESSE E-MAIL OFFICIELLE</span>'+
    '<a class="mj-contact-address" href="mailto:'+ADDRESS+'">'+ADDRESS+'</a>'+
    '<p>Une adresse dédiée au site Ma_JesTik. Aucun compte Twitch ni formulaire à remplir.</p>'+
    '<div class="mj-contact-actions">'+
      '<a class="mj-contact-send" href="mailto:'+ADDRESS+'?subject='+SUBJECT+'">ÉCRIRE UN E-MAIL <span aria-hidden="true">&nbsp;↗</span></a>'+
      '<button type="button" class="mj-contact-copy" id="mjContactCopy">COPIER L’ADRESSE</button>'+
    '</div>'+
    '<span class="mj-contact-feedback" id="mjContactFeedback" role="status" aria-live="polite"></span>'+
   '</div>'+
  '</div>'+
  '<div class="mj-contact-cases" aria-label="Pourquoi me contacter ?">'+
   '<article class="mj-contact-case"><span class="mj-contact-case-index">01 / SUPPORT</span><h2>UN PROBLÈME SUR LE SITE ?</h2><p>Un affichage incorrect, une fonctionnalité qui ne répond pas ou un bug à signaler : indique la page et ce qui ne fonctionne pas.</p></article>'+
   '<article class="mj-contact-case"><span class="mj-contact-case-index">02 / IDÉES</span><h2>UNE SUGGESTION ?</h2><p>Une amélioration pour la roue, les défis ou les outils communautaires ? Tes propositions sont les bienvenues.</p></article>'+
   '<article class="mj-contact-case"><span class="mj-contact-case-index">03 / COLLABORATIONS</span><h2>UNE PROPOSITION ?</h2><p>Pour une demande de collaboration, un partenariat ou toute question liée au projet Ma_JesTik, écris-moi à cette adresse.</p></article>'+
  '</div>'+
  '<p class="mj-contact-note"><span aria-hidden="true">✦</span><span><strong>À savoir :</strong> le bouton « Écrire un e-mail » ouvre ton application de messagerie. Le message est envoyé depuis ta boîte mail, et non depuis le site. Aucune information personnelle sur l’éditeur du site n’est affichée ici.</span></p>'+
 '</section>';
}
export function mountContact(){
 const button=document.getElementById('mjContactCopy');
 const feedback=document.getElementById('mjContactFeedback');
 if(!button||!feedback)return;
 button.addEventListener('click',async()=>{
  if(!navigator.clipboard?.writeText){
   feedback.textContent='Copie l’adresse affichée ci-dessus : '+ADDRESS;
   return;
  }
  try{
   await navigator.clipboard.writeText(ADDRESS);
   feedback.textContent='Adresse copiée : '+ADDRESS;
  }catch{
   feedback.textContent='La copie automatique est bloquée. Sélectionne l’adresse affichée ci-dessus.';
  }
 });
}
