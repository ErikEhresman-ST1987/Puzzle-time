import test from 'node:test';import assert from 'node:assert/strict';import {SOLUTION,PUZZLES} from '../games/mini-sudoku/rules.js';import {candidates,nextDeduction} from '../games/mini-sudoku/difficulty.js';
test('a missing digit is the only candidate',()=>{const b=SOLUTION.slice();b[0]=0;assert.deepEqual(candidates(b,0),[1]);const hint=nextDeduction(b);assert.equal(hint.type,'naked-single');assert.equal(hint.index,0);assert.equal(hint.value,1);});
test('conflicts prevent misleading hints',()=>{const b=SOLUTION.slice();b[0]=2;assert.equal(nextDeduction(b).type,'conflict');});
test('hints never mutate a puzzle',()=>{for(const board of Object.values(PUZZLES)){const before=board.slice();nextDeduction(board);assert.deepEqual(board,before);}});
