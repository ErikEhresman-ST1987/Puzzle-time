// Rotation/reflection-invariant endpoint signature; color names and endpoint order are irrelevant.
export function puzzleSignature(puzzle){const n=puzzle.size;const transforms=[([x,y])=>[x,y],([x,y])=>[n-1-x,y],([x,y])=>[x,n-1-y],([x,y])=>[n-1-x,n-1-y],([x,y])=>[y,x],([x,y])=>[n-1-y,x],([x,y])=>[y,n-1-x],([x,y])=>[n-1-y,n-1-x]];const canonical=transforms.map(fn=>Object.values(puzzle.endpoints).map(pair=>pair.map(p=>fn(p).join(',')).sort().join('|')).sort().join(';'));return n+':'+canonical.sort()[0];}
export function pathComplexity(puzzle){const paths=Object.values(puzzle.solution??{});let turns=0,short=0;for(const path of paths){if(path.length<=2)short++;for(let i=2;i<path.length;i++){const a=path[i-2],b=path[i-1],c=path[i];if(b[0]-a[0]!==c[0]-b[0]||b[1]-a[1]!==c[1]-b[1])turns++;}}return {turns,shortPaths:short};}

/**
 * Descriptive difficulty signals, not a validated human difficulty score.
 * Only endpoints are visible to the player; solution geometry is diagnostic.
 */
export function difficultySignals(puzzle){
 const n=puzzle.size,pairs=Object.values(puzzle.endpoints),paths=Object.values(puzzle.solution??{});
 const distances=pairs.map(([a,b])=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]));
 const minimumDistance=distances.reduce((sum,v)=>sum+v,0);
 const pathLength=paths.reduce((sum,p)=>sum+p.length-1,0);
 const turns=pathComplexity(puzzle).turns;
 let closeEndpoints=0,nearForeignEndpoints=0;
 const all=pairs.flat();
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
  const d=Math.abs(all[i][0]-all[j][0])+Math.abs(all[i][1]-all[j][1]);
  if(d===1){if(Math.floor(i/2)===Math.floor(j/2))closeEndpoints++;else nearForeignEndpoints++;}
 }
 // An endpoint surrounded by other endpoints offers fewer immediate routing choices.
 let constrained=0;
 for(const [x,y] of all){let options=0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=n||yy>=n)continue;if(!all.some(([ex,ey])=>ex===xx&&ey===yy))options++;}if(options<=1)constrained++;}
 return {size:n,pairs:pairs.length,minimumDistance,excessPathLength:pathLength-minimumDistance,turns,closeEndpoints,nearForeignEndpoints,constrainedEndpoints:constrained};
}
