# World Instance Persistence Composition and Handoff Contract

## Status

Phase-1 DT-02 persistence composition contract for issue #628 under parent #421.

Coordinates:

- merged B1 World Identity: #518;
- merged B2 PostgreSQL World Instance foundation: #545;
- merged Save v2 world/order/cargo/mission continuity: #586;
- merged B2 server-runtime adapter: #621;
- authentication/security gate: #560;
- Player Economy: #436 and open runtime-composition PR #625;
- Mission Framework: #553;
- Personal Capability / training: #437 and open training PR #606;
- Production / supply chain: #419.

This document is a composition and migration contract. It does not authorize a public API, authentication implementation, PostgreSQL schema migration, Save v2 change, shared multiplayer write, Railway change, or Android/UI change.

---

## 1. Purpose

DROPi Tycoon already has several deterministic domain authorities, but they do not all have the same active persistence owner.

The central rule of this contract is:

> **Domain authority is not the same thing as active persistence authority.**

A domain may already define the canonical aggregate, invariants, stable IDs and exactly-once semantics while still being intentionally local, browser-persisted, session-only, or not persisted at all.

DT-02 must not treat a domain's existence as permission to invent a PostgreSQL shape for it. A state family may move to durable World Instance authority only after its owning specialist hands off a governed persistence boundary and the cutover can preserve one source of truth.

The goals of this contract are to:

1. inventory current authority and persistence ownership;
2. identify which state families are eligible for later server persistence;
3. define the handoff evidence required from owning domains;
4. prohibit browser/server dual-write authority;
5. define cross-domain reference and settlement ordering;
6. preserve legacy Save v2 and fresh-world isolation;
7. preserve the #560 fail-closed security boundary;
8. decide whether a new PostgreSQL migration is justified now.

The conclusion for this slice is explicit:

> **No new PostgreSQL migration is justified by #628.**

The required owning-domain handoffs are not yet all merged, and authenticated World Instance membership is still blocked by #560. Creating speculative tables now would freeze guessed aggregate shapes and risk a second source of truth.

---

## 2. Terms

### 2.1 Domain-authoritative

A domain is **domain-authoritative** when it defines the canonical meaning, invariants, transitions and identifiers for its state family.

Examples include:

- `PlayerEconomyState` for Personal Money, work records and Work Capacity;
- `MissionRuntimeState` for mission progress and exactly-once mission receipts;
- `InventoryState` for exact stock quantities and reservations.

Domain authority alone does not identify where that state is durably resumed after process restart.

### 2.2 Active persistence authority

The **active persistence authority** is the one store whose persisted form is currently trusted to resume that state family for a given gameplay mode and World Instance.

Examples today include:

- PostgreSQL for B2 World Instance identity when the PostgreSQL authority mode is selected;
- browser Save v2 for the current local prototype's order/cargo continuity and mission resume envelope;
- no active durable store yet for several newer domain aggregates.

### 2.3 Server-candidate

A **server-candidate** state family has semantics that can eventually move to trusted World Instance persistence, but only after its owner supplies a persistence handoff and all prerequisites for safe cutover exist.

Server-candidate does not mean server-persisted today.

### 2.4 Handoff-required

A state family is **handoff-required** when DT-02 must not define its persisted aggregate by inference. The owning specialist must first provide a canonical capture/restore or equivalent state-port contract, validation rules, stable replay identities and migration expectations.

### 2.5 Projection/reference-only

A **projection/reference-only** value may be persisted by a consuming domain only as a stable reference to another authority. It must not become a copied authoritative aggregate.

Examples:

- missions may persist `orderId` / `deliveryMissionId` references, but not copy the authoritative order/cargo aggregate;
- production-created missions may persist a producer contract reference, but mission persistence does not own inventory;
- missions may persist an economic settlement reference, but not a money amount or ledger copy.

---

## 3. Current Authority and Persistence Matrix

