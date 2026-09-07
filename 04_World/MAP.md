# Document Information

Document: MAP.md
Project: DROPi Tycoon
Version: 2.0.0
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

---

# 1. Global Layer

The maximum zoom-out level represents the whole planet and all supported sovereign countries using recognizable real-world geography and approximate real placement.

At this level the game may show:

- countries and borders appropriate to the versioned map dataset;
- major international freight corridors;
- international sea, air, rail and road flows;
- country-level demand, supply, population, infrastructure and trade summaries;
- major events or disruptions.

Individual streets, buildings, citizens and local vehicles are not rendered at global scale.

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

This layer summarizes regional population, production, infrastructure, demand and transport without requiring every real settlement to exist in the simulation.

---

# 4. Representative Localities

Locality roles are:

- Capital;
- Urban North / East / South / West;
- Rural or Small North-East / South-East / South-West / North-West.

Urban detailed areas may host at most **5 active delivery competitors**.

Rural/small-locality detailed areas normally host at most **2 active delivery competitors**.

Each locality may have its own:

- architecture family;
- population and workforce;
- specialist availability;
- local marketplace;
- demand/supply profile;
- transport capacity;
- public and private infrastructure;
- industrial/commercial specialization;
- tourism and migration pressure.

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
- airport cargo terminals.

These nodes do not consume representative-locality slots.

A site receives a high-detail scene only when gameplay value requires one; a remote steelworks or farm does not require an invented surrounding city.

---

# 6. Detailed Local Scene

The detailed scene is the high-fidelity playable layer containing streets, districts, individual buildings, citizens, employees, merchants, local traffic, parcels, company facilities and last-mile logistics.

Only the active detailed area carries local-frame rendering and actor simulation cost.

The current playable city becomes one locality destination inside the global hierarchy rather than the entire world.

---

# 7. Geography Fidelity

DROPi Tycoon is inspired by real geography, not a GIS clone.

Requirements:

- country shapes and relative placement should be recognizable;
- capitals and representative settlements should use approximate real positions;
- coastlines, major rivers, mountain barriers and transport-relevant geography may affect routes where useful;
- geography may be simplified for Android readability/performance;
- geography datasets are versioned so existing World Instances remain reproducible.

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
- drone where unlocked;
- final-mile delivery.

Traffic is simulated at the frequency appropriate to its layer. The game must never update every global vehicle at local-scene frequency.

---

# 9. Strategic Map Information

Map layers may expose summarized:

- product demand and supply;
- inventory and price pressure;
- productive capacity;
- agricultural output;
- workforce/specialist availability;
- population trend;
- infrastructure capacity;
- trade corridors;
- congestion;
- contracts/opportunities;
- current events/disruptions.

The map exists to create economic and logistics decisions, not merely navigation.

---

# 10. Evolution

Map entities persist and may change over world time.

Localities may grow or shrink; industries may open, expand, close or change ownership; infrastructure may be built; eligible undeveloped territory may later support new settlements; population and specialist distribution may shift; national and international trade routes may change.

These changes belong to the same world economy and must become visible at the appropriate zoom level.

---

# 11. Performance Rule

Global scale is achieved through hierarchical state and simulation, not brute-force rendering.

The game must not simultaneously render or high-frequency simulate every city, citizen, building or vehicle on Earth. Inactive areas use summarized lower-frequency state until the player enters or materially affects them.

---

# Canonical Rule

**DROPi Tycoon represents the whole planet through sparse layered geography. Every country can participate in one coherent global economy, while strategically selected localities and external productive nodes receive progressively deeper simulation as the player zooms in.**

---

End of Document