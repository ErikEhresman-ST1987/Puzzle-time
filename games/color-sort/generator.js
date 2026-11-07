import {createState,move,isSolved,CAPACITY} from './rules.js';
export const TIERS=Object.freeze({
 easy:{colors:3},medium:{colors:5},hard:{colors:7},expert:{colors:10}
});
const letters='ABCDEFGHIJKL';
function rng(seed){let s=(seed>>>0)||1;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};}
function shuffle(a,random){for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function key(tubes){return tubes.map(t=>t.join('')).join('|');}
function score(tubes){
 let changes=0,complete=0;
 for(const t of tubes){if(t.length===4&&t.every(x=>x===t[0]))complete++;
 for(let i=1;i<t.length;i++)if(t[i]!==t[i-1])changes++;}
 return complete*10-changes;
}
// Bounded beam search: every accepted puzzle has a witnessed legal solution.
// This is deliberately bounded to avoid locking up mobile browsers.
export function verifyPuzzle(tubes,{width=120,depth=90,limit=9000}={}){
 const start=createState(tubes);
 if(isSolved(start))return {solved:true,moves:0};
 const seen=new Set([key(start.tubes)]);
 let beam=[{tubes:start.tubes,path:[]}],visited=0;
 for(let d=0;d<depth&&beam.length;d++){
  const next=[];
  for(const node of beam){
   for(let a=0;a<node.tubes.length;a++)for(let b=0;b<node.tubes.length;b++){
    if(a===b)continue;
    const state=createState(node.tubes),action=move(state,a,b);
    if(!action)continue;
    const k=key(state.tubes);
    if(seen.has(k))continue;
    seen.add(k);visited++;
    const path=[...node.path,[a,b]];
    if(isSolved(state))return {solved:true,moves:path.length,path};
    next.push({tubes:state.tubes,path,rank:score(state.tubes)});
    if(visited>=limit)return {solved:false,reason:'search-limit'};
   }
  }
  next.sort((a,b)=>b.rank-a.rank);
  beam=next.slice(0,width);
 }
 return {solved:false,reason:'search-limit'};
}
function candidate(colors,random){
 const balls=[];
 for(let c=0;c<colors;c++)for(let k=0;k<CAPACITY;k++)balls.push(letters[c]);
 shuffle(balls,random);
 const tubes=[];
 for(let i=0;i<colors;i++)tubes.push(balls.slice(i*CAPACITY,(i+1)*CAPACITY));
 tubes.push([],[]);
 return tubes;
}
const fallback=[
 ['A','B','C','A'],['B','C','A','B'],['C','A','B','C'],[],[]
];
export function generatePuzzle(tier,seed=Date.now(),{attempts=24}={}){
 const config=TIERS[tier];
 if(!config)throw Error('Unknown difficulty');
 const random=rng(seed);
 for(let i=0;i<attempts;i++){
  const tubes=candidate(config.colors,random);
  const proof=verifyPuzzle(tubes);
  if(proof.solved&&proof.moves>=Math.max(3,config.colors))return {tubes,proof,tier};
 }
 if(tier==='easy'){
  const tubes=fallback.map(t=>[...t]);
  return {tubes,proof:verifyPuzzle(tubes),tier};
 }
 return null; // Never serve a puzzle whose solvability has not been verified.
}
