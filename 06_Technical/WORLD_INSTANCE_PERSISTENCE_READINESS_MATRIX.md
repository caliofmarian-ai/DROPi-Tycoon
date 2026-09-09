# World Instance Persistence Readiness and Cutover Dependency Matrix

## Status

DT-02 documentation/domain-design deliverable for #635 under parent #421.

Snapshot baseline at preparation: `main` `09339263d25797ea65dc71c7b0358ff58583c279`.

Coordinates:

- #545 — merged B2 PostgreSQL World Instance identity foundation;
- #586 — merged Save v2 world/order/cargo + mission continuity;
- #621 — merged fail-closed B2 server runtime adapter;
- #630 — merged persistence composition / single-writer contract;
- #560 — open authentication/security gate;
- #625 — open Player Economy GameSession composition/capture-restore handoff;
- #606 — open training/capability acquisition handoff;
- #631 — open production citywide-demand endpoint handoff;
- #627 — open mission citywide-delivery distribution projection;
- #634 — open owner canon for global origin/start locality and later relocation.

This file does not authorize a PostgreSQL migration. No `003_*` migration is approved by this matrix.

---

## 1. Readiness status semantics

The matrix uses exactly three readiness states.

### `MERGED + CONSUMABLE`

The relevant owner contract or persistence boundary exists on `main` and DT-02 may consume its semantics in a later explicitly authorized persistence design.

This does **not** mean the family is already approved for PostgreSQL cutover.

### `OPEN + BLOCKING`

A required owner handoff is still an open PR. Branch-only content is not canonical merged truth and must not be used to define a database schema or migration.

### `ABSENT + DESIGN_INPUT_ONLY`

Product/domain direction exists, but no merged or open persistence handoff provides a canonical durable aggregate/capture-restore contract yet. The input may shape future requirements but cannot be implemented as persistence authority by inference.

---

## 2. Canonical readiness matrix

