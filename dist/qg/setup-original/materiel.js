/* Catalogue unique des fiches d'équipement du setup Ma_JesTik.
   Toutes les photographies proviennent des photos du setup ou de la tour de Ma_JesTik.
   Ne jamais utiliser de visuels de boutiques sans droits vérifiés. */
export const ORIGINAL_SETUP_PHOTO="https://maroo1103.github.io/setup-ma-jestik/assets/setup-ma-jestikk.png";
const crop=(area,detail)=>({kind:"setup-crop",area,alt:detail,credit:"Photo réelle recadrée dans mon setup"});
const tower=()=>({kind:"owned-webp",src:"../media/pc-ma-jestik-cadre.webp",alt:"Photographie personnelle de la tour Ma_JesTik dans un boîtier NZXT H6 Flow ARGB noir",credit:"Photo réelle de ma tour · WebP"});
export const HOTSPOT_IDS=Object.freeze(["ps5","ps5-pad","scuf","webcam","screen-main","screen-second","monitor-arm","micro","headphones","keyboard","mouse","pc-tower","chair"]);
export const PC_COMPONENT_IDS=Object.freeze(["case","cpu","motherboard","gpu","ram","ssd","psu","aio","front-fans","rear-fan","bottom-fans"]);
export const MATERIAL=Object.freeze({
 "ps5":{
  category:"CONSOLE",name:"PlayStation 5",
  specs:[["Plateforme","Sony PlayStation 5"],["Type","Console de salon"],["Utilisation","Jeux sur console"]],
  description:"Ma console pour profiter des exclusivités PlayStation et jouer en dehors du PC.",
  image:crop([0,325,230,418],"La PlayStation 5 sur la photo originale de mon setup"),
  caution:"Édition et révision matérielle exactes à confirmer."
 },
 "ps5-pad":{
  category:"MANETTE CONSOLE",name:"Manette PS5 blanche",
  specs:[["Compatibilité","PlayStation 5"],["Couleur","Blanc"],["Usage","Jeux sur console"]],
  description:"La manette blanche présente à côté de la console dans mon installation.",
  image:crop([0,700,217,128],"La manette blanche PS5 photographiée dans mon setup"),
  caution:"Version précise de la manette non confirmée."
 },
 "scuf":{
  category:"MANETTE PC",name:"SCUF Envision Pro",
  specs:[["Plateforme","PC"],["Modèle","Envision Pro"],["Personnalisation","Commandes et réglages via iCUE"]],
  description:"Ma manette principale sur PC, configurée pour mes sessions de jeu, notamment les FPS.",
  image:crop([510,668,202,118],"Ma manette SCUF Envision Pro visible sur la photo du setup")
 },
 "webcam":{
  category:"WEBCAM",name:"Elgato Facecam Neo",
  specs:[["Modèle","Facecam Neo"],["Marque","Elgato"],["Usage","Caméra pour mes lives et échanges"]],
  description:"La webcam installée au-dessus de mon écran pour apparaître à l'image pendant les lives.",
  image:crop([546,195,129,106],"La webcam Elgato Facecam Neo au-dessus de mon écran")
 },
 "screen-main":{
  category:"ÉCRAN PRINCIPAL",name:"MSI MAG 27CQ6F",
  specs:[["Taille","27 pouces"],["Définition","2560 × 1440 (QHD)"],["Fréquence","180 Hz"],["Connexion utilisée","DisplayPort"]],
  description:"Mon écran principal pour jouer en 1440p avec une fréquence élevée et une excellente fluidité.",
  image:crop([188,245,460,472],"Mon moniteur principal MSI MAG 27CQ6F photographié sur le bureau")
 },
 "screen-second":{
  category:"ÉCRAN SECONDAIRE",name:"AOC CQ27G2S",
  specs:[["Taille","27 pouces"],["Définition","2560 × 1440 (QHD)"],["Fréquence","165 Hz"],["Connexion utilisée","HDMI"]],
  description:"Mon second écran pour garder un œil sur OBS, les discussions et les outils pendant les parties.",
  image:crop([607,253,428,297],"Mon écran secondaire AOC CQ27G2S visible dans le setup")
 },
 "monitor-arm":{
  category:"SUPPORT",name:"Support double écran",
  specs:[["Utilisation","Montage des deux écrans"],["Installation","Bureau"],["Référence","À confirmer"]],
  description:"Le support qui maintient mes deux moniteurs et permet d'organiser mon espace de jeu.",
  image:crop([467,523,141,115],"Le support des deux moniteurs sur ma photo du setup"),
  caution:"Marque et référence exactes non renseignées : nom existant conservé."
 },
 "micro":{
  category:"MICROPHONE",name:"RØDE NT-USB+",
  specs:[["Type","Microphone USB"],["Modèle","NT-USB+"],["Usage","Voix, streaming et discussions"]],
  description:"Mon microphone pour parler en direct avec un son clair, indépendant du micro du casque.",
  image:crop([579,398,148,253],"Le microphone RØDE NT-USB+ installé sur le bureau")
 },
 "headphones":{
  category:"CASQUE GAMING",name:"Astro A50 Gen4",
  specs:[["Modèle","A50 4e génération"],["Type","Casque gaming sans fil"],["Usage","Jeux, communications et monitoring"]],
  description:"Mon casque de jeu principal pour entendre le son du jeu et échanger avec les autres joueurs.",
  image:crop([931,447,174,191],"Mon casque Astro A50 de 4e génération dans le setup")
 },
 "keyboard":{
  category:"CLAVIER",name:"Logitech G213",
  specs:[["Modèle","G213"],["Type","Clavier gaming"],["Éclairage","RGB"]],
  description:"Mon clavier utilisé pour naviguer, jouer et piloter mon PC au quotidien.",
  image:crop([626,556,425,185],"Mon clavier Logitech G213 sur la photo originale du setup")
 },
 "mouse":{
  category:"SOURIS",name:"Logitech G502",
  specs:[["Gamme","G502"],["Marque","Logitech G"],["Usage","Jeux et navigation PC"]],
  description:"Ma souris principale, appréciée pour ses commandes et ses réglages en jeu.",
  image:crop([1038,596,127,99],"Ma souris Logitech G502 photographiée sur le bureau"),
  caution:"Variante précise de la G502 à confirmer (modèle conservé)."
 },
 "pc-tower":{
  category:"TOUR PC",name:"Le PC gaming Ma_JesTik",
  specs:[["Boîtier","NZXT H6 Flow ARGB noir"],["Processeur","AMD Ryzen 7 7800X3D"],["Carte graphique","PNY RTX 5070 Ti EPIC-X ARGB OC"],["Mémoire","32 Go DDR5 à 6000 MHz"]],
  description:"Le cœur de mon installation : ma tour pour jouer, enregistrer et streamer. La liste complète de ses composants est disponible sur la page Configuration PC.",
  image:tower(),configLink:true
 },
 "chair":{
  category:"MOBILIER",name:"Chaise gaming",
  specs:[["Type","Fauteuil gaming"],["Usage","Assise au bureau"],["Référence","À confirmer"]],
  description:"Mon fauteuil utilisé pendant mes sessions de gaming et de streaming.",
  image:crop([763,415,685,671],"La chaise gaming visible sur la photo originale de mon setup"),
  caution:"Marque et modèle exacts non renseignés : nom existant conservé."
 },
 "case":{
  category:"01 · BOÎTIER",name:"NZXT H6 Flow ARGB — noir",
  specs:[["Format","Boîtier moyen tour"],["Couleur","Noir"],["Style","Panneaux vitrés et circulation d'air optimisée"]],
  description:"Le boîtier de ma tour. Les ventilateurs installés actuellement sont des modèles ARCTIC détaillés plus bas.",
  image:tower()
 },
 "cpu":{
  category:"02 · PROCESSEUR",name:"AMD Ryzen 7 7800X3D",
  specs:[["Architecture","AMD Zen 4"],["Cœurs / threads","8 / 16"],["Socket","AM5"],["Technologie","3D V-Cache"]],
  description:"Mon processeur orienté gaming, choisi pour ses performances en jeu et sa mémoire cache 3D."
 },
 "motherboard":{
  category:"03 · CARTE MÈRE",name:"MSI B650 Gaming Plus WiFi",
  specs:[["Socket","AMD AM5"],["Chipset","AMD B650"],["Mémoire","DDR5"],["Connectivité","Wi-Fi intégré et Ethernet"]],
  description:"La carte mère qui relie mes composants et accueille le Ryzen 7 7800X3D."
 },
 "gpu":{
  category:"04 · CARTE GRAPHIQUE",name:"PNY GeForce RTX 5070 Ti EPIC-X ARGB OC",
  specs:[["GPU","NVIDIA GeForce RTX 5070 Ti"],["Mémoire vidéo","16 Go GDDR7"],["Modèle","PNY EPIC-X ARGB OC"],["Refroidissement","Triple ventilateur"]],
  description:"Ma carte graphique pour le jeu en 1440p, les effets graphiques avancés et mes sessions de streaming."
 },
 "ram":{
  category:"05 · MÉMOIRE VIVE",name:"Crucial Pro DDR5 32 Go 6400 MHz CL36",
  specs:[["Kit","2 × 16 Go"],["Fréquence nominale","6400 MHz"],["Latence nominale","CL36"],["Réglage utilisé","6000 MHz (EXPO 2)"]],
  description:"Les 32 Go de DDR5 du PC. Le kit est annoncé pour 6400 MHz mais fonctionne dans mon installation à 6000 MHz."
 },
 "ssd":{
  category:"06 · STOCKAGE",name:"Kingston NV3 — 1 To",
  specs:[["Type","SSD M.2 NVMe"],["Interface","PCIe 4.0"],["Capacité","1 To"]],
  description:"Mon SSD principal pour le système et mes jeux, avec des chargements rapides."
 },
 "psu":{
  category:"07 · ALIMENTATION",name:"MSI A750GLS PCIe5 — 750 W",
  specs:[["Puissance","750 W"],["Standard","ATX 3.0"],["Connectique","Compatible PCIe 5"]],
  description:"L'alimentation de ma tour, dimensionnée pour alimenter le Ryzen 7 et la RTX 5070 Ti."
 },
 "aio":{
  category:"08 · REFROIDISSEMENT",name:"ARCTIC Liquid Freezer III 360 — non-RGB",
  specs:[["Type","Watercooling AIO"],["Radiateur","360 mm"],["Éclairage","Sans RGB"],["Usage","Refroidissement du Ryzen 7 7800X3D"]],
  description:"Mon refroidissement liquide tout-en-un, configuré avec des courbes de ventilation adaptées aux températures du processeur."
 },
 "front-fans":{
  category:"09 · VENTILATEURS AVANT",name:"3 × ARCTIC P12 Pro Reverse ARGB",
  specs:[["Quantité","3"],["Diamètre","120 mm"],["Version","Reverse ARGB"],["Position","Avant du boîtier"]],
  description:"Trois ventilateurs à pales inversées installés à l'avant de ma tour pour l'admission d'air."
 },
 "rear-fan":{
  category:"10 · VENTILATEUR ARRIÈRE",name:"ARCTIC P12 ARGB — 120 mm",
  specs:[["Quantité","1"],["Diamètre","120 mm"],["Version","ARGB standard"],["Position","Arrière du boîtier"]],
  description:"Mon ventilateur arrière chargé d'aider à évacuer l'air chaud du boîtier."
 },
 "bottom-fans":{
  category:"11 · VENTILATEURS INFÉRIEURS",name:"2 × ARCTIC P14 Pro Reverse ARGB",
  specs:[["Quantité","2"],["Diamètre","140 mm"],["Version","Reverse ARGB"],["Position","Bas du boîtier"]],
  description:"Deux ventilateurs de 140 mm à pales inversées qui alimentent la carte graphique en air frais depuis le bas."
 }
});
