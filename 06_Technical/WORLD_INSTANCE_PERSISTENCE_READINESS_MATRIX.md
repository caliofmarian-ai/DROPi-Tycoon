# World Instance Persistence Readiness and Cutover Dependency Matrix

## Status

DT-02 documentation/domain-design deliverable for #635 under parent #421.

Snapshot baseline for this refresh: `main` `e88e1c2b614348bb2d223673befc7fa06bc9f1b4`.

Coordinates:

- #545 — merged B2 PostgreSQL World Instance identity foundation;
- #586 — merged Save v2 world/order/cargo + mission continuity;
- #621 — merged fail-closed B2 server runtime adapter;
- #625 — merged Player Economy GameSession composition and capture/restore state port;
- #606 — merged governed capability/training acquisition semantics;
- #627 — merged mission citywide-delivery distribution projection;
- #630 — merged persistence composition / single-writer contract;
- #638 — open DT-03 Player Economy persistence handoff;
- #631 — open DT-07 production citywide-demand endpoint PR;
- #560 — open authentication/security gate for authenticated server/public-profile authority;
- #634 — open owner canon for global origin/start locality and later relocation;
- #643 — open P0 requiring a governed `PlayableLocalityInstance` contract.

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

Product/domain direction exists, but no merged persistence handoff provides the canonical durable aggregate/capture-restore contract needed for persistence authority. The input may shape future requirements but cannot be implemented as persistence authority by inference.

---

## 2. Canonical readiness matrix

