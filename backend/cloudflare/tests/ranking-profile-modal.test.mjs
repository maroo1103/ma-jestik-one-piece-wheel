import {spawnSync} from 'node:child_process';
// Tests UI des profils du classement, sans navigateur ni données de production.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../../../dist/qg/'+path,import.meta.url),'utf8');

test('podium et tableau : seul le pseudo est un bouton accessible et associé au profil',()=>{
 const code=read('qg.js');
 assert.match(code,/const card=document\.createElement\('article'\)/);
 assert.match(code,/const person=document\.createElement\('span'\)/);
 assert.match(code,/const name=document\.createElement\(clickable\?'button':'strong'\)/);
 assert.match(code,/const name=document\.createElement\(clickable\?'button':'span'\)/);
 assert.match(code,/name\.dataset\.memberId=id/);
 assert.doesNotMatch(code,/card\.dataset\.memberId|person\.dataset\.memberId/);
 assert.match(code,/target\.textContent\?\.trim\(\)/);
 assert.match(code,/root\.addEventListener\('click'/);
 assert.match(code,/memberPreviewDialog\.showModal\(\)/);
 assert.match(code,/fetch\(voteApi\+'\/v1\/profiles\/'\+id/);
});

test('une fenêtre unique, accessible et fermable sans changer la page',()=>{
 const html=read('index.html'),code=read('qg.js'),css=read('profil.css');
 assert.match(html,/<dialog id="qgMemberDialog"[^>]+aria-modal="true"/);
 assert.match(html,/id="qgMemberDialogClose"/);
 assert.match(html,/id="qgMemberDialogContent" class="mp-page/);
 assert.match(code,/memberPreviewDialog\.addEventListener\('close'/);
 assert.match(code,/memberPreviewDialog\.addEventListener\('click'/);
 assert.match(code,/memberPreviewRequest\?\.abort\(\)/);
 assert.match(code,/function route\(\)\{\s*closeMemberPreview\(\)/);
 assert.match(css,/\.mj-member-dialog::backdrop/);
 assert.match(css,/@media\(max-width:680px\)/);
});

test('profil privé et profil public réutilisent le rendu du profil complet',()=>{
 const ui=read('qg.js'),profile=read('profil.js');
 assert.match(profile,/export function renderPublicMember\(root,data,id\)/);
 assert.match(profile,/export function renderPrivateMember\(root,withReturn=false\)/);
 assert.match(ui,/if\(res\.status===404\)\{renderPrivateMember\(memberPreviewBody\);return;\}/);
 assert.match(profile,/esc\(p\.bio/);
 assert.match(profile,/socials\(p,identity\.name/);
 assert.match(profile,/p\.games\.map\(g=>gameCard/);
 assert.match(profile,/\.mj-footer-brand-networks a\[title=/);
 assert.doesNotMatch(profile,/site-header \.qg-social-/);
});

test('Fenêtre plus compacte, dorée, sans cadre navigateur et responsive',()=>{
 const html=read('index.html'),css=read('ranking-profile-dialog.css');
 assert.match(html,/ranking-profile-dialog\.css\?v=20261110-modal[0-9]+/);
 assert.match(html,/qg\.js\?v=[a-zA-Z0-9_-]+/);
 assert.match(css,/dialog#qgMemberDialog\{/);
 assert.match(css,/width:min\(740px,calc\(100vw - 36px\)\) !important/);
 assert.match(css,/border:1px solid #b18b57 !important/);
 assert.match(css,/#qgMemberDialog #qgMemberDialogTitle/);
 assert.match(css,/@media\(max-width:630px\)/);
});

test('La carte de visibilité a disparu, mais les réglages privés restent disponibles dans la personnalisation',()=>{
 const profile=read('profil.js');
 assert.doesNotMatch(profile,/mp-panel mp-privacy|mpShareBtn|Copier le lien public/);
 assert.match(profile,/name="public_profile"/);
 assert.match(profile,/name="ranking_visible"/);
 assert.match(profile,/Rendre mon profil public/);
 assert.match(profile,/Afficher mon profil dans le classement/);
 assert.match(profile,/mpEditBtn/);
 assert.doesNotMatch(profile,/mpGamesEdit|\+ Personnaliser/);
});

test('Profil V3 : la bannière gaming respecte les choix du membre sans données fictives',()=>{
 const profile=read('profil.js'),css=read('profil.css'),html=read('index.html'),qg=read('qg.js');
 assert.match(profile,/function profileBanner\(p,identity,id,editable=false\)/);
 assert.match(profile,/const selected=isOwner\?null:/);
 assert.match(profile,/const image=selected\?cover\(selected\.id\):""/);
 assert.match(profile,/function profileGamesPanel\(p,cards,editable=false\)/);
 assert.match(profile,/mp-count-['"]?\+amount/);
 assert.match(css,/\.mp-profile-layout \.mp-count-1 \.mp-game-card/);
 assert.match(css,/\.mp-profile-layout \.mp-count-4/);
 assert.match(css,/@media\(max-width:680px\)/);
 assert.match(html,/profil\.css\?v=20261113-profil-flags1/);
 assert.match(qg,/profil\.js\?v=20261113-profil-flags1/);
 assert.doesNotMatch(profile,/Compte lié à Twitch :|mp-twitch-mark|Copier le lien public/);
 assert.match(profile,/statCard\("calendar","MEMBRE DEPUIS",joinedDate/);
 assert.match(profile,/name="public_profile"/);
 assert.match(profile,/name="ranking_visible"/);
});
test('Profil public V3 : informations privées non montrées sans accord de classement',()=>{
 const profile=read('profil.js');
 assert.match(profile,/data\.stats\.points!==null&&data\.stats\.rank!==null&&data\.stats\.votes!==null/);
 assert.match(profile,/visible\?profileStatsPanel\(data\.stats\):""/);
 assert.match(profile,/renderPrivateMember\(root,true\)/);
 assert.match(profile,/handleProfileArtErrors\(root\)/);
});

test('Les scripts de profil et du QG passent la vérification syntaxique Node',()=>{
 for(const path of ['profil.js','qg.js']){
  const script=new URL('../../../dist/qg/'+path,import.meta.url);
  const result=spawnSync(process.execPath,['--check',script.pathname],{encoding:'utf8',timeout:15000});
  assert.equal(result.status,0,path+' : '+(result.stderr||result.stdout||'échec syntaxique'));
 }
});

test('Profil V4 : suppression de tous les éléments encadrés sans perdre le formulaire',()=>{
 const code=read('profil.js'),css=read('profil.css');
 assert.doesNotMatch(code,/MON ESPACE COMMUNAUTAIRE|JEU PRINCIPAL<\/span>|MON UNIVERS|mp-about-facts|mp-section-divider|mp-stats-crown|mpGamesEdit|\+ Personnaliser/);
 assert.match(code,/function profileAbout\(p,links,visitor=false\)/);
 assert.match(code,/STATISTIQUES DU QG/);
 assert.match(code,/profileStatsPanel\(stats\)/);
 assert.match(code,/name="public_profile"/);
 assert.match(code,/name="ranking_visible"/);
 assert.match(code,/id="mpEditBtn"/);
 assert.match(code,/id="mpDeleteAccount"/);
 assert.match(css,/\.mp-social-title/);
});
test('La bannière exclusive ne dépend que de ownerId et ne touche pas aux autres profils',()=>{
 const code=read('profil.js'),css=read('profil.css');
 assert.match(code,/const isOwner=!!ownerId&&String\(id\|\|""\)===ownerId/);
 assert.match(code,/selected=isOwner\?null:/);
 assert.match(code,/\(isOwner\?' mp-owner-hero':''\)/);
 assert.match(css,/\.mp-banner\.mp-owner-hero \.mp-banner-visual/);
 assert.match(css,/banniere-ma-jestik-exclusive-2000x400\.webp/);
 assert.match(css,/@media\(max-width:680px\)/);
 assert.doesNotMatch(code,/Compte lié à Twitch :|mp-twitch-mark/);
});

test('V5 : bannière exacte de GitHub, sans couronne au-dessus de l’avatar',()=>{
 const css=read('profil.css'),js=read('profil.js');
 assert.match(css,/banniere-ma-jestik-exclusive-2000x400\.webp/);
 assert.doesNotMatch(css,/\.mp-banner\.mp-owner-hero \.mp-avatar:before/);
 assert.match(js,/const isOwner=!!ownerId&&String\(id\|\|""\)===ownerId/);
 assert.match(js,/const selected=isOwner\?null:/);
});
test('V5 : quatre statistiques avec étoile, trophée, barres et calendrier',()=>{
 const js=read('profil.js'),css=read('profil.css');
 for(const label of ['POINTS QG','CLASSEMENT','PRONOSTICS','MEMBRE DEPUIS'])assert.match(js,new RegExp('statCard\\([^\\n]*'+label));
 assert.match(js,/const joinedDate=/);
 assert.match(css,/repeat\(4,minmax\(0,1fr\)\)/);
});
test('V5 : région facultative, sans géolocalisation automatique',()=>{
 const js=read('profil.js');
 assert.match(js,/Région \/ pays \(facultatif\)/);
 assert.match(js,/name="region"/);
 assert.match(js,/region:e\.namedItem\("region"\)\.value/);
 assert.match(js,/p\.region&&regionLookup\.has\(p\.region\)/);
});

test('Drapeaux de pays SVG locaux : aucun emoji requis sur Windows',()=>{
 const js=read('profil.js'),css=read('profil.css');
 assert.match(js,/regionFlagImage\(p\.region\)/);
 assert.match(js,/id="mpRegionPreview"/);
 assert.match(js,/regionControl\.addEventListener\("change"/);
 assert.match(css,/\.mp-region-flag/);
 assert.doesNotMatch(js,/France 🇫🇷|Belgique 🇧🇪|Suisse 🇨🇭/);
 for(const code of ["fr","be","ch","ca","lu","mc","ma","dz","tn","sn","ci","de","es","it","gb","pt","us","other"]){
  const svg=read('media/flags/'+code+'.svg');
  assert.match(svg,/<svg/);
  assert.doesNotMatch(svg,/<script\b|<foreignObject\b|<image\b|href="https?:/i);
 }
 assert.match(read('media/flags/LICENSE-MIT.txt'),/The MIT License/);
});
