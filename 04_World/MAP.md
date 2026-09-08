# Document Information

Document: MAP.md
Project: DROPi Tycoon
Version: 2.1.0
Status: Canonical
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# Global Map System

## Purpose

The map is the spatial backbone of DROPi Tycoon. It represents one coherent global logistics/economic world at several levels of detail rather than one giant continuously rendered scene.

Canonical zoom hierarchy:

**Global -> Country -> First-order Administrative Region -> Representative Locality / External Economic Node -> Detailed Local Scene.**

The strategic map and the player smartphone/GPS must use this same hierarchy.

The map is not an omniscient teleport menu. It is a world-observation, planning, navigation, trade and travel surface backed by real simulated geography, infrastructure and economic state.

---

# 1. Global Layer

The maximum zoom-out level represents the whole planet and all supported sovereign countries using recognizable real-world geography and approximate real placement.

The product target is global participation: all countries represented by the versioned world dataset can participate in the same World Instance economy even though only a sparse subset of localities is modeled in detail.

At this level the game may show:

- countries and borders appropriate to the versioned map dataset;
- major international freight corridors;
- international sea, air, rail and road flows;
- country-level demand, supply, population, infrastructure and trade summaries;
- major commodity and energy pressure;
- migration/tourism pressure;
- major events or disruptions;
- player/company influence at an appropriate aggregated scale.

Individual streets, buildings, citizens and local vehicles are not rendered at global scale.

Global traffic is summarized from real simulated flows. Decorative moving lines must not imply cargo or economic activity that does not exist in authoritative world state.

---

# 2. Country Layer

A country is represented sparsely rather than by every real settlement.

A normal country may expose up to nine representative locality nodes:

1. its real capital at its approximate real position;
2. up to one representative urban city in the North;
3. up to one representative urban city in the East;
4. up to one representative urban city in the South;
5. up to one representative urban city in the West;
6. up to one rural/small locality in the North-East;
7. up to one rural/small locality in the South-East;
8. up to one rural/small locality in the South-West;
9. up to one rural/small locality in the North-West.

These are coverage roles, not a requirement to force nine nodes into every country. Microstates, island states, elongated countries and unusual geographies may legitimately use fewer nodes. Never invent a settlement merely to complete the compass.

A city is a point at this scale. Streets and individual buildings appear only after entering its detailed local scene.

Representative node selection should consider real geography, regional coverage, economic specialization, logistics relevance, population/importance and gameplay variety.

Country layers may also contain strategically important external facilities, national gateways and corridors that are not locality nodes.

---

# 3. Administrative Region Layer

The world model must not hardcode the term `county` globally.

Use a country-neutral first-order administrative region that can specialize to the real local concept, such as:

- state;
- province;
- county;
- județ;
- region;
- governorate;
- canton;
- another appropriate first-order division.

Romania specializes this layer as județe.

This layer summarizes regional population, production, infrastructure, demand, workforce, trade and transport without requiring every real settlement to exist in the simulation.

---

# 4. Representative Localities

Locality roles are:

- Capital;
- Urban North / East / South / West;
- Rural or Small North-East / South-East / South-West / North-West.

Urban detailed areas target no more than roughly **5 meaningful active last-mile delivery competitors** unless later balancing proves a different local capacity is healthier.

Rural/small-locality detailed areas normally target **1-2 meaningful active last-mile delivery competitors**.

These are competition design targets, not magical counters detached from population, demand, economics or market-entry rules.

Each locality may have its own:

- architecture family;
- population and workforce;
- specialist availability;
- local marketplace;
- physical inventories and consumption demand;
- supply/price pressure;
- transport capacity;
- public and private infrastructure;
- industrial/commercial specialization;
- housing/service capacity;
- tourism and migration pressure;
- waste and utility flows;
- visible growth or decline.

---

# 5. External Economic Nodes

Important productive infrastructure may exist outside any locality and must be represented as independent map nodes.

Examples include:

- steelworks/metallurgical complexes;
- paper/pulp mills;
- chemical and fertilizer plants;
- refineries;
- mines and quarries;
- power plants;
- large farms, livestock and forestry operations;
- food-processing plants;
- construction-material and machinery plants;
- warehouses/distribution centers;
- industrial ports;
- rail freight terminals;
- airport cargo terminals;
- waste-treatment/recycling facilities;
- water and utility infrastructure.

These nodes do not consume representative-locality slots.

They consume real modeled inputs, workforce/specialist capability, time, energy/infrastructure and capacity; they create output inventories, jobs, contracts, logistics demand, waste/by-products and economic consequences.

