# Document Information

Document: WORLD.md
Project: DROPi Tycoon
Version: 2.1.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Living Global World System

## Purpose

DROPi Tycoon is a persistent global economic/logistics society. Geography, people, companies, productive assets, trade, infrastructure, time, migration, tourism, specialists, consumption, production, waste, and events evolve inside one coherent world model.

The current detailed city is one local scene inside this hierarchy; it is not the whole world.

This document is reconciled with `00_Project/PHASE1_GAME_ARCHITECTURE_DECISION_BASELINE.md`.

---

# 1. World Hierarchy

**Global -> Country -> First-order Administrative Region -> Representative Locality / External Economic Node -> Detailed Local Scene.**

Only the active detailed area and current operational context run at high frequency. Countries, inactive regions, inactive localities, external producers and global trade persist as lower-frequency strategic state.

All countries can be strategically represented without requiring every real settlement to exist as a high-detail scene.

---

# 2. Multi-Resolution Simulation

World scale is achieved by simulation resolution, not by attempting to simulate every person at frame rate.

Typical bands are:

- **active player scene** — detailed movement/interaction/high frequency;
- **important nearby NPCs/operations** — individual or operational simulation;
- **local production/inventory/markets** — economic ticks;
- **city/regional population** — cohorts, stocks and flows;
- **country/global trade** — strategic ticks;
- **demographics/urbanization/state evolution** — slow structural cycles;
- **inactive scopes** — deterministic summarized catch-up.

Aggregation must conserve equivalent economic truth: population cohorts still consume, work, migrate, and affect supply/demand even when individuals are not rendered.

---

# 3. World Time

The world has authoritative game time with several responsibilities:

- **local clock** — day/night and time-of-day behavior;
- **operating day / shifts** — routine work, deliveries, business operation, inventories and production;
- **week/market cycle** — recurring contracts and short economic trends;
- **season** — agriculture, tourism, weather and broader demand shifts;
- **year/slow cycle** — demographics, construction, industrial and national development.

The real-time-to-game-time ratio is balancing/configuration and is not fixed here.

Day/night may influence traffic, customer demand, opening patterns, industrial shifts, employee availability and visible ambience.

World time may continue while individual players are offline. Catch-up must be causal and idempotent: legitimate fixed obligations/basic consumption can continue, but active-use costs and starter wages do not occur without the underlying activity.

---

# 4. Population, Households and Workforce

Localities, regions and countries may track summarized:

- residents/households;
- workforce;
- available jobs;
- qualified specialists;
- tourists/temporary visitors;
- migration pressure;
- housing/service capacity;
- consumption requirements;
- income/employment conditions.

People/households are economic actors. They may consume goods/services, require housing/utilities, supply labor, create waste, and change local demand.

Specialists are productive strategic resources. Advanced industry, transport, research and infrastructure may require appropriate trained people in addition to money and equipment.

Visual/social diversity must not become a discriminatory economic mechanic based on protected personal traits.

---

# 5. Migration and Tourism

People may move between localities, regions and countries in response to fictional world conditions such as:

- employment and wages;
- housing and services;
- economic opportunity or decline;
- specialist demand;
- infrastructure and connectivity;
- environmental conditions;
- tourism attractiveness;
- major events.

Migration changes demand, workforce supply, housing pressure, architecture and business opportunity.

Large migration waves can exist as advanced game events but are not predictions about real populations.

---

# 6. Urban and Rural Metabolism

A locality grows only when multiple supporting systems can sustain growth, for example:

- food and water;
- energy/utilities;
- construction materials;
- jobs/income;
- housing;
- transport/logistics access;
- public/service capacity;
- industry/commerce;
- specialists;
- trade connectivity;
- investment;
- waste collection/treatment where modeled.

Visible consequences may include new housing, denser/diverse architecture, commercial growth, industry, roads, utilities, services, increased population activity, shortages, closures, recovery or construction.

Rural localities develop through agriculture, livestock, forestry, extraction, processing, tourism, specialist industry and connectivity while preserving a distinct rural identity rather than becoming small copies of cities.

Roughly five meaningful last-mile competitors is an urban design target and normally one to two is a rural target. This is shaped by local demand/capacity and entry/exit rather than a simplistic permanent hard counter.

---

# 7. New Settlements

Advanced world simulation may create new settlements in eligible undeveloped territory.

A new town/city requires a plausible foundation such as resources or productive activity, employment, transport access, infrastructure/housing investment and population inflow.

New settlements emerge from world rules, not arbitrary random placement.

---

# 8. Productive Geography

Economic activity is not limited to towns.

Large farms, mines, steelworks, paper mills, chemical/fertilizer plants, refineries, energy sites, processing facilities, warehouses and freight terminals may exist as independent external economic nodes.

They consume inputs, use workforce/infrastructure, create outputs/inventory/waste, and generate physical logistics demand.

Eligible productive assets may later be sold, auctioned, concessioned, invested in or acquired under Business/Economy rules.

---

# 9. Infrastructure Ownership and Access

World infrastructure may use public, private, concession or mixed ownership.

Examples include roads/tolls, rail terminals, ports, airports, warehouses, utilities and other shared facilities.

Private operation may produce capacity/cost/revenue advantages, but essential corridors/utilities require fair-access/counterplay safeguards. One actor must not permanently softlock a city/country by denying essential access.

Infrastructure condition and capacity should affect economic opportunity and visible world state.

---

# 10. Travel and Presence

Strategic maps are navigation/planning layers, not free economic teleportation.

A player's physical presence changes through unlocked transport/infrastructure such as:

