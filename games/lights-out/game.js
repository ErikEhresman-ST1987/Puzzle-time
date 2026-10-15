import {createState,play,undo,restart,solved} from './rules.js';
import {generateEasy} from './generator.js';
import {solve} from './solver.js';
import {createRenderer} from './renderer.js';
export async function mountLightsOut(host,status,undoButton){const recent=[],first=generateEasy(),state=createState(first.board),renderer=await createRenderer(host,state),win=document.querySelector('#lights-win'),winNext=document.querySelector('#lights-win-next'),moves=document.querySelector('#lights-moves'),nextButton=document.querySelector('#lights-next'),hintButton=document.querySelector('#lights-hint');recent.push(first.signature);let hint=null,puzzleNumber=1;
function refresh(){renderer.draw();const done=solved(state.board);moves.textContent=String(state.moves);undoButton.disabled=!state.history.length;hintButton.disabled=done;win.classList.toggle('hidden',!done);status.textContent=done?'✨ Beautifully done! All the lights are off.':hint!==null?'Try the highlighted square. This is one possible next move.':`Easy · Puzzle ${puzzleNumber} · Turn off every light.`;host.dataset.hint=hint===null?'':String(hint);}
function down(event){if(event.button!==undefined&&event.button!==0)return;const index=renderer.cell(event);if(index===null)return;hint=null;if(play(state,index))refresh();}
function onUndo(){hint=null;if(undo(state))refresh();}
function onRestart(){hint=null;restart(state);refresh();}
function onNext(){const result=generateEasy({exclude:new Set(recent)});state.initial=result.board.slice();state.board=result.board.slice();state.history=[];state.moves=0;hint=null;puzzleNumber++;recent.push(result.signature);if(recent.length>30)recent.shift();refresh();}
function onHint(){const solution=solve(state.board);hint=solution?.[0]??null;refresh();}
host.addEventListener('pointerdown',down);undoButton.addEventListener('click',onUndo);nextButton.addEventListener('click',onNext);hintButton.addEventListener('click',onHint);winNext.addEventListener('click',onNext);refresh();return {restart:onRestart,next:onNext,destroy(){host.removeEventListener('pointerdown',down);undoButton.removeEventListener('click',onUndo);nextButton.removeEventListener('click',onNext);hintButton.removeEventListener('click',onHint);winNext.removeEventListener('click',onNext);win.classList.add('hidden');renderer.destroy();}};}