Their business relationship with a player/company may evolve from occasional work to recurring contract, investment, concession, lease or eligible acquisition/privatization under the approved business/economy rules.

A site receives a high-detail scene only when gameplay value requires one; a remote steelworks or farm does not require an invented surrounding city.

---

# 6. Detailed Local Scene

The detailed scene is the high-fidelity playable layer containing streets, districts, individual buildings, citizens, employees, merchants, local traffic, parcels/cargo, company facilities, utilities and last-mile logistics.

Only the active detailed area carries local-frame rendering and actor simulation cost.

The current playable city becomes one locality destination inside the global hierarchy rather than the entire world.

Meaningful work should leave visible local consequences where practical: construction advances, inventories refill, facilities operate or stop, traffic changes, waste is collected, businesses open/close and districts grow or decline.

---

# 7. Geography Fidelity

DROPi Tycoon is inspired by real geography, not a GIS clone.

Requirements:

- country shapes and relative placement should be recognizable;
- capitals and representative settlements should use approximate real positions;
- coastlines, major rivers, mountain barriers and transport-relevant geography may affect routes where useful;
- geography may be simplified for Android readability/performance;
- geography datasets are versioned so existing World Instances remain reproducible;
- a later real-world-inspired baseline update must not silently rewrite the history of an existing World Instance.

Real geography seeds the world. Simulation owns its future.

---

# 8. Transport by Scale

## Global / International
- sea shipping;
- international air cargo;
- cross-border rail;
- cross-border road freight;
- major multimodal gateways.

## National
- highway freight;
- national rail;
- domestic air where useful;
- river/sea transport where geographically valid;
- national distribution hubs.

## Regional
- regional road/rail;
- feeder hubs;
- warehouses and terminals.

## Local
- walking;
- bicycle;
- scooter/motorcycle;
- car/van/company fleet;
- public transport where modeled;
- drone where unlocked;
- final-mile delivery.

Traffic is simulated at the frequency appropriate to its layer. The game must never update every global vehicle at local-scene frequency.

---

# 9. Travel and Presence

Opening or zooming the map does not move the hero or cargo.

Economic presence changes through legitimate transport and infrastructure:

- walking/local movement;
- road/public transport;
- rail;
- air;
- river/sea;
- other later unlocked transport.

Long journeys may use time compression, summarized travel or hub-to-hub presentation for playability, but they must still consume the relevant modeled time, cost, access and transport capacity.

Cargo follows the custody/leg model in `00_Project/LOGISTICS_DESIGN.md`; strategic-map selection cannot teleport inventory between markets.

---

# 10. Strategic Map Information

Map layers may expose summarized:

- product demand and supply;
- inventory and price pressure;
- productive capacity;
- agricultural output;
- energy/utility pressure;
- workforce/specialist availability;
- population trend and migration;
- infrastructure capacity;
- trade corridors;
- congestion;
- contracts/opportunities;
- active construction/community projects;
- waste/recycling pressure;
- current events/disruptions.

The map exists to create economic, social, travel and logistics decisions, not merely navigation.

A map overlay is a projection of authoritative state. It must not fabricate economic truth for visual effect.

---

# 11. Evolution and Player Contribution

Map entities persist and may change over world time.

Localities may grow or shrink; industries may open, expand, close or change ownership; infrastructure may be built; eligible undeveloped territory may later support new settlements; population and specialist distribution may shift; national and international trade routes may change.

Players and companies may contribute to these changes through work, supply, contracts, investment, construction, infrastructure operation and community-scale projects.

These changes belong to the same world economy and must become visible at the appropriate zoom level.

The playability principle is:

**Your work leaves a mark.**

The map should increasingly let players see where their personal, company and community activity changed the world.

---

# 12. World Instance Boundary

Every strategic map is viewed inside a specific World Instance.

Geography may begin from a shared versioned baseline, but prices, ownership, infrastructure, industrial state, population, trade flows, migration, events and territorial development belong to that World Instance's history.

Economic state must never be silently mixed between World Instances.

---

# 13. Performance Rule

Global scale is achieved through hierarchical state and simulation, not brute-force rendering.

The game must not simultaneously render or high-frequency simulate every city, citizen, building or vehicle on Earth. Inactive areas use summarized lower-frequency state and deterministic catch-up while preserving economic conservation and authoritative history.

---

# Canonical Rule

**DROPi Tycoon represents the whole planet through sparse layered geography. Every country can participate in one coherent World Instance economy; strategic maps project real simulated state, travel remains infrastructure-backed, and progressively deeper layers reveal how people, companies, industries and communities change the world over time.**

---

End of Document