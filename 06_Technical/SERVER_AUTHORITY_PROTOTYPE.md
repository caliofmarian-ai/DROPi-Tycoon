# SERVER AUTHORITY PROTOTYPE

Status: Canonical technical specialization for the first network authority slice under Issue #363 / child #394.

Authority owner: `06_Technical/SHARED_AUTHORITY_CONTRACT.md` remains the higher-level contract.

## Purpose

The current DROPi Tycoon production service already serves the Phaser/Vite runtime through one Node HTTP process on Railway. The first network-authority slice extends that same process with a bounded `/api/authority/*` prototype so the project can prove real client -> server command, revision, receipt, replay and reconnect semantics before selecting production authentication or durable persistence.

This is a deliberately narrow migration step. It is not a production multiplayer account service.

## Current authoritative scope

The server process may own, for the lifetime of that process only:

- opaque public-profile aggregate identity;
- aggregate revision;
- first-seen command IDs;
- authoritative command sequence;
- accepted/rejected command receipts;
- public display-name projection.

The prototype supports only:

- `CreatePublicProfile`;
- `SetDisplayName`.

No other game state moves to server authority in this slice.

## Explicit non-durable boundary

The registry is memory-resident and resets whenever the Node process restarts, the Railway deployment changes, or the service is recreated.

Therefore this prototype MUST NOT be treated as durable account, ownership, balance, membership, marketplace, permission or world state.

A later governed child of #363 must select durable persistence and authentication before any real shared economic state is migrated.

## HTTP surface

The prototype is served by the existing canonical service under:

- `GET /api/authority/status` — reports the prototype authority/durability boundary;
- `GET /api/authority/profiles/:aggregateId` — returns only public-safe profile projection;
- `GET /api/authority/receipts/:commandId` — reconnect/reconciliation lookup for a first-seen command;
- `POST /api/authority/commands` — submits one bounded shared-authority command envelope.

The existing static game hosting and SPA fallback remain unchanged outside this prefix.

## Command semantics

Commands follow the shared authority envelope shape:

- opaque `commandId`;
- opaque requesting `actorId`;
- opaque target `aggregateId`;
- command type;
- client-observed `expectedRevision`;
- bounded payload.

Rules:

1. A first-seen command receives one authoritative sequence number.
2. A command with stale `expectedRevision` is rejected without mutation.
3. An accepted command increments aggregate revision exactly once.
4. An exact replay of the same command ID and intent returns the original receipt/event and does not mutate again.
5. Reusing a command ID with different intent is a conflict, not a replay.
6. Receipt lookup can reconcile a client after transport interruption.

## Prototype identity boundary

Because production authentication is not selected yet, this API does not claim authenticated account identity.

The prototype stores an owner actor ID internally only to prevent another arbitrary actor ID from mutating an already-created profile during the same process lifetime. Public profile reads do not return that owner ID.

This is a consistency guard, not an authentication system.

## Safety limits

The public prototype surface is intentionally bounded:

- public profile data only;
- no secrets/private account fields;
- no Company Money;
- no Personal Money;
- no shares/dividends/governance;
- no membership/roles/permissions;
- no marketplace settlement;
- no world presence;
- request body size limit;
- bounded aggregate count;
- bounded command/receipt count;
- bounded opaque-ID/display-name lengths;
- JSON-only command writes;
- malformed input fails closed.

These limits reduce abuse risk while the endpoint remains unauthenticated and non-durable.

## Migration sequence after this slice

The governed order remains:

1. shared-authority contract — completed by #376/#377;
2. real HTTP command/revision/replay boundary — #394;
3. durable persistence choice and repository implementation;
4. authentication/account identity binding;
5. migrate one shared state family at a time;
6. only after those gates, real-player membership/economy/market/world synchronization.

Company Money, ownership shares and multiplayer employment MUST NOT be moved to this session-only registry.

## Offline compatibility

The current local/single-player game remains authoritative and fully playable when the authority API is unavailable. No gameplay UI or save contract depends on this prototype.

## Railway topology

#394 uses only the existing canonical Railway project/environment/service. It does not create or authorize another project, service or environment and does not change Railway configuration.

## Non-goals

This document does not authorize:

- production registration/login;
- password/session/token authentication;
- a database provider;
- durable accounts;
- real-time multiplayer;
- WebSocket chat/presence;
- Company Money or ownership migration;
- blockchain, wallet or DROPi Token integration.