| State family | Readiness | Current owner | Current authoritative write plane | Canonical aggregate/version on `main` | Capture / restore status | Stable replay / exactly-once identities | World / owner key | Transaction / concurrency semantics | Legacy import / repair rule | Current migration blocker | First safe PostgreSQL cutover point |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| World Instance identity / hero binding | `MERGED + CONSUMABLE` | DT-02 | PostgreSQL B2 repository exists; runtime activation remains fail-closed without trusted identity | `world_instances` + `world_instance_actors`; `(worldInstanceId, accountId) -> heroActorId`; baseline/map versions and revisions | Repository create/read/bind/read is merged; #621 runtime adapter is merged | Idempotent world create and actor bind identities; deterministic server-side hero derivation | `worldInstanceId`; actor binding key `(worldInstanceId, accountId)` | PostgreSQL transaction + advisory lock; optimistic expected revision for mutable world lifecycle | Fresh world identity must not import mature-world power; identity conflicts fail closed | #560 authenticated account/world authorization before durable online identity activation | Identity tables already exist; production activation is safe only after #560 supplies server-trusted account/world membership and the runtime keeps client IDs non-authoritative |
| Local hero / urban order / cargo continuity | `MERGED + CONSUMABLE` | DT-02 persistence + existing logistics/order authority | Browser Save v2 for current local/offline prototype | `SaveWorldContinuityV1`, `schemaVersion=1`, embedded in Save v2 | `captureWorldContinuity`, sanitize and restore are merged | `orderId`; existing `OrderState.economySettled`; cargo custody bound to the same order | Current local world context + order ID; future server state must be explicitly world-scoped | Current local restore is deterministic/idempotent; future contested delivery requires revision/transaction semantics from the online logistics owner | Historical Save v2 without continuity remains valid; malformed optional continuity repairs/falls back; transient input never replays | No authenticated online order/cargo aggregate; #560; atomic relationship with future economic settlement not yet defined | After an owning online logistics/order contract defines world-scoped order/cargo aggregate, revisions, replay receipts and atomic settlement, then an explicit single-writer cutover retires Save authority for that online family |
| Mission runtime / mission resume | `MERGED + CONSUMABLE` | DT-09 mission semantics; DT-02 Save envelope | Browser Save v2 `missionResume` for current local/offline prototype | `MissionResumePayloadV1`, version 1, wrapping `MissionRuntimeState` | Create/clone/sanitize/restore and reference validation are merged | Processed mission event IDs, completion receipt IDs, consequence-intent IDs, stable mission/stage/objective IDs | Mission runtime is world-contextual; external order/delivery/contract IDs remain references to owning domains | Mission transition model is deterministic and replay-safe; mission persistence does not settle external money/inventory/cargo | Missing legacy mission payload creates safe fresh mission runtime without discarding other Save state; malformed payload repairs | #560 plus server-authoritative referenced logistics/contract facts; no server mission persistence repository/cutover approved | After referenced authoritative domains restore first, mission aggregate/version is explicitly mapped to server persistence, and Save `missionResume` is retired as authoritative writer for that online world |
| Player Economy — Personal Money, employer ledger, work, Work Capacity, living state | `OPEN + BLOCKING` | DT-03 | Domain state is currently runtime/in-memory; no merged durable Player Economy persistence plane | Merged domain `PlayerEconomyState`, version 1; persistence composition/capture-restore proposed by open #625 is **not** merged truth | No merged GameSession capture/restore handoff; #625 remains open | Merged domain already defines transaction IDs, productive-work `activityId`, settled rest IDs, wage transaction IDs and living obligation/payment IDs | `(worldInstanceId, heroActorId)` for personal state; employer/company owner IDs for company ledger | Domain mutations are deterministic and exactly-once by stable IDs; no merged server revision/transaction wrapper for the aggregate | `LegacyCompatibility` preserves legacy Company Money without converting it to Personal Money; final durable import remains owner-handoff work | #625 open; #560; trusted durable World Clock; server concurrency/atomic ledger cutover not yet approved | Only after #625 or a superseding merged DT-03 handoff defines canonical capture/restore, then #560 + durable clock + explicit ledger transaction/revision design are reviewed for one-family cutover |
| Existing learned capability / personal progression history | `MERGED + CONSUMABLE` | DT-06 / progression semantics; DT-02 Save storage | Browser Save v2 `personalProgression` | `PersonalProgressionState`; `learnedCapabilityIds` is the current earned-history persistence field | Save v2 sanitize/restore for personal progression is merged | Earned learned capability IDs are stable history; existing progression serialization prevents arbitrary unknown IDs from becoming canonical | Current local hero/session; future world/person key must be supplied by the capability owner | Current Save path is single-writer local persistence; no server capability revision contract exists | Historical learned capability IDs are retained; migration must not replace earned history with money/level inference | Rich evidence/training unification is incomplete; #606 open; no approved server capability aggregate | After DT-06 defines the unified durable person/world capability aggregate and migration rule that preserves current learned history, with #560 authenticated hero binding and a reviewed single-writer cutover |
| Rich capability / theory / practical / qualification / supervised training evidence | `OPEN + BLOCKING` | DT-06 | No active durable write plane on `main` | Merged `CapabilityEvidenceState` v1 defines evidence shape; open #606 adds acquisition/session/receipt semantics but is not merged | No merged durable capture/restore contract for training sessions/receipts | Existing evidence IDs are stable; #606 proposes stable training session/completion receipt IDs but those remain branch-only until merged | Must be `(worldInstanceId, heroActorId)` or explicit owner-approved equivalent; no client-self-authored qualification authority | Capability evaluation is deterministic/read-only; durable training transaction/revision semantics are not merged | Existing learned history must survive; richer evidence cannot be fabricated from progression points, money, mission completion or equipment | #606 open; dedicated persistence handoff still required even after acquisition semantics merge; #560 | After DT-06 merges acquisition semantics **and** explicitly hands DT-02 the durable evidence/session capture-restore, replay, repair and concurrency contract; then review single-writer cutover |
| Production inventory / reservations / producer contracts / custody | `OPEN + BLOCKING` | DT-07 | Domain runtime/in-memory only; no active Save or PostgreSQL persistence owner | Merged `InventoryState`, reservations, production and producer-logistics contract semantics; #631 remains open and cannot be consumed | No merged aggregate-wide durable capture/restore handoff | Merged inventory mutation IDs and reservation IDs; producer opportunity/contract/custody/settlement-intent identities are stable domain facts | `worldInstanceId` plus inventory/node/contract identities as owned by DT-07 | Inventory reservations and mutations are deterministic/idempotent locally; no merged durable cross-aggregate revision/transaction workflow | No authoritative legacy stock import is defined; map `inventoryIndex` must never be imported as exact stock | #631 open; no dedicated persistence handoff; #560; durable World Clock; atomic stock/custody/economic settlement design | After DT-07 merges required owner handoffs and explicitly defines capture/restore + revisions/transactions for inventory/reservations/contracts, with trusted clock/auth and a reviewed transaction boundary. #631 alone, even when merged, does not by itself authorize persistence |
| World Clock C1 | `ABSENT + DESIGN_INPUT_ONLY` | World Clock / simulation owner | Deterministic runtime state only; no B2 durable server clock persistence | `WorldClockState`; policy `phase1-world-clock-v1`; deterministic minute ordinal/sanitize/advance semantics are merged | Runtime sanitize/reconstruct exists; no dedicated durable server clock capture/reconnect/catch-up handoff | Current logical minute is deterministic, but durable catch-up command/receipt IDs are not defined by a merged persistence contract | `worldInstanceId` | Runtime bounded advance is deterministic; no server revision/lease/catch-up transaction contract exists | Legacy local fallback world ID exists; no governed online clock import/cutover rule | Dedicated owner persistence contract absent; #560; catch-up replay/revision semantics absent | After the clock owner defines server-authoritative revision, catch-up receipt/idempotency, restore and offline semantics, then authenticate World Instance membership and cut over before any time-dependent economic family |
| Global origin / home / starting / current locality + relocation history (#634) | `ABSENT + DESIGN_INPUT_ONLY` | Cross-domain owner canon #634; DT-02 future persistence coordination; DT-11 locality identity | No dedicated persistence write plane exists for these distinct facts | No canonical merged aggregate/version yet. Required future facts are `homeCountryId`, `homeLocalityId`, `startingLocalityId`, `currentCountryId`, `currentLocalityId` plus replay-safe relocation history | Absent. Current Save/world continuity does not provide a governed residence/relocation aggregate | Required future relocation event IDs must be stable and exactly once; no merged event factory/receipt exists yet | Must bind to authorized World Instance + hero/person and source-backed governed country/locality IDs | Relocation must become one replay-safe state transition; no server/local dual-write and no teleport-style silent rewrite | Reload must preserve current residence; legacy/current worlds must not silently snap to Brăila, home locality or original starting locality. Import/default policy is not yet defined | #634 is product/design canon only; no locality-residence aggregate, relocation transition contract or capture/restore handoff; DT-11 locality/playable-city handoff and #560 also required | After stable governed locality IDs, a canonical residence aggregate/version, relocation event/receipt semantics, restore/repair/import rules and owner-approved capture/restore are merged; only then may DT-02 design a world-scoped persistence cutover |

---

## 3. Open-owner handoff register

The following artifacts are explicitly **not consumable** at this snapshot:

| Artifact | Repository state | Matrix treatment | Why |
| --- | --- | --- | --- |
| #625 Player Economy GameSession composition | Open PR | `OPEN + BLOCKING` | Its capture/restore state port is not on `main`; DT-02 must not design durable Player Economy schema from branch-only code. |
| #606 training/capability acquisition | Open PR | `OPEN + BLOCKING` | Training session/receipt semantics are not merged, and the PR itself does not authorize persistence. |
| #631 production citywide-demand endpoint handoff | Open PR | `OPEN + BLOCKING` | Spatial production cause identity is not merged; even after merge it is not, by itself, a persistence capture/restore contract. |
| #627 mission citywide-delivery distribution | Open PR | Dependency only; not persistence truth | It is a deterministic mission-selection projection and explicitly creates no Save/PostgreSQL authority. |
| #634 global origin/start locality + relocation | Open issue / owner canon | `ABSENT + DESIGN_INPUT_ONLY` | It defines required future persisted facts and invariants, but no canonical runtime/persistence aggregate exists yet. |

A later matrix refresh may change a row only after the relevant artifact is actually merged or superseded by another merged owner contract.

---

## 4. #634 locality and relocation persistence requirements

The persistence model must never encode Brăila as an implicit permanent home or restore fallback for every player.

The following concepts are independent future facts:

- `homeCountryId`;
- `homeLocalityId`;
- `startingLocalityId`;
- `currentCountryId`;
- `currentLocalityId`.

Nationality/origin profile identity is also distinct, but DT-02 does not own its UI or profile acquisition.

A future relocation transition must:

1. resolve source and destination through governed locality identities;
2. bind to the same authorized World Instance and hero/person;
3. use a stable relocation event/command identity;
4. apply exactly once;
5. preserve relocation history;
6. update current residence without rewriting home or starting locality;
7. reconcile employer/work/story/cargo references through their owning domains;
8. survive process restart/reconnect;
9. reject stale/unknown/cross-world locality references;
10. never fall back to Brăila or origin merely because a newer residence record is unavailable.

No database columns/tables are selected by this document. The aggregate shape remains owner-handoff work.

---

## 5. Cross-domain cutover order

No all-at-once economic migration is authorized. A future cutover should respect dependency order:

1. #560 authenticated account/session and authorized World Instance membership;
2. durable World Instance identity/hero binding already provided by B2;
3. trusted server World Clock before time-dependent economic settlement;
4. one explicitly approved state family with owner capture/restore + replay + concurrency contract;
5. referenced state before projections that depend on it;
6. mission projections after authoritative order/delivery/contract references are restorable;
7. capability/work-access projections after authoritative capability evidence and Player Economy facts exist;
8. UI/client projection last.

For any `(worldInstanceId, stateFamily)`, cutover remains single-writer:

`LocalSaveAuthority XOR ServerWorldAuthority`.

A diagnostic shadow may compare state but cannot settle gameplay or become fallback authority.

---

## 6. PostgreSQL migration decision

**Decision: NOT AUTHORIZED.**

There is no justified `003_*` migration at this checkpoint.

Reasons:

- #560 remains open;
- #625 remains open;
- #606 remains open;
- #631 remains open;
- World Clock durable authority is absent;
- #634 residence/relocation is design input without a canonical aggregate;
- current Save v2 still legitimately owns local order/cargo/mission/progression continuity;
- no orchestrator-approved state-family cutover has selected the next PostgreSQL authority family.

The next database migration may be designed only after Central Orchestrator reviews this matrix and explicitly names a state family whose owner handoff, authentication, dependency ordering, legacy rule and single-writer cutover are ready.

---

## 7. Canonical DT-02 rule

**A state family is not eligible for PostgreSQL merely because its TypeScript model exists. DT-02 consumes only merged owner handoffs, preserves stable replay identities and cross-world keys, restores referenced authorities before projections, keeps one authoritative writer per World Instance/state family, and does not create the next migration until #560 plus an explicitly reviewed cutover make that migration safe.**
