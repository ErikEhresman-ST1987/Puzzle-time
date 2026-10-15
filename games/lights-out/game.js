import {createState,play,undo,restart,solved} from './rules.js?v=3';
import {generatePuzzle,LEVELS} from './generator.js?v=3';
import {solve} from './solver.js?v=3';
import {createRenderer} from './renderer.js?v=3';
export async function mountLightsOut(host,status,undoButton){
const select=document.querySelector('#lights-difficulty'),recent={easy:[],medium:[],hard:[]},level=select.value,first=generatePuzzle(level),state=createState(first.board),renderer=await createRenderer(host,state),win=document.querySelector('#lights-win'),winNext=document.querySelector('#lights-win-next'),moves=document.querySelector('#lights-moves'),nextButton=document.querySelector('#lights-next'),hintButton=document.querySelector('#lights-hint');
recent[level].push(first.signature);let hint=null,puzzleNumber=1;
function refresh(){host.dataset.hint=hint===null?'':String(hint);renderer.draw();const done=solved(state.board);moves.textContent=String(state.moves);undoButton.disabled=!state.history.length;hintButton.disabled=done;win.classList.toggle('hidden',!done);status.textContent=done?'✨ Beautifully done! All the lights are off.':hint!==null?'Try the highlighted square. This is one possible next move.':`${select.selectedOptions[0].text} · Puzzle ${puzzleNumber} · Turn off every light.`;}
function down(event){if(event.button!==undefined&&event.button!==0)return;const index=renderer.cell(event);if(index===null)return;hint=null;if(play(state,index))refresh();}
function onUndo(){hint=null;if(undo(state))refresh();}
function onRestart(){hint=null;restart(state);refresh();}
function onNext(){const level=select.value,result=generatePuzzle(level,{exclude:new Set(recent[level])});state.size=LEVELS[level].size;state.initial=result.board.slice();state.board=result.board.slice();state.history=[];state.moves=0;hint=null;puzzleNumber++;recent[level].push(result.signature);if(recent[level].length>20)recent[level].shift();host.setAttribute('aria-label',`${state.size} by ${state.size} Lights Out puzzle grid`);refresh();}
function onLevel(){if(state.size===LEVELS[select.value].size)return;puzzleNumber=0;onNext();}
function onHint(){const solution=solve(state.board,state.size);hint=solution?.[0]??null;refresh();}
host.addEventListener('pointerdown',down);undoButton.addEventListener('click',onUndo);nextButton.addEventListener('click',onNext);hintButton.addEventListener('click',onHint);select.addEventListener('change',onLevel);select.addEventListener('input',onLevel);winNext.addEventListener('click',onNext);refresh();
return {restart:onRestart,next:onNext,destroy(){host.removeEventListener('pointerdown',down);undoButton.removeEventListener('click',onUndo);nextButton.removeEventListener('click',onNext);hintButton.removeEventListener('click',onHint);select.removeEventListener('change',onLevel);select.removeEventListener('input',onLevel);winNext.removeEventListener('click',onNext);win.classList.add('hidden');renderer.destroy();}};}
