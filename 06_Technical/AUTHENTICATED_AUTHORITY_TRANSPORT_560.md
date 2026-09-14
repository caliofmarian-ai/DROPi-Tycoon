# AUTHENTICATED AUTHORITY TRANSPORT — #560

Status: DT-17 first executable trust-boundary slice  
Owner: DT-17 — Backend Identity / Auth / Multiplayer Security  
Coordinates: #560, #363, #545  

## Purpose

The existing public-profile registries already own revision, replay and persistence semantics. This slice does not create another authority registry, account database, World Instance persistence system or authentication provider.

It changes the production HTTP trust boundary from:

`client supplies actorId + aggregateId -> registry executes`

into:

`server authenticates request -> server resolves account/actor/profile binding -> registry executes`

## Production boundary

`game-web/server/server.mjs` now invokes the existing authority HTTP transport with `requireAuthentication: true`.

No authentication provider/resolver is configured by this slice. Therefore production `/api/authority/*` profile reads and mutations fail closed with `AUTHENTICATION_NOT_CONFIGURED` instead of falling back to client-authored identity.

`GET /api/authority/status` remains public so deployment health can report the active store and authentication readiness without exposing account/profile data.

The older unauthenticated prototype mode remains available only when the transport is invoked explicitly without `requireAuthentication`. It is retained for bounded registry/prototype compatibility tests and is not the production server route.

## Trusted resolver contract

A future server-owned authentication adapter may supply an `authenticateRequest(request)` resolver. Successful resolution must return exactly the trusted identity context required by the profile authority:

- immutable `accountId`;
- server-authorized `actorId`;
- server-authorized `profileAggregateId`.

The client body is not permitted to supply `accountId`, `actorId`, `aggregateId`, `ownerActorId` or `profileAggregateId`.

A missing authenticated session returns `AUTHENTICATION_REQUIRED`. A resolver failure returns `AUTHENTICATION_UNAVAILABLE`. An invalid trusted context fails closed.

This contract does not prescribe JWT, cookies, opaque sessions, Google identity, Play Games Services or another provider.

## Command authorization and replay

Authenticated client commands contain only:

- `commandId` as a client retry/idempotency key;
- `commandType`;
- `expectedRevision`;
- governed command payload.

Before registry execution the server injects the trusted `actorId` and `profileAggregateId`.

The client retry key is deterministically scoped to the authenticated account before it reaches the registry. This preserves exactly-once replay for one account while preventing one account from occupying or reading another account's retry key namespace.

Receipts project the original client retry key back to the authenticated caller; the internal scoped command ID is not a client authority input.

## Profile and receipt reads

Authenticated profile reads are self-only through:

`GET /api/authority/profiles/me`

Arbitrary `GET /api/authority/profiles/:aggregateId` lookup is unavailable in authenticated mode, preventing the existing route from becoming an identity-enumeration surface.

Receipt lookup remains:

`GET /api/authority/receipts/:commandId`

but the command ID is resolved inside the authenticated account namespace and the stored receipt must belong to the authenticated profile aggregate.

## Existing authorities consumed

This slice reuses:

- `createSessionAuthorityRegistry()` for bounded session state/replay semantics;
- `createPostgresAuthorityRegistry()` for the existing durable profile registry when PostgreSQL is selected;
- the existing server runtime composition;
- DT-02 World Instance runtime adapter unchanged.

It does not modify Save v2, World Instance schema, Player Economy, company authority or gameplay runtime.

## Security effect

This slice closes the direct production transport path where a request could claim who it was by writing `actorId`/`aggregateId` into JSON.

It also prevents production profile/receipt reads from silently remaining unauthenticated when a durable authority store is selected.

PostgreSQL activation alone therefore cannot activate writable online public profiles; authenticated server resolution remains mandatory.

## Deliberate limitations / remaining #560 gates

Issue #560 remains open after this slice. The following are still required before durable production account/profile activation:

- actual authentication/account provider or first-party session implementation;
- secure credential/session lifecycle, rotation/revocation/logout and recovery behavior;
- durable account-to-actor/profile binding source of truth;
- production-grade rate limiting and abuse controls;
- security/audit telemetry appropriate to the selected provider and deployment topology;
- DT-13 privacy/data inventory and notice reconciliation against actual active account behavior;
- deployment and integration evidence for the selected authenticated configuration.

No online account, cloud sync or multiplayer-ready production claim is authorized by this contract alone.
