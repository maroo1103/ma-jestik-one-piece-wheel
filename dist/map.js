// Carte interactive indépendante de la logique de tirage.
const mapOpen = document.getElementById('mapOpen');
const mapDialog = document.getElementById('mapDialog');
const mapClose = document.getElementById('mapClose');
const mapPanel = mapDialog.querySelector('.map-dialog-panel');
mapOpen.addEventListener('click', () => mapDialog.showModal());
mapClose.addEventListener('click', () => mapDialog.close());
mapDialog.addEventListener('click', event => {
  if (event.target !== mapDialog) return;
  const rect = mapPanel.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom) mapDialog.close();
});
// Ne pas lancer la roue en appuyant sur espace lorsque la carte est ouverte.
document.addEventListener('keydown', event => {
  if (mapDialog.open && event.code === 'Space') event.stopImmediatePropagation();
}, true);
