# Document Information

Document: GLOBAL_RESOURCE_ECONOMY.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Economy Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09

---

# Global Resource Economy

## Purpose

This document specializes `02_Economy/ECONOMY.md`, `02_Economy/PRODUCTION_AND_TRADE.md`, `04_World/WORLD.md`, `04_World/Physical_Geography/README.md` and `00_Project/GLOBAL_WORLD_ECONOMY_CANON.md`.

It defines how natural resources, productive capacity, country/region/locality demand, companies, logistics and specialist labor connect into one global stock-flow economy.

---

# 1. Resource Authority Boundary

Natural-resource facts must never be inferred from map imagery or visual geography.

A governed resource record distinguishes at minimum:

- resource identity/category;
- occurrence/presence;
- reserve/recoverable quantity where known;
- annual extraction/production where known;
- theoretical potential where relevant;
- installed productive capacity where relevant;
- transport/export capacity;
- geography/resolution;
- source/provenance;
- source year/date;
- measurement value/unit;
- missing/estimated/uncertain status.

These measurements are not interchangeable.

---

# 2. Global Resource Families

The global model may support, as source coverage allows:

- metallic minerals;
- industrial minerals;
- stone/sand/gravel/construction materials;
- fossil energy;
- fresh water;
- forests/biomass;
- agricultural land and agricultural output potential;
- fisheries/marine resources;
- hydropower potential;
- wind potential;
- solar potential;
- geothermal potential;
- other canonically approved resource families.

The economy must not fabricate unavailable quantities merely to make every country self-sufficient.

---

# 3. Geographic Resolution

Resource data can exist at different resolutions:

- global;
- country;
- region;
- basin/deposit/site;
- external economic node.

Country totals must not be spread uniformly across the country.

When only country-level data exist, the simulation may keep the stock/capacity aggregated until a better governed spatial source exists. It must not invent a precise mine/deposit location and present it as factual.

Shared rivers, deposits, fishing areas or basins require allocation semantics to avoid double counting.

---

# 4. Real Baseline vs World Instance State

Source-backed data seed a versioned world baseline.

After World Instance creation, simulation may change:

- extraction rate;
- productive capacity;
- infrastructure;
- inventory;
- ownership/control;
- depletion;
- investment;
- trade relationships;
- prices;
- local settlement development.

Those future values are fictional World Instance state, not current real-world claims.

---

# 5. Extraction and Primary Production

A resource occurrence does not automatically produce usable inventory.

Extraction/harvesting can require:

- capital/project activation;
- site access;
- specialist workforce;
- equipment;
- utilities/energy;
- water where applicable;
- maintenance;
- transport connection;
- storage;
- time;
- authorization/permit abstractions where modeled.

Primary production creates real output inventory and may create waste/by-products/environmental consequences where modeled.

---

# 6. Production Chains

Production transforms governed inputs into outputs.

Examples:

`iron ore + energy + specialists -> steel -> components/machinery/construction`

`timber -> lumber/pulp -> furniture/paper/packaging`

`grain -> flour -> processed food -> merchant -> household`

`crude feedstock -> refined products -> transport/industrial consumption`

`agricultural inputs + land + water + labor -> crop/livestock output -> processing -> market`

Each recipe/process may require:

- input quantities;
- people/specializations;
- equipment/facility;
- utilities;
- time;
- maintenance;
- storage;
- output capacity;
- transport access.

Recipes are gameplay abstractions and need not reproduce full industrial engineering complexity.

---

# 7. Country and Regional Production Profiles

Country/region profiles summarize, without creating new truth:

- resource stocks/potential;
- active extraction;
- manufacturing/processing capacity;
- agriculture/food capacity;
- energy/water conditions;
- workforce/specialists;
- infrastructure;
- storage/logistics;
- domestic consumption;
- imports/exports;
- deficits/surpluses;
- investment pipeline.

A country's economy should therefore differ causally from another country's rather than only visually.

---

# 8. Need and Demand by Place

Demand should vary by real simulated conditions such as:

- population;
- household consumption;
- income/economic activity;
- climate/season;
- local production requirements;
- construction;
- transport/fleet usage;
- infrastructure maintenance;
- industrial specialization;
- tourism;
- education/research institutions;
- healthcare/service demand where modeled;
- shortages/disruptions;
- settlement growth.

Do not hardcode one universal city-demand profile.

A rural agricultural locality, mining region, port city, university center and large metropolitan economy require different product/service mixes.

---

# 9. Deficit, Surplus and Trade

Trade is caused by spatial imbalance.

`local supply < legitimate need -> deficit`

`local supply > committed/local need -> available surplus`

Deficit can be met through:

- local production expansion;
- regional transfer;
- national transfer;
- import;
- substitution where canonically valid;
- reduced consumption/shortage consequences.

Surplus can support:

- storage;
- regional/national distribution;
- export;
- processing;
- strategic reserve;
- waste/loss if mishandled.

Trade opportunity must use real stock/capacity, not fake mission demand.

---