| State family | Domain owner / canonical state | Active persistence authority now | Server eligibility | Required handoff / prerequisite | Stable facts that must survive migration | Forbidden duplication |
| --- | --- | --- | --- | --- | --- | --- |
| World Instance identity | DT-02; `world_instances`, `world_instance_actors`; `(worldInstanceId, accountId) -> heroActorId` | PostgreSQL B2 when PostgreSQL mode is selected; fail-closed runtime otherwise | Already durable foundation | #560 must provide server-trusted authenticated identity before online durable bindings are activated | world ID, account/world actor binding, baseline/map versions, revisions | client/body identity claims; second identity store |
| Local hero/order/cargo continuity | DT-02 Save continuity; `worldContinuity` | Browser Save v2 for current local prototype | Yes, as one coherent logistics/world-state cutover | authenticated world membership; governed online order/cargo aggregate; migration plan | order ID/stage, cargo custody, `economySettled`, safe hero position, replay markers | independent player cargo flags; browser/server concurrent online writes |
| Mission progress | DT-09; `MissionRuntimeState`; `missionResume` envelope | Browser Save v2 for current local prototype | Yes, after referenced world/logistics state is server-authoritative | DT-09 persistence handoff already defines serialize/sanitize/restore semantics; online cutover still depends on trusted identity and authoritative referenced state | mission/stage IDs, choices, processed event IDs, delays, completion receipts, consequence-intent IDs | order objects, cargo, inventory, balances, capability aggregates |
| Player Economy | DT-03; `PlayerEconomyState` | **No active durable persistence owner for the new Player Economy aggregate on current merged main** | Yes | DT-03 runtime composition/capture-restore handoff must merge first; #625 is open at this checkpoint; trusted World Clock required for time settlement | transaction IDs, world/hero owner keys, ledgers, productive-work activity IDs, rest IDs, wage settlement identity, living obligation IDs, Work Capacity state | legacy Company Money conversion; separate money ledger; inferred PostgreSQL shape before handoff |
| Existing learned capability history | DT-06/progression; `PersonalProgressionState.learnedCapabilityIds` | Browser Save v2 | Yes, later | explicit DT-06 migration contract before online authority changes | earned learned capability IDs and valid historical progression | replacing earned history with level/money inference |
| Rich capability/training evidence | DT-06; `CapabilityEvidenceState`; future governed training sessions/receipts | **No active durable persistence owner** for theory/practical/qualification/supervised evidence on merged main | Yes | DT-06 must merge and hand off authoritative evidence/training capture-restore contract; #606 is open at this checkpoint | theory IDs, practical IDs, qualification IDs, supervised units, training session IDs, completion receipt IDs | Work Capacity or Personal Money copies; self-granted qualifications |
| Exact inventory / reservations | DT-07; `InventoryState` | **No active durable persistence owner** | Yes, required before contested supply chain | DT-07 persistence handoff; authenticated World Instance; transaction design | inventory ID, node ID, quantities, reservation IDs/status, applied mutation IDs | map `inventoryIndex` as stock truth; mission copy of inventory |
| Production cycles / producer logistics contracts / cargo | DT-07 production/trade aggregates | **No active durable persistence owner** | Yes, later coherent transaction chain | DT-07 handoff; server World Clock; inventory authority; settlement integration | production cycle IDs, mutation IDs, opportunity/contract IDs, reservation/custody state, settlement-intent IDs | mission-owned production state; synthetic stock recreation; duplicated cargo authority |
| World Clock | World Clock C1 / world simulation owner | Deterministic runtime authority; not yet a B2 durable server clock | Required server prerequisite for time-settling shared domains | dedicated trusted World Instance clock persistence/catch-up slice | world ID, logical minute/revision/catch-up receipts as defined by owning contract | per-player economic clock; client wall-clock settlement authority |

### 3.1 Matrix interpretation

The matrix describes the current repository truth, not a promise that every row will be migrated.

A domain marked **No active durable persistence owner** must not be silently added to Save v2 or PostgreSQL by DT-02. It remains domain-authoritative in memory until its owner provides the handoff required for a correct durable representation.

A browser-local Save v2 state family remains the local prototype authority until an explicit world/mode cutover retires that write path for the migrated family.

---

## 4. Current B2 Durable Boundary

Merged B2 currently persists only the World Instance identity envelope and the account/world hero binding.

Durable B2 identity includes:

