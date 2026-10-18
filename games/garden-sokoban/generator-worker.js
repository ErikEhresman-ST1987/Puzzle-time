import {generateSokoban} from './generator.js';
self.onmessage=({data})=>{
  const {difficulty,seed,exclude=[]}=data;
  try{
    let result=null;
    for(let i=0;i<5;i++){
      const candidate=generateSokoban(difficulty,(seed+i*2654435761)>>>0);
      if(candidate&&!exclude.includes(candidate.map.join('|'))){result=candidate;break;}
    }
    self.postMessage({result});
  }catch(error){
    self.postMessage({error:String(error?.message||error)});
  }
};
