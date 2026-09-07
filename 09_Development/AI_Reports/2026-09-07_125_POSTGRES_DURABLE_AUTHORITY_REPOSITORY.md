# AI REPORT 125 — POSTGRESQL DURABLE AUTHORITY REPOSITORY

Date: 2026-09-07
Issue: #402
Parent: #363
Pull request: #403

## Objective

Implement the first durable PostgreSQL repository for the bounded public-profile authority prototype and prove persistence, revision, replay and concurrency semantics against a real disposable PostgreSQL database in CI without activating production persistence.

## Implemented

The branch adds:

- Postgres.js `3.4.9` as the Node PostgreSQL client with an npm-generated lockfile;
- versioned migration `game-web/server/migrations/001_authority_public_profile.sql`;
- `game-web/server/postgres-authority.mjs` as the durable repository adapter;
- persistent public-profile revision and internal owner-actor consistency state;
- persistent first-seen command IDs and canonical command fingerprints;
- persistent accepted/rejected receipts;
- persistent accepted events and authoritative sequence;
- exact replay after repository recreation;
- durable stale-revision rejection;
- conflicting command-ID reuse rejection;
- PostgreSQL transactional advisory-lock serialization for the current bounded prototype;
- shared async/sync HTTP handling for session and PostgreSQL repositories;
- explicit server selection through `DROPI_AUTHORITY_STORE`;
- fail-closed PostgreSQL startup with no silent fallback to session memory;
- disposable PostgreSQL 17 service in GitHub Actions;
- real PostgreSQL integration tests for migration, persistence, replay, conflict, actor isolation, concurrency and HTTP status/receipt behavior.

## Production compatibility

`DROPI_AUTHORITY_STORE` defaults to `session`.

The canonical Railway production service has not been given PostgreSQL activation variables by this child. Therefore merging this repository capability does not make production authority durable and does not change the current default session-only behavior.

A native persistent Railway PostgreSQL service and server-only `DATABASE_URL` reference remain a separate governed provisioning step.

## Correctness-first connection model

The bounded repository currently uses Postgres.js with `max: 1` per repository instance.

This is intentional for the first durable prototype:

- the versioned SQL migration contains an explicit transaction;
- Postgres.js permits that transaction model on a single reserved connection;
- command transactions still use `sql.begin()`;
- concurrent repository instances are serialized by a PostgreSQL transactional advisory lock;
- the design prioritizes deterministic correctness over premature pool throughput optimization.

A future scale-oriented child may replace global serialization with finer aggregate-scoped locking and a larger pool after measured traffic justifies it.

## CI evidence

### Run #292 — failed as a useful integration discovery

GitHub Actions run `34142501264` successfully started a real PostgreSQL 17 service and all pre-existing test suites remained healthy, but eight new PostgreSQL operational tests failed with:

`UNSAFE_TRANSACTION: Only use sql.begin, sql.reserved or max: 1`

Root cause: the migration file used explicit `BEGIN/COMMIT` while the initial Postgres.js pool was configured with `max: 5`.

This was a driver-transaction safety failure, not a game-domain or PostgreSQL-server failure.

### Correction

The repository pool was changed to `max: 1` for this bounded correctness-first stage while retaining transaction-scoped PostgreSQL advisory locking for command consistency.

### Run #293 — implementation PASS

GitHub Actions run `34142723338` completed successfully after the correction.

Passed gates included:

- PostgreSQL service initialization;
- full automated tests including the real-DB authority suite;
- TypeScript and production build;
- production HTTP smoke test in default session-only mode;
- PR-range whitespace validation;
- archived `Game/` runtime unchanged;
- canonical planning YAML validation;
- active planning crosswalk validation;
- Prototype v0.1 owner progression gate.

A final PR-head CI run follows the documentation/report commits and remains the merge gate.

## Security and authority boundary

This child does not add authentication.

Caller-provided prototype `actorId` remains only a temporary consistency guard. The stored owner actor is private to the repository and is not exposed in public profile projections.

Better Auth remains a later child and must derive real actor authority from authenticated server context before any shared economic state becomes server-authoritative.

No credentials, database URLs or production secrets are committed to the repository.

## Explicit non-goals preserved

This work does not implement or activate:

- production Railway PostgreSQL provisioning;
- Better Auth;
- registration/login UI;
- Company Money server authority;
- Personal Money server authority;
- equity/membership/marketplace/world migration;
- real-money payments;
- premium currency;
- blockchain;
- DROPi Token;
- wallet custody;
- KYC.

## Owner review

No Android owner visual review is required for #402 because this slice changes no visible gameplay or UI.

The independent visible owner checkpoint remains #392 (`Phone -> Money & Assets`).
