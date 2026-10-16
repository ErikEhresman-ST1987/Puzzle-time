import {PUZZLES,conflicts} from './rules.js';
import {countSolutions} from './generator.js';
export const SAVE_KEY='puzzle-time:mini-sudoku:v1';
export function blankNotes(){return Array.from({length:36},()=>[]);}
export function validSnapshot(s){
 if(!s||!Array.isArray(s.board)||s.board.length!==36||s.board.some(n=>!Number.isInteger(n)||n<0||n>6))return false;
 if(!Array.isArray(s.notes)||s.notes.length!==36)return false;
 return s.notes.every((a,i)=>Array.isArray(a)&&a.length<=6&&a.every((n,j)=>Number.isInteger(n)&&n>=1&&n<=6&&a.indexOf(n)===j)&&(!s.board[i]||a.length===0));
}
export function snapshot(board,notes){return {board:board.slice(),notes:notes.map(a=>a.slice())};}
export function restoreSnapshot(state,s){state.board=s.board.slice();state.notes=s.notes.map(a=>a.slice());}
export function loadProgress(storage){
 let raw;try{raw=storage.getItem(SAVE_KEY);}catch{return {status:'unavailable'};}
 if(raw===null)return {status:'empty'};
 try{
  const p=JSON.parse(raw);
  if(!p||p.app!=='mini-sudoku'||p.version!==1||!Object.hasOwn(PUZZLES,p.level))return {status:'invalid'};
  if(!Array.isArray(p.initial)||p.initial.length!==36||p.initial.some(n=>!Number.isInteger(n)||n<0||n>6)||conflicts(p.initial).size||countSolutions(p.initial)!==1)return {status:'invalid'};
  if(!validSnapshot(p))return {status:'invalid'};
  if(p.board.some((n,i)=>p.initial[i]!==0&&n!==p.initial[i]))return {status:'invalid'};
  if(p.notes.some((a,i)=>p.initial[i]!==0&&a.length))return {status:'invalid'};
  return {status:'ok',data:{level:p.level,initial:p.initial.slice(),board:p.board.slice(),notes:p.notes.map(a=>a.slice())}};
 }catch{return {status:'invalid'};}
}
export function saveProgress(storage,state){
 const p={app:'mini-sudoku',version:1,level:state.level,initial:state.initial.slice(),board:state.board.slice(),notes:state.notes.map(a=>a.slice())};
 try{storage.setItem(SAVE_KEY,JSON.stringify(p));return true;}catch{return false;}
}
export function toggleNote(state,index,n){
 if(!Number.isInteger(index)||index<0||index>=36||state.initial[index]||state.board[index]||!Number.isInteger(n)||n<1||n>6)return false;
 const notes=state.notes[index];state.notes[index]=notes.includes(n)?notes.filter(v=>v!==n):[...notes,n].sort((a,b)=>a-b);return true;
}
