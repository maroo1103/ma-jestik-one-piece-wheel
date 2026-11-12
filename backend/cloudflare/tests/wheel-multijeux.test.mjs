/* Roue multijeux : tests locaux sans réseau, D1 ni données d'utilisateurs. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {MAX_CHOICES,makeChoice,loadWheelLibrary,saveWheelLibrary,imageKey,wheelToPois,cleanNames,parseWheelImport,isOfficialWheel} from '../../../dist/wheel-library.mjs';
import {VERDANSK_POIS} from '../../../dist/warzone-verdansk.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../../..');
const source=p=>readFileSync(resolve(root,p),'utf8');
const store=new Map();
globalThis.localStorage={
  getItem:key=>store.get(key)??null,
  setItem:(key,value)=>store.set(key,String(value)),
  removeItem:key=>store.delete(key)
};
const baseline=Array.from({length:12},(_,i)=>({
  id:String(i+1).padStart(2,'0'),name:'Destination '+(i+1),originalImage:'assets/'+String(i+1).padStart(2,'0')+'.webp'
}));

test('migration des 12 lieux et historique Fortnite existants',()=>{
  store.clear();
  const lib=loadWheelLibrary(baseline,{selected:['01','03'],history:['03'],duration:'5'});
  assert.equal(lib.active,'fortnite');
  assert.equal(lib.wheels.length,3);
  assert.equal(lib.wheels[1].id,'warzone-hajin');
  assert.equal(lib.wheels[1].choices.length,13);
  assert.equal(lib.wheels[2].id,'warzone-zodiac');
  assert.equal(lib.wheels[2].choices.length,10);
  assert.equal(lib.wheels[0].choices.length,12);
  assert.deepEqual(lib.wheels[0].selected,['01','03']);
  assert.deepEqual(lib.wheels[0].history,['03']);
  assert.equal(lib.wheels[0].duration,'5');
  assert.equal(imageKey('fortnite','03'),'03');
  assert.equal(imageKey('warzone','03'),'warzone:03');
});
test('roues independantes, noms et images persistants localement',()=>{
  store.clear();
  const lib=loadWheelLibrary(baseline,{});
  const choice=makeChoice('Défi Warzone');
  assert.match(choice.id,/^c[a-z0-9]+$/);
  lib.wheels.push({id:'warzone',name:'Warzone',choices:[choice],selected:[choice.id],history:[],duration:'8'});
  lib.active='warzone';
  assert.equal(saveWheelLibrary(lib),true);
  const loaded=loadWheelLibrary(baseline,{});
  assert.equal(loaded.active,'warzone');
  assert.equal(loaded.wheels.find(w=>w.id==='warzone').choices[0].name,'Défi Warzone');
  assert.equal(loaded.wheels[0].choices.length,12);
  assert.equal(wheelToPois(loaded.wheels.find(w=>w.id==='warzone'))[0].image,'/icons/mj-source.webp');
});
test('remplacement en masse, sans doublons et maximum 60',()=>{
  assert.deepEqual(cleanNames('Contrat\nExfiltration\ncontrat\n'),['Contrat','Exfiltration']);
  assert.equal(cleanNames(Array.from({length:MAX_CHOICES},(_,i)=>'Choix '+i).join('\n')).length,MAX_CHOICES);
  assert.throws(()=>cleanNames(Array.from({length:MAX_CHOICES+1},(_,i)=>'Choix '+i).join('\n')));
});
test('import JSON validé, durée et sélections conservées',()=>{
  const data={format:'ma-jestik-wheel',version:2,name:'Warzone',duration:'12',selectedNames:['Top 5'],
    choices:[{name:'Top 5'},{name:'Pistolet',originalImage:'https://unknown.example/image.jpg'}]};
  const result=parseWheelImport(JSON.stringify(data));
  assert.equal(result.duration,'12');
  assert.deepEqual(result.selectedNames,['Top 5']);
  assert.equal(result.choices[1].originalImage,'/icons/mj-source.webp');
  assert.throws(()=>parseWheelImport(JSON.stringify({...data,version:99})));
  assert.throws(()=>parseWheelImport(JSON.stringify({...data,choices:[{name:'A'},{name:'A'}]})));
  assert.throws(()=>parseWheelImport(JSON.stringify({...data,choices:[{name:'A',image:'https://example.com/pic.png'}]})));
});
test('interfaces et scripts uniquement statiques, sans Worker mensuel',()=>{
  const html=source('dist/roue.html'),app=source('dist/app.js'),css=source('dist/wheel-multijeux.css');
  for(const id of ['wheelPreset','wheelNew','wheelClone','wheelRename','wheelDelete','wheelExport','wheelImport','wheelAdd','wheelNewChoice','wheelBulkReplace','wheelBulkNames','wheelNameDialog','wheelLibraryStatus'])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(app,/readImages\(\)/);
  assert.match(app,/saveImage\(imageKey\(currentWheelId,poi.id\)/);
  assert.match(app,/audio\/\$\{id\}\.mp3/);
  assert.doesNotMatch(app,/workers\.dev|\/v1\/monthly\//);
  assert.match(css,/body\.stream \.wheel-library-panel/);
});

test('panneau nettoye : pas de note redondante ni trait au-dessus de Ajouter un choix',()=>{
  const html=source('dist/roue.html'),css=source('dist/wheel-multijeux.css');
  assert.doesNotMatch(html,/class="wheel-local-note"/);
  assert.match(html,/id="wheelLibraryStatus"/);
  assert.match(css,/\.wheel-custom-editor\{[^}]*border:0\}/);
  assert.doesNotMatch(css,/\.wheel-custom-editor\{[^}]*border-top/);
});

test('modales iframe visibles, texte du jeu sans style de pastille, tout sélectionner cliquable',()=>{
  const app=source('dist/app.js'),css=source('dist/wheel-multijeux.css'),html=source('dist/roue.html');
  assert.match(app,/function showWheelDialog\(dialog\)/);
  assert.match(app,/host\.getBoundingClientRect\(\)/);
  assert.match(app,/parent\.innerHeight/);
  assert.match(app,/showWheelDialog\(\$\('wheelNameDialog'\)\)/);
  assert.match(app,/showWheelDialog\(\$\('imageDialog'\)\)/);
  assert.match(css,/\.wheel-iframe-dialog\{/);
  assert.match(css,/#wheelGameLabel\{/);
  assert.match(css,/background:none;color:var\(--gold\)/);
  assert.match(html,/<strong id="wheelGameLabel">/);
  assert.match(css,/\.intro \.eyebrow>#wheelGameLabel\{/);
  assert.match(css,/white-space:normal;overflow:visible;text-overflow:clip/);
  assert.match(css,/flex:0 0 100%;max-width:100%;font-size:9px/);
  assert.doesNotMatch(css,/\.intro \.eyebrow>#wheelGameLabel\{[^}]*text-overflow:ellipsis/s);
  assert.doesNotMatch(app,/\$\('selectAll'\)\.disabled\s*=\s*spinning\s*\|\|\s*count===POIS\.length/);
  assert.doesNotMatch(app,/\$\('selectAll'\)\.disabled\s*=\s*selected\.size===POIS\.length/);
  assert.match(app,/Tous les choix de cette roue sont déjà sélectionnés/);
});

test('migration additive Hajin : preserve la bibliotheque et un modele efface volontairement',()=>{
  store.clear();
  const earlier={active:'fortnite',wheels:[{
    id:'fortnite',name:'Roue Fortnite personnelle',choices:baseline,
    selected:['02'],history:['02'],duration:'12'
  }]};
  localStorage.setItem('ma-jestik-wheel-library-v2',JSON.stringify(earlier));
  const migrated=loadWheelLibrary(baseline,{});
  assert.equal(migrated.active,'fortnite');
  assert.equal(migrated.wheels[0].name,'Roue Fortnite personnelle');
  assert.deepEqual(migrated.wheels[0].selected,['02']);
  assert.deepEqual(migrated.wheels[0].history,['02']);
  assert.equal(migrated.wheels.find(w=>w.id==='warzone-hajin').choices.length,13);
  migrated.wheels=migrated.wheels.filter(w=>w.id!=='warzone-hajin');
  migrated.dismissedPresets=['warzone-hajin'];
  saveWheelLibrary(migrated);
  const afterDelete=loadWheelLibrary(baseline,{});
  assert.ok(!afterDelete.wheels.some(w=>w.id==='warzone-hajin'));
});
test('Hajin/Zodiac : modeles officiels et mini cartes locales adaptatives',()=>{
  const hajin=source('dist/warzone-hajin.mjs');
  const zodiac=source('dist/warzone-zodiac.mjs');
  const html=source('dist/roue.html');
  const app=source('dist/app.js');
  const map=source('dist/map.js');
  const css=source('dist/wheel-multijeux.css');
  for(const name of ['14th Political Prison','Chang-san Air Base','Deadtown','Imjin Farmland',
    'Cheongun Village','Haneul Nuclear Reactor','Mirae General Hospital','NuriGo Mall',
    'Cheonwang Peak Array','The Grid','Songdo Wharf','Wolves Stadium','Hajin River Heights'])
    assert.ok(hajin.includes(name),'POI Hajin manquant : '+name);
  for(const name of ['Admin','Trackline','Furnace','Solar','Old Mines','Dispatch',
    'Depot','Sentinel','Cooling','R&D'])
    assert.ok(zodiac.includes("'"+name+"'"),'POI Zodiac manquant : '+name);
  assert.match(hajin,/assets\/warzone\/hajin\/poi-/);
  assert.match(zodiac,/assets\/warzone\/zodiac\/poi-/);
  assert.match(html,/id="warzoneMapLaunch"/);
  assert.match(html,/id="warzoneMapOpen"/);
  assert.match(html,/id="warzoneMapPreview"/);
  assert.match(map,/hajin\/map-full\.png/);
  assert.match(map,/zodiac\/map-full\.png/);
  assert.match(map,/showWheelDialog\(dialog\)/);
  assert.match(css,/map-dialog\[data-warzone="true"\]/);
  assert.match(app,/warzoneAssetsReady/);
  assert.match(app,/assets\/warzone\//);
  assert.match(app,/manifest\.json/);
  assert.doesNotMatch(app,/updateHajinNotice/);
});
test('Migration de Hajin : remplacer les logos originaux sans toucher aux images locales ou aux sélections',()=>{
  store.clear();
  const original=loadWheelLibrary(baseline,{});
  const hajin=original.wheels.find(w=>w.id==='warzone-hajin');
  hajin.name='Warzone · Hajin (images à compléter)';
  hajin.choices.forEach(c=>c.originalImage='/icons/mj-source.webp');
  hajin.selected=['hj03'];
  hajin.history=['hj03'];
  hajin.choices[2].name='Mon défi personnalisé';
  saveWheelLibrary(original);
  const upgraded=loadWheelLibrary(baseline,{});
  const result=upgraded.wheels.find(w=>w.id==='warzone-hajin');
  assert.equal(result.name,'Warzone · Hajin · Battle Royale');
  assert.deepEqual(result.selected,['hj03']);
  assert.deepEqual(result.history,['hj03']);
  assert.match(result.choices[0].originalImage,/hajin\/poi-01\.webp$/);
  assert.equal(result.choices[2].originalImage,'/icons/mj-source.webp');
  assert.ok(upgraded.wheels.some(w=>w.id==='warzone-zodiac'));
});
test('Déploiement des images : ZIP optimisé ou ZIP original validé',()=>{
  const flow=source('.github/workflows/publier-roue.yml');
  const script=source('scripts/deploy-warzone-assets.py');
  assert.match(flow,/scripts\/deploy-warzone-assets\.py/);
  assert.match(script,/warzone-pack\.zip/);
  assert.match(script,/lieux-et-map\.zip/);
  assert.match(script,/hashlib\.sha256/);
  assert.match(script,/manifest\.json/);
  assert.match(script,/HAJIN/);
  assert.match(script,/ZODIAC/);
});

test('Les trois modeles officiels sont proteges ; les copies restent editables',()=>{
  assert.equal(isOfficialWheel('fortnite'),true);
  assert.equal(isOfficialWheel('warzone-hajin'),true);
  assert.equal(isOfficialWheel('warzone-zodiac'),true);
  assert.equal(isOfficialWheel('wabc123'),false);
  const app=source('dist/app.js'),css=source('dist/wheel-multijeux.css');
  assert.match(app,/wheel-official-locked/);
  assert.match(app,/wheelRename'\)\.disabled=spinning\|\|locked/);
  assert.match(app,/wheelDelete'\)\.disabled=spinning\|\|locked/);
  assert.match(app,/wheelBulkReplace'\)\.disabled=spinning\|\|locked/);
  assert.match(app,/if\(spinning\|\|isOfficialWheel\(currentWheelId\)\|\|POIS\.length>=MAX_CHOICES\)return/);
  assert.match(app,/if\(spinning\|\|\$\('imageDialog'\)\.open\|\|isOfficialWheel\(currentWheelId\)\)return/);
  assert.match(app,/if\(spinning\|\|!imageStoreReady\|\|isOfficialWheel\(currentWheelId\)\)return/);
  assert.match(app,/if\(spinning\|\|isOfficialWheel\(currentWheelId\)\|\|library\.wheels\.length<=1\)return/);
  assert.match(css,/body\.wheel-official-locked \.wheel-custom-editor/);
  assert.match(css,/body\.wheel-official-locked \.poi-card \.wheel-edit-actions/);
  assert.match(app,/statusMessage\('Roue dupliquée\. Tu peux la modifier sans toucher à l’originale\.'/);
  assert.match(app,/const choices=src\.choices\.map\(c=>\(\{\.\.\.c,id:makeId\('c'\)\}\)\)/);
});
test('Les noms longs Hajin tiennent dans des lignes courtes et restent lisibles',()=>{
  const app=source('dist/app.js'),hajin=source('dist/warzone-hajin.mjs');
  const block=app.match(/function compactWheelLines\([\s\S]*?(?=function drawWheel\(\))/)?.[0];
  assert.ok(block,'repartition des libelles sur la roue manquante');
  const wrap=new Function(block+'\nreturn compactWheelLines;')();
  for(const name of ['14th Political Prison','Haneul Nuclear Reactor','Mirae General Hospital',
    'Cheonwang Peak Array','Hajin River Heights','Chang-san Air Base','Wolves Stadium']){
    assert.ok(hajin.includes(name));
    const lines=wrap(name);
    assert.equal(lines.join(' '),name);
    assert.ok(lines.length<=3,'plus de trois lignes pour '+name);
    assert.ok(lines.every(line=>line.length<=11),'libellé trop long : '+name);
  }
  assert.deepEqual(wrap('14th Political Prison'),['14th','Political','Prison']);
  assert.match(app,/const compact=currentWheelId!=='fortnite'&&\(count>=10\|\|items\.some/);
  assert.match(app,/rotation=mid\*180\/Math\.PI\+90/);
  assert.match(app,/rotate\(180 0/); // ne pas afficher les libellés à l'envers
  assert.match(app,/rotate\(\$\{-rotation\} 0 -21\)/); // photos non renversées
});

test('Logo de La Roue : retour au QG sans charger le site dans iframe',()=>{
  const html=source('dist/roue.html');
  const qg=source('dist/qg/qg.js');
  assert.match(html,/<a class="brand" href="\/qg\/#\/accueil" target="_top" aria-label="Retour à l’accueil du QG Ma_JesTik">/);
  assert.doesNotMatch(html,/<a class="brand" href="\.\/" /);
  assert.match(qg,/class="wheel-embed"/);
});


test('Rebirth et Verdansk en préparation : invisibles tant que leurs images ne sont pas présentes',()=>{
  store.clear();
  const basic=loadWheelLibrary(baseline,{});
  assert.deepEqual(basic.wheels.map(w=>w.id),
    ['fortnite','warzone-hajin','warzone-zodiac']);
  assert.equal(isOfficialWheel('warzone-rebirth'),true);
  assert.equal(isOfficialWheel('warzone-verdansk'),true);
  const verdanskEarly=loadWheelLibrary(baseline,{},{verdansk:true});
  assert.equal(verdanskEarly.wheels.length,3,'Verdansk doit attendre Rebirth');
  const prepared=loadWheelLibrary(baseline,{}, {rebirth:true,verdansk:true});
  const rebirth=prepared.wheels.find(w=>w.id==='warzone-rebirth');
  const verdansk=prepared.wheels.find(w=>w.id==='warzone-verdansk');
  assert.ok(rebirth&&verdansk,'Modèles préparatoires disponibles après contrôle des visuels');
  assert.equal(rebirth.choices.length,13);
  assert.equal(verdansk.choices.length,21);
  assert.equal(rebirth.choices[0].name,'Bioweapons');
  assert.equal(rebirth.choices[4].name,'Turbine');
  assert.equal(rebirth.choices[11].name,'Outpost');
  assert.equal(verdansk.choices.at(-1).name,'Drone Labs');
  assert.deepEqual(prepared.wheels.map(w=>w.id),
    ['fortnite','warzone-hajin','warzone-zodiac','warzone-rebirth','warzone-verdansk']);
  assert.equal(rebirth.choices.at(-1).originalImage,'assets/warzone/rebirth/poi-13.webp');
  assert.equal(verdansk.choices.at(-1).originalImage,'assets/warzone/verdansk/poi-21.webp');
});

test('La migration danciens utilisateurs n ajoute aucun modèle avant la validation du lot',()=>{
  store.clear();
  const savedLibrary=loadWheelLibrary(baseline,{});
  savedLibrary.wheels[0].selected=['02'];
  savedLibrary.wheels[0].history=['02'];
  savedLibrary.active='warzone-zodiac';
  assert.equal(saveWheelLibrary(savedLibrary),true);
  const noPack=loadWheelLibrary(baseline,{});
  assert.equal(noPack.wheels.length,3);
  assert.equal(noPack.active,'warzone-zodiac');
  assert.deepEqual(noPack.wheels[0].selected,['02']);
  assert.deepEqual(noPack.wheels[0].history,['02']);
  const rebirthOnly=loadWheelLibrary(baseline,{},{rebirth:true});
  assert.equal(rebirthOnly.wheels.length,4);
  assert.equal(rebirthOnly.wheels.at(-1).id,'warzone-rebirth');
  assert.ok(!rebirthOnly.wheels.some(w=>w.id==='warzone-verdansk'));
  saveWheelLibrary(rebirthOnly);
  const reloaded=loadWheelLibrary(baseline,{},{rebirth:true});
  assert.equal(reloaded.wheels.length,4,'aucun doublon après actualisation');
  const another=loadWheelLibrary(baseline,{},{rebirth:true,verdansk:true});
  assert.equal(another.wheels.length,5);
  assert.equal(another.active,'warzone-zodiac');
});

test('Rebirth et Verdansk : noms vérifiés, cartes, activation par manifeste et ZIP sécurisé',()=>{
  const rb=source('dist/warzone-rebirth.mjs');
  const vd=source('dist/warzone-verdansk.mjs');
  const lib=source('dist/wheel-library.mjs');
  const app=source('dist/app.js');
  const map=source('dist/map.js');
  const importer=source('scripts/deploy-future-warzone-assets.py');
  const build=source('.github/workflows/publier-roue.yml');
  assert.match(rb,/New Point|POI|Turbine/);
  for(const poi of ['Bioweapons','Industries','Chemical Engineering','Turbine','Outpost','Stronghold'])
    assert.ok(rb.includes(poi), 'Rebirth manque '+poi);
  for(const poi of ['Dam','Military Base','Promenade East','Drone Labs'])
    assert.ok(vd.includes(poi),'Verdansk manque '+poi);
  assert.match(lib,/availablePresets\(readiness\)/);
  assert.match(lib,/WAITING_WARZONE_MODELS\.filter/);
  assert.match(app,/warzoneAssetGames/);
  assert.match(app,/warzoneModelHasAssets/);
  assert.match(map,/warzone-rebirth/);
  assert.match(map,/warzone-verdansk/);
  assert.match(map,/window\.warzoneAssetGames/);
  assert.match(importer,/rebirth-pack\.zip|f\"\{game\}-pack\.zip\"/);
  assert.match(importer,/map-preview\.webp/);
  assert.match(importer,/map-full\.png/);
  assert.match(importer,/sha256/);
  assert.match(importer,/if not available:/);
  assert.match(importer,/def archive_path\(game\):/);
  assert.match(importer,/Rebirth island\.zip/);
  assert.match(importer,/available = \[game for game in SOURCES if archive_path\(game\)\.exists\(\)\]/);
  assert.match(build,/python scripts\/deploy-future-warzone-assets\.py/);
  assert.match(build,/node --check dist\/warzone-rebirth\.mjs/);
  assert.match(build,/node --check dist\/warzone-verdansk\.mjs/);
});

// Les miniatures doivent rester visibles sur Verdansk (21 choix) et jusqu'à 25.
test("La Roue garde les miniatures jusqu'à 25 choix",()=>{
  const app=source('dist/app.js');
  assert.match(app,/if\(count>25\)\{/);
  assert.doesNotMatch(app,/if\(count>20\)\{/);
  assert.match(app,/group\.append\(svgElement\('image'/);
});

// Le raccourcissement est purement graphique : aucune modification des données officielles.
test('Verdansk : 21 libellés courts sans altérer les noms des résultats ou les autres roues',()=>{
  const app=source('dist/app.js');
  const helper=app.match(/const VERDANSK_WHEEL_LABELS=[\s\S]*?(?=function drawWheel\(\))/)?.[0];
  assert.ok(helper,'table des noms Verdansk manquante');
  const label=new Function(helper+'\nreturn verdanskWheelLabel;')();
  const renamed={
    'Military Base':'Military',
    'TV Station':'TV Sta.',
    'Storage Town':'Storage',
    'Train Station':'Train',
    'Promenade West':'Prom. W',
    'Promenade East':'Prom. E',
    'Drone Labs':'Drone Lab'
  };
  assert.equal(VERDANSK_POIS.length,21);
  for(const name of VERDANSK_POIS){
    assert.equal(label(name),renamed[name]||name);
    assert.ok(label(name).length<=10, 'libellé trop long : '+name);
  }
  assert.match(app,/const isVerdanskWheel=currentWheelId==='warzone-verdansk'/);
  assert.match(app,/const lines=isVerdanskWheel\?\[verdanskWheelLabel\(items\[i\]\.name\)\]/);
  assert.match(app,/isVerdanskWheel\?\(lines\[0\]\.length>9\?/);
  assert.match(app,/\$\('resultName'\)\.textContent=winner\.name/);
  assert.match(app,/name\.textContent=poi\.name/);
  assert.match(app,/const compact=currentWheelId!=='fortnite'/);
});
