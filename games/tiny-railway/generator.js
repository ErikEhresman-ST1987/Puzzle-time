import {PUZZLES} from './rules.js';

// Deterministic enumeration is separate from candidate construction.
export function solvePuzzle(puzzle){
 const wins=[];
 for(let mask=0;mask<2**puzzle.switches.length;mask++){
  const switches=puzzle.switches.map((_,i)=>Boolean(mask&(1<<i)));
  let at='start',seen=new Set(),valid=true;while(at!=='goal'&&!puzzle.endings[at]){if(seen.has(at)){valid=false;break;}seen.add(at);const i=puzzle.switches.findIndex(sw=>sw.node===at);const next=i>=0?puzzle.switches[i].choices[Number(switches[i])]:puzzle.tracks.filter(([from])=>from===at).map(([,to])=>to);if(i<0&&next.length!==1){valid=false;break;}const target=i>=0?next:next[0];if(!puzzle.tracks.some(([a,b])=>a===at&&b===target)){valid=false;break;}at=target;}if(valid&&at==='goal')wins.push(switches);
 }
 return wins;
}
export function minimumChanges(puzzle){
 const wins=solvePuzzle(puzzle);
 return wins.length?Math.min(...wins.map(s=>s.reduce((n,v,i)=>n+Number(v!==puzzle.initial[i]),0))):Infinity;
}
function randomInt(n){return Math.floor(Math.random()*n);}
function shuffledBoolean(){return Math.random()<.5;}
function transform(template,mirrorX,mirrorY){
 const nodes=Object.fromEntries(Object.entries(template.nodes).map(([name,[x,y]])=>[name,[mirrorX?480-x:x,mirrorY?330-y:y]]));
 return {...template,nodes,tracks:template.tracks.map(edge=>[...edge]),switches:template.switches.map(sw=>({node:sw.node,choices:[...sw.choices]})),initial:[...template.initial],endings:{...template.endings}};
}
function signature(p){return JSON.stringify([p.nodes,p.tracks,p.switches,p.initial]);}
export function generatePuzzle(level='Easy',previous=null){
 const target={Easy:1,Medium:2,Hard:3}[level];
 if(!target)throw Error('Unknown difficulty');
 // Finite search: three authored graphs, four spatial orientations, two choices per switch.
 // Accept only puzzles whose *verified* minimum number of changes matches the tier.
 for(let attempt=0;attempt<240;attempt++){
  const base=PUZZLES[randomInt(PUZZLES.length)];
  const p=transform(base,shuffledBoolean(),shuffledBoolean());
  p.switches.forEach(sw=>{if(shuffledBoolean())sw.choices.reverse();});
  p.initial=p.switches.map(()=>shuffledBoolean());
  const solutions=solvePuzzle(p);
  if(!solutions.length||minimumChanges(p)!==target)continue;
  if(previous&&signature(previous)===signature(p))continue;
  p.difficulty=level;
  p.name=base.name+' · '+level;
  return p;
 }
 // Bounded fallback: systematically find a matching initial state without changing graph.
 for(const base of PUZZLES){
  for(const mx of [false,true])for(const my of [false,true]){
   const p=transform(base,mx,my);
   for(let mask=0;mask<8;mask++){
    p.initial=[0,1,2].map(i=>Boolean(mask&(1<<i)));
    if(minimumChanges(p)===target&&(!previous||signature(previous)!==signature(p))){
     p.difficulty=level;p.name=base.name+' · '+level;return p;
    }
   }
  }
 }
 throw Error('No verified puzzle for '+level);
}
