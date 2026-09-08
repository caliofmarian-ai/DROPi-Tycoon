# Document Information

Document: MISSIONS.md
Project: DROPi Tycoon
Version: 2.0.0
Status: Canonical — Objectives, Guidance, Contracts and Milestones
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Objectives, Guidance, Contracts and Milestones

## Purpose

This document defines how DROPi Tycoon gives the player direction without creating a second artificial economy.

The project may use objectives, tutorials, milestones, achievements, contracts and event guidance, but these systems have different responsibilities.

**Guidance may surface a real opportunity. It may not invent the economic need, payer, cargo, inventory or money merely to create a mission.**

---

# 1. Design Philosophy

DROPi Tycoon is not built around a linear scripted campaign.

The player should understand what they can do next while retaining meaningful freedom over career, spending, learning, transport, company participation and world contribution.

Objectives exist to:

- teach;
- clarify;
- suggest;
- record;
- celebrate;
- surface real economic/world opportunities.

They do not override `02_Economy/ECONOMY.md`, `02_Economy/MARKET.md`, or `00_Project/LOGISTICS_DESIGN.md`.

---

# 2. Objective Categories

## Tutorial / Learning Objectives

Teach mechanics through real gameplay.

Early examples:

- report for the first starter shift;
- accept/understand a light work assignment;
- pick up and deliver a flyer/letter/small parcel;
- observe the recipient/business/world consequence;
- complete the first wage settlement;
- inspect Personal Money and basic living needs;
- make a first spending/saving decision;
- choose an authored next goal such as Bicycle, equipment or training.

Tutorials should avoid dumping the global economy into menus before the player needs it.

## Personal Milestones

Record meaningful history such as:

- first wage;
- first qualification;
- first personally owned Bicycle/vehicle;
- first recovery from financial distress;
- cities/countries visited;
- profession/career achievements.

## Company Milestones

Record organizational history such as:

- company formation;
- first employee;
- first profitable operating period;
- first warehouse;
- first productive facility relationship/acquisition;
- first inter-city/international operation;
- major infrastructure completion.

## Real Economic Contracts

Contracts are binding economic relationships, not arbitrary mission-reward containers.

They must originate from real modeled counterparties/requirements and specify relevant terms such as:

- buyer/payer/provider;
- goods/service/capacity;
- quantity;
- origin/destination;
- time/quality requirements;
- price/payment/settlement;
- penalties/default/failure consequences;
- qualification/infrastructure requirements.

Examples may include medicine supply, restaurant replenishment, industrial parts, supermarket distribution, construction inputs, airport cargo or public/emergency logistics.

## Event / Community Objectives

World events or community projects may surface contribution goals that use real world state.

Examples:

- supply a shortage;
- contribute materials to a bridge/project;
- support recovery after weather disruption;
- move harvest output;
- help clear waste/recycling backlog.

Progress must modify the same authoritative project/inventory/economic state.

## Achievements / Collections

Achievements record exceptional or interesting history.

They may support cosmetics, history, display or non-economic recognition.

They should not become unexplained economic faucets or mandatory progression gates unless a separate system explicitly defines and balances that effect.

---

# 3. Economic Origin Rule

An objective may point at an existing order/contract/need, but it must not create economic value independently.

Example:

```text
shop inventory low
-> procurement demand exists
-> supplier/logistics opportunity exists
-> objective may say "help restock the shop"
-> actual contract/order owns cargo and settlement
-> completed delivery changes inventory
-> objective records/guides the event
```

Not canonical:

```text
random mission appears
-> package has no economic source
-> waypoint touched
-> money appears from nowhere
```

---

# 4. Rewards and Recognition

Economic payment belongs to the underlying work/contract/transaction.

Objective-layer recognition may include:

- completion/history record;
- cosmetic unlock;
- collection entry;
- title/badge;
- tutorial progression;
- access to information/next learning step when legitimately tied to mastery;
- bounded non-economic appreciation.

Money, research capability, qualifications, blueprints or productive power must not be granted arbitrarily merely because an objective counter reached a number.

When an economic benefit exists, its source and causal rule must be explicit in the governing economy/progression system.

---

# 5. Dynamic Objective Generation

Procedural systems may dynamically choose what to **surface**, prioritize or explain based on:

- current personal state;
- available legitimate work;
- economic shortage/surplus;
- contracts;
- world events;
- company capability;
- qualifications;
- location;
- recovery needs;
- community projects.

Procedural objectives do not fabricate infinite jobs or demand.

---

# 6. Difficulty and Variety

Objective difficulty should follow capability and context rather than merely bigger counters.

Variety may come from:

- different cargo/handling requirements;
- route choices;
- customer/location types;
- time/weather/traffic;
- production/inventory consequences;
- profession requirements;
- competing opportunities;
- recovery situations;
- regional differences;
- company/community projects.

Delivery must not degrade into repeated identical waypoint touching.

---

# 7. Failure and Recovery

Objectives/contracts may fail.

The consequence belongs to the underlying system, for example:

- lost wage opportunity;
- contract penalty/default;
- reputation/trust impact;
- inventory shortage continuing;
- project delay;
- customer loss;
- wasted time/fuel/Work Capacity.

Failure should create a comprehensible next problem and a recovery path rather than an arbitrary game-over.

---

# 8. Long-Term Direction Without FOMO

The game may continuously surface self-authored and systemic goals, but it should not rely on:

- punitive daily-login streaks;
- fake countdowns;
- essential power available only in short real-world windows;
- notification spam;
- rewards designed primarily to force checking the app.

World events may be time-bounded, but missing one must not permanently cripple ordinary progression.

---

# 9. Player-Authored Goals

Not every goal should be generated by the game.

Important progression should naturally create goals such as:

- save for a Bicycle;
- qualify for a better profession;
- stabilize housing/finances;
- join or create a company;
- buy a vehicle;
- win a contract;
- expand a warehouse/fleet;
- secure an industrial supplier;
- enter a new locality/country;
- help complete infrastructure.

The UI should help the player remember/track these without pretending they are externally issued missions.

---

# 10. Prototype Boundary

Current Prototype orders and rewards may still use simplified mission-like generation and direct reward fields.

Those are legacy implementation truths until the order/economy migration occurs.

This canonical document does not silently mutate current Save/runtime behavior.

---

# Canonical Rule

**Objectives guide, teach, surface and record gameplay; they do not create a parallel reward economy. Economic jobs and contracts must originate from real modeled needs, counterparties, inventory/capacity and settlement, while milestones/achievements primarily preserve history, mastery, discovery and recognition.**

---

End of Document
