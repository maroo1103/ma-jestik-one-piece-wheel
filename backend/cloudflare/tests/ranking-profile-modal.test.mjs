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
