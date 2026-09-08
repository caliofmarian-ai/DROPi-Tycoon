# R6 — Country and Macroeconomy Working Model

Status: **RESEARCH WORKING PAPER — NON-CANONICAL**
Parent: #423
Track: #430

## Purpose

Define how a country exists as a persistent economic territory containing representative cities, rural localities, external productive nodes, infrastructure, resources, population, trade, migration and long-term prosperity/decline.

---

# 1. Global representation rule

DROPi Tycoon is global but does not need every real-world locality.

Research baseline from owner direction:

- all countries are represented on the global layer;
- each country has its real/recognizable geographic position and shape at strategic scale;
- detailed playable representation uses a sparse set of representative nodes rather than every settlement;
- the capital is represented in its real geographic location;
- up to four representative urban nodes cover broad north/east/south/west geographic sectors where geography/population makes sense;
- up to four smaller/rural localities represent diagonal sectors such as NE/NW/SE/SW where appropriate;
- external economic nodes (farms, mines, steelworks, chemical plants, power plants, ports, etc.) may exist outside locality footprints;
- countries with unusual geography are represented by sensible geographic/economic nodes rather than forced into an artificial 9-node grid.

---

# 2. Country state

A country can own/aggregate strategic state such as:

- population;
- labor/specialist pools;
- cities/localities;
- productive industries;
- natural resources;
- agriculture;
- energy capacity;
- transport infrastructure;
- utility/infrastructure quality;
- national inventories/resilience indicators where useful;
- imports/exports;
- investment;
- migration;
- technology/education capability;
- public/institutional capability if modeled;
- currency/monetary state if national currencies are approved.

The country is not a single `level`.

---

# 3. Regional specialization

Different parts of one country can specialize because of:

- natural resources;
- climate/agriculture;
- coastline/rivers;
- existing infrastructure;
- historical/seeded industry;
- labor/specialists;
- player investment;
- transport connectivity;
- energy availability.

Examples:

- agricultural region;
- steel/industrial region;
- port/export region;
- technology/services region;
- tourism region;
- energy/resource region.

Specialization creates internal freight flows between regions/localities.

---

# 4. National production and consumption balance

For important product categories the country can have:

- surplus;
- near balance;
- deficit.

Conceptually:

```text
national production
+ imports
- household consumption
- industrial consumption
- construction/investment consumption
- exports
= inventory/change in availability
```

Deficits create import demand and higher prices/strategic pressure. Surpluses create export opportunities and lower local scarcity.

---

# 5. Domestic trade

National transport connects:

- cities;
- rural localities;
- farms;
- factories;
- warehouses;
- rail terminals;
- airports;
- river/sea ports;
- external economic nodes.

Domestic trade can use:

- road;
- rail;
- river;
- coastal shipping;
- air cargo;
- drones where appropriate;
- multimodal chains.

Infrastructure quality/capacity changes effective transport cost and national market integration.

---

# 6. Imports and exports

International trade occurs because national/local markets differ.

A cross-border trade opportunity can arise from:

- shortage/surplus;
- price difference;
- specialist product availability;
- seasonal variation;
- strategic contract;
- industrial dependency;
- event/disruption.

Trade must pay transport, handling and later customs/regulatory abstractions where useful.

---

# 7. Strategic dependencies

A country can depend on external supply for categories such as:

- fuel/energy;
- chemicals;
- fertilizer;
- food;
- industrial components;
- electronics;
- medicines;
- machinery;
- construction materials.

Dependency creates risk and opportunity.

Example:

```text
country lacks fertilizer capacity
-> imports chemicals/fertilizer
-> global price/route disruption increases local cost
-> farm yields/economics weaken
-> food prices rise
-> investment incentive for domestic chemical/fertilizer plant rises
```

The economy can therefore restructure over time.

---

# 8. Infrastructure investment

Country-scale development can require:

- highways;
- rail corridors;
- bridges;
- power generation/grid capacity;
- ports;
- airports;
- water infrastructure;
- logistics hubs;
- education/training institutions.

Projects consume money, labor, materials and time and create logistics demand during construction.

Infrastructure then changes future productivity and trade costs.

---

# 9. Public/private/concession model — research boundary

Major assets may have different ownership/control models:

- private ownership;
- public/simulation ownership;
- private operation under concession;
- mixed company/institutional ownership;
- lease/operating rights.

Essential infrastructure needs anti-monopoly safeguards.

A player/company should not be able to buy one road/port/power asset and permanently prevent the rest of the world from progressing.

---

# 10. Privatization and industrial acquisition

Owner direction explicitly allows advanced players/companies eventually to buy major productive facilities.

Candidate process:

```text
eligible simulation/public/private asset becomes available
-> valuation / auction / negotiated sale / privatization opportunity
-> bidders meet capital + capability + authorization requirements
-> authoritative settlement
-> ownership/control changes
-> new owner must continue funding inputs, workforce, maintenance and environmental/waste obligations
```

Buying an industrial asset does not grant free production. An under-capitalized owner can destroy its profitability and eventually lose/sell it.

---

# 11. Country development loop

Candidate positive loop:

```text
productive investment
-> jobs
-> wages
-> specialist demand/training
-> migration/population
-> household demand
-> business growth
-> infrastructure demand/investment
-> lower logistics cost / higher productivity
-> exports / stronger commercial position
-> further investment
```

The loop is constrained by housing, resources, energy, labor, infrastructure and external market conditions.

---

# 12. Country decline loop

Candidate decline:

```text
industry loses competitiveness / strategic shortage
-> closures/unemployment
-> wages/demand fall
-> migration out
-> housing/business vacancy
-> tax/institutional capacity falls if modeled
-> infrastructure maintenance weakens
-> investment falls
-> further decline
```

