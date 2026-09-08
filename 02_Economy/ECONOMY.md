# Document Information

Document: ECONOMY.md
Project: DROPi Tycoon
Version: 2.0.0
Status: Canonical — Economy Authority
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Economy System

## Purpose

This document defines the fundamental economic simulation of DROPi Tycoon.

The economy is not only the financial life of a courier company. It is the shared stock-flow system through which people, companies, merchants, farms, factories, utilities, institutions, infrastructure operators, and world populations consume resources, produce outputs, perform work, move goods, settle money, create waste, invest, fail, and recover.

This document specializes `00_Project/BUSINESS_DESIGN.md`, `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md`, Game Design, and World Design.

---

# 1. Economy Philosophy

The economy follows four principles:

1. **Resources have sources and sinks.**
2. **Money changes ownership through explicit transactions.**
3. **Demand is caused by real needs/requirements, not arbitrary task generation.**
4. **Economic actions should create understandable consequences in the world.**

Growth requires intelligent resource management, but money is not the final objective and is not the only scarce resource.

---

# 2. Universal Causal Loop

The canonical economic direction is:

**Need / Consumption / Production Requirement**

-> **Demand / Procurement**

-> **Order / Contract / Purchase Request**

-> **Inventory / Cargo / Labor Commitment**

-> **Production / Work / Transport / Service**

-> **Settlement**

-> **Consumption / Use / Output**

-> **Waste / Depletion / New Requirement**

-> **Visible Economic / World Consequence**

A courier delivery is one part of this economy, not the economy itself.

---

# 3. Economic Actors

Economic actors may include:

- human players/persons;
- NPC persons/households or population cohorts;
- employers;
- delivery/logistics companies;
- merchants/shops;
- farms;
- factories/processing facilities;
- warehouses/distribution centers;
- energy/fuel providers;
- waste/recycling operators;
- transport/infrastructure operators;
- banks/credit institutions when later implemented;
- civic/public entities when later implemented;
- other productive/service organizations added through canon.

Actors may be simulated individually or in aggregated cohorts depending on world scale, but aggregation must conserve equivalent economic truth.

---

# 4. Stock and Flow Model

A **stock** is a quantity owned/held at a point in time.

Examples:

- Personal Money;
- Company Money;
- shop inventory;
- food/water;
- raw materials;
- fuel/energy reserves;
- parts;
- medicines;
- construction materials;
- finished products;
- warehouse inventory;
- waste/recyclables;
- productive assets;
- labor/work capacity where represented as available capacity rather than a tradable inventory.

A **flow** changes stocks over time.

Examples:

- wages;
- purchases/sales;
- deliveries/transfers;
- production input consumption;
- production output creation;
- household consumption;
- vehicle fuel/charge use;
- maintenance input consumption;
- rent/fees;
- dividends;
- waste generation/collection/recycling;
- investment/acquisition payments.

Every important flow should have explicit source, destination, cause, quantity, and timing/settlement semantics.

---

# 5. Money Ownership Domains

`Personal Money` and `Company Money` are distinct ownership/accounting domains.

## Personal Money

Owned by a person.

Used for governed personal purposes such as:

- food/water/living costs;
- housing/rent;
- personal equipment;
- personal transport/assets;
- personal training/education;
- external investment/share purchases;
- other explicitly personal expenses.

## Company Money

Owned by a company.

Used for governed company purposes such as:

- wages;
- inventory/procurement;
- vehicles/equipment;
- fuel/energy;
- maintenance/repairs;
- facilities/infrastructure;
- operating costs;
- training where employer-funded;
- research;
- expansion/acquisition;
- authorized investment.

One balance must never masquerade as the other.

The ownership domain is separate from currency denomination. Future national currencies may give Personal Money and Company Money balances a currency dimension without erasing ownership separation.

See `02_Economy/PERSONAL_FINANCE.md`.

---

# 6. Money Conservation and Authorized Creation

Normal economic transactions move money between actors.

Examples:

- customer -> merchant;
- customer/business -> logistics company;
- company -> employee;
- company -> supplier;
- person -> landlord/service provider;
- investor -> company treasury;
- company -> shareholder dividend;
- buyer -> seller during asset/company acquisition.

Money must not appear merely because a waypoint was touched.

Any true money faucet/source must be explicit and governed, for example a versioned starting-world allocation, bounded public transfer, tutorial grant, or later monetary/public system.

Any money sink must also be explicit when money leaves circulation rather than moving to another actor.

Duplicate settlement is prohibited.

---

# 7. Personal Consumption and Work Capacity

The human player is an economic consumer as well as a producer/worker.

Canonical personal pressures include:

- food;
- water;
- housing/living costs;
- finite Work Capacity;
- rest/recovery;
- personal equipment/transport costs when applicable.

Food/water/rest can influence the ability to sustain work, but the game should avoid tedious constant survival clicking.

