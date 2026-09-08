# Game Logic Research — Dependency and Causal Model

Status: **RESEARCH ONLY — NON-CANONICAL**
Parent: #423

## Purpose

Prevent the research program from becoming eight isolated documents. The game must close as one causal system.

---

# 1. Research order is dependency-driven

Recommended research dependency order:

```text
R1 HUMAN HERO
  |\
  | \________
  v          v
R8 TIME     R4 GOODS / MONEY / CONSUMPTION
  |          |
  +-----+----+
        |
        v
R3 LABOR / PROFESSIONS
        |
        v
R2 COMPANY LIFE-CYCLE
        |
        v
R5 CITY / SOCIETY
        |
        v
R6 COUNTRY / MACRO ECONOMY
        |
        v
R7 MULTIPLAYER / AUTHORITY / ANTI-GRIEFING
        |
        v
FINAL GAME_LOGIC_MASTER_MODEL
        |
        v
OWNER APPROVAL
        |
        v
CANON RECONCILIATION
        |
        v
IMPLEMENTATION EPICS
```

This is not a strict serial lock. R4/R8/R3/R2 iterate together, but no downstream track may invent a missing upstream economic truth.

---

# 2. The universal economic actor rule

DROPi Tycoon research now treats the major world actors as **stocks + capacities + flows**.

## Person / Hero
Stocks/capacities:
- Personal Money;
- inventory/personal property;
- Work Capacity;
- qualifications;
- reputation/history;
- time/location.

Flows:
- wages/investment income;
- consumption;
- purchases;
- travel;
- work;
- training;
- asset acquisition/disposal.

## Company
Stocks/capacities:
- Company Money;
- workforce;
- inventory;
- vehicles/equipment;
- facilities;
- contracts/customers;
- productive capacity;
- reputation;
- ownership/governance state.

Flows:
- revenue;
- payroll;
- purchases;
- production/services;
- fuel/energy/utilities;
- maintenance;
- investment;
- dividends;
- waste/by-products.

## Settlement / City
Stocks/capacities:
- population;
- housing;
- jobs;
- commercial/industrial capacity;
- infrastructure;
- utility capacity;
- inventories/market availability;
- waste-treatment capacity.

Flows:
- consumption;
- labor;
- migration;
- construction;
- goods inflow/outflow;
- energy/water use;
- waste/wastewater;
- tourism;
- investment.

## Country
Stocks/capacities:
- population/labor;
- resources;
- industrial base;
- infrastructure;
- energy capacity;
- monetary/fiscal state if retained;
- strategic inventories/capabilities.

Flows:
- interregional trade;
- imports/exports;
- migration;
- investment;
- national infrastructure;
- policy/concession/privatization actions where modeled.

Every stock must identify legitimate inflows and outflows.

---

# 3. Universal capability rule

No actor performs a capability merely because a menu button exists.

Generic capability check:

```text
Need / Demand
+ eligible actor
+ knowledge / qualification
+ authority / permission
+ labor / Work Capacity
+ equipment / facility
+ energy / fuel / utilities
+ input goods / inventory
+ infrastructure / route access
+ time
+ money / credit capacity
= possible action
```

The action then changes authoritative stocks/flows.

---

# 4. Universal production rule

Every production/service activity must answer:

1. What need/demand caused it?
2. Who owns the inputs?
3. What inputs are consumed?
4. What labor/capacity is consumed?
5. What time is consumed?
6. What equipment/facility is required?
7. What energy/utilities are required?
8. What output is created?
9. Who owns/custodies the output?
10. What waste/by-products are created?
11. Who pays whom?
12. What risk/failure can occur?

If a feature cannot answer these questions, it is not economically closed yet.

---

# 5. Universal delivery rule

A delivery is never a floating mission.

```text
Economic need
-> order/procurement/service demand
-> goods exist or are scheduled for production
-> payer/buyer exists
-> sender/seller exists
-> logistics service is requested
-> eligible company/worker receives contract/assignment
-> cargo custody transfers
-> transport consumes time/capacity/energy
-> cargo reaches destination
-> destination inventory/need changes
-> service/payment settles
-> downstream consumption/production becomes possible
```

