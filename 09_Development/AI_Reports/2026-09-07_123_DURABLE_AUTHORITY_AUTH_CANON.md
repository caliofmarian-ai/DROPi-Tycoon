# AI REPORT 123 — DURABLE AUTHORITY AND AUTHENTICATION CANON

Date: 2026-09-07
Issue: #398
Parent: #363
Status: IMPLEMENTED ON BRANCH — CI PENDING

## Objective

Canonize the durable persistence and authentication boundary that must exist before any real shared economic state moves from local single-player authority to server authority.

## Audit findings

The production Railway service already hosts the session-only authority transport from #394, but currently has no configured database variable, no approved durable persistence provider and no production authentication provider.

Historical July preparation material contains stale assumptions that must not silently become current architecture, including generic Money wallet language, DROPiCoins as an assumed premium wallet/currency and PostgreSQL phrased as if already selected.

## Implemented

- added `06_Technical/DURABLE_AUTHORITY_AND_AUTHENTICATION.md` as a canonical Level-7 technical specialization;
- separated authenticated private Account Identity from public Player Profile;
- required opaque immutable internal IDs and server-derived authenticated actor identity;
- prohibited client-supplied actor IDs from functioning as production authentication;
- defined durable revision, command receipt, event/audit and idempotency requirements across process restarts;
- defined atomic command transaction semantics and economic cross-domain settlement requirements;
- preserved Company Money, Personal Money and Company Equity as distinct authority domains;
- preserved InternalMember vs ExternalMarket ownership rules and member-exit reconciliation boundaries;
- defined backup, restore, migration and recovery requirements;
- defined incremental shared-state migration order;
- preserved mobile-first/offline compatibility boundaries;
- defined Railway topology/change-control and provider-selection criteria without provisioning infrastructure;
- reconciled `09_Development/Engine_Migration/ENVIRONMENT_VARIABLES.md` so it no longer claims stale economy/currency authority;
- linked `06_Technical/SERVER_AUTHORITY_PROTOTYPE.md` forward to the new durable-authority canon.

## Explicitly not implemented

- no database/provider provisioning;
- no Railway service/project/environment/volume changes;
- no variables/secrets;
- no production authentication vendor;
- no login UI;
- no Company Money, Personal Money, equity, membership or marketplace migration;
- no premium currency, blockchain, DROPi Token, KYC or payment activation;
- no visible gameplay/UI change.

## Canon reconciliation

Historical preparation documents remain useful evidence only where they do not contradict current canon. Current server-authority work must not infer a generic wallet economy, premium DROPiCoins implementation or approved PostgreSQL provider from those older notes.

The separate future DROPi ecosystem token remains outside this scope.

## Owner review

No Android owner visual review is required for this issue because the branch changes documentation only and does not alter runtime/UI/gameplay behavior.

## Next gate

After #398, parent #363 remains open. A separate governed child must select and provision durable persistence/authentication architecture before any shared economic state migration.
