import {toggle,solved} from './rules.js';import {solve} from './solver.js';
const LIMIT=160;
export const LEVELS={easy:{size:4,min:2,max:4},medium:{size:5,min:5,max:8},hard:{size:6,min:9,max:14}};
export function signature(board){return board.map(v=>v?'1':'0').join('');}
export function generatePuzzle(level='easy',{random=Math.random,exclude=new Set()}={}){const config=LEVELS[level];if(!config)throw new RangeError('Unknown level');const {size,min,max}=config,n=size*size;for(let attempt=0;attempt<LIMIT;attempt++){let board=Array(n).fill(false);const count=min+Math.floor(random()*(max-min+1));const pool=Array.from({length:n},(_,i)=>i);for(let j=0;j<count;j++){const k=j+Math.min(n-j-1,Math.max(0,Math.floor(random()*(n-j))));[pool[j],pool[k]]=[pool[k],pool[j]];board=toggle(board,pool[j],size);}const solution=solve(board,size);if(!solution||solved(board)||solution.length<min||solution.length>max)continue;const key=signature(board);if(exclude.has(key))continue;return {board,solution,signature:key,attempts:attempt+1};}
let board=Array(n).fill(false);for(let i=0;i<min;i++)board=toggle(board,(i*7)%n,size);const solution=solve(board,size);return {board,solution,signature:signature(board),fallback:true,attempts:LIMIT};}
export function generateEasy(options){return generatePuzzle('easy',options);}
