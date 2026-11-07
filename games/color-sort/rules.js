export const CAPACITY = 4;
const copy = tubes => tubes.map(t => [...t]);
export function validate(tubes) {
  if (!Array.isArray(tubes) || tubes.length < 3) throw new Error('Invalid tubes');
  const counts = new Map();
  for (const tube of tubes) {
    if (!Array.isArray(tube) || tube.length > CAPACITY) throw new Error('Invalid tube capacity');
    for (const ball of tube) {
      if (typeof ball !== 'string' || !ball) throw new Error('Invalid ball');
      counts.set(ball, (counts.get(ball) || 0) + 1);
    }
  }
  if (!counts.size || [...counts.values()].some(n => n !== CAPACITY)) throw new Error('Each color needs four balls');
  return true;
}
export function createState(tubes) {
  validate(tubes);
  return { initial: copy(tubes), tubes: copy(tubes), history: [], moves: 0 };
}
export function isSolved(state) {
  return state.tubes.every(t => !t.length || (t.length === CAPACITY && t.every(c => c === t[0])));
}
export function move(state, source, destination) {
  const tubes = state.tubes;
  if (!Number.isInteger(source) || !Number.isInteger(destination) ||
      source === destination || source < 0 || destination < 0 ||
      source >= tubes.length || destination >= tubes.length || isSolved(state)) return null;
  const from = tubes[source], to = tubes[destination];
  if (!from.length || to.length === CAPACITY) return null;
  const color = from[from.length - 1];
  if (to.length && to[to.length - 1] !== color) return null;
  let group = 1;
  while (group < from.length && from[from.length - 1 - group] === color) group++;
  const count = Math.min(group, CAPACITY - to.length);
  if (!count) return null;
  to.push(...from.splice(from.length - count, count));
  const transfer = {source, destination, color, count};
  state.history.push(transfer);
  state.moves++;
  return transfer;
}
export function undo(state) {
  const last = state.history.pop();
  if (!last) return false;
  const from = state.tubes[last.destination], to = state.tubes[last.source];
  const balls = from.splice(from.length - last.count, last.count);
  if (balls.length !== last.count || balls.some(c => c !== last.color)) throw new Error('Undo history mismatch');
  to.push(...balls);
  state.moves--;
  return true;
}
export function restart(state) {
  state.tubes = copy(state.initial);
  state.history = [];
  state.moves = 0;
}
