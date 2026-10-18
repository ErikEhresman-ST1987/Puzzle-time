import {mountGame} from '../games/connect-colors/game.js';

const home=document.querySelector('#home'),game=document.querySelector('#game'),host=document.querySelector('#board'),status=document.querySelector('#status'),undo=document.querySelector('#undo');let mounted=null;let opening=false;
async function open(){if(opening||mounted)return;opening=true;home.classList.add('hidden');game.classList.remove('hidden');status.textContent='Loading puzzle…';try{mounted=await mountGame(host,status,undo);}catch(err){console.error(err);status.textContent='Could not load the puzzle graphics. Please reload while online.';}finally{opening=false;}}
function back(){mounted?.destroy();mounted=null;game.classList.add('hidden');home.classList.remove('hidden');}
document.querySelector('#open-game').addEventListener('click',open);document.querySelector('#back').addEventListener('click',back);document.querySelector('#back-bottom').addEventListener('click',back);document.querySelector('#restart').addEventListener('click',()=>mounted?.restart());document.querySelector('#next').addEventListener('click',()=>mounted?.next());
const lightsSection=document.querySelector('#lights-game'),lightsHost=document.querySelector('#lights-board'),lightsStatus=document.querySelector('#lights-status'),lightsUndo=document.querySelector('#lights-undo');let lightsMounted=null,lightsOpening=false;
async function openLights(){if(lightsOpening||lightsMounted)return;lightsOpening=true;home.classList.add('hidden');lightsSection.classList.remove('hidden');lightsStatus.textContent='Loading puzzle…';try{const {mountLightsOut}=await import('../games/lights-out/game.js?v=4');lightsMounted=await mountLightsOut(lightsHost,lightsStatus,lightsUndo);}catch(err){console.error(err);lightsStatus.textContent='Could not load Lights Out. Please reload while online.';}finally{lightsOpening=false;}}
function backLights(){lightsMounted?.destroy();lightsMounted=null;lightsSection.classList.add('hidden');home.classList.remove('hidden');}
document.querySelector('#open-lights').addEventListener('click',openLights);document.querySelector('#lights-back').addEventListener('click',backLights);document.querySelector('#lights-back-bottom').addEventListener('click',backLights);document.querySelector('#lights-restart').addEventListener('click',()=>lightsMounted?.restart());


const sudokuSection=document.querySelector('#sudoku-game');let sudokuMounted=null;
async function openSudoku(){if(sudokuMounted)return;home.classList.add('hidden');sudokuSection.classList.remove('hidden');try{const {mountMiniSudoku}=await import('../games/mini-sudoku/game.js?v=4');sudokuMounted=mountMiniSudoku();}catch(err){console.error(err);document.querySelector('#sudoku-status').textContent='Could not load Mini Sudoku. Please reload while online.';}}
function backSudoku(){sudokuMounted?.destroy();sudokuMounted=null;sudokuSection.classList.add('hidden');home.classList.remove('hidden');}
document.querySelector('#open-sudoku').addEventListener('click',openSudoku);
document.querySelector('#sudoku-back').addEventListener('click',backSudoku);
document.querySelector('#sudoku-back-bottom').addEventListener('click',backSudoku);

const sokobanSection=document.querySelector('#sokoban-game');
let sokobanMounted=null,sokobanOpening=false;
async function openSokoban(){
  if(sokobanOpening||sokobanMounted)return;
  sokobanOpening=true;
  home.classList.add('hidden');
  sokobanSection.classList.remove('hidden');
  document.querySelector('#sokoban-status').textContent='Loading garden…';
  try {
    const {mountGardenSokoban}=await import('../games/garden-sokoban/game.js?v=7');
    sokobanMounted=await mountGardenSokoban();
  } catch(err) {
    console.error(err);
    document.querySelector('#sokoban-status').textContent='Garden Sokoban error: '+(err?.message||String(err));
  } finally {sokobanOpening=false;}
}
function backSokoban(){
  sokobanMounted?.destroy();
  sokobanMounted=null;
  sokobanSection.classList.add('hidden');
  home.classList.remove('hidden');
}
document.querySelector('#open-sokoban').addEventListener('click',openSokoban);
document.querySelector('#sokoban-back').addEventListener('click',backSokoban);
document.querySelector('#sokoban-back-bottom').addEventListener('click',backSokoban);
