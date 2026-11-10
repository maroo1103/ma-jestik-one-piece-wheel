// Le footer remplace les anciens réseaux colorés de l'en-tête.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../../../dist/qg/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../../../dist/qg/footer-help.css',import.meta.url),'utf8');

test('Le header conserve Twitch OAuth mais plus les 4 icônes colorées',()=>{
 const header=html.split('</header>')[0];
 assert.doesNotMatch(header,/qg-social-links|qg-social-icon|qg-social-tiktok/);
 assert.match(header,/id="qgTwitchAccount"/);
});

test('Les 4 logos de réseaux sont des chemins SVG authentiques et monochromes dans le footer',()=>{
 const links=html.match(/<nav class="mj-footer-brand-networks"[\s\S]*?<\/nav>/);
 assert.ok(links,'nav réseaux du pied de page');
 assert.equal((links[0].match(/<a href=/g)||[]).length,4);
 assert.equal((links[0].match(/<svg viewBox="0 0 24 24"/g)||[]).length,4);
 assert.equal((links[0].match(/fill="currentColor"/g)||[]).length,4);
 for(const name of ['Twitch','Instagram','TikTok','Discord'])assert.match(links[0],new RegExp('title="'+name+'"'));
 assert.doesNotMatch(links[0],/#[0-9a-fA-F]{3,8}|<img|<use\b/);
 assert.match(css,/\.mj-footer-brand-networks a\{[\s\S]*?border:0;[\s\S]*?background:none;/);
 assert.match(css,/\.mj-footer-brand-networks svg\{[\s\S]*?fill:currentColor;/);
});

test('Réseaux ni répétés dans les colonnes desktop, ni dans les accordéons mobile',()=>{
 assert.doesNotMatch(html,/RÉSEAUX SOCIAUX|qg-social-links|aria-label="Réseaux officiels Ma_JesTik"/);
 for(const url of [
 'https://www.twitch.tv/Ma_Jestikk',
 'https://www.instagram.com/ma_jestikk/',
 'https://www.tiktok.com/@ma_jestikk',
 'https://discord.gg/nyuC5YE467'
 ])assert.equal(html.split('href="'+url+'"').length-1,1,url);
 assert.match(html,/href="#\/confidentialite"/);
 assert.match(html,/id="menuMobile"/);
 assert.match(css,/grid-template-columns:minmax\(235px,1\.65fr\) repeat\(3,minmax\(0,1fr\)\)/);
});
