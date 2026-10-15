export const PUZZLE={start:[35,245],junctions:[[150,245],[275,175]],goal:[430,110]};
export function route(switches){const first=!!switches[0],second=!!switches[1];if(!first)return {outcome:'bumper',points:[[35,245],[150,245],[215,300]],message:'Yikes! A little bump at the end of the line!'};if(!second)return {outcome:'wrong',points:[[35,245],[150,245],[205,175],[275,175],[365,250]],message:'Oops! That is the wrong station!'};return {outcome:'win',points:[[35,245],[150,245],[205,175],[275,175],[365,110],[430,110]],message:'The train made it to Sunshine Station!'};}
export function validSwitches(s){return Array.isArray(s)&&s.length===2&&s.every(x=>typeof x==='boolean');}
export function createState(){return {switches:[false,false],phase:'ready'};}
export function toggleSwitch(state,index){if(state.phase!=='ready'||(index!==0&&index!==1))return false;state.switches[index]=!state.switches[index];return true;}
export function restart(state){state.switches=[false,false];state.phase='ready';}
