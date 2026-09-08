# Mission / Quest / Campaign Runtime

Status: Phase-1 mission architecture for #553
Parent: #552 Narrative
Last updated: 2026-09-08

## Purpose

DROPi Tycoon needs authored story missions and world-caused systemic missions without splitting gameplay into two unrelated quest engines.

The implementation in `game-web/src/missions/**` therefore uses one deterministic mission graph and transition model for both sources:

- `Authored` missions carry story, character, employer, career, training, company and major-event intent;
- `Systemic` missions carry a stable `causeRef` naming the real world/economic condition that caused the opportunity.

A mission orchestrates gameplay owned elsewhere. It does not become a second order, parcel, inventory, capability, time or money authority.

## Stable mission concepts

The runtime models:

- `MissionId` and optional `MissionArcId`;
- mission source and category;
- `Locked`, `Delayed`, `Available`, `Active`, `Completed` and `Failed` states;
- stages and objectives;
- prerequisites;
- actor/location requirements;
- capability/equipment requirements;
- World Clock conditions;
- order and contract status references;
- direct references to the existing logistics `DeliveryMission` identity, order and parcel IDs;
- optional objectives;
- explicit player choices and branches;
- delayed unlocks and side paths;
- recoverable failure policies;
- completion receipts and stable consequence-intent IDs.

The supported category vocabulary is deliberately wider than this first content slice: Campaign/Story, Character, Employer, Career, Training, Company, Economic, Producer/Supply Chain, Civic/World and Event/Emergency Logistics.

## Existing logistics reuse

`game-web/src/systems/urbanLogistics.ts` remains the canonical parcel-route plan contract.

Mission delivery objectives store only:

- `deliveryMissionId`;
- `orderId`;
- parcel IDs;
- the required observed delivery state.

`deliveryReferenceMatches(...)` resolves the live/canonical `DeliveryMission` and runs the existing `isDeliveryMission(...)` invariant checks before a mission objective can accept a delivery event. The mission runtime does not duplicate parcel custody, cargo capacity, route legs, pickup or delivery state.

The current urban path remains authoritative for:

- order acceptance;
- physical pickup;
- `carryingPackage` / parcel custody projection;
- delivery validation;
- delivery settlement.

## Consequence authority

Mission completion creates one stable completion receipt and zero or more idempotent **consequence intents**.

Supported intents can request legitimate changes to:

- relationship;
- reputation;
- access;
- a capability opportunity;
- employer trust;
- company relationship;
- contract availability;
- world flags.

Money is intentionally different. A mission may emit only an `EconomicSettlementReference` naming an externally authoritative settlement event. It cannot contain an amount and cannot credit Personal Money or Company Money itself.

This keeps #436 / Agent 3 as the authority for Personal Money, wages, Work Capacity and economic conservation. A duplicate mission completion cannot emit a second settlement reference because completion and consequence identities are stable and recorded exactly once.

## Agent 6 capability boundary

Mission prerequisites can read canonical learned capability IDs and equipment facts. Agent 9 does not grant qualifications or mutate capability evidence.

Agent 6 / #437 provides the richer eligibility engine for theory, practical training, supervised experience, qualifications, employer permission, cargo capability, infrastructure, Personal Money and Work Capacity. Integration should adapt that evaluator into mission availability/work-stage facts rather than copying its logic into missions.

## Agent 7 production / systemic-mission boundary

Agent 7 / #419 exposes causal supply, demand, producer contract and cargo-custody identities.

A future adapter can turn a real `LogisticsOpportunity` or `ProducerLogisticsContract` into a `Systemic` `MissionDefinition` using:

- the opportunity/shortage identity as `causeRef`;
- the producer contract as `contractStatus` facts;
- existing cargo/order/delivery identities as mission objective references.

Mission generation must stop when the world cause disappears or the contract becomes ineligible. The mission engine itself never invents shortages, stock, cargo or settlement value.

## World Clock boundary

Mission time is expressed as an authoritative logical `worldMinute` fact. Integration must derive it from World Clock C1 (`worldClockMinuteOrdinal`) rather than frame count, wall-clock time or UI timers.

This supports:

- delayed missions;
- delayed second chances;
- time prerequisites;
- time objectives;
- deterministic replay.

Identical mission state + definitions + event + world facts produce identical transition results.

## Failure and recovery

Supported policies are:

- `Retry` — retry the same or configured stage;
- `AlternateOutcome` — continue on another stage;
- `DelayedSecondChance` — temporarily lock the mission until authoritative world time advances;
- `FailedBranch` — terminate this mission safely while unlocking a recovery/alternate mission.

Failure event IDs are recorded before the failure policy is applied, so replaying the same failure cannot increment the failure count twice. One failed parcel therefore does not need to destroy the campaign graph.

## Graph safety

`validateMissionGraph(...)` rejects:

- duplicate mission IDs;
- duplicate stage or objective IDs;
- unknown start stages;
- unknown stage links;
- invalid choice branches;
- invalid delivery-reference shape;
- unknown prerequisite/unlock mission IDs;
- invalid delays;
- unmarked stage cycles;
- unmarked mission dependency/unlock cycles.

