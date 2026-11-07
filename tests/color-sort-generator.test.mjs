import test from 'node:test';
import assert from 'node:assert/strict';
import {TIERS,verifyPuzzle,generatePuzzle} from '../games/color-sort/generator.js';
import {createState,move,isSolved} from '../games/color-sort/rules.js';
import {OPENING} from '../games/color-sort/puzzles.js';
test('four configured levels use increasing color counts',()=>{
 assert.deepEqual(Object.keys(TIERS),['easy','medium','hard','expert']);
 assert.deepEqual(Object.values(TIERS).map(t=>t.colors),[3,5,7,10]);
});
test('existing opening remains solvable',()=>{
 const proof=verifyPuzzle(OPENING);
 assert.equal(proof.solved,true);
 const s=createState(OPENING);
 for(const [a,b] of proof.path)assert.ok(move(s,a,b));
 assert.equal(isSolved(s),true);
});
test('generation is deterministic for a seed and never returns an unverified puzzle',()=>{
 const a=generatePuzzle('easy',1234,{attempts:3});
 const b=generatePuzzle('easy',1234,{attempts:3});
 assert.deepEqual(a.tubes,b.tubes);
 assert.equal(a.proof.solved,true);
});
test('rejects unsupported tiers',()=>assert.throws(()=>generatePuzzle('impossible',1)));