- walking/local streets;
- private/contracted road transport;
- public transport;
- rail;
- air;
- river/sea travel;
- later advanced transport.

Travel may use time compression for usability, but appropriate time/cost/access consequences remain.

---

# 11. Country Development

Countries are dynamic entities whose long-term condition may respond to a basket of:

- productive output and productivity;
- trade;
- transport/infrastructure;
- food/water/energy availability;
- workforce and specialists;
- innovation;
- population trend;
- tourism/services;
- logistics capacity;
- investment/public-service capacity where modeled;
- major events and disruptions.

Countries may become more prosperous, connected and urbanized or may decline through sustained demographic, economic, infrastructure or environmental pressure.

No single score should determine national success.

---

# 12. National Currency — Staged Advanced System

The architecture must support a future advanced economy with national game currencies and exchange-rate pressure.

Currency strength may respond to fictionalized fundamentals such as productivity, trade, stability, inflation/liquidity abstractions and confidence. The mechanic does not need to reproduce live real-world exchange rates.

`Personal Money` and `Company Money` are ownership/accounting domains; they may later carry currency denomination.

A common gameplay denomination may remain in use until multi-currency settlement is separately implemented and approved.

---

# 13. World Events

Events may operate at local, regional, national or global scale.

Possible categories include:

- festivals and tourism surges;
- harvest variation;
- severe weather/environmental disruption;
- industrial openings/closures;
- infrastructure projects/failures;
- commodity shortages/surpluses;
- workforce shortages;
- economic/financial cycles;
- route or border disruption;
- migration waves;
- advanced geopolitical conflict/war as macro simulation;
- recovery/reconstruction campaigns.

Events must alter the same logistics/economic state used by normal gameplay and provide understandable consequences and recovery paths.

They may be inspired by recognizable real-world event categories but must not be presented as forecasts or exact reenactments of current real conflicts.

---

# 14. War and State Change

DROPi Tycoon is not a tactical combat game.

Advanced geopolitical conflict may instead cause macro consequences such as:

- route closures;
- reduced or damaged infrastructure capacity;
- displaced population;
- emergency logistics demand;
- commodity shortages;
- changing trade access;
- changes in political control/state status.

Inside a fictional World Instance, a political state may become inactive, merge, split or later re-emerge. Land geography and stable historical identifiers remain preserved so company, cargo and world history are not orphaned.

These are fictional simulation outcomes, not predictions about real countries.

---

# 15. Decline and Recovery

Regions/localities/countries may decline through combinations of unemployment, supply loss, industrial collapse, weak connectivity, population outflow, environmental degradation, inadequate services and prolonged disruption.

Visible consequences may include abandoned facilities/housing, reduced services, lower production, shortages and shrinking demand.

Normal decline must preserve meaningful recovery through trade, investment, migration, new industry, specialists, infrastructure, public/community projects and logistics access.

---

# 16. Bounded NPC Continuity

A World Instance must remain playable when human population is low.

NPC/simulated actors may provide a bounded baseline of:

- employers;
- workers;
- consumers;
- merchants;
- suppliers;
- logistics counterparties;
- service/infrastructure operation.

They obey real costs, inventories, production/consumption, capacity and authority rules.

NPC fallback cannot create infinite free money, inventory, demand or productive capacity.

Human and NPC economic roles should use compatible semantics so human participation can replace/compete/cooperate with simulation without creating a second economy.

---

# 17. Persistent World Instances

DROPi Tycoon may operate multiple independent global economies at the same time.

A new **World Instance** starts from a versioned baseline seed and evolves independently. Opening a new world does not reset or delete older worlds. Mature worlds may remain as persistent legacy economies with their own history.

One economic hero exists per account per World Instance.

Fresh worlds isolate economic power by default. Money, productive qualifications/capability, assets, shares, reputation, companies, inventory, contracts and infrastructure control are world-local unless a later owner-approved exception exists.

Non-economic account settings/cosmetics/history may follow the account where authorized.

Launch cadence may eventually be monthly, seasonal, multi-month or annual according to live-operations balance; no cadence is fixed yet.

A logical World Instance is not one physical server and may span many services/shards at scale.

See `06_Technical/WORLD_INSTANCES.md`.

---

# 18. Human Identity Across World Time

The human player identity persists through normal years/seasons of a World Instance.

NPC demographics may age/change, and the player's current economic position may improve or collapse, but normal world time does not permanently kill/delete the human player's economic identity.

Bankruptcy, housing loss or company failure may create severe setbacks without erasing identity/history/valid earned capability.

---

# 19. Visible Consequences

Important changes should become visible at the appropriate map layer:

- supplied/empty shops and facilities;
- construction progress;
- factory/farm growth or closure;
- new/expanded/degraded infrastructure;
- changing trade corridors;
- city density and architecture growth;
- rural prosperity or decline;
- migration and workforce activity;
- cleanliness/waste/recovery where modeled;
- new settlements;
- national development/decline;
- global freight shifts.

The visible consequence should derive from the same authoritative state as the economy whenever practical.

---

# 20. Performance Rule

World scale comes from hierarchical simulation frequency and deterministic summarized catch-up.

Do not hardcode `one world = one machine`, `one country = one server`, or `every person = a continuously simulated entity`.

Android/mobile performance remains a hard client constraint; global simulation authority must not require rendering/simulating the entire world on-device.

---

# Canonical Rule

**DROPi Tycoon is a persistent evolving global economy. People and organizations consume, work, produce, trade, travel and create waste; infrastructure and specialists shape opportunity; cities/countries can grow or decline; multiple independent World Instances preserve separate economic histories; and detailed simulation remains bounded to the player's active context without losing causal economic truth.**

---

End of Document
