// Increment 2: a three-junction route puzzle with misleading branches.
// A route is resolved entirely in rules; PixiJS only displays its result.
export const PUZZLE={start:[35,245],junctions:[[150,245],[250,170],[350,105]],goal:[440,65]};
export function route(switches){
 if(!validSwitches(switches))throw new Error('Three boolean switches required');
 const points=[[35,245],[150,245]];
 if(!switches[0])return {outcome:'bumper',points:[...points,[215,300]],message:'Yikes! A little bump at the end of the line!'};
 points.push([205,170],[250,170]);
 if(switches[1])return {outcome:'wrong',points:[...points,[335,260]],message:'Oops! That is the wrong station!'};
 points.push([300,105],[350,105]);
 if(!switches[2])return {outcome:'bumper',points:[...points,[430,180]],message:'Uh-oh! The track ends here!'};
 return {outcome:'win',points:[...points,[440,65]],message:'The train made it to Sunshine Station!'};
}
export function validSwitches(s){return Array.isArray(s)&&s.length===3&&s.every(x=>typeof x==='boolean');}
export function createState(){return {switches:[false,true,false],phase:'ready'};}
export function toggleSwitch(state,index){if(state.phase!=='ready'||!Number.isInteger(index)||index<0||index>=3)return false;state.switches[index]=!state.switches[index];return true;}
export function restart(state){state.switches=[false,true,false];state.phase='ready';}
