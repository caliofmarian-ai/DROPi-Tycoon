# Document Information

Document: ROADMAP.md
Project: DROPi Tycoon
Version: 4.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Development Roadmap

## Purpose

This document defines the canonical strategic development order for DROPi Tycoon after the owner-approved Phase-1 Game Architecture reconciliation.

DROPi Tycoon is a **mobile-first installed game**, beginning with Android.

The authoritative gameplay runtime remains Phaser in `game-web/`. The Expo/React Native shell in `game-mobile/` hosts that runtime for the installed product. Railway remains deployment/preview/backend infrastructure and a smoke-test surface.

The roadmap expands the existing game. It does not restart the project.

---

# Strategic Authority

Roadmap decisions follow:

`VISION -> UNIVERSE_DESIGN -> BUSINESS_DESIGN -> LOGISTICS_DESIGN -> approved cross-domain architecture baselines -> GDD -> domain canon -> ROADMAP -> planning -> implementation.`

The current cross-domain architecture baseline is:

- `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md`.

The historical M/E/RBATCH planning graph remains traceability evidence, but its old linear ordering does not control current execution.

---

# Product Spine

The long-term playable journey is:

**poor person -> productive worker -> qualified specialist -> economic independence -> organization/member/founder/investor choices -> competitive city participant -> productive/infrastructure owner -> regional/national operator -> global multimodal participant -> persistent legacy.**

The player is never required to become CEO. Career specialist, employee, entrepreneur, executive, investor, producer, infrastructure operator and mixed compatible roles remain valid long-term paths.

The world spine is:

**Global -> Country -> First-order Administrative Region -> Representative Locality / External Economic Node -> Detailed Local Scene.**

The economy spine is:

**Need/Consumption -> Demand/Procurement -> Order/Contract -> Inventory/Cargo/Labor -> Work/Production/Transport -> Settlement -> Consumption/Use -> Waste/Depletion -> New Need/Visible Consequence.**

The playability promise is:

**Your work leaves a mark.**

---

# Development Rules

1. Keep the game playable after every meaningful checkpoint.
2. Preserve compatible completed work; migrate incompatible prototype assumptions deliberately.
3. Build in causal dependency order, not issue-number order.
4. The first major visible priority is the Global Map / world-navigation backbone.
5. A visible surface may be built before every simulation behind it is complete, but it must not fabricate economic truth.
6. Establish world identity/time/personal-economic foundations early enough that later systems do not need a second economy.
7. Establish deterministic/local rules before contested multiplayer writes where practical.
8. Prepare trusted authority before shared money, cargo, ownership, contracts or markets become contested by real players.
9. Use real stock/flow causality; no unexplained money, goods, labor or cargo teleportation.
10. Visible gameplay changes require installed Android review at meaningful batch checkpoints, not after isolated icons/props.
11. Preserve Save compatibility or provide explicit migration/legacy treatment.
12. No speculative asset generation; reuse/deduplicate approved assets until a concrete runtime gap exists.
13. Company Money and Personal Money remain distinct ownership domains.
14. No blockchain/token/real-money system is activated by this roadmap.

---

# Foundation Already Preserved

The project already contains important working foundation, including:

- Phaser gameplay runtime;
- Android application shell;
- walkable detailed city;
- player movement/camera;
- delivery/order prototype lifecycle;
- current Company Money prototype settlement;
- reputation/reviews;
- employee management and productive employee/fleet simulation;
- vehicle ownership/selection;
- financial reporting;
- Save/Continue;
- physical HQ and Marketplace interiors;
- progressive HQ construction foundation;
- smartphone canon;
- shared-authority contracts/local adapter foundations;
- World Instance/domain contracts;
- global/country/region/locality/external-node domain model;
- approved visual direction and asset library;
- Phase-1 research archive and approved canonical reconciliation.

Existing runtime behavior such as starter-company ownership and direct delivery reward remains **legacy compatibility**, not future product truth. It is removed/reconciled through staged migrations rather than a destructive rewrite.

---

# Strategic Wave 0 — Phase-1 Canon and Research Closure

## Status

**COMPLETED — research PR #425, owner decision #434, canon PR #435.**

## Result

The game now has one approved architecture for:

- hero lifecycle;
- company lifecycle;
- professions/labor;
- stock-flow goods/money economy;
- city/country evolution;
- multiplayer society;
- time/offline settlement;
- World Instances;
- playability/motivation.

Research issues R1-R9 are historical evidence and are closed after canonical reconciliation.

---

# Strategic Wave 1 — Global World Map and Navigation Backbone

## Objective

Deliver the first major visible expression of the global game: a recognizable, touch-safe, layered world map covering all supported countries and drilling down toward the existing detailed city.

## Primary anchor

- #417 global-to-local hierarchy umbrella;
- #418 interactive all-country Global Map.

## Scope

- versioned low-resolution real-world geography dataset with provenance/license record;
- dedicated Phaser Global Map surface;
- touch pan/zoom and country selection;
- Global -> Country drill-down;
- country-neutral region/locality node contracts;
- representative capital/urban/rural nodes;
- external productive-node representation;
- same hierarchy for future smartphone GPS;
- World Instance/map-dataset identity in map state;
- map overlays as projections of available domain state;
- no fake traffic/economy overlays;
- no strategic teleportation of hero/cargo;
- Android landscape performance/readability.

## Parallel foundation permitted

World identity, time and economic foundations may be developed in parallel while the visual map is built. Their data progressively replaces placeholders/sparse summaries.

## Owner checkpoint

The Global Map + country drill-down is a meaningful Android visual checkpoint.

---

# Strategic Wave 2 — Human Economic Life + Authoritative Time

## Objective

Replace the conceptual assumption that the player is already a company with the actual playable human lifecycle.

## Scope

- account/world-actor boundary;
- one economic hero per World Instance;
- Personal Money foundation;
- poor pedestrian employee starting state;
- fictional incumbent logistics employer;
- shift/day wage settlement;
- food/water/basic living obligations;
- finite Work Capacity and recovery/rest;
- personal equipment/backpack capability;
- housing state and recoverable loss;
- personal insolvency/recovery ladder;
- authoritative world clock;
- day/night;
- operating-day/shift boundaries;
- deterministic offline/catch-up rules;
- Save migration that preserves legacy prototype history without injecting it into fresh multiplayer economies.

## Existing anchors

- #420 authoritative time/world evolution first slice;
- #421 World Instance architecture first slice;
- #348 player/company society umbrella.

## Dependency rule

A starter wage cannot be implemented as another reward faucet. It must be a company-to-person transfer tied to work/time under the economic ledger.

---

# Strategic Wave 3 — Causal Local Goods, Orders and Delivery Work

## Objective

Convert the local courier prototype from arbitrary order rewards into the first real stock-flow logistics loop while keeping the game fun and readable.

## Scope

- inventory/stock domain;
- consumption/procurement demand;
- payer/counterparty identity;
- cargo identity/custody;
- order/contract creation from real need;
- employer assignment/shift work for starter jobs;
- flyers/letters/light parcels as early cargo;
- handling/capacity eligibility;
- one deterministic producer/merchant/consumer flow;
- company revenue settlement from customers/contracts;
- wage settlement to employee;
- waste/reverse-logistics hooks where relevant;
- visible consequence after meaningful delivery;
- migrate current direct `delivery -> Company Money reward` semantics without breaking completed prototype work.

## Existing anchor

- #419 production/contracts/supply-demand umbrella begins with a bounded first flow.

## Playability rule

Orders must still be easy to understand. Economic causality belongs beneath the experience; it must not turn every delivery into accounting paperwork.

---

# Strategic Wave 4 — Professions, Equipment and Career Freedom

## Objective

Make progression earned through knowledge, equipment, authorization, experience and access rather than one company-level ladder.

## Scope

- profession/qualification data model;
- theory + practical training;
- smartphone training surfaces;
- walking courier mastery;
- bicycle purchase/use/maintenance;
- scooter/motorcycle;
- car/van driving and cargo handling;
- warehouse/dispatch/maintenance roles;
- employer-sponsored training where useful;
- specialist scarcity and labor market;
- compatible multiple jobs/contracts;
- career switching;
- equipment and vehicle operating economics;
- profitability trade-offs among human energy, capacity, speed, fuel, maintenance and access.

## Coordination

- #349 smartphone foundation;
- #343/HQ department progression where training/workplaces require physical company capability.

---

# Strategic Wave 5 — Legitimate Company Formation and Physical Organization