- `worldInstanceId`;
- baseline version;
- map-dataset version;
- bounded lifecycle/revision metadata;
- `(worldInstanceId, accountId) -> heroActorId`.

Merged #621 composes this repository into the server lifecycle in PostgreSQL mode using the existing server-only `DATABASE_URL`.

It deliberately exposes no public World Instance route and receives no trusted identity resolver in the current runtime because #560 is unresolved. Therefore durable identity creation remains blocked with `AUTHENTICATED_IDENTITY_REQUIRED`.

No later state-family migration may weaken this boundary by accepting request/body account, world or hero identifiers as authorization.

---

## 5. Local Save v2 Boundary

Save v2 remains the active persistence authority for the current local/offline prototype where it already owns state.

Relevant persisted families include:

- legacy company and existing save-owned progression/ownership fields;
- `worldContinuity` for bounded hero/order/cargo continuity;
- `missionResume` for the DT-09 mission runtime envelope;
- `personalProgression.learnedCapabilityIds` for existing learned capability history.

This contract does not change Save v2.

A future authenticated World Instance may migrate selected families to server authority. Once a family is cut over for a specific online World Instance, Save v2 may retain local-world compatibility or a non-authoritative cache/projection, but it must not remain an independent writer of that same online authoritative family.

---

## 6. The Single-Writer Rule

For one state family in one World Instance, there is exactly one active authoritative writer.

Permitted authority modes are conceptually:

- `LocalSaveAuthority` — current local/offline compatibility mode;
- `ServerWorldAuthority` — future authenticated server-owned World Instance mode.

The same `(worldInstanceId, stateFamily)` must never be authoritative in both modes at once.

### 6.1 Prohibited dual-write

The following pattern is forbidden:

```text
client gameplay mutation
-> write Save v2 authoritative economy
-> also write PostgreSQL authoritative economy
```

It creates two possible outcomes, two revisions and two replay histories.

A later reconnect would not know which store is canonical after partial failure.

### 6.2 Permitted non-authoritative shadow comparison

A migration test may compare a non-authoritative derived projection against the current source authority if all of these conditions hold:

- the shadow cannot feed gameplay decisions;
- the shadow cannot settle money, cargo, inventory, capability or mission progress;
- the shadow cannot become the fallback authority after failure;
- mismatch is diagnostic only;
- no public/client write is added merely to populate the shadow.

This is validation, not dual authority.

---

## 7. Required Owning-Specialist Handoff

Before DT-02 may add durable persistence for a new domain family, the owning specialist must provide or explicitly approve a handoff containing all applicable items below.

### 7.1 Canonical aggregate identity

The handoff must name:

- aggregate/state type and version;
- owner key(s);
- World Instance key;
- person/company/node/contract keys where relevant;
- whether the aggregate is one row, multiple aggregates or an event/ledger family conceptually.

DT-02 must not flatten multiple domain aggregates into one opaque database blob merely to simplify persistence.

### 7.2 Capture and restore semantics

The owner must provide a canonical `capture` / `serialize` and `restore` / `sanitize` / validation boundary, or an equivalent explicit contract.

The persisted shape must preserve domain invariants rather than just pass JSON parsing.

### 7.3 Stable idempotency identities

The handoff must identify replay keys, for example:

- money transaction IDs;
- work activity IDs;
- rest/wage/living settlement IDs;
- mission processed-event IDs and completion receipt IDs;
- training session/completion receipt IDs;
- inventory mutation/reservation IDs;
- production cycle IDs;
- contract/custody/settlement-intent IDs.

If these are omitted, restart/retry can manufacture duplicated economic effects.

### 7.4 Concurrency semantics

The owner must identify:

- revision or equivalent conflict control;
- which operations are atomic together;
- stale-state behavior;
- duplicate-command behavior;
- retry receipts where applicable.

### 7.5 Fresh-world default

The owner must define a deterministic fresh-world state that contains no imported mature-world economic power.

### 7.6 Legacy import/repair

If local Save state can be migrated, the owner must state:

- what is eligible to import;
- what is only legacy compatibility data;
- what must be rejected/repaired;
- whether historical IDs are preserved or mapped;
- how an incomplete migration is rolled back safely.

