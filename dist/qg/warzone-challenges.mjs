/* Ma_JesTik — 300 défis Warzone, statiques et sans donnée personnelle.
   20 Solo + 20 Duo + 20 Trio + 20 Quatuor + 20 Spéciaux par carte.
   La sélection des POI correspond exactement aux trois roues officielles. */
export const WARZONE_CHALLENGE_GAMES=Object.freeze({
  "warzone-hajin": {
    "label": "Warzone · Hajin · Battle Royale",
    "short": "HAJIN · BATTLE ROYALE",
    "map": "Hajin",
    "a": "Chang-san Air Base",
    "b": "Deadtown",
    "c": "Mirae General Hospital",
    "d": "Songdo Wharf",
    "e": "Wolves Stadium",
    "f": "Imjin Farmland",
    "g": "Haneul Nuclear Reactor",
    "h": "NuriGo Mall",
    "i": "Cheonwang Peak Array",
    "kills": 5,
    "teamKills": 9,
    "rank": "Top 10",
    "top": "Top 5",
    "final": "Top 3"
  },
  "warzone-zodiac": {
    "label": "Warzone · Zodiac · Résurgence",
    "short": "ZODIAC · RÉSURGENCE",
    "map": "Zodiac",
    "a": "Admin",
    "b": "Trackline",
    "c": "Furnace",
    "d": "Solar",
    "e": "Old Mines",
    "f": "Dispatch",
    "g": "Depot",
    "h": "Sentinel",
    "i": "Cooling",
    "kills": 4,
    "teamKills": 7,
    "rank": "Top 5",
    "top": "Top 3",
    "final": "Top 2"
  },
  "warzone-rebirth": {
    "label": "Warzone · Rebirth Island · Résurgence",
    "short": "REBIRTH ISLAND · RÉSURGENCE",
    "map": "Rebirth Island",
    "a": "Bioweapons",
    "b": "Prison",
    "c": "Control Center",
    "d": "Harbor",
    "e": "Stronghold",
    "f": "Living Quarters",
    "g": "Chemical Engineering",
    "h": "Headquarters",
    "i": "Turbine",
    "kills": 4,
    "teamKills": 8,
    "rank": "Top 5",
    "top": "Top 3",
    "final": "Top 2"
  }
});
const TEMPLATES={
  "solo": "L'atterrissage brûlant|Atterris à {a} et réalise une élimination avant de quitter le secteur.|Moyen|Combat\nUne seule arme|Termine dans le {rank} en conservant une seule arme sur toi à la fois.|Difficile|Stratégie\nChasseur des premières minutes|Réalise 2 éliminations dans les 4 premières minutes de la partie.|Difficile|Combat\nContrat solitaire|Termine un contrat sans l'aide d'un coéquipier puis atteins le {rank}.|Moyen|Stratégie\nLe fantôme de {b}|Atteins le {top} après avoir atterri à {b}, avec zéro élimination.|Difficile|Survie\nPistolet de secours|Réalise une élimination au pistolet, puis une deuxième avec une autre catégorie d'arme.|Moyen|Combat\nLe collectionneur prudent|Atteins le {rank} avec au moins trois catégories d'armes différentes utilisées au cours de la partie.|Moyen|Stratégie\nArmure sous pression|Survis à deux affrontements distincts sans remettre de plaques entre eux.|Difficile|Survie\nEscapade à {c}|Atterris à {c}, ouvre au moins trois caches de ravitaillement et atteins le {rank}.|Moyen|Stratégie\nLe premier chargeur|Élimine un adversaire sans recharger ton arme pendant l'affrontement.|Facile|Combat\nSurvivant du gaz|Atteins le {top} sans subir le moindre dégât du gaz.|Moyen|Survie\nSans station d'achat|Atteins le {rank} sans effectuer d'achat à une station de ravitaillement.|Moyen|Stratégie\nLe duel à courte portée|Réalise deux éliminations à courte distance pendant la même partie.|Moyen|Combat\nLe grand détour|Passe par {d} puis {e} au cours d'une même partie et atteins le {rank}.|Difficile|Stratégie\nLa discrétion récompensée|Atteins le {final} sans effectuer plus de deux éliminations.|Difficile|Survie\nSans véhicule|Atteins le {rank} sans utiliser aucun véhicule.|Facile|Survie\nMaîtrise du recul|Réalise trois éliminations avec la même arme au cours de la partie.|Difficile|Combat\nLa dernière plaque|Atteins le {rank} sans acheter de plaques d'armure.|Moyen|Survie\nDeux armes, deux victimes|Élimine deux adversaires avec deux catégories d'armes différentes.|Moyen|Combat\nLe survivant de {f}|Atterris à {f} et termine dans le {top} sans changer de secteur avant le premier rétrécissement.|Difficile|Survie",
  "duo": "L'assaut jumelé|Atterrissez ensemble à {a} et réalisez chacun une élimination avant de quitter la zone.|Moyen\nUn binôme, deux styles|Chacun réalise une élimination avec une catégorie d'arme différente.|Facile\nLes deux survivants|Atteignez le {top} avec les deux joueurs encore en vie.|Difficile\nCouverture rapprochée|Un joueur réanime l'autre, puis le duo réalise encore deux éliminations cumulées.|Moyen\nDouble contrat|Terminez deux contrats dans la même partie en restant dans la même équipe.|Moyen\nLe pacte des pistolets|Chacun réalise une élimination avec un pistolet pendant la même partie.|Difficile\nLe relais de {b}|Atterrissez à {b}, puis chacun réalise une élimination après avoir quitté le secteur.|Moyen\nSans passage en boutique|Atteignez le {rank} sans qu'aucun membre du duo fasse d'achat.|Difficile\nGarde du corps|Désignez un VIP : l'autre joueur doit le protéger jusqu'au {rank}, sans que le VIP soit mis à terre.|Difficile\nRavitaillement partagé|Ouvrez chacun trois caches de ravitaillement et atteignez le {rank}.|Facile\nUn chargeur chacun|Chacun réalise une élimination sans recharger pendant son propre affrontement.|Moyen\nDeux angles d'attaque|Éliminez deux adversaires différents à moins de 30 secondes d'intervalle, un par joueur.|Difficile\nEscorte de {c}|Partez de {c} et atteignez le {top} sans utiliser de véhicule.|Difficile\nAucun abandon|Atteignez le {rank} sans laisser un coéquipier à terre plus de 20 secondes lorsqu'une réanimation est possible.|Moyen\nLe duo du gaz|Atteignez le {rank} sans subir de dégâts du gaz, tous les deux.|Difficile\nChacun sa spécialité|L'un obtient deux éliminations à distance ; l'autre deux éliminations à courte portée.|Difficile\nUn sac, deux missions|Un joueur ne porte jamais plus d'une arme ; l'autre doit réaliser au moins trois éliminations.|Difficile\nLe retour du binôme|Après l'élimination d'un joueur de l'équipe, retrouvez-vous tous les deux en vie et atteignez le {rank}.|Moyen\nPillage à {d}|Chacun ouvre au moins deux caches de ravitaillement à {d}.|Facile\nLe duo victorieux|Remportez une partie avec les deux joueurs encore en vie.|Difficile",
  "trio": "Trois têtes, trois éliminations|Chaque membre réalise au moins une élimination au cours de la même partie.|Facile\nDéploiement à {a}|Atterrissez tous les trois à {a} et obtenez trois éliminations cumulées sur place.|Moyen\nLe trio sans boutique|Atteignez le {rank} sans effectuer le moindre achat en équipe.|Moyen\nSecours en chaîne|Deux membres différents du trio doivent chacun réaliser une réanimation.|Moyen\nDeux chasseurs, un VIP|Désignez un VIP sans élimination : les deux autres réalisent chacun deux éliminations et le VIP atteint le {rank}.|Difficile\nLes trois arsenaux|Chaque joueur réalise une élimination avec une catégorie d'arme différente de celles des autres.|Difficile\nLe cercle de {b}|Commencez à {b} et terminez dans le {top} avec les trois joueurs en vie.|Difficile\nNeuf plaques, zéro achat|Atteignez le {rank} sans acheter de plaques d'armure, avec les trois joueurs en vie.|Difficile\nTrois contrats tactiques|Terminez trois contrats distincts durant la même partie et atteignez le {rank}.|Moyen\nLe triangle défensif|Atteignez le {top} sans qu'aucun des trois ne soit mis à terre pendant les deux derniers rétrécissements.|Difficile\nUn pistolet par soldat|Chaque joueur réalise une élimination au pistolet avant le troisième rétrécissement.|Difficile\nAucune voiture|Atteignez le {rank} sans qu'aucun membre du trio utilise un véhicule.|Facile\nRavitaillement coordonné|Chacun ouvre au moins trois caches de ravitaillement dans la même partie.|Facile\nExtraction de {c}|Quittez {c} tous les trois en vie et remportez au moins quatre éliminations cumulées ensuite.|Moyen\nTrois rôles tactiques|Désignez un éclaireur, un soutien et un assaillant : chacun réalise une élimination sans changer de rôle.|Moyen\nLe dernier survivant|Si deux joueurs sont mis à terre, le troisième doit survivre assez longtemps pour qu'ils soient tous réanimés.|Difficile\nL'assaut synchronisé|Les trois premières éliminations de l'équipe doivent être réalisées par trois joueurs différents.|Difficile\nL'équipe intouchable|Atteignez le {rank} sans subir de dégâts du gaz, pour les trois joueurs.|Difficile\nSix au compteur|Réalisez au moins six éliminations cumulées et terminez dans le {top}.|Difficile\nTrio des champions|Remportez une partie avec les trois joueurs encore en vie.|Difficile",
  "quatuor": "Quatre soldats, quatre victimes|Chaque joueur réalise au moins une élimination dans la même partie.|Moyen\nLe grand débarquement à {a}|Atterrissez ensemble à {a} et réalisez au moins quatre éliminations cumulées avant de partir.|Difficile\nEscouade complète|Atteignez le {top} avec les quatre joueurs encore en vie.|Difficile\nLe chef intouchable|Désignez un capitaine : il ne doit jamais être mis à terre avant le {rank}.|Difficile\nLe mur de soutien|Trois joueurs différents réalisent chacun une réanimation pendant la partie.|Difficile\nPillards organisés|Chaque joueur ouvre au moins deux caches de ravitaillement dans la même partie.|Facile\nDeux duos de choc|Formez deux binômes : chacun doit obtenir au moins trois éliminations cumulées.|Difficile\nLa prise de {b}|Tout le quatuor atterrit à {b}, puis quitte le lieu avec quatre joueurs en vie.|Moyen\nAchat interdit|Atteignez le {rank} sans qu'aucun membre de l'équipe achète quoi que ce soit.|Moyen\nQuatre classes distinctes|Chaque joueur doit obtenir une élimination avec une catégorie d'arme différente.|Difficile\nLa chaîne de munitions|Chaque joueur donne une partie de ses munitions à un autre membre avant le deuxième rétrécissement.|Facile\nZéro véhicule|Atteignez le {rank} sans qu'aucun joueur utilise un véhicule.|Moyen\nDouze caches|Ouvrez au moins douze caches de ravitaillement au total et atteignez le {rank}.|Moyen\nL'offensive à {c}|Réalisez deux éliminations à {c}, puis deux autres à un lieu différent, avec au moins trois joueurs impliqués.|Difficile\nQuatre vies précieuses|Atteignez le {top} sans perdre un joueur pendant les deux derniers rétrécissements.|Difficile\nUne arme par personne|Chaque joueur conserve au maximum une arme dans son inventaire et l'équipe atteint le {rank}.|Difficile\nEscorte croisée|Désignez deux VIP : les deux autres joueurs réalisent chacun deux éliminations et tous les VIP survivent jusqu'au {rank}.|Difficile\nRavitaillement solidaire|Avant d'entrer dans le {top}, chacun donne au moins une plaque d'armure à un autre membre.|Moyen\nLe commando silencieux|Ne tirez aucune balle pendant les deux premières minutes, puis réalisez {teamKills} éliminations cumulées.|Difficile\nQuatuor royal|Gagnez une partie avec les quatre membres de l'escouade encore en vie.|Difficile",
  "special": "La roulette des armes|Utilise seulement des armes trouvées au sol et atteins le {rank}.|Moyen|Stratégie\nL'audace de {a}|Atterris à {a}, ouvre au maximum trois caches de ravitaillement et atteins le {top}.|Difficile|Stratégie\nÉconomie de munitions|Réalise une élimination en tirant moins de quinze balles pendant l'affrontement.|Difficile|Combat\nDernière cartouche|Réalise une élimination avec la dernière balle de ton chargeur.|Difficile|Combat\nLe chirurgien|Réalise deux éliminations avec la même arme sans remettre de plaques d'armure entre les deux.|Difficile|Combat\nTouriste de {map}|Visite {e}, {f} et {g} dans la même partie, sans utiliser de véhicule.|Difficile|Stratégie\nLe coffre unique|Ouvre exactement une cache de ravitaillement et atteins le {rank}.|Difficile|Stratégie\nSang-froid|Réalise au moins {kills} éliminations et termine dans le {top}.|Difficile|Combat\nLe survivant muet|Atteins le {rank} sans tirer le moindre coup de feu durant les trois premières minutes.|Moyen|Survie\nUn saut, une mission|Après l'atterrissage initial, réussis une élimination avant d'entrer dans un deuxième lieu nommé.|Moyen|Combat\nGarder sa première arme|Conserve ta toute première arme jusqu'au {rank}, sans la remplacer.|Moyen|Stratégie\nSans rechargement d'armure|Atteins le {rank} sans remettre de plaques pendant les deux premières minutes.|Moyen|Survie\nL'ombre de {h}|Atterris à {h}, puis atteins le {top} sans utiliser d'équipement tactique.|Difficile|Survie\nChasseur de butin|Réalise une élimination avec une arme ramassée sur un adversaire éliminé.|Moyen|Combat\nLe grand silence|Atteins le {rank} avec deux éliminations maximum.|Difficile|Survie\nJuste une tentative|Lors de ta première partie de la session sur {map}, atteins le {top}.|Difficile|Survie\nTrois armes, trois styles|Réalise trois éliminations avec trois catégories d'armes différentes.|Difficile|Combat\nPas de raccourci|Atteins le {rank} sans utiliser de véhicule ni de tyrolienne.|Moyen|Stratégie\nLe pari de {i}|Atterris à {i} et termine dans le {top} sans utiliser de station d'achat.|Difficile|Stratégie\nTout pour la victoire|Gagne une partie sans utiliser de véhicule.|Difficile|Survie"
};
const GROUPS=[['solo',0,'solo'],['duo',20,'duo'],['trio',40,'trio'],['quatuor',60,'quatuor'],['special',80,'all']];
const format=(value,c)=>String(value).replace(/\{(a|b|c|d|e|f|g|h|i|kills|teamKills|rank|top|final|map)\}/g,(_,key)=>String(c[key]));
function buildCatalogue(id,settings){
 const catalogue=GROUPS.flatMap(([key,offset,team])=>{
  const lines=TEMPLATES[key].trim().split('\n').map(x=>x.trim()).filter(Boolean);
  if(lines.length!==20)throw Error(id+': '+key+' nécessite 20 défis.');
  return lines.map((line,index)=>{
   const [name,description,level,kind]=line.split('|');
   if(!name||!description||!['Facile','Moyen','Difficile'].includes(level))throw Error('Défi incomplet : '+key+' '+index);
   const category=kind||(team==='duo'?'Duo':team==='trio'?'Trio':'Quatuor');
   const mapped=[offset+index+1,format(name,settings),format(description,settings),level,category,team];
   if(mapped.some(x=>typeof x==='string'&&/\{[a-zA-Z]+\}/.test(x)))throw Error('Variable manquante '+name);
   return Object.freeze(mapped);
  });
 });
 if(catalogue.length!==100)throw Error('Catalogue incomplet : '+id);
 return Object.freeze(catalogue);
}
export const WARZONE_CHALLENGES=Object.freeze(Object.fromEntries(
 Object.entries(WARZONE_CHALLENGE_GAMES).map(([id,c])=>[id,buildCatalogue(id,c)])
));
