const DB_NAME = 'ma-jestik-wheel-images';
let database;
function openDatabase() {
  if (!database) database = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('Stockage indisponible'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('images', { keyPath: 'id' });
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Ferme les autres onglets de la roue puis réessaie.'));
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => { db.close(); database = undefined; };
      resolve(db);
    };
  }).catch(error => { database = undefined; throw error; });
  return database;
}
export async function readImages() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction('images', 'readonly').objectStore('images').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function writeImage(id, blob) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    if (blob) store.put({ id, blob }); else store.delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Enregistrement interrompu'));
  });
}
export const saveImage = (id, blob) => writeImage(id, blob);
export const deleteImage = id => writeImage(id, null);

export async function prepareImage(file) {
  const types = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
  if (!types.has(file.type)) throw new Error('Choisis une image JPG, PNG, WebP ou AVIF.');
  if (file.size > 20 * 1024 * 1024) throw new Error('Cette image dépasse 20 Mo. Choisis un fichier plus léger.');
  let bitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new Error("Impossible de lire cette image. Essaie un autre fichier JPG ou PNG."); }
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 40_000_000)
      throw new Error('Cette image est trop grande. Choisis une image de moins de 40 mégapixels.');
    const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Ce navigateur ne peut pas préparer l'image.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .9));
    if (!blob) throw new Error("Impossible de préparer l'image. Réessaie avec un autre fichier.");
    return blob;
  } finally { bitmap.close(); }
}
