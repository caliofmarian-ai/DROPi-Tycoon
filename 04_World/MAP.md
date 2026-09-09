# Document Information

Document: MAP.md
Project: DROPi Tycoon
Version: 2.2.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-09

---

# Global Map System

## Purpose

The map is the spatial backbone of DROPi Tycoon. It represents one coherent global logistics/economic world through hierarchical data, semantic zoom and bounded local rendering rather than one giant continuously simulated scene.

Canonical zoom hierarchy:

**Global -> Country -> Administrative Region -> Locality / External Economic Node -> District/Area where present -> Hero.**

The strategic map and the player smartphone/GPS use this same governed hierarchy.

The map is not a teleport menu. It is a world-observation, planning, navigation, trade, migration and travel surface backed by authoritative geography, infrastructure and economic state.

This document is reconciled with `00_Project/GLOBAL_WORLD_ECONOMY_CANON.md` and `04_World/SETTLEMENT_EVOLUTION.md`.

---

# 1. Global Identity Coverage

The world dataset may contain governed identity for all supported countries, administrative regions, localities, strategically important external economic nodes, gateways and corridors.

**Identity coverage is not the same as rendering coverage.**

A locality may exist in the global model while being:

- latent/undeveloped;
- rural;
- a hamlet/village;
- a town/city;
- strategically summarized;
- not currently streamed;
- not yet release-verified for local entry.

The runtime must not load or high-frequency simulate every locality at once.

---

# 2. Global Layer

The maximum zoom-out level represents the planet and supported sovereign-country geography using a versioned real-world-inspired baseline.

At this level the game may show authoritative summaries of:

- countries/borders appropriate to the pinned dataset;
- major freight/trade corridors;
- country demand/supply pressure;
- resource/energy pressure where governed;
- population and migration trends;
- major infrastructure/gateways;
- international flows;
- major events/disruptions;
- player/company influence at aggregated scale.

Decorative movement must not imply economic flow that does not exist in authoritative state.

---

# 3. Country Layer

A country is **not limited to a fixed handful of locality identities**.

All governed locality identities may exist in the country dataset. The country layer may simplify labels/markers for readability by importance, zoom, settlement class, player relevance, economic activity and current events.

This replaces the older interpretation that a normal country is represented only by a maximum set of compass-based locality nodes.

At broad country zoom:

- major cities/towns may be labeled prominently;
- smaller settlements may use small markers or be grouped/hidden until deeper zoom;
- latent/rural localities may appear only when relevant or at deeper zoom;
- strategically important farms, mines, industrial sites, ports, terminals and resource nodes may appear independently of settlement size;
- visible prominence can change as settlements and economies evolve.

A locality that grows economically may become more visually prominent on the country map without changing its stable identity.

---

# 4. Administrative Region Layer

The world model must not hardcode the term `county` globally.

Use a country-neutral first-order administrative region specialized to the real local concept where appropriate, including state, province, county, județ, region, governorate, canton or equivalent.

This layer may summarize:

- population/workforce;
- natural-resource state;
- production;
- inventories/deficits;
- specialist capacity;
- education/research capacity;
- infrastructure;
- trade;
- settlement development;
- company activity;
- migration;
- construction/investment.

Regional aggregation must conserve the same lower-level economy rather than creating independent values.

---

# 5. Locality Identity and Settlement Development

Every governed locality has stable identity independent of settlement class.

Settlement development is dynamic World Instance state, conceptually:

`LATENT / UNDEVELOPED -> RURAL_POINT -> HAMLET -> VILLAGE -> SMALL_TOWN -> TOWN -> CITY -> LARGE_CITY / METROPOLITAN`

Exact labels/thresholds are implementation/balance data.

A locality may decline as well as grow.

At local zoom, presentation must match its current settlement state:

- low-tier places may show undeveloped land, farms, 1–2 isolated houses/buildings, a road junction or a small cluster;
- towns expose more streets, services, commerce and work;
- cities expose districts/areas, broader transport and larger business ecosystems;
- large cities use chunked/sectorized streaming and wider route classes.

