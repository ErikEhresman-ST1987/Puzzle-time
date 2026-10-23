import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPERT_CANDIDATES} from '../games/garden-sokoban/expert-candidates.js';
import {canonicalSokobanKey,solveSokoban} from '../games/garden-sokoban/generator.js';

function parse(map){
  const walls=new Set(),targets=new Set(),crates=[];let player=null;
  for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++){
    const cell=map[y][x],id=y*100+x;
    if(cell==='#')walls.add(id);
    if('.+*'.includes(cell))targets.add(id);
    if('$*'.includes(cell))crates.push(id);
    if('@+'.includes(cell))player=id;
  }
  return {walls,targets,crates,player};
}

test('thirty pre-generated Expert candidates are unique, unsolved, and solver-verified',()=>{
  assert.equal(EXPERT_CANDIDATES.length,30);
  const unique=new Set();
  for(const candidate of EXPERT_CANDIDATES){
    assert.equal(candidate.map.length,12);
    assert.ok(candidate.map.every(row=>row.length===12));
    const key=canonicalSokobanKey(candidate.map);
    assert.ok(!unique.has(key),'rotated or reflected duplicate');
    unique.add(key);
    const layout=parse(candidate.map);
    assert.equal(layout.crates.length,6);
    assert.equal(layout.targets.size,6);
    assert.ok(layout.player!==null);
    assert.ok(!layout.crates.every(c=>layout.targets.has(c)),'already solved');
    assert.ok(candidate.pushes>=16);
    const rating=solveSokoban(layout,10000,Date.now()+12000);
    assert.ok(rating,'solver could not independently confirm candidate');
    assert.equal(rating.pushes,candidate.pushes);
  }
});
