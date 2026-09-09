# Personal Capability Runtime

Status: Phase-1 implementation contract for #437 / #359.
Last updated: 2026-09-09.

## Purpose

The capability domain answers: **what can this human currently do, and why?**

Implementation lives in `game-web/src/capabilities/**` and `game-web/src/progression/**`. It extends the existing #359/#371 learned-capability foundation without changing Save v2, Player Economy mutation authority, server persistence, UI, map data, CI, Railway, or multiplayer authority.

## Requirement model

Work and capability acquisition can combine reusable requirements for prerequisite capability, theory, practical training, supervised experience, fictional qualification, equipment, vehicle class, cargo handling, facility/infrastructure, employment, employer permission, company capability, world access, Personal Money, Work Capacity, and current-shift availability.

No new capability in this slice is granted from an arbitrary level number or from money alone. Exact Work Capacity values are balancing policy data.

Training and qualification concepts are fictional Tycoon gameplay abstractions, not claims about real-world licences.

## Starter and bicycle examples

`walking-light-document-delivery` requires the canonical starter learned state plus active employment, employer authorization, smartphone, light-document cargo capability, sufficient Work Capacity, and current-shift availability.

`BicycleOperation` requires separate bicycle theory and practical-training evidence. `bicycle-light-parcel-delivery` then requires that earned capability plus a compatible bicycle, Bicycle vehicle class, light-parcel cargo capability, employer authorization, Work Capacity, and shift availability.

## Powered two-wheel and road-delivery eligibility

The same work-access evaluator now covers the first governed advanced courier activities:

- `electric-scooter-light-parcel-delivery`;
- `motorcycle-light-parcel-delivery`;
- `car-light-parcel-delivery`;
- `delivery-van-light-parcel-delivery`.

These are eligibility contracts, not automatic vehicle unlocks. A learned capability ID is necessary but not sufficient. Work access re-checks the relevant theory/practical evidence and fictional vehicle-operation qualification, then also requires active employment, explicit employer authorization, the correct equipment/vehicle fact, compatible light-parcel handling, authoritative Work Capacity, and current-shift availability.

`DeliveryVanOperation` additionally preserves its existing van cargo-practice, supervised road-delivery experience, and delivery-van qualification requirements.

The current runtime vehicle catalog has `ElectricScooter`, `Motorcycle`, and `DeliveryVan`. It does not yet expose a player `Car` vehicle type. The car eligibility contract therefore fails closed until an owning runtime supplies a real `Car` equipment/vehicle fact; capability code does not create or imply car ownership.

### Employer authorization boundary

Starter `LightDeliveryEmployee` employment continues to derive only the already-canonical starter `light-delivery` authorization. It does **not** manufacture bicycle, scooter, motorcycle, car, or van authorization.

Advanced vehicle authorization IDs are requirements only. They become satisfied solely when the owning employer/runtime explicitly supplies the corresponding fact through `PlayerWorkAccessFacts.employerPermissionIds`. Capability code never promotes employment, capability, equipment ownership, or profession selection into employer permission.

This distinction is deliberate: qualification without equipment is blocked, equipment without qualification is blocked, and both remain blocked without explicit employer authorization.

## Governed road training evidence acquisition

`game-web/src/capabilities/trainingAcquisition.ts` provides the first authority-backed lifecycle for the road-vehicle evidence already consumed by capability/work-access evaluation:

1. `road-vehicle-theory`;
2. `car-operation-practical`;
3. `car-operation-qualification`;
4. `van-cargo-practical`;
5. `road-delivery-supervised`;
6. `delivery-van-qualification`.

The ordering is explicit. Car practical training requires completed road theory. The car qualification requires both. Van training additionally requires earned `CarOperation`, then van cargo practice, supervised road-delivery experience and a separate fictional delivery-van assessment.

### Training authority boundary

The capability layer cannot self-author training. Starting and completing a governed session requires a `TrainingAuthorityPort` supplied by the owning instructor/assessment runtime.

The port returns an authority identity, authority role and authorization reference. The lifecycle rejects:

- missing or rejected authority;
- malformed authority evidence;
- learner identity attempting to authorize its own evidence;
- the wrong authority role;
- completion by a different session authority.

`Instructor`, `Assessor` and `Supervisor` are game-domain authority roles. They do not represent real legal licensing bodies.

