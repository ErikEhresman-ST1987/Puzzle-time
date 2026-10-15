import {toggle,solved} from './rules.js';import {solve} from './solver.js';
const LIMIT=160;
export function signature(board){return board.map(v=>v?'1':'0').join('');}
export function generateEasy({random=Math.random,exclude=new Set()}={}){let backup=null;for(let attempt=0;attempt<LIMIT;attempt++){let board=Array(16).fill(false);const count=2+Math.floor(random()*3),indices=new Set();const start=Math.min(15,Math.max(0,Math.floor(random()*16)));for(let j=0;j<count;j++)indices.add((start+j*5)%16);for(const i of indices)board=toggle(board,i);const solution=solve(board);if(!solution||solved(board)||solution.length<2||solution.length>4)continue;const key=signature(board);if(exclude.has(key))continue;return {board,solution,signature:key,attempts:attempt+1};}
const fallback=Array(16).fill(false);let board=fallback;for(const i of [0,5])board=toggle(board,i);return {board,solution:solve(board),signature:signature(board),fallback:true,attempts:LIMIT};}
