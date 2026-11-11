/* Roue multijeux : tests locaux sans réseau, D1 ni données d'utilisateurs. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {MAX_CHOICES,makeChoice,loadWheelLibrary,saveWheelLibrary,imageKey,wheelToPois,cleanNames,parseWheelImport} from '../../../dist/wheel-library.mjs';

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
  assert.equal(lib.wheels.length,2);
  assert.equal(lib.wheels[1].id,'warzone-hajin');
  assert.equal(lib.wheels[1].choices.length,13);
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
test('Hajin : noms du guide officiels et photos provisoires identifiees',()=>{
  const preset=source('dist/warzone-hajin.mjs');
  const html=source('dist/roue.html');
  const app=source('dist/app.js');
  for(const name of ['14th Political Prison','Chang-san Air Base','Deadtown','Imjin Farmland',
    'Cheongun Village','Haneul Nuclear Reactor','Mirae General Hospital','NuriGo Mall',
    'Cheonwang Peak Array','The Grid','Songdo Wharf','Wolves Stadium','Hajin River Heights'])
    assert.ok(preset.includes(name),'POI Hajin manquant : '+name);
  assert.match(html,/id="hajinMapLaunch"/);
  assert.match(html,/https:\/\/www\.callofduty\.com\/guides\/warzone\/hajin/);
  assert.match(app,/photos sont encore à intégrer/);
  assert.match(app,/Les logos MJ ne sont pas des captures du jeu/);
});
