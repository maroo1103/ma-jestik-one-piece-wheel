/* Ma_JesTik — gestion 100 % locale des roues : aucun Worker, aucune D1. */
import { HAJIN_MODEL } from './warzone-hajin.mjs';
import { ZODIAC_MODEL } from './warzone-zodiac.mjs';
const OFFICIAL_WARZONE_MODELS=[HAJIN_MODEL,ZODIAC_MODEL];
export const MAX_CHOICES = 60;
export const MAX_WHEELS = 24;
export const FALLBACK_IMAGE = '/icons/mj-source.webp';
const KEY = 'ma-jestik-wheel-library-v2';
const imagePath = value => {
  const name=String(value||'');
  return (/^assets\/(?:0[1-9]|1[0-2])\.webp$/.test(name)
      || /^assets\/warzone\/(?:hajin|zodiac)\/poi-(?:0[1-9]|1[0-3])\.webp$/.test(name))
    ?name:FALLBACK_IMAGE;
};
const safeName = value => String(value || '').trim().replace(/\s+/g, ' ').slice(0, 70);
const safeId = value => /^[a-zA-Z0-9_-]{1,55}$/.test(String(value || '')) ? String(value) : null;
export function makeId(prefix = 'c') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
export function makeChoice(name, originalImage = FALLBACK_IMAGE) {
  return { id: makeId('c'), name: safeName(name), originalImage: imagePath(originalImage) };
}
function validateChoice(raw) {
  const id = safeId(raw?.id), name = safeName(raw?.name);
  return id && name ? { id, name, originalImage: imagePath(raw.originalImage) } : null;
}
function validateWheel(raw) {
  const id = safeId(raw?.id), name = safeName(raw?.name);
  if (!id || !name || !Array.isArray(raw.choices)) return null;
  const used = new Set();
  const choices = raw.choices.slice(0, MAX_CHOICES).map(validateChoice).filter(choice => {
    if (!choice || used.has(choice.id)) return false;
    used.add(choice.id); return true;
  });
  if (!choices.length) return null;
  const all = new Set(choices.map(x => x.id));
  const selected = Array.isArray(raw.selected) ? [...new Set(raw.selected.filter(id => all.has(id)))] : choices.map(x => x.id);
  const history = Array.isArray(raw.history) ? raw.history.filter(id => all.has(id)).slice(0, 6) : [];
  return { id, name, choices, selected: selected.length ? selected : choices.map(x => x.id),
    history, duration: ['5', '8', '12'].includes(String(raw.duration)) ? String(raw.duration) : '8' };
}
export function loadWheelLibrary(baseChoices, legacy = {}) {
  const fallback = { id: 'fortnite', name: 'Fortnite · One Piece · Modèle', choices: baseChoices.map(x => ({
    id: x.id, name: x.name, originalImage: x.originalImage
  })), selected: Array.isArray(legacy.selected) && legacy.selected.length ?
    legacy.selected : baseChoices.map(x => x.id), history: legacy.history || [], duration: legacy.duration || '8' };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && Array.isArray(raw.wheels)) {
      const found = new Set();
      const wheels = raw.wheels.slice(0, MAX_WHEELS).map(validateWheel).filter(w => {
        if (!w || found.has(w.id)) return false;
        found.add(w.id); return true;
      });
      if (wheels.length) {
        // Migration strictement additive : conserver les roues déjà créées,
        // l'historique, les images personnelles, la sélection et les préférences.
        const dismissedPresets=Array.isArray(raw.dismissedPresets)
          ?raw.dismissedPresets.filter(id=>OFFICIAL_WARZONE_MODELS.some(p=>p.id===id)):[];
        for(const official of OFFICIAL_WARZONE_MODELS){
          const existing=wheels.find(w=>w.id===official.id);
          if(existing){
            // Hajin a initialement été publié avec un logo MJ provisoire.
            // Remplacer l'image d'origine pour les lieux intacts, jamais une
            // personnalisation locale IndexedDB ou un choix renommé/supprimé.
            if(existing.id===HAJIN_MODEL.id && existing.name==='Warzone · Hajin (images à compléter)')
              existing.name=HAJIN_MODEL.name;
            for(const choice of existing.choices){
              const original=official.choices.find(c=>c.id===choice.id && c.name===choice.name);
              if(original && choice.originalImage===FALLBACK_IMAGE)
                choice.originalImage=original.originalImage;
            }
          }else if(!dismissedPresets.includes(official.id)&&wheels.length<MAX_WHEELS)
            wheels.push(validateWheel(official));
        }
        return { active:found.has(raw.active)?raw.active:wheels[0].id, wheels, dismissedPresets };
      }
    }
  } catch {}
  return { active: 'fortnite',
    wheels:[validateWheel(fallback),...OFFICIAL_WARZONE_MODELS.map(validateWheel)],
    dismissedPresets:[]
  };
}
export function saveWheelLibrary(library) {
  try {
    localStorage.setItem(KEY, JSON.stringify(library));
    return true;
  } catch { return false; }
}
export function imageKey(wheelId, choiceId) {
  // Préserve exactement les anciennes images locales de la roue Fortnite One Piece.
  return wheelId === 'fortnite' && /^(0[1-9]|1[0-2])$/.test(choiceId)
    ? choiceId : wheelId + ':' + choiceId;
}
export function wheelToPois(wheel) {
  return wheel.choices.map(choice => {
    const words=choice.name.split(/\s+/);
    const lines=[];
    for(const word of words){
      if(!lines.length || (lines[lines.length-1].length + 1 + word.length > 21 && lines.length < 2))lines.push(word);
      else lines[lines.length-1]+=' '+word;
    }
    if(lines[1]?.length>24)lines[1]=lines[1].slice(0,23)+'…';
    if(lines[0]?.length>24)lines[0]=lines[0].slice(0,23)+'…';
    return {...choice,lines:lines.length?lines:[choice.name],image:choice.originalImage};
  });
}
export function cleanNames(text) {
  const raw = String(text || '').split(/\r?\n/).map(safeName).filter(Boolean);
  if (!raw.length || raw.length > MAX_CHOICES) throw new Error('Entre 1 et ' + MAX_CHOICES + ' choix, un par ligne.');
  const used = new Set();
  return raw.filter(name => {
    const k = name.toLocaleLowerCase('fr');
    if (used.has(k)) return false;
    used.add(k); return true;
  });
}
export function parseWheelImport(text) {
  if (text.length > 36_000_000) throw new Error('Ce fichier est trop lourd (36 Mo max.).');
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Fichier JSON invalide.'); }
  if (data?.format !== 'ma-jestik-wheel' || data?.version !== 2 || !Array.isArray(data.choices) ||
      !data.choices.length || data.choices.length > MAX_CHOICES)
    throw new Error('Ce fichier ne correspond pas au format des roues Ma_JesTik.');
  const names = new Set();
  const choices = data.choices.map(item => {
    const name = safeName(item?.name);
    if (!name) throw new Error('Un choix sans nom a été trouvé.');
    const lower = name.toLocaleLowerCase('fr');
    if (names.has(lower)) throw new Error('Un nom est présent plusieurs fois dans ce fichier.');
    names.add(lower);
    const image = item?.image;
    if (image !== undefined && (typeof image !== 'string' ||
      !/^data:image\/(?:webp|png|jpeg|avif);base64,[A-Za-z0-9+/=]+$/.test(image) || image.length > 3_000_000))
      throw new Error('Une image intégrée est invalide ou trop volumineuse.');
    return { name, originalImage: imagePath(item.originalImage), image };
  });
  const enabled=new Set(Array.isArray(data.selectedNames)?data.selectedNames.filter(v=>typeof v==='string'):[]);
  return { name: safeName(data.name) || 'Roue importée', choices,
    selectedNames:enabled.size?[...enabled]:choices.map(c=>c.name),
    duration:['5','8','12'].includes(String(data.duration))?String(data.duration):'8'
  };
}
