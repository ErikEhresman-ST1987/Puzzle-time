import {createState,move,undo,restart,isSolved} from './rules.js';
import {createGardenRenderer} from './renderer.js';

export async function mountGardenSokoban() {
  const section=document.querySelector('#sokoban-game');
  const host=document.querySelector('#sokoban-board');
  const status=document.querySelector('#sokoban-status');
  const win=document.querySelector('#sokoban-win');
  const undoButton=document.querySelector('#sokoban-undo');
  const controls=document.querySelector('#sokoban-controls');
  const state=createState();
  const renderer=await createGardenRenderer(host,state);
  let startPoint=null;
  const directions={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  function refresh() {
    renderer.draw();
    const done=isSolved(state);
    win.classList.toggle('hidden',!done);
    undoButton.disabled=!state.history.length;
    status.textContent=done?'Every crate is in place. Garden complete!':`Moves: ${state.history.length} · Plan carefully—crates cannot be pulled.`;
  }
  function step(direction) {
    if(move(state,direction)) refresh();
  }
  function onControl(event) {
    const button=event.target.closest('button[data-direction]');
    if(button) step(button.dataset.direction);
  }
  function onKey(event) {
    if(section.classList.contains('hidden') || event.altKey || event.ctrlKey || event.metaKey) return;
    if(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
    const direction=directions[event.key];
    if(!direction) return;
    event.preventDefault();
    step(direction);
  }
  function onPointerDown(event) {
    if(event.button!==undefined&&event.button!==0)return;
    startPoint={id:event.pointerId,x:event.clientX,y:event.clientY};
  }
  function onPointerUp(event) {
    if(!startPoint||startPoint.id!==event.pointerId)return;
    const dx=event.clientX-startPoint.x,dy=event.clientY-startPoint.y;
    startPoint=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;
    step(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
  }
  function onUndo(){if(undo(state))refresh();}
  function onRestart(){restart(state);refresh();}
  const restartButton=document.querySelector('#sokoban-restart');
  controls.addEventListener('click',onControl);
  document.addEventListener('keydown',onKey);
  host.addEventListener('pointerdown',onPointerDown);
  host.addEventListener('pointerup',onPointerUp);
  host.addEventListener('pointercancel',()=>{startPoint=null;});
  undoButton.addEventListener('click',onUndo);
  restartButton.addEventListener('click',onRestart);
  refresh();
  return {restart:onRestart,destroy(){
    controls.removeEventListener('click',onControl);
    document.removeEventListener('keydown',onKey);
    host.removeEventListener('pointerdown',onPointerDown);
    host.removeEventListener('pointerup',onPointerUp);
    undoButton.removeEventListener('click',onUndo);
    restartButton.removeEventListener('click',onRestart);
    win.classList.add('hidden');
    renderer.destroy();
  }};
}
