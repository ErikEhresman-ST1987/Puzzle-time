export const SIZE=6;
export const PUZZLES={
 easy:[0,0,3,4,0,6,4,5,6,1,2,3,2,0,4,5,6,1,0,6,0,2,3,4,0,0,5,6,0,0,6,0,0,3,4,0],
 medium:[1,0,0,4,5,6,0,5,0,0,0,3,0,0,4,5,0,0,0,0,1,0,3,4,0,4,5,0,0,2,0,1,0,3,0,5],
 hard:[1,0,3,0,5,0,0,0,0,0,0,0,0,3,0,5,0,1,5,0,1,0,0,4,0,0,5,6,0,0,6,1,0,0,0,0]
};
export const SOLUTION=[1,2,3,4,5,6,4,5,6,1,2,3,2,3,4,5,6,1,5,6,1,2,3,4,3,4,5,6,1,2,6,1,2,3,4,5];
export const rows=Array.from({length:6},(_,r)=>Array.from({length:6},(_,c)=>r*6+c));
export const columns=Array.from({length:6},(_,c)=>Array.from({length:6},(_,r)=>r*6+c));
export const boxes=Array.from({length:6},(_,b)=>Array.from({length:6},(_,i)=>(Math.floor(b/2)*2+Math.floor(i/3))*6+(b%2*3+i%3)));
export const groups=[...rows,...columns,...boxes];
export function groupComplete(board,group){return group.length===6&&new Set(group.map(i=>board[i])).size===6&&group.every(i=>Number.isInteger(board[i])&&board[i]>=1&&board[i]<=6);}
export function completedGroups(board){return groups.map((group,i)=>groupComplete(board,group)?i:-1).filter(i=>i>=0);}
export function conflicts(board){const bad=new Set();for(const group of groups){const seen=new Map();for(const i of group){const n=board[i];if(!n)continue;if(seen.has(n)){bad.add(i);bad.add(seen.get(n));}else seen.set(n,i);}}return bad;}
export function isSolved(board){return Array.isArray(board)&&board.length===36&&board.every(n=>Number.isInteger(n)&&n>=1&&n<=6)&&completedGroups(board).length===18;}
export function createState(level='easy'){if(!Object.hasOwn(PUZZLES,level))throw new Error('Invalid difficulty');const initial=PUZZLES[level].slice();return {level,initial,board:initial.slice(),selected:null};}
export function enter(state,index,value){if(!Number.isInteger(index)||index<0||index>=36||!Number.isInteger(value)||value<0||value>6||state.initial[index]!==0)return false;state.board[index]=value;state.selected=index;return true;}
export function restart(state){state.board=state.initial.slice();state.selected=null;}
