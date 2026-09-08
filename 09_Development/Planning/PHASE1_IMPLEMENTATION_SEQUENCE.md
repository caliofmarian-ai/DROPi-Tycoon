# Document Information

Document: PHASE1_IMPLEMENTATION_SEQUENCE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Planning — Canonical Execution Crosswalk
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Phase-1 Implementation Sequence

## Purpose

This document translates the owner-approved Phase-1 game architecture into executable dependency order.

It does **not** delete historical M/E/RBATCH identities. It supersedes the assumption that the old numerical/linear graph is the current execution order.

Authority:

`ROADMAP v4 -> this crosswalk -> issue/epic/batch execution.`

---

# 1. Execution Principle

A feature may begin only when it can obey the truth owned by its prerequisites.

Safe parallel work is encouraged where boundaries are explicit.

Examples:

- the Global Map may be rendered before global economy simulation is complete;
- it may not display invented trade/traffic as if authoritative;
- Personal Money may be introduced before full multiplayer networking;
- it may not trust the client once real shared settlement is activated;
- an industrial building may be visible before acquisition gameplay exists;
- ownership UI must not claim the player owns it until authoritative ownership exists.

---

# 2. Near-Term Causal Graph

```text
A0  Phase-1 canon approved/merged
|
+--> A1 Global geography/map data contract ---------> A2 Global Map UI (#418)
|                                                     |
|                                                     +--> A7 Smartphone/GPS hierarchy (#349)
|
+--> B1 WorldInstance + worldActor identity (#421) --+-----------------------+
|                                                                              |
+--> C1 Authoritative clock (#420) ------------------+--> C2 Human life ------+--> D1 Causal local economy
|                                                         Personal Money             inventory/demand/order
|                                                         living costs               cargo/custody/settlement
|                                                         Work Capacity              (#419 first slice)
|                                                         wages                         |
|                                                                                      +--> E1 Professions/equipment
|                                                                                      +--> E2 Company formation
|
+--> V1 Existing city/HQ/vehicle/gameplay foundation ---------------------------------+

D1 + E1 + E2 --> F1 Living city metabolism/competition/production
B1 + C1 + D1 + E2 --> G1 Trusted multiplayer authority/migration
F1 + A2 + G1 --> H1 Regional/national multimodal operational network
H1 --> I1 Global dynamic economy/world-history systems
```

The map is therefore the first major visible deliverable while identity/time/economy foundations progress in bounded parallel tracks.

---

# 3. Track A — Global Map / Navigation

## A1 — Geography and map data foundation

Already available in part through the Global/Country/Region/Locality domain contracts and canonical `04_World/MAP.md`.

Required before/with #418:

- all-country dataset provenance;
- versioned map dataset identifier;
- country entities using stable IDs;
- representative-node role model;
- no Romania-only assumptions;
- mobile-safe geometry simplification.

## A2 — Global Map visible slice

Anchor: #418.

Acceptance focus:

- world visible on Android;
- pan/zoom;
- country selection;
- country drill-down contract;
- locality/external-node projection hooks;
- no teleportation;
- no fabricated economic overlays.

## A3 — Country/region/locality drill-down

Expand map navigation after the global surface is stable.

## A4 — External economic nodes

Project farms/factories/ports/mines/etc. at the appropriate map layer from domain state.

## A5 — Economic/transport overlays

Only after the relevant simulation data exists:

- demand/supply;
- prices/inventory pressure;
- real cargo/trade corridors;
- infrastructure capacity;
- migration/events;
- construction/community contribution.

## A7 — Smartphone/GPS unification

Anchor: #349.

The phone reuses the same spatial hierarchy rather than owning a separate map truth.

---

# 4. Track B — World Identity and Persistent Worlds

Anchor: #421.

## B1 — Local/domain identity slice

- `worldInstanceId`;
- baseline/map dataset version;
- account identity vs world-local hero/economic actor;
- one hero/account/world invariant;
- explicit non-economic portable account state.

No production networking is required for this first slice.

## B2 — World-local persistence contract

Define how future trusted persistence owns:

- world time;
- money;
- inventories;
- companies;
- productive assets;
- infrastructure;
- market/economic state.

## B3 — Fresh-world isolation

Mature-world or prototype local economic power cannot enter a fresh World Instance.

---

# 5. Track C — Time and Human Economic Life

Anchor for time: #420.

## C1 — Authoritative local clock

- deterministic clock;
- time-of-day/day-night;
- operating day and shift boundaries;
- slow tick interfaces separate from render frame rate.

## C2 — Personal Money

Introduce a person-owned economic balance distinct from Company Money.

## C3 — Employee-first starting lifecycle

A fresh hero begins poor, walking and employed by a fictional incumbent logistics company.

Early work:

- flyers;
- letters/documents;
- light parcels;
- simple local support work where later useful.

## C4 — Wage settlement

Starter compensation is primarily shift/day wage, not one arbitrary payment per parcel.

The employer pays from legitimate Company Money/economic state and the person receives Personal Money.

## C5 — Personal metabolism / Work Capacity

Model at playable abstraction:

- food;
- water;
- rest;
- finite Work Capacity;
- basic living/housing costs;
- consequences of sustained inability to pay;
- recovery path.

