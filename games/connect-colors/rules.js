export const key=([x,y])=>`${x},${y}`;
const equal=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const adjacent=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])===1;
export function createState(puzzle){return {puzzle,paths:Object.fromEntries(Object.keys(puzzle.endpoints).map(c=>[c,[]])),history:[]};}
export function occupied(state,point,except=null){for(const [color,path] of Object.entries(state.paths)){if(color!==except&&path.some(p=>equal(p,point)))return true;}return false;}
export function endpointColor(puzzle,point){return Object.keys(puzzle.endpoints).find(c=>puzzle.endpoints[c].some(p=>equal(p,point)))??null;}
export function complete(state){const {size,endpoints}=state.puzzle;let cells=new Set();for(const [c,ends] of Object.entries(endpoints)){const p=state.paths[c];if(p.length<2||!ends.some(e=>equal(e,p[0]))||!ends.some(e=>equal(e,p.at(-1)))||equal(p[0],p.at(-1)))return false;for(let i=0;i<p.length;i++){if(i&&!adjacent(p[i-1],p[i]))return false;const k=key(p[i]);if(cells.has(k))return false;cells.add(k);}}return cells.size===size*size;}
export function extend(state,color,point){const {size,endpoints}=state.puzzle;if(!endpoints[color]||!Array.isArray(point)||point.length!==2||!point.every(Number.isInteger)||point.some(n=>n<0||n>=size))return false;const path=state.paths[color];const ownEnd=endpoints[color];const foreign=endpointColor(state.puzzle,point);if(foreign&&foreign!==color)return false;
if(path.length===0){if(!ownEnd.some(p=>equal(p,point)))return false;state.history.push(snapshot(state));state.paths[color]=[[...point]];return true;}
const last=path.at(-1);if(equal(last,point))return false;
if(path.length>1&&ownEnd.some(p=>equal(p,last)))return false;
if(!adjacent(last,point))return false;
if(path.length>1&&equal(path.at(-2),point)){state.history.push(snapshot(state));path.pop();return true;}
if(path.some(p=>equal(p,point))||occupied(state,point,color))return false;
state.history.push(snapshot(state));path.push([...point]);return true;}
export function begin(state,color,point){if(!state.puzzle.endpoints[color]?.some(p=>equal(p,point)))return false;state.history.push(snapshot(state));state.paths[color]=[[...point]];return true;}
function snapshot(state){return Object.fromEntries(Object.entries(state.paths).map(([c,p])=>[c,p.map(q=>[...q])]));}
export function undo(state){if(!state.history.length)return false;state.paths=state.history.pop();return true;}
export function restart(state){state.paths=Object.fromEntries(Object.keys(state.puzzle.endpoints).map(c=>[c,[]]));state.history=[];}
export function verifyPuzzle(puzzle){const s=createState(puzzle);for(const [c,path] of Object.entries(puzzle.solution)){for(const [i,p] of path.entries()){if(!(i===0?begin(s,c,p):extend(s,c,p)))return false;}}return complete(s);}