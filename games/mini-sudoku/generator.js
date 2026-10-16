import {PUZZLES,conflicts} from './rules.js';
import {candidates} from './difficulty.js';

// Independent backtracking validator: counts at most two solutions.
export function countSolutions(puzzle,limit=2){
 if(!Array.isArray(puzzle)||puzzle.length!==36||puzzle.some(n=>!Number.isInteger(n)||n<0||n>6)||conflicts(puzzle).size)return 0;
 const board=puzzle.slice();let found=0;
 function visit(){
  if(found>=limit)return;
  let best=-1,options=null;
  for(let i=0;i<36;i++)if(!board[i]){
   const choices=candidates(board,i);
   if(!choices.length)return;
   if(options===null||choices.length<options.length){best=i;options=choices;if(choices.length===1)break;}
  }
  if(best<0){found++;return;}
  for(const n of options){board[best]=n;visit();board[best]=0;if(found>=limit)break;}
 }
 visit();return found;
}
function shuffle(a,rng){const result=a.slice();for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function transformPuzzle(puzzle,rng=Math.random){
 const digits=shuffle([1,2,3,4,5,6],rng);
 // Rows can swap within each 2-row band, bands can swap;
 // columns can swap within each 3-column stack, stacks can swap.
 const bands=shuffle([0,1,2],rng),stacks=shuffle([0,1],rng);
 const rowOrder=bands.flatMap(b=>shuffle([2*b,2*b+1],rng));
 const colOrder=stacks.flatMap(s=>shuffle([3*s,3*s+1,3*s+2],rng));
 const transpose=rng()<.5;
 return Array.from({length:36},(_,i)=>{
  const r=Math.floor(i/6),c=i%6;
  const old=transpose?rowOrder[c]*6+colOrder[r]:rowOrder[r]*6+colOrder[c];
  const n=puzzle[old];return n?digits[n-1]:0;
 });
}
export function generatePuzzle(level,previous=null,rng=Math.random){
 if(!Object.hasOwn(PUZZLES,level))throw new Error('Invalid difficulty');
 // 3A: symmetry-preserving transforms of human-playtested templates.
 // Not yet a full difficulty-calibrated removal generator.
 for(let attempt=0;attempt<16;attempt++){
  const candidate=transformPuzzle(PUZZLES[level],rng);
  if(previous&&candidate.every((n,i)=>n===previous[i]))continue;
  if(countSolutions(candidate)===1)return {board:candidate,source:'verified-transform'};
 }
 // Verified seed is a safe fallback, never return an unchecked candidate.
 const fallback=PUZZLES[level].slice();
 if(countSolutions(fallback)!==1)throw new Error('No verified Sudoku fallback');
 return {board:fallback,source:'verified-fallback'};
}
