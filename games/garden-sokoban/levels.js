import {GARDEN_LEVEL} from './rules.js';

// Compact authored layouts; rotations and reflections provide additional practice.
// Each variant is independently validated by the automated solver test.
const STARTER=[
 ['#######','#     #','# @$. #','#     #','#     #','#######'],
 ['#######','#     #','#  @  #','#  $  #','#  .  #','#######'],
 ['#######','#     #','#  .  #','#  $  #','#  @  #','#######'],
 ['#######','#     #','# .   #','# $@  #','#     #','#######'],
 ['#######','#     #','#   . #','#  @$ #','#     #','#######']
];
const PLANNING=[
 ['########','#      #','#  ..  #','#  $$  #','#  @   #','#      #','########'],
 ['########','#      #','#  . . #','#  $ $ #','#   @  #','#      #','########'],
 ['########','#      #','# .  . #','# $  $ #','#   @  #','#      #','########'],
 ['########','#      #','#  .   #','#  $@  #','#   $  #','#   .  #','########'],
 ['########','#      #','# .    #','# $  @ #','#    $ #','#    . #','########']
];
const CHALLENGE=[
 GARDEN_LEVEL,
 ['########','# .    #','# $  . #','#  $   #','#   @  #','#   $ .#','#      #','########'],
 ['########','# .    #','# $    #','#      #','#   @  #','#   $ .#','#   $. #','########'],
 ['########','#      #','# .  . #','# $  $ #','#  @   #','#  $   #','#  .   #','########'],
 ['########','#  .   #','#  $   #','#      #','#  @ $ #','#    . #','#      #','########']
];
export const SOKOBAN_LEVELS=[
 ...STARTER.map((map,i)=>({id:'easy-'+(i+1),difficulty:'Easy',title:'Garden '+(i+1),map})),
 ...PLANNING.map((map,i)=>({id:'medium-'+(i+1),difficulty:'Medium',title:'Garden '+(i+6),map})),
 ...CHALLENGE.map((map,i)=>({id:'hard-'+(i+1),difficulty:'Hard',title:'Garden '+(i+11),map}))
];
