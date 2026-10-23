import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,isSolved,parseLevel} from '../games/garden-sokoban/rules.js';
import {generateSokoban,solveSokoban,SOKOBAN_CONFIG,canonicalSokobanKey} from '../games/garden-sokoban/generator.js';

const DELTAS=[-100,100,-1,1];
function forwardReachable(start,crates,walls){
  const q=[start],seen=new Set(q);
  for(let i=0;i<q.length;i++)for(const d of DELTAS){
    const n=q[i]+d;
    if(!seen.has(n)&&!walls.has(n)&&!crates.has(n)){seen.add(n);q.push(n);}
  }
  return seen;
}
// Independent breadth-first push solver: validates generator claims without trusting A*.
function independentMinimumPushes(map,limit=120000){
  const initial=createState(map),queue=[[initial.player,[...initial.crates].sort((a,b)=>a-b),0]],seen=new Set();
  for(let head=0;head<queue.length&&head<limit;head++){
    const [player,boxes,pushes]=queue[head],set=new Set(boxes);
    const region=forwardReachable(player,set,initial.walls);
    if(boxes.every(b=>initial.targets.has(b)))return pushes;
    for(const crate of boxes)for(const d of DELTAS){
      if(!region.has(crate-d)||initial.walls.has(crate+d)||set.has(crate+d))continue;
      const next=boxes.map(b=>b===crate?crate+d:b).sort((a,b)=>a-b);
      const nextRegion=forwardReachable(crate,new Set(next),initial.walls);
      const id=next.join(',')+'|'+Math.min(...nextRegion);
      if(seen.has(id))continue;
      seen.add(id);
      queue.push([crate,next,pushes+1]);
    }
  }
  return null;
}
test('seeded generation is reproducible, nontrivial and independently solvable',()=>{
  for(const difficulty of ['easy','medium','hard']){
    const config=SOKOBAN_CONFIG[difficulty],boards=new Set();
    for(let seed=1;seed<=3;seed++){
      const puzzle=generateSokoban(difficulty,seed);
      assert.deepEqual(generateSokoban(difficulty,seed),puzzle,'same seed should recreate result');
      if(!puzzle)continue;
      const parsed=parseLevel(puzzle.map);
      assert.equal(parsed.initialCrates.size,config.crates);
      assert.equal(parsed.targets.size,config.crates);
      assert.equal(parsed.width,config.size);
      assert.equal(parsed.height,config.size);
      assert.equal(isSolved(createState(puzzle.map)),false);
      assert.ok(!boards.has(puzzle.map.join('|')),'duplicate generated board');
      boards.add(puzzle.map.join('|'));
      const optimal=independentMinimumPushes(puzzle.map);
      assert.ok(optimal!==null,`no solution: ${difficulty} seed ${seed}`);
      assert.ok(optimal>=config.minPushes,`too easy: ${difficulty} seed ${seed} (${optimal} pushes)`);
      assert.equal(puzzle.pushes,optimal,'generator difficulty estimate must match independent solver');
      const state=createState(puzzle.map);
      const aStar=solveSokoban({walls:state.walls,targets:state.targets,player:state.player,crates:[...state.crates]},config.maxStates);
      assert.equal(aStar?.pushes,optimal);
      assert.ok(puzzle.turns>=config.minTurns, 'insufficient crate direction changes');
      assert.ok(puzzle.switches>=config.minSwitches, 'insufficient crate interactions');
    }
    assert.ok(boards.size>=1,`too few successful ${difficulty} seeds`);
  }
});
test('verified backup layouts have meaningful solutions',()=>{
  const backups={
    easy:['########','#      #','#  ..  #','# #  # #','# $    #','# #  $@#','#      #','########'],
    medium:['########','#    ..#','#  $   #','#  ### #','#  #   #','# $ #$ #','# @  . #','########'],
    hard:['#########','#      .#','# $# #  #','#   #  .#','# $# $* #','#  # #@ #','#     # #','#   .   #','#########']
  };
  for(const [difficulty,map] of Object.entries(backups)){
    parseLevel(map);
    const min=independentMinimumPushes(map);
    assert.ok(min!==null&&min>=1,`backup ${difficulty} must be solvable`);
  }
});

test('rotations and reflections are considered the same puzzle',()=>{
  const map=['#####','# @ #','# $ #','# . #','#####'];
  const mirrored=map.map(row=>[...row].reverse().join(''));
  const rotated=map[0].split('').map((_,x)=>map.map(row=>row[x]).reverse().join(''));
  assert.equal(canonicalSokobanKey(map),canonicalSokobanKey(mirrored));
  assert.equal(canonicalSokobanKey(map),canonicalSokobanKey(rotated));
});
test('Hard variety board is 12x12 and retains five crates',()=>{
  assert.equal(SOKOBAN_CONFIG.hard.size,12);
  assert.equal(SOKOBAN_CONFIG.hard.crates,5);
});