Exact rates/thresholds are balancing data.

A person may become insolvent or lose housing if legitimate obligations cannot be met. Bankruptcy must remain severe but recoverable.

---

# 8. Labor Economy

Labor is a productive economic input.

Employment should define, when relevant:

- employer;
- worker;
- role/profession;
- qualifications/authorizations;
- schedule/shift/availability;
- wage/salary basis;
- work performed;
- settlement;
- costs/benefits where modeled.

Starter wages require actual work. Offline absence does not create salary automatically.

NPC and human workers use compatible economic semantics.

Employee existence alone must not create unexplained money.

See `02_Economy/EMPLOYEES.md`.

---

# 9. Demand and Procurement

Demand should arise from real state.

Examples:

- household food/water consumption;
- shop inventory depletion;
- pharmacy/clinic medical stock requirements;
- restaurant inputs;
- factory raw-material/part/energy requirements;
- farm seed/fertilizer/equipment requirements;
- warehouse rebalancing;
- construction project materials;
- vehicle/facility fuel/energy;
- maintenance parts;
- waste collection/recycling;
- regional shortages/surpluses;
- infrastructure projects;
- emergency/disruption recovery.

Demand may be aggregated for performance, but resulting procurement/orders/contracts must remain tied to real modeled quantities/capacity.

Infinite random orders with no payer, inventory, need, or consequence are not final canon.

---

# 10. Production

Production converts governed inputs into outputs using capacity, people, equipment, infrastructure, time, and energy where appropriate.

A production facility may require:

- input inventory;
- qualified workforce;
- equipment/machinery;
- energy/water/utilities;
- maintenance state;
- storage capacity;
- transport connectivity;
- authorization where modeled.

Production creates outputs and may create waste/by-products.

A factory/farm should not generate passive money directly. It creates goods/capability that become valuable through consumption, sale, contracts, and logistics.

---

# 11. Inventory, Cargo and Custody

Inventory represents economically owned/held goods.

Cargo is inventory committed to physical movement/custody.

Transfers must preserve:

- item/product identity/category;
- quantity;
- owner/counterparties;
- custody;
- origin/destination;
- transport/storage state;
- handling/temperature/hazard requirements where relevant;
- settlement relation.

See `00_Project/LOGISTICS_DESIGN.md`.

---

# 12. Revenue

Company revenue arises from legitimate economic activity such as:

- delivery/logistics services paid by a valid customer/contract;
- sale of goods/products;
- warehousing/handling services;
- maintenance/technical services;
- infrastructure/service fees where authorized;
- production contracts;
- other canonically defined services.

Revenue depends on real activity, price, capacity, demand, service quality, contracts, and settlement.

The current runtime's direct per-delivery Company Money reward is legacy/prototype implementation and is not the final revenue model.

---

# 13. Expenses and Operating Costs

Economic activity creates costs.

## Labor Costs

- wages/salaries;
- training where employer-funded;
- benefits where later modeled.

## Vehicle/Equipment Costs

- purchase/rental;
- fuel/energy;
- maintenance;
- repair;
- depreciation/replacement where later useful.

## Inventory/Production Costs

- raw materials;
- product procurement;
- packaging;
- energy/utilities;
- maintenance inputs;
- storage/handling.

## Infrastructure/Facility Costs

- construction/purchase/lease;
- utilities;
- maintenance;
- staffing;
- access/concession fees where modeled.

## Personal Costs

- food/water;
- housing/living costs;
- personal transport/equipment;
- personal education/training.

Costs should either transfer value to another actor or use an explicitly governed sink/resource depletion rule.

---

# 14. Profit, Loss and Cash Flow

For a company:

**Operating result = Revenue - Expenses**

But profitability alone does not guarantee liquidity.

Companies must manage cash flow, inventory timing, wage obligations, maintenance, working capital, investment, debt when later enabled, and reserves.

People likewise manage Personal Money against wages/income and living/personal expenses.

---

# 15. Prices and Markets

Prices should respond to a governed combination of:

- supply/available inventory;
- demand/consumption;
- production cost;
- transport/logistics cost;
- scarcity;
- service quality;
- competition;
- contract terms;
- regional conditions;
- events/disruption;
- later currency/inflation effects.

A price formula is balancing/market specialization, not fixed here.

Markets must avoid trivial infinite arbitrage produced by disconnected local systems.

See `02_Economy/MARKET.md` and `02_Economy/PRICING.md`.

---

# 16. Waste and Reverse Logistics

Consumption/production can create waste.

Waste may require:

- collection;
- transport;
- treatment;
- recycling/recovery;
- disposal capacity.

Waste is an economic/logistics consequence, not only decoration.

Recycling may create recovered materials, but never unlimited free resources.

---

# 17. Investment and Productive Ownership

Actors may invest in productive capability.

Examples:

- personal training/equipment;
- company fleet/warehouse/HQ;
- production capacity;
- farm/factory acquisition;
- infrastructure construction/concessions;
- technology/research;
- external shares/investments.

Eligible farms/factories/industrial assets may be sold, auctioned, concessioned, invested in, or acquired when the purchasing actor satisfies capital, specialist, infrastructure, authorization, and operating requirements.

Ownership does not bypass operating inputs/costs.

---

# 18. Infrastructure Economy and Fair Access

Infrastructure may be public, private, concession-operated, or mixed.

Operators may receive service/access revenue where governed and incur real costs/capacity constraints.

Essential corridors/utilities require fair-access/counterplay safeguards so ownership cannot permanently softlock a locality/country.

---

# 19. Insolvency, Bankruptcy and Recovery

People and companies may fail economically.

## Personal Failure

May include:

- depleted Personal Money;
- unpaid living obligations;
- housing loss;
- asset sale/loss through governed mechanisms;
- bankruptcy/recovery status.

Identity/history and valid earned capability survive normal bankruptcy.

## Company Failure

May include:

- inability to pay wages/suppliers;
- loss of customers/contracts;
- asset sales;
- restructuring;
- acquisition;
- liquidation/closure.

Failure must create understandable causes and a legitimate recovery/re-entry path for the person.

---

# 20. Offline Settlement

World time may continue while a player is offline.

Offline settlement follows causal rules:

- legitimate fixed obligations/basic living consumption may continue;
- active-use costs such as driving fuel stop when not used;
- starter wages require real work;
- company processes may continue only when the world/company has the people, inventory, infrastructure, automation/authority, and capacity required;
- settlement must be deterministic/idempotent under shared authority.

There is no generic magical offline income multiplier.

---

# 21. World Instances and Economic Isolation

Each World Instance owns an independent economy.

Money, inventory, productive assets, shares, reputation, companies, contracts, and productive capability are world-local by default.

Fresh worlds do not import mature-world economic power.

NPC/simulated actors may provide a bounded economic baseline at low human population, but they obey the same real stock-flow constraints and cannot provide infinite supply/demand/money.

See `06_Technical/WORLD_INSTANCES.md`.

---

# 22. National Currencies — Staged Target

The architecture must support future national game currencies and exchange-rate pressure.

`Personal Money` and `Company Money` remain ownership domains regardless of denomination.

Until multi-currency settlement is separately implemented, the runtime may use a common gameplay denomination.

Future currency behavior may consider fictional productivity, trade, inflation/liquidity, stability/confidence and external balance without reproducing live real-world FX.

---

# 23. Banking, Debt and Public Finance — Later Systems

Future banking/credit may exist only with explicit:

- principal;
- interest;
- repayment schedule;
- collateral/credit rules;
- default/recovery consequences.

Future taxation/public budgets may exist in simplified form where needed to close infrastructure/service money loops.

The game should not become a tax-form simulator.

These systems are not prerequisites for the first stock-flow implementation slices.

---

# 24. Multiplayer Authority

Shared economic truth must be server/trusted-authoritative before real players can contest it.

Authority must own, where relevant:

- balances/ledgers;
- inventories/cargo custody;
- contracts/orders;
- wages/payments;
- asset/company ownership;
- market settlement;
- infrastructure access/ownership;
- world time/offline catch-up;
- production/consumption settlement.

Idempotency and transaction integrity must prevent duplication/double settlement.

---

# 25. Playability and Complexity Boundary

Complex simulation does not require constant complex UI.

The beginner should initially understand questions such as:

- What do I need now?
- What work can I do?
- What did I earn?
- What did it cost?
- What changed?
- What can I improve next?

Advanced finance/market/production dashboards should appear when the player's role actually needs them.

Economic depth must create choices and visible consequences, not spreadsheet burden.

---

# 26. Runtime Migration Boundary

The current runtime still contains prototype-era economics, including:

- starter company ownership state;
- direct per-delivery Company Money reward;
- simplified demand;
- missing personal metabolism/Work Capacity settlement;
- missing universal inventory/consumption/production links.

This document does not silently modify runtime/save data.

Migration occurs through dedicated implementation PRs with explicit save/state interpretation, authority, tests, and owner-facing Android verification when player-visible.

---

# 27. Balancing Boundary

The following remain data-driven balancing values unless explicitly canonized later:

- wages;
- prices/margins;
- food/water consumption rates;
- Work Capacity rates;
- production recipes/throughput;
- fuel/energy use;
- rents;
- maintenance costs;
- taxes;
- interest;
- FX rates;
- market sensitivity;
- competitor capacity thresholds;
- world-time speed.

---

# Canonical Rule

**Every important resource in DROPi Tycoon must belong to a coherent stock-flow economy. Needs create demand; labor, production and logistics transform/move real resources; transactions move money between legitimate actors; consumption/use creates consequences and new needs; and no independent reward economy may create unexplained value outside this model.**

---

End of Document