The port is a trust/integration hook, not a cryptographic verifier. Future server or institution authority can implement the port without changing capability semantics.

### C1 time and deterministic receipts

Each governed module has a replaceable Phase-1 duration in game minutes. Session start/completion reads World Clock C1 and requires the same World Instance. Wall-clock time and `Date.now()` are not evidence authority.

A training session gets a stable ID from world + learner + evidence. Completion gets a stable receipt ID from the same identity tuple. Replaying a completed session returns the existing receipt and does not append duplicate theory, practical, qualification or supervised-experience evidence.

Supervised experience is therefore incremented once for the governed completion, even when the completion command is replayed.

Completing training does **not** automatically grant the corresponding learned capability. For example, completing road theory + car practical + the fictional car qualification makes `CarOperation` eligible for the existing capability-acquisition path; it does not silently add `CarOperation` itself.

### Persistence and economy boundary

The training lifecycle is currently a domain aggregate only. It does not change Save v2 and does not claim persistence ownership. A later Save-owner integration may persist its sessions/receipts under a separately governed contract.

Training does not debit Personal Money, consume Work Capacity, settle wages or mutate employer treasury. If training later has economic/time costs, the owning economy/runtime must execute those mutations outside the capability layer.

## Player-readable failure reasons

Evaluation returns stable blocker codes with player-facing messages for training, qualification, equipment, vehicle, cargo capability, facility, employment, employer permission, company capability, world access, Work Capacity, Personal Money, and current-shift availability. Unknown capability/activity IDs fail closed with generic safe explanations rather than exposing raw internal IDs.

## Player Economy integration boundary

Player Economy owns Personal Money, employment state, wage settlement, living costs, productive-work records, and Work Capacity mutation in `game-web/src/economy/playerEconomy.ts`.

The capability domain integrates that state through `game-web/src/capabilities/playerEconomyWorkAccess.ts`. The adapter is deliberately read-only and exposes only the existing `CapabilityEconomyPort` queries:

- `isEmployee()`;
- `hasWorkCapacity(requiredUnits)`;
- `hasPersonalFunds(requiredMinor)`.

The adapter derives only facts already explicit in the merged fresh-employee economy contract:

- active `LightDeliveryEmployee` employment satisfies current starter light-delivery employer authorization;
- the employer-provided starter smartphone satisfies the smartphone equipment requirement;
- the starter light-delivery role supplies the current light-document handling fact.

Bicycle and advanced road-vehicle access are not inferred from the starter walking role. Their employer authorization, equipment/vehicle availability, and light-parcel handling capability must be supplied explicitly by the owning runtime.

### Work Capacity scale

The original capability prototype used placeholder Work Capacity values `1` and `2`. Productive Player Economy work consumes `starterDeliveryCapacityCost`, currently `100` under `phase1-player-economy-v1`.

Economy-backed work-access evaluation therefore uses the Player Economy policy's authoritative `starterDeliveryCapacityCost` for walking, bicycle, powered two-wheel, car, and delivery-van eligibility until the economy domain exposes differentiated execution costs. The capability domain does not invent or mutate a second Work Capacity ledger.

Actual Work Capacity consumption remains exclusively in Player Economy. Once productive work exhausts the economy aggregate, capability work-access evaluation immediately returns `insufficient-work-capacity` without any duplicated state synchronization.

## Legacy compatibility

`capabilityEvidenceFromPersonalProgression(...)` preserves all learned capability IDs already stored by #371. Existing `progressionPoints` may remain in legacy-compatible state, but the new evaluator does not use them as a qualification shortcut. This implementation does not reset old saves or persist new theory/practical evidence without a separately governed migration.

## Career freedom

`PersonalCareerState` keeps active profession and deterministic profession history. Changing profession does not grant or revoke capability, change employer, create company ownership, force CEO progression, or erase earned history. Employment and profession remain separate concepts.

## Validation

Configuration validation rejects duplicate IDs, unknown capability references, missing player labels, invalid numeric requirements, and circular capability prerequisites. Evaluation is deterministic for identical evidence and runtime context.

The Player Economy adapter is also deterministic and mutation-free: identical capability evidence, economy state, runtime access facts, and policy produce identical eligibility results.

## Canonical rule

A profession label never makes a person qualified by itself. Work eligibility is the intersection of earned personal evidence and current equipment, vehicle, cargo, facility, employer/company, world, time, and authoritative Player Economy Work Capacity facts.
