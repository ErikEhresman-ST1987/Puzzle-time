// First-slice known-valid board. Generator and difficulty tuning are future work.
const colors=['A','B','C','D','E'];
export const SAMPLE={size:5,endpoints:Object.fromEntries(colors.map((c,y)=>[c,[[0,y],[4,y]]])),solution:Object.fromEntries(colors.map((c,y)=>[c,Array.from({length:5},(_,x)=>[x,y])]))};