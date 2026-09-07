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

This document defines the canonical player-facing geography and zoom hierarchy of DROPi Tycoon.

The map is not one giant continuously rendered world. It is a layered economic/logistics representation that moves from the planet to a country, administrative region, representative locality and finally a detailed local scene.

The canonical hierarchy is:

**Global -> Country -> First-order Administrative Region -> Representative Locality / External Economic Node -> Detailed Local Scene.**

The player smartphone GPS, strategic world map and logistics planning surfaces must use this same hierarchy rather than separate incompatible map systems.

---

# 1. Global Layer

The Global layer represents the whole planet and all supported sovereign countries using recognizable real-world geography and approximate real placement.

At this scale:

- countries are map entities;
- major international freight corridors may be shown;
- international air, sea, rail and road flows may be summarized;
- country economy, population, demand, infrastructure and trade indicators may be shown at low simulation frequency;
- individual streets, buildings and local vehicles are not rendered.

The Global layer is the maximum zoom-out level.

---

# 2. Country Layer

A country is a sparse strategic world rather than a complete copy of every real settlement.

Each normal-sized country targets up to nine representative locality nodes:

- the real capital at its approximate real position;
- up to one representative urban city in each cardinal sector: North, East, South and West;
- up to one smaller/rural locality in each diagonal sector: North-East, South-East, South-West and North-West.

A locality is selected for gameplay meaning, geography, economy and logistics relevance. A settlement must never be invented merely to fill a directional slot.

Microstates, island states and geographically unusual countries may have fewer nodes.

A city is therefore only a point on the Country layer. Streets and buildings become visible only after entering that locality's detailed scene.

---

# 3. Administrative Region Layer

The map must not hardcode the word `county` globally.

Countries use a country-neutral first-order administrative concept that may specialize to:

- state;
- province;
- county;
- județ;
- region;
- governorate;
- canton;
- another real first-order division appropriate to the country.

Romania specializes this layer as județe.

Administrative regions organize regional demand, infrastructure, population, production and transport without requiring every real settlement to be simulated.

---

# 4. Representative Locality Layer

Representative locality roles are explicit:

- Capital;
- Urban North;
- Urban East;
- Urban South;
- Urban West;
- Rural/Small North-East;
- Rural/Small South-East;
- Rural/Small South-West;
- Rural/Small North-West.

Urban detailed areas may host up to five active delivery competitors.

Rural/small-locality detailed areas normally host one or two active delivery competitors.

Each locality has its own population, workforce, architecture family, demand profile, local marketplace, logistics capacity, infrastructure and economic specialization.

---

# 5. External Economic Nodes

Important productive infrastructure may exist outside any locality boundary and must be represented as independent map nodes.

Examples include:

- steelworks / metallurgical complexes;
- paper and pulp mills;
- chemical plants;
- fertilizer plants;
- refineries;
- mines and quarries;
- power generation sites;
- large farms and agricultural estates;
- forestry operations;
- food-processing plants;
- industrial ports and terminals;
- rail freight yards;
- distribution centers;
- large warehouses;
- research or specialist industrial facilities when canonically activated.

These nodes may generate occasional logistics jobs early, long-term business contracts later, and mature acquisition/ownership opportunities in advanced company progression.

An external economic node is not forced inside a city merely for UI convenience.

---

# 6. Detailed Local Scene

The Detailed Local Scene is the high-fidelity playable environment.

It may contain:

- streets and roads;
- districts;
- individual buildings;
- customers;
- employees and citizens;
- merchants;
- company facilities;
- local factories/warehouses where geographically valid;
- parks and nature;
- local traffic;
- delivery routes;
- parcel custody;
- physical HQ and infrastructure.

Only the active detailed area carries high-frequency rendering and actor simulation.

---

# 7. Geography Fidelity

The game is inspired by real geography, not a GIS clone.

Canonical requirements:

- country shapes and relative placement must be recognizable;
- capitals and representative nodes should be located approximately where they exist in reality;
- coastlines, major rivers, mountain barriers and transport-relevant geography may influence routes where useful;
- geography may be simplified for mobile readability and gameplay;
- real-world geographic inspiration must not imply live official data or exact legal/political boundaries at runtime.

Versioned map datasets must be used so world instances remain reproducible.

---

# 8. Transport by Scale

## Global / International

- maritime shipping;
- international air cargo;
- cross-border rail;
- cross-border road freight;
- major transfer hubs.

## National

- highways;
- national rail;
- domestic air where useful;
- river/sea transport where geographically valid;
- national distribution hubs.

## Regional

- regional roads;
- rail;
- regional warehouses and terminals;
- feeder logistics.

## Local

- walking;
- bicycle;
- scooter;
- motorcycle;
- car/van;
- local fleet;
- drones where unlocked;
- last-mile delivery.

Transport traffic is simulated at the frequency appropriate to its map layer. The game must never update every global vehicle at local-scene frequency.

---

# 9. Economic Information on the Map

Map layers may expose summarized information such as:

- product demand;
- product supply;
- price pressure;
- inventories;
- industrial capacity;
- agricultural output;
- workforce/specialist availability;
- population trend;
- infrastructure capacity;
- trade corridors;
- logistics congestion;
- current events and disruptions.

The map exists to support decisions, not merely navigation.

---

# 10. Growth and Change

Map entities are persistent world state and may evolve.

Over time:

- localities may grow or shrink;
- new districts/buildings may appear;
- industries may open, expand, fail or change ownership;
- external production nodes may emerge or close;
- new transport infrastructure may be built;
- eligible undeveloped territory may support new towns/cities in advanced world simulation;
- population and specialist distribution may change.

These changes are governed by `04_World/WORLD_EVOLUTION.md`.

---

# 11. Performance Rule

The global map is a hierarchy of low-frequency strategic state plus one bounded active detailed area.

The game must not:

- render all cities simultaneously;
- simulate all citizens simultaneously;
- instantiate all global vehicles simultaneously;
- load all detailed locality assets into memory at once.

World scale is achieved through hierarchical simulation, not brute-force rendering.

---

# Canonical Rule

**DROPi Tycoon represents the whole planet through a layered sparse geography: every country can participate in the global economy, while only strategically selected localities and external economic nodes receive detailed simulation. Zoom changes both visual detail and simulation responsibility without breaking one coherent world.**

---

End of Document