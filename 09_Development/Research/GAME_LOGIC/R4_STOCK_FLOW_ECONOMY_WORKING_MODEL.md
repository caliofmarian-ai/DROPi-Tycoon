# R4 — Stock-and-Flow Economy Working Model

Status: **RESEARCH WORKING PAPER — NON-CANONICAL**
Parent: #423
Track: #428

## Purpose

Define a candidate economy in which deliveries, wages, production, prices, consumption and waste all arise from traceable causes rather than arbitrary rewards or disconnected passive-income systems.

---

# 1. Economic design target

DROPi Tycoon should behave as a persistent mixed economy where:

- households/people consume;
- companies employ and produce;
- farms/factories transform inputs;
- merchants stock and sell;
- logistics moves custody between locations;
- cities consume utilities and goods;
- waste becomes another physical/economic flow;
- prices react to scarcity, cost and demand;
- NPC simulation maintains minimum continuity;
- human players create strategy, specialization, negotiation, competition and ownership.

The system should be **closed enough to explain every major flow**, while still allowing carefully governed monetary/institutional stabilization where a perfectly closed money supply would make the game brittle.

---

# 2. Core economic stocks

At minimum the simulation needs authoritative stocks for:

## Money
- Personal Money;
- Company Money;
- later institutional/public money only if R6 authorizes it;
- later national currency balances/exchange positions only if multi-currency is retained.

## Physical goods
- natural/raw resources;
- intermediate goods;
- finished goods;
- food/water;
- fuel/energy carriers;
- packaging;
- spare parts;
- construction materials;
- waste/recyclables/by-products.

## Capacity
- labor/Work Capacity;
- production capacity;
- storage capacity;
- transport capacity;
- utility capacity;
- infrastructure throughput.

## Durable assets
- tools/equipment;
- vehicles;
- buildings;
- factories/farms;
- infrastructure;
- housing/property.

Stocks cannot be changed without an explicit economic event/flow.

---

# 3. Goods taxonomy

Every physical item belongs to a product/category model that can support logistics requirements.

Candidate top-level classes:

1. natural resources;
2. agriculture;
3. food and beverages;
4. water and utility commodities;
5. fuels and energy carriers;
6. chemicals;
7. metals and industrial materials;
8. wood/paper/packaging;
9. construction materials;
10. machinery/components/spare parts;
11. electronics;
12. medical/pharmaceutical;
13. household/consumer goods;
14. textiles/clothing;
15. vehicles/equipment;
16. waste/recyclables/by-products;
17. specialist/high-value cargo.

A product definition may include:

- stable product/category ID;
- mass/volume class;
- storage type;
- shelf life/perishability;
- temperature requirement;
- hazard/special handling class;
- unit/lot representation;
- transport compatibility;
- production recipe references;
- consumption use cases.

Exact product count belongs to content production, not this research document.

---

# 4. Production recipe model

A production process consumes inputs and time/capacity to create outputs and residuals.

Generic recipe:

```text
input inventory
+ labor time / specialist capability
+ facility capacity
+ energy / water / utilities
+ operating time
+ required equipment
-> output inventory
+ waste / by-product
+ operating cost / wear
```

Examples:

```text
crops + workers + electricity + factory capacity -> food + organic/packaging waste
chemicals + energy + workers -> fertilizer + industrial waste
iron/coal/scrap + energy + specialists -> steel + slag/emissions abstraction
wood + chemicals + energy + water -> paper + wastewater/by-products
fertilizer + seeds + water + farm labor -> crops
```

Production cannot run when a required input/capacity is unavailable.

---

# 5. Consumption model

Consumption is a first-class demand generator.

## Human/household consumption
May consume:
- food;
- water;
- electricity/heat/utility service;
- clothing/household goods;
- transport services/fuel;
- medicines/services when needed;
- housing capacity.

## Company consumption
May consume:
- labor;
- electricity/fuel;
- water;
- raw materials;
- packaging;
- software/services;
- spare parts;
- land/storage/office capacity.

## City/system consumption
May consume:
- infrastructure capacity;
- public-service capacity;
- energy/water;
- construction materials;
- maintenance resources.

Consumption removes/uses stock and may create waste or downstream demand.

---

# 6. Inventory and custody

A good is not globally available merely because it exists somewhere in the World Instance.

Inventory belongs to a location/owner/custodian context such as:

- person;
- shop;
- warehouse;
- factory;
- farm;
- vehicle/cargo compartment;
- port/terminal;
- construction site.

A logistics transaction changes custody/location through authoritative events.

