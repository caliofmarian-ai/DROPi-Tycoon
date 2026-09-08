# Document Information

Document: SHARED_AUTHORITY_CONTRACT.md
Project: DROPi Tycoon
Version: 1.1.0
Status: Canonical — Shared Authority Migration Contract
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Shared Authority Contract

## Purpose

This document defines how DROPi Tycoon migrates from current local/offline authority toward a persistent shared economic society without making the client authoritative for identity, World Instance membership, money, inventory, custody, ownership, permissions, time or settlement.

It is a migration contract, not authorization to implement full multiplayer in one step.

Current offline/local gameplay remains valid while selected state families migrate in governed slices.

---

# 1. Authority Principle

The installed client owns presentation and player input/intent.

It does not become final authority for contested shared economic truth.

Canonical future path:

```text
Client intent
-> command envelope
-> identity / World Instance / permission validation
-> domain and expected-revision validation
-> idempotent command receipt
-> atomic authoritative state/event settlement
-> resulting revision
-> client projection / presentation
```

A UI action is never proof of ownership, capability, balance, membership, cargo custody, work completion or payment.

---

# 2. Identity and World Scope

Shared authority must distinguish:

- account identity;
- World Instance identity;
- one economic hero/person identity for that account in that World Instance;
- employer/company identities;
- membership/employment/investment relationships.

A client cannot create economic alts, choose another World Instance's economic state, or import mature-world power by declaring identifiers locally.

Portable account state and World-Instance-local economic state must remain explicitly separated.

---

# 3. State-Family Authority Inventory

## Local presentation/input concerns

Examples:

- camera;
- touch/joystick input;
- local HUD layout;
- audio/accessibility preferences;
- non-economic interpolation/animation;
- local presentation caches.

They may display authoritative state but do not settle shared economic truth.

## Trusted/server-authoritative shared economic state

Before a state family becomes contested between real players, trusted authority must own its canonical truth. Relevant families include:

- account/person/World Instance membership;
- Personal Money and personal transaction ledger;
- Company Money and company transaction ledger;
- employment, shifts, work records and wage settlement;
- company identity, membership, roles and permissions;
- company ownership/shares/governance;
- inventory and product stocks;
- cargo identity/custody/location/transfer;
- orders/contracts/procurement commitments;
- marketplace listings/bids/trades/settlement;
- assets/vehicles/property/productive facilities;
- infrastructure ownership/concessions/access;
- production/consumption/waste settlement where shared;
- authoritative world time and offline catch-up;
- world events that change contested economic state;
- reputation/history where it changes eligibility/economics.

Current local runtime may simulate selected families offline until each migration is deliberate.

---

# 4. Stable Identifier Semantics

IDs are opaque.

Consumers must never derive authority, geography, provider, ownership or permissions from string format.

Identifier families may include:

- account ID;
- World Instance ID;
- person/economic-actor ID;
- company/aggregate ID;
- employee/employment/member ID;
- asset/infrastructure/product/inventory/cargo/order/contract IDs;
- command/event ID;
- transaction/settlement ID.

Server issuers use collision-safe generation appropriate to chosen infrastructure. Local deterministic factories used in tests/offline adapters do not constrain future server formats.

---

# 5. Command Contract

Every future shared write uses a command envelope containing at minimum:

- unique/opaque `commandId` within authority scope;
- `worldInstanceId`;
- requesting `actorId`;
- target aggregate/domain ID;
- command type;
- client-observed `expectedRevision` where applicable;
- command payload.

Authority validates from authoritative state:

- actor/world membership;
- role/permission;
- ownership;
- qualification/capability;
- balance;
- inventory/custody;
- capacity;
- time/eligibility;
- domain rules.

The authority must not trust client-provided claims such as current money, work completed, share ownership, cargo custody, company role, world-local reputation, successful delivery, or settlement result.

---

# 6. Revision and Conflict Semantics

Each mutable authoritative aggregate/domain uses monotonic revision or an explicitly equivalent concurrency strategy.

Baseline optimistic rule:

- matching revision -> validate/apply;
- stale revision -> reject/refresh;
- accepted write -> advance revision;
- rejected write -> no state mutation/revision advance.

A future command may use an explicitly designed commutative/transactional model, but scenes may not invent alternate conflict behavior ad hoc.

---

# 7. Idempotency / Replay

`commandId` is the replay key.

The first-seen command receives one stored authoritative receipt.

A retry with the same command ID must not:

- debit/credit money twice;
- pay wage/dividend twice;
- consume/produce inventory twice;
- transfer cargo/assets/shares twice;
- complete an order twice;
- charge an offline obligation twice;
- create another company/member/contract record.

