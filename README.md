# Puzzle Time

Puzzle Collection — Goal Box v1.0 and Foundation Plan v1.0 govern development.

## Current development branch

Connect the Colors: responsive PixiJS board, drag/tap paths, undo, restart, New Puzzle, collection navigation, and Easy (5×5), Medium (6×6), Hard (7×7).

Procedural candidates are built from randomized full-board paths, then checked against the authoritative rules and an independent bounded solver for **at least one complete solution**. Generation has fixed attempt/node budgets and a known-valid fallback for every board size. This does **not** establish solution uniqueness or calibrated difficulty; those are future quality gates. Difficulty currently reflects board size and pair count only. Repetition remains possible.

The solver and generator are isolated from PixiJS and tested through Node's built-in test runner. GitHub Actions runs `npm test` on pushes. Browser and iPad playtesting of the generator increment remain outstanding.

## Dependency

PixiJS 8.21.0 (MIT) is vendored at `vendor/pixi.min.js` and loaded locally. No runtime CDN is needed.

## Development

`npm test` on Node.js 20+. Serve through HTTP (for ES modules). GitHub Pages currently publishes `dev/connect-colors-slice-1`.

## Architecture

`js/app.js`: navigation. `games/connect-colors/rules.js`: authoritative game state. `generator.js`: candidate generation and bounded acceptance. `solver.js`: independent bounded solvability checks. `game.js`: player input and puzzle selection. `renderer.js`: PixiJS drawing.

## Next acceptance

Verify Easy, Medium, and Hard on an iPad: drawing, undo, restart, completion, New Puzzle, returning to menu, and no loading freezes. Then assess challenge and repetition. Do not mark procedural generation complete until uniqueness, variety, and performance acceptance are established.