# 10. Logistics and Physical Flow

Goods move through custody/transport chains.

Flows may use:

- walking/last mile;
- bicycle/light transport;
- road freight;
- rail;
- river/sea shipping;
- air cargo;
- drone where appropriate;
- multimodal combinations.

Strategic aggregation may summarize inactive flows, but conserved inventory/ownership/capacity must remain equivalent.

Transport cost, time, congestion, reliability, route access and infrastructure capacity affect which trade opportunities are viable.

---

# 11. Companies as Economic Actors

Companies arise around opportunity and capability.

Company categories may include:

- extraction;
- farming/forestry/fisheries;
- processing/manufacturing;
- energy/utilities;
- construction;
- logistics/transport;
- warehousing;
- wholesale/retail;
- maintenance/technical services;
- education/training;
- research/technology;
- financial/service sectors where later modeled.

A locality does not receive every company type by default.

Company formation, entry, survival and growth depend on market need, capital, people, infrastructure, competition and operating conditions.

---

# 12. Specialist Labor and Production

A facility's productive capacity may be constrained by required specialists.

Examples include:

- engineers;
- mechanics;
- operators;
- maritime/rail/aviation specialists;
- agricultural specialists;
- maintenance personnel;
- quality/safety roles where modeled;
- research specialists;
- managers/dispatch/procurement roles.

An expensive facility without sufficient specialist capacity can remain underused or idle.

Education, migration and recruitment therefore directly affect production and regional economic growth.

---

# 13. Education and Research as Economic Inputs

Education/research nodes consume money/resources/services and produce specialist/research capacity.

They can affect:

- local labor supply;
- company capability;
- technology availability;
- productivity;
- business formation;
- student/specialist migration;
- housing/services;
- settlement growth.

A country/region with a rare specialization can become globally important even when it lacks a particular raw resource.

---

# 14. Settlement Feedback

Economic activity changes settlements.

Examples:

`mine -> access road -> jobs -> housing -> services -> town`

`port expansion -> trade -> warehouses -> specialists -> population -> city growth`

`university/research hub -> students/specialists -> services/startups -> regional development`

`factory closure -> unemployment -> population outflow -> lower demand -> decline`

Settlement state then changes future demand, labor availability and company opportunity.

---

# 15. Construction and Infrastructure Demand

Roads, housing, factories, warehouses, schools and infrastructure must consume governed materials/capacity where those systems are active.

Construction may create demand for:

- aggregates;
- cement/concrete abstractions;
- steel;
- timber;
- machinery;
- fuel/energy;
- specialist labor;
- transport;
- utilities.

Building an asset therefore creates upstream economic opportunity before the asset begins creating downstream value.

---

# 16. Global Trade Corridors

Persistent high-volume flows can support or justify investment in:

- highways;
- rail corridors;
- river/sea routes;
- ports;
- airports;
- warehouses/hubs;
- pipelines/utility corridors where modeled.

Infrastructure in turn changes route cost/capacity and can redirect trade.

No corridor should exist as a decorative animated line without authoritative flow behind it when presented as economic truth.

---

# 17. Prices

Prices may respond to a governed combination of:

- local inventory;
- legitimate demand;
- production cost;
- energy/input cost;
- transport cost;
- capacity;
- competition;
- contract terms;
- scarcity/surplus;
- disruption;
- later currency/tariff abstractions.

Disconnected price systems must not create infinite arbitrage.

---

# 18. Strategic Resilience and Dependency

Regions/countries may depend on external inputs.

Dependency is a strategic logistics/economic condition, not a permanent griefing mechanic.

Critical categories need recovery/counterplay such as:

- alternative suppliers;
- substitution;
- strategic reserve;
- new productive investment;
- infrastructure expansion;
- public/NPC baseline capacity where necessary for playability.

Supply shock should create opportunity and consequence without irreversibly destroying the world.

---

# 19. Source Research Program

Global resource/economic baseline research should proceed by source family and provenance, not by manually invented country tables.

Each source integration must document:

- publisher/source authority;
- license/use boundary;
- retrieval/version date;
- geographic resolution;
- measurement semantics;
- missing-data handling;
- transformation method;
- validation/double-counting controls.

The resource research authority provides evidence; gameplay economy authority decides how source evidence becomes simulation input.

---

# 20. Acceptance Proof

The first end-to-end global resource/economy proof should demonstrate:

1. one governed resource or agricultural input at a real geographic level;
2. one legitimate extraction/production node;
3. required specialist/infrastructure inputs;
4. output inventory;
5. one locality/region with legitimate deficit;
6. logistics movement of the product;
7. settlement/economic consequence;
8. save/reload conservation;
9. the same contract working in more than one country/locality.

---

# Canonical Rule

**Natural resources, production, labor, education, infrastructure, demand and logistics form one global stock-flow economy. Countries and regions differ because their governed resource, population, specialist and infrastructure conditions differ; products move because real deficits and surpluses exist; and economic activity can physically build, sustain or shrink settlements.**

---

End of Document
