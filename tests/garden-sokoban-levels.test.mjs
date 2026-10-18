import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,parseLevel,isSolved} from '../games/garden-sokoban/rules.js';
import {SOKOBAN_LEVELS} from '../games/garden-sokoban/levels.js';

function shortestSolution(map){
  const initial=createState(map);
  const queue=[[initial.player,[...initial.crates].sort((a,b)=>a-b),0]];
  const visited=new Set();
  const deltas=[-100,100,-1,1];
  for(let head=0;head<queue.length&&head<220000;head++){
    const [player,crates,steps]=queue[head];
    const signature=player+'|'+crates.join(',');
    if(visited.has(signature))continue;
    visited.add(signature);
    if(crates.every(c=>initial.targets.has(c)))return steps;
    for(const d of deltas){
      const next=player+d;
      if(initial.walls.has(next))continue;
      let nextCrates=crates;
      if(crates.includes(next)){
        const beyond=next+d;
        if(initial.walls.has(beyond)||crates.includes(beyond))continue;
        nextCrates=crates.filter(c=>c!==next).concat(beyond).sort((a,b)=>a-b);
      }
      queue.push([next,nextCrates,steps+1]);
    }
  }
  return null;
}
test('fifteen unique levels are valid and solvable',()=>{
  assert.equal(SOKOBAN_LEVELS.length,15);
  const ids=new Set(),maps=new Set();
  for(const [index,level] of SOKOBAN_LEVELS.entries()){
    assert.ok(!ids.has(level.id),'duplicate ID '+level.id);
    ids.add(level.id);
    const signature=level.map.join('|');
    assert.ok(!maps.has(signature),'duplicate board '+level.id);
    maps.add(signature);
    const parsed=parseLevel(level.map);
    assert.ok(parsed.width<=8&&parsed.height<=8,'board too large for first collection');
    assert.equal(isSolved(createState(level.map)),false,'already solved '+level.id);
    const solution=shortestSolution(level.map);
    assert.ok(solution!==null,'unsolvable '+level.id);
    assert.ok(solution>=1,'no gameplay '+level.id);
    if(index>=10)assert.ok(solution>=5,'hard puzzle is too trivial '+level.id);
  }
});
