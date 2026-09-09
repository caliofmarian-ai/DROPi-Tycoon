# World Instance B2 Runtime Adapter

## Status

Phase-1 DT-02 implementation contract for #616 under parent #421.

Coordinates:
- merged B1 identity: #518;
- merged B2 PostgreSQL foundation: #545;
- authentication/security blocker: #560;
- merged Save/world continuity: #586.

## Purpose

This slice connects the already-merged PostgreSQL World Instance repository to the real web-server runtime lifecycle without creating a second identity authority and without exposing durable World Instance identity as a client-authored API.

The durable key remains:

`(worldInstanceId, accountId) -> heroActorId`

`heroActorId` is derived server-side with the existing B1-compatible helper. The adapter never accepts a durable hero ID from a request body as authoritative identity.

## Runtime composition

`game-web/server/runtime-authority.mjs` owns the runtime composition.

- `DROPI_AUTHORITY_STORE=session` keeps the existing session-only public-profile prototype and does not open the durable World Instance repository.
- `DROPI_AUTHORITY_STORE=postgres` opens the existing PostgreSQL public-profile repository and the existing B2 World Instance repository against the same server-only `DATABASE_URL`.
- no second database, schema, Railway service or secret is introduced;
- shutdown closes both PostgreSQL-backed resources owned by the runtime.

`server.mjs` does not expose a new World Instance HTTP route in this slice.

## Trusted identity boundary

`world-instance-runtime-adapter.mjs` accepts an injected `resolveTrustedIdentity(requestContext)` function. That resolver is the only path by which the adapter can receive:

- `worldInstanceId`;
- `accountId`;
- baseline version;
- map-dataset version.

The adapter derives `heroActorId` itself and then uses the merged B2 repository primitives.

Current production/runtime composition deliberately injects no resolver because #560 has not delivered authenticated account/session context. Therefore the adapter reports `AUTHENTICATED_IDENTITY_REQUIRED` and performs zero durable identity writes.

A future #560-owned authentication implementation may inject a resolver only after it can derive authorized account/world membership from server-controlled authentication/session state. Client-supplied IDs must not be promoted into that resolver as authorization.

## Idempotent ensure contract

`ensureIdentity(requestContext)` performs:

1. resolve server-trusted identity context;
2. normalize world/account/version identity;
3. derive the B1-compatible `heroActorId` server-side;
4. idempotently create/read the World Instance row through `createWorldInstance()`;
5. idempotently bind/read the actor through `bindWorldActor()`.

First successful materialization returns `created`. Exact retry or process restart returns the same durable binding as `existing`.

The adapter does not reset or clone World Instance state and does not import mature-world economic power.

## Read contract

`readIdentity(requestContext)` requires the same trusted resolver. It verifies:

- the World Instance exists;
- stored baseline/map identity matches the trusted context;
- the `(worldInstanceId, accountId)` actor binding exists;
- stored `heroActorId` matches the deterministic server derivation.

Mismatches fail closed as conflicts rather than silently repairing ownership.

## Isolation

World and account scope remain explicit in every durable lookup.

Tests prove:

- the same account in two worlds gets distinct hero IDs;
- two accounts in one world get distinct hero IDs;
- retries create no duplicate actor row;
- repository recreation returns the same actor binding;
- client-authored account/world/hero fields produce zero durable rows when no trusted resolver exists.

## Security / non-goals

This slice does not:

- implement authentication;
- close #560;
- authorize public profile or World Instance writes;
- expose World Instance create/bind/read HTTP endpoints;
- trust client-local B1 account fingerprints as online ownership;
- add multiplayer membership;
- serialize B1 identity into Save v2;
- dual-write Save v2 into PostgreSQL;
- migrate Personal Money, Company Money, cargo, inventory, missions, companies or other economic state;
- activate a new Railway database/service;
- change Android or visible UI behavior.

#560 remains the release/security gate before durable public account identity can become active.

## Rollback

The runtime adapter is additive and uses the already-merged B2 migration/schema. Rolling application code back removes the adapter wiring while leaving the existing B2 tables inert. No destructive database rollback is part of this slice.