The original accepted/rejected outcome is returned.

A genuinely new intent after refreshed state uses a new command ID.

---

# 8. Atomic Economic Settlement

Where one action changes multiple ownership domains, the authoritative operation must behave atomically or use an equivalent durable transactional workflow.

Examples:

## Wage

`employer Company Money debit -> worker Personal Money credit -> work/payroll record settled`

## Delivery/service settlement

`order completion -> cargo/inventory custody finalization -> payer debit -> provider/company credit -> reputation/history updates`

## Share purchase

`buyer Personal Money debit -> company/seller credit -> share ownership transfer`

## Procurement

`buyer payment commitment -> seller inventory reservation/transfer -> cargo/order linkage`

Partial success must not leave duplicated money/cargo/ownership.

---

# 9. Authoritative Receipt and Event

Receipts should identify:

- command ID;
- world/aggregate context;
- accepted/rejected outcome;
- resulting revision/order;
- emitted event/transaction identifiers;
- deterministic rejection reason where relevant.

Clients project authoritative results into gameplay. They do not invent successful shared economic events locally.

---

# 10. Reconnect and Recovery

After disconnect/reconnect the client must reconcile:

1. identity/World Instance/session;
2. authoritative aggregate revisions/state;
3. pending command receipts;
4. already-committed transactions/events;
5. authoritative world time/offline catch-up state.

Completed economic effects are never replayed merely because acknowledgement was lost.

---

# 11. Authoritative Time / Offline Catch-Up

World Instance time belongs to trusted authority when shared worlds are active.

Catch-up must be deterministic/idempotent and may settle only causally valid processes.

Examples:

- fixed living obligations/basic consumption may continue;
- scheduled payroll/company obligations may settle if valid;
- production may progress only with valid inputs/workforce/capacity;
- active driving fuel does not accrue without driving;
- starter wages do not accrue without work;
- NPC activity cannot generate infinite supply/demand/money.

A client-provided elapsed-time claim is not sufficient authority for economic settlement.

---

# 12. World Instance Economic Isolation

Trusted authority enforces the boundary between worlds.

A fresh world cannot receive mature-world balances, productive qualifications, inventory, companies, shares, reputation, assets or infrastructure power through client save/import commands.

Only explicitly approved non-economic account state may be projected across worlds.

Legacy/local saves require governed migration and are not automatically authoritative for a fresh shared world.

---

# 13. Offline Compatibility Adapter

The current game remains playable offline/single-player.

`game-web/src/systems/localSharedAuthorityAdapter.ts` provides a local command/revision/idempotency boundary for tests and staged migration.

It is not a production multiplayer server and does not by itself convert local Save into shared authority.

Future local adapters should preserve the same domain semantics where practical so online authority extends rather than replaces gameplay rules.

---

# 14. Security and Privacy

Never place service secrets, private signing keys, privileged API tokens or database credentials in saves, client bundles, mobile assets, browser code or player-visible configuration.

Public profile/presence data must remain separable from private account/security data.

Authentication/provider selection requires dedicated Technical Design.

Trusted authority validates privileged writes.

---

# 15. Logical World vs Deployment Topology

A country, region, shard label or World Instance is not hard-bound to one physical server.

Future implementations may partition/replicate/route services without changing gameplay identity semantics.

Multi-resolution simulation and server-side catch-up protect scale; Android clients never need to own/render the complete global economic state.

---

# 16. Migration Staging

The governed migration principle is **one coherent state family / transaction chain at a time**.

Recommended causal order after Phase-1 reconciliation:

1. stable account/World Instance/person identity contracts;
2. Personal Money ledger and explicit company/person ownership boundaries;
3. authoritative world-time/catch-up boundary needed by economic settlement;
4. employee-first wage/work settlement;
5. inventory/demand/order/cargo custody transaction chain;
6. company formation/membership/permissions;
7. selected real multiplayer market/company state;
8. production/infrastructure/large-world contested state;
9. later complex equity/finance systems.

Do not migrate the entire economy in one PR.

---

# 17. Explicit Non-Goals

This document does not select or implement:

- backend vendor;
- authentication provider;
- WebSocket/real-time transport;
- production database;
- player login UI;
- chat;
- blockchain/wallet/token settlement;
- full multiplayer in one step.

Those require dedicated implementation decisions.

---

# Canonical Rule

**Shared economic truth is World-Instance scoped, validated and settled exactly once by trusted authority. The client expresses intent and presents results; it cannot grant itself identity, money, work, inventory, cargo custody, ownership, permissions, elapsed economic time or cross-world power.**
