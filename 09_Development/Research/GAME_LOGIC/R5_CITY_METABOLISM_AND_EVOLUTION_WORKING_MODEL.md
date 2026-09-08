# R5 — City Metabolism and Settlement Evolution Working Model

Status: **RESEARCH WORKING PAPER — NON-CANONICAL**
Parent: #423
Track: #429

## Purpose

Define how a locality grows, consumes, produces waste, attracts people, loses people, changes architecture, creates jobs and generates logistics demand from economic causes rather than scripted city levels.

---

# 1. A settlement is an economic organism

A city/locality contains interacting stocks:

- population/households;
- housing;
- jobs;
- qualified labor;
- businesses/shops;
- productive facilities;
- utilities;
- transport infrastructure;
- public-service capacity;
- inventories/market availability;
- waste-treatment capacity;
- land/development capacity;
- attractiveness/quality indicators.

It also has continuous flows:

- food/water/energy consumption;
- goods purchases;
- wages/income;
- commuting;
- migration;
- construction;
- business creation/closure;
- imports/exports;
- waste/wastewater;
- tourism;
- training/education.

---

# 2. Population representation

The final server cannot necessarily simulate millions of people at full individual detail.

Candidate model:

- visible local NPCs are individual agents when near the player;
- economic simulation uses households/cohorts/worker pools at larger scale;
- real players remain persistent individual Economic Actors;
- aggregation must conserve population, labor, consumption and money/economic effects.

The simulation representation can change with zoom/scope without changing economic truth.

---

# 3. Household consumption

Households generate recurring demand for categories such as:

- food;
- water;
- electricity/heat/energy;
- clothing;
- household goods;
- communications/services;
- medicines/health-related goods when applicable;
- local transport;
- housing.

Income and prices influence purchasing ability and consumption mix.

Shortage changes behavior instead of simply setting a red city icon.

---

# 4. Household income

Household purchasing power comes primarily from:

- wages/employment;
- business income;
- investment income where modeled;
- public transfers only if R6 authorizes them.

Jobs therefore connect productive business activity to consumer demand.

A city with factories but no usable wage circulation can still become economically unhealthy.

---

# 5. Housing

Housing is both capacity and economic asset/service.

Housing variables may include:

- capacity;
- cost/rent;
- location/commute access;
- quality;
- utility access;
- density;
- architectural type;
- condition/maintenance.

Housing shortages can:

- raise prices/rents;
- restrict migration;
- increase commuting;
- trigger new construction if profitable/authorized.

Oversupply/decline can reduce value and leave buildings vacant.

---

# 6. Jobs and labor attraction

Businesses create jobs when they need labor.

A city with available well-paid jobs can attract population if:

- housing exists/can be built;
- transport access exists;
- essential goods/utilities are available;
- living costs remain tolerable;
- migration rules permit movement.

Specialist shortages can trigger training investment and targeted migration.

---

# 7. Utilities

Urban life and industry can depend on:

- potable water;
- electricity;
- heating/cooling abstraction where climate requires it;
- wastewater/sewage;
- solid waste collection;
- communications;
- fuel/charging infrastructure.

Utility shortage can reduce:

- household quality/living stability;
- industrial output;
- business attractiveness;
- population growth;
- property value.

Utilities should create real infrastructure/logistics demand.

---

# 8. Waste and wastewater

Consumption/production generates waste.

Settlement flows may include:

```text
households/businesses/industry
-> waste stock
-> local collection
-> transfer station / sewer network
-> treatment/recycling/disposal
-> recovered materials and/or cost
```

Insufficient capacity can increase:

- service cost;
- pollution/quality penalties;
- industrial constraints;
- health/productivity effects if later modeled;
- pressure to build new facilities.

Waste should produce jobs/contracts/transport demand.

---

# 9. Retail and merchant restocking

Stores are inventory-bearing businesses.

```text
household demand
-> store sales reduce inventory
-> target stock threshold reached
-> merchant procurement order
-> supplier selected
-> delivery/logistics demand created
-> inventory replenished
```

This is one of the fundamental sources of urban delivery work.

---

# 10. Industry and external productive nodes

Not every productive facility belongs inside the urban footprint.

A city may depend on external nodes such as:

- farm;
- quarry/mine;
- steelworks;
- chemical plant;
- paper mill;
- refinery;
- power plant;
- logistics park;
- airport/port/rail freight terminal;
- landfill/recycling/treatment facility.

These nodes connect through regional transport infrastructure and create inbound/outbound logistics flows.

---

# 11. City growth is causal

A candidate positive growth loop:

```text
new productive investment
-> jobs
-> wages
-> migration
-> housing demand
-> construction
-> household consumption
-> retail/services growth
-> more business/logistics demand
-> tax/public revenue if later modeled
-> infrastructure expansion
-> greater productive capacity
```

Growth can stall when one or more links become constrained.

---

# 12. City decline is causal

A candidate decline loop:

```text
major employer closes
-> unemployment
-> household income falls
-> retail demand falls
-> businesses close
-> property values/rents fall
-> population migrates out
-> vacant housing/infrastructure rises
-> local revenue/investment capacity weakens
-> services deteriorate
```

