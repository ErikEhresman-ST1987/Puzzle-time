// Deterministic reverse-pull generator. Every candidate is checked by an A* push solver.
// The worker runs this module off the UI thread so iPad controls remain responsive.
const DIR=[-100,100,-1,1];
export const SOKOBAN_CONFIG={
  easy:{size:8,crates:2,walls:3,pulls:12,minPushes:7,maxStates:3500,attempts:28,minTurns:0,minSwitches:0},
  medium:{size:9,crates:4,walls:7,pulls:40,minPushes:14,maxStates:4500,attempts:32,minTurns:3,minSwitches:2},
  hard:{size:12,crates:5,walls:12,pulls:45,minPushes:14,maxStates:3000,attempts:20,minTurns:1,minSwitches:3}
};
function rng(seed){let x=(seed>>>0)||0x9e3779b9;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
function shuffle(a,random){for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function reachable(start,crates,walls){const seen=new Set([start]),q=[start];for(let i=0;i<q.length;i++)for(const d of DIR){const next=q[i]+d;if(!walls.has(next)&&!crates.has(next)&&!seen.has(next)){seen.add(next);q.push(next);}}return seen;}
function build(random,cfg){
  const size=cfg.size,walls=new Set(),open=[];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const id=y*100+x;if(!x||!y||x===size-1||y===size-1)walls.add(id);else open.push(id);}
  const spots=shuffle(open.slice(),random);let placed=0;
  // Hard boards mix short wall runs and isolated obstacles rather than using only scatter.
  if(size>=12){
    const runs=2+Math.floor(random()*3);
    for(let i=0;i<runs;i++){
      const horizontal=random()<.5;
      const x=2+Math.floor(random()*(size-5)),y=2+Math.floor(random()*(size-5));
      const length=2+Math.floor(random()*3);
      for(let j=0;j<length&&placed<cfg.walls;j++){
        const p=(y+(horizontal?0:j))*100+x+(horizontal?j:0);
        if(!walls.has(p)){walls.add(p);placed++;}
      }
    }
  }
  for(const p of spots){if(placed>=cfg.walls)break;const x=p%100,y=Math.floor(p/100);if(x<=1||x>=size-2||y<=1||y>=size-2)continue;walls.add(p);placed++;}
  const floor=open.filter(p=>!walls.has(p));
  const start=floor[Math.floor(random()*floor.length)],area=reachable(start,new Set(),walls);
  if(area.size<floor.length*.83)return null;
  const candidates=shuffle([...area].filter(p=>DIR.some(d=>area.has(p+d)&&area.has(p+2*d))),random);
  const targets=new Set(candidates.slice(0,cfg.crates));
  if(targets.size!==cfg.crates)return null;
  const crates=new Set(targets);
  const free=shuffle([...area].filter(p=>!crates.has(p)),random);
  let player=free[0],pulls=0;
  const snapshots=[];
  for(let turn=0;turn<cfg.pulls;turn++){
    const walk=reachable(player,crates,walls),options=[];
    for(const c of crates)for(const d of DIR){
      const beside=c+d,beyond=c+2*d;
      if(walk.has(beside)&&area.has(beyond)&&!crates.has(beyond))options.push([c,beside,beyond]);
    }
    if(!options.length)break;
    const pick=shuffle(options,random)[0];
    crates.delete(pick[0]);crates.add(pick[1]);player=pick[2];pulls++;
    if(pulls>=cfg.pulls/2&&pulls%5===0)snapshots.push({player,crates:[...crates]});
  }
  if(pulls<cfg.pulls/2)return null;
  snapshots.push({player,crates:[...crates]});
  return {size,walls,targets,snapshots};
}
export function solveSokoban(layout,limit=3000,deadline=Infinity){
  const {walls,targets,player,crates}=layout,goals=[...targets];
  function dist(a,b){return Math.abs(a%100-b%100)+Math.abs(Math.floor(a/100)-Math.floor(b/100));}
  function heuristic(boxes){
    let best=Infinity;
    function assign(i,mask,cost){
      if(cost>=best)return;
      if(i===boxes.length){best=cost;return;}
      for(let j=0;j<goals.length;j++)if(!(mask&(1<<j)))assign(i+1,mask|(1<<j),cost+dist(boxes[i],goals[j]));
    }
    assign(0,0,0);return best;
  }
  const heap=[];
  function push(node){
    heap.push(node);let i=heap.length-1;
    while(i){const p=(i-1)>>1;if(heap[p].f<=node.f)break;heap[i]=heap[p];i=p;}heap[i]=node;
  }
  function pop(){
    const first=heap[0],last=heap.pop();
    if(heap.length){
      let i=0;
      while(i*2+1<heap.length){
        let j=i*2+1;if(j+1<heap.length&&heap[j+1].f<heap[j].f)j++;
        if(heap[j].f>=last.f)break;
        heap[i]=heap[j];i=j;
      }
      heap[i]=last;
    }
    return first;
  }
  const visited=new Map();
  function add(p,boxes,g,trace=[]){
    const region=reachable(p,new Set(boxes),walls);
    const signature=boxes.join(',')+'|'+Math.min(...region);
    if((visited.get(signature)??Infinity)<=g)return;
    visited.set(signature,g);
    push({p,boxes,g,f:g+heuristic(boxes),region,trace});
  }
  add(player,crates.slice().sort((a,b)=>a-b),0);
  let expanded=0;
  while(heap.length&&expanded<limit){
    if((expanded&63)===0&&Date.now()>deadline)return null;
    const {boxes,g,region,trace}=pop();expanded++;
    if(boxes.every(b=>targets.has(b))){
      let turns=0,switches=0;
      for(let i=1;i<trace.length;i++){
        const sameCrate=trace[i][0]===trace[i-1][0]+trace[i-1][1];
        if(!sameCrate)switches++;
        if(sameCrate&&trace[i][1]!==trace[i-1][1])turns++;
      }
      return {pushes:g,states:expanded,turns,switches};
    }
    const set=new Set(boxes);
    for(const c of boxes)for(const d of DIR){
      const behind=c-d,ahead=c+d;
      if(!region.has(behind)||walls.has(ahead)||set.has(ahead))continue;
      add(c,boxes.map(b=>b===c?ahead:b).sort((a,b)=>a-b),g+1,[...trace,[c,d]]);
    }
  }
  return null;
}
function asMap(base,layout){
  const {size,walls,targets}=base,crates=new Set(layout.crates),map=[];
  for(let y=0;y<size;y++){
    let line='';
    for(let x=0;x<size;x++){
      const p=y*100+x;
      line+=walls.has(p)?'#':p===layout.player?(targets.has(p)?'+':'@'):crates.has(p)?(targets.has(p)?'*':'$'):targets.has(p)?'.':' ';
    }
    map.push(line);
  }
  return map;
}
export function generateSokoban(difficulty='medium',seed=1,options={}){
  const cfg=SOKOBAN_CONFIG[difficulty]||SOKOBAN_CONFIG.medium,random=rng(seed);
  const deadline=Number.isFinite(options.deadline)?options.deadline:Infinity;
  const attempts=Math.min(cfg.attempts,options.attempts??cfg.attempts);
  for(let attempt=0;attempt<attempts&&Date.now()<deadline;attempt++){
    const base=build(random,cfg);
    if(!base)continue;
    for(const candidate of base.snapshots.slice(-3).reverse()){
      if(Date.now()>deadline)return null;
      const rating=solveSokoban({...base,...candidate},cfg.maxStates,deadline);
      if(!rating||rating.pushes<cfg.minPushes||rating.turns<cfg.minTurns||rating.switches<cfg.minSwitches)continue;
      return {map:asMap(base,candidate),difficulty,seed,pushes:rating.pushes,turns:rating.turns,switches:rating.switches};
    }
  }
  return null;
}

// Dihedral canonical form: rotations/reflections are one puzzle, not eight.
export function canonicalSokobanKey(map){
  let board=map.map(row=>row.replace('@',' ').replace('+','.'));
  const variants=[];
  for(let rotation=0;rotation<4;rotation++){
    variants.push(board.join('|'));
    variants.push(board.map(row=>[...row].reverse().join('')).join('|'));
    board=board[0].split('').map((_,x)=>board.map(row=>row[x]).reverse().join(''));
  }
  return variants.sort()[0];
}
