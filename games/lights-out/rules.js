export const SIZE=4;
export function toggle(board,index,size=SIZE){if(!Number.isInteger(size)||size<2||!Array.isArray(board)||board.length!==size*size||!Number.isInteger(index)||index<0||index>=board.length)throw new RangeError('Invalid board or move');const next=board.slice(),x=index%size,y=Math.floor(index/size);for(const [dx,dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<size&&ny>=0&&ny<size){const at=ny*size+nx;next[at]=!next[at];}}return next;}
export function solved(board){return board.every(value=>value===false);}
export function initialBoard(size=SIZE){let board=Array(size*size).fill(false);for(const index of [0,3,5,10,12,15])if(index<board.length)board=toggle(board,index,size);return board;}
export function createState(board=initialBoard()){const size=Math.sqrt(board.length);if(!Array.isArray(board)||![4,5,6].includes(size)||board.some(v=>typeof v!=='boolean'))throw new Error('Expected 4×4, 5×5 or 6×6 boolean board');return {size,initial:board.slice(),board:board.slice(),history:[],moves:0};}
export function play(state,index){if(solved(state.board))return false;const next=toggle(state.board,index,state.size);state.history.push(state.board.slice());state.board=next;state.moves++;return true;}
export function undo(state){if(!state.history.length)return false;state.board=state.history.pop();state.moves--;return true;}
export function restart(state){state.board=state.initial.slice();state.history=[];state.moves=0;}