| State family | Readiness | Current owner | Current authoritative write plane | Canonical aggregate/version on `main` | Capture / restore status | Stable replay / exactly-once identities | World / owner key | Transaction / concurrency semantics | Legacy import / repair rule | Current migration blocker | First safe PostgreSQL cutover point |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Local/offline account + World Instance hero identity | `MERGED + CONSUMABLE` | DT-02 B1/B2 identity | Local/offline identity is valid without authenticated public-profile authority; B2 identity repository exists independently | `WorldIdentityState`; deterministic `(worldInstanceId, accountId) -> heroActorId`; B2 `world_instances` + `world_instance_actors` | B1 local identity creation/validation and B2 repository create/read/bind/read are merged | Stable World Instance ID + deterministic hero binding; idempotent world create and actor bind | `worldInstanceId`; `(worldInstanceId, accountId)` | Local identity is deterministic; B2 uses PostgreSQL transaction/advisory lock and revisions where applicable | Fresh local identity must not import mature-world economic state | **Not #560 for local/offline identity.** Online authenticated/public durable authority remains gated by #560 | Local/offline identity needs no online cutover. Any authenticated server/public-profile activation may use B2 only after #560 supplies server-trusted account context and authorization |
| Authenticated online account/public-profile authority | `OPEN + BLOCKING` | Security/account authority; DT-02 only consumes trusted identity | Current durable online activation is deliberately fail-closed | No approved authenticated account/public-profile persistence boundary for World Instance authorization yet | Not available as a trusted server identity resolver | Future authenticated session/account IDs must be server-derived; client actor/world claims cannot authorize writes | Server-authenticated account + authorized World Instance membership | Must cover impersonation, replay, stale commands, unauthorized mutation and enumeration | Local/offline identity remains valid and must not be destroyed or reinterpreted | #560 | After #560 merges a server-trusted authenticated identity/authorization boundary and an explicit online authority activation is reviewed |
| World Instance identity / hero binding | `MERGED + CONSUMABLE` | DT-02 | PostgreSQL B2 repository exists; online runtime activation remains fail-closed without trusted identity | `world_instances` + `world_instance_actors`; baseline/map versions and revisions | Repository create/read/bind/read and #621 runtime composition are merged | Idempotent world create and actor bind identities; deterministic server-side hero derivation | `worldInstanceId`; actor binding `(worldInstanceId, accountId)` | PostgreSQL transaction + advisory lock; optimistic expected revision for mutable world lifecycle | Fresh World Instance identity must not import mature-world power; identity conflicts fail closed | #560 only for authenticated online activation; no blocker for local/offline identity | B2 tables already exist. Production online activation is safe only after #560 supplies trusted account/world membership and client IDs remain non-authoritative |
| Local hero / urban order / cargo continuity | `MERGED + CONSUMABLE` | DT-02 persistence + logistics/order authority | Browser Save v2 for current local/offline prototype | `SaveWorldContinuityV1`, schema version 1, embedded in Save v2 | `captureWorldContinuity`, sanitize and restore are merged | `orderId`; terminal `economySettled`; cargo custody bound to the same order | Current local world context + order ID; future server aggregate must be explicitly world-scoped | Current local restore is deterministic/idempotent; future contested delivery needs owner-approved revision/transaction semantics | Older Save v2 without continuity remains valid; malformed optional continuity repairs/falls back; transient input never replays | No approved authenticated online order/cargo aggregate; atomic economic settlement boundary not yet selected | After an online logistics owner defines world-scoped aggregate, revisions, replay receipts and atomic settlement, followed by explicit single-writer cutover from Save authority |
| Mission runtime / mission resume | `MERGED + CONSUMABLE` | DT-09 mission semantics; DT-02 Save envelope | Browser Save v2 `missionResume` for current local/offline prototype | `MissionResumePayloadV1` v1 wrapping `MissionRuntimeState` | Create/clone/sanitize/restore and referenced-authority validation are merged | Processed event IDs, completion receipt IDs, consequence-intent IDs, mission/stage/objective IDs | World-contextual mission runtime; order/delivery/contract IDs remain references | Deterministic replay-safe transition model; mission does not settle external money/inventory/cargo | Missing legacy payload creates safe fresh mission runtime without discarding other Save state; malformed payload repairs | No server mission persistence/cutover approved; server references must first become authoritative/restorable | After referenced authorities restore first and a server mission aggregate/cutover is explicitly approved. Save `missionResume` must then cease being authoritative for that online family |
| Citywide mission delivery selection/history (#627) | `MERGED + CONSUMABLE` | DT-09 | Read-only deterministic projection; **not** a persistence writer | Merged #627 citywide delivery distribution and JSON-safe selection history contract | Selection history can be materialized/validated as projection input; it is not a mission/order persistence aggregate | Existing authoritative opportunity/order/DeliveryMission IDs plus deterministic selection-history identities | Same World Instance references supplied by owning domains | Deterministic selection; no new settlement or mutation transaction | Must be reconstructed/validated from authoritative causes rather than promoted into cargo/order truth | No persistence blocker created by #627 itself; it is a projection dependency only | Never cut over as a replacement order/mission authority. Persist only if an owning contract later requires history as bounded projection data |
| Player Economy — merged GameSession state port | `MERGED + CONSUMABLE` | DT-03 | Runtime authoritative sidecar; no DT-02 Save/PostgreSQL integration added by #625 | Merged `GameSessionPlayerEconomyComposition` / Player Economy state port based on `PlayerEconomyState` v1 | #625 merged explicit capture/restore with fail-closed world/hero/policy/ledger validation | Transaction IDs, productive-work `activityId`, rest IDs, wage IDs, living obligation/payment IDs and other merged replay keys | `(worldInstanceId, heroActorId)` plus employer/company ledger identity | Domain operations are deterministic/exactly-once; state port does not itself provide the final persistence CAS/transaction contract | Legacy `GameSession.company.money` stays Company Money and is never imported as Personal Money | The **formal DT-03 persistence handoff #638 is still OPEN**; trusted durable clock and explicit cutover remain absent | DT-02 may consume #625 semantics for analysis, but must not design final durable Player Economy storage until #638 or a superseding owner persistence handoff is merged and an explicit cutover is approved |
| Player Economy — formal persistence handoff (#638) | `OPEN + BLOCKING` | DT-03 -> DT-02 handoff | None until the handoff becomes merged canon and DT-02 is separately authorized to implement a persistence plane | #638 proposes owner keys, state-port version, replay IDs, atomicity/CAS, fresh defaults and legacy rules; branch-only content is not canonical yet | Open PR only | Proposed IDs may be reviewed but not frozen into DT-02 schema before merge | Proposed world/hero/company keys remain branch-only until merge | Proposed persistence-level compare-and-swap and atomicity are branch-only until merge | Proposed FreshLocal/FreshEmployee and explicit non-conversion rules remain branch-only until merge | #638 open; #560 for online server authority; durable World Clock for time-dependent settlement; no cutover authorization | After #638 actually merges, refresh this matrix, then select a single writer and a separately reviewed implementation target; still no automatic PostgreSQL migration |
| Existing learned capability / personal progression history | `MERGED + CONSUMABLE` | DT-06 / progression semantics; DT-02 Save storage | Browser Save v2 `personalProgression` | `PersonalProgressionState`; `learnedCapabilityIds` is current earned-history persistence | Save v2 sanitize/restore is merged | Earned learned capability IDs are stable history | Current local hero/session; future world/person key requires owner-approved migration | Current Save path is one local writer; no server capability revision contract exists | Earned history must be retained and never replaced by money/level inference | Unified richer evidence persistence handoff is still absent | After DT-06 provides a merged durable person/world capability persistence handoff that preserves learned history, followed by explicit single-writer cutover |
| Rich capability / theory / practical / qualification / supervised training evidence | `ABSENT + DESIGN_INPUT_ONLY` | DT-06 | Domain runtime semantics are merged; no active durable training write plane | #606 merged governed training acquisition/session/receipt semantics on top of merged `CapabilityEvidenceState` v1 | #606 is **not** a persistence handoff and explicitly leaves future Save-owner integration separately governed | Stable training session/completion receipt IDs and evidence identities are now merged domain facts | Same World Instance + learner/hero identity in merged acquisition semantics | Acquisition is deterministic/replay-safe; durable revision/CAS/transaction semantics remain undefined for persistence | Existing learned history must survive; evidence cannot be fabricated from progression points, money, mission completion or equipment | Dedicated DT-06 persistence capture/restore/repair/concurrency handoff is absent | Only after DT-06 explicitly hands off the durable evidence/session aggregate, capture/restore, replay, repair and concurrency contract; #606 merge alone does not authorize storage |
| Production inventory / reservations / producer contracts / custody | `OPEN + BLOCKING` | DT-07 | Domain runtime/in-memory; no active Save/PostgreSQL owner | Merged inventory/reservation/production/logistics semantics exist; #631 citywide-demand endpoint work remains OPEN | No merged aggregate-wide durable capture/restore handoff | Merged inventory mutation/reservation and producer/logistics causal IDs remain domain facts | `worldInstanceId` plus inventory/node/contract identities owned by DT-07 | Deterministic/idempotent domain mutations; no merged durable cross-aggregate revision/transaction workflow | No authoritative legacy stock import; map `inventoryIndex` must never become exact stock | #631 remains open as current owner-side prerequisite; a dedicated persistence handoff is still required even after it merges | After DT-07 merges required owner work **and** explicitly defines capture/restore, revisions and transaction boundaries for inventory/reservations/contracts; #631 alone cannot authorize persistence |
| World Clock C1 | `ABSENT + DESIGN_INPUT_ONLY` | World Clock / simulation owner | Deterministic runtime state only; no B2 durable server clock | `WorldClockState`; `phase1-world-clock-v1`; deterministic ordinal/sanitize/advance semantics | Runtime sanitize/reconstruction exists; no durable server reconnect/catch-up handoff | Logical minute is deterministic; durable catch-up command/receipt IDs are not defined by a merged persistence contract | `worldInstanceId` | Runtime bounded advance is deterministic; no server revision/lease/catch-up transaction contract | Local fallback exists; no governed online clock import/cutover rule | Dedicated owner persistence contract absent; catch-up replay/revision semantics absent | After clock owner defines server-authoritative revision, catch-up receipts/idempotency, restore and offline semantics; authenticated online activation additionally requires #560 |
| Global origin / home / starting / current locality + relocation history (#634) | `ABSENT + DESIGN_INPUT_ONLY` | #634 cross-domain owner canon; DT-02 persistence coordination; DT-11 locality identity | No dedicated persistence writer for these distinct facts | No merged residence/relocation aggregate/version. Required facts remain `homeCountryId`, `homeLocalityId`, `startingLocalityId`, `currentCountryId`, `currentLocalityId` plus stable relocation history | Absent | Stable replay-safe relocation event/receipt IDs are required but not yet merged | Must bind hero/person + World Instance to governed country/locality IDs | Relocation must be exactly once and must not become local/server dual-write | Reload must preserve current residence; no snap-back to Brăila, home or starting locality | Residence aggregate + relocation transition/capture/restore handoff absent; #643 playable-locality handoff also absent | After locality identity + playable instantiation + residence aggregate + relocation receipts/capture/restore/import rules are merged; online server persistence additionally requires #560 and explicit cutover |
| Catalog locality -> `PlayableLocalityInstance` (#643) | `ABSENT + DESIGN_INPUT_ONLY` | DT-11 World Localities | Country Catalog identity is not a playable-runtime persistence writer | #643 requires a future governed `PlayableLocalityInstance`; no merged canonical aggregate/version exists at this snapshot | Absent | Stable playable-locality instance identity and any materialization/replay receipts are not yet merged | Must bind one governed source-backed locality ID to one World Instance/playable instance without inventing geography | Materialization/re-materialization concurrency and stale-version behavior are not defined by a merged owner contract | Sparse catalog nodes must never be treated as a detailed city scene; restore must not replace unsupported locality with Brăila | DT-11 playable-locality instantiation contract absent; persistence shape must not be inferred by DT-02 | After DT-11 merges a versioned `PlayableLocalityInstance` handoff covering locality provenance, spawn/routes/roads/POIs/economic nodes/scene basis, validation and replay/version rules; only then may DT-02 design persistence for the instance identity |

---

## 3. Current handoff register

| Artifact | Repository state at this snapshot | Matrix treatment | Persistence consequence |
| --- | --- | --- | --- |
| #625 Player Economy GameSession composition | **Merged** | `MERGED + CONSUMABLE` | DT-02 may consume the merged state-port/capture-restore semantics, but final persistence design waits for #638. |
| #606 training/capability acquisition | **Merged** | Merged domain input; durable training persistence remains `ABSENT + DESIGN_INPUT_ONLY` | Stable acquisition/session/receipt semantics are canonical, but #606 explicitly did not hand persistence ownership to DT-02. |
| #627 mission citywide-delivery distribution | **Merged** | `MERGED + CONSUMABLE` projection input | It remains a deterministic projection and creates no second mission/order/Save/PostgreSQL authority. |
| #638 Player Economy persistence handoff | **Open PR** | `OPEN + BLOCKING` | Do not freeze its proposed durable aggregate/CAS/import rules into DT-02 implementation until merge. |
| #631 production citywide-demand endpoints | **Open PR** | `OPEN + BLOCKING` | It is owner-side domain work, not itself the final persistence contract. |
| #634 global origin/start locality + relocation | **Open issue / owner canon** | `ABSENT + DESIGN_INPUT_ONLY` | Required future persisted facts/invariants exist, but no runtime/persistence aggregate exists. |
| #643 playable-locality instantiation | **Open issue / P0 owner requirement** | `ABSENT + DESIGN_INPUT_ONLY` | DT-02 must not invent `PlayableLocalityInstance` storage before DT-11 defines the canonical instantiation contract. |

A later matrix refresh may change a row only after the relevant artifact is actually merged or superseded by another merged owner contract.

---

## 4. Local/offline identity versus #560 online authentication

#560 must not be over-applied.

Current local/offline account, World Instance and hero identity remain legitimate without production authentication. They may support local/offline world creation and deterministic identity under their existing contracts.

#560 is a hard gate only when a server/public/durable online authority must trust that the caller is entitled to mutate an account, profile, World Instance or hero binding. At that boundary:

- account identity must come from authenticated server context;
- client-supplied `accountId`, `actorId`, `heroActorId` or `worldInstanceId` cannot authorize a write by themselves;
- public profile data must remain separate from private account data;
- impersonation/replay/stale/unauthorized/enumeration tests must pass before activation.

Therefore `#560 open` means **online durable authority is not activatable**, not `local/offline identity is invalid`.

---

## 5. #634 residence and relocation persistence requirements

The persistence model must never encode Brăila as an implicit permanent home, mandatory starting locality or restore fallback for every player.

The following concepts are independent future facts:

- `homeCountryId`;
- `homeLocalityId`;
- `startingLocalityId`;
- `currentCountryId`;
- `currentLocalityId`.

Nationality/origin profile identity is also distinct, but DT-02 does not own its UI or profile acquisition.

A future relocation transition must:

1. resolve source and destination through governed locality identities;
2. bind to the same World Instance and hero/person;
3. use a stable relocation event/command identity;
4. apply exactly once;
5. preserve relocation history;
6. update current residence without rewriting home or starting locality;
7. reconcile employer/work/story/cargo references through their owning domains;
8. survive process restart/reconnect;
9. reject stale/unknown/cross-world locality references;
10. never fall back to Brăila, home or origin because a newer residence record is unavailable.

No database columns/tables are selected by this document.

---

## 6. #643 catalog locality versus playable locality

A Country Catalog locality ID is an identity/provenance fact. It is **not** sufficient proof that the locality has a valid playable runtime scene.

DT-11 must first define the canonical handoff from a governed catalog locality to a `PlayableLocalityInstance`. That future contract must determine, at minimum:

- stable playable-locality instance identity/version;
- source/provenance link back to the governed locality;
- legitimate spawn basis;
- road/route representation;
- POI/economic-node bindings;
- scene/camera/world-bounds basis;
- validation of unsupported/stale locality references;
- deterministic materialization/replay/version semantics;
- behavior when bespoke detail is unavailable without fabricating factual geography.

DT-02 must not infer database rows from sparse Country Catalog nodes, and restore must never convert an unsupported requested locality into Brăila merely because Brăila is the first premium reference city.

---

## 7. Cross-domain cutover order

No all-at-once economic migration is authorized. A future online cutover should respect dependency order:

1. authenticated account/session and authorized World Instance membership when the target is online/server authority (#560);
2. durable World Instance identity/hero binding already provided by B2;
3. governed playable locality identity/instance where location-bound state requires it (#643);
4. trusted server World Clock before time-dependent shared settlement;
5. one explicitly approved state family with a merged owner persistence handoff;
6. referenced state before projections that depend on it;
7. mission projections after authoritative order/delivery/contract references are restorable;
8. capability/work-access projections after authoritative evidence and Player Economy facts exist;
9. UI/client projection last.

For any `(worldInstanceId, stateFamily)`, cutover remains single-writer:

`LocalSaveAuthority XOR ServerWorldAuthority`.

A diagnostic shadow may compare state but cannot settle gameplay or become fallback authority.

---

## 8. PostgreSQL migration decision

**Decision: NOT AUTHORIZED.**

There is no justified `003_*` migration at this checkpoint.

Reasons:

- #638 Player Economy persistence handoff remains open;
- #631 remains open and production still lacks a dedicated persistence handoff;
- durable World Clock authority is absent;
- #634 residence/relocation remains design input without a canonical aggregate;
- #643 `PlayableLocalityInstance` handoff is absent;
- current Save v2 legitimately owns local order/cargo/mission/progression continuity;
- #560 still blocks authenticated server/public-profile authority activation, though it does **not** invalidate local/offline identity;
- no orchestrator-approved state-family cutover has selected the next PostgreSQL authority family.

The next database migration may be designed only after Central Orchestrator explicitly names a state family whose merged owner persistence handoff, authentication needs, dependency ordering, legacy rule and single-writer cutover are ready.

---

## 9. Canonical DT-02 rule

**A state family is not eligible for PostgreSQL merely because its TypeScript model or domain semantics exist. DT-02 consumes merged owner persistence handoffs, preserves stable replay identities and cross-world keys, restores referenced authorities before projections, keeps one authoritative writer per World Instance/state family, distinguishes local/offline identity from authenticated online authority, and never invents locality/runtime or database shape before the owning domain defines it.**
