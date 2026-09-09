# DT-04 Production Web Bundle Audit

Date: 2026-09-09
Owner lane: DT-04 — CI / Railway Production Guardian
Scope: production web build and CI regression protection only

## Baseline

The audited baseline is `main` commit `36beafa99a7d711e6c74ce7871e4df304d0277bc`.

The production Vite build emits one client JavaScript artifact:

- `dist/assets/index-C0UbNMMC.js`
- exact raw size: `4,053,656 B`
- deterministic Node zlib gzip level 9 size: `1,020,368 B`

Vite's console reporter displays the same artifact as approximately `4,053.65 kB` raw and `1,059.88 kB` gzip. The CI regression gate intentionally does not use the rounded reporter gzip value. It recompresses the emitted bytes with Node `zlib.gzipSync(..., { level: 9 })` and compares exact integer byte counts so the measurement is deterministic inside the repository's CI runtime.

## Regression gate

`game-web/scripts/check-production-bundle-size.mjs` recursively enumerates every `dist/assets/*.js` file, sorts the paths, and sums both raw bytes and deterministic gzip-9 bytes.

This is deliberately a total-shipped-JavaScript budget rather than a single-filename budget. Future code splitting therefore cannot evade the guard merely by producing several smaller chunks.

Current tolerances are intentionally narrow enough to catch material accidental growth while allowing small toolchain/minification drift:

- raw tolerance: `131,072 B` (`128 KiB`)
- gzip-9 tolerance: `49,152 B` (`48 KiB`)
- raw limit: `4,184,728 B`
- gzip-9 limit: `1,069,520 B`

Changing the baseline is a reviewed operation. It must not be raised simply to make a regression pass. A baseline update should point at an intentional, reviewed `main` artifact after either a measured optimization or an explicitly accepted product-size change.

## Current bundle contributors

The client entrypoint imports Phaser directly and constructs the Phaser game immediately. The game configuration also statically imports and registers ten scenes at startup:

1. Approved Asset Main Menu
2. Game World
3. Global Map
4. HQ Interior
5. Marketplace Interior
6. Company Management
7. Employee Management
8. Financial Report
9. Customer Reviews
10. Vehicle Fleet

This eager scene graph makes the current one-chunk result structurally unsurprising. Phaser is the primary framework-level client dependency. The server-side `postgres` dependency is not a client bundle contributor.

Regional/locality datasets served from `public/data` are runtime-fetched assets rather than modules embedded into the initial JavaScript bundle, so they should remain outside this JavaScript budget unless the loading architecture changes.

## Code-splitting audit

Vite currently warns that the emitted chunk is larger than 500 kB after minification and recommends dynamic imports/code splitting.

The highest-value optimization opportunity is to keep only startup-critical code eager and evaluate lazy loading for scenes/features that are not needed to render the first playable surface. Candidate boundaries include management/reporting/review/fleet/interior surfaces that are entered after startup.

This should not be implemented blindly inside the regression-gate PR. Phaser scene registration and transitions are runtime-sensitive, and the Android shell ultimately consumes this web runtime. Any code-splitting change therefore requires focused web startup/transition tests plus Android startup and navigation validation.

## P1 follow-up recommendation

Create a dedicated P1 performance issue to reduce the initial production JavaScript footprint while preserving the total-shipped-JavaScript regression gate. The optimization slice should:

- establish a measurable reduction from `4,053,656 B` raw / `1,020,368 B` gzip-9;
- investigate safe lazy/dynamic loading boundaries rather than hiding size through arbitrary chunk names;
- preserve startup, scene transitions, save/authority behavior, and production Docker smoke coverage;
- keep Railway/server semantics unchanged unless a separate infrastructure task explicitly requires them;
- require Android owner validation if runtime loading behavior becomes player-visible.

## Conclusion

The current bundle is deployable and passes the production build/smoke pipeline, but its single eager JavaScript artifact is materially large for mobile cold-start/download/parse cost. PR #597 adds a deterministic CI guard so this existing debt cannot grow materially unnoticed while the dedicated P1 optimization is handled separately.