### 7.7 Acceptance evidence

At minimum, the handoff must support tests for:

- round-trip persistence;
- restart recovery;
- replay/idempotency;
- cross-world isolation;
- cross-owner isolation where relevant;
- malformed/tampered state rejection or bounded repair;
- fresh-world non-import;
- legacy compatibility where applicable.

Until these requirements are met, the family remains with its current persistence owner or remains non-durable.

---

## 8. Cross-Domain Composition Rules

Durable persistence must preserve domain ownership rather than create one oversized synthetic authority.

### 8.1 Order / cargo / settlement

The authoritative logistics state owns order stage and cargo custody.

`economySettled` or a future replacement settlement receipt must remain consistent with the economic authority. A migration may not make an order appear unsettled after the corresponding money effect is already authoritative.

A future contested delivery/service settlement must use one atomic database transaction or an explicitly durable transactional workflow for all effects that must succeed together.

### 8.2 Mission references

Mission persistence owns only mission runtime state.

It may persist stable references such as:

- `deliveryMissionId`;
- `orderId`;
- parcel IDs;
- producer contract IDs / `causeRef`;
- economic settlement reference IDs.

It must never persist a second authoritative copy of:

- order/cargo state;
- inventory;
- Personal Money / Company Money;
- capability evidence;
- production state.

On restore/reconnect, unresolved mission references are validated against the already-restored authoritative referenced domains.

### 8.3 Player Economy

Player Economy owns:

- Personal Money;
- its own company/employer money ledger where defined by that aggregate;
- employment state in that domain;
- productive-work records;
- Work Capacity mutation;
- wage/living/arrears settlement identities.

Missions, capability and production may consume read-only facts or stable settlement references, but they may not copy or mutate these ledgers.

Legacy `GameSession.company.money` remains legacy Company Money and must never be silently imported as Personal Money.

### 8.4 Capability / training

Capability eligibility may read Personal Money, employment and Work Capacity from Player Economy through narrow ports.

Capability persistence must not contain a second Personal Money or Work Capacity ledger.

Training evidence must remain evidence owned by the capability/training domain. A mission or persistence adapter cannot grant qualification because a story stage or payment completed.

### 8.5 Production / inventory / producer logistics

Production/inventory owns exact stock, reservations, production mutations and producer contract/custody state.

A systemic mission may reference this causal state but does not own it.

Economic settlement may later consume a stable production/logistics settlement intent exactly once. Production itself must not invent a duplicated Personal Money or Company Money balance.

---

## 9. Restore and Reconnect Dependency Ordering

When multiple server-authoritative families eventually exist, reconnect must restore identity and dependencies before projections that reference them.

A safe dependency order is:

1. authenticated account/session context;
2. authorized `worldInstanceId` membership and durable hero binding;
3. authoritative World Instance clock/revision needed by time-dependent domains;
4. authoritative economic/logistics aggregates selected for that migration generation;
5. mission runtime after its referenced logistics/contract identities are available;
6. capability/work-access projections after their authoritative evidence and Player Economy facts are available;
7. production/systemic mission projections after inventory/contracts are available;
8. UI/client projections last.

This is a dependency order, not a requirement to migrate every family in one release.

Missing authoritative dependencies must fail closed rather than allowing a consumer to reconstruct contested truth from stale client data.

---

## 10. Safe Cutover Without Dual-Write

A state-family migration uses the following conceptual phases.

### Phase A — Current authority only

The existing persistence authority remains the sole writer.

No PostgreSQL runtime writer is active for the candidate family.

### Phase B — Handoff validation

The owning-domain aggregate is round-tripped through tests or migration tooling using the approved handoff contract.

Any server-side representation at this stage is non-authoritative test data only.

### Phase C — One-time governed migration

If legacy import is authorized, trusted authority performs one bounded migration using authenticated source/destination context.

A durable migration receipt should identify at least:

- source compatibility generation/fingerprint sufficient to detect replay;
- destination `worldInstanceId`;
- authenticated account/hero where applicable;
- state-family/version;
- accepted/rejected result.

This contract does not define that receipt's final schema because no domain cutover is authorized yet.

### Phase D — Server authority activation