Do not fabricate a mature city merely because a locality name exists in the catalog.

---

# 6. Locality Readiness Is Separate From Development

Data/readiness and settlement development are orthogonal.

Recommended readiness lifecycle:

`CATALOGED -> SOURCE_READY -> PLAYABLE_CONTRACT_READY -> RELEASE_VERIFIED`

Recommended settlement lifecycle:

`LATENT -> RURAL_POINT -> HAMLET -> VILLAGE -> TOWN -> CITY -> LARGE_CITY`

A locality can therefore be `SOURCE_READY + HAMLET` or `RELEASE_VERIFIED + VILLAGE`.

A release-supported locality must have truthful entry behavior appropriate to its current development. It does not need to pretend to be a city.

---

# 7. Detailed Local Scene

The local scene contains the highest-fidelity playable space appropriate to the settlement tier, including where present:

- streets/routes;
- buildings/facilities;
- farms/resource sites;
- individual economic nodes;
- local citizens/traffic;
- merchants/employers;
- cargo/inventory interactions;
- company facilities;
- construction;
- utilities/services;
- districts/areas;
- last-mile and local logistics.

Only the active relevant area carries high-frequency rendering/simulation cost.

---

# 8. Global 10x Playable-Distance Baseline

Every governed playable settlement consumes one reusable playable-distance scale authority:

**`CITY_PLAYABLE_DISTANCE_SCALE_BASELINE = 10`**

Brăila is the calibration/reference implementation, not the owner of the scale policy.

The baseline applies to governed intra-settlement positional separation and traversal scale. It does not blindly multiply road widths, doors, building footprints or hero dimensions.

Settlement size remains proportional to its actual governed urbanized footprint and topology.

When economic development creates new streets, districts, factories, farms or housing, the new geometry inherits the same global scale automatically.

---

# 9. Geography Fidelity

DROPi Tycoon is inspired by real geography, not a GIS clone.

Requirements:

- country shapes and relative placement should be recognizable;
- localities use governed real positions where available;
- roads/street identity may use source-backed geometry where quality allows;
- coastlines, rivers, mountains and transport barriers may affect routes;
- geography can be simplified/compressed selectively for gameplay and Android performance without reverting to miniature-board scale;
- source datasets are versioned;
- baseline updates do not silently rewrite existing World Instance history.

Real geography seeds the world. Simulation owns its future.

---

# 10. Global Style, Local Architecture

Every playable locality follows the canonical **Stylized 3D Pre-Rendered Mobile World** art language.

This does not mean every city uses identical buildings.

Visual identity should derive from governed local/regional reality where possible, including:

- architecture families;
- facade/material/roof patterns;
- street form and density;
- vegetation/climate;
- industrial/agricultural character;
- infrastructure;
- locally relevant urban/rural details.

Scalable art pipeline:

`Global Art Style -> Regional/Local Archetype -> Locality-Specific Variants -> Runtime Derivatives`

Missing runtime-required assets may be generated under the approved asset pipeline, then cut out, cleaned, optimized and integrated with provenance.

---

# 11. Natural Resources and Productive Geography

Important economic activity may exist outside settlements.

Examples:

- farms;
- mines/quarries;
- forests;
- fisheries;
- power/energy sites;
- steel/metallurgical facilities;
- paper/pulp mills;
- chemical/fertilizer plants;
- refineries;
- food processors;
- warehouses;
- rail/port/airport cargo facilities;
- utilities/waste/recycling sites.

Map visuals do not establish resource quantity. Resource facts come from the governed resource authority.

External economic nodes may later stimulate nearby settlement development through jobs, roads, housing, services and trade.

---

# 12. Transport by Scale

## Global / International
- sea shipping;
- international air cargo;
- cross-border rail;
- cross-border road freight;
- multimodal gateways.

