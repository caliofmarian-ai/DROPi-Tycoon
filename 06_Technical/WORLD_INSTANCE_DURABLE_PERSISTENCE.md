# World Instance Durable Persistence — B2

## Document Information

Project: DROPi Tycoon
Status: Phase-1 technical implementation contract
Parent: #421
Implementation child: #544
Coordinates: #515 (B1), #402 (PostgreSQL authority repository), #420 (world clock)
Canonical sequence: `09_Development/Planning/PHASE1_IMPLEMENTATION_SEQUENCE.md` Track B / B2

---

## 1. Purpose

B2 establishes the first durable server-side persistence boundary for logical World Instances without activating public multiplayer writes and without changing the current Save v2 authority model.

A **World Instance is one logical persistent economy/history**. It is not one Railway service, one database, one country or one shard. A logical World Instance may later span multiple services or partitions while retaining one stable `worldInstanceId`.

This slice persists only the World Instance identity envelope and the account-to-world-hero relationship required by merged B1. Economic state families remain unmigrated until their own governed authority slices.

---

## 2. B1 -> B2 Boundary

Merged B1 (#515 / PR #518) owns the runtime identity contract:

- `worldInstanceId`;
- `accountId`;
- `heroActorId`;
- `baselineVersion`;
- `mapDatasetVersion`;
- one hero per `(accountId, worldInstanceId)`;
- deterministic local hero derivation;
- current Save v2 serialization remains unchanged.

B2 accepts those identity components on the server and persists them in PostgreSQL. The server contains a compatibility copy of the B1 deterministic hero fingerprint only because Node cannot import the client TypeScript module directly. A deterministic test compares the server derivation against B1 to prevent silent drift.

The B1 deterministic fingerprint is **not authentication**. `accountId` remains an opaque identity input until a later authenticated server context replaces caller-provided/local identity.

B2 deliberately does **not** add `worldIdentity` to Save v2. Current legacy single-player restore behavior continues to rematerialize its B1 local identity exactly as before.

---

## 3. PostgreSQL Schema

Migration: `game-web/server/migrations/002_world_instances.sql`

### `world_instances`

Primary key:

- `world_instance_id`

Durable identity fields:

- `baseline_version`;
- `map_dataset_version`.

Operational metadata:

- `lifecycle_status` — bounded repository status (`CREATED`, `ACTIVE`, `SEALED`), not a gameplay/economic simulation state;
- optimistic `revision`;
- creation/update timestamps.

The baseline and map-dataset versions are established at World Instance creation. Reusing an existing `worldInstanceId` with different identity versions is a deterministic conflict, not an overwrite.

### `world_instance_actors`

Primary key:

- `(world_instance_id, account_id)`.

Additional uniqueness:

- `(world_instance_id, hero_actor_id)`.

Foreign key:

- `world_instance_id -> world_instances.world_instance_id` with restricted update/delete.

These keys make world scope part of durable actor identity. Repository reads always require `worldInstanceId`; no actor read falls back to an account-only or hero-only lookup.

---

## 4. Fresh-World Isolation

`createWorldInstance()` accepts only:

- `worldInstanceId`;
- `baselineVersion`;
- `mapDatasetVersion`.

There is no source-world, clone, import, balance, inventory, company or economic-snapshot parameter in the B2 creation contract. Unknown caller fields are ignored and no mature-world row is copied.

A newly created World Instance therefore begins with:

- its own identity/version row;
- lifecycle `CREATED`;
- revision `1`;
- zero world-actor bindings until explicitly added;
- zero migrated Company Money, Personal Money, inventory, company, infrastructure, productive-asset or market state because those state families are not part of this migration.

Future economic persistence migrations must include `worldInstanceId` in their authoritative keys/foreign-key path and must prove that fresh-world creation does not import mature-world power.

---

## 5. Repository Contract

Module: `game-web/server/postgres-world-instances.mjs`

The repository is intentionally not wired into `server.mjs` in B2. It therefore creates no public multiplayer write surface.

Supported bounded operations:

- `createWorldInstance()` — idempotent for identical identity versions, conflict for the same ID with different versions;
- `getWorldInstance(worldInstanceId)` — world-scoped read;
- `updateWorldInstanceLifecycle()` — optimistic revision update for bounded operational lifecycle metadata only;
- `bindWorldActor()` — durable B1-derived `(world, account) -> hero` binding;
- `getWorldActor(worldInstanceId, accountId)` — requires explicit world scope;
- `stats(worldInstanceId)` — world-scoped diagnostic/test count.

All mutation operations use a PostgreSQL transactional advisory lock for this correctness-first prototype stage. This follows the same bounded posture as the existing durable authority repository and can later be replaced by finer aggregate-scoped locking when traffic and schema maturity justify it.

---

## 6. Idempotency and Conflict Rules

### World creation

First create:

- `created`.

Replay with the same `worldInstanceId`, baseline and map dataset:

- `duplicate` with the stored World Instance projection;
- no second row and no state reset.

Reuse of the same `worldInstanceId` with different baseline/map identity:

- `WORLD_INSTANCE_ID_CONFLICT`;
- stored identity remains unchanged.

### World actor binding

A binding is accepted only when `heroActorId` matches the B1 deterministic derivation from `(accountId, worldInstanceId)`.

First valid binding:

- `created`.

Exact replay:

- `duplicate`.

Forged/mismatched hero:

- `HERO_ACTOR_ID_MISMATCH` before persistence.

The database additionally enforces one account binding and one hero binding per World Instance.

### Lifecycle update

Updates use `expectedRevision`.

- matching revision + changed status -> update and increment revision;
- matching revision + identical status -> `unchanged` without revision churn;
- stale revision -> `STALE_REVISION`;
- missing world -> `WORLD_INSTANCE_NOT_FOUND`.

This lifecycle field is persistence metadata only. It does not activate simulation, networking, economy or public multiplayer access.

---

## 7. Migration and Rollback Implications

Migration `002_world_instances.sql` is additive and idempotent:

- uses `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`;
- records `002_world_instances` once in the existing migration ledger;
- does not alter or delete legacy authority tables;
- does not touch Save v2 files or browser storage;
- does not require production `DATABASE_URL` activation merely because code is merged.

Application rollback to a pre-B2 build is safe because the new tables remain unused by the old runtime.

A database rollback that physically drops B2 tables would be destructive after real World Instance data exists and is therefore **not automated**. If removal were ever required, it must be a separately reviewed migration/backup operation that drops `world_instance_actors` before `world_instances` and preserves export/restore evidence.

---

## 8. Legacy Single-Player Compatibility

Current legacy Save v2 remains authoritative for its existing local economic state until a governed migration says otherwise.

B2 does not:

- serialize B1 into Save v2;
- read Save v2 on the server;
- copy prototype/local Company Money into PostgreSQL;
- reinterpret current inventory, fleet, employee or delivery state;
- turn the legacy local account fingerprint into authenticated ownership;
- reset existing saves.

A future legacy migration must explicitly name recoverable progress, authenticated account binding, destination World Instance, anti-fraud/fresh-world rules and rollback behavior before any economic state becomes server-authoritative.

---

## 9. World Clock Boundary

Issue #421 clarifies that each World Instance owns one authoritative logical clock shared by all players in that world.

B2 creates the durable world identity key that future clock persistence must reference, but this slice does not persist or advance the C1 clock. World-clock storage/settlement remains a subsequent integration slice coordinated with #420 and offline catch-up.

There is no per-player economic timeline in this repository.

---

## 10. Remaining Integration Work

Before trusted multiplayer economy can use B2, later governed slices must add:

1. authenticated account/session authority;
2. server request context that selects authorized World Instance membership;
3. durable authoritative World Instance clock state;
4. world-scoped Personal Money / Company Money settlement;
5. world-scoped company membership and permissions;
6. world-scoped inventory/cargo/order/contract persistence;
7. world-scoped market, productive asset and infrastructure state;
8. command idempotency/receipts for each newly migrated contested state family;
9. explicit legacy Save v2 migration and anti-fresh-world-power-import rules;
10. backup/restore evidence before high-value shared economic authority is activated.

No public multiplayer write is authorized by B2 alone.

---

## 11. Verification

Deterministic tests cover:

- exact B1/server hero derivation compatibility;
- valid B1 identity normalization;
- forged hero rejection;
- migration replay/idempotency;
- persistence across repository recreation;
- immutable baseline/map identity conflicts;
- optimistic lifecycle revision behavior;
- durable one-hero account/world binding;
- same account in two separate worlds with separate hero IDs;
- fresh World Instance creation with zero copied actor state.

PostgreSQL integration tests use the existing `AUTHORITY_TEST_DATABASE_URL` test infrastructure when available. No workflow or Railway configuration change is required by this slice.
