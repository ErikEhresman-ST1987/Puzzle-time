export const GARDEN_LEVEL = [
  '########',
  '#.# .  #',
  '#      #',
  '#     ##',
  '#   @  #',
  '#$ $   #',
  '# . $  #',
  '########'
];

const DIRECTIONS = Object.freeze({
  up: [0,-1], down: [0,1], left: [-1,0], right: [1,0]
});
const key = (x,y) => y * 100 + x;

export function parseLevel(lines) {
  if (!Array.isArray(lines) || lines.length < 3 || !lines.every(s => typeof s === 'string')) throw new Error('Invalid level rows');
  const height = lines.length, width = lines[0].length;
  if (width < 3 || width > 50 || height > 50 || lines.some(s => s.length !== width)) throw new Error('Level must be rectangular');
  const walls = new Set(), targets = new Set(), crates = new Set();
  let player = null;
  for (let y=0; y<height; y++) for (let x=0; x<width; x++) {
    const c = lines[y][x], id = key(x,y);
    if (!'# .@$+*'.includes(c)) throw new Error('Unknown tile');
    if (c === '#') walls.add(id);
    if ('.+*'.includes(c)) targets.add(id);
    if ('$*'.includes(c)) crates.add(id);
    if ('@+'.includes(c)) {
      if (player !== null) throw new Error('Multiple gardeners');
      player = id;
    }
  }
  if (player === null || !crates.size || crates.size !== targets.size) throw new Error('Invalid gardener, crates or targets');
  for (let x=0;x<width;x++) if (!walls.has(key(x,0)) || !walls.has(key(x,height-1))) throw new Error('Open boundary');
  for (let y=0;y<height;y++) if (!walls.has(key(0,y)) || !walls.has(key(width-1,y))) throw new Error('Open boundary');
  return {width,height,walls,targets,initialCrates:crates,initialPlayer:player};
}

export function createState(lines=GARDEN_LEVEL) {
  const level=parseLevel(lines);
  return {...level,player:level.initialPlayer,crates:new Set(level.initialCrates),history:[]};
}

export function isSolved(state) {
  return [...state.targets].every(id => state.crates.has(id));
}

export function move(state,direction) {
  const vector=DIRECTIONS[direction];
  if (!vector || isSolved(state)) return false;
  const [dx,dy]=vector, delta=dy*100+dx, next=state.player+delta;
  if (state.walls.has(next)) return false;
  let pushed=null;
  if (state.crates.has(next)) {
    const beyond=next+delta;
    if (state.walls.has(beyond) || state.crates.has(beyond)) return false;
    pushed=[next,beyond];
  }
  state.history.push({player:state.player,pushed});
  if (state.history.length>250) state.history.shift();
  state.player=next;
  if (pushed) {state.crates.delete(pushed[0]);state.crates.add(pushed[1]);}
  return true;
}

export function undo(state) {
  const entry=state.history.pop();
  if (!entry) return false;
  state.player=entry.player;
  if (entry.pushed) {state.crates.delete(entry.pushed[1]);state.crates.add(entry.pushed[0]);}
  return true;
}

export function restart(state) {
  state.player=state.initialPlayer;
  state.crates=new Set(state.initialCrates);
  state.history=[];
}
