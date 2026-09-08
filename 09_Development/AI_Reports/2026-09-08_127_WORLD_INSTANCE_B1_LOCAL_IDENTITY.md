# Report 127 — World Instance B1 Local Identity

**Date:** 2026-09-08
**Issue:** #515
**Parent:** #421
**PR:** #518
**Track:** Phase-1 Track B / B1 — World Instance + worldActor identity

## Objective

Materialize the first runtime-safe World Instance/account/hero identity contract without activating authentication, durable world-local persistence, multiplayer authority, or visible UI.

## Implemented contract

- added explicit `WorldIdentityState` with:
  - `worldInstanceId`;
  - `accountId`;
  - `heroActorId`;
  - `baselineVersion`;
  - `mapDatasetVersion`;
  - local identity mode;
- account identity remains distinct from world-local hero identity;
- hero identity is deterministically derived from `(accountId, worldInstanceId)`;
- the same account/world pair cannot materialize two different local hero IDs through the canonical helper;
- different World Instances produce different world-local hero IDs for the same account;
- malformed or forged hero identity is repaired from authoritative account/world inputs;
- new and replaced runtime sessions materialize valid local identity;
- current Save v2 serialization remains unchanged by design.

## B1 / B2 boundary

`09_Development/Planning/PHASE1_IMPLEMENTATION_SEQUENCE.md` separates B1 identity from B2 durable world-local persistence. Therefore this slice deliberately does not serialize `worldIdentity` into Save v2. Legacy/local runtime restore deterministically rematerializes the same local legacy identity. Durable World Instance persistence remains a separate governed child of #421.

## Files

- `game-web/src/types/worldIdentity.ts`
- `game-web/src/systems/worldIdentitySystem.ts`
- `game-web/src/types/game.ts`
- `game-web/src/state/gameSession.ts`
- `game-web/tests/world-identity.test.ts`

## Automated validation before report commit

PR #518 head `72cf444d210fe9dbf4abff9e5340a2892a6991c8` passed both required workflows:

### DROPi Tycoon Prototype CI
- 90/90 test files passed;
- 1127/1127 tests passed;
- 8/8 new World Identity tests passed;
- TypeScript passed;
- Vite production build passed;
- production HTTP smoke passed;
- PR-range whitespace gate passed;
- archived `Game/` unchanged gate passed;
- canonical planning YAML passed;
- active planning crosswalk passed;
- Prototype v0.1 owner progression gate passed.

### Production Docker Runtime Smoke
- actual production image built successfully;
- final runtime container started successfully;
- application HTTP smoke passed;
- authority remained session-only by default.

## Compatibility

- no Save format bump;
- no serialized Save v2 field added;
- no Company Money or Personal Money reinterpretation;
- no Global Map/Country Catalog modifications;
- no asset-agent files modified;
- no Railway configuration change;
- no native Android-shell change.

## Security / authority boundary

The deterministic local fingerprint is not authentication material and does not prove account ownership. Production authentication, durable world identity, PostgreSQL-backed authority, and contested multiplayer writes remain later governed work.

## Known non-blocking repository warnings

The existing build still reports the known large Vite client chunk warning. The dependency tree still reports two npm audit findings (one moderate and one high). GitHub Actions continues to emit the known Node20-action-on-Node24 runner warning. None are claimed resolved by this slice.

## Owner review

This B1 slice has no visible gameplay or Android UI change. Android owner visual review is therefore not required to close #515 after final green CI and canonical Railway deployment.

## Finalization gate

This report commit changes the PR head. The complete Prototype CI and Production Docker Runtime Smoke must both pass again on the report-inclusive head before merge.
