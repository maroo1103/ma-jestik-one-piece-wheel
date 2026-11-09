/* Catalogue unique du setup Ma_JesTik. La photographie du setup reste originale ;
   les 24 images de fiche sont des rendus graphiques validés, pas des photos documentaires. */
export const ORIGINAL_SETUP_PHOTO="https://maroo1103.github.io/setup-ma-jestik/assets/setup-ma-jestikk.png";
/* Les 24 visuels WebP sans perte 1254 × 1254 sont distribués dans
   photos-ma-jestik-premium-sans-perte.zip. Emplacements temporaires tant
   que les fichiers ne sont pas placés sous images/products/. */
const productPhoto=(id,name)=>({
 kind:"owned-webp",
 src:"./images/products/"+id+".webp",
 alt:"Rendu de présentation du produit "+name,
 credit:"Visuel graphique premium · fond graphite · WebP sans perte"
});
export const HOTSPOT_IDS=Object.freeze(["ps5","ps5-pad","scuf","webcam","screen-main","screen-second","monitor-arm","micro","headphones","keyboard","mouse","pc-tower","chair"]);
export const PC_COMPONENT_IDS=Object.freeze(["case","cpu","motherboard","gpu","ram","ssd","psu","aio","front-fans","rear-fan","bottom-fans"]);
export const MATERIAL=Object.freeze({
 "ps5":{
  category:"CONSOLE",name:"PlayStation 5",
  specs:[["Plateforme","Sony PlayStation 5"],["Type","Console de salon"],["Utilisation","Jeux sur console"]],
  description:"Ma console pour profiter des exclusivités PlayStation et jouer en dehors du PC.",
  image:productPhoto("ps5","PlayStation 5")
 },
 "ps5-pad":{
  category:"MANETTE CONSOLE",name:"Manette PS5 blanche",
  specs:[["Compatibilité","PlayStation 5"],["Couleur","Blanc"],["Usage","Jeux sur console"]],
  description:"La manette blanche présente à côté de la console dans mon installation.",
  image:productPhoto("ps5-pad","Manette PS5 blanche")
 },
 "scuf":{
  category:"MANETTE PC",name:"SCUF Envision Pro",
  specs:[["Plateforme","PC"],["Modèle","Envision Pro"],["Personnalisation","Commandes et réglages via iCUE"]],
  description:"Ma manette principale sur PC, configurée pour mes sessions de jeu, notamment les FPS.",
  image:productPhoto("scuf","SCUF Envision Pro")
 },
 "webcam":{
  category:"WEBCAM",name:"Elgato Facecam Neo",
  specs:[["Modèle","Facecam Neo"],["Marque","Elgato"],["Usage","Caméra pour mes lives et échanges"]],
  description:"La webcam installée au-dessus de mon écran pour apparaître à l'image pendant les lives.",
  image:productPhoto("webcam","Elgato Facecam Neo")
 },
 "screen-main":{
  category:"ÉCRAN PRINCIPAL",name:"MSI MAG 27CQ6F",
  specs:[["Taille","27 pouces"],["Définition","2560 × 1440 (QHD)"],["Fréquence","180 Hz"],["Connexion utilisée","DisplayPort"]],
  description:"Mon écran principal pour jouer en 1440p avec une fréquence élevée et une excellente fluidité.",
  image:productPhoto("screen-main","MSI MAG 27CQ6F")
 },
 "screen-second":{
  category:"ÉCRAN SECONDAIRE",name:"AOC CQ27G2S",
  specs:[["Taille","27 pouces"],["Définition","2560 × 1440 (QHD)"],["Fréquence","165 Hz"],["Connexion utilisée","HDMI"]],
  description:"Mon second écran pour garder un œil sur OBS, les discussions et les outils pendant les parties.",
  image:productPhoto("screen-second","AOC CQ27G2S")
 },
 "monitor-arm":{
  category:"SUPPORT",name:"Support double écran",
  specs:[["Utilisation","Montage des deux écrans"],["Installation","Bureau"],["Référence","À confirmer"]],
  description:"Le support qui maintient mes deux moniteurs et permet d'organiser mon espace de jeu.",
  image:productPhoto("monitor-arm","Support double écran"),
  caution:"Marque et référence exactes non renseignées : nom existant conservé."
 },
 "micro":{
  category:"MICROPHONE",name:"RØDE NT-USB+",
  specs:[["Type","Microphone USB"],["Modèle","NT-USB+"],["Usage","Voix, streaming et discussions"]],
  description:"Mon microphone pour parler en direct avec un son clair, indépendant du micro du casque.",
  image:productPhoto("micro","RØDE NT-USB+")
 },
 "headphones":{
  category:"CASQUE GAMING",name:"Astro A50 Gen4",
  specs:[["Modèle","A50 4e génération"],["Type","Casque gaming sans fil"],["Usage","Jeux, communications et monitoring"]],
  description:"Mon casque de jeu principal pour entendre le son du jeu et échanger avec les autres joueurs.",
  image:productPhoto("headphones","Astro A50 Gen4")
 },
 "keyboard":{
  category:"CLAVIER",name:"Logitech G213",
  specs:[["Modèle","G213"],["Type","Clavier gaming"],["Éclairage","RGB"]],
  description:"Mon clavier utilisé pour naviguer, jouer et piloter mon PC au quotidien.",
  image:productPhoto("keyboard","Logitech G213")
 },
 "mouse":{
  category:"SOURIS",name:"Logitech G502",
  specs:[["Gamme","G502"],["Marque","Logitech G"],["Usage","Jeux et navigation PC"]],
  description:"Ma souris principale, appréciée pour ses commandes et ses réglages en jeu.",
  image:productPhoto("mouse","Logitech G502")
 },
 "pc-tower":{
  category:"TOUR PC",name:"Le PC gaming Ma_JesTik",
  specs:[["Boîtier","NZXT H6 Flow ARGB noir"],["Processeur","AMD Ryzen 7 7800X3D"],["Carte graphique","PNY RTX 5070 Ti EPIC-X ARGB OC"],["Mémoire","32 Go DDR5 à 6000 MHz"]],
  description:"Le cœur de mon installation : ma tour pour jouer, enregistrer et streamer. La liste complète de ses composants est disponible sur la page Configuration PC.",
  image:productPhoto("pc-tower","Le PC gaming Ma_JesTik"),configLink:true
 },
 "chair":{
  category:"MOBILIER",name:"CORSAIR TC100 RELAXED",
  specs:[["Type","Fauteuil CORSAIR"],["Usage","Bureau gaming"],["Référence","TC100 RELAXED"]],
  description:"Mon fauteuil CORSAIR TC100 RELAXED utilisé pendant mes sessions de gaming et de streaming.",
  image:productPhoto("chair","CORSAIR TC100 RELAXED")
 },
 "case":{
  category:"01 · BOÎTIER",name:"NZXT H6 Flow ARGB — noir",
  specs:[["Format","Boîtier moyen tour"],["Couleur","Noir"],["Style","Panneaux vitrés et circulation d'air optimisée"]],
  description:"Le boîtier de ma tour. Les ventilateurs installés actuellement sont des modèles ARCTIC détaillés plus bas.",
  image:productPhoto("case","NZXT H6 Flow ARGB — noir")
 },
 "cpu":{
  category:"02 · PROCESSEUR",name:"AMD Ryzen 7 7800X3D",
  specs:[["Architecture","AMD Zen 4"],["Cœurs / threads","8 / 16"],["Socket","AM5"],["Technologie","3D V-Cache"]],
  description:"Mon processeur orienté gaming, choisi pour ses performances en jeu et sa mémoire cache 3D.",
  image:productPhoto("cpu","AMD Ryzen 7 7800X3D")
 },
 "motherboard":{
  category:"03 · CARTE MÈRE",name:"MSI B650 Gaming Plus WiFi",
  specs:[["Socket","AMD AM5"],["Chipset","AMD B650"],["Mémoire","DDR5"],["Connectivité","Wi-Fi intégré et Ethernet"]],
  description:"La carte mère qui relie mes composants et accueille le Ryzen 7 7800X3D.",
  image:productPhoto("motherboard","MSI B650 Gaming Plus WiFi")
 },
 "gpu":{
  category:"04 · CARTE GRAPHIQUE",name:"PNY GeForce RTX 5070 Ti EPIC-X ARGB OC",
  specs:[["GPU","NVIDIA GeForce RTX 5070 Ti"],["Mémoire vidéo","16 Go GDDR7"],["Modèle","PNY EPIC-X ARGB OC"],["Refroidissement","Triple ventilateur"]],
  description:"Ma carte graphique pour le jeu en 1440p, les effets graphiques avancés et mes sessions de streaming.",
  image:productPhoto("gpu","PNY GeForce RTX 5070 Ti EPIC-X ARGB OC")
 },
 "ram":{
  category:"05 · MÉMOIRE VIVE",name:"Crucial Pro DDR5 32 Go 6400 MHz CL36",
  specs:[["Kit","2 × 16 Go"],["Fréquence nominale","6400 MHz"],["Latence nominale","CL36"],["Réglage utilisé","6000 MHz (EXPO 2)"]],
  description:"Les 32 Go de DDR5 du PC. Le kit est annoncé pour 6400 MHz mais fonctionne dans mon installation à 6000 MHz.",
  image:productPhoto("ram","Crucial Pro DDR5 32 Go 6400 MHz CL36")
 },
 "ssd":{
  category:"06 · STOCKAGE",name:"Kingston NV3 — 1 To",
  specs:[["Type","SSD M.2 NVMe"],["Interface","PCIe 4.0"],["Capacité","1 To"]],
  description:"Mon SSD principal pour le système et mes jeux, avec des chargements rapides.",
  image:productPhoto("ssd","Kingston NV3 — 1 To")
 },
 "psu":{
  category:"07 · ALIMENTATION",name:"MSI A750GLS PCIe5 — 750 W",
  specs:[["Puissance","750 W"],["Standard","ATX 3.0"],["Connectique","Compatible PCIe 5"]],
  description:"L'alimentation de ma tour, dimensionnée pour alimenter le Ryzen 7 et la RTX 5070 Ti.",
  image:productPhoto("psu","MSI A750GLS PCIe5 — 750 W")
 },
 "aio":{
  category:"08 · REFROIDISSEMENT",name:"ARCTIC Liquid Freezer III 360 — non-RGB",
  specs:[["Type","Watercooling AIO"],["Radiateur","360 mm"],["Éclairage","Sans RGB"],["Usage","Refroidissement du Ryzen 7 7800X3D"]],
  description:"Mon refroidissement liquide tout-en-un, configuré avec des courbes de ventilation adaptées aux températures du processeur.",
  image:productPhoto("aio","ARCTIC Liquid Freezer III 360 — non-RGB")
 },
 "front-fans":{
  category:"09 · VENTILATEURS AVANT",name:"3 × ARCTIC P12 Pro Reverse ARGB",
  specs:[["Quantité","3"],["Diamètre","120 mm"],["Version","Reverse ARGB"],["Position","Avant du boîtier"]],
  description:"Trois ventilateurs à pales inversées installés à l'avant de ma tour pour l'admission d'air.",
  image:productPhoto("front-fans","3 × ARCTIC P12 Pro Reverse ARGB")
 },
 "rear-fan":{
  category:"10 · VENTILATEUR ARRIÈRE",name:"ARCTIC P12 ARGB — 120 mm",
  specs:[["Quantité","1"],["Diamètre","120 mm"],["Version","ARGB standard"],["Position","Arrière du boîtier"]],
  description:"Mon ventilateur arrière chargé d'aider à évacuer l'air chaud du boîtier.",
  image:productPhoto("rear-fan","ARCTIC P12 ARGB — 120 mm")
 },
 "bottom-fans":{
  category:"11 · VENTILATEURS INFÉRIEURS",name:"2 × ARCTIC P14 Pro Reverse ARGB",
  specs:[["Quantité","2"],["Diamètre","140 mm"],["Version","Reverse ARGB"],["Position","Bas du boîtier"]],
  description:"Deux ventilateurs de 140 mm à pales inversées qui alimentent la carte graphique en air frais depuis le bas.",
  image:productPhoto("bottom-fans","2 × ARCTIC P14 Pro Reverse ARGB")
 }
});
