# Document Information

Document: SHARED_AUTHORITY_CONTRACT.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Shared Authority Migration Contract
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-07

---

# Shared Authority Contract

## Purpose

This document defines how DROPi Tycoon can migrate from the current offline/local authoritative game toward future shared economic society without making the client authoritative for identity, ownership, balances, permissions or shared settlement.

It is a migration contract, not an authorization to implement full multiplayer at once.

The current single-player/offline game remains valid while shared systems are introduced in governed slices.

---

# 1. Authority Principle

The installed client may own presentation and input.

It must not become the final authority for shared economic truth.

The canonical future command path is:

```text
Client intent
-> command envelope
-> authority validation
-> exactly-once command receipt
-> authoritative event/state revision
-> client projection/presentation
```

A UI action is never proof of ownership, permission, balance, membership or settlement.

---

# 2. State-Family Authority Inventory

## Local presentation/input authority

The following remain local presentation concerns unless a later design explicitly changes them:

- camera presentation;
- touch/joystick input;
- local HUD presentation;
- audio preferences;
- non-economic visual interpolation;
- local accessibility/presentation preferences.

These may read authoritative shared state but do not write shared economic truth.

## Future server-authoritative shared state

Before real multiplayer economy, the following state families must move behind server authority or an equivalent trusted shared authority:

- player/account identity;
- company identity and membership;
- shared Company Money or any shared-account economic balance;
- company ownership and shares;
- shared marketplace listings and settlement;
- company permissions and roles;
- world/shard presence where it affects shared interactions;
- shared economic transactions and settlement history.

The current local runtime may continue to simulate these concepts offline until each selected family is migrated atomically.

---

# 3. Stable Identity Semantics

IDs are opaque identifiers.

Consumers must never derive authority, geography, provider, ownership, permissions or business meaning from ID string format.

Required identifier families include:

- actor/account identity;
- company/aggregate identity;
- asset identity;
- employee/member identity;
- command identity;
- event identity;
- transaction/settlement identity where introduced.

Future server issuers must use collision-safe generation appropriate to the selected datastore/topology.

Local-only deterministic factories may use a caller-provided collision-resistant installation/session namespace for tests and offline adapters. That local representation does not constrain the future server ID format.

---

# 4. Command Contract

Every future shared write uses a command envelope containing at minimum:

- globally unique/opaque `commandId` within the authority domain;
- requesting `actorId`;
- target `aggregateId`;
- command type;
- client-observed `expectedRevision`;
- command payload.

The authority validates identity, permissions, ownership, balance/capacity and domain rules from authoritative state.

The authority must not trust client-provided claims such as:

- current Company Money;
- share ownership;
- company role;
- membership;
- marketplace ownership;
- settlement result;
- authorization status.

---

# 5. Revision and Conflict Semantics

Each authoritative aggregate has a monotonic revision.

A command may apply only when its `expectedRevision` matches the current authoritative revision, unless a later command type explicitly defines commutative/conflict-free behavior.

For the baseline contract:

- matching revision -> validate and apply;
- stale revision -> reject with current revision;
- accepted write -> increment aggregate revision;
- rejected write -> aggregate revision does not change.

This prevents a stale client from silently overwriting newer shared state.

---

# 6. Idempotency / Replay Contract

`commandId` is the replay key.

The first-seen command receives one stored authoritative receipt.

If the same `commandId` is received again:

- do not run settlement again;
- do not debit/credit money again;
- do not transfer ownership again;
- do not create another listing/order/share event;
- return the original receipt/event outcome.

Rejected first-seen commands are also idempotent. A retry with the same command ID does not transform a prior rejection into a later acceptance.

The client must create a new command ID for a genuinely new intent after refreshing authoritative state.

---

# 7. Authoritative Receipt and Event

The authority returns a receipt containing:

- command ID;
- aggregate ID;
- accepted/rejected outcome;
- resulting revision;
- authoritative processing order;
- event ID when an event was emitted;
- deterministic rejection reason when rejected.

Accepted writes may emit an authoritative event containing:

- event ID;
- source command ID;
- aggregate ID;
- resulting revision;
- authoritative order;
- event type;
- event payload.

Clients project these outcomes into gameplay presentation. Clients do not invent authoritative events locally for shared state.

---

# 8. Reconnect Contract

After disconnect/reconnect the client must be able to reconcile pending commands by command ID and aggregate revision.

Baseline flow:

1. reconnect;
2. refresh authoritative aggregate revision/state;
3. query/receive receipts for pending command IDs;
4. mark already-received commands complete;
5. do not replay completed economic effects locally;
6. create a new command only when the user performs a new intent against refreshed state.

This contract avoids duplicate settlement when network acknowledgement is lost after the authority already committed the write.

---

# 9. Offline Compatibility Adapter

The current game remains playable offline/single-player.

`game-web/src/systems/localSharedAuthorityAdapter.ts` implements the same command/revision/idempotency boundary in memory for tests and future staged migration.

It is not a production multiplayer server and does not replace the current Save v2 or economy systems in this slice.

Its purpose is to make the future network boundary testable before choosing transport, authentication provider, database or deployment topology.

---

# 10. Security and Privacy Boundary

Never place service secrets, private signing keys, database credentials or privileged API tokens in:

- game saves;
- client bundles;
- mobile application assets;
- browser-delivered code;
- player-visible configuration.

Public profile/presence data must remain separable from private account/security data.

Authentication/provider selection requires an explicit technical design and must not be invented ad hoc by a gameplay scene.

The server/shared authority validates all privileged shared writes.

---

# 11. Topology Boundary

A player-facing country/world/shard must not be hard-bound to exactly one physical server.

Logical world identity and physical deployment topology are separate concerns.

Future implementations may use partitioning, replication, regional services or other topologies without changing the gameplay meaning of company/player/world IDs.

---

# 12. Migration Staging

The governed migration order is:

1. authority inventory and contracts;
2. stable identifier/command/event/repository boundaries;
3. local adapter compatible with offline play;
4. select one shared state family;
5. implement trusted server authority for that family;
6. migrate client writes to commands;
7. add reconnect/conflict/idempotency evidence;
8. only then expand to additional shared company/market/world state.

Do not migrate all economic systems in one PR.

---

# 13. Explicit Non-Goals of This Contract

This document does not select or implement:

- Firebase, Supabase or another backend vendor;
- an authentication provider;
- WebSocket/real-time transport;
- a production database;
- player login UI;
- multiplayer chat;
- company shares/marketplace runtime;
- blockchain, wallets or token settlement.

Those require dedicated governed implementation slices.

---

# Canonical Rule

**Shared economic truth must be validated and settled exactly once by trusted authority. The client expresses intent and presents results; it does not grant itself identity, ownership, permission or money.**
