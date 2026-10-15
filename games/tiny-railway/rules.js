// One authoritative graph supplies both drawn rails and simulated routes.
export const NODES={start:[35,245],a:[150,245],aEnd:[215,300],bend:[205,170],b:[250,170],wrong:[335,260],rise:[300,105],c:[350,105],cEnd:[430,180],goal:[440,65]};
export const TRACKS=[['start','a'],['a','aEnd'],['a','bend'],['bend','b'],['b','wrong'],['b','rise'],['rise','c'],['c','cEnd'],['c','goal']];
export const SWITCHES=[{node:'a',choices:['aEnd','bend']},{node:'b',choices:['wrong','rise']},{node:'c',choices:['cEnd','goal']}];
export const INITIAL_SWITCHES=[false,true,true];
export const PUZZLE={start:NODES.start,junctions:SWITCHES.map(s=>NODES[s.node]),goal:NODES.goal};
export function validSwitches(s){return Array.isArray(s)&&s.length===3&&s.every(x=>typeof x==='boolean');}
export function createState(){return {switches:[...INITIAL_SWITCHES],phase:'ready'};}
export function toggleSwitch(state,index){if(state.phase!=='ready'||!Number.isInteger(index)||index<0||index>=SWITCHES.length)return false;state.switches[index]=!state.switches[index];return true;}
export function restart(state){state.switches=[...INITIAL_SWITCHES];state.phase='ready';}
export function selectedEdge(index,switches){if(!validSwitches(switches))throw Error('Three boolean switches required');const s=SWITCHES[index];if(!s)throw Error('Unknown switch');return [s.node,s.choices[Number(switches[index])]];}
export function route(switches){if(!validSwitches(switches))throw Error('Three boolean switches required');
 const names=['start','a'];for(let i=0;i<SWITCHES.length;i++){const sw=SWITCHES[i];if(names.at(-1)!==sw.node)throw Error('Route and switch graph disagree');const next=sw.choices[Number(switches[i])];names.push(next);if(next==='aEnd'||next==='wrong'||next==='cEnd')break;if(i===0)names.push('b');if(i===1)names.push('c');}
 // Intermediate bends are included as actual track nodes, never invented animation waypoints.
 const expanded=[];for(let i=0;i<names.length;i++){if(i&&names[i-1]==='a'&&names[i]==='b')expanded.push('bend');if(i&&names[i-1]==='b'&&names[i]==='c')expanded.push('rise');expanded.push(names[i]);}
 for(let i=1;i<expanded.length;i++)if(!TRACKS.some(([a,b])=>a===expanded[i-1]&&b===expanded[i]))throw Error('Route leaves rails');
 const last=expanded.at(-1);return {outcome:last==='goal'?'win':last==='wrong'?'wrong':'bumper',points:expanded.map(n=>NODES[n]),nodes:expanded,message:last==='goal'?'The train made it to Sunshine Station!':last==='wrong'?'Oops! That is the wrong station!':'Yikes! A little bump at the end of the line!'};
}
