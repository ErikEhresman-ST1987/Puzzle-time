import {generateSokoban} from './generator.js';
self.onmessage=({data})=>{
  const {difficulty,seed,exclude=[]}=data;
  const deadline=Date.now()+2500;
  try{
    let result=null;
    for(let i=0;i<3&&Date.now()<deadline;i++){
      const candidate=generateSokoban(difficulty,(seed+i*2654435761)>>>0,{deadline,attempts:10});
      if(candidate&&!exclude.includes(candidate.map.join('|'))){result=candidate;break;}
    }
    self.postMessage({result});
  }catch(error){
    self.postMessage({error:String(error?.message||error)});
  }
};
