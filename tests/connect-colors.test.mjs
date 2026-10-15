import test from 'node:test';import assert from 'node:assert/strict';import {SAMPLE,PUZZLES} from '../games/connect-colors/puzzles.js';import {createState,begin,extend,complete,undo,restart,verifyPuzzle} from '../games/connect-colors/rules.js';
test('sample solution is legal and covers board',()=>assert.equal(verifyPuzzle(SAMPLE),true));
test('reject nonadjacent moves and foreign endpoints',()=>{const s=createState(SAMPLE);assert.equal(begin(s,'A',[0,0]),true);assert.equal(extend(s,'A',[3,0]),false);assert.equal(extend(s,'A',[0,1]),false);});
test('undo and restart',()=>{const s=createState(SAMPLE);begin(s,'A',[0,0]);extend(s,'A',[1,0]);undo(s);assert.equal(s.paths.A.length,1);restart(s);assert.equal(s.paths.A.length,0);assert.equal(s.history.length,0);});
test('incomplete is not complete',()=>assert.equal(complete(createState(SAMPLE)),false));
test('all sample paths complete',()=>{const s=createState(SAMPLE);for(const [c,path] of Object.entries(SAMPLE.solution)){for(const [i,p] of path.entries())assert.equal(i===0?begin(s,c,p):extend(s,c,p),true);}assert.equal(complete(s),true);});
test('all twelve layouts have legal full-board solutions',()=>{assert.equal(PUZZLES.length,12);for(const [i,puzzle] of PUZZLES.entries())assert.equal(verifyPuzzle(puzzle),true,`Puzzle ${i+1}`);});