Only after successful migration/initialization does the server become sole authoritative writer for the selected state family in that World Instance.

Client persistence no longer settles that online family.

### Phase E — Local compatibility / projection

Save v2 may continue to support local/offline worlds. For a migrated online family it may retain only explicitly non-authoritative compatibility metadata or cache/projection data if useful.

It must not be accepted later as a competing source of economic truth.

---

## 11. Fresh-World and Legacy Isolation

Fresh World Instance creation remains isolated from mature worlds.

No future state-family initializer may accept an arbitrary client `sourceWorldInstanceId` and copy:

- Personal Money or Company Money;
- productive work history;
- Work Capacity advantages;
- capability/qualification evidence;
- inventory/reservations;
- contracts/cargo;
- mission/world reputation with economic effect;
- companies/assets/infrastructure.

Legacy migration is distinct from fresh-world creation.

If a future product decision allows an existing local world to become an authenticated server-backed continuation, that must be an explicit migration into an eligible destination World Instance, with family-by-family validation and replay protection. It is not a generic import into a fresh world.

A failed migration must leave the source local save unchanged and must not leave a partially active destination family that can be combined with another source of truth.

---

## 12. Domain-Specific Handoff Gates

### 12.1 Player Economy — blocked pending DT-03 handoff

`PlayerEconomyState` already defines strong domain invariants and replay identities, but the current merged main does not yet contain its final live `GameSession` capture/restore integration.

At this checkpoint PR #625 is open and explicitly proposes a detached capture/restore state port for the persistence owner.

Therefore DT-02 must wait for the DT-03 handoff to merge and then consume that port as designed rather than reverse-engineering `PlayerEconomyState` into a database schema.

### 12.2 Missions — semantics ready, online cutover dependency remains

The Mission Framework already supplies JSON-safe serialize/sanitize/restore semantics, and merged Save v2 already owns the local `missionResume` envelope.

Mission server persistence can be considered only after:

- authenticated World Instance identity exists;
- the online authoritative order/contract references needed by active missions are available;
- the cutover retires Save v2 as writer for mission state in that online World Instance.

Mission migration must preserve processed event IDs, completion receipts and consequence-intent IDs.

### 12.3 Order/cargo — local Save authority today

Merged #586 is the current local compatibility authority for hero/order/cargo continuity.

A future online logistics cutover must define the canonical server order/cargo aggregate and exactly-once settlement relationship. DT-02 must not simply store the Save v2 `worldContinuity` envelope as the permanent multiplayer schema.

### 12.4 Capability / training — partial browser history, richer evidence blocked

Existing `personalProgression.learnedCapabilityIds` are already Save v2 history and must not be lost.

Richer `CapabilityEvidenceState` includes theory, practical, qualification and supervised-experience evidence, but the current merged repository does not persist those fields durably.

At this checkpoint training lifecycle PR #606 is open and explicitly does not own Save/PostgreSQL persistence.

DT-02 must wait for DT-06 to merge and hand off the authoritative evidence/training aggregate before designing server persistence for it.

### 12.5 Production / inventory — blocked pending DT-07 persistence handoff

`InventoryState`, reservations, production cycles and producer logistics contracts already have deterministic domain semantics, but current production is a local/domain foundation with no Save v2 or PostgreSQL persistence owner.

Before server persistence, DT-07 must explicitly hand off the aggregate/version and transaction boundary for:

- exact inventories and reservations;
- production cycle replay IDs;
- producer logistics contracts and cargo custody;
- settlement-intent consumption;
- required World Clock semantics.

DT-02 must not infer a schema from current TypeScript interfaces alone.

---

## 13. World Clock Gate

Time-dependent shared economy cannot be made authoritative from client wall-clock claims.

Before server-authoritative migration of domains that settle based on elapsed World Instance time, a trusted World Instance clock persistence/catch-up boundary must exist.

This applies directly to:

- wages/shifts/living obligations;
- training duration where authoritative time is required;
- production completion;
- consumption/catch-up;
- time-based mission delays where contested effects depend on them.

One World Instance owns one logical clock. There is no per-player private economic timeline.

---

## 14. Recommended Migration Dependency Graph

