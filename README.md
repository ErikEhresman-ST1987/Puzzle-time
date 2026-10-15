# Puzzle Time

First development slice: **Connect the Colors**. Governing documents: Puzzle Collection Goal Box v1.0 and Foundation Plan v1.0.

## Status
Collection menu, PixiJS board, one known-valid 5×5 board, pointer drawing, undo, restart, completion detection, and return to menu. Five Node rule tests passed locally. Browser activation, deployment, and real-device playtesting are not yet verified.

## Development
Run `npm test` with Node.js 20+. Serve over HTTP; ES modules do not work reliably with `file://`.

## Dependency limitation
PixiJS 8.13.2 is pinned via jsDelivr in `index.html`. This is temporary: the Foundation requires a verified locally vendored dependency, which could not be downloaded in this environment. The browser must be online.

## Ownership
`js/app.js` owns navigation; `rules.js` owns game truth; `game.js` routes input; `renderer.js` presents it. Generation, solver, difficulty, offline support, and persistence are deferred.

## Playtest
On phone/tablet, open Connect the Colors, drag each color across its row, undo, restart, complete all five paths, return to menu and reopen. Check touch scrolling, resizing, and drawing feel.