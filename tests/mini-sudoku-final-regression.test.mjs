import test from 'node:test';
import assert from 'node:assert/strict';
import {PUZZLES,completedGroups,conflicts,isSolved} from '../games/mini-sudoku/rules.js';
import {generatePuzzle,countSolutions} from '../games/mini-sudoku/generator.js';
import {nextDeduction} from '../games/mini-sudoku/difficulty.js';
import {blankNotes,saveProgress,loadProgress,toggleNote,snapshot,restoreSnapshot} from '../games/mini-sudoku/progress.js';
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
test('final regression: each level generates many distinct, unique boards',()=>{
 for(const level of Object.keys(PUZZLES)){
  const seen=new Set();let prior=null;
  for(let i=0;i<100;i++){
   const {board}=generatePuzzle(level,prior);
   assert.equal(board.length,36);
   assert.equal(countSolutions(board),1,level+' puzzle '+i);
   assert.equal(conflicts(board).size,0);
   assert.equal(board.filter(Boolean).length,PUZZLES[level].filter(Boolean).length);
   seen.add(board.join(''));prior=board;
  }
  assert.ok(seen.size>=10,level+' variety');
 }
});
test('final regression: hints never mutate boards',()=>{
 for(const level of Object.keys(PUZZLES)){
  const board=generatePuzzle(level).board,original=board.slice();
  const hint=nextDeduction(board);
  assert.ok(typeof hint.message==='string'&&hint.message.length>0);
  assert.deepEqual(board,original);
 }
});
test('final regression: save, restore, note edit and undo',()=>{
 const level='easy',initial=generatePuzzle(level).board,board=initial.slice(),notes=blankNotes();
 const i=board.indexOf(0),memory=storage();
 const state={level,initial,board,notes};
 assert.equal(toggleNote(state,i,1),true);
 const prior=snapshot(state.board,state.notes);
 state.notes[i]=[];state.board[i]=2;
 restoreSnapshot(state,prior);
 assert.equal(state.board[i],0);assert.deepEqual(state.notes[i],[1]);
 assert.equal(saveProgress(memory,state),true);
 const loaded=loadProgress(memory);
 assert.equal(loaded.status,'ok');assert.deepEqual(loaded.data.board,state.board);assert.deepEqual(loaded.data.notes,state.notes);
});
test('final regression: solved board is complete in all 18 groups',()=>{
 const solved=[1,2,3,4,5,6,4,5,6,1,2,3,2,3,4,5,6,1,5,6,1,2,3,4,3,4,5,6,1,2,6,1,2,3,4,5];
 assert.equal(isSolved(solved),true);assert.equal(completedGroups(solved).length,18);
});