The following is a dependency graph, not authorization and not a promise of one PR per line.

```text
#560 authenticated account/session
        |
        v
B2 authorized World Instance membership / hero
        |
        +------------------------------+
        |                              |
        v                              v
trusted World Clock              non-time identity-only reads
        |
        +------------------------------+
        |
        v
chosen economic/logistics family with owner handoff
        |
        +--> Player Economy/work settlement (after DT-03 handoff)
        |
        +--> order/cargo/logistics transaction chain
        |       |
        |       +--> mission runtime references
        |
        +--> capability/training evidence (after DT-06 handoff)
        |
        +--> inventory/production/contracts (after DT-07 handoff)
```

The migration owner chooses the smallest coherent transaction chain whose dependencies are already authoritative.

Do not migrate the entire economy in one PR.

---

## 15. PostgreSQL Schema Decision for #628

### Decision: NO NEW MIGRATION

No `003_*` migration or additional PostgreSQL state-family table is added by this contract.

Reasons:

1. #560 still blocks authenticated durable account/world authority activation.
2. B2 identity is already durable and does not require another identity schema.
3. Player Economy's intended live persistence handoff is still in open PR #625.
4. richer training/evidence persistence depends on DT-06 work including open PR #606.
5. production/inventory has not handed off a final persistence aggregate/transaction boundary.
6. local order/cargo and mission continuity already have a valid Save v2 authority and have not been approved for online cutover.
7. server-persisting guessed shapes now would create inert or competing state that future owners would have to migrate again.

The absence of a new table is therefore a deliberate correctness result, not missing implementation.

---

## 16. Gate for the Next Server State-Family Migration PR

DT-02 may propose a new PostgreSQL state-family migration only when all relevant conditions below are true:

- #560 or its approved successor provides server-trusted authenticated identity and authorized World Instance context;
- the chosen owning-domain handoff is merged;
- aggregate/version/capture/restore semantics are explicit;
- stable idempotency/replay identities are explicit;
- World Clock authority exists if the domain is time-dependent;
- referenced cross-domain aggregates are authoritative or the migration is designed not to depend on them;
- fresh-world default and legacy-import rules are explicit;
- single-writer cutover and rollback behavior are testable;
- the migration is one bounded state family or one inseparable transaction chain, not the entire economy.

That PR should then add only the schema/repository/runtime wiring needed for that selected family.

---

## 17. Review Checklist

A future persistence PR must answer **yes** to all applicable checks:

- Is there exactly one authoritative writer per `(worldInstanceId, stateFamily)`?
- Is client/body identity excluded as authorization?
- Is the owning-domain persistence handoff merged?
- Are domain stable IDs and replay receipts preserved?
- Are world/owner keys explicit and cross-world reads impossible by fallback?
- Are cross-domain references stored as references rather than copied aggregates?
- Are multi-domain monetary/custody effects atomic or durably transactional?
- Is fresh-world initialization free from mature-world power?
- Is legacy import explicit rather than automatic?
- Can migration retry without duplicate effects?
- Can failure roll back without activating two sources of truth?
- Are local/offline worlds still supported until their own governed cutover?
- Does the change preserve the #560 fail-closed boundary?

A **no** answer blocks server activation for that state family.

---

## 18. Explicit Non-Goals

This contract does not:

- implement authentication or close #560;
- add a public World Instance endpoint;
- create a PostgreSQL migration;
- change `DATABASE_URL` usage;
- change Railway services/settings;
- modify Save v2;
- add Player Economy persistence;
- add capability/training persistence;
- add inventory/production persistence;
- migrate mission state to the server;
- activate multiplayer;
- modify gameplay/UI/Android behavior;
- modify GitHub Actions.

---

## Canonical Rule

**A DROPi Tycoon state family moves into durable World Instance authority only after its owning domain hands off a versioned persistence boundary and DT-02 can perform a world-scoped single-writer cutover without dual-write. B2 identity is durable today; current local Save v2 remains authoritative where it already owns continuity; newer economy, capability/training and production aggregates remain with their existing domain/local boundaries until explicitly handed off. No speculative PostgreSQL schema is created merely because a domain exists.**
