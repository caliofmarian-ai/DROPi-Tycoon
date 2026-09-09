# Document Information

Document: WORLD.md
Project: DROPi Tycoon
Version: 2.2.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09

---

# Living Global World System

## Purpose

DROPi Tycoon is a persistent global economic/logistics society. Geography, resources, people, companies, productive assets, education, research, trade, infrastructure, time, migration, consumption, production, waste and settlement development evolve inside one coherent World Instance.

This document is reconciled with `00_Project/GLOBAL_WORLD_ECONOMY_CANON.md`, `04_World/SETTLEMENT_EVOLUTION.md`, `02_Economy/GLOBAL_RESOURCE_ECONOMY.md` and the approved Phase-1 architecture baseline.

Brăila is a calibration/reference locality, not the whole world, not the universal spawn and not the universal architectural template.

---

# 1. World Hierarchy

Canonical hierarchy:

**Global -> Country -> Administrative Region -> Locality / External Economic Node -> District/Area where present -> Detailed Local Scene.**

All supported countries and governed localities may exist as stable world identities while detailed rendering/simulation remains bounded to active context.

The world must not confuse:

- existence in the catalog/world identity graph;
- data/source readiness;
- settlement development;
- current runtime activation;
- release verification.

---

# 2. Multi-Resolution Simulation

World scale is achieved through hierarchical simulation frequency.

Typical bands:

- active hero/local scene — frame/local frequency;
- nearby important actors/operations — local operational simulation;
- local production/inventory/market — economic ticks;
- settlement/regional population/workforce — cohort/stock-flow ticks;
- country/global trade/resources — strategic ticks;
- demographics/urbanization/research/infrastructure — slow cycles;
- inactive scopes — deterministic summarized catch-up.

Aggregation must conserve equivalent economic truth.

---

# 3. World Time

The world has authoritative game time for:

- local clock/day-night;
- shifts/operating day;
- week/market cycles;
- seasons;
- years/slow structural development.

World time may continue while players are offline where causal rules permit.

Catch-up must be deterministic/idempotent. Active-use costs and wages do not occur without the underlying activity.

---

# 4. Stable Locality Identity and Dynamic Development

A locality can exist globally without being a mature city.

Conceptual settlement states:

`LATENT / UNDEVELOPED -> RURAL_POINT -> HAMLET -> VILLAGE -> SMALL_TOWN -> TOWN -> CITY -> LARGE_CITY / METROPOLITAN`

Exact enum names/thresholds are implementation/balance details.

Locality ID is persistent. Settlement class is dynamic World Instance state.

A low-tier locality may contain only undeveloped land, a farm/resource site, a road junction or 1–2 isolated buildings. It should not be rendered as a fake city.

Development may grow or decline over time.

---

# 5. Economy-Driven Urbanization

Settlement development is caused by legitimate world state.

Canonical feedback loop:

`resource / demand / route opportunity`
`-> company/institution investment`
`-> extraction / farming / production / infrastructure / services`
`-> jobs`
`-> population + specialists`
`-> housing + utilities`
`-> commerce + services + education`
`-> larger settlement footprint`
`-> new demand + firms + professions + trade`
`-> further opportunity`

Money alone cannot instantiate a city.

Projects can require materials, specialists, equipment, infrastructure, utilities, land/site access, logistics and time.

---

# 6. Global 10x Playable-Distance Scale

All governed playable settlements use one reusable scale baseline:

**`CITY_PLAYABLE_DISTANCE_SCALE_BASELINE = 10`**

Brăila is the first calibration city.

The rule scales governed intra-settlement positional separation/traversal, not every object dimension.

A hamlet remains small because its developed network is small; a metropolis is larger because its governed urbanized footprint/network is larger.

New streets/districts/facilities created by development inherit the same global scale automatically.

Android performance is preserved through streaming, chunking, sectors, LOD, culling and bounded simulation rather than shrinking settlements.

---

# 7. Population, Households and Workforce

Localities/regions/countries may track summarized:

- residents/households;
- workforce;
- jobs;
- qualified specialists;
- students/trainees;
- tourists/temporary residents;
- migration pressure;
- housing/service capacity;
- consumption requirements;
- employment/income conditions.

