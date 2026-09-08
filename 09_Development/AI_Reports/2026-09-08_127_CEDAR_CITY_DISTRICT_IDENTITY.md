# AI Report 127 — Cedar City District Identity, Streets and Addresses

**Date:** 2026-09-08
**Issue:** #539
**Parent visual direction:** #327, #406
**Owner quality gate:** #317
**PR:** #540

## Purpose

The live Cedar City runtime remained visually repetitive even after the living-city controlled-crossing work. This slice improves immediate world readability without waiting for the parallel asset-generation pipeline and without changing gameplay coordinates, collisions, mission routes or simulation state.

## Implemented visible scope

### District identity

The six existing districts now receive different bounded, cached environmental cues:

- Residential / Old Town — courtyard treatment;
- Business / Cedar Commerce — commerce plaza;
- Storage / Foundry Quarter — industrial service yard;
- Company / Station Commons — logistics loading bays;
- Waterfront / Canal & Quays — quay treatment;
- Garden / Garden Borough — landscaped garden walk.

These cues are rendered into the existing half-resolution static city-ground texture. They add no per-frame drawing or simulation work.

### Street identity

Ten existing authored roads receive stable human-readable names:

- Cedar Avenue;
- Station Street;
- Willow Lane;
- Commerce Row;
- Foundry Road;
- Dispatch Way;
- Quayside Lane;
- Garden Walk;
- Orchard Road;
- South Esplanade.

The labels are a bounded presentation layer and do not change road IDs or routing semantics.

### Physical addresses

A bounded set of at most 18 representative physical buildings receives stable address plaques. The company HQ is address `1`; DROPi Marketplace is address `10`. Address presentation does not alter canonical building IDs, entrances or route points.

## Files

- `game-web/src/world/cityIdentity.ts` — new bounded district/street/address presentation model;
- `game-web/src/world/urbanPresentation.ts` — integrates district cues into the cached ground texture and renders bounded street/address labels once per scene construction;
- `game-web/tests/city-identity.test.ts` — deterministic identity and boundedness coverage.

## Asset-agent coordination

The parallel asset-generation/inventory agent owns candidate and production asset preparation. This implementation:

- does not modify `openai/assets-audit-board-crops-v1` or any other asset-agent branch;
- does not consume files from `08_Assets/.candidate-import/`;
- does not claim candidate crops as runtime-approved assets;
- keeps presentation replaceable so later approved building/environment assets can supersede the procedural/cached treatment without changing world logic.

## Safety boundaries

Unchanged:

- City -> District[] -> Location[] coordinates;
- road/building IDs;
- collision and walkability rules;
- mission pickup/delivery routes;
- #326 controlled crossing behavior;
- Save v2 and all economy state;
- Android actor budgets;
- Country Catalog and global-map data;
- Phase-1 research data;
- server authority;
- Railway configuration;
- React Native shell/gameplay boundary;
- token/blockchain/payment boundaries.

## Initial PR-head verification

GitHub Actions on the implementation head before this report:

- `98/98` test files passed;
- `1170/1170` tests passed;
- `city-identity.test.ts`: `4/4` passed;
- `city-art.test.ts`: `26/26` passed;
- `living-city-ambient.test.ts`: `7/7` passed;
- TypeScript and Vite production build passed;
- production HTTP smoke passed;
- PR-range whitespace validation passed;
- archived `Game/` unchanged guard passed;
- canonical planning YAML validation passed;
- active planning crosswalk passed;
- Prototype owner-progression gate passed;
- production Docker runtime smoke passed.

Known existing non-blocking warnings remain: the large Vite client bundle, npm audit findings, and GitHub Actions Node-version warning. This slice does not claim to resolve them.

## Final acceptance boundary

The implementation is a visible Android checkpoint. Automated verification can establish deterministic geometry, bounded object counts, build health and regression safety, but it cannot establish final real-device visual quality.

After the report-inclusive head is revalidated, merged and deployed through the canonical Railway service, the owner must review the installed Android runtime for:

- materially different district character;
- readable but non-dominating street signs and address plaques;
- absence of obvious label overlap;
- intact #326 crossing behavior;
- smooth navigation and camera/zoom performance.

#539, #327, #406 and #317 remain open until the relevant owner visual acceptance is explicitly recorded.
