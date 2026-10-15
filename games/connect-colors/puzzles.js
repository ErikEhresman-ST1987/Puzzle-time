// Preverified full-coverage layouts. These are finite samples, not procedural generation.
const N=5;
const snake=Array.from({length:25},(_,i)=>[Math.floor(i/5)%2===0?i%5:4-i%5,Math.floor(i/5)]);
const spiral=[];for(let layer=0;layer<3;layer++){for(let x=layer;x<5-layer;x++)spiral.push([x,layer]);for(let y=layer+1;y<5-layer;y++)spiral.push([4-layer,y]);if(4-layer>layer){for(let x=3-layer;x>=layer;x--)spiral.push([x,4-layer]);for(let y=3-layer;y>layer;y--)spiral.push([layer,y]);}}
const splits=[[5,5,5,5,5],[4,6,4,6,5],[3,7,5,6,4],[6,4,5,4,6],[7,6,6,6],[5,4,7,4,5]];
const transforms=[([x,y])=>[x,y],([x,y])=>[4-x,y],([x,y])=>[x,4-y],([x,y])=>[y,x],([x,y])=>[4-y,x],([x,y])=>[y,4-x]];
function build(i){const base=i%2?spiral:snake;const cells=base.map(transforms[Math.floor(i/2)%6]);const sizes=splits[(i*5+Math.floor(i/2))%splits.length];const solution={};const endpoints={};let offset=0;for(let k=0;k<sizes.length;k++){const color=String.fromCharCode(65+k);const path=cells.slice(offset,offset+sizes[k]);solution[color]=path;endpoints[color]=[path[0],path.at(-1)];offset+=sizes[k];}return {size:N,endpoints,solution};}
export const PUZZLES=Array.from({length:12},(_,i)=>build(i));
export const SAMPLE=PUZZLES[0];
