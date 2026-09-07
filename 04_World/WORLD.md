# Document Information

Document: WORLD.md
Project: DROPi Tycoon
Version: 2.0.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# World System

## Purpose

This document defines the canonical living-world simulation of DROPi Tycoon.

The world connects geography, people, companies, production, logistics, infrastructure, markets, time, weather, migration and events into one persistent economic society.

The world must remain understandable at every scale, from one courier to a global multimodal network.

---

# 1. World Hierarchy

The player-facing hierarchy is:

**Global -> Country -> First-order Administrative Region -> Representative Locality / External Economic Node -> Detailed Local Scene.**

See `04_World/MAP.md` for the map specialization.

The current detailed city remains one local scene inside this larger hierarchy; it is not the entire world.

---

# 2. Active Simulation Principle

World scale is hierarchical.

High-frequency simulation is reserved for the active detailed area and current route context.

Lower-frequency strategic state represents:

- countries;
- regions;
- inactive localities;
- external industrial/agricultural nodes;
- global trade;
- migration;
- national development;
- long-distance cargo flows.

No implementation may require the entire planet to be fully instantiated every frame.

---

# 3. World Time

The world has authoritative game time.

Time must support several scales without forcing one subsystem to update at another subsystem's frequency:

- **local clock** — day/night and time-of-day behavior;
- **operating day** — deliveries, businesses, wages, inventories and routine demand;
- **week/market cycle** — contracts, recurring trade and short economic trends;
- **season** — agriculture, tourism, weather and broader demand shifts;
- **year/long cycle** — demographics, construction, industrial development and national evolution.

The exact real-time-to-game-time ratio is a balancing/configuration decision, not fixed by this document.

Pausing, speed controls and offline/low-frequency catch-up may be introduced only through tested game rules.

---

# 4. Day and Night

Day/night is world state, not only a lighting effect.

Time of day may influence:

- traffic;
- customer demand;
- opening hours;
- workforce availability;
- industrial shifts;
- nightlife/service demand;
- road capacity;
- visual lighting and ambience.

Detailed local scenes should visibly reflect time when the rendering system supports it.

---

# 5. Population and Workforce

Population is an economic input and consequence.

Localities and regions may track summarized population and workforce state including:

- residents;
- available workers;
- qualified specialists;
- tourists/temporary visitors;
- migration pressure;
- housing capacity;
- employment demand.

Specialists are strategic resources. Availability of trained people may gate advanced production, research, infrastructure and transport capability.

The simulation must not base employment value or gameplay advantage on protected personal traits. Diversity is represented visually and socially without discriminatory mechanics.

---

# 6. Migration and Tourism

People may move between localities, regions and countries in response to simulated conditions such as:

- jobs and wages;
- housing and services;
- economic growth/decline;
- specialist demand;
- infrastructure;
- environmental conditions;
- major world events;
- tourism attractiveness.

Migration can change demand, labor supply, architecture pressure and business opportunities.

Large migration events may occur in advanced simulation, but must remain game abstractions and not claims or predictions about real populations.

---

# 7. Urban and Rural Development

A locality can grow when its economy can support more activity.

Growth may depend on combinations of:

- food supply;
- energy;
- construction materials;
- employment;
- housing;
- logistics access;
- public/service capacity;
- industrial output;
- specialist availability;
- trade connectivity;
- investment.

Visible consequences may include:

- new houses;
- denser architecture;
- new commercial buildings;
- new factories/services;
- expanded roads and utilities;
- additional population;
- more diverse architecture and neighborhoods.

Rural areas can grow through agriculture, resource extraction, processing, tourism, specialist industry and improved connectivity rather than becoming small copies of cities.

---

# 8. New Localities and Frontier Development

Advanced world simulation may create new settlements in eligible undeveloped territory.

A new locality requires a plausible economic foundation, such as:

- resource access;
- transport connectivity;
- employment/industry;
- housing/infrastructure investment;
- population inflow;
- national/regional development capacity.

New cities must emerge from world rules, not arbitrary random placement.

---

# 9. Economic and Industrial Geography

Not all economic activity belongs inside a locality.