Cycles are permitted only on an edge explicitly marked `allowCycle`, intended for designed retry/repeat structures rather than accidental infinite loops. A `missionCompleted` prerequisite is oriented causally from prerequisite to dependent mission, so an authored A -> B chain is not mistaken for a cycle when A also explicitly unlocks B.

## Persistence boundary

`MissionRuntimeState` is a pure JSON-safe aggregate. It contains mission progress, choices, processed event IDs, delay positions, completion receipts and emitted consequence-intent IDs. It does **not** contain order objects, parcel objects, inventory, balances, capability aggregates or world state.

`serializeMissionRuntimeState(...)`, `sanitizeMissionRuntimeState(...)` and `restoreMissionRuntimeState(...)` provide a tested persistence boundary. Active chains round-trip without losing stage, branch, exactly-once receipts or consequence identities; malformed payloads repair safely.

This PR deliberately does not modify legacy browser Save v2 or PostgreSQL. World Instance B2 owns durable authority and is concurrently active. When the canonical World Instance persistence shape is ready, this payload can be attached as one mission aggregate instead of introducing a competing save/database model.

## Agent 8 narrative coordination

Before finalization, Agent 9 inspected Agent 8 branch `agent/narrative-story-bible` and open PR #557, including `STORY_BIBLE.md` and `CAMPAIGN_STRUCTURE.md`.

That narrative work establishes the campaign spine `THE ROUTES WE LEAVE BEHIND`, Northstar Parcel Logistics as the opening employer, Ana Stoica as dispatcher/mentor, Radu Marin as coworker, Mirela Stan as the first recurring merchant, Petru Neagu as the early household contrast, and the first delivery beat `One Small Thing`.

The mission runtime is compatible with those beats:

- the Northstar/Ana opening is an authored Employer/Campaign mission;
- `One Small Thing` references an authoritative order, parcel/custody state and existing `DeliveryMission`;
- Mirela/Petru memory is represented through external relationship/history consequence intents rather than copied ledgers;
- Radu/Work Capacity pressure is gated by authoritative player-economy/capability facts;
- first pay remains an external economic settlement, never quest money;
- later shortage/production beats can be systemic missions carrying a real Agent 7 `causeRef`.

PR #557 is still open and its design documents do not define stable runtime actor/entity IDs. Agent 9 therefore does not invent permanent technical IDs or dialogue in this PR. The structural blueprint stays replaceable until the narrative entity-ID/content layer is authoritative.

## Neutral first-hour Brăila blueprint

`buildNeutralBrailaFirstHourBlueprint(...)` proves the architecture needed for the first-hour experience without canonizing new character IDs or dialogue.

Bindings are supplied for the dispatcher actor/location, recurring local actor/location, existing first `DeliveryMission`, and the external economic settlement reference.

The placeholder flow demonstrates:

1. meet dispatcher / understand the situation;
2. perform a basic existing logistics job;
3. meet a recurring local contact;
4. encounter a complication;
5. make a meaningful choice;
6. experience one of two consequence branches;
7. return/report;
8. unlock a delayed next opportunity.

The blueprint is deliberately data-bound so Agent 8's final authored first-hour content can replace labels/actors/choices without replacing the mission engine.

## UI boundary

No quest journal, giant debug panel or world-marker layer is added here. Agent 10 owns narrative presentation. The existing smartphone remains unchanged in this PR.

A later UI should project the authoritative mission runtime just as `PlayerSmartphone` currently projects authoritative delivery/economy state; presentation must not own mission truth.

## Ready now

After this slice, the project has architecture for:

- one engine for authored and systemic missions;
- deterministic mission stages and choices;
- mission chains and delayed unlocks;
- recoverable failure;
- external capability/equipment/time/order/contract facts;
- existing `DeliveryMission` integrity checks;
- exactly-once completion and consequence intents;
- JSON-safe mission persistence payloads;
- a replaceable first-hour Brăila structural blueprint.

## Still depends on parallel agents

- **Agent 3 / #436:** adapter from mission work/completion to Personal Money, Work Capacity and authoritative wage/settlement events.
- **Agent 6 / #437:** richer activity/capability eligibility adapter and capability-opportunity consumption.
- **Agent 7 / #419:** adapter that materializes real systemic missions from supply/demand opportunities and producer logistics contracts.
- **Agent 8 / #552 / PR #557:** merge/stabilization of story bible and campaign content plus stable narrative entity IDs for authored runtime binding.
- **Agent 10:** player-facing mission/narrative presentation, notifications and smartphone/world UX.
- **World Instance B2 / #421:** durable world-local persistence ownership for mission payloads and other authoritative aggregates.

## Tests

`game-web/tests/mission-framework.test.ts` and `game-web/tests/mission-framework-hardening.test.ts` cover:

- authored and systemic missions on one engine;
- prerequisite evaluation;
- deterministic stage transitions;
- branch selection;
- exactly-once completion;
- duplicate completion consequence safety;
- duplicate failure-event safety;
- retry, alternate outcome and delayed-second-chance failure;
- failed-branch campaign safety;
- existing `DeliveryMission` reference integrity;
- persistence round-trip and malformed-payload repair;
- prerequisite/unlock causal direction;
- invalid graph detection;
- stage and mission cycle validation;
- explicit cycle permission;
- neutral first-hour Brăila blueprint validation.
