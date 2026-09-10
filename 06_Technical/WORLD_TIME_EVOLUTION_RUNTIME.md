# Document Information

Document: WORLD_TIME_EVOLUTION_RUNTIME.md
Project: DROPi Tycoon
Version: 1.0.1
Status: Technical Canon — DT-18 First Runtime Slice
Owner: DT-18 — WORLD TIME & EVOLUTION
Coordinates: #420 #651 #419 #628 #643
Last Updated: 2026-09-09

---

# World Time and Settlement Evolution Runtime

## 1. Purpose

This document reconciles issue #420 authoritative time with issue #651 settlement evolution into one bounded DT-18 temporal/macro-simulation authority.

The implementation does **not** create a second clock. `game-web/src/systems/worldClockSystem.ts` remains the sole logical World Clock arithmetic and boundary owner. `game-web/src/systems/worldEvolutionSystem.ts` consumes its deterministic boundary summary and owns only macro-development state/evaluation.

The first executable proof is deliberately narrow:

`completed locality-scoped DT-07 production cycle`
`+ explicit DT-07 production-model infrastructure-index proxy`
`+ explicit DT-07 production-model specialist-index proxy`
`-> DT-18 evidence receipts`
`-> structural World Clock tick`
`-> LATENT -> RURAL_POINT`

The two index observations are **not** proof that a DT-06 specialist/qualification exists and are **not** proof that a DT-20 physical facility/company capability exists.

No money, population, housing, roads, jobs, inventory, specialist, qualification, facility, company capability or geometry is fabricated by DT-18.

---

## 2. Single Time Authority

The canonical time rule remains:

**World/economic time is logical World Instance state. Render frames and device wall time are not authoritative simulation time.**

DT-18 consumes the existing C1 clock contract:

- deterministic minute progression;
- day/night projection;
- work-shift boundaries;
- operating-day boundaries;
- market-cycle boundaries;
- season boundaries;
- year boundaries;
- bounded advancement/catch-up proposals.

Settlement evolution never advances itself from Phaser `update()`, FPS, frame count or `Date.now()`.

For future multiplayer, every player in the same World Instance consumes the same authoritative World Clock. Player activity can create different economic evidence; it does not create private player time.

---

## 3. Tick Classes

`worldEvolutionSystem.ts` maps the existing World Clock boundary summary into these named classes:

- `HOUR`;
- `WORK_SHIFT`;
- `OPERATING_DAY`;
- `MARKET_CYCLE`;
- `SEASON`;
- `STRUCTURAL_YEAR`.

These are classifications of existing World Clock boundaries, not independent timers.

The first settlement mutation is evaluated only on a `STRUCTURAL_YEAR` boundary. Therefore settlement development is not FPS-driven.

---

## 4. Settlement Development State

The executable tier vocabulary is:

`LATENT -> RURAL_POINT -> HAMLET -> VILLAGE -> SMALL_TOWN -> TOWN -> CITY -> LARGE_CITY`

Only `LATENT -> RURAL_POINT` is implemented in this slice. Higher transitions remain explicit non-implemented states.

A `SettlementDevelopmentState` is scoped by:

- `worldInstanceId`;
- stable `localityId`;
- state version;
- policy ID;
- current development tier;
- monotonic local revision;
- accepted evidence receipts;
- transition receipts;
- processed structural-tick IDs.

Locality identity remains owned by DT-11. DT-18 never creates or renames a locality.

---

## 5. Evidence Boundary

The first executable evidence codes are:

- `LOCAL_PRODUCTION_CYCLE_COMPLETED`;
- `PRODUCTION_MODEL_INFRASTRUCTURE_INDEX_POSITIVE`;
- `PRODUCTION_MODEL_SPECIALIST_INDEX_POSITIVE`.

Evidence classes make the authority boundary machine-visible:

- `LOCAL_PRODUCTION_CYCLE_COMPLETED` -> `AUTHORITATIVE_PRODUCTION_FACT`;
- both `PRODUCTION_MODEL_*_INDEX_POSITIVE` receipts -> `PRODUCTION_MODEL_PROXY`.

The first transition reason is:

- `PRODUCTION_MODEL_BASELINE_ESTABLISHED`.

This naming is intentional. `ProductiveNodeState.infrastructureIndex` and `ProductiveNodeState.specialistIndex` are replaceable DT-07 model/tuning inputs. Positive values may be useful to prove a bounded production-model baseline, but they do **not** establish any of the following facts:

- a legitimate DT-06 specialist is hired or engaged;
- a player or company owns a qualification;
- Work Capacity exists;
- a DT-20 facility/HQ/workshop/storage site physically exists;
- a company capability exists.

When DT-06 and DT-20 expose authoritative facts with stable identity and replay semantics, a later DT-18 slice may consume those facts explicitly. This slice does not invent them.

---

## 6. Real Economic Cause -> First Macro Consequence

DT-07 already owns deterministic locality-scoped production through `ProductiveNodeState` and exactly-once `completedCycleIds`.

`deriveProductionSettlementEvidence(...)` accepts only an already-completed production cycle and produces no economic mutation. For that exact production-cycle source it records:

1. the authoritative completed-production fact;
2. whether the production model's infrastructure index is positive;
3. whether the production model's specialist index is positive.

