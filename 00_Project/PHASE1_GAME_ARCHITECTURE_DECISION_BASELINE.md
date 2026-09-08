# Document Information

Document: PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md
Project: DROPi Tycoon
Version: 1.0.0
Status: **Canonical — Owner-Approved Architecture Decision Baseline**
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08
Approval: Owner-approved in Issue #434; directive recorded in `09_Development/Owner_Directives/2026-09-08_MASTER_OWNER_DIRECTIVE_005_PHASE1_GAME_ARCHITECTURE_APPROVAL.md`
Research archive: PR #425

---

# Purpose

This document is the canonical decision baseline produced from Phase-1 game-logic research and owner approval.

It does not replace the strategic authority chain:

`VISION -> UNIVERSE_DESIGN -> BUSINESS_DESIGN -> LOGISTICS_DESIGN -> GDD -> domain specializations`.

Instead, it resolves previously open architecture decisions and instructs those canonical documents how to reconcile. Where an unreconciled lower-level canonical document still contradicts an approved rule below, this baseline controls until that document is updated.

Current runtime behavior may still differ. Such runtime behavior is legacy/prototype truth until a dedicated implementation/migration PR changes it.

---

# 1. Core Player Lifecycle

The canonical human starting state is:

`person -> poor pedestrian employee -> light local work -> wages -> personal survival/stability -> equipment/education -> greater capability -> career/company choices -> ownership/organization -> regional/global participation`.

The player does **not** canonically begin as a mature company owner merely because the current prototype contains a starter company object.

The starting incumbent delivery employer is fictional by default unless real-brand permission is separately authorized.

Early compensation is primarily wage/shift based. The employer earns revenue from economically valid work and pays the worker from company funds. Arbitrary per-drop money creation is a prototype behavior to be retired through staged migration.

---

# 2. One Person, Distinct Economic Domains

One economic hero exists per account per World Instance.

The same person can change:

- employer;
- profession;
- company membership;
- company control;
- investment portfolio;
- location;
- specialization.

Economic alts are not the progression model.

`Personal Money` belongs to the person. `Company Money` belongs to a company. They are ownership/accounting domains and must never masquerade as one another.

---

# 3. World-Local Economic Power

Fresh World Instances isolate economic power.

May follow the account when non-economic:

- settings;
- cosmetics;
- account history/achievements;
- tutorial familiarity;
- other explicitly non-economic identity data.

World-local by default:

- money;
- productive qualifications/capability;
- inventory;
- vehicles/equipment;
- property;
- companies;
- shares;
- reputation;
- contracts;
- infrastructure control;
- productive assets.

Prototype/local saves may be preserved historically but cannot silently inject economic power into a fresh shared world.

---

# 4. Human Needs, Work Capacity and Recovery

The person participates in the economy as a consumer as well as a worker/owner.

Canonical personal obligations/capability include:

- food;
- water;
- housing/living costs;
- finite Work Capacity;
- rest/recovery;
- equipment and transport costs when personally owned/used;
- education/training costs where applicable.

Exact rates are balancing data.

Inactivity/offline time may continue legitimate fixed obligations and basic living consumption. Active-use costs do not accrue when the activity is not occurring.

Housing may be lost. Bankruptcy and severe poverty are valid states, but they must remain recoverable. Identity/history and valid earned capability are not deleted by normal bankruptcy.

---

# 5. Universal Stock-Flow Economy

The final economic model is broader than a courier-company reward loop.

Canonical causal chain:

`need/consumption/production requirement -> demand/procurement -> order/contract -> inventory/cargo custody -> work/transport/production -> settlement -> consumption/use/output -> waste/next demand -> visible economic/world consequence`.

Money should primarily move between actors through real exchanges rather than appear because a task marker was touched.

Actors can include:

- people/households;
- companies;
- merchants;
- farms;
- factories;
- warehouses;
- utilities;
- institutions/public entities;
- infrastructure operators;
- NPC and human economic actors.

Stocks/flows may include:

- money;
- goods;
- raw materials;
- food/water;
- energy/fuel;
- construction materials;
- industrial inputs/outputs;
- inventory;
- waste/recyclables;
- labor capacity;
- transport capacity.

---

# 6. Delivery and Logistics Causality

A meaningful delivery should normally exist because somebody or something needs the cargo.

Examples:

- households/shops need food;
- pharmacies/clinics need medical stock;
- factories need parts/materials/energy;
- farms need seeds/fertilizer/equipment;
- construction requires staged materials;
- warehouses rebalance inventory;
- waste must move through reverse logistics;
- regional/international trade moves real supply between markets.

Cargo requirements may gate work by mass, volume, handling, temperature, hazard, vehicle, qualification, authorization and infrastructure.

Successful delivery should change the same authoritative stock/custody/economic state that drives visible feedback.

---

# 7. Employment and Corporate Participation

A person may have compatible jobs/contracts when schedules, permissions and conflict rules allow them.

A person has one primary Internal/Member company relationship at a time.

Operational membership, employment, executive authority and external investment are distinct.

Broader ownership/control grows through legitimate shares, acquisitions and subsidiaries; unlimited shell companies are not a valid way to manufacture competitors or bypass territorial capacity.

NPC and human workers use compatible labor/economic semantics.

---

# 8. Company Lifecycle

Companies are real organizations with:

- cash flow;
- labor;
- assets;
- inventory;
- facilities;
- contracts/customers;
- technology;
- productive/transport capacity;
- liabilities/obligations;
- reputation/history;
- ownership/governance where enabled.

Companies may grow, restructure, lose customers, become insolvent, sell assets, merge, be acquired, or close.

A mature logistics/business organization may vertically integrate by contracting with, investing in or acquiring eligible farms/factories/industrial assets through governed transactions.

---

# 9. Infrastructure Ownership and Access

Essential infrastructure may use public, private, concession or mixed ownership.

Private operation can create economic advantage and revenue, but essential transport corridors/utilities require fair-access/counterplay safeguards so a single actor cannot permanently softlock a locality/country.

Global travel is infrastructure-backed. Strategic map selection does not grant free economic teleportation.

---

# 10. Persistent Global World

DROPi Tycoon is one coherent global hierarchy per World Instance:

`Global -> Country -> Region -> Representative Locality / External Economic Node -> Detailed Scene`.

All countries can be strategically represented without simulating every settlement at high detail.

Multi-resolution simulation is canonical:

- active scene: detailed/high frequency;
- active routes/hubs: operational frequency;
- local production/inventory/markets: economic ticks;
- regional/country/global flows: strategic ticks;
- demographics/structural evolution: slow cycles;
- inactive scopes: deterministic summarized catch-up.

Real players and nearby important NPCs may be modeled individually; large populations use cohorts/stocks/flows while conserving economic truth.

---

# 11. Time and Offline Settlement

World time is authoritative and supports:

- local day/night;
- operating days/shifts;
- market/week cycles;
- seasons;
- slow year/structural cycles.

Offline settlement is causal and idempotent, not generic magical offline income.

No starter wage is paid without work. No active-use fuel is charged without use. Legitimate fixed obligations may continue.

---

# 12. Population, Cities and Countries

People, firms, cities and countries consume resources and respond to shortages/surpluses, jobs, housing, services, infrastructure and trade.

Localities can grow, decline and recover visibly.

Rural and urban economies remain distinct.

Market capacity should produce believable competitor density; roughly five meaningful last-mile competitors is an urban target and one to two is a rural target, but economics/capacity should determine outcomes rather than a simplistic permanent count.

Countries may evolve through production, trade, infrastructure, demographics, specialists and events.

Macro conflict/state transitions are fictional world/economic simulation, not tactical combat, and use stable historical identifiers.

---

# 13. Currency and Public Finance Staging

Architecture should support national game currencies as a later staged system.

Until multi-currency settlement is implemented, current balances may continue using a common gameplay denomination while remaining ownership-separated.

Future banking/credit/debt requires explicit interest, collateral and default rules.

Future taxation/public budgets should be simplified and exist to close public-service/infrastructure economic loops, not to simulate paperwork.

---

# 14. Low-Population and NPC Continuity

A World Instance remains playable when human population is low.

Bounded NPC/simulated employers, workers, consumers and counterparties may keep essential loops functioning, but they obey:

- real inventories;
- real costs;
- production/consumption rules;
- market constraints;
- authority/settlement rules.

They cannot provide infinite free supply, demand or money.

---

# 15. Playability Rule

The core experience promise is:

> **Your work leaves a mark.**

Meaningful sessions should create one or more visible forms of progress:

1. **I changed myself** — capability, equipment, vehicle, housing, finances, reputation, career.
2. **I changed something I own/belong to** — company, HQ, fleet, warehouse, farm/factory, network, team.
3. **I changed the world** — customer/business supplied, project advanced, district recovered, infrastructure opened, industry restarted, city/network changed.

Every player-facing implementation slice must be evaluated against `09_Development/Research/GAME_LOGIC/R9_PLAYABILITY_INTEGRATION_GATE.md` until that gate is later promoted or replaced by canonical implementation policy.

Retention should come from authorship, competence, ownership, discovery and contribution — not punitive streaks, fake countdowns, pay-to-win or manipulative FOMO.

---

# 16. Runtime Migration Boundary

Current runtime systems remain valid implementation history until explicitly migrated.

Examples of legacy/prototype truth that may temporarily remain:

- starter company object;
- per-delivery `Company Money` reward;
- simplified/abstract demand;
- missing Personal Money/metabolism/Work Capacity;
- local-only market state.

Canonical reconciliation alone does not change save schemas or production runtime behavior.

Every runtime migration must define:

- old-state interpretation;
- new-state interpretation;
- compatibility/migration;
- authoritative ownership;
- idempotency where settlement is involved;
- tests;
- Android owner-facing verification when visible/player-facing.

---

# 17. Balancing Boundary

The following are not permanently fixed here:

- wages;
- prices;
- food/water quantities;
- Work Capacity numbers;
- fuel/energy consumption constants;
- rent/cost-of-living values;
- travel durations;
- training durations;
- tax rates;
- exchange rates;
- exact competition thresholds;
- world-time speed.

They should be data-driven and tested through simulation/playtesting.

---

# Canonical Rule

**DROPi Tycoon is an embodied persistent global economic/logistics society in which a person starts with little, works and consumes real resources, earns capability rather than only numbers, can join/build/control productive organizations, and changes the world through causal flows of labor, goods, money, infrastructure and time.**

---

End of Document
