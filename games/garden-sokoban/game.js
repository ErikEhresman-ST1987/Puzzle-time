import {createState,move,undo,restart,isSolved} from './rules.js';
import {createGardenRenderer} from './renderer.js';

const STORAGE_KEY='puzzle-time-garden-sokoban-v2';
// Verified backup layouts, used only if a browser cannot start its generation worker.
const BACKUP={
  easy:[
    ['########','#      #','#  ..  #','# #  # #','# $    #','# #  $@#','#      #','########'],
    ['########','#      #','# #  . #','#  $   #','#.# #  #','#   $@ #','#      #','########']
  ],
  medium:[
    ['########','#    ..#','#  $   #','#  ### #','#  #   #','# $ #$ #','# @  . #','########'],
    ['########','#$@   .#','#*     #','# # #  #','# #  # #','#.#  $ #','#      #','########']
  ],
  expert:[],
  hard:[
    ['#########','#      .#','# $# #  #','#   #  .#','# $# $* #','#  # #@ #','#     # #','#   .   #','#########'],
    ['#########','#    .  #','# $ $   #','# $   . #','#  #### #','# #@ # .#','#  $#   #','#      .#','#########']
  ]
};
// Rotations and reflections preserve Sokoban solvability and push complexity.
function transformedVariants(maps){
  const variants=new Map();
  for(const original of maps){
    let board=original.slice();
    for(let rotation=0;rotation<4;rotation++){
      for(const variant of [board,board.map(row=>[...row].reverse().join(''))]){
        variants.set(variant.join('|'),variant);
      }
      board=board[0].split('').map((_,x)=>board.map(row=>row[x]).reverse().join(''));
    }
  }
  return [...variants.values()];
}
const FALLBACK_VARIANTS=Object.fromEntries(Object.entries(BACKUP).map(([level,boards])=>[
  level,transformedVariants(boards.length?boards:BACKUP.hard)
]));
function readSaved(){
  try{
    const data=JSON.parse(localStorage.getItem(STORAGE_KEY));
    return data&&typeof data==='object'?data:null;
  }catch{return null;}
}
function seedNumber(){
  if(globalThis.crypto?.getRandomValues)return crypto.getRandomValues(new Uint32Array(1))[0];
  return Date.now()>>>0;
}
export async function mountGardenSokoban(){
  const section=document.querySelector('#sokoban-game');
  const host=document.querySelector('#sokoban-board');
  const status=document.querySelector('#sokoban-status');
  const win=document.querySelector('#sokoban-win');
  const undoButton=document.querySelector('#sokoban-undo');
  const restartButton=document.querySelector('#sokoban-restart');
  const controls=document.querySelector('#sokoban-controls');
  const difficultyPicker=document.querySelector('#sokoban-difficulty');
  const newButton=document.querySelector('#sokoban-new');
  const progressLabel=document.querySelector('#sokoban-progress');
  const saved=readSaved();
  const validDifficulties=['easy','medium','hard','expert'];
  let difficulty=validDifficulties.includes(saved?.difficulty)?saved.difficulty:'hard';
  let completed=Array.isArray(saved?.completed)?saved.completed.filter(s=>typeof s==='string').slice(-200):[];
  let seen=Array.isArray(saved?.seen)?saved.seen.filter(s=>typeof s==='string').slice(-100):[];
  let map=null,state=null,renderer=null,worker=null,disposed=false,pending=false;
  let moves=[],startPoint=null,requestId=0,backupActive=false,generationTimer=null;
  difficultyPicker.value=difficulty;
  const directions={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  const signature=lines=>lines.join('|');
  function save(){
    if(!map)return;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({difficulty,map,moves,completed,seen}));}catch{}
  }
  function refresh(){
    if(!state||!renderer)return;
    renderer.draw();
    const done=isSolved(state),id=signature(map);
    if(done&&!completed.includes(id)){
      completed=[...completed,id].slice(-200);
      save();
    }
    win.classList.toggle('hidden',!done);
    undoButton.disabled=pending||!state.history.length;
    restartButton.disabled=pending;
    newButton.disabled=pending;
    progressLabel.textContent=`${completed.length} completed`;
    if(!pending)status.textContent=done?'Garden complete! Select New Puzzle for another challenge.':backupActive?`${difficulty==='expert'?'Verified Hard fallback':'Verified backup'} · ${state.history.length} moves · Select New Puzzle to retry generation.`:`${difficulty[0].toUpperCase()+difficulty.slice(1)} · ${state.history.length} moves · Every puzzle is solver-checked.`;
  }
  async function applyMap(lines,restoredMoves=[]){
    const fresh=createState(lines);
    const validMoves=[];
    for(const direction of restoredMoves.slice(0,5000)){
      if(!directions[direction]&&!['up','down','left','right'].includes(direction))break;
      if(!move(fresh,direction))break;
      validMoves.push(direction);
    }
    if(disposed)return;
    map=lines.slice();
    moves=validMoves;
    if(state)Object.assign(state,fresh);else state=fresh;
    if(!renderer){
      renderer=await createGardenRenderer(host,state);
      if(disposed){renderer.destroy();renderer=null;return;}
    }
    pending=false;
    refresh();
    save();
  }
  function finishGeneration(result){
    if(disposed)return;
    clearTimeout(generationTimer);generationTimer=null;
    worker?.terminate();worker=null;
    let lines=result?.map;
    backupActive=false;
    try{if(!lines)throw new Error('No generated puzzle');createState(lines);}
    catch{
      backupActive=true;
      const choices=FALLBACK_VARIANTS[difficulty];
      const unused=choices.filter(candidate=>!seen.includes(signature(candidate))&&signature(candidate)!==signature(map||[]));
      if(unused.length){lines=unused[seedNumber()%unused.length];}
      else {
        pending=false;
        refresh();
        status.textContent='No fresh verified puzzles are available at this difficulty. Try Hard or another difficulty.';
        return;
      }
    }
    const id=signature(lines);
    if(!seen.includes(id))seen=[...seen,id].slice(-100);
    applyMap(lines).catch(error=>{
      console.error(error);
      pending=false;
      status.textContent='Could not display puzzle: '+(error?.message||String(error));
    });
  }
  function newPuzzle(){
    if(disposed)return;
    requestId++;
    clearTimeout(generationTimer);generationTimer=null;
    worker?.terminate();worker=null;
    pending=true;
    win.classList.add('hidden');
    status.textContent='Creating and checking a new garden puzzle…';
    undoButton.disabled=true;
    restartButton.disabled=true;
    newButton.disabled=true;
    try{
      worker=new Worker(new URL('./generator-worker.js',import.meta.url),{type:'module'});
      const thisRequest=requestId;
      generationTimer=setTimeout(()=>{if(thisRequest===requestId&&!disposed)finishGeneration(null);},4000);
      worker.onmessage=event=>{if(thisRequest!==requestId||disposed)return;finishGeneration(event.data.result);};
      worker.onerror=error=>{console.error('Sokoban generator',error);if(thisRequest===requestId)finishGeneration(null);};
      worker.postMessage({difficulty,seed:seedNumber(),exclude:seen});
    }catch(error){
      console.error('Sokoban worker unavailable',error);
      finishGeneration(null);
    }
  }
  function step(direction){
    if(pending||!state)return;
    if(move(state,direction)){moves.push(direction);refresh();save();}
  }
  function onControl(event){
    const button=event.target.closest('button[data-direction]');
    if(button)step(button.dataset.direction);
  }
  function onKey(event){
    if(section.classList.contains('hidden')||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.target instanceof HTMLInputElement||event.target instanceof HTMLSelectElement||event.target instanceof HTMLTextAreaElement)return;
    const direction=directions[event.key];
    if(!direction)return;
    event.preventDefault();step(direction);
  }
  function onPointerDown(event){
    if(event.button!==undefined&&event.button!==0)return;
    startPoint={id:event.pointerId,x:event.clientX,y:event.clientY};
  }
  function onPointerCancel(){startPoint=null;}
  function onPointerUp(event){
    if(!startPoint||startPoint.id!==event.pointerId)return;
    const dx=event.clientX-startPoint.x,dy=event.clientY-startPoint.y;
    startPoint=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;
    step(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
  }
  function onUndo(){
    if(pending||!state)return;
    if(undo(state)){moves.pop();refresh();save();}
  }
  function onRestart(){
    if(pending||!state)return;
    restart(state);moves=[];refresh();save();
  }
  function onDifficulty(){
    if(!validDifficulties.includes(difficultyPicker.value))return;
    difficulty=difficultyPicker.value;
    newPuzzle();
  }
  controls.addEventListener('click',onControl);
  document.addEventListener('keydown',onKey);
  host.addEventListener('pointerdown',onPointerDown);
  host.addEventListener('pointerup',onPointerUp);
  host.addEventListener('pointercancel',onPointerCancel);
  undoButton.addEventListener('click',onUndo);
  restartButton.addEventListener('click',onRestart);
  difficultyPicker.addEventListener('change',onDifficulty);
  newButton.addEventListener('click',newPuzzle);
  progressLabel.textContent=`${completed.length} completed`;
  if(Array.isArray(saved?.map)){
    try{
      createState(saved.map);
      await applyMap(saved.map,Array.isArray(saved.moves)?saved.moves:[]);
    }catch(error){console.warn('Ignoring invalid saved garden puzzle',error);newPuzzle();}
  }else newPuzzle();
  return {restart:onRestart,destroy(){
    disposed=true;requestId++;
    clearTimeout(generationTimer);generationTimer=null;
    worker?.terminate();worker=null;
    controls.removeEventListener('click',onControl);
    document.removeEventListener('keydown',onKey);
    host.removeEventListener('pointerdown',onPointerDown);
    host.removeEventListener('pointerup',onPointerUp);
    host.removeEventListener('pointercancel',onPointerCancel);
    undoButton.removeEventListener('click',onUndo);
    restartButton.removeEventListener('click',onRestart);
    difficultyPicker.removeEventListener('change',onDifficulty);
    newButton.removeEventListener('click',newPuzzle);
    win.classList.add('hidden');
    renderer?.destroy();
  }};
}