Active-use costs are causal: a parked inactive vehicle does not consume driving fuel merely because time passed.

## C6 — Offline catch-up

Offline time settles legitimate persistent obligations/state changes without replaying every missed frame or generating infinite debt/reward.

---

# 6. Track D — Causal Local Economy and Logistics

Anchor: #419.

## D1 — Stock/inventory domain

Goods exist in inventories/locations with quantity and custody where relevant.

## D2 — Demand/procurement

Consumers, merchants, producers and institutions create requirements from actual consumption/production/service rules.

## D3 — Order/contract causality

Orders/contracts expose a real requirement with a real payer/counterparty.

## D4 — Cargo/custody

Pickup/transport/delivery moves real cargo identity or a deliberately summarized equivalent.

## D5 — Settlement

Completion settles the underlying contract/work relationship exactly once.

No second `mission reward` may create unexplained money.

## D6 — Visible consequence

At least the first causal flows should change something understandable in the world or inventory: stocked merchant, supplied facility, completed construction input, operating producer, fulfilled consumer demand, etc.

---

# 7. Track E — Professions, Equipment and Company Formation

## E1 — Profession/qualification model

Capabilities may require theory, practice, experience, equipment, instructor/facility and authorization.

## E2 — Equipment economics

Walking/bicycle/vehicle/tool choices trade off:

- personal energy;
- speed;
- cargo capacity;
- route access;
- purchase price;
- fuel/charge;
- maintenance;
- qualification.

## E3 — Smartphone training

Use #349 to expose portable theory/information without bypassing practical gates.

## E4 — Company formation

Only after person/Personal Money/economy foundations:

- entrepreneurship capability;
- startup funding;
- registration/authorization abstraction;
- primary Internal/Member relationship;
- company treasury;
- initial physical operating location.

## E5 — Physical organization

Coordinate existing #343/HQ systems with real company capability, staff and departments.

---

# 8. Track F — Living City and Production

Requires the basic human/economic loops from C/D.

## F1 — Population consumption cohorts

Aggregate inactive population where required for scale while conserving demand/economic truth.

## F2 — Shops/utilities/waste

Locality demand/supply must include basic services and reverse flows.

## F3 — Production nodes

Farms, factories and external economic nodes consume inputs and create output inventory.

## F4 — Competition

NPC and later human-compatible competitors operate under the same economy.

Design targets:

- urban: roughly <=5 meaningful last-mile competitors;
- rural/small locality: normally 1-2.

## F5 — Growth/decline

Jobs, housing, services, supply, infrastructure, migration and investment create visible locality evolution.

---

# 9. Track G — Multiplayer Trusted Authority

Multiplayer activation is not one final switch and not a second economy.

Migrate authoritative state family by family:

1. stable account/authentication;
2. World Instance membership/world actor;
3. Personal Money/Company Money settlement;
4. company membership/permissions;
5. inventory/cargo/order/contract state;
6. market settlement;
7. productive asset/infrastructure ownership;
8. world time/offline settlement where shared;
9. investment/governance where activated;
10. social communication/moderation.

Every shared write requires atomic/idempotent trusted settlement and conflict handling.

---

# 10. Track H/I — Regional to Global Operational Economy

Only after local economic truth survives the earlier tracks:

- multi-city/locality transitions;
- road/highway freight;
- rail;
- air cargo;
- river/sea logistics;
- warehouses/distribution hubs;
- multimodal custody;
- national/international trade;
- global strategic traffic overlays;
- infrastructure concessions/ownership;
- country development;
- migration/global events;
- parallel persistent World Instances.

#344 remains a key multimodal anchor.

---

# 11. Legacy Runtime Migration Rules

The following are preserved until explicit migration slices replace them:

- current starter company state;
- current Company Money wallet;
- current direct delivery reward code;
- current Save v2 local economic ownership;
- existing employee/fleet simulation;
- existing detailed city.

Preservation does not make these final product truth.

A migration PR must:

1. name the old behavior;
2. name the new authoritative behavior;
3. preserve recoverable player progress where valid;
4. prevent legacy local data from becoming fraudulent fresh-world multiplayer power;
5. include tests for both new and migrated states.

---

# 12. Historical M/E/RBATCH Crosswalk Rule

Historical milestone/epic/batch IDs remain repository history.

The old graph is classified as **LEGACY ORDER / TRACEABILITY**, not deleted.

Every future use of an old item must classify it as:

- KEEP;
- UPDATE;
- MERGE-ABSORB;
- CLOSE-HISTORICAL;
- NEW-CHILD-NEEDED.

The deciding question is not the number of the item; it is which current track prerequisite it satisfies.

---

# 13. Player-Facing Acceptance Rule

Do not interrupt the Project Owner for isolated cosmetic changes.

Meaningful owner checkpoints include examples such as:

- Global Map + country drill-down;
- complete employee-first first-hour experience;
- first causal merchant/consumer delivery loop;
- first qualification/vehicle progression slice;
- first visible city growth/production consequence;
- first multiplayer shared-world interaction.

Each visible checkpoint is tested on installed Android landscape.

---

# Canonical Planning Rule

**Build the world in causal layers, keep the Global Map as the first major visible expression, and never let a visible surface invent economic truth merely because its deeper simulation is not implemented yet.**

---

End of Document
