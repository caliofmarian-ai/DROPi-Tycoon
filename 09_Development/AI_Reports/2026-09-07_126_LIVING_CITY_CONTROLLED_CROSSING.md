# AI Report 126 — Living City Controlled Crossing

Date: 2026-09-07
Issue: #326
Playable Vision umbrella: #406
Pull request: #407
Branch: `openai/issue-326-living-city-crossings`

## Purpose

This slice begins the owner-directed Playable Vision convergence by making one central city intersection visibly obey pedestrian and traffic right-of-way rules. It intentionally prioritizes a player-visible city-life behavior over another invisible domain-only feature.

## Implemented behavior

- Added one authored controlled zebra crossing at the central Station Commons intersection.
- Added a dedicated ambient pedestrian that waits at a curb and crosses only during controlled pedestrian-priority windows.
- Added deterministic stop/go signal state tied to the same crossing cycle.
- Central horizontal ambient traffic yields at explicit stop lines while the pedestrian owns the crossing and resumes outside that phase.
- Already-cleared traffic is never pulled backwards.
- Ambient pedestrians render at `0.72` scale relative to the prior full courier-size presentation.
- Existing four authored ambient traffic routes remain present.
- Total ambient actor count remains capped at `22`.

## Mobile/performance boundaries

- No global pathfinding was introduced.
- No per-frame `Graphics` redraw was introduced.
- Zebra stripes, stop lines and signal are a small fixed set of Phaser primitives.
- Crossing state is pure deterministic runtime behavior.
- Ambient crossing state is not serialized and does not alter Save v2.
- The parallel asset-generation staging branch was not modified or consumed.

## Actor-budget correction history

The first implementation appended the crossing pedestrian to the existing ambient route list and then applied the global 22-actor slice. CI correctly found that this could remove one of the four pre-existing traffic routes.

The first correction reserved capacity for all four traffic routes, but CI then exposed a second edge: the crossing pedestrian itself could still be clipped because it was last among pedestrian routes.

The final model separates the mobile actor budget into three priorities:

1. one reserved controlled-crossing pedestrian slot;
2. all four authored traffic routes;
3. decorative sidewalk pedestrians using the remaining budget.

This preserves the new legal crossing behavior without silently reducing existing traffic variety.

## Tests

New `city-traffic-rules.test.ts` covers:

- deterministic 12-second crossing cycle;
- curb wait and legal crossing-only pedestrian movement;
- traffic yield at both approach stop lines;
- traffic movement outside pedestrian priority;
- cleared traffic not being moved backwards;
- strict controlled-crossing geometry.

Updated `living-city-ambient.test.ts` covers:

- bounded actor count;
- four preserved traffic routes;
- controlled pedestrian + traffic routes;
- reduced pedestrian scale;
- bounded zebra/signal creation;
- animation and offscreen culling;
- no ambient/crossing state in Save v2.

## CI evidence before report-inclusive final gate

Production Docker Runtime Smoke passed on the implementation head, proving the real final Docker image boots after the earlier #403/#405 production-runtime incident.

Main CI run #302 (`34149640947`) passed completely:

- 72/72 test files;
- 1048/1048 tests;
- TypeScript and Vite production build;
- production server HTTP smoke;
- PR-range whitespace;
- archived runtime protection;
- canonical planning YAML;
- active planning crosswalk;
- Prototype v0.1 owner progression gate.

Earlier CI runs are intentionally retained as useful evidence:

- run #300 failed because the new pedestrian displaced the fourth traffic route;
- run #301 failed because the crossing pedestrian could still be clipped after traffic capacity was reserved;
- both failures were corrected in implementation rather than weakening the product acceptance expectations.

## Known project warnings

Unchanged project-wide warnings remain:

- Vite bundle is larger than the 500 kB warning threshold;
- `npm audit` reports 2 vulnerabilities (1 moderate, 1 high);
- GitHub Actions warns that checkout/setup-node actions target Node 20 while the runner forces Node 24; project runtime remains Node 22.12.0.

This report does not claim those warnings are resolved.

## Owner verification gate

This is a visible gameplay change. Issue #326 must not be closed until owner Android review confirms:

- the zebra/signal are visible near the central intersection;
- the ambient pedestrian is visibly smaller than the player courier;
- the pedestrian waits at the curb and crosses only on the zebra;
- traffic visibly stops at the line and resumes afterwards;
- there is no pedestrian/vehicle overlap at the crossing;
- Android remains smooth and stable during normal movement around the area.
