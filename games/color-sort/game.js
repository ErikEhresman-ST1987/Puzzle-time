import {createState,move,undo,restart,isSolved} from './rules.js';
import {OPENING} from './puzzles.js';
import {generatePuzzle,TIERS} from './generator.js';
import {createColorSortRenderer} from './renderer.js?v=2';
export async function mountColorSort() {
  const section=document.querySelector('#color-sort-game');
  const host=document.querySelector('#color-sort-board');
  const status=document.querySelector('#color-sort-status');
  const win=document.querySelector('#color-sort-win');
  const undoButton=document.querySelector('#color-sort-undo');
  const restartButton=document.querySelector('#color-sort-restart');
  const difficulty=document.querySelector('#color-sort-difficulty');
  const nextButton=document.querySelector('#color-sort-next');
  const winNext=document.querySelector('#color-sort-win-next');
  let state=createState(OPENING);
  let sequence=0;
  let selected=null,disposed=false,busy=false;
  const renderer=await createColorSortRenderer(host,state);
  function refresh(message) {
    if(disposed)return;
    renderer.draw();
    const done=isSolved(state);
    win.classList.toggle('hidden',!done);
    undoButton.disabled=busy||!state.history.length;
    restartButton.disabled=busy;
    nextButton.disabled=busy;
    difficulty.disabled=busy;
    winNext.disabled=busy;
    status.textContent=message||(done?'Every tube is sorted!':state.moves+' moves · Tap a tube, then a destination.');
  }
  function choose(i) {
    if(disposed||busy||i<0||isSolved(state))return;
    if(selected===null) {
      if(!state.tubes[i].length){refresh('Choose a tube containing balls.');return;}
      selected=i;renderer.setSelected(i);refresh('Now tap an empty tube or a matching color.');
      return;
    }
    if(selected===i){selected=null;renderer.setSelected(null);refresh();return;}
    const action=move(state,selected,i);
    if(!action){
      if(state.tubes[i].length){selected=i;renderer.setSelected(i);refresh('Selected another tube. Choose a destination.');}
      else refresh('That move is not allowed.');
      return;
    }
    selected=null;renderer.setSelected(null);
    busy=true;refresh('Moving '+action.count+' ball'+(action.count===1?'':'s')+'…');
    renderer.transfer(action).then(()=>{if(disposed)return;busy=false;refresh();});
  }
  function newPuzzle(){
    if(busy||disposed)return;
    const tier=difficulty.value;
    nextButton.disabled=true;
    const generated=generatePuzzle(tier,(Date.now()+(++sequence)*2654435761)>>>0,{attempts:12});
    if(!generated){refresh('Could not verify a new '+tier+' puzzle. Try New Puzzle again.');return;}
    state=createState(generated.tubes);
    renderer.setState(state);
    selected=null;renderer.setSelected(null);
    refresh('New '+tier+' puzzle ready. Tap a tube to begin.');
  }
  const onDifficulty=()=>newPuzzle();
  const onTap=e=>choose(renderer.tubeAt(e));
  const onUndo=()=>{if(busy)return;selected=null;renderer.setSelected(null);undo(state);refresh();};
  const onRestart=()=>{if(busy)return;selected=null;renderer.setSelected(null);restart(state);refresh();};
  host.addEventListener('pointerdown',onTap);
  undoButton.addEventListener('click',onUndo);
  restartButton.addEventListener('click',onRestart);
  difficulty.addEventListener('change',onDifficulty);
  nextButton.addEventListener('click',newPuzzle);
  winNext.addEventListener('click',newPuzzle);
  // A restored select value must never disagree with the displayed board.
  // On opening, generate the selected tier rather than showing the fixed Easy opening.
  newPuzzle();
  return {destroy(){disposed=true;host.removeEventListener('pointerdown',onTap);undoButton.removeEventListener('click',onUndo);restartButton.removeEventListener('click',onRestart);difficulty.removeEventListener('change',onDifficulty);nextButton.removeEventListener('click',newPuzzle);winNext.removeEventListener('click',newPuzzle);win.classList.add('hidden');renderer.destroy();}};
}