External economic nodes may exist in rural, coastal, river, mountain, desert or industrial territory.

Examples include farms, mines, steelworks, paper mills, chemical plants, refineries, power plants, industrial ports, logistics terminals and large processing complexes.

These nodes participate directly in supply chains and logistics demand.

See `02_Economy/PRODUCTION_AND_TRADE.md`.

---

# 10. Country Development

Countries are dynamic world entities.

A country's long-term state may respond to:

- productive output;
- trade;
- infrastructure;
- energy/resource security;
- food availability;
- workforce/specialists;
- innovation;
- logistics capacity;
- population trend;
- tourism/services;
- major events;
- fiscal/financial abstractions where implemented.

A country may become more prosperous, more connected and more urbanized, or may decline through prolonged economic, demographic, infrastructure or environmental pressure.

Country growth must be a consequence of multiple systems, not a single score.

---

# 11. National Currency

Advanced global economy may model national game currencies and exchange-rate pressure.

Currency strength may respond to a basket of fictionalized economic fundamentals such as productivity, trade, stability, demand, reserves/liquidity abstractions, inflation and confidence.

No exchange-rate mechanic is required to reproduce live real-world markets exactly.

Company Money remains the normal gameplay accounting resource unless a later economy design explicitly activates multi-currency settlement.

---

# 12. World Events

Events may operate at local, regional, national or global scale.

Examples include:

- festivals and tourism surges;
- harvest conditions;
- industrial openings/closures;
- strikes or workforce shortages as fictional simulation events;
- infrastructure projects/failures;
- weather/climate events;
- commodity shortages/surpluses;
- financial/economic cycles;
- epidemics/health emergencies only as high-level logistics/economy abstractions;
- border/route disruptions;
- migration waves;
- geopolitical conflict/war as advanced macro simulation.

Events must create logistics/economic decisions and recovery paths rather than arbitrary punishment.

The game may be inspired by recognizable real-world event categories, but generated world events must not be presented as forecasts or exact reenactments of current real conflicts.

---

# 13. War and State Change

Advanced world instances may simulate geopolitical conflict at a macro strategic level.

This is not a tactical combat game.

Possible world consequences include:

- route closures;
- damaged capacity;
- displaced population;
- commodity shortages;
- emergency logistics demand;
- changing trade access;
- changes in political control/state status.

A country's political entity may become inactive, merge, split or later re-emerge inside a fictional world instance. The physical land geography remains; historical state is retained for world history.

These outcomes are fictional simulation results and must not be represented as predictions about real countries.

---

# 14. Decline and Recovery

Countries, regions and localities may decline through combinations of:

- unemployment;
- supply shortages;
- loss of industry;
- weak connectivity;
- population outflow;
- environmental degradation;
- prolonged disruption;
- infrastructure collapse.

Decline may include shrinking population, abandoned buildings/industry and reduced demand.

Normal decline must preserve meaningful recovery paths through investment, trade, infrastructure, migration, new industry and logistics access.

---

# 15. World Instances / Epochs

DROPi Tycoon can host multiple persistent global economies at the same time.

A new World Instance begins from a versioned baseline world seed and develops independently.

Launching a new world does **not** reset or delete older worlds.

Older worlds may remain active as mature/legacy economies while new players or returning players may choose a newer world with a younger economy.

Cadence may be monthly, seasonal or longer and remains a live-operations balancing decision.

See `06_Technical/WORLD_INSTANCES.md`.

---

# 16. Visible Consequences

Important changes should become visible at the appropriate scale.

Examples:

- factory growth appears on the regional/local map;
- city population growth changes built density;
- new roads/rail/hubs appear;
- rural prosperity increases farms/processing activity;
- industrial decline leaves reduced activity/closed sites;
- migration changes pedestrian/workforce activity;
- global trade changes map flows;
- new settlements appear only after their world-state prerequisites are met.

---

# Canonical Rule

**DROPi Tycoon is a persistent evolving world economy. Time, people, production, transport, trade, infrastructure and events continuously alter the geography of opportunity, while high-frequency simulation remains bounded to the active area and strategic world state evolves at lower frequencies.**

---

End of Document