People are economic actors: they consume, work, migrate, require housing/services, create waste and change demand.

Specialists are productive strategic capacity.

---

# 8. Education, Training and Research

Education and research are world infrastructure and economic systems.

Institutions may include:

- schools;
- vocational/training centers;
- universities;
- academies;
- company training facilities;
- specialist institutes;
- laboratories/research centers.

Programs can be geographically specific.

A player/company may need to travel, relocate, recruit or sponsor someone in another region/country to obtain a rare specialization.

Education can require theory, practice, supervision, assessment, facilities/equipment, time and money.

Research may later unlock technology/process/infrastructure improvements through governed specialist/facility/funding requirements.

See `01_GameDesign/EDUCATION_SPECIALIZATION_AND_GROUP_CAPABILITY.md`.

---

# 9. Group and Company Specialist Capacity

Companies/groups may need teams with complementary qualifications.

Advanced capability can require:

- qualified people;
- equipment;
- facilities;
- infrastructure;
- materials;
- utilities;
- money;
- authorization/access;
- time.

A company can sponsor a member's education through conserved Personal/Company Money transactions.

The qualification remains the person's capability unless a separate corporate research/technology asset is defined.

If a required specialist leaves, affected company capability may pause/degrade until replacement capacity exists.

---

# 10. Migration and Player Origin

A new player does not silently begin in Brăila.

The world distinguishes:

- origin/nationality context where collected;
- home country/locality;
- starting country/locality;
- current country/locality;
- relocation history.

A player may begin in an appropriate supported locality in their own country under onboarding rules.

If the starting locality is currently low-tier, gameplay reflects its real current settlement state.

Migration can occur through employment, study, company expansion, personal choice, investment or world events.

---

# 11. Natural Resources

Natural resources are governed world inputs and cannot be inferred from map art.

Families include where supported:

- minerals/construction materials;
- fossil energy;
- fresh water;
- forests/biomass;
- agricultural land/output potential;
- fisheries/marine resources;
- renewable-energy potential.

Occurrence, reserve, production, potential and installed capacity are distinct measurements.

Source-backed real-world data seed the baseline. World Instance extraction, depletion, ownership, capacity and trade are simulated future state.

See `02_Economy/GLOBAL_RESOURCE_ECONOMY.md` and `04_World/Physical_Geography/README.md`.

---

# 12. Productive Geography

Economic activity is not limited to towns.

External nodes may include:

- farms;
- mines/quarries;
- forestry/fisheries sites;
- power/energy sites;
- steelworks;
- paper/pulp mills;
- chemical/fertilizer plants;
- refineries;
- processors;
- warehouses;
- freight terminals;
- utilities/waste/recycling sites.

These nodes use workforce/specialists, inputs, infrastructure, time and capacity; they create outputs, jobs, logistics demand and consequences.

A productive node may later stimulate a settlement around it.

---

# 13. Production, Demand and Trade

One stock-flow economy governs all scales.

Canonical economic chain:

**Need -> Demand/Procurement -> Order/Contract -> Inventory/Cargo/Labor -> Work/Production/Transport -> Settlement -> Consumption/Use/Output -> Waste/New Need -> Visible Consequence.**

Production requires real inputs/capacity/specialists/equipment/utilities/time.

Trade arises from real deficit/surplus and transport access.

Products do not teleport between markets.

---

# 14. Country and Regional Development

Countries/regions evolve through combinations of:

- resources;
- productive output/productivity;
- trade;
- infrastructure;
- energy/water/food;
- workforce/specialists;
- education/research;
- population/migration;
- services/tourism;
- logistics capacity;
- investment;
- events/disruptions.

No single score determines success.

Country/regional summaries cannot invent goods/money independent of lower-level or explicitly aggregated stocks/flows.

---

# 15. Companies and Business Ecosystems

Company ecosystems differ by place.

A port city, mining region, agricultural area, university center, industrial settlement and financial/service center should create different combinations of firms/jobs.

Company opportunity responds to:

- population/need;
- resources;
- production;
- trade;
- infrastructure;
- specialist availability;
- education/research;
- competition;
- investment.

