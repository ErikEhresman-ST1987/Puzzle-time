import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,parseLevel,move,undo,restart,isSolved,GARDEN_LEVEL} from '../games/garden-sokoban/rules.js';

const fixture=['#####','#@$.#','#   #','#####'];
test('garden level parses and preserves crates and targets',()=>{
  const state=createState();
  assert.equal(state.width,8);
  assert.equal(state.crates.size,3);
  assert.equal(state.targets.size,3);
  assert.equal(state.history.length,0);
  assert.equal(isSolved(state),false);
});
test('wall and edge blocking do not enter undo history',()=>{
  const s=createState(fixture);
  assert.equal(move(s,'up'),false);
  assert.equal(move(s,'left'),false);
  assert.equal(move(s,'diagonal'),false);
  assert.equal(s.history.length,0);
});
test('a legal push wins, and undo restores exact state',()=>{
  const s=createState(fixture),before=s.player,crates=[...s.crates];
  assert.equal(move(s,'right'),true);
  assert.equal(isSolved(s),true);
  assert.equal(move(s,'right'),false);
  assert.equal(s.history.length,1);
  assert.equal(undo(s),true);
  assert.equal(s.player,before);
  assert.deepEqual([...s.crates],crates);
  assert.equal(isSolved(s),false);
  assert.equal(undo(s),false);
});
test('crate blocked by another crate or wall cannot move',()=>{
  const s=createState(['#######','#@$$..#','#     #','#######']);
  assert.equal(move(s,'right'),false);
  assert.equal(s.history.length,0);
  const wall=createState(['######','#@$# #','#   .#','######']);
  assert.equal(move(wall,'right'),false);
});
test('walking, pushing off a target, and restart restore original state',()=>{
  const s=createState(['######','#@*  #','#    #','######']);
  assert.equal(move(s,'right'),true);
  assert.equal(isSolved(s),false);
  assert.equal(move(s,'down'),true);
  assert.equal(s.history.length,2);
  restart(s);
  assert.equal(s.history.length,0);
  assert.equal(s.player,s.initialPlayer);
  assert.deepEqual([...s.crates],[...s.initialCrates]);
});
test('reject malformed or unsafe level maps',()=>{
  for(const lines of [[],['##','#@'],['#####','#@X.#','#####'],['#####','#@$.#','####'],['#####','#@$$#','# . #','#####'],['#####','#@@.#','#####'],['#####','#@$.#','#   ']]) {
    assert.throws(()=>parseLevel(lines));
  }
});
test('first garden puzzle is solvable with meaningful planning',()=>{
  const initial=createState(GARDEN_LEVEL);
  const directions=['up','down','left','right'];
  const queue=[{player:initial.player,crates:[...initial.crates].sort((a,b)=>a-b),steps:[]}];
  const visited=new Set();
  let found=null;
  for(let head=0;head<queue.length && head<100000;head++){
    const item=queue[head],signature=item.player+'|'+item.crates.join(',');
    if(visited.has(signature))continue;
    visited.add(signature);
    if(item.crates.every(c=>initial.targets.has(c))){found=item.steps;break;}
    if(item.steps.length>65)continue;
    for(const direction of directions){
      const state=createState(GARDEN_LEVEL);
      state.player=item.player;state.crates=new Set(item.crates);
      if(move(state,direction))queue.push({player:state.player,crates:[...state.crates].sort((a,b)=>a-b),steps:[...item.steps,direction]});
    }
  }
  assert.ok(found,'A solver must find a solution');
  assert.ok(found.length>=15,'The first level must require more than a few obvious moves');
  const replay=createState(GARDEN_LEVEL);
  for(const direction of found) assert.equal(move(replay,direction),true);
  assert.equal(isSolved(replay),true);
});
