export const TAU = Math.PI * 2;
export const normalise = value => ((value % TAU) + TAU) % TAU;
export function indexAtPointer(angle, count) {
  return Math.min(count - 1, Math.floor(normalise(-angle) / (TAU / count)));
}
export function targetAngle(current, index, count, turns = 7) {
  const desired = normalise(-(index + .5) * TAU / count);
  return current + turns * TAU + normalise(desired - normalise(current));
}
export function randomIndex(count, cryptoSource = crypto) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('Invalid choice count');
  const maximum = 2 ** 32;
  const limit = maximum - maximum % count;
  const bytes = new Uint32Array(1);
  do { cryptoSource.getRandomValues(bytes); } while (bytes[0] >= limit);
  return bytes[0] % count;
}
