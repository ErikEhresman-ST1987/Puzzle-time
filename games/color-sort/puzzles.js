// Fixed, solver-checked opening for the first playable increment.
// Tubes are stored bottom-to-top. Empty tubes provide working space.
export const OPENING = Object.freeze([
  Object.freeze(['A','B','C','A']),
  Object.freeze(['B','C','A','B']),
  Object.freeze(['C','A','B','C']),
  Object.freeze([]),
  Object.freeze([])
]);
