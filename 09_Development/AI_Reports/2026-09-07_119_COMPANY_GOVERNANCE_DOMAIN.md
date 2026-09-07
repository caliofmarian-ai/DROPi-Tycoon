# AI Report 119 — Company Governance Domain

Date: 2026-09-07
Issue: #388
Parent: #362
PR: #389

## Outcome

Implemented the non-visible company-governance foundation that separates permanent Founder history from mutable executive control and provides deterministic share-weighted voting plus anti-soft-lock leadership continuity.

## Canonical policy baseline

Policy: `prototype-governance-v1`.

- voting pools: actually held `InternalMember` and `ExternalMarket` units;
- treasury units: zero voting weight;
- quorum: 50% of snapshotted eligible voting units;
- approval: strict majority of participating voting units;
- exact tie: rejected;
- executive candidate: active company member required.

These are versioned governance-policy values, not historical company state.

## Implemented domain

- governance proposal state machine: Open, Approved, Rejected, Expired, Executed;
- frozen voting-weight snapshot at proposal creation;
- aggregated actor voting weight across enabled pools;
- one ballot per snapshotted actor;
- stable proposal, action, and command IDs;
- exact replay returns `DuplicateCommand` without a second mutation;
- conflicting reuse of a command ID returns `CommandIdConflict`;
- executive appointment re-checks candidate membership at execution;
- successful appointment changes only `executiveActorId` and preserves Founder identity and equity supply;
- double execution is blocked;
- malformed/forged governance state fails safe;
- executive continuity recovery selects the active member with the greatest Internal stake, then deterministic actor-ID tie-break;
- if no active member exists, historical Founder identity becomes bounded caretaker without restoring membership or shares.

## Canon

Added `02_Economy/GOVERNANCE.md`.

The canon explicitly states that Founder identity is historical and permanent while executive control is governed and replaceable.

## Tests

CI run #271 passed:

- 68/68 test files;
- 1013/1013 tests;
- 20/20 governance-domain tests;
- TypeScript and Vite production build;
- HTTP smoke test;
- PR-range whitespace validation;
- archived `Game/` unchanged;
- canonical planning YAML validation;
- active planning crosswalk validation;
- Prototype v0.1 owner progression gate.

## Non-blocking existing warnings

The project is not security-clean and this report does not claim otherwise.

Known warnings remain:

- Vite production bundle exceeds 500 kB after minification;
- npm audit reports 2 vulnerabilities: 1 moderate and 1 high;
- GitHub Actions warns that actions targeting Node 20 are being forced to Node 24 while the project runtime remains Node 22.12.0.

## Boundaries

This slice does not activate Save v2 persistence, runtime/UI governance surfaces, multiplayer authority, real securities, real money, blockchain, NFT, wallet, or DROPi token behavior.

## Next dependency

After #388, parent #362 requires a separate persistence/runtime activation slice integrating equity, Personal Money, treasury settlement, dividends, and governance with migration tests before visible Android owner review.
