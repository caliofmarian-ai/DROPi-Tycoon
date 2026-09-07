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

This document defines the technical/product boundary for hosting multiple persistent global DROPi Tycoon economies over time.

A player-facing `World Instance` is a logical simulation/economy universe. It is not required to equal one physical server, one process, one database or one geographic host.

---

# 1. World Instance

A World Instance owns an independent evolving state including:

- world seed/version;
- map dataset version;
- countries/regions/localities;
- productive nodes;
- population and specialists;
- economy and inventories;
- company/player participation;
- infrastructure;
- time/calendar;
- events;
- trade flows;
- historical changes.

Two World Instances may begin from the same baseline model and evolve into very different histories.

---

# 2. Baseline Seed

New worlds begin from a versioned baseline rather than copying the mature live state of an older world.

The baseline may contain:

- recognizable global geography;
- initial representative country nodes;
- initial economy/production profiles inspired by broad real-world patterns;
- starting transport infrastructure;
- initial demographic summaries;
- configured technology/progression stage.

A baseline is reproducible and versioned.

Updating a future baseline must not silently rewrite historical state in an existing world.

---

# 3. New-World Launches

Live operations may periodically open new World Instances.

Possible cadence includes:

- monthly;
- seasonal;
- multi-month;
- annual/long-cycle.

Exact cadence is not canonical yet and must be chosen from observed player population, progression speed, infrastructure cost and economy maturity.

Opening a new world does not delete, reset or automatically close previous worlds.

---

# 4. Legacy Worlds

Older worlds may remain playable as mature economies.

A legacy world may contain:

- old companies;
- mature infrastructure;
- transformed countries/cities;
- historical industrial ownership;
- established trade routes;
- past events;
- world-specific economic history.

Retention/archive policy must be explicit if long-term operating cost later requires changes. No silent deletion is permitted.

---

# 5. Player Choice and Identity

A future account may participate in one or more World Instances subject to progression/economy balance rules.

World-local economic assets must remain isolated unless an explicit cross-world transfer mechanic is separately designed and approved.

The default safety rule is:

**new-world economy cannot be bypassed by importing mature-world money, inventory, productive assets or infrastructure.**

Cross-world identity, achievements or cosmetic legacy may later be shared without corrupting economy balance.

---

# 6. Logical World vs Physical Infrastructure

At scale, one World Instance may be distributed across:

- multiple application services;
- region/country simulation workers;
- databases/partitions;
- queues/event streams;
- caches;
- map/content services;
- matchmaking/session services.

Conversely, early development may host several small World Instances on shared infrastructure.

Never hardcode `one world = one machine` or `one country = one server`.

---

# 7. Simulation Frequency Partitioning

A World Instance is divided by simulation responsibility.

Examples:

- local active scene: frame/high frequency;
- active route/hub: high/medium frequency;
- country economy: lower-frequency ticks;
- global trade: strategic ticks;
- demographics/urban growth: slow cycles;
- inactive areas: summarized/catch-up simulation.

This is required for Android client performance and scalable server operation.

---

# 8. Authority and Persistence

When shared multiplayer world state becomes live, server authority must own contested state including:

- money settlement;
- inventory/cargo custody;
- company ownership;
- productive asset ownership;
- contracts;
- infrastructure;
- world time;
- market settlement;
- events that affect multiple players.

Client rendering must never become authoritative for shared economic truth.

---

# 9. World History

World-changing events must produce durable history where feasible.

Examples:

- city founding;
- industrial opening/closure/acquisition;
- infrastructure completion;
- major migration;
- country-state transition;
- exceptional economic event;
- major trade-route change.

History supports player understanding, museums/archives, analytics and world identity.

---

# 10. Country-State Changes

A World Instance may eventually allow countries to merge, split, become inactive or re-emerge through advanced fictional simulation.

Technical rules must preserve stable historical identifiers even when displayed names/borders/status change.

Economic ownership, player identity and cargo history must not become orphaned because a geopolitical label changed.

---

# 11. New World Safety

A new World Instance must not require regenerating every art asset or rebuilding the game client.

World variety should primarily come from:

- data;
- economy seeds;
- geography datasets;
- company/player decisions;
- world events;
- procedural/configured composition using approved visual families.

New source art is generated only when a concrete missing runtime requirement exists under the approved asset policy.

---

# Canonical Rule

**DROPi Tycoon may operate many persistent global economies in parallel. New worlds start from versioned baseline state and evolve independently; old worlds remain separate historical economies. A logical world can span many physical services, and no architecture may hard-bind one country or one world to one physical server.**

---

End of Document