## Objective

Allow a person to become an entrepreneur only after the human/economic foundations exist, while retaining employee/specialist careers as first-class alternatives.

## Scope

- entrepreneurship qualification;
- legitimate personal startup capital/funding path;
- company registration/authorization gameplay abstraction;
- one primary Internal/Member company relationship;
- no shell-company abuse;
- company treasury/Company Money creation from legitimate formation/settlement;
- physical HQ foundation for player-created company;
- departments, Fleet Bay, Operations & Dispatch, workshop and staging/sorting;
- hiring NPC/real-player-compatible workforce;
- payroll;
- company insolvency/restructuring/recovery;
- initial local competitor capacity rules.

## Compatibility

The current starter company becomes migration/legacy history rather than evidence that every new hero begins as a founder.

---

# Strategic Wave 6 — Living City Metabolism, Competition and Production

## Objective

Make the locality visibly consume, produce, employ, build, pollute/recycle and react to players/companies.

## Scope

- households/population cohorts;
- food/water/energy/basic-goods consumption;
- shops/merchant inventories;
- utilities and waste flows;
- housing/jobs/specialist demand;
- local price pressure;
- multiple NPC/human-compatible companies;
- customer acquisition/retention;
- urban ~5 and rural 1-2 meaningful delivery-competitor targets;
- farms/factories/external productive nodes;
- production recipes;
- recurring contracts;
- visible facility operation/closure;
- construction/community projects;
- migration/tourism;
- visible urban/rural growth and decline.

## Existing anchors

- #419 production/trade;
- #420 slow evolution;
- #406/#317 visual/playability quality gates where applicable.

---

# Strategic Wave 7 — Company Value, Productive Ownership and Infrastructure

## Objective

Let mature players/companies move from logistics contractor to investor/operator/owner while preserving fair world access.

## Scope

- company valuation;
- external investments;
- internal/member vs external share rules;
- dividends/governance;
- debt/credit only after stock-flow stability;
- farms/factories/industrial asset purchase or privatization;
- lease/concession models;
- warehouses/distribution centers;
- roads/rail/ports/airports/energy/utilities under mixed ownership;
- service/access revenue;
- anti-monopoly/essential-access protections;
- mergers/acquisitions/subsidiaries;
- founder/executive/investor separation;
- durable company history/legacy.

---

# Strategic Wave 8 — Server-Authoritative Multiplayer Society

## Objective

Activate real human coexistence on top of the same economy rather than create a second online game.

## Trusted authority foundation

- account/authentication/session;
- World Instance membership;
- server-authoritative Personal/Company Money;
- inventory/cargo custody;
- contracts/orders;
- company membership/roles;
- productive asset and infrastructure ownership;
- market settlement;
- world time/offline settlement;
- atomic/idempotent transactions;
- concurrency/revisions;
- reconnect/recovery;
- anti-cheat/anti-duplication;
- moderation/reporting for communication.

## Social/business activation

- real-player employment;
- company membership;
- compatible specialist roles;
- cooperative work;
- contract bidding;
- customer competition;
- investments/governance when safe;
- company/local/world communication;
- asynchronous contribution and community infrastructure projects.

## Low-population rule

NPC workers/employers/consumers/market counterparties remain bounded fallback participants using the same costs/stocks/flows.

---

# Strategic Wave 9 — Regional, National and International Multimodal Logistics

## Objective

Make the map hierarchy operational through physical cargo/travel networks beyond the first locality.

## Scope

- multiple detailed localities;
- national/regional gateways;
- road/highway freight;
- rail corridors/terminals;
- airports/air cargo;
- river/sea ports and ships;
- regional warehouses;
- DronePort networks;
- multi-leg custody;
- national/regional trade;
- border/customs gameplay abstractions;
- travel with time/cost/capacity rather than teleportation;
- strategic traffic/economic overlays based on real simulation state.

## Existing anchor

- #344 multimodal logistics/custody foundations.

---

# Strategic Wave 10 — Dynamic Countries, Global Economy and World History

## Objective

Allow World Instances to diverge into unique persistent histories.

## Scope

