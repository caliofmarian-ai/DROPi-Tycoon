# SERVER AUTHORITY PROTOTYPE

Status: Canonical technical specialization for the bounded network-authority prototype under Issue #363.

Authority owner: `06_Technical/SHARED_AUTHORITY_CONTRACT.md` remains the higher-level contract.

Durable-authority requirements: `06_Technical/DURABLE_AUTHORITY_AND_AUTHENTICATION.md`.

Selected implementation stack: `06_Technical/DURABLE_AUTHORITY_STACK_DECISION.md`.

## Purpose

DROPi Tycoon uses the existing Node HTTP service to prove client -> server command, revision, receipt, replay, reconnect and now PostgreSQL persistence semantics before any real shared economic state is migrated.

The network authority remains deliberately narrow. It is not yet a production multiplayer account or economy service.

## Bounded authoritative scope

The prototype supports only these public-profile commands:

- `CreatePublicProfile`;
- `SetDisplayName`.

The authority state may contain:

- opaque public-profile aggregate identity;
- aggregate revision;
- first-seen command IDs and command fingerprints;
- authoritative command sequence;
- accepted/rejected command receipts;
- accepted events;
- internal prototype owner actor ID;
- public display-name projection.

No Company Money, Personal Money, equity, membership, marketplace settlement or shared-world state is migrated by this prototype.

## Runtime storage modes

The repository now contains two authority adapters behind the same HTTP boundary.

### Session mode

`DROPI_AUTHORITY_STORE=session` is the default when no authority-store variable is configured.

The session adapter:

- uses process memory;
- reports `authority: server-process`;
- reports `durability: session-only`;
- reports `persistent: false`;
- resets on process restart/deploy;
- remains the current canonical production behavior until persistent Railway PostgreSQL is separately provisioned and activated.

### PostgreSQL mode

`DROPI_AUTHORITY_STORE=postgres` explicitly selects the PostgreSQL adapter and requires a server-only `DATABASE_URL`.

The PostgreSQL adapter:

- reports `authority: server-database`;
- reports `durability: postgresql`;
- reports `persistent: true`;
- stores profile revision, command fingerprint, receipts and events durably;
- preserves exact replay/idempotency across repository/server recreation;
- persists first-seen stale-revision rejections;
- rejects command-ID reuse with different intent;
- serializes the current bounded prototype command stream with a PostgreSQL transactional advisory lock;
- uses a correctness-first single-connection Postgres.js pool per repository instance for this prototype stage.

PostgreSQL mode does not silently fall back to session memory. If it is explicitly configured and the database cannot initialize, startup must fail rather than falsely claiming durable authority.

## Current production truth

Merging the PostgreSQL adapter does not by itself activate durable production authority.

As long as the canonical Railway service has no approved `DROPI_AUTHORITY_STORE=postgres` plus native persistent PostgreSQL `DATABASE_URL`, production remains session-only.

A native persistent Railway PostgreSQL service, server-only references, migration application and restart/deploy verification are separate governed work.

## HTTP surface

The shared authority surface remains:

- `GET /api/authority/status` — reports active authority/durability/authentication metadata;
- `GET /api/authority/profiles/:aggregateId` — returns only the public-safe profile projection;
- `GET /api/authority/receipts/:commandId` — reconnect/reconciliation lookup;
- `POST /api/authority/commands` — submits one bounded authority command envelope.

Static game hosting and SPA fallback remain unchanged outside this prefix.

## Command semantics

Commands use:

- opaque `commandId`;
- opaque prototype `actorId`;
- opaque target `aggregateId`;
- command type;
- client-observed `expectedRevision`;
- bounded payload.

Rules:

1. A first-seen command receives one authoritative sequence number.
2. A stale `expectedRevision` is rejected without domain mutation.
3. An accepted command increments aggregate revision exactly once.
4. An exact replay of the same command ID and intent returns the stored result and does not mutate twice.
5. Reusing a command ID with different intent is a conflict.
6. Receipt lookup supports reconnect/reconciliation.
7. Competing writes against the same observed revision cannot both settle successfully in the tested PostgreSQL adapter.

## Prototype identity boundary

Production authentication is still not configured.

The current command envelope therefore still contains a caller-provided prototype `actorId`. The repository stores the first profile owner actor internally to prevent a different prototype actor from mutating that profile.

This is a consistency guard, not authentication.

The internal owner actor ID is never part of the public profile projection.

Future Better Auth work must replace caller-trusted actor authority with authenticated server context before shared economic authority is activated.

## PostgreSQL migration contract

The first versioned migration is:

`game-web/server/migrations/001_authority_public_profile.sql`

It creates only the bounded authority prototype tables for:

- migration evidence;
- public-profile aggregate state and revision;
- authoritative sequence;
- accepted events;
- command fingerprints and stored receipt/event/profile snapshots.

The migration is repeat-safe for the intended prototype schema and is exercised against real PostgreSQL in CI.

Future schema evolution must use new versioned migrations rather than editing production data structures ad hoc.

## CI durability proof

GitHub Actions provisions a disposable PostgreSQL 17 service for authority integration tests.

The test suite proves with a real database that:

- revision 1 survives repository recreation;
- revision 1 updates to revision 2;
- exact replay after reconnection returns the original stored result;
- stale rejection is durable and replayable;
- command-ID conflict is rejected;
- a different prototype actor cannot mutate the stored owner profile;
- public projection excludes the owner actor;
- two concurrent revision-1 updates produce exactly one accepted revision-2 mutation;
- the shared HTTP status/receipt surface truthfully reports PostgreSQL mode;
- migration application is repeat-safe.

The normal production HTTP smoke test intentionally does not enable PostgreSQL mode, so CI also proves that the current default runtime remains session-only.

## Safety boundaries

The public prototype remains intentionally bounded:

- public profile data only;
- no secrets/private account fields;
- no Company Money;
- no Personal Money;
- no shares/dividends/governance;
- no membership/roles/permissions;
- no marketplace settlement;
- no world presence;
- request body size limit;
- bounded opaque-ID/display-name lengths;
- JSON-only command writes;
- malformed input fails closed.

## Offline compatibility

The current local/single-player game remains fully playable without this authority API. No visible gameplay UI or Save v2 contract depends on the PostgreSQL adapter.

## Railway topology

This repository work does not create or modify the canonical Railway project, production environment or web service topology.

It does not provision a production database or set production credentials/variables.

Persistent Railway PostgreSQL activation remains a separate governed child because it must use Railway's native persistent database capability rather than an unverified ephemeral container.

## Migration sequence

1. shared-authority contract — completed by #376/#377;
2. real HTTP command/revision/replay boundary — completed by #394/#397;
3. durable persistence/authentication canon — completed by #398/#399;
4. durable stack decision — completed by #400/#401;
5. PostgreSQL repository + real-DB CI proof — #402/#403;
6. native persistent Railway PostgreSQL provisioning and verified activation;
7. Better Auth durable account identity;
8. permissions/membership;
9. migrate one shared economic state family at a time.

## Non-goals

This document does not authorize:

- production registration/login;
- Better Auth activation yet;
- email/password/social-login methods;
- production PostgreSQL provisioning by itself;
- real-time multiplayer;
- WebSocket chat/presence;
- Company Money or ownership migration;
- real-money payments;
- blockchain, wallet, KYC or DROPi Token integration.