NPC/simulated firms provide bounded continuity and obey the same economy.

---

# 16. Infrastructure Ownership and Access

Infrastructure may be public, private, concession-operated or mixed.

Examples include roads, rail, ports, airports, warehouses, utilities and other shared facilities.

Private operation can create revenue/capacity advantages but essential systems require fair-access/counterplay safeguards.

Infrastructure can stimulate settlement development and redirect trade.

---

# 17. Travel and Presence

Strategic map navigation does not teleport people/cargo.

Presence changes through legitimate transport/infrastructure with time/cost/capacity.

Modes may include walking, road/public transport, rail, air, river/sea and later advanced transport.

Time compression is allowed for usability without erasing economic consequence.

---

# 18. Local Visual Identity

All localities share the canonical art style:

**Stylized 3D Pre-Rendered Mobile World / premium mobile tycoon / elevated soft-isometric or 3/4.**

They do not share identical architecture.

Visual identity should reflect governed local/regional reality through architecture, street pattern, density, materials, vegetation, climate, industry/agriculture and infrastructure.

Art pipeline:

`Global DROPi Style -> Regional/Local Archetype -> Locality-Specific Variants -> Runtime Derivatives`

Missing required assets may be generated, cut out, cleaned, optimized and integrated under the governed asset/provenance pipeline.

---

# 19. World Events

Events may operate locally, regionally, nationally or globally.

Categories can include:

- festivals/tourism;
- harvest variation;
- severe weather;
- industry openings/closures;
- infrastructure projects/failures;
- shortages/surpluses;
- workforce shortages;
- economic cycles;
- route/border disruption;
- migration waves;
- recovery/reconstruction;
- later macro geopolitical conflict as non-tactical simulation.

Events alter the same economy/logistics state as normal gameplay and require understandable recovery/counterplay.

---

# 20. Decline and Recovery

Localities/regions/countries can decline through combinations of unemployment, lost supply, industrial closure, weak connectivity, population outflow, infrastructure degradation or prolonged disruption.

Visible consequences can include closures, underused housing/facilities, lower services, reduced production and shrinking demand.

Recovery remains possible through new industry, trade, education, specialists, infrastructure, migration and investment.

---

# 21. Persistent World Instances

Each World Instance is an independent global economic history.

A world begins from a versioned baseline and evolves independently.

Money, assets, companies, inventory, contracts, productive capability, settlement state, infrastructure and trade are world-local by default.

One economic hero exists per account per World Instance.

A logical World Instance is not one physical server.

---

# 22. Visible Consequences

Important world changes should become visible at the appropriate zoom:

- construction progress;
- new/expanded roads;
- farms/factories/warehouses;
- changing inventory/supply state;
- new housing/services;
- schools/research facilities;
- migration/workforce activity;
- new trade corridors;
- settlement growth/decline;
- national/global freight shifts.

The visible state should derive from the same authoritative state as the economy whenever practical.

**Your work leaves a mark.**

---

# 23. Performance Rule

The global world must not require every person, locality or facility to be rendered or simulated at local frequency.

Use hierarchical state, summarized catch-up, streaming, chunking, sector activation, LOD and culling.

Performance can reduce active detail, not economic causality or city-scale truth.

---

# 24. Release Architecture Proof

Before public release can claim a global functional world, prove the full lifecycle across materially different localities:

- Brăila premium calibration city;
- another Romanian locality;
- a non-Romanian European locality;
- a materially different archetype/scale;
- a low-tier settlement that evolves through legitimate economic causes.

Proof includes start locality, semantic zoom, local work/economy, movement/cargo, settlement, story/consequence, persistence/reload, investment/evolution and relocation.

---

# Canonical Rule

**DROPi Tycoon is a persistent global economy in which stable locality identities can begin undeveloped and become villages, towns or cities through real resources, companies, infrastructure, specialists, education, production, trade and migration. All playable settlements inherit one global 10x traversal scale and one art language while preserving locally authentic identity; players and groups can materially reshape the world without bypassing stock-flow, capability or persistence authority.**

---

End of Document
