import {createState,move,undo,restart,isSolved} from './rules.js';
import {SOKOBAN_LEVELS} from './levels.js';
import {createGardenRenderer} from './renderer.js';

const STORAGE_KEY='puzzle-time-garden-sokoban-v1';
function readProgress(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!saved||typeof saved!=='object')return {index:0,completed:[]};
    return {index:Number.isInteger(saved.index)&&saved.index>=0&&saved.index<SOKOBAN_LEVELS.length?saved.index:0,completed:Array.isArray(saved.completed)?saved.completed.filter(id=>SOKOBAN_LEVELS.some(l=>l.id===id)):[]};
  }catch{return {index:0,completed:[]};}
}
export async function mountGardenSokoban(){
  const section=document.querySelector('#sokoban-game');
  const host=document.querySelector('#sokoban-board');
  const status=document.querySelector('#sokoban-status');
  const win=document.querySelector('#sokoban-win');
  const undoButton=document.querySelector('#sokoban-undo');
  const controls=document.querySelector('#sokoban-controls');
  const picker=document.querySelector('#sokoban-level');
  const progressLabel=document.querySelector('#sokoban-progress');
  const previous=document.querySelector('#sokoban-previous');
  const next=document.querySelector('#sokoban-next');
  const restartButton=document.querySelector('#sokoban-restart');
  const saved=readProgress();
  let index=saved.index;
  const completed=new Set(saved.completed);
  const state=createState(SOKOBAN_LEVELS[index].map);
  const renderer=await createGardenRenderer(host,state);
  let startPoint=null;
  const directions={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  function persist(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({index,completed:[...completed]}));}catch{}
  }
  function refreshPicker(){
    picker.replaceChildren();
    SOKOBAN_LEVELS.forEach((level,i)=>{
      const option=document.createElement('option');
      option.value=String(i);
      option.textContent=(completed.has(level.id)?'✓ ':'')+`${i+1}. ${level.difficulty} — ${level.title}`;
      picker.appendChild(option);
    });
    picker.value=String(index);
    progressLabel.textContent=`${completed.size} / ${SOKOBAN_LEVELS.length} complete`;
    previous.disabled=index===0;
    next.disabled=index===SOKOBAN_LEVELS.length-1;
  }
  function refresh(){
    renderer.draw();
    const done=isSolved(state);
    if(done&&!completed.has(SOKOBAN_LEVELS[index].id)){
      completed.add(SOKOBAN_LEVELS[index].id);
      persist();
    }
    win.classList.toggle('hidden',!done);
    undoButton.disabled=!state.history.length;
    status.textContent=done?'Garden complete! Choose Next Puzzle to continue.':`Puzzle ${index+1} of ${SOKOBAN_LEVELS.length} · Moves: ${state.history.length}`;
    refreshPicker();
  }
  function loadLevel(nextIndex){
    if(!Number.isInteger(nextIndex)||nextIndex<0||nextIndex>=SOKOBAN_LEVELS.length)return;
    index=nextIndex;
    Object.assign(state,createState(SOKOBAN_LEVELS[index].map));
    persist();
    refresh();
  }
  function step(direction){if(move(state,direction))refresh();}
  function onControl(event){
    const button=event.target.closest('button[data-direction]');
    if(button)step(button.dataset.direction);
  }
  function onKey(event){
    if(section.classList.contains('hidden')||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.target instanceof HTMLInputElement||event.target instanceof HTMLSelectElement||event.target instanceof HTMLTextAreaElement)return;
    const direction=directions[event.key];
    if(!direction)return;
    event.preventDefault();
    step(direction);
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
  function onUndo(){if(undo(state))refresh();}
  function onRestart(){restart(state);refresh();}
  function onPicker(){loadLevel(Number(picker.value));}
  function onPrevious(){loadLevel(index-1);}
  function onNext(){loadLevel(index+1);}
  controls.addEventListener('click',onControl);
  document.addEventListener('keydown',onKey);
  host.addEventListener('pointerdown',onPointerDown);
  host.addEventListener('pointerup',onPointerUp);
  host.addEventListener('pointercancel',onPointerCancel);
  undoButton.addEventListener('click',onUndo);
  restartButton.addEventListener('click',onRestart);
  picker.addEventListener('change',onPicker);
  previous.addEventListener('click',onPrevious);
  next.addEventListener('click',onNext);
  refresh();
  return {restart:onRestart,destroy(){
    controls.removeEventListener('click',onControl);
    document.removeEventListener('keydown',onKey);
    host.removeEventListener('pointerdown',onPointerDown);
    host.removeEventListener('pointerup',onPointerUp);
    host.removeEventListener('pointercancel',onPointerCancel);
    undoButton.removeEventListener('click',onUndo);
    restartButton.removeEventListener('click',onRestart);
    picker.removeEventListener('change',onPicker);
    previous.removeEventListener('click',onPrevious);
    next.removeEventListener('click',onNext);
    win.classList.add('hidden');
    renderer.destroy();
  }};
}
