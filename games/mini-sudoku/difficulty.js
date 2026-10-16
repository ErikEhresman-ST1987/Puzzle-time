import {rows,columns,boxes,conflicts} from './rules.js';
const units=[...rows,...columns,...boxes];
export function candidates(board,index){
 if(board[index]!==0)return [];
 const r=Math.floor(index/6),c=index%6,b=Math.floor(r/2)*2+Math.floor(c/3);
 const used=new Set([...rows[r],...columns[c],...boxes[b]].map(i=>board[i]));
 return [1,2,3,4,5,6].filter(n=>!used.has(n));
}
export function nextDeduction(board){
 if(conflicts(board).size)return {type:'conflict',message:'There is a repeated number. Check the highlighted conflicts before asking for a hint.'};
 const opts=board.map((n,i)=>n?[]:candidates(board,i));
 for(let i=0;i<36;i++)if(!board[i]&&opts[i].length===0)return {type:'blocked',message:'An empty square has no possible numbers. Review your entries.'};
 for(let i=0;i<36;i++)if(opts[i].length===1)return {type:'naked-single',index:i,value:opts[i][0],message:`Look at row ${Math.floor(i/6)+1}, column ${i%6+1}. Only one number fits this square. Check its row, column, and box.`};
 for(let u=0;u<units.length;u++){
  const unit=units[u],missing=[1,2,3,4,5,6].filter(n=>!unit.some(i=>board[i]===n));
  for(const n of missing){const spots=unit.filter(i=>opts[i].includes(n));if(spots.length===1){
   const i=spots[0],label=u<6?`row ${u+1}`:u<12?`column ${u-5}`:`box ${u-11}`;
   return {type:'hidden-single',index:i,value:n,message:`In ${label}, there is only one square where ${n} can go. Look at the highlighted square and check the crossing groups.`};
  }}
 }
 return {type:'advanced',message:'No simple single is available. Try noting candidates in each empty square and look for pairs that eliminate options elsewhere.'};
}