All three receipts are tied to the same `sourceRef`. DT-18 does not combine an infrastructure proxy from one production cycle with a specialist proxy from another to fabricate a causal bundle.

The first `LATENT -> RURAL_POINT` baseline transition requires this complete same-source bundle plus a structural World Clock tick.

Therefore:

- a catalog locality alone cannot evolve;
- Player Level cannot grow a settlement;
- money alone cannot grow a settlement;
- an incomplete or unknown production cycle creates no evidence;
- a tuning index does not create a specialist/facility/capability;
- replaying the same production evidence or structural tick cannot duplicate the consequence.

This is a causal-wiring proof, not the final settlement balancing model.

---

## 7. Replay and Exactly-Once Rules

Evidence is keyed by a stable `evidenceId` derived from:

`worldInstanceId + localityId + productive node + production cycle + evidence code`.

Live replay behavior is fail-closed:

- an identical evidence ID with identical content is a duplicate/no-op;
- an identical evidence ID with conflicting content is rejected;
- duplicate semantic evidence (`sourceDomain + sourceRef + code`) cannot be restored as two different facts.

Structural evaluation is keyed by:

`worldInstanceId + authoritative year`.

A structural tick is processed once for one settlement state. Replaying it cannot append a second transition.

Transition receipts retain:

- deterministic transition ID;
- before/after tier;
- reason code;
- exact evidence IDs/codes;
- structural tick ID;
- authoritative logical minute.

---

## 8. Persistence Handoff and Restore Integrity

This slice **does not activate Save v2, Save v3, PostgreSQL, Railway persistence or a second writer**.

DT-18 exposes a detached capture/restore contract for DT-02. Restore is fail-closed on both shape and cross-reference integrity.

The snapshot contains:

- `version`;
- `policyId`;
- `worldInstanceId`;
- `localityId`;
- `tier`;
- `revision`;
- evidence receipts;
- transition receipts;
- processed structural-tick IDs.

Restore rejects at least:

- wrong state version/policy;
- world/locality mismatch;
- malformed tier/evidence/transition/tick shapes;
- duplicate evidence IDs, transition IDs or processed tick IDs;
- duplicate semantic evidence under different IDs;
- transition evidence IDs missing from restored evidence receipts;
- transition evidence codes inconsistent with the referenced receipts;
- duplicated evidence IDs/codes inside one transition;
- structural tick IDs malformed for the restored World Instance;
- transition structural ticks absent from `processedStructuralTickIds`;
- more than one transition attached to the same structural tick;
- a transition whose reason does not legally map to its v1 `fromTier -> toTier`;
- a transition ID inconsistent with its fields;
- transition evidence drawn from inconsistent source bundles;
- transition evidence observed after the transition's evaluation minute;
- restored current tier inconsistent with the transition history.

For the v1 policy, the only legal executable transition is:

`LATENT -> RURAL_POINT` with reason `PRODUCTION_MODEL_BASELINE_ESTABLISHED` and the exact three-code production baseline bundle.

This makes snapshot tampering/inconsistency detectable before DT-02 persists the handoff.

---

## 9. Cross-DT Boundaries

DT-18 owns:

- macro time classification;
- settlement-development state;
- causal evidence aggregation for development;
- macro transition evaluation;
- evolution replay semantics;
- the detached persistence handoff shape.

DT-18 consumes but does not own:

- DT-11 locality identity/readiness;
- DT-07 production/resource facts and production-model indices;
- DT-06 specialist/qualification/Work Capacity authority;
- DT-20 physical company/facility/capability authority;
- DT-03 economic ledgers/settlements;
- DT-05 local citizens/traffic;
- DT-02 durable persistence;
- DT-01 evolved urban geometry/presentation;
- DT-09 work/mission materialization;
- DT-17 authenticated server write authority.

A future real specialist or facility requirement must consume DT-06/DT-20 facts. Production tuning indices can never substitute for those authorities.

---

## 10. Scope Limits

This first slice intentionally does not:

- implement HAMLET/VILLAGE/TOWN/CITY progression;
- implement decline/recovery;
- mutate population or migration;
- implement season-driven settlement rules;
- create roads/buildings/urban geometry;
- create company formation/facilities;
- create specialists/qualifications;
- create jobs, money, demand or inventory;
- persist the clock/evolution state;
- activate offline catch-up;
- activate multiplayer writes;
- wire player-facing UI.

Required future slices must consume real owning-domain facts instead of extending this proof with hardcoded scores.

---

## 11. Acceptance Evidence for This Slice

Automated tests cover:

- deterministic World Clock -> DT-18 tick classification;
- one-step vs minute-stepped clock determinism;
- completed-production-only evidence derivation;
- explicit authoritative-fact vs production-model-proxy classification;
- no DT-06/DT-20 capability claim from tuning indices;
- exactly-once evidence replay and conflicting-replay rejection;
- no settlement evolution without a structural tick;
- first baseline transition and structural-tick replay protection;
- persistence round-trip;
- missing evidence references;
- inconsistent evidence-code references;
- missing/malformed/duplicated structural tick references;
- illegal transition/reason semantics;
- inconsistent restored tier history;
- duplicate IDs and duplicate semantic evidence.

This remains the smallest bounded executable bridge between #420 and #651 while preserving neighboring authority ownership.

---

End of Document