## National / Regional
- highway/road freight;
- rail;
- domestic air where useful;
- river/sea where geographically valid;
- warehouses/distribution hubs;
- feeder infrastructure.

## Local
- walking;
- bicycle;
- scooter/motorcycle;
- car/van/fleet;
- public transport where modeled;
- drone where unlocked;
- local/final-mile logistics.

Flows run at frequencies appropriate to their scale.

---

# 13. Travel and Presence

Opening/zooming the map does not move the hero or cargo.

Physical/economic presence changes through legitimate transport, infrastructure, time and cost.

Long journeys may use time compression or summarized presentation, but custody/inventory and travel consequence remain authoritative.

Migration/relocation changes `currentLocalityId` only through governed transitions and persistence.

---

# 14. Player Origin and Starting Locality

Brăila is not the universal spawn.

Onboarding distinguishes home/origin, starting locality and current locality.

A player should begin in a supported locality appropriate to the selected/validated origin rules.

If that locality is currently a village or other low-tier settlement in the World Instance, the player begins in that truthful settlement state rather than receiving a hidden Brăila substitute.

Local starter work must adapt to the legitimate local economy.

---

# 15. Strategic Map Information

Map overlays may project authoritative summaries such as:

- product supply/demand;
- inventory/scarcity;
- natural-resource state where governed;
- productive capacity;
- agricultural output;
- energy/water pressure;
- workforce/specialists;
- schools/training/research hubs;
- population/migration;
- settlement development;
- infrastructure;
- trade corridors;
- congestion;
- construction/projects;
- contracts/opportunities;
- events/disruptions.

An overlay is a projection of authoritative state and cannot fabricate economic truth for visual effect.

---

# 16. Economy-Driven Map Evolution

The map evolves because the economy evolves.

Canonical loop:

`resource / need / route opportunity`
`-> company/institution investment`
`-> production/infrastructure/jobs`
`-> population/specialists`
`-> housing/services/commerce`
`-> larger urbanized footprint`
`-> new companies/demand/trade routes`

Players/groups/companies can visibly contribute through construction, production, logistics, education/research investment and infrastructure.

A new road, factory, farm, warehouse, school or district should become visible from the same authoritative state that created its economic effect.

---

# 17. Decline and Recovery

Localities and economic nodes may decline through employer closure, resource depletion, route loss, infrastructure failure, population outflow or prolonged weak demand.

The map can show:

- closed facilities;
- reduced traffic;
- underused buildings;
- stalled construction;
- shrinking settlement prominence;
- disrupted trade.

Recovery through new investment, trade, infrastructure, specialists or migration must remain possible.

---

# 18. World Instance Boundary

Every map belongs to one World Instance.

Shared geography may begin from a common versioned baseline, but settlement class, ownership, prices, production, population, trade, infrastructure, construction and company history belong to that World Instance.

Economic state never silently crosses World Instances.

---

# 19. Performance Rule

Global scale is achieved through hierarchical state, data streaming and bounded simulation.

Use:

- strategic aggregation;
- deterministic catch-up;
- chunks/sectors;
- LOD;
- culling;
- bounded ambient actors;
- locality-scoped asset/data loading.

Do not high-frequency simulate or render every global locality simultaneously.

Performance optimization may reduce active detail; it may not collapse 10x cities back into miniature boards.

---

# 20. Release Proof

Before claiming global-world architecture complete, prove the full lifecycle across materially different localities:

- Brăila premium reference;
- another Romanian locality;
- a non-Romanian European locality;
- a materially different archetype/scale;
- a low-tier settlement that grows from legitimate economic causes.

Proof must include zoom/entry, local work/economy, transport, story/consequence, persistence and relocation without Brăila fallback.

---

# Canonical Rule

**DROPi Tycoon maps a globally identified but dynamically developed world. Every governed locality can exist without being a mature city; settlement prominence and built form evolve from real economic state; all playable growth inherits the global 10x scale; and one shared art language preserves locally authentic architecture, infrastructure and character.**

---

End of Document