- country production/consumption balance;
- strategic import/export;
- national currencies/FX if activated;
- public budgets/tax abstractions if useful;
- infrastructure investment;
- specialist migration;
- national prosperity/decline;
- settlement creation/abandonment;
- global commodity pressure;
- mass migration events;
- macro conflict/state change as economic/logistics simulation;
- durable historical records;
- mature global corporations and automation;
- parallel World Instance launches without deleting older worlds.

---

# Strategic Wave 11 — Frontier / Planetary Expansion and Optional Ecosystem Review

Earth-scale systems must be mature before frontier/off-world logistics becomes an implementation priority.

Possible later systems include orbital/planetary logistics, frontier settlements and new infrastructure/professions.

Any DROPi ecosystem token/asset remains a separate future review requiring its own canon, game-balance, security, economic, legal/regulatory and owner-approval process. It cannot replace normal gameplay money or become pay-to-win.

---

# Cross-Wave UX and Visual Reconciliation

The selected visual direction applies to every player-facing wave:

**DROPi Tycoon Visual Style — Stylized 3D Pre-Rendered Mobile World.**

The full UX should converge toward:

- world-embodied interaction;
- smartphone as portable interface;
- layered global-to-local map/GPS;
- physical company/industry/infrastructure surfaces where location matters;
- progressive information density by zoom and player capability;
- clear economic feedback without spreadsheet overload;
- visible changes caused by work/investment/world events.

Existing approved assets are reused first. New art is generated only when a concrete feature proves the library insufficient.

---

# Session and Playability Gate

Player-facing implementation must support meaningful play at several session lengths where appropriate:

- quick check/decision;
- short route/task;
- focused work shift;
- longer management/exploration/building session.

Every meaningful player-facing slice should be evaluated for:

- FUN;
- CHOICE;
- CLARITY;
- VISIBLE CONSEQUENCE;
- ECONOMIC CAUSALITY;
- VARIETY;
- RECOVERY;
- ASYNC compatibility where relevant;
- ANDROID usability/performance.

The economy is deep underneath; the player experience must remain understandable and satisfying above it.

---

# Historical Planning IDs

The repository retains historical milestones, epics and RBATCH identifiers for traceability.

They are not deleted and do not lose historical evidence.

The current execution graph is maintained in:

- `09_Development/Planning/PHASE1_IMPLEMENTATION_SEQUENCE.md`;
- `09_Development/Planning/DEPENDENCY_GRAPH.md`.

Historical items are classified as KEEP / UPDATE / MERGE-ABSORB / CLOSE-HISTORICAL / NEW-CHILD-NEEDED and mapped to the current strategic waves.

---

# Immediate Execution Order

The current near-term execution order is:

1. **Global Map visible backbone (#418)** — real geography, all-country architecture, pan/zoom/select/drill-down, no fake economy.
2. **World Instance + account/world-actor foundation (#421 first slice)** — can proceed in parallel where it does not delay #418.
3. **Authoritative time first slice (#420)** — clock/day-night/operating-day boundaries.
4. **Personal economic lifecycle** — Personal Money, employee-first start, wages, food/water/living costs, Work Capacity and recovery.
5. **Causal local order/economy migration (#419 first slice)** — inventory/demand/payer/cargo/custody/settlement.
6. **Smartphone/GPS reconciliation (#349)** with the same global-to-local map hierarchy.
7. **Professions/qualifications and equipment economics.**
8. **Legitimate company formation + physical organization.**
9. **Living city production/competition/metabolism.**
10. **Server-authoritative multiplayer shared state**, then regional/global operational expansion.

Steps 1-5 are dependency-aware tracks, not a prohibition on safe parallel work. The rule is that a later track may not invent truth that belongs to an unfinished prerequisite.

---

# Quality and Verification

Every implementation slice must preserve:

- green tests/CI;
- build health;
- Save/migration integrity;
- Android touch/input safety;
- mobile performance;
- authoritative economic conservation;
- cargo/ownership/settlement integrity;
- real DROPi separation.

Meaningful visible batches require installed Android owner review. Documentation/planning-only PRs require CI/canonical consistency but no APK checkpoint.

---

# Success Metric

Development is successful when one coherent system supports both the small and the global experience:

**a poor pedestrian delivering a letter and a mature multinational moving industrial cargo across continents both participate in the same understandable economy and persistent world.**

The player should be able to look at their character, property, company, locality, infrastructure or world history and understand:

**I helped make this happen.**

---

End of Document