A failed delivery also changes the economy: delay, inventory shortage, contract penalty/reputation, re-routing, spoilage/damage where modeled.

---

# 6. Universal consumption rule

Consumption removes/uses resources and creates consequences.

Examples:

- person consumes food/water -> supports Work Capacity/living state;
- vehicle consumes fuel/electricity -> creates transport capacity;
- factory consumes chemicals/energy/labor -> creates fertilizer;
- farm consumes fertilizer/water/labor -> creates crops;
- city households consume goods -> create retail demand and waste;
- construction consumes materials/labor -> creates housing/infrastructure.

Consumption is therefore a primary demand generator.

---

# 7. Universal waste rule

Where materially useful, consumption/production produces residual flows.

```text
activity
-> product/service output
+ waste/by-product/wastewater
-> collection/storage
-> transport
-> recycling/treatment/disposal
-> cost and/or secondary material recovery
```

Waste can create industries, jobs, contracts, infrastructure and regional externalities.

Do not add waste merely as a punitive bar; it must connect to logistics/economy/world consequences.

---

# 8. Universal failure rule

Failure should degrade capability before deleting identity.

Typical ladder:

```text
healthy
-> pressure/shortage
-> reduced service/capacity
-> missed obligations
-> asset/service loss
-> restructuring/liquidation
-> insolvency/failure state
-> recovery / acquisition / re-entry
```

Player identity and durable world history survive ordinary financial failure.

---

# 9. Universal time rule

Not all simulation runs at frame rate.

Research will assign events to layers such as:

- immediate/input time;
- active movement time;
- work-shift time;
- daily consumption/payroll/operations;
- market/production ticks;
- seasonal agriculture/tourism;
- yearly demographics/construction/macro development;
- offline deterministic catch-up.

The authoritative world clock must determine settlement order.

---

# 10. Universal multiplayer rule

Human and NPC actors must use the same economic contracts where they represent the same role.

A human courier and an NPC courier cannot create two incompatible payroll systems.

Human input can provide:
- decision quality;
- specialization;
- social strategy;
- negotiation;
- entrepreneurship;
- risk taking;
- governance.

NPC simulation provides:
- baseline labor;
- continuity;
- low-population resilience;
- market counterparties where required.

The server/shared authority owns contested economic truth.

---

# 11. Causal closure example — fertilizer economy

```text
city/farm demand for more agricultural output
-> fertilizer demand rises
-> fertilizer producer requires chemical inputs + energy + labor
-> chemical plant produces/sells required inputs
-> logistics company transports chemicals
-> fertilizer plant produces fertilizer + waste/by-products
-> logistics transports fertilizer to farms
-> farms consume fertilizer + water + labor
-> crop output rises
-> food processors/markets buy crops
-> logistics transports food
-> people/cities consume food
-> Personal Money/household demand transfers revenue backward through the chain
-> waste is collected/recycled/disposed
```

Prices, shortages and capacity determine whether this chain expands or contracts.

---

# 12. Causal closure example — poor starter courier

```text
hero needs food/water/housing
-> needs Personal Money
-> incumbent employer has real delivery demand
-> hero works pedestrian shift
-> hero consumes Work Capacity
-> employer receives productive service
-> employer pays wage
-> hero buys basic goods/services
-> merchants receive demand/revenue
-> merchants restock
-> restocking creates more logistics demand
-> hero saves residual money
-> training/equipment purchase increases capability
-> better jobs become eligible
```

This is the intended smallest complete gameplay economy.

---

# Exit rule for the research program

The final research dossier must be able to start from any major event — a person eating, a factory buying chemicals, a city building houses, a company hiring a driver, a country importing fuel — and trace the relevant resources, money, labor, time, ownership, infrastructure and waste through the system without encountering an undefined magical source or sink.