This prevents duplication and makes storage/transport meaningful.

---

# 7. Procurement and order creation

A delivery begins because an actor needs goods moved.

Candidate procurement causes:

- merchant stock below target;
- factory input shortage/forecast;
- farm supplies needed;
- household/customer purchase requiring delivery;
- construction material request;
- waste collection threshold;
- company transfer between facilities;
- contract schedule;
- emergency/event demand;
- export/import movement.

Conceptual order chain:

```text
need detected
-> buyer/procurer searches supplier or contract source
-> quantity/price/terms agreed
-> goods reserved/produced
-> logistics requirement created
-> carrier/service selected
-> custody transfer
-> transport
-> delivery verification
-> goods/payment/service settlement
```

No logistics job should exist without a business/world reason.

---

# 8. Delivery service pricing

Transport price should eventually respond to cost and market conditions such as:

- distance/time;
- cargo mass/volume;
- special handling;
- urgency/window;
- fuel/energy price;
- labor cost;
- route/infrastructure fees;
- vehicle utilization;
- risk/reliability requirements;
- local carrier supply/competition;
- reputation/service quality.

A company can bid below sustainable cost and lose money. Winning volume is not automatically success.

---

# 9. Goods price formation

Candidate hybrid model:

## Base information
A product may have a reference production-cost band derived from inputs/labor/energy/capital utilization.

## Local market price
Actual transaction prices respond to:

- available inventory;
- recent consumption/demand;
- replacement/production cost;
- transport/import cost;
- storage/perishability pressure;
- competing suppliers;
- strategic shortage/surplus;
- contracts/negotiation.

The game should avoid one global static price table.

---

# 10. Local vs strategic markets

Different market layers can coexist:

### Retail/local marketplace
Small quantities and household/player consumption.

### Business procurement
Companies buy inputs, equipment and services.

### Contract/tender market
Recurring transport, supply, construction, labor or infrastructure work.

### Commodity/exchange layer
Standardized bulk goods can trade at regional/national/global hubs when unlocked.

### Asset market
Vehicles, factories, property, shares or concessions use separate asset settlement rules.

One UI need not expose every layer at the start.

---

# 11. Contracts

Contracts should be reusable economic agreements rather than bespoke mission scripts.

A contract may specify:

- parties;
- goods/service;
- source/destination;
- quantity/capacity;
- schedule/window;
- price/payment formula;
- quality/reliability threshold;
- collateral/penalty only if later authorized;
- duration/renewal;
- eligibility/qualification;
- cancellation/default rules.

Contract families can support:

- employment/work shifts;
- logistics transport;
- recurring merchant supply;
- industrial input/output supply;
- construction;
- maintenance;
- specialist services;
- infrastructure access.

Comparative input: Eco demonstrates a useful pattern where contracts can govern goods, labor and transport/service obligations rather than only item sales.

---

# 12. Money flow — no arbitrary rewards

The mature economy should prefer circulation over unexplained creation.

Example starter wage:

```text
merchant/customer pays incumbent company for real service
-> incumbent Company Money increases
-> company pays payroll/fuel/other costs
-> hero receives Personal Money wage
-> hero buys food/housing/services
-> merchants/providers receive money
-> merchants/producers procure more goods/labor
```

This is stronger than:

```text
deliver parcel -> game creates 50 money
```

---

# 13. Monetary faucets and sinks

A persistent multiplayer economy still needs explicit monetary control.

## Candidate faucets — only when justified
Possible sources include:

- initial World Instance monetary seed;
- public/institutional spending;
- exports to abstract external counterparties if the modeled world boundary requires them;
- regulated monetary expansion if national currencies are later implemented;
- event/recovery injections only when explicitly balanced.

## Candidate sinks
Possible sinks include:

- licensing/registration fees;
- infrastructure construction consumption paid to system/public actors where appropriate;
- taxes only if R6 approves them;
- unrecoverable depreciation/scrappage;
- imported goods from abstract external counterparties;
- fines/fees under governed systems;
- service costs paid outside the modeled actor set.

The final model must instrument faucets/sinks continuously.

Comparative input: EVE Online's official Monthly Economic Reports explicitly track money supply, sinks/faucets, production, mining, destruction and price indices. DROPi should similarly instrument its economy from the start rather than balance by intuition alone.

---

# 14. Initial World Instance economy

A new world requires a baseline economic seed so starter employers, shops, farms and utilities can operate before humans have created everything.

The seed should include:

- population/household demand;
- incumbent companies;
- initial inventories;
- initial productive facilities;
- initial money distribution;
- utility/transport baseline capacity;
- resource endowments;
- prices/contract baselines derived from versioned data.

The baseline is not infinite supply. It is the starting state from which scarcity/surplus emerges.

---

# 15. NPC continuity and market makers

Human population will vary dramatically.

NPC simulation may provide:

- baseline consumer demand;
- baseline employers;
- baseline production/labor;
- minimum buyer/seller liquidity for essential starter markets;
- public/essential service continuity.

NPC support should obey the same inventories/costs wherever practical.

It must not:
- print unlimited money to rescue favored companies;
- buy infinite goods at fixed prices;
- remove all commercial risk;
- make human specialization irrelevant.

Fallback liquidity can widen spreads/offer poorer terms rather than pretending deep human markets exist.

---

# 16. Scarcity and substitution

Shortages should produce gameplay decisions rather than immediate world death.

Responses may include:

- higher prices;
- imports from other regions/countries;
- substitute products/recipes;
- reduced production;
- delayed construction;
- migration;
- new investment/producers entering the market;
- public/emergency intervention if R6 permits it.

Essential-goods systems need at least one recovery path.

---

# 17. Waste economy

Waste is inventory/capacity, not only pollution UI.

Types can include:

- municipal mixed waste;
- recyclable material;
- organic waste;
- wastewater/sewage;
- industrial waste;
- hazardous/specialist waste where appropriate;
- scrap metals/components.

Flow:

```text
consumption/production
-> waste stock
-> collection requirement
-> transport
-> sorting/recycling/treatment/disposal
-> cost + recovered secondary materials where applicable
```

Comparative input: Workers & Resources: Soviet Republic explicitly connects citizen food, water, sewage, electricity and waste-management logistics. DROPi should use the causal lesson without copying its full complexity.

---

# 18. Destruction, wear and economic renewal

A healthy long-lived economy needs asset/resource sinks.

Potential mechanisms:

- vehicle/equipment wear;
- maintenance parts consumption;
- building/infrastructure maintenance;
- product consumption/spoilage;
- construction materials becoming fixed assets;
- waste/disposal;
- accidents/failures only when gameplay-appropriate;
- decommissioning/scrapping.

Durable items should not circulate forever without cost.

---

# 19. Anti-exploit requirements

Shared authority must prevent:

- inventory duplication;
- double payment;
- cargo teleportation;
- self-dealing price manipulation without market consequences;
- circular fake deliveries used only to mint money/XP;
- fake labor from alternate identities;
- replayed contract settlement;
- client-declared balances or ownership.

Every money/inventory transfer requires stable transaction/custody records.

---

# 20. Economy instrumentation

Before live multiplayer scale, the server should be able to measure at minimum:

- total money supply by ownership domain/currency;
- monetary faucets/sinks;
- Personal vs Company Money distribution;
- production by product/region;
- consumption by product/region;
- inventories/shortages;
- prices/indices;
- wage distributions;
- employment/unemployment;
- transport volumes/costs;
- company births/failures;
- waste generation/treatment;
- trade balances by region/country;
- concentration/market share.

Without instrumentation, balancing a persistent economy becomes guesswork.

---

# 21. Major unresolved R4 decisions

1. One universal gameplay currency vs national currencies/exchange rates.
2. Monetary authority model and controlled money-supply growth.
3. Whether banks/credit creation exist and at what stage.
4. Exact retail vs wholesale/exchange market mechanisms.
5. NPC fallback market pricing rules.
6. Taxation/public spending interaction with R6.
7. Inventory granularity and units for Android/server scalability.
8. Spoilage/perishability granularity.
9. How much household consumption is per-person vs aggregated cohort simulation.
10. Which external-world imports/exports are abstract versus fully represented through other countries in the same World Instance.

---

## Research rule

**Every unit of money, inventory, productive capacity and waste must have a traceable owner/location/state transition. Demand is created by real consumption or investment needs; production transforms constrained inputs; logistics changes custody and location; prices communicate scarcity and cost; currency creation/destruction is explicit and measured.**

## Comparative references

- EVE Online official Monthly Economic Reports — money supply, sinks/faucets, production and price instrumentation: https://www.eveonline.com/news/t/monthly-economic-reports
- Eco Economy and Contracts — player exchange of goods, labor and services: https://wiki.play.eco/en/Economy and https://wiki.play.eco/en/Contracts
- Workers & Resources: Soviet Republic Official Wiki — citizen needs, food, water, utilities and waste: https://wiki.hoodedhorse.com/Workers_Resources_Soviet_Republic/
