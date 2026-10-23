# Expert puzzle library — candidate evaluation

**Status: Prototype only. Not enabled in the published game.**

## Why this approach
On-demand Expert generation repeatedly exceeded Safari's time budget and reused Hard fallback layouts. The candidate library is generated in advance, with no generation or solver work required on the player's device.

## Candidate inventory
- 30 canonical-unique 12×12 layouts with six crates and six goals.
- Pre-generated offline from a reverse-pull generator with randomized walls.
- Every candidate was re-parsed and independently re-solved in a separate verification pass using the repository's A* solver with an increased search limit.
- Shortest solution lengths: 16–21 crate pushes.
- Rotation/reflection duplicates excluded by canonical map signature.
- Automated regression test: `tests/garden-sokoban-expert-library.test.mjs`.

## Release decision: HOLD
The Hard library has 14–21 minimum crate pushes, so these Expert candidates **overlap considerably with Hard** on the available objective measure. Six crates may make them more involved, but that is not sufficient evidence they feel genuinely Expert. Do not add an Expert button or ship the library as Expert until a harder-quality filter or playtesting establishes a meaningful difference.

## Next evaluation
1. Compare actual solving effort, number of crate-order dependencies, and player backtracking against Hard.
2. Reject simple/open-room and near-equivalent puzzles even if their literal maps differ.
3. Select a playtest subset, then seek user acceptance before enabling Expert.
4. Keep current Easy/Medium/Hard and saved progress untouched.

## Scope
This branch contains the candidate data and verification test only; no production game files, app shell, or publishing branch were modified.
