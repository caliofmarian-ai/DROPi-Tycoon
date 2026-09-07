# Document Information

Document: WORLD_INSTANCES.md
Project: DROPi Tycoon
Version: 1.0.0
Status: Canonical — Technical Specialization
Author: Marian Caliof & OpenAI
Language: English
Last Updated: 2026-09-08

---

# World Instances and Epoch Lifecycle

## Purpose

A **World Instance** is one logical persistent global DROPi Tycoon economy/history. It is not required to equal one physical server, one process, one database or one geographic host.

---

# 1. World-Owned State

A World Instance owns an independent evolving state including:

- world/map baseline versions;
- countries, regions and representative localities;
- external productive nodes;
- population, workforce and specialists;
- economy, inventories and contracts;
- companies/player participation;
- infrastructure and transport capacity;
- authoritative world time;
- events, migration and trade flows;
- durable historical changes.

Two worlds may start from the same baseline and develop into very different histories.

---

# 2. Versioned Baseline Seed

A new world starts from a versioned baseline rather than copying a mature live world.

The baseline may contain:

- recognizable geography;
- capitals/representative-node seed metadata;
- broad economy/production profiles inspired by real-world patterns;
- starting transport infrastructure;
- demographic summaries;
- configured starting technology/progression stage.

Updating a future baseline must not silently rewrite an older world's historical state.

---

# 3. New-World Launches

Live operations may periodically open new World Instances.

Possible cadence may eventually be monthly, seasonal, multi-month or annual depending on player population, progression speed and economy maturity. The cadence is not fixed by current canon.

Opening a new world does **not** reset, delete or automatically close previous worlds.

---

# 4. Legacy Worlds

Older worlds may remain playable as mature economies containing established companies, infrastructure, industrial ownership, transformed localities, historical events and developed trade networks.

Any future archival/retention policy must be explicit. No silent world deletion is permitted.

---

# 5. Economy Isolation

A future account may participate in more than one World Instance subject to game rules, but economic power is isolated by default.

The baseline rule is:

**money, inventory, productive assets, infrastructure and world-local ownership cannot be imported from a mature world to bypass a fresh-world economy.**

Identity, achievements or cosmetics may later be shared across worlds if they do not transfer economic power.

---

# 6. Logical World vs Physical Infrastructure

At scale, one logical World Instance may span:

- multiple application services;
- country/region simulation workers;
- database partitions;
- queues/event streams;
- caches;
- map/content services;
- session/matchmaking services.

Conversely, early development may host several small logical worlds on shared physical infrastructure.

Never hardcode `one world = one machine` or `one country = one server`.

---

# 7. Simulation Frequency Partitioning

A world partitions simulation by scope:

- active detailed scene — frame/high frequency;
- active route/hub — operational frequency;
- production/inventory/local markets — economic ticks;
- country/global trade — strategic ticks;
- demographics/urban growth/state evolution — slow cycles;
- inactive areas — summarized deterministic catch-up.

This protects Android clients and future server scalability.

---

# 8. Multiplayer Authority

When shared multiplayer world state becomes live, server authority must own contested truth including money settlement, cargo custody, company/productive-asset ownership, contracts, infrastructure, world time and shared market/event settlement.

Client rendering must never become authoritative for shared economic truth.

---

# 9. Durable World History

Major changes should produce durable world history where feasible:

- settlement founding;
- industrial opening/closure/acquisition;
- major infrastructure completion;
- exceptional migration;
- country/state transition;
- major trade-route change;
- exceptional economic event.

Historical identifiers remain stable even if displayed country/locality names, borders or statuses later change.

---

# 10. World Variety and Assets

New worlds must not require rebuilding the client or generating new art wholesale.

Variety should primarily come from:

- versioned data;
- economy seeds;
- geography;
- player/company decisions;
- world events;
- modular composition using approved visual families.

New source art is created only when a concrete runtime requirement proves the approved library insufficient.

---

# Canonical Rule

**DROPi Tycoon may operate many persistent global economies in parallel. New worlds start from versioned baseline state and evolve independently; old worlds remain separate historical economies, and a logical world can span many physical services.**

---

End of Document