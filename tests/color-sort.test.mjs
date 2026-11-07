import test from 'node:test';
import assert from 'node:assert/strict';
import {createState, move, undo, restart, isSolved, validate} from '../games/color-sort/rules.js';
import {OPENING} from '../games/color-sort/puzzles.js';
const snapshot = s => s.tubes.map(t => [...t]);
test('opening has valid ball counts and is unsolved', () => {
  const s = createState(OPENING);
  assert.equal(isSolved(s), false);
  assert.equal(s.tubes.length, 5);
});
test('moves matching groups and undo restores entire transfer', () => {
  const s = createState([['A','B','B','B'], ['A'], ['A','A'], ['B'], []]);
  const before = snapshot(s);
  assert.deepEqual(move(s,0,3), {source:0,destination:3,color:'B',count:3});
  assert.equal(s.moves,1);
  assert.deepEqual(s.tubes[3], ['B','B','B','B']);
  assert.equal(undo(s),true);
  assert.deepEqual(snapshot(s),before);
});
test('partial group transfer moves only available capacity', () => {
  const p = createState([['A','B','B'], ['B','B'], ['A','A','A'], ['B'], []]);
  const t = move(p,1,0);
  assert.equal(t.count,1);
  assert.deepEqual(p.tubes[0], ['A','B','B','B']);
  assert.deepEqual(p.tubes[1], ['B','B']);
  assert.equal(undo(p),true);
});
test('invalid moves leave state and history untouched', () => {
  const s = createState(OPENING);
  const before = snapshot(s);
  for (const [a,b] of [[0,0],[0,1],[3,4],[-1,4],[0,50]]) assert.equal(move(s,a,b),null);
  assert.deepEqual(snapshot(s),before);
  assert.equal(s.history.length,0);
});
test('restart restores original state', () => {
  const s = createState(OPENING), before = snapshot(s);
  move(s,0,3); restart(s);
  assert.deepEqual(snapshot(s),before);
  assert.equal(s.moves,0);
  assert.equal(undo(s),false);
});
test('completion requires full monochrome tubes', () => {
  const s = createState([['A','A','A','A'],['B','B','B','B'],[]]);
  assert.equal(isSolved(s),true);
  assert.equal(move(s,0,2),null);
  assert.equal(isSolved(createState([['A','A'],['A','A'],['B','B','B','B'],[]])),false);
});
test('rejects invalid ball counts and capacity', () => {
  assert.throws(()=>validate([['A'],[]]));
  assert.throws(()=>validate([['A','A','A','A','A']]));
});
test('opening can be solved using legal grouped transfers', () => {
  const s = createState(OPENING);
  // Search bounded to a small opening; independent acceptance proof.
  const queue = [snapshot(s)], seen = new Set([JSON.stringify(queue[0])]);
  let solved = false;
  for (let head=0;head<queue.length && head<100000;head++) {
    const board = queue[head];
    if (isSolved({tubes:board})) {solved=true;break;}
    for(let a=0;a<board.length;a++)for(let b=0;b<board.length;b++) {
      const next=createState(board);
      if(!move(next,a,b))continue;
      const key=JSON.stringify(next.tubes);
      if(!seen.has(key)){seen.add(key);queue.push(snapshot(next));}
    }
  }
  assert.equal(solved,true);
});