Recovery remains possible through new industries, infrastructure, resource discoveries, trade advantages, policy/concession actions, migration and player investment.

---

# 13. National currency — owner direction and open design

Owner vision includes the possibility that a developing country can gain a stronger national currency.

Therefore R6 should not silently assume one universal permanent currency.

Two models require owner review later:

## Model A — one global gameplay currency
Simpler, highly readable, easier economy balance, but loses national monetary strategy and exchange-rate trade effects.

## Model B — national currencies with exchange rates
Each country can have a currency whose value responds to a simplified basket of macroeconomic factors and market flows.

Potential drivers:
- inflation/money supply;
- productivity/output;
- trade balance;
- confidence/stability abstraction;
- interest/monetary policy only if useful;
- strategic reserves/resources;
- external demand.

Model B creates richer global trade but significantly increases complexity/exploit surfaces.

**Research inclination:** preserve Model B as the long-term target if we can design a simplified and transparent monetary layer; do not implement exchange rates until R4 monetary authority is closed.

---

# 14. Money supply and monetary authority

If national currencies exist, the game must answer:

- who issues currency;
- how initial supply is seeded;
- how supply expands/contracts;
- how inflation is measured;
- how public spending/taxes interact;
- how foreign-exchange settlement works;
- how players cannot manipulate a tiny country's currency trivially.

Do not approximate this with a random `currency strength +1%` event.

---

# 15. Public budgets and taxation — optional until proven useful

Taxes can create useful money flows but also complexity.

Potential uses:

- infrastructure;
- public utilities;
- education;
- emergency/basic services;
- economic stabilization.

R6 should include taxation only if it meaningfully closes public spending and national development loops.

Avoid a tax spreadsheet that exists only for realism.

---

# 16. Migration

International migration responds to differences such as:

- jobs/wages;
- housing;
- cost of living;
- specialist demand;
- quality/services;
- economic growth/decline;
- instability/macroeconomic events;
- family/social abstractions if useful.

Migration affects both countries:

- origin loses/gains unemployment pressure and labor;
- destination gains labor and consumer/housing demand;
- specialist migration can transform industrial capability.

---

# 17. New city formation

A country can create new localities in undeveloped areas when real causes justify them.

Examples:

- new mine/resource development;
- port/logistics corridor;
- industrial mega-project;
- population/housing pressure;
- planned infrastructure hub;
- player/company development initiative.

Formation consumes capital, materials, labor, utilities and time.

The new settlement begins small and can succeed or fail.

---

# 18. Rural development and desertification

Rural areas can grow through:

- agriculture;
- processing;
- tourism;
- resource industries;
- connectivity;
- remote logistics;
- new settlement investment.

They can decline through:

- low profitability;
- population outflow;
- climate/resource pressure abstractions;
- loss of services/connectivity;
- industrial/agricultural collapse.

A region may become sparsely populated/desertified economically without deleting its geography.

---

# 19. Macroeconomic events

Events should modify underlying economic conditions, not just display news text.

Candidates:

- drought/poor harvest;
- storm/flood/disaster abstractions;
- energy shock;
- industrial accident;
- infrastructure closure;
- technology breakthrough;
- trade disruption;
- tourism boom;
- major migration;
- financial/company crisis;
- conflict/war macro event.

Events can be inspired by real economic patterns but should remain fictional World Instance events unless a separate live-data feature is explicitly authorized.

---

# 20. Conflict / war boundary

If war exists, it is a macro logistics/economic/world-state event, not tactical combat gameplay.

Possible effects:

- route closures;
- destroyed/degraded infrastructure abstractions;
- reduced production;
- shortages;
- migration/refugee flows;
- trade embargo/disruption abstractions;
- reconstruction demand;
- territorial/state-status transitions.

Stable historical IDs remain even if borders/names/status change.

---

# 21. Country/state disappearance and transformation

The owner vision permits a World Instance where countries can eventually disappear/change.

Research interpretation:

A country does not vanish from the database/geographic history. It can transition to a state such as:

- dissolved;
- merged;
- partitioned;
- successor state;
- inactive/unrecognized gameplay status;
- occupied/controlled abstraction if conflict systems later require it.

Historical identity, economic records and geography remain traceable.

---

# 22. Country prosperity is multi-dimensional

Potential national indicators:

- output/productivity;
- employment;
- household purchasing power;
- infrastructure quality;
- energy/resource security;
- trade balance;
- education/specialist capacity;
- housing/city growth;
- migration balance;
- company formation/investment;
- price/inflation stability if currencies exist;
- logistics connectivity.

No single GDP-like number should fully define gameplay success.

---

# 23. Sparse-map economic fidelity

Because only selected cities/localities are playable nodes, national economic totals can include aggregated background territory/population/resources.

Representative nodes should act as visible economic hubs, while the simulation can aggregate omitted small settlements into regional demand/supply cohorts.

This allows global coverage without needing tens of thousands of playable cities.

---

# 24. Major unresolved R6 decisions

1. National currencies vs universal currency.
2. Monetary authority and exchange-rate model.
3. Tax/public-budget depth.
4. Which essential infrastructure is ownable vs concession-only.
5. Privatization triggers and auction rules.
6. Country governance/policy simulation depth.
7. War/conflict event frequency and player influence.
8. How borders/state transitions are represented without political controversy or real-world prediction claims.
9. Aggregate omitted-population model between sparse representative nodes.
10. How environmental/resource depletion influences long-run development.

---

## Research rule

**A country becomes rich or poor because its people, industries, infrastructure, resources, trade, education, investment and institutions interact over time. Regional and international logistics connect surpluses to deficits; development can create new settlements and industries; decline can depopulate regions; geopolitical/macroeconomic events alter real economic flows rather than serving as decorative news.**
