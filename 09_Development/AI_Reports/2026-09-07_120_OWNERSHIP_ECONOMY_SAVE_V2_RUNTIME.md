# AI Report 120 — Ownership Economy Save v2 Runtime

Date: 2026-09-07
Issue: #390
Pull request: #391
Parent: #362
Status: Implementation complete; final report-inclusive CI required before merge

## 1. Purpose

This slice activates the completed ownership-economy domains inside the real local game session and existing Save v2 persistence boundary without introducing a new save version or visible ownership controls.

The implementation connects equity, Personal Money, treasury-share settlement, dividends and company governance while preserving the current prototype's existing Company Money and installed-save compatibility.

## 2. Save compatibility decision

`SAVE_FORMAT_VERSION` remains `2`.

The existing storage keys remain unchanged:

- `dropi.tycoon.save.v2`
- `dropi.tycoon.save.staging.v2`
- `dropi.tycoon.save.corrupted-backup.v2`

Ownership economy is an additive optional Save v2 field, following the established additive compatibility model already used by personal progression.

An older Save v2 that omits ownership economy is still compatible. Runtime restoration materializes deterministic ownership defaults instead of requiring a format migration.

## 3. Deterministic local identity baseline

The current single-player prototype uses the existing canonical local identity constructors:

- local player actor: `actor:local:000001`
- local company: `company:local:000001`

For an older save with no ownership aggregate, the current company is treated as historically founded by the local player for this migration baseline.

This does not create a new company, change the existing display name, or rewrite current Company Money.

## 4. Ownership economy aggregate

`GameSessionState` now supports one ownership-economy aggregate containing:

- stable local player actor identity;
- stable local company identity;
- `CompanyEquityState`;
- Personal Money accounts;
- treasury-share settlement journal;
- dividend settlement journal;
- company governance state.

The active runtime materializes this aggregate for new sessions and restored sessions. Existing fixture and compatibility surfaces may omit it because the field is additive.

## 5. Company Money invariant

`CompanyState.money` remains the sole authoritative Company Money value.

The ownership aggregate does not duplicate Company Money.

Save migration, sanitization and restoration do not reconstruct Company Money from receipts or ledgers. Therefore an older installed save retains its existing Company Money exactly unless an explicit accepted economic transaction later changes it.

Valuation remains derived state and is not persisted as historical truth.

## 6. Zero-invention legacy defaults

When an older save has no ownership field, runtime materializes:

- Personal Money balance `0` with an empty ledger;
- 10,000 canonical equity units split structurally into 5,100 InternalMember units and 4,900 ExternalMarket units;
- all InternalMember units initially in Internal treasury;
- all ExternalMarket units initially in External treasury;
- no actor equity holdings;
- local player as the active Internal member;
- local player as permanent Founder and current executive;
- empty treasury-share settlement journal;
- empty dividend journal;
- empty governance proposal and command-receipt journal.

Migration therefore invents no Personal Money, free shares, dividends or historical transactions.

## 7. Cross-domain integrity and repair

The ownership sanitizer validates the aggregate as a connected economic state, not merely as isolated objects.

Checks include:

- expected local player and company identity;
- canonical equity integrity and supply conservation;
- Personal Money ledger integrity and unique actor accounts;
- presence of the local player's Personal Money account;
- treasury-share receipts referencing matching Personal Money ledger transactions;
- dividend allocations referencing matching shareholder Personal Money credits where applicable;
- governance state integrity;
- consistent company IDs across all ownership subdomains;
- Personal Money account coverage for outstanding shareholders;
- safe integer arithmetic and non-negative account balances.

Malformed, forged or cross-company ownership payloads fail safe to deterministic ownership defaults and mark the decoded save as repaired. Existing Company Money is not reset by this ownership repair path.

## 8. Save v2 activation

`SaveGameV2` now accepts optional `ownershipEconomy`.

Persistence behavior:

- untouched default ownership state is omitted from serialized saves;
- active ownership state is serialized and cloned deterministically;
- decode sanitizes ownership data when present;
- restore materializes defaults when ownership data is absent;
- valid receipts, proposals, command receipts and Personal Money ledger sequences survive save/reload;
- existing v1-to-v2 migration remains supported.

A separate additive autosave trigger family now contains `ownership-economy-changed`. The previous canonical trigger inventory remains stable for existing callers and exact-inventory regression tests.

## 9. Atomic runtime adapters

Session-level adapters commit completed domain operations back into `GameSessionState` atomically.

### Internal treasury-share purchase

The adapter uses:

- `session.company.money` as issuing Company Money;
- ownership Personal Money for the buyer payment;
- ownership equity for the issued InternalMember units;
- ownership treasury-share journal for exact receipt history.

A successful settlement changes all required states together. Replaying an already accepted purchase after save/reload does not debit, credit or issue shares twice.

### End-of-season dividend

The adapter atomically updates:

- Company Money;
- shareholder Personal Money accounts;
- dividend settlement journal.

The underlying dividend policy and actual outstanding holdings remain authoritative.

### Executive governance

Approved executive appointment execution persists both the updated governance journal and the updated current executive identity. Permanent Founder history remains unchanged.

Executive continuity recovery is also exposed at session level without rewriting Founder history, membership or equity supply.

## 10. Tests

New ownership-economy persistence tests cover:

- old Save v2 without ownership data;
- existing v1 migration;
- Company Money preservation during ownership materialization;
- default ownership omission from Save v2;
- active ownership round-trip;
- malformed cross-company ownership repair;
- forged Personal Money ledger repair;
- additive ownership autosave recognition;
- atomic treasury-share purchase plus exactly-once replay after reload;
- atomic end-of-season dividend settlement;
- governance execution persistence and immutable Founder history;
- no invented free equity.

## 11. CI history

### Initial PR CI #274

The first Draft PR run reached the full test suite and reported three failed assertions while 1,020 tests passed.

The failures were test-contract issues rather than demonstrated economic data loss:

1. an existing exact-list autosave test expected the historical trigger inventory;
2. two new tests assumed `decoded.repaired === false`, although the pre-existing Save v2 normalizer can legitimately mark older optional company fields as repaired.

Corrections preserved the economic validators:

- the historical autosave array remained unchanged and the ownership trigger was moved to a separate additive family;
- the new tests were changed to assert economic state and compatibility instead of an unrelated normalization flag.

No transaction validator or integrity rule was weakened.

### Green CI #276

Workflow run: `34125498623`

Result:

- 69 / 69 test files passed;
- 1022 / 1022 tests passed;
- 9 / 9 ownership-economy persistence tests passed;
- TypeScript compilation passed;
- Vite production build passed;
- production HTTP smoke test passed;
- PR-range whitespace validation passed;
- archived `Game/` runtime remained unchanged;
- canonical planning YAML validation passed;
- active planning crosswalk validation passed;
- Prototype v0.1 owner progression gate passed.

The production build still reports the known bundle-size warning. `npm audit` still reports two known vulnerabilities: one moderate and one high. The existing GitHub Actions Node 20 deprecation warning also remains. This slice does not claim those unrelated warnings are resolved.

## 12. Deliberate boundaries

This slice does not add:

- visible ownership, investment or governance UI;
- real-player multiplayer authority activation;
- a live ExternalMarket order book;
- real securities or real-money functionality;
- blockchain, NFT, wallet or DROPi token functionality;
- Railway project/service/environment configuration changes.

## 13. Next gate

PR #391 requires one final report-inclusive CI run on the exact final head before merge.

After green merge and canonical Railway production deployment, issue #390 can close. Parent #362 must remain open for a separately gated visible ownership/governance review surface, which will require explicit Android owner verification under quality gate #317.