Recovery can occur through new industry, logistics advantages, training, infrastructure, migration or investment.

---

# 13. Construction

New construction should require:

- actual demand/business case;
- land/site;
- materials;
- labor/specialists;
- equipment;
- utilities/road access;
- money/financing;
- time;
- approvals where modeled.

Construction itself generates logistics demand for materials and equipment.

---

# 14. Architecture evolves with the economy

Architecture should be tied to:

- local/regional style family;
- wealth/investment;
- density;
- technology era/progression;
- land value;
- building use;
- climate/region;
- historical continuity.

Growth can therefore produce:

- new houses;
- denser residential blocks;
- renovated commercial streets;
- industrial parks;
- warehouses;
- modern offices;
- infrastructure hubs.

The city should not abruptly switch art styles. New construction uses the approved visual world style while preserving region-specific architecture.

---

# 15. Urban delivery competition

Owner direction:

- a meaningful urban locality should support at most roughly **5 major delivery competitors** at once;
- exact capacity can depend on population/demand/market size and later balancing;
- multiple specialist logistics providers may exist without all being equivalent last-mile competitors.

A saturated market should push entrants toward:

- specialization;
- acquisition;
- another district/locality;
- regional contracts;
- new growing settlements.

---

# 16. Rural locality model

Rural/small localities have distinct economy and architecture.

Potential characteristics:

- lower population density;
- fewer shops/services;
- agriculture/forestry/resource specialization;
- longer distances;
- lower delivery density;
- weaker public transport;
- local markets/farms;
- larger importance of regional connections.

Owner direction:

- normally **1–2 meaningful delivery companies** in one rural locality/area.

Rural players should not simply experience a smaller copy of the city.

---

# 17. New settlement formation

A country can eventually develop new localities in previously undeveloped territory, but a new city should not appear from a level-up animation.

Candidate prerequisites:

```text
strategic site / resource / infrastructure advantage
+ investment
+ anchor jobs/industry
+ transport connection
+ utilities
+ initial housing
+ population migration
-> settlement forms
```

It can then evolve through the same economic loop as older settlements.

---

# 18. Tourism

Tourism is temporary population/demand rather than permanent residents.

Tourists may consume:

- accommodation;
- food;
- retail;
- transport;
- entertainment/services.

Tourism depends on:

- attractions/season/events;
- accessibility;
- safety/quality abstractions;
- capacity/prices.

It can create seasonal jobs and delivery demand without increasing permanent population equally.

---

# 19. Education and specialist production

A city produces future specialist capacity through education/training.

Education requires:

- institutions;
- instructors;
- facilities/equipment;
- time;
- population/students;
- funding/payment.

A city without specialist education may depend on migration/imported labor for advanced industries.

---

# 20. Public/shared infrastructure

Some infrastructure is economically essential:

- roads;
- water/sewage;
- electricity;
- public transport;
- waste systems;
- selected rail/port/airport links.

R6 must decide what can be privately owned, concession-operated or publicly simulated.

No single private company should permanently block an entire city's normal progression through monopoly control of essential infrastructure.

---

# 21. Local price differences

Local prices can differ because of:

- production availability;
- transport cost;
- local wages;
- utility cost;
- housing/land cost;
- demand;
- shortage;
- competition;
- taxes/fees if later included.

This gives players a reason to move goods between localities.

---

# 22. Population migration

People can move toward:

- jobs;
- higher wages;
- affordable housing;
- better services;
- education;
- safer/more stable economy;
- family/social abstractions where useful.

They can leave because of:

- unemployment;
- shortages;
- unaffordable housing;
- service collapse;
- pollution;
- macro events/conflict;
- better opportunities elsewhere.

Migration changes labor supply and demand in both origin and destination.

---

# 23. City economic health is multi-dimensional

Do not reduce city maturity to one level.

Useful indicators may include:

- population;
- employment/unemployment;
- household purchasing power;
- housing affordability/availability;
- food/water/energy security;
- industrial output;
- commercial activity;
- logistics connectivity;
- specialist availability;
- utility reliability;
- waste-treatment capacity;
- investment/construction;
- migration balance.

These can drive presentation and AI decisions.

---

# 24. Major unresolved R5 decisions

1. Household cohort granularity.
2. Whether individual NPCs keep persistent household identities at local scale.
3. Exact housing ownership/rental system.
4. Homelessness/emergency housing policy by country/city.
5. Public-service funding model.
6. Health/disease simulation depth.
7. Pollution/environmental effects depth.
8. City construction ownership: public, private developers, players, hybrid.
9. Exact competitor-capacity formula around the owner's 5 urban / 1–2 rural target.
10. How newly founded settlements gain governance/status.

---

## Research rule

**A city grows because people, jobs, housing, utilities, goods, infrastructure and investment support one another. It declines when those flows break. Consumption creates logistics demand and waste; specialist labor enables advanced industry; architecture and settlement size visibly change as economic capacity changes.**
