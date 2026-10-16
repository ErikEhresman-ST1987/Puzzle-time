import {generatePuzzle} from './generator.js';
import {nextDeduction} from './difficulty.js';
import {createState,enter,restart,rows,columns,boxes,completedGroups,conflicts,isSolved} from './rules.js';
export function mountMiniSudoku(){
 const host=document.querySelector('#sudoku-board'),status=document.querySelector('#sudoku-status'),win=document.querySelector('#sudoku-win'),levelSelect=document.querySelector('#sudoku-difficulty');
 let state=createState(levelSelect.value),previous=new Set(),pulse=new Set(),pulseTimer=null,hintIndex=null,hintMessage='';
 const cells=[];
 for(let i=0;i<36;i++){const cell=document.createElement('button');cell.type='button';cell.className='sudoku-cell';cell.dataset.index=String(i);cell.addEventListener('click',()=>{state.selected=i;hintIndex=null;hintMessage='';render();});host.append(cell);cells.push(cell);}
 function render(){
  const done=new Set(completedGroups(state.board)),bad=conflicts(state.board),selected=state.selected;
  const row=selected===null?-1:Math.floor(selected/6),col=selected===null?-1:selected%6,box=selected===null?-1:Math.floor(row/2)*2+Math.floor(col/3);
  cells.forEach((cell,i)=>{
   const r=Math.floor(i/6),c=i%6,b=Math.floor(r/2)*2+Math.floor(c/3),v=state.board[i],given=state.initial[i]!==0;
   cell.textContent=v?String(v):'';
   cell.className='sudoku-cell'+(given?' given':'')+(selected===i?' selected':'')+(selected!==null&&(r===row||c===col||b===box)?' related':'')+(done.has(r)||done.has(6+c)?' complete-line':'')+(done.has(12+b)?' complete-box':'')+(bad.has(i)?' conflict':'')+(hintIndex===i?' sudoku-hint-cell':'')+((pulse.has(r)||pulse.has(6+c)||pulse.has(12+b))?' just-completed':'');
   cell.style.borderRight=c===2?'3px solid #7298b6':'';
   cell.style.borderBottom=r===1||r===3?'3px solid #7298b6':'';
   cell.setAttribute('aria-label',`Row ${r+1}, column ${c+1}: ${v||'empty'}${given?', given':''}${bad.has(i)?', conflict':''}`);
   cell.setAttribute('aria-pressed',String(selected===i));
  });
  win.classList.toggle('hidden',!isSolved(state.board));
  if(isSolved(state.board))status.textContent='Every row, column, and box is complete!';
  else if(hintMessage)status.textContent=hintMessage;
  else if(bad.size)status.textContent='Some numbers repeat in a row, column, or box.';
  else if(done.size)status.textContent=`${done.size} of 18 rows, columns, and boxes complete.`;
  else status.textContent='Choose a square, then tap a number.';
 }
 function update(){
  const next=new Set(completedGroups(state.board));pulse=new Set([...next].filter(x=>!previous.has(x)));previous=next;
  if(pulseTimer!==null)clearTimeout(pulseTimer);
  render();
  if(pulse.size){pulseTimer=setTimeout(()=>{pulse.clear();render();pulseTimer=null;},650);}
 }
 function input(n){if(state.selected===null||isSolved(state.board))return; if(enter(state,state.selected,n)){hintIndex=null;hintMessage='';update();}}
 function reset(level=state.level,board=null){state=createState(level);if(board){state.initial=board.slice();state.board=board.slice();}previous=new Set();pulse.clear();hintIndex=null;hintMessage='';update();}
 const keypad=document.querySelector('#sudoku-keypad');
 const onKeypad=e=>{const b=e.target.closest('button[data-number]');if(b)input(Number(b.dataset.number));};
 const onRestart=()=>{restart(state);previous=new Set();pulse.clear();hintIndex=null;hintMessage='';update();};
 const onHint=()=>{if(isSolved(state.board))return;const hint=nextDeduction(state.board);hintIndex=hint.index??null;hintMessage=hint.message;render();};
 const onDifficulty=()=>reset(levelSelect.value);
 const onNew=()=>{if(state.board.some((n,i)=>n!==state.initial[i])&&!isSolved(state.board)&&!window.confirm('Start a new puzzle? Your current entries will be lost.'))return;try{const result=generatePuzzle(state.level,state.initial);reset(state.level,result.board);}catch(err){console.error(err);hintMessage='Could not create a new puzzle. Please try again.';render();}};
 const onKeyboard=e=>{if(document.querySelector('#sudoku-game').classList.contains('hidden'))return;if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)return;if(/^[1-6]$/.test(e.key))input(Number(e.key));else if(e.key==='Backspace'||e.key==='Delete')input(0);};
 keypad.addEventListener('click',onKeypad);
 document.querySelector('#sudoku-hint').addEventListener('click',onHint);
 document.querySelector('#sudoku-next').addEventListener('click',onNew);
 document.querySelector('#sudoku-restart').addEventListener('click',onRestart);
 levelSelect.addEventListener('change',onDifficulty);
 document.addEventListener('keydown',onKeyboard);
 update();
 return {destroy(){if(pulseTimer!==null)clearTimeout(pulseTimer);keypad.removeEventListener('click',onKeypad);document.querySelector('#sudoku-hint').removeEventListener('click',onHint);document.querySelector('#sudoku-next').removeEventListener('click',onNew);document.querySelector('#sudoku-restart').removeEventListener('click',onRestart);levelSelect.removeEventListener('change',onDifficulty);document.removeEventListener('keydown',onKeyboard);host.replaceChildren();win.classList.add('hidden');},restart:onRestart};
}
